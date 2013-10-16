/**
//TOC
//5. parseUrl
//5.5. parseUrlParams
//5.6. stripUrlParams
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
	
	/**
	Takes a url and removes one or more parameters and adds a trailing '?' or '&' so more can be added
	@toc 5.6.
	@method stripUrlParams
	@param {String} url The original url (i.e. 'http://domain.com?p1=yes&p2=no&p3=maybe' )
	@param {Array} stripKeys The params to remove from the url (i.e. ['p2'] )
	@param {Object} [params]
		@param {Boolean} [returnParamsOnly] True to return JUST url params (i.e. cut out the domain - i.e. 'http://domain.com' would NOT be present in the returned url)
	@return {String} newUrl (i.e. 'http://domain.com?p1=yes&p3=maybe&' )
	*/
	stripUrlParams: function(url, stripKeys, params) {
		var newUrl =url;
		var ii, patt1, patt2, patt3, patt4;
		
		//strip out host (everything before leading question mark) since need to add back in question mark later since need to search WITH a leading '?' and '&' otherwise can get improper matches (i.e. 'page' will improperly replace '&editpage=yes' if don't search with the leading character first)
		var host ='';
		var questionMark =newUrl.indexOf("?");
		if(questionMark >-1) {
			host =newUrl.slice(0, questionMark);
			newUrl =newUrl.slice((questionMark+0), newUrl.length);
		}
			
		for(ii =0; ii<stripKeys.length; ii++) {
			//note: order matters here - the last two will match the ENTIRE rest of the string so must only replace AFTER have searched for and replaced it earlier (i.e. before a '&') if it exists there!
			//must do these first
			patt1 =new RegExp('\\?'+stripKeys[ii]+'=.*&', 'i');		//for leading (first) parameter with non-ending parameter
			patt2 =new RegExp('&'+stripKeys[ii]+'=.*&', 'i');		//for all other (non-first) parameters with non-ending parameter
			//must do these last
			patt3 =new RegExp('\\?'+stripKeys[ii]+'=.*', 'i');		//for leading (first) parameter
			patt4 =new RegExp('&'+stripKeys[ii]+'=.*', 'i');		//for all other (non-first) parameters
			newUrl =newUrl.replace(patt1, '?').replace(patt2, '&').replace(patt3, '?').replace(patt4, '&');
		}
		
		//re-add leading question mark
		if(newUrl.length >0) {		//if have something left
			if(newUrl.indexOf('?') <0) {		//if no question mark, replace leading character (must be an '&') with a question mark
				newUrl ='?'+newUrl.slice(1, newUrl.length);
			}
		}
		
		//add appropriate trailing character so returned url can be added to without having to figure out if it should be a '?' or a '&'
		if(newUrl.indexOf('?') <0) {
			newUrl +='?';
		}
		else {
			newUrl +='&';
		}
		
		if(params.returnParamsOnly ===undefined || !params.returnParamsOnly) {
			//add back in host
			newUrl =host+newUrl;
		}
		
		return newUrl;
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