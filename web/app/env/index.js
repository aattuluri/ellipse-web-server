var env = process.env.ENVIRONMENT;
if (!env) {
	env = "DEV";
}
exports.ENVIRONMENT = env;
