// source http://stackoverflow.com/questions/26390938/merge-arrays-with-overlapping-values
	vm.combine = function (ranges) {
		
		//vm.message = vm.message +'test1';
		//var result = [];
		
		// sort the array
		times.sort(function(a,b) {
			var a = a.startTime;
			var b = b.startTime;
			
			if(a > b){
				return 1; 
			}
			if (b < a) {
				return -1;
			}
			return 0;
			});
			//a.e >= b.s
				vm.message = vm.message +'test2';
	/*
		var result = [];
		// merge 
		times.forEach(function(r) {
			if(!result.length || r.startTime > result[result.length-1].endTime)
				result.push(r);
			else
				result[result.length-1].endTime = r.endTime;
		});
		vm.message = vm.message +'test3';

		return result;
		*/
		var result = [];

			ranges.forEach(function(r) {
    	
        if(!result.length || r.startTime > result[result.length-1].endTime){
            result.push(r);
        }
        else{
            result[result.length-1].endTime = r.endTime;
        }
		});

		return result;
		
		
		
		
		
	};