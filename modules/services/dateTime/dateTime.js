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

'use strict';

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
			return {'year':input_array[2], 'month':this.wordToMonth(input_array[0], {'abbrev':false}), 'day':input_array[1].replace(',', ''), 'hour':'00', 'minute':'00', 'second':'00'};
		}
		else if(inputFormat =='mon. day, year')
		{
			input_array = inputDateTime.split(' ');
			return {'year':input_array[2], 'month':this.wordToMonth(input_array[0], {'abbrev':true}), 'day':input_array[1].replace(',', ''), 'hour':'00', 'minute':'00', 'second':'00'};
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