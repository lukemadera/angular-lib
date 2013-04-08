//angular.module('ui.config', []).value('ui.config', {});
angular.module('lib.services', []);
angular.module('lib', ['lib.services']);
/**
//TOC
//5. formValid
//4. scopeLoaded
//3. removeAngularKeys
//2. deleteEmptyFormVals
//1. cleanFormVals
*/

angular.module('lib.services').
factory('libAngular', ['libArray', '$q', '$timeout', function(){
var inst ={

	//5.
	formValid: function(form, params) {
		var valid =true;
		for(var xx in form) {
			if(form[xx].$valid !==undefined && form[xx].$valid !==true) {
				valid =false;
				break;
			}
		}
		return valid;
	},
	
	//4.
	/*
	//Uses a supplied element id to do a timeout loop until that element exists/has length and then returns a promise. This resolves the timing issues that can occur if try to access DOM elements before they exist/are loaded
	NOTE: usually a better solution is to write a directive, whose linking function will only execute after it's been loaded so this becomes obsolete. But there may be some cases where this can be easier / a directive isn't worth it. Though from a performance standpoint, this does a continuous loop to check so is wasteful..
	@param params
		idEle =string of id for element to check if it exists yet
	EXAMPLE CALL:
	var promise =libAngular.scopeLoaded({'idEle':$scope.ids.content});
	promise.then(function() {
		//code here
	});
	*/
	scopeLoaded: function(params) {
		var deferred = $q.defer();
		var checkLoaded =function(params) {
			if($("#"+params.idEle).length) {
				deferred.resolve({});
			}
			else {
				$timeout(function() {
					checkLoaded(params);
				}, 200);
			}
		};
		checkLoaded(params);
		return deferred.promise;
	},
	
	//3.
	/*
	Removes extra keys like $$hashKey that get added for scope management
	NOTE: this is an expensive function... makes 4 expensive calls - may be worth doing a more efficient way..?
	*/
	removeAngularKeys: function(array1, params) {
		var newArray =libArray.copyArray(array1, {});
		newArray =angular.toJson(newArray);
		newArray =angular.fromJson(newArray);		//this angular function strips them it seems
		newArray =this.deleteEmptyFormVals(newArray, {});
		return newArray;
	},

	//2.
	/*
	NOTE: assumes no nested (scalar) arrays (i.e. [][]); rather it assumes that each array [] is of an object/associate array and empty vals will be removed
	@param vals =object {} of form vals
	@return vals =object with empty objects in an array removed (i.e. [{},{}] will be [])
	*/
	deleteEmptyFormVals: function(vals, params) {
		if(typeof(vals) =='object') {
			//get rid of any angular added keys such as $hash
			vals =angular.toJson(vals);
			vals =angular.fromJson(vals);
			//go through vals and delete any empty vals in an array (it seems the only issue is for ng-repeat arrays [] of arrays {})
			for(var xx in vals) {
				if(vals[xx]) {		//it may be null
					if(libArray.isArray(vals[xx], {})) {
						var removeIndices =[];
						for(var ii=0; ii<vals[xx].length; ii++) {
							if(typeof(vals[xx][ii]) =='object') {
								var atLeastOne =false;
								for(var yy in vals[xx][ii]) {
									atLeastOne =true;
									break;
								}
								if(!atLeastOne) {
									removeIndices[removeIndices.length] =ii;
								}
							}
						}
						if(removeIndices.length >0) {
							vals[xx] =libArray.removeIndices(vals[xx], removeIndices, {});
						}
					}
					else if(typeof(vals[xx] =='object')) {		//recursively loop through all sub-arrays
						vals[xx] =this.deleteEmptyFormVals(vals[xx], {});
					}
				}
			}
		}
		return vals;
	},
	
	//1.
	cleanFormVals: function(array1, params) {
		if(libArray.isArray(array1, {})) {
			for(var ii=0; ii<array1.length; ii++) {
			}
		}
		else {
			for(var xx in array1) {
			}
		}
	}

};
return inst;
}]);
/**
//TOC
array remove (extends native javascript array functions)
//13. toAssociative
//12. toScalar
//11. overwrite
//10.75. setKeyVal
//10.5. setParentKeys
//10. evalArray
//9. isArray
//8. extend
//8.5. isEmpty
//7. convertStructure
//6. valExistsCheck
//6.5. keyExists
//4. copyArray
//3. sort2D
//3.5. subSort2D
//2. removeIndices
//1. findArrayIndex
*/

// Array Remove - By John Resig (MIT Licensed)
/*
// Remove the second item from the array
array.remove(1);
// Remove the second-to-last item from the array
array.remove(-2);
// Remove the second and third items from the array
array.remove(1,2);
// Remove the last and second-to-last items from the array
array.remove(-2,-1);
*/
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


