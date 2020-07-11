var constants = require('../config/constants');

module.exports = {

	incrementCounter: function() {
		return {
			type: constants.ADD
		}
	}
}
