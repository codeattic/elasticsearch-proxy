module.exports = {

	/**
	 * Proxy port.
	 */
	port: parseInt(process.env["PROXY_PORT"] || process.env["PORT"] || "9100"),

	/**
	 * Elasticsearch URL.
	 */
	elasticsearch: {
		url: process.env["PROXY_ELASTICSEARCH_URL"] || "http://localhost:9200"
	},

	/**
	 * Users to exclude from auditing.
	 */
	excludeUsers: (process.env["PROXY_EXCLUDE_USERS"] || "kibana").split(",").map(s => s.trim()),

	/**
	 * Logger name.
	 */
	logger: process.env["PROXY_LOGGER"] || "console",

	/**
	 * Default rules.
	 */
	rules: [
		{
			include: "^\/_msearch$",
			request: "jsonBulk",
			response: "jsonDocIds"
		},
		{
			include: "^\/_mget$",
			request: "jsonDocIds",
			response: "jsonDocIds"
		},
		{
			include: "\/_search",
			exclude: "^\/.reporting",
			request: "json",
			response: "jsonDocIds"
		}
	]
};
