angular.module('firstApp2', ['scheduleService'])

.controller('mainController', function ($http) {

    var vm = this;
    // Set from form
    vm.message = 'AvailableTimes array';
	vm.message2 = 'test';
    vm.errorMessage = '';
	
	// entire array represents a week, each inner array represents a day,
	// each day will hold multiple jsons that have a start time and an end time
    vm.times = [[], [], [], [], [], []]; 
	vm.courses = [];
	
    vm.availableTimes = []; // array that the user is currently adding time frames to 
    vm.day; // current day selected, used to determine which array to add the start and end times

    // form data
    vm.timeData = {};
    vm.dayData = {};
	
	// returned schedule data
	vm.schedules = [];
	
	// test times represents a single schedule
	vm.testTimes = [{
		
	"Subj" : "BIOL",
	"Crse" : "1104",
	"Sect" : "4",
	"Meetings" : [
		{"Type" : "(Lecture)","Day" : "T","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lecture)","Day" : "R","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1700,"EndTime" : 1815,"BuildingRoom" : "SCIENC 234"}
	],
	"Session" : "Day",
	"CRN" : 41722,
	"Title" : "BIOL 1:DIVERS/EVOL/ADAP-RS-LC",
	"Prof" : "Travis Matthew P",
	"Campus" : "Main",
	"Hrs" : 4
	},
	{
	"Subj" : "MATH",
	"Crse" : "1104",
	"Sect" : "4",
	"Meetings" : [
		{"Type" : "(Lecture)","Day" : "T","StartTime" : 110,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lecture)","Day" : "R","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1700,"EndTime" : 1815,"BuildingRoom" : "SCIENC 234"}
	],
	"Session" : "Day",
	"CRN" : 41722,
	"Title" : "BIOL 1:DIVERS/EVOL/ADAP-RS-LC",
	"Prof" : "Travis Matthew P",
	"Campus" : "Main",
	"Hrs" : 4
	},
	{
	"Subj" : "Arch",
	"Crse" : "1104",
	"Sect" : "4",
	"Meetings" : [
		{"Type" : "(Lecture)","Day" : "T","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lecture)","Day" : "R","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1530,"EndTime" : 1645,"BuildingRoom" : "SCIENC 234"},
		{"Type" : "(Lab)","Day" : "W","StartTime" : 1700,"EndTime" : 1815,"BuildingRoom" : "SCIENC 234"}
	],
	"Session" : "Day",
	"CRN" : 41722,
	"Title" : "BIOL 1:DIVERS/EVOL/ADAP-RS-LC",
	"Prof" : "Travis Matthew P",
	"Campus" : "Main",
	"Hrs" : 4
	}];
	
	// current schedule has 
	vm.currentSchedule = [[],[],[],[],[],[], []];
	
    // adds start and end times to the selected day's array of available time frames
    vm.addTimes = function () {
        if (vm.timeData.startTime !== null && vm.timeData.endTime !== null) {
            var sTime = new Date(vm.timeData.startTime);
            var eTime = new Date(vm.timeData.endTime);
            if (sTime < eTime) {
				sTime = vm.changeTimeFormat(sTime);
                eTime = vm.changeTimeFormat(eTime);
                vm.availableTimes.push({
                    startTime: sTime,
                    endTime: eTime
                });
				//vm.message = vm.courses;
		vm.times[vm.day] = vm.combine(vm.availableTimes);
                //vm.timeData = {}; //clears form
                vm.errorMessage = '';
            } else {
                vm.errorMessage = 'Please verify that the start time occurs before the end time.'
            }
        }
		
    };
	
	 vm.addCourses = function () {
        if (vm.courseData.subject != null && vm.courseData.course != null) {
            var s = vm.courseData.subject;
            var c = vm.courseData.course;
            vm.courses.push({
                subject: s,
                course: c
            });
            vm.courseData = {};
            vm.errorMessage = '';
        } else {
            vm.errorMessage = 'Please enter your course subject and course.'
        }
		//vm.message = vm.courses;
    };
	
    // submits week data to backend through a post request, then sets data the 'message'
    vm.submitTimes = function () {
		var weekData = {timesArray: vm.times,
						courseArray: vm.courses};
		// vm.message = weekData;
		// POST request
		$http({
			method: 'POST',
			url: '/process',
			data: weekData,
			headers: {'Content-Type': 'application/json'}
		}).success(function(data){
			// extract "Schedule" array from the returned data and save
			vm.schedules = data;
			vm.setCurrentSchedule(0); // sets current schedule to the first one
			vm.message2 = 'reached'; // temporary return
		});
		vm.message2 = 'not reached';
		//vm.setCurrentSchedule(0);
		
    };
	
	// changes time format to hhmm to be stored in respective arrays
    vm.changeTimeFormat = function (time) {
        return (time.getHours() < 10 ? '0' : '') + time.getHours() + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    };
	
    // Changes the displayed table of times frames
    vm.newDay = function (value) {
        vm.day = value;
        vm.availableTimes = vm.times[value];
        //vm.message = vm.availableTimes;
    };

	
	// source http://stackoverflow.com/questions/26390938/merge-arrays-with-overlapping-values
	vm.combine = function (frames) {
		var result = [];
		
		// sort the array
		frames.sort(function(a,b) {
			a = a.startTime;
			b = b.startTime;
			
			if(a > b){
				return 1; 
			}
			if (b < a) {
				return -1;
			}
			return 0;
			});

		frames.forEach(function(r) {
			if(!result.length || r.startTime > result[result.length-1].endTime)
				result.push(r);
			else
				result[result.length-1].endTime = r.endTime;
		});
		
		return result;		
	};
	
	vm.setCurrentSchedule = function(index){
		//use this one when taking schedules from 
		currentSchedule = [];
		var tempSchedule = vm.schedules[index]; 
		
		//var tempSchedule = vm.testTimes; //to test the single schedule we created
		vm.message = tempSchedule;
		// I'll deal with sorting by times later
		// 1. loop through each class in the schedule to be set
		// [Deleted]
		// 3. loop through the meeting times of that class IF they exist, if no meeting add to index[0] of currentSchedule
		// 4. switch/case 'M', 'T', 'W', 'R', 'F', 'S' to add to index of currentSchedules
		tempSchedule.forEach(function(c){
			var meetings = c.Meetings;
			var tempDay = 0;
			 
			meetings.forEach(function(t){
						
			vm.currentSchedule[t.Day].push({
					Subject: c.Subj,
					sTime: t.StartTime,
					eTime: t.EndTime,
					courseInfo: c
				});
			//vm.message2 = 
			});
		});
	}

});
