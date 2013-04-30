/**
//1. formArgs
//2. doCallback
*/

'use strict';

angular.module('lib.services').
factory('libFxnCallback', ['$rootScope', function($rootScope){
var inst ={

	//1.
	/*
	@param params
		args =array [] of original arguments
		argsToAdd =array [] of args to add
	*/
	formArgs: function(params) {
		if(params.args && params.args !==undefined)
		{
			if(params.args.length ===undefined)
				params.args =[params.args];
		}
		else
			params.args =[];
		if(!params.argsToAdd || params.argsToAdd ===undefined)
			params.argsToAdd =[];
		var args1 =params.args.concat(params.argsToAdd);
		if(args1.length ==1)
			args1 =args1[0];
		return args1;
	},
	
	//2.
	/*
	@param evtName
	@param args
	@param params
	*/
	doCallback: function(evtName, args, params) {
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply(function() {
				$rootScope.$broadcast(evtName, args);
			});
		}
		else {
			$rootScope.$broadcast(evtName, args);
		}
	}

};
return inst;
}]);