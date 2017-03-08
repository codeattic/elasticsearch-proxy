const fs = require("fs");
const yaml = require("js-yaml");

module.exports = {
	decodeBase64,
	loadYaml,
	now,
	readData,
	resolve
};

/**
 * Decodes a base64 string.
 */
function decodeBase64(base64) {
	return Buffer.from(base64, "base64").toString();
}

/**
 * Loads a YAML configuration file.
 */
function loadYaml(filepath) {
	return fs.existsSync(filepath) ? yaml.safeLoad(fs.readFileSync(filepath, "utf8")) : {};
}

/**
 * Return current timestamp in ISO-8601 format.
 */
function now() {
	return new Date().toISOString();
}

/**
 * Reads all the data from the given stream.
 */
function readData(stream, done) {
	const chunks = [];
	stream.on("data", function (chunk) {
		chunks.push(chunk)
	});
	stream.on("end", function () {
		done(null, Buffer.concat(chunks).toString());
	});
}

function resolve(map, name, label) {
	const value = map[name];
	if (value == null) throw new Error(`${name} is not a valid ${label || 'value'}`);
	return value;
}
