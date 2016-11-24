angular.module('scheduler.controllers', ['scheduler.services'])

.controller('DashCtrl', function($scope) {})
.controller('InputScheduleCtrl', function ($scope, $http, scheduleService) {

    var vm = $scope;
    // Set from form
    vm.message = 'AvailableTimes array';
    vm.message2 = 'test';
    vm.errorMessageTimes = '';
	vm.errorMessageCourses = '';

    // entire array represents a week, each inner array represents a day,
    // each day will hold multiple jsons that have a start time and an end time
    vm.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    vm.times = [[], [], [], [], [], []];

    vm.courses = [];

    vm.availableTimes = []; // array that the user is currently adding time frames to
    vm.day; // current day selected, used to determine which array to add the start and end times

    // form data
    vm.timeData = {};
    vm.dayData = {};
    vm.courseData = {};

    // returned schedule data
    vm.schedules = [];

    // test times represents a single schedule

    // current schedule has
    vm.currentSchedule = [[], [], [], [], [], [], []];
    vm.currentScheduleIndex = 0; //In the event we wish to locate a specific schedule, we need this

    vm.getVisualTime = function (time){
  		var hours = Math.round(time / 100) % 12;
  		var minutes = (time % 100 == 0 ? '00' : time % 100);
  		var period = (time >= 1200? 'pm' : 'am');
  		return {
  			Hours: hours,
  			Minutes: minutes,
  			Period: period
  		};
  	};

    vm.removeTime = function(index) {
      vm.availableTimes.splice(index, 1);
    }

    //add a new time slot with default values
    vm.addNewTime = function () {
      var sDate = new Date();
      sDate.setHours(0);
      sDate.setMinutes(0);
      var eDate = new Date();
      eDate.setHours(23);
      eDate.setMinutes(59);
      vm.availableTimes.push({
        startTime: 0000,
        endTime: 2359,
        dispStartTime: sDate,
        dispEndTime: eDate
      });
    }
  vm.slideNames = ["Add Times", "Add Courses"];
  vm.slideName = vm.slideNames[0];
  vm.slideHasChanged = function($index) {
    vm.slideName = vm.slideNames[$index];
  }

  //sets the time range for the day at the given index to all day
  vm.allDay = function(timesIndex) {
    var sDate = new Date();
    sDate.setHours(0);
    sDate.setMinutes(0);
    var eDate = new Date();
    eDate.setHours(23);
    eDate.setMinutes(59);
    vm.times[timesIndex] = [{
        startTime: 0000,
        endTime: 2359,
        dispStartTime: sDate,
        dispEndTime: eDate
                }];
  }

  for (i = 0; i < vm.times.length; i++) {
    vm.allDay(i);
  }
  /*Don't use, mobile app uses direct access as opposed to set day, then set local array reference
  vm.allDay = function() {
		vm.availableTimes.push({
					dispStartTime: "12:00 AM",
					dispEndTime: "11:59 PM",
                    StartTime: 0000,
                    EndTime: 2359
                });
		vm.times[vm.day] = vm.combine(vm.availableTimes);
	};*/
    vm.addCourse = function() {
      vm.courses.push({})
    }

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
            timesArray: vm.times,
            courseArray: vm.courses
        };
        vm.message = weekData;
        scheduleService.onStartProcessing();
        // vm.message = weekData;
        // POST request
        $http({
            method: 'POST',
            url: 'http://localhost:8080/api/process',
            data: weekData,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            // extract "Schedule" array from the returned data and save
            //vm.schedules = data;
            //vm.message2 = data;
            //scheduleService.onFinishProcessing(data);
            //vm.setCurrentSchedule(vm.currentScheduleIndex); // sets current schedule to the first one
            scheduleService.onFinishProcessing(data);


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

})
.controller('SelectScheduleCtrl', function($scope, scheduleService) {
  var sm = $scope;
  sm.setupSlider = function() {
    //some options to pass to our slider
    sm.data = {};
    sm.data.currentPage = 0;
    sm.data.sliderOptions = {
      initialSlide: 0,
      direction: 'horizontal', //or vertical
      speed: 300 //0.3s transition
    };

    //create delegate reference to link with slider
    sm.data.sliderDelegate = null;


    //watch our sliderDelegate reference, and use it when it becomes available
    sm.$watch('data.sliderDelegate', function(newVal, oldVal) {
      if (newVal != null) {
        sm.data.sliderDelegate.on('slideChangeEnd', function() {
          sm.data.currentPage = sm.data.sliderDelegate.activeIndex;
          bufferLength = 3;
          if(sm.data.currentPage >= sm.daySchedules.length - bufferLength - 1) {
            for(i = sm.data.currentPage; i < sm.data.currentPage + bufferLength && i < sm.schedules.length; i++) {
              sm.formatScheduleData(i);
            }
          }
          //use $scope.$apply() to refresh any content external to the slider
          sm.$apply();
        });
      }
    });
  };

  sm.setupSlider();

  sm.schedules;
  sm.currentScheduleIndex = 0;
  sm.waiting = true;
  sm.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Any Time'];

  sm.daySchedules = [];

  sm.crnLists = [];

  sm.setCurrentSchedule = function (scheduleIndex) { //schduleIndex = index of schedule you wish to set as current
        //use this one when taking schedules from
        sm.currentSchedule = [[], [], [], [], [], [], []];
        var tempSchedule = sm.schedules[scheduleIndex];

        //var tempSchedule = vm.testTimes; //to test the single schedule we created
        sm.message = tempSchedule;
        // I'll deal with sorting by times later
        // 1. loop through each class in the schedule to be set
        // [Deleted]
        // 3. loop through the meeting times of that class IF they exist, if no meeting add to index[0] of currentSchedule
        // 4. switch/case 'M', 'T', 'W', 'R', 'F', 'S' to add to index of currentSchedules
		var tSData;
		var tEData;
		var meetings;
        tempSchedule.forEach(function (c) {
            meetings = c.Meetings;
            //checks to see if there is an online course in the user's input, and adds it if there is
            if(meetings.length == 0){
                meetings = [{
                    Type: "Online",
                    Day: 6,
                    StartTime: 0000,
                    EndTime: 0000,
                    BuildingRoom: "Online"
                }];

            }

            meetings.forEach(function (t) {
				tSData = sm.getVisualTime(t.StartTime);
				tEData = sm.getVisualTime(t.EndTime);
                sm.currentSchedule[t.Day].push({
                    Subject: c.Subj + ' ' + c.Crse,
                    sTime: tSData.Hours + ':' + tSData.Minutes + ' ' + tSData.Period,
                    eTime: tEData.Hours + ':' + tEData.Minutes + ' ' + tEData.Period,
                    courseInfo: c
                });
                //vm.message2 =
            });
        });
        sm.message = sm.currentSchedule;
    };

  sm.getVisualTime = function (time){
		var hours = Math.round(time / 100) % 12;
    if(hours == 0) {
      hours = 12;
    }
		var minutes = (time % 100 == 0 ? '00' : time % 100);
		var period = (time >= 1200? 'pm' : 'am');
		return {
			Hours: hours,
			Minutes: minutes,
			Period: period
		};
	};

sm.formatScheduleData = function (index){
    sm.setCurrentSchedule(index);
    sm.daySchedules[index] = sm.currentSchedule;
    sm.crnLists[i] = [];
    sm.schedules[i].forEach(function(c){
      sm.crnLists[i].push(c.CRN);
    });
}

  sm.formatDaySchedules = function (){
    sm.daySchedules = [];
    for(i = 0; i < sm.schedules.length; i++){
      //format this schedule and store it in current schedule
      sm.setCurrentSchedule(i);
      sm.daySchedules[i] = sm.currentSchedule;
    }

  };

  sm.formatCRNLists = function(){
    for(i = 0; i < sm.schedules.length; i++){
      sm.crnLists[i] = [];
      sm.schedules[i].forEach(function(c){
        sm.crnLists[i].push(c.CRN);
      });
    }
  }

  //grabs the list of possible schedules from the local schedule storage service
  sm.grabSchedules = function(){
    sm.schedules = scheduleService.getSchedules();
    sm.daySchedules = [];
    for(i = 0; i < 5 && i < sm.schedules.length; i++) {
      sm.formatScheduleData(i);
    }
    sm.waiting = false;

    //recalibrate slider page index if this is a new schedule set grab
    if(sm.data.sliderDelegate != null){
      sm.data.sliderDelegate.update();
      if(sm.data.currentPage > sm.schedules.length - 1) {
        sm.data.currentPage = sm.schedules.length - 1;
      }
    }

  };
  console.log("Loading this controller")
  /* If there are already schedules ready when we load this controller, grab them!*/
  if(scheduleService.isWaiting == false){
    sm.grabSchedules();
    console.log("There were def schedules waiting in there")
  }

  sm.slideHasChanged = function(index) {
    sm.currentScheduleIndex = index;
    sm.setCurrentSchedule(sm.currentScheduleIndex);
  };

  sm.showNextSchedule = function () {
       // if (vm.currentScheduleIndex< vm.schedules.length) { //why not if(currentIndex < vm.schedules.len)?
            sm.currentScheduleIndex++;
            sm.setCurrentSchedule(sm.currentScheduleIndex);
        //};
    //CR
	};
    sm.showPrevSchedule = function () {
        //if (vm.currentScheduleIndex > 0)) {
            sm.currentScheduleIndex--;
            sm.setCurrentSchedule(sm.currentScheduleIndex);
       // };
    };

  scheduleService.addStartListener(function(){
    console.log("Not waiting any more!");
    sm.daySchedules = [];
    sm.waiting = true;
  });

  //start listening for changes to schedules data
  scheduleService.addFinishListener(function(){
    console.log("Not waiting any more!");
    sm.grabSchedules();
    sm.setCurrentSchedule(sm.currentScheduleIndex);
    sm.waiting = false;
  });

  //grabs the a sample schedule list (with only one schedule) from the local schedule storage service
  sm.grabSampleSchedules = function(){
    sm.schedules = scheduleService.getSampleSchedules();
    sm.waiting = false;
  };





});
