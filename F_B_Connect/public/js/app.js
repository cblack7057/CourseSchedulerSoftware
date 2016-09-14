angular.module('firstApp2', ['scheduleService'])

.controller('mainController', function ($http) {

    var vm = this;
    // Set from form
    vm.message = 'AvailableTimes array';
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
                vm.timeData = {}; //clears form
                vm.errorMessage = '';
            } else {
                vm.errorMessage = 'Please verify that the start time occurs before the end time.'
            }
        }
    };
	
    // submits week data to backend through a post request, then sets data the 'message'
    vm.submitTimes = function () {
		var weekData = {timesArray: vm.times,
						courseArray: vm.courses};
		
		// POST request
		$http({
			method: 'POST',
			url: '/process',
			data: weekData,
			headers: {'Content-Type': 'application/json'}
		}).success(function(data){
			vm.message = data; // temporary return
		});
		
    };
	
	// changes time format to hhmm to be stored in respective arrays
    vm.changeTimeFormat = function (time) {
        return (time.getHours() < 10 ? '0' : '') + time.getHours() + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    };

    // Changes the displayed table of times frames
    vm.newDay = function (value) {
        vm.day = value;
        vm.availableTimes = vm.times[value];
        vm.message = vm.availableTimes;
    };

});