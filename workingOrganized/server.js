//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');
var express = require('express'); // call express
var app = express(); // define our app using express
var path = require('path');
var config = require('./config'); // contains database 
var bodyParser = require('body-parser'); 	// get body-parser
var morgan     = require('morgan'); 		// used to see requests

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console 
app.use(morgan('dev'));

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));


var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);
// for any webpage not listed in apiRoutes
app.get('*',function(req,res){ 
		res.sendFile(path.join(__dirname + '/public/views/index.html'));
	});

app.listen(config.port);
console.log("server listening on " + config.port);
