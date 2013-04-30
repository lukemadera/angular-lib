/**
//TOC
//0. init
//1. show
//2. close
//3. destroy
//4. resize
//5. scroll
*/

'use strict';

angular.module('lib.services').
factory('libLoading', [function(){
var inst ={

	inited: false,
	idPart: "libLoading",
	ids: {'bodyDiv':false, 'full':false, 'mini':false},		//will be set later since needs idPart

	//0.
	init: function(params)
	{
		var thisObj =this;
		if(!this.ids.bodyDiv) {
			this.ids.bodyDiv =this.idPart+"BodyDiv";
			this.ids.mini =this.idPart+"Mini";
			this.ids.full =this.idPart+"Full";
		}
		
		$(window).resize(function(){
			thisObj.resize();
		});
		$(window).scroll(function(){
			thisObj.scroll({});
		});
		this.inited =true;
	},
	
	//1.
	/*
	@param params
		callback =function to call after display loading (since need a timeout to ensure loading is painted/rendered BEFORE do the rest of the javascript)
		type =string, one of: 'mini' (default), 'full'
	*/
	show: function(params)
	{
		if(params ===undefined) {
			params ={};
		}
		var defaults ={'type':'mini'};
		//var defaults ={'type':'full'};
		params =$.extend({}, defaults, params);
		if(!this.inited) {
			this.init();
		}

		var divId =this.ids.bodyDiv;
		if(!$("#"+divId).length)
		{
			var html ="";
			html+="<div id='"+divId+"' class='l-loading-background'>";
			
			//mini
			html+="<div id='"+this.ids.mini+"' class='l-loading-background-inner'>";
			html+="<div class='l-loading-mini-background-inner'>";
			html +="<div class='l-loading-mini-icon'></div>";
			html+="</div>";
			html+="</div>";
			
			//full
			html+="<div id='"+this.ids.full+"' class='l-loading-background-inner'>";
			html+="<div class='l-loading-full-background-inner'>";
			//html+="Loading..";
			html +="<div class='l-loading-full-content'>Loading..</div>";
			html+="</div>";
			html+="</div>";
			
			html+="</div>";
			
			$("body").append(html);
		}
		$("#"+divId).show();
		if(params.type =='full') {
			$("#"+this.ids.full).show();
			$("#"+this.ids.mini).hide();
		}
		else {
			$("#"+this.ids.mini).show();
			$("#"+this.ids.full).hide();
		}
		this.resize();
		
		if(params.callback)
		{
			setTimeout(function(){
				params.callback();
			}, 40);
		}
	},

	//2.
	close: function(params)
	{
		var thisObj =this;
		var divId =thisObj.ids.bodyDiv;
		$("#"+divId).hide();
	},

	//3.
	destroy: function(params)
	{
		var divId =this.ids.bodyDiv;
		$("#"+divId).remove();
	},
	
	//4.
	resize:function(params) {
		var windowHeight =$(window).height();
		var windowWidth =$(window).width();
		var windowTop =$(window).scrollTop();
		$("#"+this.ids.bodyDiv).height(windowHeight);
		$("#"+this.ids.bodyDiv).width(windowWidth);
		$("#"+this.ids.bodyDiv).css({'top':windowTop+'px'});
	},
	
	//5.
	scroll:function(params) {
		var windowTop =$(window).scrollTop();
		$("#"+this.ids.bodyDiv).css({'top':windowTop+'px'});
	}

};
return inst;
}]);