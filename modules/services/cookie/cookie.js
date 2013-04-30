/**

//TOC
*/

'use strict';

angular.module('lib.services').
provider('libCookie', [function(){

/*
	@param c_name =string of cookie name
	@param value =string of cookie value
	@param exdays =integer of num days until cookie expires OR null for noExpires
	@param params
	*/
	this.set =function(c_name,value,exdays,params) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString()+"; path=/");
		document.cookie=c_name + "=" + c_value;
	};
	
	/*
	@param c_name =string of cookie name
	@param params
	*/
	this.clear =function(c_name,params) {
		document.cookie = encodeURIComponent(c_name) + "=deleted; expires=" + new Date(0).toUTCString()+"; path=/";
	};
	
	/*
	@param c_name =string of cookie name
	@param params
	*/
	this.get =function(c_name,params) {
		var ii,xx,yy,ARRcookies=document.cookie.split(";");
		for (ii=0;ii<ARRcookies.length;ii++)
		{
			xx=ARRcookies[ii].substr(0,ARRcookies[ii].indexOf("="));
			yy=ARRcookies[ii].substr(ARRcookies[ii].indexOf("=")+1);
			xx=xx.replace(/^\s+|\s+$/g,"");
			if(xx==c_name)
			{
				return unescape(yy);
			}
		}
		return false;
	};
	
	this.$get = function() {
		return {
			set: this.set,
			clear: this.clear,
			get: this.get
		};
	};

}]);