angular.module('lib.services').
factory('libArray', [function(){
var inst ={

	//13. toAssociative: takes a scalar array with associative array entries and a key that exists in each entry. Returns a new associative array.
	//The new array will have entries with the same data as the original. The specified key will be removed; the value found under that key will
	//be used as the key for that entry in the new array.
	//Note: This function doesn't make sense if the scalar entries are not associative array objects that share at least one key.
	//	Furthermore, the values in the scalar entries under the specified key must be distinct from one another, since these will become keys.
	//params
		//key				//String. Specify what key to use as the indentifier. Default: "x_key"
		
	//EX:
	// var scalar = [ {'x_key': 'aaa', 'val': 12, 'txt': 'blah'}, {'x_key': 'bbb', 'val':23, 'text':'blahblah'} ];
	//toAssociative(scalar, {'key': 'x_key'}) returns
	//	{ 'aaa': {'val': 12, 'txt':'blah'}, 'bbb': {'val': 23, 'text':'blahblah'} }

	toAssociative: function(scalar, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		if(params.key === undefined)
		{
			params.key = "x_key";
		}
		
		var thisObj = this;
		var arr = {};
		
		for(var ii = 0; ii < scalar.length; ii++)
		{
			var xx = scalar[ii][params.key];
			arr[xx] = thisObj.copyArray(scalar[ii]);
			delete arr[xx][xx];
		}
		return arr;
	},

	//12. toScalar: takes an associative array. Returns a new scalar array.
	//Intended for use on associative arrays with object entries. In this case, the entries in the scalar array will be objects identical to the
	//entries in the original array, with the addition of a new key, "x_key", that remembers the entry's key in the associative array.
	//	If any entry is not an associative array object, that entry will be converted to an object with "x_key" and "x_data" properties, where x_data
	//	holds the original information.

	//params
		//key				//String. Specify your own key, which will take the place of "x_key". Default: "x_key"
		//data_key	//String. Specify your own key, which will take the place of "x_data". Default: "x_data"

	toScalar: function(arr, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		if(params.key === undefined)
		{
			params.key = "x_key";
		}
		if(params.data_key === undefined)
		{
			params.data_key = "x_data";
		}
		
		var thisObj = this;
		var scalar = [];
		var counter = 0;
		
		for(var xx in arr)
		{
			scalar[counter] = {};
			
			if(typeof(arr[xx]) =="object")			//If the entry is an object
			{
				if(thisObj.isArray(arr[xx]))			//If the entry is a scalar array
				{
					scalar[counter][params.key] = xx;
					scalar[counter][params.data_key] = thisObj.copyArray(arr[xx]);
				}
				else															//If the entry is a non-scalar array
				{
					scalar[counter] = thisObj.copyArray(arr[xx]);
					scalar[counter][params.key] = xx;
				}
			}
			else				//If the entry is not an object at all
			{
				scalar[counter][params.key] = xx;
				scalar[counter][params.data_key] = arr[xx];
			}
			counter++;
		}
		
		return scalar;
	},

	//10.75.
	/*
	//sets the value of an array when given the array base and the keys to set
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
		val =value to set (could be an array or object)
	@return array {}
		arrayBase =array now with the new value set
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	//EXAMPLE:
	$scope.formVals ={
		'header':{
		},
	};
	//then to set the value of header.title (i.e. "Save Bears"), would do:
	evalArray($scope.formVals, {'keys':'header.title'});
	*/
	setKeyVal: function(arrayBase,  params) {
		var retArray ={'arrayBase':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		if(params.keys.length ==1) {
			arrayBase[params.keys[0]] =params.val;
		}
		else if(params.keys.length ==2) {
			arrayBase[params.keys[0]][params.keys[1]] =params.val;
		}
		else if(params.keys.length ==3) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] =params.val;
		}
		else if(params.keys.length ==4) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] =params.val;
		}
		else if(params.keys.length ==5) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]] =params.val;
		}
		else if(params.keys.length ==6) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]][params.keys[5]] =params.val;
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		retArray.arrayBase =arrayBase;
		return retArray;
	},
	
	//10.5.
	/*
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
	@return array {}
		arrayBase =new arrayBase with any empty parent keys set to an empty object {}
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	EXAMPLE: if arrayBase =={} then calling this function with params.keys =='header.title':
		setParentKeys({}, {'keys':'header.title'});
		//returns: {}
			'arrayBase': {'header':{}}
			'valid':1
			'msg':''
	*/
	setParentKeys: function(arrayBase, params) {
		var retArray ={'arrayBase':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		var keys =params.keys;
		if(keys.length >1) {
			if(arrayBase[keys[0]] ===undefined) {
				arrayBase[keys[0]] ={};
			}
		}
		if(keys.length >2) {
			if(arrayBase[keys[0]][keys[1]] ===undefined) {
				arrayBase[keys[0]][keys[1]] ={};
			}
		}
		if(keys.length >3) {
			if(arrayBase[keys[0]][keys[1]][keys[2]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]] ={};
			}
		}
		if(keys.length >4) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]] ={};
			}
		}
		if(keys.length >5) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]] ={};
			}
		}
		if(keys.length >6) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]] ={};
			}
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		retArray.arrayBase =arrayBase;
		return retArray;
	},
	
	//10.
	/*
	//returns the value of an array when given the array base and the keys to read
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
	@return array {}
		val =value of this array after the keys have been added
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	//EXAMPLE:
	$scope.formVals ={
		'header':{
			'title':'Save Bears',
		},
	};
	//then to get the value of header.title (i.e. "Save Bears"), would do:
	//WITH noDotNotation
	evalArray($scope.formVals, {'keys':['header', 'title']});
	//WITHOUT noDotNotation
	evalArray($scope.formVals, {'keys':'header.title'});
	*/
	evalArray: function(arrayBase, params) {
		var retArray ={'val':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		if(params.keys.length ==1) {
			if(arrayBase[params.keys[0]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]];
			}
		}
		else if(params.keys.length ==2) {
			if(arrayBase[params.keys[0]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]];
			}
		}
		else if(params.keys.length ==3) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]];
			}
		}
		else if(params.keys.length ==4) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]];
			}
		}
		else if(params.keys.length ==5) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]];
			}
		}
		else if(params.keys.length ==6) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]][params.keys[5]];
			}
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		return retArray;
	},
	
	//9.
	/*
	distinguishes between an object/hash (i.e. {'key':'val'}) and (scalar) array (i.e. [1, 2, 3])
	*/
	isArray: function(array1, params) {
	/*	Cannot detect that a scalar array with an undefined first entry is an array
		if(typeof(array1) !='string' && (array1.length !=undefined && (typeof(array1) !='object' || array1[0] !=undefined || array1.length ===0)))	{		//have to ALSO check not object since it could be an object with a "length" key!... update - typeof is object sometimes for arrays??! so now checking array1[0] too/alternatively..
			return true;
		}
	*/
		if(Object.prototype.toString.apply(array1) === "[object Array]")
		{
			return true;
		}
		else {
			return false;
		}
	},
	
	//11.
	/*
	Takes two arrays. The first array is overwritten by values from the second. Entries in the first array not in the second are left untouched.
	Very similar to extend, but does respect nesting. Nested arrays will be overwritten.
	*/
	overwrite: function(oldArray, newArray, params)
	{
		if(!params)
		{	params ={};}
		
		var ii;
		var xx;
		var len1;
		var len2;
		var result;
		var temp;
		
		if(this.isArray(oldArray) && this.isArray(newArray))	//if both are scalar arrays
		{
			result = [];
			len1 = oldArray.length;
			len2 = newArray.length;
					
			for(ii=0; ii < len1; ii++)
			{
				if(newArray[ii] !== undefined)		//if the entry exists in the new array
				{
					if(typeof(newArray[ii]) =="object")		//new entry is array
					{
						result[ii] = this.copyArray(newArray[ii]);
					}
					else	//new entry is not array
					{
						result[ii] = newArray[ii];
					}
				}
				else		//not overwriting this entry
				{
					if(typeof(oldArray[ii]) =="object")		//if entry is array
					{
						result[ii] = this.copyArray(oldArray[ii]);
					}
					else	//not an array entry
					{
						result[ii] = oldArray[ii];
					}
				}
			}
		
			if(len2 > len1)		//if the new array is longer, need to keep going
			{
				for(ii = len1; ii < len2; ii++)
				{
					if(newArray[ii] !== undefined)
					{
						if(typeof(newArray[ii]) =="object")		//new entry is array
						{
							result[ii] = this.copyArray(newArray[ii]);
						}
						else
						{
							result[ii] = newArray[ii];
						}
					}
				}
			}
		}		//end: if scalar array
		else if(!(this.isArray(oldArray) || this.isArray(newArray))) //If neither is a scalar array
		{
			result = {};
			
			for(xx in oldArray)
			{
				if(newArray[xx] !== undefined)		//if the entry exists in the new array
				{
					if(typeof(newArray[xx]) =="object")		//new entry is array
					{
						result[xx] = this.copyArray(newArray[xx]);
					}
					else	//new entry is not array
					{
						result[xx] = newArray[xx];
					}
				}
				else		//not overwriting this entry
				{
					if(typeof(oldArray[xx]) =="object")		//if entry is array
					{
						result[xx] = this.copyArray(oldArray[xx]);
					}
					else	//not an array entry
					{
						result[xx] = oldArray[xx];
					}
				}
			}
			
			for(xx in newArray)		//now look for new keys in newArray
			{
				if(result[xx] === undefined)		//if we haven't already got this key
				{
					if(typeof(newArray[xx]) =="object")	//new entry is array
					{
						result[xx] = this.copyArray(newArray[xx]);
					}
					else		//new entry is not array
					{
						result[xx] = newArray[xx];
					}
				}
			}
		}
		else
		{
			console.log("Error in libArray.overwrite: Array structures do not match! Either both arrays must be scalar or both associative.");
		}
		return result;
	},
	
	//8.
	/*
	Takes two arrays. The first array is overwritten by values from the second. Entries in the first array not in the second are left untouched.
	NOTE: if a key in the newArray is undefined, the old array will be copied over into the newArray. BUT if the newArray is defined and blank, the resulting array will be the same as the newArray (i.e. no parts of the oldArray (which is longer) will be copied at all)
	Returns the result of this merging of arrays.
	The arrays must be either both associative or both scalar. This also applies to any nested arrays that are defined for both arrays.
	@param oldArray = array to be overwritten
	@param newArray = array used to overwrite values in oldArray
	@param params
	*/
	extend: function(oldArray, newArray, params)
	{
		var thisObj =this;
		if(!params)
		{	params ={};}
		
		//backwards compatibility - if blank array {} or [], just copy old array
		if(this.isArray(newArray) && newArray.length === 0)		//If the new array given is empty
		{
			return this.copyArray(oldArray);
		}
		else if(this.isEmpty(newArray) === true) {
			return this.copyArray(oldArray);
		}

		var recursor =function(oldArray, newArray, params)
		{
			var ii;
			var xx;
			var len1;
			var len2;
			var result;
			var temp;
			
			if(thisObj.isArray(oldArray) && thisObj.isArray(newArray))	//if both are scalar arrays
			{
				result = [];
				len1 = oldArray.length;
				len2 = newArray.length;
				
				if(len2 === 0)		//If the new array given is empty, overwrite the old array
				{
					return thisObj.copyArray(newArray);
				}
				else
				{			
					for(ii=0; ii < len1; ii++)
					{
						if(newArray[ii] !== undefined)		//if the entry exists in the new array
						{
							if(typeof(newArray[ii]) =="object")		//new entry is array
							{
								if(typeof(oldArray[ii]) =="object")	//old and new entry both arrays	
								{
									result[ii] = recursor(oldArray[ii], newArray[ii], params);
								}
								else	//new entry is array, old is not
								{
									result[ii] = thisObj.copyArray(newArray[ii]);
								}
							}
							else	//new entry is not array
							{
								result[ii] = newArray[ii];
							}
						}
						else		//not overwriting this entry
						{
							if(typeof(oldArray[ii]) =="object")		//if entry is array
							{
								result[ii] = thisObj.copyArray(oldArray[ii]);
							}
							else	//not an array entry
							{
								result[ii] = oldArray[ii];
							}
						}
					}
				
					if(len2 > len1)		//if the new array is longer, need to keep going
					{
						for(ii = len1; ii < len2; ii++)
						{
							if(newArray[ii] !== undefined)
							{
								if(typeof(newArray[ii]) =="object")		//new entry is array
								{
									result[ii] = thisObj.copyArray(newArray[ii]);
								}
								else
								{
									result[ii] = newArray[ii];
								}
							}
						}
					}
				}
			}		//end: if scalar array
			else if(!(thisObj.isArray(oldArray) || thisObj.isArray(newArray))) //If neither is a scalar array
			{
				result = {};
				
				//If the new array is empty, overwrite the old one.
				if(thisObj.isEmpty(newArray) === true)
				{
					return thisObj.copyArray(newArray);
				}
				
				for(xx in oldArray)
				{
					if(newArray[xx] !== undefined)		//if the entry exists in the new array
					{
						if(typeof(newArray[xx]) =="object")		//new entry is array
						{
							if(typeof(oldArray[xx]) =="object")	//old and new entry both arrays	
							{
								result[xx] = recursor(oldArray[xx], newArray[xx], params);
							}
							else	//new entry is array, old is not
							{
								result[xx] = thisObj.copyArray(newArray[xx]);
							}
						}
						else	//new entry is not array
						{
							result[xx] = newArray[xx];
						}
					}
					else		//not overwriting this entry
					{
						if(typeof(oldArray[xx]) =="object")		//if entry is array
						{
							result[xx] = thisObj.copyArray(oldArray[xx]);
						}
						else	//not an array entry
						{
							result[xx] = oldArray[xx];
						}
					}
				}
				
				for(xx in newArray)		//now look for new keys in newArray
				{
					if(result[xx] === undefined)		//if we haven't already got this key
					{
						if(typeof(newArray[xx]) =="object")	//new entry is array
						{
							result[xx] = thisObj.copyArray(newArray[xx]);
						}
						else		//new entry is not array
						{
							result[xx] = newArray[xx];
						}
					}
				}
			}
			else
			{
				console.log("Error in extendArray: Array structures do not match! Either both arrays must be scalar or both associative. This also applies to all sub-arrays that are defined in both arrays.");
			}
			return result;
		};
		return recursor(oldArray, newArray, params);		//init
	},
	
	//8.5.
	isEmpty: function(obj)
	{
		for(var key in obj) 
		{
			if (obj.hasOwnProperty(key)) 
			{
				return false;
			}
		}
		return true;
	},
	
	//7.
	/*
	takes selectVals array that may be incomplete (i.e. no 'name') or in a slightly different format and puts it into format: {val1:{'name':'name1', ..[potentially other params as well]}, val2:{}, .. }
	@param selectVals =array of options: {val1:{'name':'name1', ..[potentially other params as well]}, val2:{}, .. } OR new Array( {'value':'val1','name':'name1'}, {'value':'val2','name':'name2'} )
	@param params
	*/
	convertStructure: function(selectVals, params)
	{
		var thisObj =this;
		var xx;
		var finalArray ={};
		if(this.isArray(selectVals))		//scalar / non-associative array
		{
			finalArray ={};
			for(var ii=0; ii<selectVals.length; ii++)
			{
				if(typeof(selectVals[ii]) !="object")
				{
					val =selectVals[ii].toString();
					finalArray[val] ={'name':val};
				}
				else
				{
					var val =selectVals[ii].value;
					finalArray[val] ={};
					for(xx in selectVals[ii])
					{
						if(xx !='value')
						{
							finalArray[val][xx] =selectVals[ii][xx];
						}
					}
				}
			}
			return finalArray;
		}
		else
		{
			finalArray ={};
			for(xx in selectVals)
			{
				if(typeof(selectVals[xx]) !="object")
				{
					finalArray[xx] ={};
					if($.trim(selectVals[xx]).length >0)
						finalArray[xx].name =selectVals[xx];
					else
						finalArray[xx].name =xx;
				}
				else
				{
					finalArray[xx] =thisObj.copyArray(selectVals[xx],{});
					var foundName =false;
					for(var yy in selectVals[xx])
					{
						if(yy =='name')
						{
							foundName=true;
							break;
						}
					}
					if(foundName ===false)		//add name
					{
						finalArray[xx].name =xx;
					}
				}
			}
			return finalArray;
		}
	},

	//6.
	/*!
	@param array1 =array to check in
	@param val =val to check for in array
	@param params
	@return boolean false if doesn't exist
	*/
	valExistsCheck: function(array1, val, params)
	{
		var duplicateVal =false;
		for(iiDup =0; iiDup<array1.length; iiDup++)
		{
			if(array1[iiDup] ==val)
			{
				duplicateVal =true;
				break;
			}
		}
		return duplicateVal;
	},
	
	//6.5.
	/*
	@param array1 =1D array []
	@param key =string of key to compare to array1 values
	@param params
	@return boolean true if key is one of the array values
	*/
	keyExists: function(array1, key, params) {
		var match =false;
		for(var ii=0; ii<array1.length; ii++) {
			if(array1[ii] ==key) {
				match =true;
				break;
			}
		}
		return match;
	},

	//4.
	/*!
	//TO DO - copying issue where scalar array is being converted to object..?
	By default, arrays/objects are assigned by REFERENCE rather than by value (so var newArray =oldArray means that if you update newArray later, it will update oldArray as well, which can lead to some big problems later). So this function makes a copy by VALUE of an array without these backwards overwriting issues
	Recursive function so can hog memory/performance easily so set "skip keys" when possible
	@param array1 =array/object to copy
	@param params
		skipKeys =1D array of keys to NOT copy (currently only for associative array - wouldn't make a ton of sense otherwise?)
	@return newArray =array/object that has been copied by value
	*/
	copyArray: function(array1, params)
	{
		var newArray, aa;
		if(!array1) {		//to avoid errors if null
			return array1;
		}
		if(!params)
			params ={};
		if(!params.skipKeys || params.skipKeys ===undefined)
			params.skipKeys =[];
		if(typeof(array1) !="object")		//in case it's not an array, just return itself (the value)
			return array1;
		if(this.isArray(array1))
		{
			newArray =[];
			for(aa=0; aa<array1.length; aa++)
			{
				if(array1[aa] && (typeof(array1[aa]) =="object"))
					newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
				else
					newArray[aa] =array1[aa];
			}
		}
		else		//associative array)
		{
			newArray ={};
			for(aa in array1)
			{
				var goTrig =true;
				for(var ss =0; ss<params.skipKeys.length; ss++)
				{
					if(params.skipKeys[ss] ==aa)
					{
						goTrig =false;
						break;
					}
				}
				if(goTrig)
				{
					if(array1[aa] && (typeof(array1[aa]) =="object"))
						newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
					else
						newArray[aa] =array1[aa];
				}
			}
		}
		return newArray;
	},
	
	//3.
	/*
	takes a multidimensional array & array index to sort by and returns the multidimensional array, now sorted by that array index
	@param arrayUnsorted =2D array to sort
	@param column =integer of array index to sort by (note first one is 0)
	@param params
		'order' ="desc" for reverse order sort
	@return sortedArray
	*/
	sort2D: function(arrayUnsorted, column, params)
	{
		var tempArray =[];	//copy calHide array here to sort; then re-copy back into calHide array once sorted
		var array2D =[];
		var ii;
		for(ii =0; ii<arrayUnsorted.length; ii++)
		{
			tempArray[ii] =[];
			tempArray[ii] =arrayUnsorted[ii];
			array2D[ii] =[ii, tempArray[ii][column]];
		}

		array2D =this.subSort2D(array2D);		//function		- array2D will come out sorted

		var sortedArray =[];
		var counter =0;
		if(params.order !==undefined && params.order =='desc')
		{
			for(ii=(array2D.length-1); ii>=0; ii--)
			{
				sortedArray[counter] =tempArray[array2D[ii][0]];
				counter++;
			}
		}
		else
		{
			for(ii =0; ii<array2D.length; ii++)
			{
				sortedArray[counter] =tempArray[array2D[ii][0]];
				counter++;
			}
		}
		
		return sortedArray;
	},

	//3.5.
	/*!
	//array has 2 elements: 1st is an identifier (for use to match later), 2nd gets sorted & keeps it's identifier with it
	@return array1
	*/
	subSort2D: function(array1)
	{
		var left;
		var right;
		var beg =[];
		var end =[];
		var pivot =[];
		pivot[0] =[];
		pivot[0][0] =[];
		pivot[0][1] =[];
		pivot[1] =[];
		pivot[1][0] =[];
		pivot[1][1] =[];
		var count =0;

		beg[0] =0;
		//end[0] =rosterLength-1;
		//end[0] =array1.length-1;
		end[0] =array1.length;		//CHANGE - not sure why... (array1 doesn't have a blank last index so don't have to subtract 1 anymore...)
		while(count>=0)
		{
			left =beg[count];
			right =end[count]-1;
			if(left <right)
			{
				pivot[0][1] =array1[left][1];
				pivot[0][0] =array1[left][0];
				while(left <right)
				{
					while((array1[right][1] >= pivot[0][1]) && (left <right))
					{
						right--;
					}
					if(left <right)
					{
						array1[left][0] =array1[right][0];
						array1[left][1] =array1[right][1];
						left++;
					}
					while((array1[left][1] <= pivot[0][1]) && (left <right))
					{
						left++;
					}
					if(left <right)
					{
						array1[right][0] =array1[left][0];
						array1[right][1] =array1[left][1];
						right--;
					}
				}
				array1[left][0] =pivot[0][0];
				array1[left][1] =pivot[0][1];
				beg[count+1] =left+1;
				end[count+1] =end[count];
				end[count] =left;
				count++;
			}
			else
			{
				count--;
			}
		}

		//var yes =1;		//dummy
		return array1;
	},

	//2.
	/*
	Removes indices from an array []
	@param array1 =array to remove indices from
	@param indices =1D array [] of indices to remove
	@param params
	@return 1D array [] of the new array without the indices that were to be removed
	*/
	removeIndices: function(array1, indices, params)
	{
		var newArray =[];
		var newArrayCounter =0;
		for(var ii=0; ii<array1.length; ii++)
		{
			var match =false;
			for(var jj=0; jj<indices.length; jj++)
			{
				if(indices[jj] ==ii)
				{
					match =true;
					break;
				}
			}
			if(!match)		//if don't want to remove it, copy over to new array
			{
				newArray[newArrayCounter] =this.copyArray(array1[ii]);
				newArrayCounter++;
			}
		}
		return newArray;
	},

	//1.
	/*
	Returns the index of an 2D []{} associative array when given the key & value to search for within the array
	@param array =2D array []{} to search
	@param key =associative key to check value against
	@param val
	@param params
		oneD =boolean true if it's a 1D array
	*/
	findArrayIndex: function(array, key, val, params)
	{
		var ii;
		//var index =false;		//index can be 0, which evaluates to false
		var index =-1;
		if(params.oneD)
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		else
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii][key] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		return index;
	}

};
return inst;
}]);
/**

//TOC
*/

