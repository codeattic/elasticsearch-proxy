const httpProxy = require("http-proxy");
const util = require("./util");

module.exports = {
	createProxy
};

const basicAuthRe = /^basic\s+(\S*)$/i;

/**
 * Creates a proxy server to log/audit some particular requests.
 *
 * @param {object} config Proxy configuration.
 * @param {string} config.target Target elasticsearch server.
 * @param {string[]} config.excludeUsers Array of users to exclude from the auditing.
 * @param {object[]} [config.rules] Configuration rules.
 * @param {RegExp} config.rules.include Regular expression that matches the path of the requests to audit.
 * @param {Function} [config.rules.requestTransform] Function to transform the request body.
 * @param {Function} [config.rules.responseTransform] Function to transform the response body.
 *
 * @returns {*|Object}
 */
function createProxy(config) {
	const proxy = httpProxy.createProxyServer({
		target: config.target
	});

	// processes incoming requests
	proxy.on("proxyReq", function (proxyReq, req, res, options) {
		const user = getUser(req);
		if (config.excludeUsers.indexOf(user) !== -1) return; // ignore internal kibana requests

		// checks if any rule matches the current request
		for (let i = 0; i < config.rules.length; i++) {
			const rule = config.rules[i];
			if (rule.include.test(req.url) && (!rule.exclude || !rule.exclude.test(req.url))) {

				// object to store all the audit information for this event
				const audit = {
					date: new Date().toISOString(),
					user: user,
					method: req.method,
					path: req.url
				};

				req.audit = audit;
				req.rule = rule;

				proxyReq.removeHeader("accept-encoding"); // to prevent compressed responses that this proxy cannot process

				if (rule.requestTransform) {
					util.readData(req, function (err, data) {
						audit.request = rule.requestTransform(data);
					});
				}

				break;
			}
		}
	});

	// processes outgoing responses
	proxy.on("proxyRes", function (proxyRes, req, res) {
		if (req.audit) {
			const audit = req.audit;
			const rule = req.rule;

			audit.status = res.statusCode;

			if (rule.responseTransform) {
				util.readData(proxyRes, function (err, data) {
					audit.response = rule.responseTransform(data);
					config.logger(audit);
				})
			} else {
				config.logger(audit);
			}
		}
	});

	return proxy;
}

/**
 * Returns the user name from the authorization header or null if not present.
 */
function getUser(req) {
	const auth = req.headers["authorization"];
	if (auth != null) {
		const match = basicAuthRe.exec(auth);
		if (match != null) {
			const userPassword = util.decodeBase64(match[1]);
			return userPassword.substr(0, userPassword.indexOf(":"));
		}
	}
	return null;
}
