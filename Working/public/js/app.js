angular.module('firstApp2', ['scheduleService'])

.controller('mainController', function ($http) {
    var vm = this;
    // Set from form
    vm.message = 'AvailableTimes array';
    vm.message2 = 'test';
    vm.message3 = 0;
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


    vm.day; // current day selected, used to determine which array to add the start and end times

    // form data
    vm.timeData = {};
    vm.dayData = {};
    vm.courseData = {};
    vm.choices = ["Fall2016", "Spring2017"];
    vm.modalCourseData = null;

    // returned schedule data
    vm.origSchedules = [];
    vm.schedules = [];
    vm.notFound = [];

    // test times represents a single schedule

    // current schedule has
    vm.currentSchedule = [[], [], [], [], [], [], []];
    vm.currentScheduleIndex = 0; //In the event we wish to locate a specific schedule, we need this

    vm.currentScheduleCourses = []; //conatins a list of all courses currently being displayed
    vm.selectedCourses = [];
    vm.notSelectedCourses = [];


    ///////--------------CHANGES: display Time
    // adds start and end times to the selected day's array of available time frames
    vm.addTimes = function () {
        if (vm.timeData.StartTime !== null && vm.timeData.EndTime !== null) {
            var sTime = vm.changeTimeFormat(vm.timeData.StartTime);
            var eTime = vm.changeTimeFormat(vm.timeData.EndTime);
            if (sTime < eTime) {
                dsTime = vm.getVisualTime(sTime);
                deTime = vm.getVisualTime(eTime);
                vm.times[vm.day].push({
                    dispStartTime: dsTime.Hours + ":" + dsTime.Minutes + " " + dsTime.Period,
                    dispEndTime: deTime.Hours + ":" + deTime.Minutes + " " + deTime.Period,
                    StartTime: sTime,
                    EndTime: eTime
                });
                vm.times[vm.day] = vm.combine(vm.times[vm.day]);
                vm.errorMessageTimes = '';
            } else {
                vm.errorMessageTimes = 'Please verify that the start time occurs before the end time.'
            }
        }

    };

    vm.allDay = function (day) {
        var temp = [{
            dispStartTime: "12:00 am",
            dispEndTime: "11:59 pm",
            StartTime: 0000,
            EndTime: 2359
        }];
        vm.times[day] = temp;
    };

    // for testing purposes only
    vm.testCourses = function () {
        vm.courses = [];
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
        for (var i = 0; i < 6; i++) {
            vm.allDay(i);
        };
        vm.semester = 'Fall2016';
        vm.submitTimes();
    };
    vm.message = "hello world";
    //Adds courses to json and posts to backend
    vm.addCourses = function () {
        if (vm.courseData.subject != null && vm.courseData.course != null) {
            var s = vm.courseData.subject;
            var c = vm.courseData.course;
            var includesC = false;
            for (var i = 0; i < vm.courses.length; i++) {
                if (vm.courses[i].course.includes(c)) {
                    includesC = true;
                }
            }

            if (!includesC) {
                vm.courses.push({
                    subject: s.toUpperCase(),
                    course: c
                });
            }
            includesC = false;
            vm.courseData = {};
            vm.errorMessageCourses = '';
        } else {
            vm.errorMessageCourses = 'Please enter your course subject and number.'
        }
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
        // POST request
        $http({
            method: 'POST',
            url: 'api/process',
            data: weekData,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            // extract "Schedule" array from the returned data and save

            vm.schedules = data.schedules;
            vm.origSchedules = vm.schedules;
            vm.notFound = data.notFound;
            vm.displayNotFound();
            //for each course set it to not selected
            vm.schedules[0].forEach(function(c){
              c.Selected = false;
              vm.currentScheduleCourses.push(c);
            });
            vm.updateSelected();
            vm.setCurrentSchedule(vm.currentScheduleIndex); // sets current schedule to the first one
        });
    };

    // Displays courses that are not found to the user
    vm.displayNotFound = function () {
        if (vm.notFound.length != 0) {
            var text = "Courses not found:<br><br>";
            var i;
            for (i = 0; i < vm.notFound.length; i++) {
                text += vm.notFound[i].subject + " " + vm.notFound[i].course + "<br>";
            }
            text += "<br>Please expand times on campus and/or check spelling.<br>"
            document.getElementById("notFoundLoc").innerHTML = text;
            //message2 = text;
        }
    }

    vm.displayCRN = function (schedule) {
            var text = "";
            var i; // Loop through the temp schedule in each of the days (schedule[0] is monday)
            // create a set of all the crn's
            //loop through the set, and print the individual crns.
            var j;
            var crnset = {};
            console.log(schedule);
            console.log(schedule[0].CRN);
            console.log(schedule.length);
            for (i = 0; i < schedule.length; i++) {
                text += schedule[i].CRN + "   ";
            }

            document.getElementById("CRNinfo").innerHTML = text;
        }


    // changes time format to hhmm to be stored in respective arrays
    vm.changeTimeFormat = function (time) {
        return parseInt(time.getHours() + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes());
    };
    // extracts hours, minutes, period from military time
    vm.getVisualTime = function (time) {
        var hours = Math.floor(time / 100) % 12;
        var minutes = (time % 100 == 0 ? '00' : time % 100);
        var period = (time >= 1200 ? 'pm' : 'am');
        return {
            Hours: (hours == 0 ? 12 : hours),
            Minutes: minutes,
            Period: period
        };
    };

    //I'm sorry, this name is terrible but it made me chuckle
    //@returns String of time in hh:mm (period) format
    vm.getVisualTime2 = function (time) {
        var temp = vm.getVisualTime(time);
        return temp.Hours + ":" + temp.Minutes + " " + temp.Period;
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
            else {
                deTime = vm.getVisualTime(r.EndTime);
                result[result.length - 1].EndTime = r.EndTime;
                result[result.length - 1].dispEndTime = deTime.Hours + ":" + deTime.Minutes + " " + deTime.Period;
            }
        });

        return result;
    };

    vm.setCurrentSchedule = function (scheduleIndex) { //schduleIndex = index of schedule you wish to set as current
        //use this one when taking schedules from
        vm.currentSchedule = [[], [], [], [], [], [], []];
        vm.currentScheduleCourses = [];
      //  vm.selectedCourses = [];
      //  vm.notSelectedCourses = [];
        var tempSchedule = vm.schedules[scheduleIndex];
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // the problem is that each schedule has their own "course" even if the course exists in a different schedule
        // everytime I display the schedule, I need to check to see if the course is in the selected list, if so, do c.Selected == true
        var tSData;
        var tEData;
        var meetings;
        var tempDay;

        vm.displayCRN(tempSchedule);


        tempSchedule.forEach(function (c) {
            meetings = c.Meetings;
          //  c.Selected = false;
            tempDay = 0;
            vm.currentScheduleCourses.push(c);
            vm.containsCourse(c, vm.selectedCourses)? c.Selected = true: c.Selected = false;
          //  vm.updateSelected();
            if (meetings.length == 0) {
                meetings = [{
                    Type: "(Online)",
                    Day: 6,
                    StartTime: 800,
                    EndTime: 2115,
                    BuildingRoom: "Online"
                }];
            }

            meetings.forEach(function (t) {
                tSData = vm.getVisualTime(t.StartTime);
                tEData = vm.getVisualTime(t.EndTime);
                vm.currentSchedule[t.Day].push({
                    Subject: c.Subj + ' ' + c.Crse,
                    sTime: tSData.Hours + ':' + tSData.Minutes + tSData.Period,
                    eTime: tEData.Hours + ':' + tEData.Minutes + tEData.Period,
                    courseInfo: c
                });
            });
        });
    }

    vm.showNextSchedule = function () {
        vm.currentScheduleIndex++;
        vm.setCurrentSchedule(vm.currentScheduleIndex);
    };
    vm.showPrevSchedule = function () {
        vm.currentScheduleIndex--;
        vm.setCurrentSchedule(vm.currentScheduleIndex);
    };


    //Preconditions: must be a reroll variable declared with other global fields, restrictions is an associative array described above,
    //schedules have already been generated before calling.
    //Creates a new array of schedules that satisfy the restrictions given by the user and stores in reroll.
    //The schdule the user had up before rolling will be the last schedule in the reroll.
    vm.createReroll = function (restrictions) {
        vm.reroll = [];
        var origFound = false;
        for (var i = 0; i < vm.schedules.length; i++) {
            if (vm.createRerollHelper(restrictions.selected, vm.schedules[i])) {
                if (!origFound) {
                    if (vm.createRerollHelper(restrictions.notSelected, vm.schedules[i])) {
                        var orig = vm.schedules[i];
                        origFound = true;
                    }
                    else vm.reroll.push(vm.schedules[i]);
                }
                else vm.reroll.push(vm.schedules[i]);
            }
        }
        vm.reroll.push(orig);
    };

    //does this schedule contain the selected or not selected course
    vm.createRerollHelper = function (selected, schedule) {

        var found;
        for (var i = 0; i < selected.length; i++) {
            var found = false;
            var j = 0;
            while (j < schedule.length && !found) { //while the schedule w
                if ((schedule[j]["Subj"] === selected[i]["Subj"]) && (schedule[j]["Crse"] === selected[i]["Crse"])) {
                    if (schedule[j]["CRN"] !== selected[i]["CRN"])
                        return false;
                    found = true;
                }
                j++;
            }
        }
        return true;
    };

    //rerolls the schedule keeping the courses that the user wants to keep when getting a new schedule
    vm.rerollSched = function () {
        if (vm.selectedCourses.length > 0) {
            vm.message2 += " reached1";
            var restrictions = {
                selected: vm.selectedCourses,
                notSelected: vm.notSelectedCourses
            };
            //reroll from the original schedules list, and not the current schedules list
            vm.schedules = vm.origSchedules; //I know this isn't the most effiient way to do it, and I can think of a better way, but I just want to get something working
            vm.message2 += " reached2";
            vm.createReroll(restrictions);
            vm.schedules = vm.reroll;
            vm.currentScheduleIndex = 0;
            vm.setCurrentSchedule(vm.currentScheduleIndex); // sets current schedule to the first one
        }
    };

    vm.updateSelected = function () {
      //clear selected list, then push
      vm.selectedCourses = [];
      vm.notSelectedCourses = [];
      vm.currentScheduleCourses.forEach(function(c){
        if(c.Selected == true) {
          vm.selectedCourses.push(c);
        }
        else {
          vm.notSelectedCourses.push(c);
        }
      });


      /*
        vm.message3 = 0;
        var tempSelected = [];
        var tempNotSelected = [];
        //for each day
        vm.currentSchedule.forEach(function (c) {
            //for each meeting
            c.forEach(function (d) {
                //check that the course is selected, and the course isn't already in the selectedCourse list
                var tempCInfo = d.courseInfo;
                if (tempCInfo.Selected == true) {
                    //course is in the list
                    vm.message3 += " " + vm.containsCourse(tempCInfo, tempSelected);
                    if (!vm.containsCourse(tempCInfo, tempSelected))
                        tempSelected.push(tempCInfo);
                }
                else {
                    if (!vm.containsCourse(tempCInfo, tempNotSelected))
                        tempNotSelected.push(tempCInfo);
                }
            });
        });
        vm.selectedCourses = tempSelected;
        vm.notSelectedCourses = tempNotSelected;
        */
    };

    vm.containsCourse = function (courseInfo, list) {
        var temp = false;
        //compare the course with every course in the selectedCourses array
        list.forEach(function (c) {
            if (courseInfo.CRN == c.CRN) {
                vm.message3 += "Comparing Courses: " + courseInfo.CRN + " and " + c.CRN + (courseInfo.CRN == c.CRN) + "\n";
                temp = true;
                return;
            }
            vm.message3 += "Comparing Courses: " + courseInfo.CRN + " and " + c.CRN + (courseInfo.CRN == c.CRN) + "\n";
        })

        return temp;
    };

});