//'use strict';

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
/**
supported time formats (used for "inputFormat" fields / passed in params):
	mm/dd/yyyy (or mm-dd-yyyy)
	yyyymmdd
	yyyymmddhhmmss
	yyyymmddhhmm
	yyyy-mm-dd 
	yyyy-mm-dd hh:mm:ss (or yyyy-mm-ddThh:mm:ss)
	mm-dd-yyyy hh:mm:ss (or mm-dd-yyyyThh:mm:ss)
	mm-dd-yyyy hh:mm OR mm-dd-yyyyThh:mm
	yyyymmddThhmmss (or yyyymmddThhmmssZ)
	
//TOC
//11. formFutureTime - NOT ACTIVE
//11.5. formFutureTimeString - NOT ACTIVE
//10. add
//9. formMilTimeParts
//7. convertMilTimeString
//7.5. convertMilTime
//6. formDateTimeParts
//8. formJavascriptDate
//5.5. formatDateTimeInput
//5. formatDateTime
//5.25.1 month_names
//5.25.2 month_names_abbrev
//5.25. monthToWord
//5.26 wordToMonth
//4. numberTwoDigits
//3. timestamp - gets current date (basically a "today" function)
//1. timeDifferenceFormatted
//1.5. timeDifference
//1.75. breakUpAmount
*/

