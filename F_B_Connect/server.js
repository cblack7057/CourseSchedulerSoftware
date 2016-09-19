//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');
var express = require('express'); // call express
var port = process.env.PORT || 8080; // set the port for our app
var app = express(); // define our app using express
var path = require('path');

var bodyParser = require('body-parser'); 	// get body-parser
var morgan     = require('morgan'); 		// used to see requests

var badDoc = false;

var apiRouter = express.Router();
var week;
var courses;

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

app.route('/')
// gets the initial webpage
	.get(function(req,res){ 
		res.sendFile(path.join(__dirname + '/public/views/index.html'));
	});
	
app.route('/process')
// retrieves weekData from a post request
	
	.post(function(req,res){
		//start(req,res);
		//lookupCourses(req,res);
		//console.log(req.body.timesArray);
		//console.log(req.body.courseArray);
		//week = req.body.timesArray;
		//courses = req.body.courseArray;
		res.json('this works');
	});	

//Array used to store all the results after .find() has been ran for each course and subject.
//This is NOT the final array to be printed.
var queryArray = [];

//query1 and query2 are course and subject for lookup respectively
//query3 is for day of the week lookup
var query1 = {};
var query2 = {};
var query3 = [];

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name';

var courseTree = [];
var coursePairs = [];
var scheduleArray = []; //one temporary schedule
var schedules = []; //list of all possible schedules


