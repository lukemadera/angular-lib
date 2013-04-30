/**
Handles google login

@toc
//0. init
//0.25. setGoogleOpts
//0.5. destroy
//1. login
//1.5. loginCallback

@usage
1. call init with google client id (required) and scope/permissions (optional) to initialize (only needs to be called once)
2. call login with a callback event that will be $broadcast with the google credentials for the user who logged in

@example
	//initialize google auth with client id
	libGoogleAuth.init({'client_id':LGlobals.info.googleClientId, 'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'});

	//do actual login
	var evtGoogleLogin ="evtGoogleLogin";
	$scope.googleLogin =function() {
		libGoogleAuth.login({'extraInfo':{'user_id':true, 'emails':true}, 'callback':{'evtName':evtGoogleLogin, 'args':[]} });
	};
	
	// @param {Object} googleInfo
		// @param {Object} token
			// @param {String} access_token
		// @param {Object} extraInfo
			// @param {String} user_id
			// @param {String} emails
	$scope.$on(evtGoogleLogin, function(evt, googleInfo) {
		//do stuff here
	});
	
*/

'use strict';

angular.module('lib.services').
factory('libGoogleAuth', ['libFxnCallback', '$rootScope', '$http', function(libFxnCallback, $rootScope, $http) {
var inst ={

	inited: false,
	token: {},		//will store token for future use / retrieval
	googleInfo: {
		'client_id':false,
		'scope': 'https://www.googleapis.com/auth/plus.login'
	},
	
	/**
	@toc 0.
	@method init
	@param {Object} params
		@param {String} client_id Google client id (required for login to work)
		@param {String} [scope] Space delimited string of permissions to request, i.e. "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/". Defaults to "https://www.googleapis.com/auth/plus.login" otherwise
	*/
	init: function(params)
	{
		var thisObj =this;
		this.setGoogleOpts(params);
	},
	
	/**
	Used to set google client id as well as request permissions (scope)
	@toc 0.25.
	@method setGoogleOpts
	@param {Object} params
		@param {String} client_id Google client id (required for login to work)
		@param {String} [scope] Space delimited string of permissions to request, i.e. "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/". Defaults to "https://www.googleapis.com/auth/plus.login" otherwise
	*/
	setGoogleOpts: function(params) {
		//extend google info (client id, scope)
		var xx;
		if(params.client_id || params.scope) {
			for(xx in params) {
				this.googleInfo[xx] =params[xx];
			}
		}
	},
	
	/**
	@toc 0.5.
	@method destroy
	*/
	destroy: function(params)
	{
		this.googleInfo = {
			'client_id':false,
			'scope': 'https://www.googleapis.com/auth/plus.login'
		};
		this.token ={};
		this.inited =false;
	},
	
	/**
	@toc 1.
	@method login
	@param {Object} params
		@param {Object} extraInfo List of additional info to get from google such as user id (which oddly isn't returned from google authentication)
			@param {Boolean} user_id true to return user id as 'user_id' field
			@param {Boolean} emails true to return emails as 'emails' field - NOTE: this requires https://www.googleapis.com/auth/userinfo.email scope to be set on init. NOTE: this currently does NOT seem to work - emails field isn't coming back from Google no matter what (tried making my email publicly visible, tried in Google oAuth playground - always blank..)
		@param {Object} callback
			@param {String} evtName
			@param {Array} args
	*/
	login: function(params) {
		var thisObj =this;
		var config ={
			'scope':this.googleInfo.scope,
			'client_id':this.googleInfo.client_id
			//'immediate': true,
		};
		
		gapi.auth.authorize(config, function() {
			var googleToken =gapi.auth.getToken();
			params.returnVals ={'token':googleToken};		//values to pass back via callback in loginCallback function
			if(params.extraInfo !==undefined && params.extraInfo.user_id || params.extraInfo.emails) {
				//get google user id since it's not returned with authentication for some reason..
				$http.defaults.headers.common["X-Requested-With"] = undefined;		//for CORS to work
				var url ='https://www.googleapis.com/plus/v1/people/me' +'?access_token=' + encodeURIComponent(googleToken.access_token);
				$http.get(url)
				.success(function(data) {
					//email doesn't seem to be returned..?? even with scope set to access it.. oauth2 playground not evening returning it, even after I changed my email to be publicly visible...
					params.returnVals.extraInfo ={'user_id':data.id};
					if(data.emails !==undefined) {
						params.returnVals.extraInfo.emails =data.emails;
					}
					thisObj.loginCallback(params);
				})
				.error(function(data) {
					alert('error retrieving Google info');
					thisObj.loginCallback(params);
				});
			}
			else {
				thisObj.loginCallback(params);
			}
		});
	},
	
	/**
	@toc 1.5.
	@param {Object} params
		@param {Object} returnVals values to send back via callback (passed through as is)
		@param {Object} callback
			@param {String} evtName
			@param {Array} args
	*/
	loginCallback: function(params) {
		var argsToAdd =[params.returnVals];
		var args =libFxnCallback.formArgs({'args':params.callback.args, 'argsToAdd':argsToAdd});
		$rootScope.$broadcast(params.callback.evtName, args);
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply();
		}
	}

};
return inst;
}]);