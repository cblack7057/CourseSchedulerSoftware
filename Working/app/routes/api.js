var config  = require('../../config');
//connect to html page through http://localhost:8080/
var mongodb = require('mongodb');


module.exports = function(app, express) {
	var apiRouter = express.Router();
	
	apiRouter.post('/process', function(req,res){
		var week = req.body.timesArray;
		var courses = req.body.courseArray;
		var term = req.body.term;
		var promise = require('../generator/scheduleGenerator')(week, courses, term, mongodb, config);
		promise.then(function(resolve, reject) {
			console.log(resolve.schedules);
			console.log(resolve.notFound); //the courses the user inputed that we did not find
			res.json(resolve);
		});
	});	

	return apiRouter;
};