//Verify that the user has entered the correct data by verifying that the time entered is valid.
//If the day of week is unchecked, we do not even look at the times.
//Takes in the orignial query and will delete any courses that do not meet the time criteria.
function verifyAndRemoveCoursesByTime(section, sectionList, index){
	var queriedSectionMeetings = section.Meetings;

	for(var i = 0; i < queriedSectionMeetings.length; i++)
	{
		//check if the class has a meeting time for this day
		if(queriedSectionMeetings[i].StartTime == null)
			return;

		switch(queriedSectionMeetings[i].Day)
		{
		case 0:
			for(var j = 0; j < week[0].length; j++)
			{
				if(week[0][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[0][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;
		case 1:
			for(var j = 0; j < week[1].length; j++)
			{
				if(week[1][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[1][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;
		case 2:
			for(var j = 0; j < week[2].length; j++)
			{
				if(week[2][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[2][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;
		case 3:
			for(var j = 0; j < week[3].length; j++)
			{
				if(week[3][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[3][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;
		case 4:
			for(var j = 0; j < week[4].length; j++)
			{
				if(week[4][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[4][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;
		case 5:
			for(var j = 0; j < week[5].length; j++)
			{
				if(week[5][j].StartTime > queriedSectionMeetings[i].StartTime ||
				week[5][j].EndTime < queriedSectionMeetings[i].EndTime)
				{
					sectionList.splice(index, 1);
					return;
				}
			}
			break;

		}
	}
}

//creates a tree with each edge between nodes representing a pair of sections
function treeMaker(level) {
	//base cases
	var row = [];
	if(queryArray.length == 0)
	{
		return row;
	}
	if(level == queryArray.length)
	{
		for(var i = 0; i < queryArray[level-1].length; i++)
		{
			row.push([[level, i + 1], true]);	
		}
		return row;
	}


	for(var i = 0; i < queryArray[level-1].length; i++)
	{	
		row.push([[level, i + 1], true, treeMaker(level + 1)]);
	}
		return row;
}

//removes the branches of the tree that have edges that represent pairs found in coursePairs
function removeBranches(tree, i, m, j, n){
	if(i == 1)
	{
		removeBranchesHelper2(tree[0][m-1], j, n); 
		
	}
	else
	{
		for(var k = 0; k < tree[0].length; k++)
		{
			removeBranchesHelper(tree[0][k], i, m, j, n);
		}
	}
}

function removeBranchesHelper(node, i, m, j, n){
	if(node[1] == false)
	{
		return;
	}
	if(node[0][0] == i)
	{
		if(node[0][1] == m)
		{
			for(var k = 0; k < node[2].length; k++)
			{
				removeBranchesHelper2(node[2][k], j, n);
			}
		}
	}
	else{
		for(var k = 0; k < node[2].length; k++)
		{
			removeBranchesHelper(node[2][k], i, m, j, n);
		}
	}
}

function removeBranchesHelper2(node, j, n) {
	//base cases
	if(node[1] == false)
	{
		return;
	}
	if(node[0][0] == j)
	{
		if(node[0][1] == n)
		{
			node[1] = false; 
		}
		
		return;
	}
	for(var k = 0; k < node[2].length; k++)
	{
		removeBranchesHelper2(node[2][k], j, n);
	}
}

//given that the branches of the tree that represent pairs of sections that do not work are removed, this generates all possible schedules that work
function generateScheduleList(tree) {
	schedule = [];
	scheduleArray = [];
	
	for(var i = 0; i < tree[0].length; i++)
	{
		generateScheduleListHelper(tree[0][i]);
	}
}

function generateScheduleListHelper(node) {
	if(node[1] == false)
	{
		return;
	}
	scheduleArray.push(queryArray[node[0][0] - 1][node[0][1] - 1]);
	var index = scheduleArray.indexOf(queryArray[node[0][0] - 1][node[0][1] - 1]);
	if(node[0][0] == queryArray.length)
	{
		schedules.push(scheduleArray.slice(0)); //pass the array of class sections by value
	}
	else
	{
		for(var i = 0; i < node[2].length; i++)
		{
			generateScheduleListHelper(node[2][i]);
		}
	}
	scheduleArray.splice(index, 1);
}

//removes the edges from the tree that represent a pair if it is in coursePairs
function updateTree(){
	if(queryArray.length == 0)
	{
		return;
	}
	for(var i = 0; i < coursePairs.length; i++)
	{
		removeBranches(courseTree, coursePairs[i][0],coursePairs[i][1],coursePairs[i][2],coursePairs[i][3] )
	}
		
	
}

//Creates every possible combination of class sections as pairs and stores in coursePairs
function createPairs(){
	for(i = 0; i < courses.length - 2; i++)
	{
		for(j = i + 1; j < courses.length - 1; j++)
		{
			for(k = 0; k < queryArray[i].length; k++)
			{
				for(l = 0; l < queryArray[j].length; l++)
				{
					coursePairs.push([i+1,k+1,j+1,l+1])
				}
			}
		}
	}
}

//Removes all of the pairs in coursePairs that conflict, guarenteeing that every pair in coursePairs DOES have a time conflict
function generatePairs(){
	for( i=0; i<queryArray.length-1; i++){
		for( j = i+1; j< queryArray.length; j++){
			for( m = 0; m < queryArray[i].length; m++){
				for( n = 0; n< queryArray[j].length; n++){
					k =0;
					l = 0;
					var checking = true;
					while(checking)
					{
						if(queryArray[i][m].Meetings.length == 0 || queryArray[j][n].Meetings.length == 0)
						{
							checking = false;
							removePairs(i,m,j,n);
						}
						else if(queryArray[i][m].Meetings[k].Day < queryArray[j][n].Meetings[l].Day)
						{
							if(k == queryArray[i][m].Meetings.length-1)
							{
								checking = false;
								removePairs(i,m,j,n);
							}
							else
							{
								k++;
							}
						}
						else if (queryArray[i][m].Meetings[k].Day == queryArray[j][n].Meetings[l].Day)
						{

							checking = noTimeConflict(queryArray[i][m].Meetings[k].StartTime, queryArray[i][m].Meetings[k].EndTime, queryArray[j][n].Meetings[l].StartTime, queryArray[j][n].Meetings[l].EndTime);
							if(checking && (l == queryArray[j][n].Meetings.length-1))
							{
								if(k == queryArray[i][m].Meetings.length-1)
								{
									checking = false;
									removePairs(i,m,j,n);
								}
								else
								{
									k++;
									l = 0;
								}
							}
							else
							{
								l++;
							}
						}
						else
						{
							if(l == queryArray[j][n].Meetings.length - 1 )
							{
								checking = false;
								removePairs(i,m,j,n);
							}
							else
							{
								l++;
							}
						}

					}
				}
			}
		}
	}
}

function removePairs(i,m,j,n){
	for(k = 0; k < coursePairs.length; k++)
	{
		if(coursePairs[k][0] == i+1)
		{
			if(coursePairs[k][1] == m+1)
			{
				if(coursePairs[k][2] == j+1)
				{
					if(coursePairs[k][3] == n+1)
					{
						coursePairs.splice(k,1);
						return
					}
				}
			}
		}
	}
}

function noTimeConflict(st1, et1, st2, et2){
	if(st1 < st2 && et1 < st2)
	{
		return true;
	}
	if(st1 > st2 && et2 < st1)
	{
		return true;
	}
	
	return false;
}

//Start executes the different parts of the application
function start(req,res){
	//when we hit submit, we want to reinitialize our variables for a clean search
	courseTree = [];
	coursePairs = [];
	scheduleArray = []; //one temporary schedule
	schedules = []; //list of all possible schedules
	query1 = {};
	query2 = {};
	query3 = [];
	badDoc = false;


	console.log('lookupCourses');
	lookupCourses(req,res);
	
	setTimeout(function(){
	if(!badDoc)
	{
		setTimeout(function(){
			console.log('courseTree');
			courseTree.push(treeMaker(1))
			console.log('createPairs');
			createPairs();
			console.log('generatePairs');
			generatePairs();	
			},1000);
		setTimeout(function(){
			console.log('updateTree');
			updateTree();
			console.log('generateScheduleList');
			generateScheduleList(courseTree);
		},2000);
	}
	},1000);

}

function lookupCourses(req,res) {
	//resets query3 incase a page has been reloaded.
	query3 = [];

	//this will build an array, query3, that will tell us which days were NOT selected
	if(week[0].length == 0)
		query3.push(0);
	if(week[1].length == 0)
		query3.push(1);
	if(week[2].length == 0)
		query3.push(2);
	if(week[3].length == 0)
		query3.push(3);
	if(week[4].length == 0)
		query3.push(4);
	if(week[5].length == 0)
		query3.push(5);
	
	//connects to the Mongo DB
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {

		// Get the documents collection
		var collection = db.collection('Courses');
		
		//resets the queryArray incase the page has been reloaded
		queryArray = [];
		badDoc = false;

		//querys the database one time for every course entered.
		for(var i = 0; i < courses.length; i++)
		{
				//the subject and course names
				query1['Subj'] = courses[i].subject;
				query2['Crse'] = courses[i].course;

				//Querys the database based on the following parameters:
					//the course name
					//the subject name
					//the meeting days equivalent to what has been selected
				//Projects the follow fields of the result:
					//Subject
					//Course
					//Session
					//Meeting Days
					//Meeting Times
				collection.find({"$and":
				[
					query1,
					query2, 
					{$or:
						[
							{'Meetings.Day' : {$nin: query3}},
							{'Session' : 'Online'}
						]
					}
						
				]},
						{"_id": 0, 
						 "Subj": 1, 
						 "Crse": 1, 
						 "Session": 1,
						 "Sect":1,
						 "Meetings": 1, 
						 "Meetings.Day": 1, 
						 "Meetings.StartTime": 1, 
						 "Meetings.EndTime":1}).toArray(function (err, result) 
				{	
					if (err) {
						console.log(err);
					//If there is a result found
					} else if (result.length) 
					{
						//Will check each timeslot and see if it matches the input criteria
						//If it does NOT match, it will REMOVE from the array
						for(i = result.length - 1; i >= 0; i--)
						{
							verifyAndRemoveCoursesByTime(result[i], result, i);
						}
						
						//add the results to the queryArray
						queryArray.push(result);
						
					} else {
						console.log('No document(s) found with defined "find" criteria!');
						badDoc = true;
					}
				
				});
				
				if(badDoc)
					break;
			}
			
			//Close connection
			db.close();

		
		}
	});
}


app.listen(port);
console.log("server listening on " + port);
