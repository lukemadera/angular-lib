/**
//TOC
//5. formValid
//4. scopeLoaded
//3. removeAngularKeys
//2. deleteEmptyFormVals
//1. cleanFormVals
*/

'use strict';

angular.module('lib.services').
factory('libAngular', ['libArray', '$q', '$timeout', function(libArray, $q, $timeout){
var inst ={

	//5.
	formValid: function(form, params) {
		var valid =true;
		for(var xx in form) {
			if(form[xx].$valid !==undefined && form[xx].$valid !==true) {
				valid =false;
				break;
			}
		}
		return valid;
	},
	
	//4.
	/*
	//Uses a supplied element id to do a timeout loop until that element exists/has length and then returns a promise. This resolves the timing issues that can occur if try to access DOM elements before they exist/are loaded
	NOTE: usually a better solution is to write a directive, whose linking function will only execute after it's been loaded so this becomes obsolete. But there may be some cases where this can be easier / a directive isn't worth it. Though from a performance standpoint, this does a continuous loop to check so is wasteful..
	@param params
		idEle =string of id for element to check if it exists yet
	EXAMPLE CALL:
	var promise =libAngular.scopeLoaded({'idEle':$scope.ids.content});
	promise.then(function() {
		//code here
	});
	*/
	scopeLoaded: function(params) {
		var deferred = $q.defer();
		var checkLoaded =function(params) {
			//if($("#"+params.idEle).length) {		//no jQuery
			if(document.getElementById(params.idEle)) {
				deferred.resolve({});
			}
			else {
				$timeout(function() {
					checkLoaded(params);
				}, 200);
			}
		};
		checkLoaded(params);
		return deferred.promise;
	},
	
	//3.
	/*
	Removes extra keys like $$hashKey that get added for scope management
	NOTE: this is an expensive function... makes 4 expensive calls - may be worth doing a more efficient way..?
	*/
	removeAngularKeys: function(array1, params) {
		var newArray =libArray.copyArray(array1, {});
		newArray =angular.toJson(newArray);
		newArray =angular.fromJson(newArray);		//this angular function strips them it seems
		newArray =this.deleteEmptyFormVals(newArray, {});
		return newArray;
	},

	//2.
	/*
	NOTE: assumes no nested (scalar) arrays (i.e. [][]); rather it assumes that each array [] is of an object/associate array and empty vals will be removed
	@param vals =object {} of form vals
	@return vals =object with empty objects in an array removed (i.e. [{},{}] will be [])
	*/
	deleteEmptyFormVals: function(vals, params) {
		if(typeof(vals) =='object') {
			//get rid of any angular added keys such as $hash
			vals =angular.toJson(vals);
			vals =angular.fromJson(vals);
			//go through vals and delete any empty vals in an array (it seems the only issue is for ng-repeat arrays [] of arrays {})
			for(var xx in vals) {
				if(vals[xx]) {		//it may be null
					if(libArray.isArray(vals[xx], {})) {
						var removeIndices =[];
						for(var ii=0; ii<vals[xx].length; ii++) {
							if(typeof(vals[xx][ii]) =='object') {
								var atLeastOne =false;
								for(var yy in vals[xx][ii]) {
									atLeastOne =true;
									break;
								}
								if(!atLeastOne) {
									removeIndices[removeIndices.length] =ii;
								}
							}
						}
						if(removeIndices.length >0) {
							vals[xx] =libArray.removeIndices(vals[xx], removeIndices, {});
						}
					}
					else if(typeof(vals[xx] =='object')) {		//recursively loop through all sub-arrays
						vals[xx] =this.deleteEmptyFormVals(vals[xx], {});
					}
				}
			}
		}
		return vals;
	},
	
	//1.
	cleanFormVals: function(array1, params) {
		if(libArray.isArray(array1, {})) {
			for(var ii=0; ii<array1.length; ii++) {
			}
		}
		else {
			for(var xx in array1) {
			}
		}
	}

};
return inst;
}]);