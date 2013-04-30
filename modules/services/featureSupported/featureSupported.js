/**
@todo - substitute Modernizr for things that can be

Similar to modernizr but with some additional checks for devices, platforms, and versions

//TOC
//0. init
//1. html5Check
//1.25. checkInputTypes
//1.5. html5
//2. getBrowser
//3. getDevice
//4. update
*/

'use strict';

angular.module('lib.services').
factory('libFeatureSupported', ['libArray', function(libArray){
var inst ={

	html5Support: {'svg':false, 'localStorage':false, 'offline':false, 'history':false, 'webWorkers':false, 'dragNDrop':false, 'fileAPI':false, 'geolocation':false, 'inputTypes':{}, 'socket':true},
	//html5SupportCheck: false,
	browser: false,
	device: false,		//string, one of: 'android', 'iOS' CURRENTLY ONLY SUPPORTED FOR ANDROID & iOS
	deviceVersion: false,		//two-digit version (i.e. 2.3) CURRENTLY ONLY SUPPORTED FOR ANDROID
	touch: false,
	orientation: false,
	platforms: {'phonegap':false, 'facebook':false},
	inited: false,

	//0.
	/*
	@param params
		phonegap =boolean true if just want to (re)init phonegap (i.e. since it may not be ready when init is called first time)
	*/
	init: function(params)
	{
		this.inited =true;		//has to be at top to avoid endless loop when calling other functions in here
		var atLeastOne =false;
		for(var xx in params)
		{
			atLeastOne =true;
			break;
		}
		var defaults ={};
		if(atLeastOne) {		//set to false; the true ones will be reset to true
			defaults ={'html5':false, 'phonegap':false, 'device':false};
		}
		else {		//set to all true
			defaults ={'html5':true, 'phonegap':true, 'device':true};
		}
		//params =$.extend({}, defaults, params);
		params =libArray.extend(defaults, params, {});
		
		this.touch ="ontouchend" in document;
		//this.touch =true;		//TESTING
		this.orientation ="onorientationchange" in window;
		if(params.html5) {
			this.html5Check(params);
		}
		if(params.device) {
			this.device =this.getDevice({});
		}
		if(params.phonegap)
		{
			if(window.globalPhoneGap && globalPhoneGap) {
				this.platforms.phonegap =true;
			}
		}
		if(this.platforms.phonegap) {
			this.html5Support.socket =false;
		}
	},

	//1.
	/*
	runs initial check to see what features are supported
	*/
	html5Check: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		var e = document.createElement('div');
		e.innerHTML = '<svg></svg>';
		this.html5Support.svg =!!(window.SVGSVGElement && e.firstChild instanceof window.SVGSVGElement);
		//this.html5Support.svg =false;		//TESTING
		this.html5Support.dragNDrop ='draggable' in document.createElement('span');
		this.html5Support.fileAPI =typeof FileReader != 'undefined';
		this.html5Support.geolocation =!!navigator.geolocation;
		this.html5Support.history =!!(window.history && window.history.pushState);
		try {
			this.html5Support.localStorage ='localStorage' in window && window.localStorage !== null;
		} catch(err) {
			this.html5Support.localStorgae =false;
		}
		this.html5Support.offline =!!window.applicationCache;
		this.html5Support.webWorkers =!!window.Worker;
		/*
		if(this.html5Support.webWorkers)		//have to test the Firefox 8 domain error by actually attempting to create a new worker
		{
			try
			{
				var testWorker =new Worker(globalJSWebWorkersDirectory+"ajax.js");
				//if(testWorker)
				//	useWebworker =true;
			}
			catch(err)
			{
				this.html5Support.webWorkers =false;
				//useWebworker =false;
			}
		}
		*/
		var html ="";
		var alertIt =false;
		for(var xx in this.html5Support)
		{
			//if(1)
			//if(!this.html5Support[xx])
			if(0)
			{
				alertIt =true;
				html+=xx+": "+this.html5Support[xx]+" | ";
			}
		}
		if(alertIt ===true) {
			alert(html);
		}
		//check for input types
		this.checkInputTypes(params);
	},

	//1.25.
	checkInputTypes: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		var inputs = ['search', 'tel', 'url', 'email', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'color', 'range'],
		len = inputs.length;
		//var uiSupport = [];

		for(var ii = 0; ii < len; ii++)
		{
			var input = document.createElement('input');
			input.setAttribute('type', inputs[ii]);
			var notText = input.type !== 'text';
			this.html5Support.inputTypes[inputs[ii]] =false;

			if (notText && input.type !== 'search' && input.type !== 'tel')
			{
				input.value = 'testing';
				if (input.value !== 'testing')
				{
					//uiSupport.push(input.type);
					this.html5Support.inputTypes[inputs[ii]] =true;
					// console.log(uiSupport);
				}
			}
		}
	},

	//1.5.
	/*
	checks the supported list and return whether the currently checked feature is supported
	@param feature =string, matches key in html5Support array; i.e. 'svg', 'offline', 'webWorkers'
	@return boolean true if feature is supported, false otherwise
	*/
	html5: function(feature, params)
	{
		if(!this.inited) {
			this.init({});
		}
		var valid =false;
		if(this.html5Support[feature] !==undefined) {
			valid =this.html5Support[feature];
		}
		return valid;
	},

	//2.
	getBrowser: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(!this.browser)
		{
			this.browser ={};
			if(navigator.userAgent.match(/WebKit/)) {
				this.browser.type ='webkit';
			}
			else if(navigator.userAgent.match(/Firefox/)) {
				this.browser.type ='moz';
			}
			else {
				this.browser.type ='';
			}
		}
		return this.browser;
	},

	//3.
	getDevice: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(!this.device)
		{
			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
			if(isAndroid)
			//if(1)		//TESTING
			{
				this.device ='android';
				this.deviceVersion = parseFloat(ua.slice(ua.indexOf("android")+8));
				//this.deviceVersion =2.3;		//TESTING
			}
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
			if(iOS) {
				this.device ='iOS';
			}
		}
		//this.device ='android';		//TESTING
		return this.device;
	},

	//4.
	update: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(params.facebook) {
			this.platforms.facebook =true;
		}
	}

};
	inst.init();
return inst;
}]);