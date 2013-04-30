/**
Handles facebook login

@usage
1. call fbLoginInit with facebook app id (required) and permissions (optional) to initialize (only needs to be called once)
2. call preLoginFB with a callback event that will be $broadcast with the facebook user id and access token for the user who logged in (this can then be used on the backend, etc.)

@example
	//initialize with facebook app id
	libFacebookAuth.fbLoginInit({'fbAppId':'23234', 'fbPerms':'email,user_birthday,offline_access,publish_stream'});

	//do actual login
	var evtFBLogin ="evtFBLogin";
	$scope.fbLogin =function() {
		libFacebookAuth.preLoginFB({'callback':{'evtName':evtFBLogin, 'args':[]} });
	};
	
	// @param {Object} fbCookie
		// @param {String} accessToken
		// @param {String} userID
	$scope.$on(evtFBLogin, function(evt, fbCookie) {
		var vals ={'facebook_id':fbCookie.userID, 'access_token':fbCookie.accessToken};
		//do stuff here
	});

@toc
//0. init
//0.25. setFBOpts
//0.5. destroy
//1. fbLoginInit
//2. showFBLogin
//3.25. preLoginFB
//3.1. setFBLoginVars
//3. loginFB
*/

'use strict';

angular.module('lib.services').
factory('libFacebookAuth', ['libFxnCallback', '$rootScope', function(libFxnCallback, $rootScope) {
var inst ={

	inited: false,
	fbCookie: {},		//will store things such as access_token from facebook login
	alreadyFBInited: false,
	fbAppId: false,
	//fbPerms: "email,user_birthday,offline_access,publish_stream",
	fbPerms: "email,user_birthday",		//default - can be extended in setFBOpts function
	fbConnectTrig: false,
	
	/**
	@toc 0.
	@method init
	*/
	init: function(params)
	{
		this.inited =true;
	},
	
	/**
	Used to set facebook app id as well as requested permissions
	@toc 0.25.
	@method setFBOpts
	@param {String} fbId
	@param {Object} params
		@param {String} [fbPerms] String of permissions to request, i.e. "email,user_birthday,offline_access,publish_stream". Defaults to "email,user_birthday" otherwise
	*/
	setFBOpts: function(fbId, params) {
		this.fbAppId =fbId;
		if(params.fbPerms) {
			this.fbPerms =params.fbPerms;
		}
	},
	
	/**
	@toc 0.5.
	@method destroy
	*/
	destroy: function(params)
	{
		this.fbConnectTrig =false;
		this.alreadyFBInited =false;
		this.fbCookie ={};
		this.inited =false;
	},
	
	/**
	@toc 1.
	@method fbLoginInit
	@param {Object} params
		@param {String} fbAppId Facebook application id (required for login to work)
		@param {String} [fbPerms] String of permissions to request, i.e. "email,user_birthday,offline_access,publish_stream". Defaults to "email,user_birthday" otherwise
	*/
	fbLoginInit: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(params.fbAppId || params.fbPerms) {
			var fbAppId =false, ppSend ={};
			if(params.fbAppId) {
				fbAppId =params.fbAppId;
			}
			if(params.fbPerms) {
				ppSend.fbPerms =params.fbPerms;
			}
			this.setFBOpts(fbAppId, ppSend);
		}
		var thisObj =this;
		if(window.FB !==undefined && !this.alreadyFBInited) {
			this.alreadyFBInited =true;
			if(window.globalPhoneGap && globalPhoneGap) {
				if (typeof PhoneGap == 'undefined' && ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined'))) alert('PhoneGap/Cordova variable does not exist. Check that you have included phonegap.js (or cordova.js) correctly');
				if (typeof PG == 'undefined' && typeof CDV =='undefined') alert('PG/CDV variable does not exist. Check that you have included pg-plugin-fb-connect.js (or cdv-plugin-fb-connect.js) correctly');
				if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
				if(typeof CDV =='undefined')
					FB.init({ appId: thisObj.fbAppId, frictionlessRequests: true, nativeInterface: PG.FB });
				else
					FB.init({ appId: thisObj.fbAppId, frictionlessRequests: true, nativeInterface: CDV.FB });
			}
			else {
				FB.init({appId: thisObj.fbAppId, frictionlessRequests: true, status: true, cookie: true, xfbml: true});
			}
		}
	},
	
	/**
	@toc 2.
	@method showFBLogin
	@param params
		callback =array {} of: evtName, args
	*/
	showFBLogin: function(params)
	{
		var thisObj =this;
		params.FBLoggedOut =true;		//set this no matter what - just in case to force fb login dialog to come up
		var needToLogOut =false;
		if(this.fbConnectTrig) {		//log user out of facebook so they can re-log in (to confirm their account)
			FB.getLoginStatus(function(response) {
				if(response.authResponse) {
					needToLogOut =true;
				}
			});
			if(needToLogOut) {
				FB.logout(function(response){
					thisObj.preLoginFB(params);
				});
			}
		}
		if(!needToLogOut) {
			thisObj.preLoginFB(params);
		}
	},

	/**
	called when login button is clicked
	@toc 3.25.
	@method preLoginFB
	@param {Object} params
		alreadyLoggedIn =boolean true if already logged into FB (so clicking the button just logs in)
		callback
			evtName
			args =1D array of function args
		FBLoggedOut =boolean true if want to treat it as/force fb logged out (since FB.logout bug causes status to be connected even when user is logged out..
	*/
	preLoginFB: function(params)
	{
		var thisObj =this;
		var needToLogIn =true;
		if(params.alreadyLoggedIn) {
			needToLogIn =false;
		}
		else if(window.FB && params.FBLoggedOut ===undefined || !params.FBLoggedOut) {
			FB.getLoginStatus(function(response) {
				if(response.authResponse || response.session) {
					params.response =response;
					needToLogIn =false;
				}
			});
		}
		if(needToLogIn ===false) {
			this.loginFB(params);		//function
		}
		else {
			//alert("logging into FB");
			FB.login(function(response) {
				if(response.authResponse || response.session) {
					params.response =response;
					thisObj.loginFB(params);		//function
				}
			},
			{ scope: thisObj.fbPerms }		//update2: as of dec 12 2011, perms doesn't work with facebook.. need to use "scope" instead
			);
		}
	},

	/**
	@toc 3.1.
	@method setFBLoginVars
	@param params
		fbSessInfo =array of cookie data (from facebook, only necessary one is access_token (or may be accessToken))
	*/
	setFBLoginVars: function(params)
	{
		this.fbConnectTrig =true;
		//var map1 ={'uid':'userID', 'access_token':'accessToken', 'expires':'expiresIn'};
		var map1 ={'userID':'uid', 'accessToken':'access_token', 'expiresIn':'expires'};
		for(var xx in params.fbSessInfo) {
			this.fbCookie[xx] =params.fbSessInfo[xx];
			if(map1[xx]) {		//save both underscore and camel case versions
				this.fbCookie[map1[xx]] =params.fbSessInfo[xx];
			}
		}
	},

	/**
	@toc 3.
	@method loginFB
	@param params
		callback
			evtName
			args =1D array of function args
		response =FB response (in case need old sess info - i.e. for phoneGap..)
	*/
	loginFB: function(params)
	{
		var thisObj =this;
		var fbLoginVarsParams ={};
		var sessInfo ={};
		var xx;
		var dataString ='fbLogin=1';
		if((params.response && params.response.session) || (FB.getAuthResponse !==undefined && FB.getAuthResponse()))		//must put getAuthResponse call last since it may be undefined if coming from old phoneGap sdk.. (will throw error & break)
		{
			if(params.response && params.response.session)		//must check this first (see above - otherwise will error since getAuthResponse is not defined..
			{
				var sessInfoOld =params.response.session;
				sessInfo ={};
				//have to map sessInfo to new auth type
				//sess key vals: uid, access_token, expires, session_key, sig
				//auth response key vals: userID, accessToken, expiresIn, signedRequest
				var map1 ={'uid':'userID', 'access_token':'accessToken', 'expires':'expiresIn'};
				for(xx in sessInfoOld)
				{
					if(map1[xx])
						sessInfo[map1[xx]] =sessInfoOld[xx];
					else
						sessInfo[xx] =sessInfoOld[xx];
				}
			}
			else {
				sessInfo =FB.getAuthResponse();
			}
			dataString+='&fbUserId='+sessInfo.userID;
			for(xx in sessInfo)
			{
				dataString+='&fbCookie['+xx+']='+sessInfo[xx];
				fbLoginVarsParams[xx] =sessInfo[xx];
			}
		}
		
		this.setFBLoginVars({'fbSessInfo':fbLoginVarsParams});		//function
		
		var argsToAdd =[this.fbCookie];
		var args =libFxnCallback.formArgs({'args':params.callback.args, 'argsToAdd':argsToAdd});
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply(function() {
				$rootScope.$broadcast(params.callback.evtName, args);
			});
		}
		else {
			$rootScope.$broadcast(params.callback.evtName, args);
		}
	}
	
	

};
return inst;
}]);