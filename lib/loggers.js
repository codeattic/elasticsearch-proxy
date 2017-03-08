module.exports = {

	/**
	 * No operation logger.
	 */
	nop(event) {
	},

	/**
	 * Logs events to the console formatted as JSON.
	 */
	console(event) {
		console.log(JSON.stringify(event));
	},

	/**
	 * Logs events to the console formatted as JSON in pretty format.
	 */
	consolePretty(event) {
		console.log(JSON.stringify(event, null, "\t"));
	},
};
