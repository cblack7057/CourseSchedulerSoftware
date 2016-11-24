angular.module('scheduler.services', [])

	.service('scheduleService', function() {
		var scheduleStorage = {};

		scheduleStorage.startListeners = [];
		scheduleStorage.finishListeners = [];

		scheduleStorage.isWaiting = true;

		scheduleStorage.notifyStartListeners = function(){
			angular.forEach(scheduleStorage.startListeners, function(listenerCallback){
			 	listenerCallback();
				//console.log('notified');
			});
		};

		scheduleStorage.notifyFinishListeners = function() {
			angular.forEach(scheduleStorage.finishListeners, function(listenerCallback){
			 	listenerCallback();
				//console.log('notified');
			});
		}

		scheduleStorage.addStartListener = function(callback){
			scheduleStorage.startListeners.push(callback);
		};

		scheduleStorage.addFinishListener = function(callback){
			scheduleStorage.finishListeners.push(callback);
		};

		//list of possible schedules, this will be filled with server response
		scheduleStorage.scheduleArray = [];

		//sample schedule list with one schedule - for testing purposes
		scheduleStorage.sampleScheduleArray = [[ { Subj: 'CS',
	      Crse: '01200',
	      Sect: '1',
	      Meetings: [Object],
	      Session: 'Day',
	      CRN: 41164,
	      Title: 'COMPUTING ENVIRONMENTS',
	      Prof: 'Hoxworth Ryan',
	      Campus: 'Main',
	      Hrs: 3 },
	    { Subj: 'CS',
	      Crse: '04114',
	      Sect: '1',
	      Meetings: [Object],
	      Session: 'Day',
	      CRN: 41093,
	      Title: 'OBJ-ORIENT PRGRM/DATA ABSTR',
	      Prof: 'Myers Jack F',
	      Campus: 'Main',
	      Hrs: 4 },
	    { Subj: 'CS',
	      Crse: '04222',
	      Sect: '1',
	      Meetings: [Object],
	      Session: 'Day',
	      CRN: 41096,
	      Title: 'DATA STRUCT/ALGORIM',
	      Prof: 'Hristescu Gabriela',
	      Campus: 'Main',
	      Hrs: 4 },
	    { Subj: 'CS',
	      Crse: '06205',
	      Sect: '1',
	      Meetings: [Object],
	      Session: 'Day',
	      CRN: 41101,
	      Title: 'COMPUTER ORGANIZATION',
	      Prof: 'Mansaray Mohamed S',
	      Campus: 'Main',
	      Hrs: 3 } ]];

		//called by InputScheduleCtrl submit callback to store the matching schedules retrieved from server
		scheduleStorage.onFinishProcessing = function(newSchedules){
			scheduleStorage.scheduleArray = newSchedules;
			scheduleStorage.notifyFinishListeners();
			scheduleStorage.isWaiting = false;
		};

		scheduleStorage.onStartProcessing = function(){
			scheduleStorage.notifyStartListeners();
			scheduleStorage.isWaiting = true;
		}

		//called by SelectScheduleCtrl to retrieve store schedule list
		scheduleStorage.getSchedules = function(){
			return scheduleStorage.scheduleArray;
		};

		//gets the sample schedule list for testing purposes
		scheduleStorage.getSampleSchedules = function(){
			return scheduleStorage.sampleScheduleArray;
		};

		return scheduleStorage;

	});
