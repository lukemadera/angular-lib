/**
//TOC
//5. parseUrl
//5.5. parseUrlParams
//4. addFileSuffix
//3. escapeHtml
//1. trim
//2. random
*/

'use strict';

angular.module('lib.services').
factory('libString', ['libArray', function(libArray){
var inst ={

	/**
	Parses the url to retrieve GET params BEFORE Angular $location.url() is available..
	Handles hash (#) for non HTML5 History support (so '#/' will be stripped off too - though this may be an AngularJS specific routing solution??)
	@toc 5.
	@method parseUrl
	@param {Object} params
		@param {String} url The full url to parse
		@param {String} [rootPath =''] The part to strip off the beginning of the url (i.e. 'static/public/')
	@return {Object} A parsed section of the current url, i.e. for a url of: 'http://localhost/static/public/home?p1=yes&p2=no'
		@param {String} page The current url WITHOUT url GET params and WITHOUT the root path, i.e. 'home'
		@param {String} queryParams The GET params, i.e. 'p1=yes&p2=no'
		@param {Object} queryParamsObj An object version of the GET params, i.e. {p1:'yes', p2:'no'}
	*/
	parseUrl: function(params) {
		var ret ={page: '', queryParams: ''};
		var defaults ={rootPath: ''};
		var xx;
		for(xx in defaults) {
			if(params[xx] ===undefined) {
				params[xx] =defaults[xx];
			}
		}
		
		var appPath =params.rootPath;
		var curUrl =params.url;
		//strip off host info (in case rootPath is just '/', don't want to match the slash in the host/protocol info)
		var posSlashes =curUrl.indexOf('://');
		curUrl =curUrl.slice(posSlashes+3, curUrl.length);
		
		var pos1 =curUrl.indexOf(appPath);
		var curPage =curUrl.slice((pos1+appPath.length), curUrl.length);
		//handle non HTML5 history by stripping off leading '#/'
		var posHash =curPage.indexOf("#/");
		if(posHash >-1) {
			curPage =curPage.slice((posHash+2), curPage.length);
		}
		var posQuery =curPage.indexOf("?");
		var queryParams ='';
		if(posQuery >-1) {
			queryParams =curPage.slice((posQuery+1), curPage.length);
			curPage =curPage.slice(0, posQuery);
		}
		
		ret.page =curPage;
		ret.queryParams =queryParams;
		ret.queryParamsObj =this.parseUrlParams(queryParams, {});
		return ret;
	},
	
	/**
	Turns a query string (i.e. '?yes=no&maybe=so') into an object for easier reference
	@toc 5.5.
	@param {String} urlParams The query string (i.e. '?yes=no&maybe=so')
	@param {Object} [params]
	@return {Object} Key-value pairs for each parameter; i.e. {'yes':'no', 'maybe':'so'}
	*/
	parseUrlParams: function(urlParams, params) {
		//strip out leading question mark, if present
		var questionMark =urlParams.indexOf("?");
		if(questionMark >-1) {
			urlParams =urlParams.slice((questionMark+1), urlParams.length);
		}
		
		var urlParamsObj ={};
		var parts =urlParams.split('&');
		var ii, subParts;
		for(ii =0; ii<parts.length; ii++) {
			subParts =parts[ii].split('=');
			urlParamsObj[subParts[0]] =subParts[1];
		}
		return urlParamsObj;
	},
	
	//4.
	/*
	@param filename =string (i.e. 'test.jpg')
	@param suffix =string (i.e. '_crop')
	@return string of new filename with suffix (i.e. 'test_crop.jpg')
	//NOTE: if suffix already exists, it won't be re-added, i.e. "test_crop_crop.jpg" will NOT happen
	*/
	addFileSuffix: function(filename, suffix, params) {
		if(filename ===undefined || !filename || filename.indexOf(suffix) >-1) {		//if bad filename OR it already has suffix
			return filename;
		}
		else {
			var front =filename.substring(0, filename.lastIndexOf('.'));
			var end = filename.substring(filename.lastIndexOf('.'));
			return front + suffix + end;
		}
	}, 
	
	//3.
	escapeHtml: function(html, params) {
		var htmlNew =html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
		return htmlNew;
	},
	
	//1.
	trim: function(string1, params) {
		return string1.replace(/^\s+|\s+$/g, "");
	},
	
	//2.
	/*
	//Generates a random string
	@param len =string of length of string to create
	@param pp
		type =string, one of: 'readable' if want only readable chars (i.e. no uppercase "I" and lowercase "l" and number "1", which can look the same); otherwise it uses the full range of characters
	*/
	random: function(len, pp) {
		var defaults ={'type':'full'};
		pp =libArray.extend(defaults, pp, {});
		var chars;
		if(pp.type =='full') {
			chars ="abcdefghijkmnopqrstuvwxyz023456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		}
		else if(pp.type =='readable') {
			chars ="abcdefghijkmnopqrstuvwxyz023456789";
		}
		var randString ='';
		for(var ii=0; ii<len; ii++) {
			randString+=chars.charAt(Math.floor(Math.random()*chars.length));
		}
		return randString;
	}

};
return inst;
}]);