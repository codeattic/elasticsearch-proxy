#!/usr/bin/env node

const loggers = require("./loggers");
const proxy = require("./proxy");
const transforms = require("./transforms");
const util = require("./util");

// reads configuration from file
const config = Object.assign({}, require("./config.json"), util.loadYaml("config/elasticsearch-proxy.yaml"));

// reads configuration from environment variables
if (process.env["PROXY_PORT"]) config.port = parseInt(process.env["PROXY_PORT"]);
if (process.env["PROXY_ELASTICSEARCH_URL"]) config.elasticsearchUrl = process.env["PROXY_ELASTICSEARCH_URL"];
if (process.env["PROXY_EXCLUDE_USERS"]) config.excludeUsers = process.env["PROXY_EXCLUDE_USERS"].split(",").map(s => s.trim());
if (process.env["PROXY_LOGGER"]) config.logger = process.env["PROXY_LOGGER"];

// parses configuration
const logger = util.resolve(loggers, config.logger, "logger");
const rules = config.rules.map(rule => ({
	include: rule.include ? new RegExp(rule.include) : undefined,
	exclude: rule.exclude ? new RegExp(rule.exclude) : undefined,
	requestTransform: rule.request ? util.resolve(transforms, rule.request, "transform") : undefined,
	responseTransform: rule.response ? util.resolve(transforms, rule.response, "transform") : undefined
}));

// creates proxy instance
proxy.createProxy({
	target: config.elasticsearchUrl,
	excludeUsers: config.excludeUsers,
	logger: logger,
	rules: rules
}).listen(config.port, function (err) {
	if (!err) {
		logger({
			date: util.now(),
			message: "Elasticsearch proxy started",
			config: config
		});
	}
});

process.on("uncaughtException", function (err) {
	logger({
		date: util.now(),
		error: true,
		message: err.toString()
	});
});

process.on("SIGINT", function () {
	logger({
		date: util.now(),
		message: "Elasticsearch proxy SIGINT signal received."
	});
	process.exit()
});

process.on("SIGTERM", function () {
	logger({
		date: util.now(),
		message: "Elasticsearch proxy SIGTERM signal received."
	});
	process.exit();
});

process.on("exit", function () {
	logger({
		date: util.now(),
		message: "Elasticsearch proxy stopped."
	});
});
