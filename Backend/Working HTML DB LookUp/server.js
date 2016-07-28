//lets require/import the mongodb native drivers.
//connect to html page through http://localhost:1185/
var mongodb = require('mongodb');
var express = require('express'); // call express
var port = process.env.PORT || 8080; // set the port for our app
var app = express(); // define our app using express
var path = require('path');
var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');

var course;
var subject;

//Day of the week variables
var monday;
var tuesday;
var wednesday;
var thursday;
var friday;

//Day of the week times (monday)
var mStartTime1;
var mEndTime1;
var mStartTime2;
var mEndTime2;

//Day of the week times (tuesday)
var tStartTime1;
var tEndTime1;
var tStartTime2;
var tEndTime2;

//Day of the week times (wednesday)
var wStartTime1;
var wEndTime1;
var wStartTime2;
var wEndTime2;

//Day of the week times (thursday)
var rStartTime1;
var rEndTime1;
var rStartTime2;
var rEndTime2;

//Day of the week times (friday)
var fStartTime1;
var fEndTime1;
var fStartTime2;
var fEndTime2;

//query1 and query2 are course and subject for lookup respectively
//query3 is for day of the week lookup
var query1 = {};
var query2 = {};
var query3 = [];

var lookupResults;

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name';


var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
		lookupCourses(req,res);
    }
});

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function lookupCourses(req,res) {
	//Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        console.log('console.log1: ', field);
        console.log('console.log2: ', value);
        fields[field] = value;
    });

	
    form.on('end', function () {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
		
		course = fields["course"]; 
		subject = fields["subject"];
		
		monday = fields["monday"];
		tuesday = fields["tuesday"];
		wednesday = fields["wednesday"];
		thursday = fields["thursday"];
		friday = fields["friday"];
		
		mStartTime1 = fields["mondayStartTimeDropDown1"];
		mEndTime1 = fields["mondayEndTimeDropDown1"];
		mStartTime2 = fields["mondayStartTimeDropDown2"];
		mEndTime2 = fields["mondayEndTimeDropDown2"];
		
		tStartTime1 = fields["tuesdayStartTimeDropDown1"];
		tEndTime1 = fields["tuesdayEndTimeDropDown1"];
		tStartTime1 = fields["tuesdayStartTimeDropDown2"];
		tEndTime1 = fields["tuesdayEndTimeDropDown2"];
		
		wStartTime1 = fields["wednesdayStartTimeDropDown1"];
		wEndTime1 = fields["wednesdayEndSTimeDropDown1"];
		wStartTime2 = fields["wednesdayStartTimeDropDown2"];
		wEndTime2 = fields["wednesdayEndSTimeDropDown2"];
		
		rStartTime1 = fields["thursdayStartTimeDropDown1"];
		rEndTime1 = fields["thursdayEndTimeDropDown1"];
		rStartTime2 = fields["thursdayStartTimeDropDown2"];
		rEndTime2 = fields["thursdayEndTimeDropDown2"];
		
		fStartTime1 = fields["fridayStartTimeDropDown1"];
		fEndTime1 = fields["fridayEndTimeDropDown1"];
		fStartTime2 = fields["fridayStartTimeDropDown2"];
		fEndTime2 = fields["fridayEndTimeDropDown2"];
		
		query1['Subj'] = subject;
		query2['Crse'] = course;
		query3 = [];
		
		if(monday != 'M')
			query3.push('M');
		if(tuesday != 'T')
			query3.push('T');
		if(wednesday != 'W')
			query3.push('W');
		if(thursday != 'R')
			query3.push('R');
		if(friday != 'F')
			query3.push('F');
	
        console.log('received the data:');
		console.log('course: ', course);
		console.log('subject: ', subject);
		
		
		//console.log('monday: ', monday);
		//console.log('tuesday: ', tuesday);
		//console.log('wednesday: ', wednesday);
		//console.log('thursday: ', thursday);
		//console.log('friday: ', friday);
		console.log('query: ', query1);
		console.log('query: ', query2);
		console.log('query: ', query3);
    });
    form.parse(req);
	
	//----------------------------------------------------------------------------
	
	
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

	// Get the documents collection
    var collection = db.collection('DaveCourses');
	
    collection.find({"$and":
	[
		query1,
		query2, 
		{'Meetings.Day' : {$nin: query3}},  
	]},
			{"_id": 0, 
			 "Subj": 1, 
			 "Crse": 1, 
			 "Meetings": 1, 
			 "Meetings.Day": 1, 
			 "Meetings.StartTime": 1, 
			 "Meetings.EndTime":1}).toArray(function (err, result) 
	{	
	  if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
		res.end(util.inspect({result: result}, {showHidden: false, depth: null}));
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }

    //Close connection
    db.close();
	});
	
  }
});

}


server.listen(port);
console.log("server listening on " + port);