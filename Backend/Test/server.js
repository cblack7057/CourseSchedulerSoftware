//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var express = require('express'); // call express
var port = process.env.PORT || 8080; // set the port for our app
var app = express(); // define our app using express
var path = require('path');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

	// Get the documents collection
    var collection = db.collection('Courses');
	
	// Look up the courses
    collection.find({Subj: "ACC", Crse: 3210}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
		app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname + '/index.html'));
});
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }

    //Close connection
    //db.close();
	});
	}
});

app.listen(port);