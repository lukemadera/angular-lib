/**
Handles google places interaction

@toc
1. textSearch

@usage

@example
*/

'use strict';

angular.module('lib.services').
factory('libGooglePlaces', [function() {
var inst ={

	/**
	@toc 1.
	@param text =string of text to search for
	@param map =google maps map object
	@param params
	@return (via callback) array {}
		valid =boolean
		msg =string
		place =array {}
			name =string of text suggestion
			geometry
				location =lat & lng of place
				viewport
	*/
	textSearch: function(text, map, params, callback) {
		var retArray ={'valid':0, 'msg':'', 'place':false};
		var service = new google.maps.places.PlacesService(map);
		var request ={
			query: text
		};
		service.textSearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var place;
				for (var i = 0; i < results.length; i++) {
					place = results[i];
					break;		//only return the first one
					//createMarker(results[i]);
				}
				retArray.place =place;
			}
			callback(retArray);
		});
	}
};
return inst;
}]);