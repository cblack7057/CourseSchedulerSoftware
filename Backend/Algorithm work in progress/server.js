//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');
var express = require('express'); // call express
var port = process.env.PORT || 8080; // set the port for our app
var app = express(); // define our app using express
var path = require('path');
var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');

//Arrays used to store all the courses and subjects entered.
var courses = [];
var subjects = [];

//Array used to store all the results after .find() has been ran for each course and subject.
//This is NOT the final array to be printed.
var queryArray = [];

//The number of courses the user would like to enter.
var totalCourses;

//Day of the week variables
var monday;
var tuesday;
var wednesday;
var thursday;
var friday;
var saturday;

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

//Day of the week times (saturday)
var sStartTime1;
var sEndTime1;
var sStartTime2;
var sEndTime2;

//query1 and query2 are course and subject for lookup respectively
//query3 is for day of the week lookup
var query1 = {};
var query2 = {};
var query3 = [];

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://carlind0:123456@ds015334.mlab.com:15334/db_name';

var tree = [];
var coursePairs = [];

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
		lookupCourses(req,res);
		setTimeout(function(){
			tree.push(treeMaker(1));
			createPairs();
			//console.log(coursePairs);
			console.log(tree[0]);
		}, 2000);
		setTimeout(function(){
			generatePairs();
			//console.log(coursePairs);
		}, 5000);
		
		setTimeout(function(){
			res.end(util.inspect({queryArray: queryArray}, {showHidden: false, depth: null}));
		}, 2000);
		
    }
});

//Displays the initial webpage when the webpage is loaded.
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

