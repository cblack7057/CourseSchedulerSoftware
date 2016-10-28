angular.module('scheduler.services', [])

	.service('scheduleService', function() {
		var scheduleStorage = {};

		scheduleStorage.scheduleArray = [];

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

		scheduleStorage.setSchedules = function(newSchedules){
			scheduleStorage.scheduleArray = newSchedules;
		};

		scheduleStorage.getSchedules = function(){
			return scheduleStorage.scheduleArray;
		};

		scheduleStorage.getSampleSchedules = function(){
			return scheduleStorage.sampleScheduleArray;
		};

		return scheduleStorage;

	});
