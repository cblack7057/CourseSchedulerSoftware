angular.module('firstApp2', ['scheduleService'])

.controller('mainController', function ($http) {

    var vm = this;
    // Set from form
    vm.message = 'AvailableTimes array';
    vm.message2 = 'test';
    vm.errorMessageTimes = '';
	vm.errorMessageCourses = '';
	vm.timeIntervals = ['8:00am', '8:30am', '9:00am', '9:30am', '10:00am', '10:30am', '11:00am', '11:30am', '12:00pm', '12:30pm', '1:00pm', '1:30pm', '2:00pm', '2:30pm', '3:00pm', '3:30pm', '4:00pm', '4:30pm', '5:00pm', '5:30pm', '6:00pm', '6:30pm', '7:00pm', '7:30pm', '8:00pm', '8:30pm', '9:00pm', '9:30pm', '10:00pm', '10:30pm'];
	vm.classIntervals = ['8:00am', '9:30am', '11:00am', '12:30pm', '2:00pm', '3:30pm', '5:00pm', '6:30pm', '8:00pm', '9:30pm']
	
    // entire array represents a week, each inner array represents a day,
    // each day will hold multiple jsons that have a start time and an end time
    vm.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    vm.times = [[], [], [], [], [], []];
    vm.courses = [];
    vm.semester;

    vm.availableTimes = []; // array that the user is currently adding time frames to 
    vm.day; // current day selected, used to determine which array to add the start and end times

    // form data
    vm.timeData = {};
    vm.dayData = {};
    vm.courseData = {};
    vm.choices = ["Fall2016","Spring2017"];
	vm.modalCourseData = null;
    // returned schedule data
    vm.schedules = [];
	
    // test times represents a single schedule

    // current schedule has 
    vm.currentSchedule = [[], [], [], [], [], [], []];
    vm.currentScheduleIndex = 0; //In the event we wish to locate a specific schedule, we need this
	///////--------------CHANGES: display Time
    // adds start and end times to the selected day's array of available time frames
    vm.addTimes = function () {
        if (vm.timeData.StartTime !== null && vm.timeData.EndTime !== null) {
            var sTime = new Date(vm.timeData.StartTime);
            var eTime = new Date(vm.timeData.EndTime);
            if (sTime < eTime) {
                sCTime = vm.changeTimeFormat(sTime);
                eCTime = vm.changeTimeFormat(eTime);
                vm.availableTimes.push({
					dispStartTime: sTime,
					dispEndTime: eTime,
                    StartTime: sCTime,
                    EndTime: eCTime
                });
                //vm.message = vm.courses;
                vm.times[vm.day] = vm.combine(vm.availableTimes);
                //vm.timeData = {}; //clears form
                vm.errorMessageTimes = '';
            } else {
                vm.errorMessageTimes = 'Please verify that the start time occurs before the end time.'
            }
        }

    };
	
	vm.allDay = function() {
		vm.availableTimes.push({
					dispStartTime: "12:00 AM",
					dispEndTime: "11:59 PM",
                    StartTime: 0000,
                    EndTime: 2359
                });
		vm.times[vm.day] = vm.combine(vm.availableTimes);
	};
	
	vm.testCourses = function(){
		var s = 'CS';
		vm.courses.push({
                subject: 'CS',
                course: '06310'
            });
			vm.courses.push({
                subject: 'CS',
                course: '07320'
            });
			vm.courses.push({
                subject: s.toUpperCase(),
                course: '07321'
            });
			vm.courses.push({
                subject: s.toUpperCase(),
                course: '04400'
            });
			vm.courses.push({
                subject: s.toUpperCase(),
                course: '04560'
            });
			vm.courses.push({
                subject: s.toUpperCase(),
                course: '06311'
            });
			vm.courses.push({
                subject: s.toUpperCase(),
                course: '06510'
            });
			for(var i = 0; i < 6; i++){
			vm.availableTimes.push({
					dispStartTime: "12:00 AM",
					dispEndTime: "11:59 PM",
                    StartTime: 0000,
                    EndTime: 2359
                });
		vm.times[i] = vm.combine(vm.availableTimes);
		};
		vm.semester = 'Fall2016';
		vm.submitTimes();
	};
	vm.addCourses = function () {

	    if (vm.courseData.subject != null && vm.courseData.course != null) {
	        var s = vm.courseData.subject;
	        var c = vm.courseData.course;
	        vm.courses.push({
	            subject: s.toUpperCase(),
	            course: c
	        });
	        vm.courseData = {};
	        vm.errorMessageCourses = '';
	    } else {
	        vm.errorMessageCourses = 'Please enter your course subject and course.'
	    }
	    //vm.message = vm.courses;
	};

    vm.removeTimes = function (index, parentIndex) {
        vm.times[parentIndex].splice(index, 1);
    }

    vm.removeCourses = function (index) {
        vm.courses.splice(index, 1);
    }

    // submits week data to backend through a post request, then sets data the 'message'
    vm.submitTimes = function () {
        vm.currentScheduleIndex = 0;
        var weekData = {
            term: vm.semester,
            timesArray: vm.times,
            courseArray: vm.courses
        };
         //vm.message = weekData.term;
        // POST request
        $http({
            method: 'POST',
            url: 'api/process',
            data: weekData,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            // extract "Schedule" array from the returned data and save
            vm.schedules = data;
            vm.setCurrentSchedule(vm.currentScheduleIndex); // sets current schedule to the first one
            //vm.message2 = data; // temporary return
        });
        //vm.message2 = 'not reached';
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
        frames.sort(function (a, b) {
            a = a.StartTime;
            b = b.StartTime;

            if (a > b) {
                return 1;
            }
            if (b < a) {
                return -1;
            }
            return 0;
        });

        frames.forEach(function (r) {
            if (!result.length || r.StartTime > result[result.length - 1].EndTime)
                result.push(r);
            else
                result[result.length - 1].EndTime = r.EndTime;
        });

        return result;
    };

    vm.setCurrentSchedule = function (scheduleIndex) { //schduleIndex = index of schedule you wish to set as current
        //use this one when taking schedules from 
        vm.currentSchedule = [[], [], [], [], [], [], []];
        var tempSchedule = vm.schedules[scheduleIndex];

        //var tempSchedule = vm.testTimes; //to test the single schedule we created
      //  vm.message = tempSchedule;
        // I'll deal with sorting by times later
        // 1. loop through each class in the schedule to be set
        // [Deleted]
        // 3. loop through the meeting times of that class IF they exist, if no meeting add to index[0] of currentSchedule
        // 4. switch/case 'M', 'T', 'W', 'R', 'F', 'S' to add to index of currentSchedules
		var tSData;
		var tEData;
		var meetings;
		var tempDay;
        tempSchedule.forEach(function (c) {
            meetings = c.Meetings;
            tempDay = 0;
			
            meetings.forEach(function (t) {
				tSData = vm.getVisualTime(t.StartTime);
				tEData = vm.getVisualTime(t.EndTime);
                vm.currentSchedule[t.Day].push({
                    Subject: c.Subj + ' ' + c.Crse,
                    sTime: tSData.Hours + ':' + tSData.Minutes+ tSData.Period,
                    eTime: tEData.Hours + ':' + tEData.Minutes+ tEData.Period,
                    courseInfo: c
                });
                //vm.message2 = 
            });
        });
		//vm.message = vm.currentSchedule;
    }

    vm.showNextSchedule = function () {
       // if (vm.currentScheduleIndex< vm.schedules.length) { //why not if(currentIndex < vm.schedules.len)?
            vm.currentScheduleIndex++;
            vm.setCurrentSchedule(vm.currentScheduleIndex);
        //};
		//CR
	};
    vm.showPrevSchedule = function () {
        //if (vm.currentScheduleIndex > 0)) {
            vm.currentScheduleIndex--;
            vm.setCurrentSchedule(vm.currentScheduleIndex);
       // };
    };
		
	// extracts hours, minutes, period from military time
	vm.getVisualTime = function (time){
		var hours = Math.round(time / 100) % 12;
		var minutes = (time % 100 == 0 ? '00' : time % 100);
		var period = (time >= 1200? 'pm' : 'am');
		return {
			Hours: (hours == 0? 12: hours),
			Minutes: minutes,
			Period: period
		};
	};

});