angular.module('lib.services').
factory('libDateTime', [function(){
var inst ={

	//11.
	/*!
	Calculates a time in the future given a number of hours and minutes to go forward. To handle large minute/hour values (i.e. going forward more than 1 day), first convert minutes to hours (so new minutes is less than 60) and then convert hours to days (so new hours is less than 24). Then at end go forward the necessary number of days
	@param dateTimeParts =associative array of: 'year', 'month', 'day', 'hour', 'minute'
	@param numHours = number of hours to go forward
	@param numMinutes =number of minutes to go forward
	@return newDateTimeParts =associative array of: 'year', 'month', 'day', 'hour', 'minute', 'second'=0 (all integers)
	//required functions: formFutureDate
	*/
	formFutureTime: function(dateTimeParts, numHours, numMinutes)
	{
		var year =dateTimeParts.year *1;
		var month =dateTimeParts.month *1;
		var day =dateTimeParts.day *1;
		var hour =dateTimeParts.hour *1;
		var minute =dateTimeParts.minute *1;
		
		var numDays =0;
		//handle minutes (first convert to/store in hours so minutes is less than 60)
		numHours =numHours +Math.floor(numMinutes / 60);
		numMinutes =numMinutes %60;
		minute +=numMinutes;
		if(minute >=60)		//go back an hour
		{
			minute -=60;
			hour +=1;
			//will handle hours over 24 later
		}
		
		//handle hours (first convert to/store in days so hours is less than 24)
		numDays =numDays +Math.floor(numHours / 24);
		numHours =numHours %24;
		hour +=numHours;
		if(hour >=24)		//go back 1 or more days
		{
			while(hour >=24)
			{
				hour -=24;
				numDays++;
			}
		}
		
		//handle days
		var tempArray =this.formFutureDate(year, month, day, numDays);		//function
		var newDateTimeParts ={'year':tempArray.year, 'month':tempArray.month, 'day':tempArray.day, 'hour':hour, 'minute':minute, 'second':0};
		return newDateTimeParts;
	},
	
	//11.5.
	/*!
	@param dateTimeString
	@param dateTimeInputFormat - i.e. yyyymmddhhmmss
	@param numHours
	@param numMinutes
	@return newDateTimeString
	*/
	formFutureTimeString: function(dateTimeString, dateTimeInputFormat, numHours, numMinutes)
	{
		var dateTimeParts =this.formDateTimeParts(dateTimeString, dateTimeInputFormat);		//function
		var newDateTimeParts =this.formFutureTime(dateTimeParts, numHours, numMinutes);		//function
		var newDateTime =this.formatDateTimeFromParts(newDateTimeParts, dateTimeInputFormat);		//function
		return newDateTime;
	},
	
	//10.
	/*
	@param inputDT =input date time (in form specified by inputFormat)
	@param add =array {} of one or more of the following:
		milliseconds: int,
    seconds: int,
    minutes: int,
    hours: int,
    days: int,
    months: int,
    years: int
	@return string of date time in format specified by inputFormat
	*/
	add: function(inputDT, inputFormat, add, params) {
		var dtParts =this.formDateTimeParts(inputDT, inputFormat, {});
		for(var xx in dtParts) {
			dtParts[xx] =dtParts[xx]*1;
			if(xx =='month') {		//month is 0 to 11 so have to subtract 1
				dtParts[xx] =dtParts[xx] -1;
			}
		}
		var dt =Date.today().set(dtParts);
		var dtFuture =dt.add(add);
		var dtReturn =this.formatDateTime(dtFuture, inputFormat, {});
		return dtReturn;
	},

	//9.
	/*
	@param inputType =string of formatted time to convert to military time
	@param inputFormat =string, one of: 'hh:mmX', 'hh:mmXX' where 'X' is 'p', 'a', or 'm'
	@return retArray =array of
		hour =string
		minute =string
	*/
	formMilTimeParts: function(inputTime, inputFormat, params) {
		var retArray ={'hour':'', 'minute':''};
		inputTime =inputTime.replace(/ /g, '').toLowerCase();		//remove spaces & make lower case
		if(inputFormat =='hh:mmX' || inputFormat =='hh:mmXX') {
			retArray.hour =inputTime.slice(0,2) *1;
			retArray.minute =inputTime.slice(3,5) *1;
			//var amPm =inputTime.slice(5, inputTime.length);
			var amPm =inputTime.slice(5,6);		//only care about first character
			if(amPm =='p') {
				if(retArray.hour <12) {
					retArray.hour+=12;
				}
			}
		}
		return retArray;
	},

	//7.5.
	/*
	@param inputString =string of military time (i.e. 07:15)
	@param inputFormat =string, one of: 'hh:mm', 'hhmm'
	@param params
		shortMinutes =boolean true if want to cut off "00" for times on the hour (i.e. 6a instead of 6:00a)
		fullAmPm =boolean true if want to use "am" and "pm" instead of just "a" and "p"
	@return non military time in form: h:mmX or hh:mmX where X ="a" or "p"
	*/
	convertMilTimeString: function(inputString, inputFormat, params) {
		if(!params || params ===undefined)
			params ={};
		inputString =inputString.toString();
		var hour1 =inputString.slice(0, 2);
		var minute1;
		if(inputFormat =='hh:mm') {
			minute1 =inputString.slice(2, 4);
		}
		else if(inputFormat =='hhmm') {
			minute1 =inputString.slice(3, 5);
		}
		var formattedTime =this.convertMilTime(hour1, minute1, params);	//function
		return formattedTime;
	},
	
	//7.
	/*
	@param hour =string or int of hour (i.e. 6 or "06")
	@param minute =string or int of hour (i.e. 15 or "07")
	@param params
		shortMinutes =boolean true if want to cut off "00" for times on the hour (i.e. 6a instead of 6:00a)
		fullAmPm =boolean true if want to use "am" and "pm" instead of just "a" and "p"
	@return non military time in form: h:mmX or hh:mmX where X ="a" or "p"
	*/
	convertMilTime: function(hour, minute, params) {
		if(!params) {
			params ={};
		}
		var hour1 =hour*1;
		var minute1 =minute*1;
		var amPm ='';
		var short1;
		if(!params.shortMinutes || params.shortMinutes ===undefined)
			short1 =false;
		else {
			short1 =true;
		}

		if(hour1 ===0)
		{
			hour1 =12;
			amPm ="a";
		}
		else if(hour1 <12)
		{
			amPm ="a";
		}
		else if(hour1 ==12)
		{
			amPm ="p";
		}
		else if(hour1 >12)
		{
			hour1 =hour1-12;
			amPm ="p";
		}
		
		if(params && params.fullAmPm && params.fullAmPm ===true)
		{
			if(amPm =="a")
				amPm ="am";
			else if(amPm =="p")
				amPm ="pm";
		}

		minute1 =this.numberTwoDigits(minute1);
		var time1;
		if(short1 && minute1 =="00")
			time1 =hour1+amPm;
		else
			time1 =hour1+":"+minute1+amPm;

		return time1;
	},

	//6.
	/*
	@param inputDateTime =string of the date time (in format specified by inputFormat)
	@param inputFormat =string, one of:
		mm/dd/yyyy (or mm-dd-yyyy)
		yyyymmdd
		yyyymmddhhmmss
		yyyymmddhhmm
		yyyy-mm-dd 
		yyyy-mm-dd hh:mm:ss (or yyyy-mm-ddThh:mm:ss)
		mm-dd-yyyy hh:mm:ss (or mm-dd-yyyyThh:mm:ss)
		mm-dd-yyyy hh:mm OR mm-dd-yyyyThh:mm
		yyyymmddThhmmss (or yyyymmddThhmmssZ)
		month day, year
		mon. day, year
	@return array {} of:
		year
		month
		day
		hour
		minute
		second
	*/
	formDateTimeParts: function(inputDateTime, inputFormat, params) {
		inputDateTime =inputDateTime.toString();
		var len1 =inputDateTime.length;
		var input_array;
		if(inputFormat =="mm/dd/yyyy")
		{
			return {'year':inputDateTime.slice(6, 10), 'month':inputDateTime.slice(0, 2), 'day':inputDateTime.slice(3, 5), 'hour':'00', 'minute':'00', 'second':'00'};
		}
		else if(inputFormat =="yyyymmdd")
		{
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(4, 6), 'day':inputDateTime.slice(6, 8), 'hour':'00', 'minute':'00', 'second':'00'};
		}
		else if(inputFormat =="yyyymmddhhmmss")
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(4, 6), 'day':inputDateTime.slice(6, 8), 'hour':inputDateTime.slice(8,10), 'minute':inputDateTime.slice(10,12), 'second':inputDateTime.slice(12,14)};
		else if(inputFormat =="yyyymmddhhmm")
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(4, 6), 'day':inputDateTime.slice(6, 8), 'hour':inputDateTime.slice(8,10), 'minute':inputDateTime.slice(10,12), 'second':'00'};
		else if(inputFormat =="yyyy-mm-dd")
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(5, 7), 'day':inputDateTime.slice(8, 10), 'hour':'00', 'minute':'00', 'second':'00'};
		else if(inputFormat =="yyyy-mm-dd hh:mm:ss" || inputFormat =="yyyy-mm-ddThh:mm:ss")
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(5, 7), 'day':inputDateTime.slice(8, 10), 'hour':inputDateTime.slice(11,13), 'minute':inputDateTime.slice(14,16), 'second':inputDateTime.slice(17,19)};
		else if(inputFormat =="mm-dd-yyyy hh:mm:ss" || inputFormat =="mm-dd-yyyyThh:mm:ss")
			return {'year':inputDateTime.slice(6,10), 'month':inputDateTime.slice(0,2), 'day':inputDateTime.slice(3,5), 'hour':inputDateTime.slice(11,13), 'minute':inputDateTime.slice(14,16), 'second':inputDateTime.slice(17,19)};
		else if(inputFormat =="mm-dd-yyyy hh:mm" || inputFormat =="mm-dd-yyyyThh:mm")
			return {'year':inputDateTime.slice(6,10), 'month':inputDateTime.slice(0,2), 'day':inputDateTime.slice(3,5), 'hour':inputDateTime.slice(11,13), 'minute':inputDateTime.slice(14,16), 'second':'00'};
		else if(inputFormat =="yyyymmddThhmmss" || inputFormat =="yyyymmddThhmmssZ")
			return {'year':inputDateTime.slice(0, 4), 'month':inputDateTime.slice(4, 6), 'day':inputDateTime.slice(6, 8), 'hour':inputDateTime.slice(9,11), 'minute':inputDateTime.slice(11,13), 'second':inputDateTime.slice(13,15)};
		else if(inputFormat =='month day, year')
		{
			input_array = inputDateTime.split(' ');
			return {'year':input_array[2], 'month':wordToMonth(input_array[0], {'abbrev':false}), 'day':input_array[1].replace(',', ''), 'hour':'00', 'minute':'00', 'second':'00'};
		}
		else if(inputFormat =='mon. day, year')
		{
			input_array = inputDateTime.split(' ');
			return {'year':input_array[2], 'month':wordToMonth(input_array[0], {'abbrev':true}), 'day':input_array[1].replace(',', ''), 'hour':'00', 'minute':'00', 'second':'00'};
		}
		return false;
	},
	
	//8.
	formJavascriptDate: function(inputDateTime, inputFormat, params) {
		var dt =this.formDateTimeParts(inputDateTime, inputFormat, params);
		var date1 =new Date(dt.year*1, (dt.month*1)-1, dt.day*1, dt.hour*1, dt.minute*1, dt.second*1);
		return date1;
	},
	
	//5.5.
	/*
	Same as formatDateTime BUT take a non-standard input time (i.e. not a javascript date object)
	*/
	formatDateTimeInput: function(inputDateTime, inputFormat, outputFormat, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		params.dateTimeParts = true;
		
		var dtParts =this.formDateTimeParts(inputDateTime, inputFormat, {});
		var dtFormatted =this.formatDateTime(dtParts, outputFormat, params);
		return dtFormatted;
	},
	
	//5.
	/*
	@param dateTime =javascript date object
	@param outputFormat ="mm/dd/yyyy", "yyyymmdd", "yyyymmddhhmmss", "yyyymmddhhmm",
		"yyyy-mm-dd hh:mm:ss", "yyyy-mm-ddThh:mm:ss",
		"mm-dd-yyyy hh:mm" OR "mm-dd-yyyyThh:mm"
		"yyyymmddThhmmss", "yyyymmddThhmmssZ",
		"month day, year", "mon. day, year',
		//h:mmX (i.e. 11:31p OR 1:28a)		NOT CURRENTLY SUPPORTED
		//h:mmXX (i.e. 11:31pm OR 1:28am)		NOT CURRENTLY SUPPORTED
		hh:mmX (i.e. 11:31p OR 01:28a)
		hh:mmXX (i.e. 11:31pm OR 01:28am)
		hh:mm (i.e. 23:31 OR 01:28)
	@param params
		dateTimeParts =boolean true if dateTime is actually an array of dateTimeParts (year, month, day, hour, minute, second) already
	*/
	formatDateTime: function(dateTime, outputFormat, params) {
		var dt ={};
		if(params === undefined)
		{
			params = {};
		}
		
		if(params.dateTimeParts)
		{
			dt =dateTime;
		}
		else
		{
			dt.year =dateTime.getFullYear().toString();
			dt.month =this.numberTwoDigits((dateTime.getMonth()+1), {});
			dt.day =this.numberTwoDigits(dateTime.getDate(), {});
			dt.hour =this.numberTwoDigits((dateTime.getHours()), {});
			dt.minute =this.numberTwoDigits((dateTime.getMinutes()), {});
			dt.second =this.numberTwoDigits((dateTime.getSeconds()), {});
		}
		
		if(outputFormat =="yyyymmdd")
			return dt.year+dt.month+dt.day;
		else if(outputFormat =="mm/dd/yyyy")
			return dt.month+"/"+dt.day+"/"+dt.year;
		else if(outputFormat =="yyyymmddhhmmss")
			return dt.year+dt.month+dt.day+dt.hour+dt.minute+dt.second;
		else if(outputFormat =="yyyymmddhhmm")
			return dt.year+dt.month+dt.day+dt.hour+dt.minute;
		else if(outputFormat =="yyyy-mm-dd")
			return dt.year+"-"+dt.month+"-"+dt.day;
		else if(outputFormat =="yyyy-mm-dd hh:mm:ss")
			return dt.year+"-"+dt.month+"-"+dt.day+" "+dt.hour+":"+dt.minute+":"+dt.second;
		else if(outputFormat =="yyyy-mm-ddThh:mm:ss")
			return dt.year+"-"+dt.month+"-"+dt.day+"T"+dt.hour+":"+dt.minute+":"+dt.second;
		else if(outputFormat =="mm-dd-yyyy hh:mm:ss")
			return dt.month+"-"+dt.day+"-"+dt.year+" "+dt.hour+":"+dt.minute+":"+dt.second;
		else if(outputFormat =="mm-dd-yyyyThh:mm:ss")
			return dt.month+"-"+dt.day+"-"+dt.year+"T"+dt.hour+":"+dt.minute+":"+dt.second;
		else if(outputFormat =="mm-dd-yyyy hh:mm")
			return dt.month+"-"+dt.day+"-"+dt.year+" "+dt.hour+":"+dt.minute;
		else if(outputFormat =="mm-dd-yyyyThh:mm")
			return dt.month+"-"+dt.day+"-"+dt.year+"T"+dt.hour+":"+dt.minute;
		else if(outputFormat =="yyyymmddThhmmss")
			return dt.year+dt.month+dt.day+"T"+dt.hour+dt.minute+dt.second;
		else if(outputFormat =="yyyymmddThhmmssZ")
			return dt.year+dt.month+dt.day+"T"+dt.hour+dt.minute+dt.second+"Z";
		else if(outputFormat =='hh:mm')
		{
			return dt.hour+":"+dt.minute;
		}
		else if(outputFormat =='hh:mmX' || outputFormat =='hh:mmXX')
		{
			var ppTemp ={};
			if(outputFormat =='hh:mmXX')
			{
				ppTemp.fullAmPm =true;
			}
			return this.convertMilTime(dt.hour, dt.minute, ppTemp);
		}
		else if(outputFormat == 'month day, year')
		{
			return (this.monthToWord(dt.month, {'abbrev': false}) + ' ' + dt.day + ', ' + dt.year);
		}
		else if(outputFormat == 'mon. day, year')
		{
			return (this.monthToWord(dt.month, {'abbrev': true}) + ' ' + dt.day + ', ' + dt.year);
		}
		else
			return false;
	},
	
	//5.25.1. month_names: Array of full month names. Indices correspond to the month's number.
	month_names:
	[
		'dummy',
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	],
	
	//5.25.2. month_names_abbrev: Array of abbreviated month names. Indices correspond to the month's number.
	month_names_abbrev:
	[
		'dummy',
		'Jan.',
		'Feb.',
		'Mar.',
		'Apr.',
		'May',
		'June',
		'July',
		'Aug.',
		'Sept.',
		'Oct.',
		'Nov.',
		'Dec.'
	],
	
	//5.25. monthToWord: takes a month's number. Returns the month's name.
	//params
		//abbrev			//Boolean. True iff the month name should be abbreviated, i.e. "December" -> "Dec." Default true.
	monthToWord: function(month_number, params)
	{
		month_number = parseInt(month_number, 10);
		
		if(params === undefined)
		{
			params = {};
		}
		if(params.abbrev === undefined)
		{
			params.abbrev = true;
		}
		
		if(params.abbrev === true)
		{
			return this.month_names_abbrev[month_number];
		}
		else
		{
			return this.month_names[month_number];
		}
	},
	
	//5.26. wordToMonth: takes a month's name Returns the month's number.
	//params
		//abbrev			//Boolean. True iff the month name is abbreviated, i.e. "December" -> "Dec." Default true.
	wordToMonth: function(month_name, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		if(params.abbrev === undefined)
		{
			params.abbrev = true;
		}
		
		if(params.abbrev === true)
		{
			return this.month_names_abbrev.indexOf(month_name);
		}
		else
		{
			return this.month_names.indexOf(month_name);
		}
	},
	
	//4.
	numberTwoDigits: function(num, params) {
		num =num.toString();
		if(num.length ==1)
			num ="0"+num;
		return num;
	},
	
	//3.
	/*
	@param params
		format =string of format to return, one of:
			default: 'yyyy-mm-dd hh:mm:ss'
	*/
	timestamp: function(params) {
		var d1 =new Date();
		if(params.format !==undefined) {
			return this.formatDateTime(d1, params.format, {});
		}
		else {
		var delimiter ="-";
		var month =this.numberTwoDigits((d1.getMonth()+1), {});
		var day =this.numberTwoDigits((d1.getDate()), {});
		var timestamp =d1.getFullYear()+delimiter+month+delimiter+day+" "+d1.toLocaleTimeString();
		return timestamp;
		}
	},
	
	//1.
	/*
	@param earlierDate =javascript date object for earlier time
	@param laterDate =javascript date object for later time
	@param params
		maxDaysBack =int of num days after which the earlierDate will just be returned rather than "x days"
	@return string of difference in highest complete denominator (i.e. "2 days" or "13 hours")
	*/
	timeDifferenceFormatted: function(earlierDate, laterDate, params) {
		var diff =this.timeDifference(earlierDate, laterDate, params);
		var retVal ="";
		if(params.maxDaysBack !==undefined && diff.days >params.maxDaysBack) {
			//retVal =this.formatDateTime(earlierDate, 'mm/dd/yyyy', {});
			retVal ='maxDays';
		}
		else if(diff.days >0) {
			retVal =diff.days+" day";
			if(diff.days !=1) {
				retVal+="s";
			}
		}
		else if(diff.hours >0) {
			retVal =diff.hours+" hour";
			if(diff.hours !=1) {
				retVal+="s";
			}
		}
		else if(diff.minutes >0) {
			retVal =diff.minutes+" minute";
			if(diff.minutes !=1) {
				retVal+="s";
			}
		}
		else if(diff.seconds >0) {
			retVal =diff.seconds+" second";
			if(diff.seconds !=1) {
				retVal+="s";
			}
		}
		return retVal;
	},
	
	//1.5.
	/*
	@param earlierDate =javascript date object for earlier time
	@param laterDate =javascript date object for later time
	@param params
	@return array {}
		days =int
		hours =int
		minutes =int
		seconds =int
	*/
	timeDifference: function(earlierDate, laterDate, params) {
		var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
		var oDiff ={};
		oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);
		nTotalDiff -= oDiff.days*1000*60*60*24;
		oDiff.hours = Math.floor(nTotalDiff/1000/60/60);
		nTotalDiff -= oDiff.hours*1000*60*60;
		oDiff.minutes = Math.floor(nTotalDiff/1000/60);
		nTotalDiff -= oDiff.minutes*1000*60;
		oDiff.seconds = Math.floor(nTotalDiff/1000);
		return oDiff;
	},
	
	//1.75.
	/*
	Splits a chunk of time into it's components - i.e. "80 minutes" would be 1 hour, 20 minutes
	@param amount =int of total amount
	@param unit =string, one of: 'seconds', 'minutes', 'hours'
	@return array {}
		days =int
		hours =int
		minutes =int
		seconds =int
	*/
	breakUpAmount: function(amount, unit, params) {
		var nTotalDiff =amount;
		var oDiff ={'days':0, 'hours':0, 'minutes':0, 'seconds':0};
		if(unit =='seconds') {
			oDiff.days = Math.floor(nTotalDiff/60/60/24);
			nTotalDiff -= oDiff.days*60*60*24;
			oDiff.hours = Math.floor(nTotalDiff/60/60);
			nTotalDiff -= oDiff.hours*60*60;
			oDiff.minutes = Math.floor(nTotalDiff/60);
			nTotalDiff -= oDiff.minutes*60;
			oDiff.seconds = nTotalDiff;
		}
		else if(unit =='minutes') {
			oDiff.days = Math.floor(nTotalDiff/60/24);
			nTotalDiff -= oDiff.days*60*24;
			oDiff.hours = Math.floor(nTotalDiff/60);
			nTotalDiff -= oDiff.hours*60;
			oDiff.minutes = nTotalDiff;
		}
		else if(unit =='hours') {
			oDiff.days = Math.floor(nTotalDiff/24);
			nTotalDiff -= oDiff.days*24;
			oDiff.hours = nTotalDiff;
		}
		return oDiff;
	}

};
return inst;
}]);
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

