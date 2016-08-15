angular.module('firstApp2', [])
.controller('mainController', function() {
	
	var vm = this;
	
	vm.message = 'AvailableTimes array';
	vm.errorMessage = '';
	
	vm.availableTimes = [];
	vm.day;
	// this needs to be consolidated into a single array
	vm.M = [];
	vm.T = [];
	vm.W = [];
	vm.R = [];
	vm.F = [];
	
	// form data
	vm.timeData = {};
	vm.dayData = {};
	
	vm.compareTo = function compare(a,b) {
		if (new Date(a.startTime) < new Date(b.startTime))
			return -1;
		if (new Date(a.startTime) < new Date(b.startTime))
			return 1;
		return 0;
	};
	
	// Adds start and end times to the selected day's array of available time frames.
	vm.addTimes = function(){
		if(vm.timeData.startTime !== null && vm.timeData.endTime !== null){
			var sTime = new Date(vm.timeData.startTime);
			var eTime = new Date(vm.timeData.endTime);
			if(sTime < eTime){
				vm.availableTimes.push({
				startTime: sTime,
				endTime: eTime
				});
				vm.availableTimes.sort(vm.compareTo);
				vm.timeData = {}; //clears form
				vm.errorMessage = '';
			} else {
				vm.errorMessage = 'Please verify that the start time occurs before the end time.'
			}
		}
	};
	
	// Changes the displayed table of time frames.	
	vm.newDay = function(value) {
		vm.day = value;	
		if(value == 'Monday'){
			vm.availableTimes = vm.M;
		} else if(value == 'Tuesday'){
			vm.availableTimes = vm.T;
		} else if(value == 'Wednesday'){
			vm.availableTimes = vm.W;
		} else if(value == 'Thursday'){
			vm.availableTimes = vm.R;
		} else if (value == 'Friday'){
			vm.availableTimes = vm.F;
		}
		vm.message = vm.availableTimes;
	};
	
});