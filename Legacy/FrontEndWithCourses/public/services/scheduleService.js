angular.module('scheduleService', [])

.factory('Schedule', function($http) {

	// create a new object
	var scheduleFactory = {};

	
	
	// create a schedule
	scheduleFactory.create = function(weekData) {
		return $http.post('/', weekData);
	};
/*
// get a single user
	scheduleFactory.get = function(id) {
		return $http.get('/api/users/' + id);
	};
	
	// get all users
	scheduleFactory.all = function() {
		return $http.get('/api/users/');
	};
	// update a user
	scheduleFactory.update = function(id, userData) {
		return $http.put('/api/users/' + id, userData);
	};
	// delete a user
	scheduleFactory.delete = function(id) {
		return $http.delete('/api/users/' + id);
	};
*/
	// return our entire scheduleFactory object
	return scheduleFactory;

});