//Verify that the user has entered the correct data by verifying that the time entered is valid.
//If the day of week is unchecked, we do not even look at the times.
//Takes in the orignial query and will delete any courses that do not meet the time criteria.
function verifyAndRemoveCoursesByTime(course, courseList, index){
	var queriedCourses = course.Meetings;
	
	for(j = 0; j < queriedCourses.length; j++)
			{
				if(queriedCourses[j].StartTime == null)
					return;
				
				switch(queriedCourses[j].Day)
				{
					case 0:
						if(!((mStartTime1 <= queriedCourses[j].StartTime && mEndTime1 >= queriedCourses[j].EndTime) || 
							(mStartTime2 != "none" && mEndTime2 != "none" && (mStartTime2 <= queriedCourses[j].StartTime && mEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
					case 1:
						if(!((tStartTime1 <= queriedCourses[j].StartTime && tEndTime1 >= queriedCourses[j].EndTime) || 
							(tStartTime2 != "none" && tEndTime2 != "none" && (tStartTime2 <= queriedCourses[j].StartTime && tEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
					case 2:
						if(!((wStartTime1 <= queriedCourses[j].StartTime && wEndTime1 >= queriedCourses[j].EndTime) || 
							(wStartTime2 != "none" && wEndTime2 != "none" && (wStartTime2 <= queriedCourses[j].StartTime && wEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
					case 3:
						if(!((rStartTime1 <= queriedCourses[j].StartTime && rEndTime1 >= queriedCourses[j].EndTime) || 
							(rStartTime2 != "none" && rEndTime2 != "none" && (rStartTime2 <= queriedCourses[j].StartTime && rEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
					case 4:
						if(!((fStartTime1 <= queriedCourses[j].StartTime && fEndTime1 >= queriedCourses[j].EndTime) || 
							(fStartTime2 != "none" && fEndTime2 != "none" && (fStartTime2 <= queriedCourses[j].StartTime && fEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
					case 5:
						if(!((sStartTime1 <= queriedCourses[j].StartTime && sEndTime1 >= queriedCourses[j].EndTime) || 
							(sStartTime2 != "none" && sEndTime2 != "none" && (sStartTime2 <= queriedCourses[j].StartTime && sEndTime2 >= queriedCourses[j].EndTime))))
						{
							courseList.splice(index, 1);
							return;
						}
						break;
				}
			}
}

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

function editTree(tree, i, m, j, n) {
	if(i == 1)
	{
		navigateTree(tree[m], i, m, j, n); 
	}
	else
	{
		for(k = 0; k < tree.length; k++)
		{
			navigateTree(tree[k]);
		}
	}
}

function navigateTree(node, i, m, j, n) {
	if(node[1] == false)
	{
		return
	}
	if(node[0][0] == i && node[0][1] == m) 
		{
			for(k = 0; k < node[3].length; k++)
			{
				recursiveTreeChange(node[3][k], j, n);
			}
		}
	for(k = 0; k < node[3].length; k++)
	{
		navigateTree(node[3][k], i, m, j, n);
	}
}

function recursiveTreeChange(node, j, n) {
	//base cases
	if(node[1] == false)
	{
		return;
	}
	if(node[0][0] == j && node[0][1] == n)
	{
		node[1] = false;
		return; 
	}
	for(k = 0; k < node[3].length; k++)
	{
		recursiveTreeChange(node[3][k], j, n);
	}
}

function createPairs(){
	for(i = 0; i < totalCourses - 1; i++)
	{
		for(j = i + 1; j < totalCourses; j++)
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
						if(queryArray[i][m].Meetings.length == 0 || queryArray[j][n].length == 0)
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
	
	//console.log('in noTimeConflict');
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

function lookupCourses(req,res) {
	//Store the data from the fields in your data store.
    var fields = [];
	courses = [];
	subjects = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    form.on('end', function () {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
		
		//total number of courses the user entered
		totalCourses = parseInt(fields["totalCourses"]);
		
		//stores the entered courses and subjects into an array.
		for(i = 0; i < totalCourses; i++){
			courses.push(fields['course' + i]);
			subjects.push(fields['subject' + i]);
			
			//console.log(courses);
			//console.log(subjects);
		}
		
		//assigns the day of the week fields. 
		//It will assign a null value if the field was not checked.
		monday = fields["monday"];
		tuesday = fields["tuesday"];
		wednesday = fields["wednesday"];
		thursday = fields["thursday"];
		friday = fields["friday"];
		saturday = fields["saturday"];
		
		//assigns the start and end time for the four drop down boxes for Monday.
		mStartTime1 = fields["mondayStartTimeDropDown1"];
		mEndTime1 = fields["mondayEndTimeDropDown1"];
		mStartTime2 = fields["mondayStartTimeDropDown2"];
		mEndTime2 = fields["mondayEndTimeDropDown2"];
		
		//assigns the start and end time for the four drop down boxes for Tuesday.
		tStartTime1 = fields["tuesdayStartTimeDropDown1"];
		tEndTime1 = fields["tuesdayEndTimeDropDown1"];
		tStartTime2 = fields["tuesdayStartTimeDropDown2"];
		tEndTime2 = fields["tuesdayEndTimeDropDown2"];
		
		//assigns the start and end time for the four drop down boxes for Wednesday.
		wStartTime1 = fields["wednesdayStartTimeDropDown1"];
		wEndTime1 = fields["wednesdayEndTimeDropDown1"];
		wStartTime2 = fields["wednesdayStartTimeDropDown2"];
		wEndTime2 = fields["wednesdayEndTimeDropDown2"];
		
		//assigns the start and end time for the four drop down boxes for Thursday.
		rStartTime1 = fields["thursdayStartTimeDropDown1"];
		rEndTime1 = fields["thursdayEndTimeDropDown1"];
		rStartTime2 = fields["thursdayStartTimeDropDown2"];
		rEndTime2 = fields["thursdayEndTimeDropDown2"];
		
		//assigns the start and end time for the four drop down boxes for Friday.
		fStartTime1 = fields["fridayStartTimeDropDown1"];
		fEndTime1 = fields["fridayEndTimeDropDown1"];
		fStartTime2 = fields["fridayStartTimeDropDown2"];
		fEndTime2 = fields["fridayEndTimeDropDown2"];
		
		//assigns the start and end time for the four drop down boxes for Saturday.
		sStartTime1 = fields["saturdayStartTimeDropDown1"];
		sEndTime1 = fields["saturdayEndTimeDropDown1"];
		sStartTime2 = fields["saturdayStartTimeDropDown2"];
		sEndTime2 = fields["saturdayEndTimeDropDown2"];
		
		//resets query3 incase a page has been reloaded.
		query3 = [];
		
		//this will build an array, query3, that will tell us which days were NOT selected
		if(monday != 0)
			query3.push(0);
		if(tuesday != 1)
			query3.push(1);
		if(wednesday != 2)
			query3.push(2);
		if(thursday != 3)
			query3.push(3);
		if(friday != 4)
			query3.push(4);
		if(saturday != 5)
			query3.push(5);
    });
    
	form.parse(req);
	
	//connects to the Mongo DB
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

		// Get the documents collection
		var collection = db.collection('Courses');
		
		//resets the queryArray incase the page has been reloaded
		queryArray = [];
		
		//querys the database one time for every course entered.
		for(i = 0; i < totalCourses; i++){
			//the subject and course names
			query1['Subj'] = subjects[i];
			query2['Crse'] = courses[i];

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
					//console.log('Found:', result);
					
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
				}
			
			});
		}
		
		//Close connection
		db.close();

		
		}
	});
}

server.listen(port);
console.log("server listening on " + port);