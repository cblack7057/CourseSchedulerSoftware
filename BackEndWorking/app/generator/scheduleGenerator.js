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
	
	return new Promise(function(resolve, reject) {
		var schedules;
		var notFoundCourses;
		console.log('connecting to mongoclient');
		MongoClient.connect(config.database)
		.then(function(db) {
			console.log('connection completed');
			console.log('retrieving collection Courses from database');
			return db.collection('Courses').find(query,projection)
		})
		.then(function(cursor) {
			console.log('query completed');
			console.log('changing cursor to array');
			return cursor.toArray()
		})
		.then(function(arr) {
			console.log('successfully converted result to an array');
			console.log('removing sections by time');
			var sections = removeSectionsByTime(arr);
			console.log('sections removed');
			console.log('sort sections by courses');
			var courseArray = sortSectionsByCourses(sections);
			console.log('sections sorted');
			console.log('create list of courses not found')
			notFoundCourses = coursesNotFound(courses, courseArray);
			console.log('list created');
			console.log('creating pairs');
			var sectionPairs = createPairs(courseArray);
			console.log('pairs created');
			console.log('removing conflictng pairs');
			removeNonconflictingPairs(courseArray, sectionPairs);
			console.log('conflicting pairs removed');
			console.log('create tree');
			var courseTree = treeMaker(courseArray);
			console.log('tree made');
			console.log('update tree');
			updateTree(courseArray, sectionPairs, courseTree);
			console.log('tree updated');
			console.log('generate schedules');
			schedules = generateSchedulesList(courseArray, courseTree);
			console.log('schedules generated');
			console.log(schedules);
			resolve([schedules, coursesNotFound]);
		}).catch(function(err) {
			reject(err);
		});
	});
	
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

	function coursesNotFound(courses, courseArray) {
		var notFoundCourses = [];
		var found = false;
		if(courses.length > courseArray.length)
			for(var i = 0; i < courses.length; i++) {
				for(var j = 0; j < courseArray.length; j++) {
					if(courses[i].subject === courseArray[j][0].Subj && courses[i].course === courseArray[j][0].Crse) {
						found = true;
						break;
					}
				}
				if(!found)
					notFoundCourses.push(courses[i]);
				found = false;
			}
		return notFoundCourses;
	}

	//creates a listing of every possible pair of courses from the course array
	function createPairs(courseArray) {
		var sectionPairs = [];
		for(var i = 0; i < courseArray.length - 1; i++)
			for(var j = 0; j < courseArray[i].length; j++)
				for(var k = i + 1; k < courseArray.length; k++)
					for(var l = 0; l < courseArray[k].length; l++)
						sectionPairs.push([i+1,j+1,k+1,l+1]);
		return sectionPairs
        }

	//remove pairs from sectionPairs based on the time conflicts of the courses in courseArray
	function removeNonconflictingPairs(courseArray, sectionPairs){
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
								removePair(sectionPairs, i, m, j, n)
							}
							else if(courseArray[i][m].Meetings[k].Day < courseArray[j][n].Meetings[l].Day) {
								if(k == courseArray[i][m].Meetings.length-1) {
									checking = false;
									removePair(sectionPairs, i, m, j, n);
								}
								else
									k++;
								}
							else if(courseArray[i][m].Meetings[k].Day == courseArray[j][n].Meetings[l].Day) {
								checking = noTimeConflict(courseArray[i][m].Meetings[k].StartTime, courseArray[i][m].Meetings[k].EndTime, courseArray[j][n].Meetings[l].StartTime, courseArray[j][n].Meetings[l].EndTime);
								if(checking && (l == courseArray[j][n].Meetings.length - 1)) {
									if(k == courseArray[i][m].Meetings.length - 1) {
                                        checking = false;
                                        removePair(sectionPairs, i, m, j, n);
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
									removePair(sectionPairs, i, m, j, n);
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

	function removePair(sectionPairs, i, m, j, n){
 		for(var k = 0; k < sectionPairs.length; k++)
			if(sectionPairs[k][0] == i + 1)
				if(sectionPairs[k][1] == m + 1)
					if(sectionPairs[k][2] == j + 1)
						if(sectionPairs[k][3] == n + 1) {
							sectionPairs.splice(k,1);
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
		return (treeMakerHelper(courseArray, 1));
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


	function updateTree(courseArray, sectionPairs, courseTree){
		if(courseArray.length == 0)
			return;
		for(var i = 0; i < sectionPairs.length; i++)
		{
			//console.log('' + sectionPairs[i][0] + sectionPairs[i][1] + ", " + sectionPairs[i][2] + sectionPairs[i][3] );
			removeBranches(courseTree, sectionPairs[i][0], sectionPairs[i][1], sectionPairs[i][2], sectionPairs[i][3]);
		}
	}

	//removes the branches of the tree that have edges that represent pairs found in sectionPairs

	function removeBranches(tree, i, m, j, n) {
		if(i == 1)
			removeBranchesHelper2(tree[m-1], j, n);
		else
			for(var k = 0; k < tree.length; k++)
				removeBranchesHelper(tree[k], i, m, j, n);
	}

	function removeBranchesHelper(node, i, m, j, n) {
		if(node[1] == false)
			return;
		if(node[2][0][0][0] == i)
			removeBranchesHelper2(node[2][m-1], j, n);
		else
			for(var k = 0; k < node[2].length; k++)
				removeBranchesHelper(node[2][k], i, m, j, n);
	}

	function removeBranchesHelper2(node, j, n) {
		if(node[1] == false)
			return;
		if(node[2][0][0][0] == j){
			node[2][n-1][1] = false;
			return;
		}
		for(var k = 0; k < node[2].length; k++)
			removeBranchesHelper2(node[2][k], j, n);
	}

	function generateSchedulesList(courseArray, courseTree) {
		var schedules = [];
		var schedule = [];
		for(var i = 0; i < courseTree.length; i++) {
			schedule.push(courseArray[0][i]);
			generateScheduleListHelper(courseTree[i], schedule, schedules,courseArray);
			schedule.splice(-1);
		}
		return schedules;
	}

	function generateScheduleListHelper(node, schedule, schedules, courseArray) {
		for(var i = 0; i < node[2].length; i++) {
			if(node[2][i][1]) {
				schedule.push(courseArray[node[2][i][0][0] - 1][node[2][i][0][1] - 1]);
				if(node[2][i].length == 2)
					schedules.push(schedule.slice());
				else
					generateScheduleListHelper(node[2][i], schedule, schedules, courseArray);
				schedule.splice(-1);
			}
		}
	}
}

