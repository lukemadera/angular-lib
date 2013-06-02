/**
AngularJS 1.1.5 has an ng-swipe directive but it doesn't support up/down swipes and it's not working for me at all (even for left/right swipes) so this is a temporary directive + service to support swipes. It uses jQuery mobile events code for the actual swipe up/down/left/right handling and just calls those methods - so this is just a wrapper.

@dependency
jquery.mobile.events.js

//TOC
//1. setSwipe

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Function} onswipe function to call on swiping

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. scroll-load='1' NOT scrollLoad='1'
	@param {Array} directions One or more of 'left', 'right', 'up', 'down' directions to bind swipe events to. The direction will be passed into the onswipe function to differentiate among the different events/directions.
	
@example
partial / html:
	<div lib-swipe directions='[left]' onswipe='swipeIt'>

controller / js:
	@param {Object} params
		@param {String} direction One of 'left', 'right', 'up', 'down' for which event triggered this call
	$scope.swipeIt =function(params) {
		alert('swipe '+params.direction);
	};

*/

'use strict';

angular.module('lib.services')
.directive('libSwipe', ['libSwipe', function(libSwipe) {
	return {
		restrict: 'A',
		scope: {
			onswipe: '&'
		},
		compile: function(element, attrs) {
			//set id on element
			attrs.id ="libSwipe"+Math.random().toString(36).substring(7);
			element.attr('id', attrs.id);
			
			return function(scope, element, attrs) {
				var directions =JSON.parse(attrs.directions);
				
				function setSwipe(curDirection) {
					return function() {
						libSwipe.setSwipe(
							'#'+attrs.id,
							curDirection,
							{
								'fxn':function() {
									if(scope.onswipe !==undefined && scope.onswipe() !==undefined && typeof(scope.onswipe()) =='function') {		//ensure the function exists
										scope.onswipe()({'direction':curDirection});
									}
								}
							}
						);
					};
				}
				
				var ii;
				for(ii =0; ii<directions.length; ii++) {
					setSwipe(directions[ii]);
				}
			};
		}
	};
}])
.factory('libSwipe', ['libFeatureSupported', function(libFeatureSupported){
var inst ={

	//1.
	/*
	@param selector =string, i.e. "#[id]", ".[class]"
	@param direction =string, one of: 'left', 'right', 'up', 'down'
	@param params
		fxn =function() to call on swipe
	*/
	setSwipe: function(selector, direction, params)
	{
		if(libFeatureSupported.touch && $(selector).length)
		{
			if(direction =='left')
			{
				$(selector).unbind('swipeleft');
				//$(selector).swipeleft(function(ee) {alert(selector+" left"); });
				$(selector).swipeleft(function(ee) {params.fxn(); });
			}
			else if(direction =='right')
			{
				$(selector).unbind('swiperight');
				$(selector).swiperight(function(ee) {params.fxn(); });
			}
			else if(direction =='up')
			{
				$(selector).unbind('swipeup');
				$(selector).swipeup(function(ee) {params.fxn(); });
			}
			else if(direction =='down')
			{
				$(selector).unbind('swipedown');
				$(selector).swipedown(function(ee) {params.fxn(); });
			}
		}
	}

};
return inst;
}]);