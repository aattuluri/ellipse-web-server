var logger = require("../logger").logger;
var async = require ("async");
var request = require("request");

var GOOGLE_PLACES_ENDPOINT = "https://maps.googleapis.com/maps/api/place/details/json?placeid=";
var GOOGLE_PHOTOS_ENDPOINT = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=";
var API_KEY = "AIzaSyDN3VQcqk4Ipfkm6L7UqOKXI0vjWQQGfGY";

function getPlaceDetail(req, reply) {
    var params = req.url.query;
    var url = GOOGLE_PLACES_ENDPOINT + params.placeid + '&key=' + API_KEY;
//    console.log(url);
    request(url, function(error, response, body) {
      var result = JSON.parse(body).result;
      var photos = result.photos;
      if ( photos ) {
        var ref = photos[0].photo_reference;
        var url = GOOGLE_PHOTOS_ENDPOINT + ref + "&sensor=false&key=" + API_KEY;
//        console.log(url);
        var result = { "image": url };
        return reply(JSON.stringify(result)).header("Content-Type", "application/json");
      }
    })
  };


module.exports = {
  getPlaceDetail: getPlaceDetail
}
