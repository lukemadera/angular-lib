/**
Handles google maps interaction

@toc
1. geo
2. directions
3. distance
4. map
6. addMarker
5. updateCenter
5.5. updateCenterActual

@usage

@example
*/

'use strict';

angular.module('lib.services').
factory('libGoogleMaps', ['libGooglePlaces', function(libGooglePlaces) {
var inst ={

	data: {},		//one set of data per instance id
	
	/**
	@toc 1.
	@return (via callback)
		@param {Boolean} valid
		@param {String} msg
		@param {Array} results All results, each is an object of:
			@param {Array} address_components
			@param {String} formatted_address
			@param {Object} geometry
				@param {Object} location LatLng object
				@param {Object} location_type GeocoderLocationType
				@param {Object} viewport LatLngBounds
				@param {Object} bounds LatLngBounds
			@param {Array} types
	*/
	geo: function(address, params, callback) {
		var retArray ={'valid':1, 'msg':'', 'results':''};
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				retArray.results =results;
			} else {
				retArray.valid =0;
				retArray.msg ="Geocode was not successful for the following reason: " + status;
				//alert(retArray.msg);
			}
			callback(retArray);
    });
	},
	
	/**
	@toc 2.
	@param start =start address OR latLng string (i.e. "(37.7749295, -122.41941550000001)" )
	@param end =end address OR latLng string (i.e. "(37.7749295, -122.41941550000001)" )
	@param params
		travelMode =string of 'drive' (default), 'transit', 'walk', 'bike'
		transitOptions (only used for 'transit' travelMode)
			departureTime =javascript date object
	@return (via callback)
		valid =boolean
		msg =string
		result =array that matches google directions result object: https://developers.google.com/maps/documentation/javascript/directions#DirectionsResults
	*/
	directions: function(start, end, params, callback) {
		var retArray ={'valid':1, 'msg':'', 'result':''};
		var defaults ={'travelMode':'drive'};
		//params =libArray.extend(defaults, params, {});		//doesn't extend javascript date object properly..
		if(params.travelMode ===undefined) {
			params.travelMode =defaults.travelMode;
		}
		var travelModeMap ={
			'drive':google.maps.TravelMode.DRIVING,
			'transit':google.maps.TravelMode.TRANSIT,
			'walk':google.maps.TravelMode.WALKING,
			'bike':google.maps.TravelMode.BICYCLING
		};
		var directionsService = new google.maps.DirectionsService();
		var request ={
			origin:start,
			destination:end,
			travelMode: travelModeMap[params.travelMode]
		};
		if(request.travelMode ==google.maps.TravelMode.TRANSIT) {
			request.provideRouteAlternatives =true;
			if(params.transitOptions !==undefined) {
				request.transitOptions =params.transitOptions;
			}
		}
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				retArray.result =result;
			} else {
				retArray.valid =0;
				retArray.msg ="Error: Google Maps Directions Service: "+status;
				//alert(retArray.msg);
			}
			callback(retArray);
		});
	},
	
	/**
	@toc 3.
	@param start =start address OR latLng string (i.e. "(37.7749295, -122.41941550000001)" )
	@param end =end address OR latLng string (i.e. "(37.7749295, -122.41941550000001)" )
	@param params
		@param unitSystem {String} one of: 'metric', 'imperial'
	@return (via callback)
		valid =boolean
		msg =string
		result =false if invalid, otherwise: array {}
			distance
				value =int of meters, i.e. 1942009
				text =string, i.e. 1207 mi
			duration
				value =int of seconds, i.e. 96000
				text =string, i.e.: 1 day 3 hours
	*/
	distance: function(start, end, params, callback) {
		var retArray ={'valid':1, 'msg':'', 'result':false};
		var distService = new google.maps.DistanceMatrixService();
		var request ={
			origins:[start],
			destinations:[end],
			travelMode: google.maps.TravelMode.DRIVING
			//unitSystem: google.maps.UnitSystem.IMPERIAL
		};
		if(params.unitSystem !==undefined) {
			if(params.unitSystem =='imperial') {
				request.unitSystem =google.maps.UnitSystem.IMPERIAL;
			}
		}
		distService.getDistanceMatrix(request, function(response, status) {
			if (status == google.maps.DistanceMatrixStatus.OK) {
				retArray.result ={};
				retArray.result.distance =response.rows[0].elements[0].distance;
				retArray.result.duration =response.rows[0].elements[0].duration;
			}
			else {
				retArray.valid =0;
			}
			callback(retArray);
		});
	},
	
	/**
	@toc 4.
	@param params
		lat =int (i.e. 37.774650)
		lng =int (i.e. -122.419478)
		zoom =ing (i.e. 12)
		mapType =string, one of: 'roadmap', 'satellite', 'hybrid', 'terrain'
		address =string of address (lat & lng will be looked up & formed via Google Maps geo API)
		clickAddMarkerOpts =array {} of options for displaying a marker when click
			animation =string of 'drop'
			draggable =boolean
			icon =string of image url
	@return (via callback) {Object}
		@param {Number} valid 0 or 1
		@param {String} msg
		@param {Object} map Google maps object (if valid)
	*/
	map: function(gmId, params, callback) {
		var thisObj =this;
		this.data[gmId] ={};		//init data for this instance
		var retArray ={'map':false, 'valid':0, 'msg':''};
		
		if(params.address) {
			this.geo(params.address, {}, function(retArray1) {
				if(retArray1.valid && retArray1.results) {
					params.lat =retArray1.results[0].geometry.location.lat();
					params.lng =retArray1.results[0].geometry.location.lng();
					thisObj.map1(gmId, params, callback);
				}
				else {
					callback(retArray1);
				}
			});
		}
		else {
			thisObj.map1(gmId, params, callback);
		}
	},
	
	/**
	@toc 4.1.
	@param params
		lat =int (i.e. 37.774650)
		lng =int (i.e. -122.419478)
		zoom =ing (i.e. 12)
		mapType =string, one of: 'roadmap', 'satellite', 'hybrid', 'terrain'
		clickAddMarkerOpts =array {} of options for displaying a marker when click
			animation =string of 'drop'
			draggable =boolean
			icon =string of image url
	*/
	map1: function(gmId, params, callback) {
		var thisObj =this;
		var retArray ={'map':false, 'valid':0, 'msg':''};
		
		var ids ={'map':gmId+"Map"};
		$("#"+gmId).html("<div id='"+ids.map+"' style='width:100%; height:100%;'></div>");
		var defaults ={'lat':37.774650, 'lng':-122.419478, 'zoom':12, 'mapType':'roadmap'};
		// params =libArray.extend(defaults, params, {});
		params =angular.extend(defaults, params);
		
		var mapTypesMap ={'roadmap':google.maps.MapTypeId.ROADMAP, 'satellite':google.maps.MapTypeId.SATELLITE, 'hybrid':google.maps.MapTypeId.HYBRID, 'terrain':google.maps.MapTypeId.TERRAIN};
		var mapOptions = {
			center: new google.maps.LatLng(params.lat, params.lng),
			zoom: parseInt(params.zoom, 10),
			mapTypeId: mapTypesMap[params.mapType]
		};
		var map =retArray.map =new google.maps.Map(document.getElementById(ids.map), mapOptions);
		if(params.clickAddMarkerOpts !==undefined) {
			//thisObj.data[gmId]['clickAddMarkerOpts'] =params.clickAddMarkerOpts;		//save for when marker is actually added
			google.maps.event.addListener(map, 'click', function(evt) {
			//map.click(function(evt) {
				params.evt =evt;
				params.clearEventListener =true;		//hardcoded @todo pass in via params
				params.opts =params.clickAddMarkerOpts;
				thisObj.addMarker(gmId, map, params);
			});
		}
		this.data[gmId].map =retArray.map;
		callback(retArray);
	},
	
	/**
	@toc 6.
	@param params
		@param {String|Number} lat
		@param {String|Number} lng
		latLng =google maps latLng for where to add the marker
		evt =(mouse) event (i.e. if came from google maps click handler or something)
			latLng
		clearEventListener =boolean true to remove click listener
		opts =options for marker
			animation =string of 'drop'
			draggable =boolean
			icon =string of image url
			//marker label options: http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerwithlabel/1.1.9/docs/examples.html. NOTE: this requires the marker label javascript to be included or it won't work!
			labelContent
			labelAnchor
			labelClass
			labelStyle
	@return marker =google maps marker object handle
	*/
	addMarker: function(gmId, map, params) {
		var opts ={};
		if(params.opts) {
			opts =params.opts;
		}
		opts.map =map;
		if(opts.icon ===undefined) {
			opts.icon ='https://maps.gstatic.com/mapfiles/markers2/icon_greenA.png';
		}
		if(params.latLng ===undefined && params.lat !==undefined && params.lng !==undefined) {
			params.latLng =new google.maps.LatLng(params.lat, params.lng);
		}
		if(params.latLng !==undefined) {
			opts.position =params.latLng;
		}
		else if(params.evt !==undefined) {
			opts.position =params.evt.latLng;
		}
		if(opts.animation) {		//convert from string to google maps animation
			var animationMap ={'drag':google.maps.Animation.DROP};
			if(animationMap[opts.animation]) {
				opts.animation =animationMap[opts.animation];
			}
		}
		
		var marker;
		if(params.opts.labelContent !==undefined) {
			marker =new MarkerWithLabel(opts);
		}
		else {
			marker =new google.maps.Marker(opts);
		}
		
		if(params.clearEventListener) {
			//only allow 1 marker (so clear click listener)
			google.maps.event.clearListeners(map, 'click');
		}
		return marker;
	},
	
	/**
	@toc 5.
	@param {String} gmId (instance) id for map to update (whatever was passed in to map function above for creating it)
	@param params
		lat
		lng
		latLng =already set google latLng
		placeString =string of text to lookup lat and lng for
	*/
	updateCenter: function(gmId, params) {
		var thisObj =this;
		var map =this.data[gmId].map;
		if(params.placeString) {
			libGooglePlaces.textSearch(params.placeString, map, {}, function(retArray1) {
				thisObj.updateCenterActual(gmId, retArray1.place.geometry.location, {});
			});
		}
		else {
			var latLng;
			if(params.lat && params.lng) {
				latLng =new google.maps.LatLng(params.lat, params.lng);
			}
			else {
				latLng =params.latLng;
			}
			thisObj.updateCenterActual(gmId, latLng, {});
		}
	},
	
	/**
	@toc 5.5.
	@method updateCenterActual
	*/
	updateCenterActual: function(gmId, latLng, params) {
		var map =this.data[gmId].map;
		map.setCenter(latLng);
	}
};
return inst;
}]);