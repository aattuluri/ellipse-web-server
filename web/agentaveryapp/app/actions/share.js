const constants = require('../config/constants');
const CALL_API = require("redux-api-middleware").CALL_API;


module.exports = {

  // temporary test example
  // http://localhost:3001/trip/E1ZWhQQ8PW
	getTrip: function(tripid) {
    return {
      [CALL_API]: {
				endpoint: "/trip/" + tripid, 
        headers: {
//          'Authorization': 'Bearer ' + "something",
          'Content-Type': 'application/json',
        },
        method: "GET",
        types: [
          constants.GET_TRIP_REQUEST,
          constants.GET_TRIP_SUCCESS,
          constants.GET_TRIP_FAILURE
        ]
      }
    }
  },

	getAgent: function(tripid) {
    return {
      [CALL_API]: {
				// endpoint: "http://localhost:3001/trip/" + tripid, // N1-BMy2uP-",
				endpoint: "/trip/" + tripid + "/agent", // N1-BMy2uP-",
        headers: {
//          'Authorization': 'Bearer ' + "something",
          'Content-Type': 'application/json',
        },
        method: "GET",
        types: [
          constants.GET_AGENT_REQUEST,
          constants.GET_AGENT_SUCCESS,
          constants.GET_AGENT_FAILURE
        ]
      }
    }
  },

	// https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJuRMYfoNhsUcRoDrWe_I9JgQ&key=AIzaSyDN3VQcqk4Ipfkm6L7UqOKXI0vjWQQGfGY
	getPlaceDetail: function(placeid) {
		var endpoint = "http://localhost:3001/google/places?placeid=" + placeid;
		return {
			[CALL_API]: {
				endpoint: endpoint,
				headers: {
//          'Authorization': 'Bearer ' + "something",
					'Content-Type': 'application/json',
				},
				method: "GET",

				types: [
					constants.GET_PLACEDETAIL_REQUEST,
					constants.GET_PLACEDETAIL_SUCCESS,
					constants.GET_PLACEDETAIL_FAILURE
				]
			}
		}
	},

	updateDestination: function(destination) {
		return {
			type: constants.UPDATE_DESTINATION,
			destination: destination,
			event
		}
	},

	updateDate: function(start, end) {
		return {
			type: constants.UPDATE_DATE,
			start: start,
			end: end,
			event
		}
	},

	updateForm: function(event) {
		return {
			type: constants.UPDATE_FORM,
			event
		}
	},


}
