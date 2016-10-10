module.exports = function(week, courses, mongodb, config, callback) {
	//We need to work with "MongoClient" interface in order to connect to a mongodb server.
	var MongoClient = mongodb.MongoClient;
	
	var coursesQuery = {};
	var orArr = [];

	for(var i = 0; i < courses.length; i++) {
        	var courseANDSubjectQuery = {'$and': [{'Subj': courses[i].subject}, {'Crse': courses[i].course}]};
        	orArr.push(courseANDSubjectQuery);
	}

	coursesQuery['$or'] = orArr;
	var weekQuery = {};
	var badDaysQuery = [];
	
	if(week[0].length == 0)
		badDaysQuery.push(0);
	if(week[1].length == 0)
		badDaysQuery.push(1);
	if(week[2].length == 0)
		badDaysQuery.push(2);
	if(week[3].length == 0)
		badDaysQuery.push(3);
	if(week[4].length == 0)
		badDaysQuery.push(4);
	if(week[5].length == 0)
		badDaysQuery.push(5);
	
	weekQuery['$or'] = [{'Meetings.Day': {'$nin': badDaysQuery}}, {'Session': 'Online'}];
	
	query = {};
	query['$and'] = [coursesQuery, weekQuery];
	
	projection = {"_id": 0, "Subj": 1, "Crse": 1, "Session": 1, "Sect":1, "CRN": 1, "Title": 1, "Prof": 1, "Campus": 1, "Hrs": 1, "Meetings": 1, "Meetings.Day": 1, "Meetings.StartTime": 1, "Meetings.EndTime":1};

	console.log('connecting to mongoclient');
	getSchedules(function() {
		MongoClient.connect(config.database, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			}
			else {
				console.log('connection completed');
				console.log('getting collection from database');
				db.collection('Courses', function(err, collection) {
					if(err) {
						console.log('error getting the collection from the database');
					}
					else {
						console.log('got collection from database');
						console.log('finding courses based on queries');
						collection.find(query, projection).toArray(function(err, result) {
							if(err) {
								console.log('error in finding stuff');
							}
							else {
								console.log('collection.find worked correctly');
								console.log('removing sections by time');
								var sections = removeSectionsByTime(result);
								console.log('sections removed');
								console.log('sort sections by courses');
								var courseArray = sortSectionsByCourses(sections);
								console.log('sections sorted');
								console.log('creating pairs');
								var coursePairs = createPairs(courseArray);
								console.log('pairs created');
								console.log('removing conflictng pairs');
								removeConflictingPairs(courseArray, coursePairs);
								console.log('conflicting pairs removed');
								console.log('create tree');
								var courseTree = treeMaker(courseArray);
								console.log('tree made');
								console.log('update tree');
								updateTree(courseArray, coursePairs, courseTree);
								console.log('tree updated');
								console.log('generate schedules');
								schedules = generateSchedulesList(courseArray, courseTree);
								callback();
							}
						});
					}
				});
			}		
		});
	});
	

	function getSchedules(callback) {
		var schedules;
		callback();
	}
	
	function removeSectionsByTime(sections) {
		//loop through each section in the resultant array and remove if it is not at a good time
		for(var i = sections.length - 1; i >= 0; i--) {
			meetings = sections[i].Meetings;
			for(var j = 0; j < meetings.length; j++) {
				//check if the class has a meeting time for this day
				if(meetings[j].StartTime == null)
					break;
				switch(meetings[j].Day) {
				case 0:
					for(var k = 0; k < week[0].length; k++)
						if(week[0][k].StartTime > meetings[j].StartTime ||
						week[0][k].EndTime < meetings[j].EndTime) {
							sections.splice(i, 1);
							j = meetings.length; //this will break us out of the j loop
							break;
						}
					break;
				case 1:
                                        for(var k = 0; k < week[1].length; k++)
                                                if(week[1][k].StartTime > meetings[j].StartTime ||
                                                week[1][k].EndTime < meetings[j].EndTime) {
                                                        sections.splice(i, 1);
                                                        j = meetings.length; //this will break us out of the j loop
                                                        break;
                                                }
                                        break;
				case 2:
                                        for(var k = 0; k < week[2].length; k++)
                                                if(week[2][k].StartTime > meetings[j].StartTime ||
                                                week[2][k].EndTime < meetings[j].EndTime) {
                                                        sections.splice(i, 1);
                                                        j = meetings.length; //this will break us out of the j loop
                                                        break;
                                                }
                                        break;
				case 3:
                                        for(var k = 0; k < week[3].length; k++)
                                                if(week[3][k].StartTime > meetings[j].StartTime ||
                                                week[3][k].EndTime < meetings[j].EndTime) {
                                                        sections.splice(i, 1);
                                                        j = meetings.length; //this will break us out of the j loop
                                                        break;
                                                }
                                        break;
				case 4:
                                        for(var k = 0; k < week[4].length; k++)
                                                if(week[4][k].StartTime > meetings[j].StartTime ||
                                                week[4][k].EndTime < meetings[j].EndTime) {
                                                        sections.splice(i, 1);
                                                        j = meetings.length; //this will break us out of the j loop
                                                        break;
                                                }
                                        break;
				case 5:
                                        for(var k = 0; k < week[5].length; k++)
                                                if(week[5][k].StartTime > meetings[j].StartTime ||
                                                week[5][k].EndTime < meetings[j].EndTime) {
                                                        sections.splice(i, 1);
                                                        j = meetings.length; //this will break us out of the j loop
                                                        break;
                                                }
                                        break;				
				}
			}
		}
		return sections;
	}
	
	function sortSectionsByCourses(sections) {
		var courseArray = [];
		var found = false;
		if(sections.length > 0)
			courseArray.push([sections[0]]);
		for(var i = 1; i < sections.length; i++) {
			found = false;
			for(var j = 0; j < courseArray.length; j++) {
				if(sections[i].Subj === courseArray[j][0].Subj && sections[i].Crse === courseArray[j][0].Crse) {
					courseArray[j].push(sections[i]);
					found = true;
					break;
				}
			}
			if(found == false)
				courseArray.push([sections[i]]);
		}
		return courseArray;
	}

	//creates a listing of every possible pair of courses from the course array
	function createPairs(courseArray) {
		var coursePairs = [];
		for(var i = 0; i < courseArray.length - 2; i++)
			for(var j = i + 1; j < courseArray.length - 1; j++)
				for(var k = 0; k < courseArray[i].length; k++)
					for(var l = 0; l < courseArray[j].length; l++)
						coursePairs.push([i+1,k+1,j+1,l+1]);
		return coursePairs
        }

	//remove pairs from coursePairs based on the time conflicts of the courses in courseArray
	function removeConflictingPairs(courseArray, coursePairs){
		for(var i = 0; i < courseArray.length - 1; i++) {
			for(var j = i + 1; j < courseArray.length; j++) {
				for(var m = 0; m < courseArray[i].length; m++) {
					for(var n = 0; n < courseArray[j].length; n++) {
						var k = 0;
						var l = 0;
						var checking = true;
						while(checking) {
							if(courseArray[i][m].Meetings.length == 0 || courseArray[j][n].Meetings.length == 0) {
								checking = false;
								removePair(coursePairs, i, m, j, n)
							}
							else if(courseArray[i][m].Meetings[k].Day < courseArray[j][n].Meetings[l].Day) {
								if(k == courseArray[i][m].Meetings.length-1) {
									checking = false;
									removePair(coursePairs, i, m, j, n);
								}
								else
									k++;
								}
							else if(courseArray[i][m].Meetings[k].Day == courseArray[j][n].Meetings[l].Day) {
								checking = noTimeConflict(courseArray[i][m].Meetings[k].StartTime, courseArray[i][m].Meetings[k].EndTime, courseArray[j][n].Meetings[l].StartTime, courseArray[j][n].Meetings[l].EndTime);
								if(checking && (l == courseArray[j][n].Meetings.length - 1)) {
									if(k == courseArray[i][m].Meetings.length - 1) {
                                                                                checking = false;
                                                                                removePair(coursePairs, i, m, j, n);
									}
									else {
										k++;
										l = 0;
									}
								}
								else
									l++;
							}
							else {
								if(l == courseArray[j][n].Meetings.length - 1 ) {
									checking = false;
									removePair(coursePairs, i, m, j, n);
								}
								else
									l++;
							}
						}
					}
				}
			}
		}
	}

	function removePair(coursePairs, i, m, j, n){
 		for(var k = 0; k < coursePairs.length; k++)
			if(coursePairs[k][0] == i + 1)
				if(coursePairs[k][1] == m + 1)
					if(coursePairs[k][2] == j + 1)
						if(coursePairs[k][3] == n + 1) {
							coursePairs.splice(k,1);
							return
						}
	}

	function noTimeConflict(st1, et1, st2, et2) {
		if(st1 < st2 && et1 < st2)
			return true;
		if(st1 > st2 && et2 < st1)
			return true;
		return false;
	}

	function treeMaker(courseArray) {
		var courseTree = [];
		courseTree.push(treeMakerHelper(courseArray, 1));
		return courseTree;
	}
	//creates a tree with each edge between nodes representing a pair of section
	function treeMakerHelper(courseArray, level) {
		//base cases
		var row = [];
		if(courseArray.length == 0)
			return row;
		if(level == courseArray.length) {
			for(var i = 0; i < courseArray[level-1].length; i++)
				row.push([[level, i + 1], true]);
			return row;
		}
		for(var i = 0; i < courseArray[level-1].length; i++)
			row.push([[level, i + 1], true, treeMakerHelper(courseArray, level + 1)]);
		return row;
	}


	function updateTree(courseArray, coursePairs, courseTree){
		if(courseArray.length == 0)
			return;
		for(var i = 0; i < coursePairs.length; i++)
			removeBranches(courseTree, coursePairs[i][0], coursePairs[i][1], coursePairs[i][2], coursePairs[i][3]);
	}

	//removes the branches of the tree that have edges that represent pairs found in coursePairs

	function removeBranches(tree, i, m, j, n) {
		if(i == 1)
			removeBranchesHelper2(tree[0][m-1], j, n);
		else
			for(var k = 0; k < tree[0].length; k++)
				removeBranchesHelper(tree[0][k], i, m, j, n);
	}

	function removeBranchesHelper(node, i, m, j, n) {
		if(node[1] == false)
			return;
		if(node[0][0] == i)
			if(node[0][1] == m)
				for(var k = 0; k < node[2].length; k++)
					removeBranchesHelper2(node[2][k], j, n);
		else
			for(var k = 0; k < node[2].length; k++)
				removeBranchesHelper(node[2][k], i, m, j, n);
	}

	function generateSchedulesList(courseArray, courseTree) {
		var schedules = [];
		schedule = [];
		for(var i = 0; i < courseTree[0].length; i++)
			generateScheduleListHelper(schedules, schedule, courseArray,  courseTree[0][i]);
		return schedules;

	}

	function generateScheduleListHelper(schedules, schedule, courseArray, node) {
		if(node[1] == false)
			return;
		schedule.push(courseArray[node[0][0] - 1][node[0][1] - 1]);
		var index = schedule.indexOf(courseArray[node[0][0] - 1][node[0][1] - 1]);
		if(node[0][0] == courseArray.length)
			schedules.push(schedule.slice(0)); //pass the array of class sections by value
		else
			for(var i = 0; i < node[2].length; i++)
				generateScheduleListHelper(schedules, schedule, courseArray, node[2][i]);
		schedule.splice(index, 1);
	}
}

