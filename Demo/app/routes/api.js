var config  = require('../../config');
//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');


module.exports = function(app, express) {
	var apiRouter = express.Router();
	
	apiRouter.post('/process', function(req,res){
		var week = req.body.timesArray;
		var courses = req.body.courseArray;
		require('../generator/scheduleGenerator')(week, courses, mongodb, config, function() {
			console.log(schedules);
			console.log(notFoundCourses); //the courses the user inputed that we did not find
			res.json(schedules);
		});
	});	

	return apiRouter;
};
