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

'use strict';

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
		
		//simpler and infinitely nested version from: http://stackoverflow.com/questions/8051975/access-object-child-properties-using-a-dot-notation-string
		while(params.keys.length && (arrayBase = arrayBase[params.keys.shift()]));
		return arrayBase;
		
		/*
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
		*/
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
					//var trimmedVal =$.trim(selectVals[xx]);		//no jQuery
					var trimmedVal =selectVals[xx].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
					if(trimmedVal.length >0)
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
		var iiDup;
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