//'use strict';

angular.module('lib.services').
factory('libFeatureSupported', [function(){
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
		params =$.extend({}, defaults, params);
		
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
		if(this.html5Support[feature] !=undefind) {
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
/**
//1. formArgs
//2. doCallback
*/

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
/**
//TOC
//0. init
//1. show
//2. close
//3. destroy
//4. resize
//5. scroll
*/

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
/**
//0. init
//0.5. destroy
//1. resize
//2. addCallback
//2.5. removeCallback
*/

angular.module('lib.services').
factory('libResize', ['$rootScope', 'libFxnCallback', function($rootScope, libFxnCallback){
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
		params =$.extend({}, defaults, params);
		$(window).resize(function(){
			if(!thisObj.timeout) {
				thisObj.timeout =setTimeout(function() {
					thisObj.resize({});
					clearTimeout(thisObj.timeout);
					thisObj.timeout =false;		//reset
				}, params.timeout);
			}
		});
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
/**
//TOC
//1. setSwipe
*/

angular.module('lib.services').
factory('libSwipe', ['libFeatureSupported', function(){
var inst ={

	//1.
	/*
	@param selector =string, i.e. "#[id]", ".[class]"
	@param direction =string, one of: 'left', 'right', 'up', 'down'
	@param params
		fxn =function() to call on swipe
	*/
	setSwipe: function(selector, direction, params)
	{
		if(libFeatureSupported.touch && $(selector).length)
		{
			if(direction =='left')
			{
				$(selector).unbind('swipeleft');
				//$(selector).swipeleft(function(ee) {alert(selector+" left"); });
				$(selector).swipeleft(function(ee) {params.fxn(); });
			}
			else if(direction =='right')
			{
				$(selector).unbind('swiperight');
				$(selector).swiperight(function(ee) {params.fxn(); });
			}
			else if(direction =='up')
			{
				$(selector).unbind('swipeup');
				$(selector).swipeup(function(ee) {params.fxn(); });
			}
			else if(direction =='down')
			{
				$(selector).unbind('swipedown');
				$(selector).swipedown(function(ee) {params.fxn(); });
			}
		}
	}

};
return inst;
}]);