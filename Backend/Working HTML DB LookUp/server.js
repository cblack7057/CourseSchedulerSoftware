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
var query1 = {};
var query2 = {};

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name';


var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        //processAllFieldsOfTheForm(req, res);
        //processFormFieldsIndividual(req, res);
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

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
}

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        console.log(field);
        console.log(value);
        fields[field] = value;
    });

    form.on('end', function () {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
		res.write('course: ', fields[0]);
		res.write('subject: ', fields[1]);
        //res.end(util.inspect({
            //fields: fields
        //}));
    });
    form.parse(req);
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
		
		subject = fields.pop(); //pop off the subject
		course = fields.pop(); //pop off the course
		query1['Subj'] = subject;
		query2['Crse'] = parseInt(course);
	
        console.log('received the data:');
		console.log('course: ', course);
		console.log('subject: ', subject);
		console.log('query: ', query1);
		console.log('query: ', query2);
        //res.end(util.inspect({
            //fields: fields
        //}));
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
    var collection = db.collection('Courses');
	
	// Look up the courses
	
    collection.find({"$and":[query1,query2]}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
		app.get('/', function(req, res) {
		//res.sendFile(path.join(__dirname + '/index.html'));
	});
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }

    //Close connection
    //db.close();
	});
	}
});

}


server.listen(1185);
console.log("server listening on 1185");