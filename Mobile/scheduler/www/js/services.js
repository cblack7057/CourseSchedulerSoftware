angular.module('scheduler.services', [])

	.factory('scheduleService', function() {
		var scheduleStorage = {};

		scheduleStorage.scheduleArray = [];

		scheduleStorage.setSchedules = function(newSchedules){
			scheduleStorage.scheduleArray = newSchedules;
		};

		scheduleStorage.getSchedules = function(){
			return scheduleStorage.scheduleArray;
		};

		return scheduleStorage;

	});
