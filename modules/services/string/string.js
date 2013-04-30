/**
//TOC
//4. addFileSuffix
//3. escapeHtml
//1. trim
//2. random
*/

'use strict';

angular.module('lib.services').
factory('libString', ['libArray', function(libArray){
var inst ={

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