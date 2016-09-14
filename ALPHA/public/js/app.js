angular.module('firstApp2', ['scheduleService'])

.controller('mainController', function () {

    var vm = this;
    //var latitude = 0, longitude = 0; // Set from form
    vm.message = 'AvailableTimes array';
    vm.errorMessage = '';

    vm.week = [[], [], [], [], [], []];
    vm.availableTimes = [];
    vm.day;

    // form data
    vm.timeData = {};
    vm.dayData = {};

    // Adds start and end times to the selected day's array of available time frames.
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
    
    vm.submitTimes = function () {
		//vm.message = 'this works';
		
		
        // use the create function in the scheduleService
		var weekData = {weekArray: vm.week};
		
		Schedule.create(weekData)
			.success(function(data) {
				//vm.week = data.message;
				vm.message = 'data';
			});
			
			
    };
	

    vm.changeTimeFormat = function (time) {
        return (time.getHours() < 10 ? '0' : '') + time.getHours() + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    };

    // Changes the displayed table of time frames.	
    vm.newDay = function (value) {
        vm.day = value;
        vm.availableTimes = vm.week[value];
        vm.message = vm.availableTimes;
    };

});