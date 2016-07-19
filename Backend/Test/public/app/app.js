// name our angular app
angular.module('firstApp', [])

.controller('mainController', function() {

	// bind this to vm (view-model)
	var vm = this;

	// define variables and objects on this
	//this lets them be available to our views

	// define a list of items
	vm.computers = [];
	
	// information that comes from our form
	vm.computerData = {};

	vm.viewCourse = function() {

		// add a computer to the list
		vm.computers.push({
			subject: vm.computerData.subject,
			course: vm.computerData.course,
		});

		// after our computer has been added, clear the form
		vm.computerData = {};
	};

});
