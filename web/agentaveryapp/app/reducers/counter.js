var constants = require('../config/constants');

var initialState = 0;


module.exports = function(state, action) {
	if ( !state )
		state = initialState;

	switch (action.type) {
		case constants.ADD:
			return state + 1
			break;

		default:
			return state;
	}
};
