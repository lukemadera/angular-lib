/**
//TOC
//1. setSwipe
*/

'use strict';

angular.module('lib.services').
factory('libSwipe', ['libFeatureSupported', function(libFeatureSupported){
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