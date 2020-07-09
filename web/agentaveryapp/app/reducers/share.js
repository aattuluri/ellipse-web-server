var constants = require('../config/constants');

var initialState = {
	start: "Select your trip date",
	end: "",
	destination: "Search Places",
	picture: "",
	agentId: "",
	data: {
		comment: "",
	}
};


module.exports = function(state, action) {
	if ( !state )
		state = initialState;

	console.log("-share reducer-");
	console.dir(state);
	console.dir(action);
	switch (action.type) {
		case constants.GET_TRIP_REQUEST:
		case constants.GET_AGENT_REQUEST:
			console.log("-> get request");
			return state
		break;

    case constants.GET_TRIP_SUCCESS:
  		console.log("-> get trip success");
      console.log(action.payload);
  		return {
				...state,
				trip: action.payload
			}
  	break;

		case constants.GET_AGENT_SUCCESS:
  		console.log("-> get trip success");
      console.log(action.payload);
  		return {
				...state,
				agentId: action.payload.agentId
			}
  	break;

    case constants.GET_TRIP_FAILURE:
    		console.log("-> get trip failure");
    		return state
    		break;

		case constants.GET_PLACEDETAIL_REQUEST:
			console.log("-> get place request");
			return state
			break;

	  case constants.GET_PLACEDETAIL_SUCCESS:
			console.log("-> get place success");
	    // console.log(action.payload);
			return {
				...state,
				picture: action.payload.image
			}
			break;

	  case constants.GET_PLACEDETAIL_FAILURE:
	  		console.log("-> get place failure");
	  		return state
	  break;

		case constants.UPDATE_DATE:
			var newState = Object.assign({}, state, {
				...state,
				start: action.start,
				end: action.end
			})
			return newState;
		break;

		case constants.UPDATE_DESTINATION:
			var newState = Object.assign({}, state, {
				...state,
				destination: action.destination,
			})
			return newState;
		break;

		case constants.UPDATE_FORM:
			console.log("--> update: " + action.event.target.name);
			console.log(action.event);
			var target = action.event.target;

			var newState = Object.assign({}, state, {
				...state,
			})
			newState.data[target.name] = target.value;
			return newState;
			break;


		default:
			console.log("-> share default");
			return state;
	}
};
