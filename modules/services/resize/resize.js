/**
//0. init
//0.5. destroy
//1. resize
//2. addCallback
//2.5. removeCallback
*/

angular.module('lib.services').
factory('libResize', ['$rootScope', 'libFxnCallback', 'libArray', function($rootScope, libFxnCallback, libArray){
var inst ={

	callbacks: {},		//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	timeout: false,

	//0.
	/*
	@param params
		timeout =int of milliseconds to wait between calling resize (for performance to avoid firing every millisecond)
	*/
	init: function(params)
	{
		var thisObj =this;
		var defaults ={'timeout':500};
		//params =$.extend({}, defaults, params);		//no jQuery
		params =libArray.extend(defaults, params, {});
		//$(window).resize(function(){		//no jQuery
		window.onresize =function() {
			if(!thisObj.timeout) {
				thisObj.timeout =setTimeout(function() {
					thisObj.resize({});
					clearTimeout(thisObj.timeout);
					thisObj.timeout =false;		//reset
				}, params.timeout);
			}
		//});
		};
	},
	
	//0.5.
	destroy: function(params)
	{
	},

	//1.
	resize: function(params)
	{
		var thisObj =this;
		var argsToAdd =[];
		for(var xx in this.callbacks)
		{
			var args =libFxnCallback.formArgs({'args':this.callbacks[xx].args, 'argsToAdd':argsToAdd});
			$rootScope.$broadcast(thisObj.callbacks[xx].evtName, args);
		}
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply();
		}
		//LLoadContent.load({});		//init svg images
	},

	//2.
	/*
	@param fxnId =string of associative array key/instance id to use (need this for removing callback later)
	@param fxnInfo =//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	@param params
	*/
	addCallback: function(fxnId, fxnInfo, params)
	{
		this.callbacks[fxnId] =fxnInfo;
	},

	//2.5.
	removeCallback: function(fxnId, params)
	{
		if(this.callbacks[fxnId] && this.callbacks[fxnId] !==undefined)
			delete this.callbacks[fxnId];
	}

};
inst.init();
return inst;
}]);