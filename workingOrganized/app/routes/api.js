var config  = require('../../config');
//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');


module.exports = function(app, express) {
	var apiRouter = express.Router();
	
	apiRouter.post('/process', function(req,res){
		var week = req.body.timesArray;
		var courses = req.body.courseArray;
		// 
		var generatedSchedules = require('../generator/scheduleGenerator')(week, courses, mongodb, config, req, res);
		setTimeout(function() {
			console.log(generatedSchedules);
			res.json(generatedSchedules);
		}, 3000);
	});	

	return apiRouter;
};