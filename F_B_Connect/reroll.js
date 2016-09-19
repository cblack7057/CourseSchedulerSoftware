/*
	Frontend passes backend a JSON with the selected section(s) to keep and reroll for the rest.
	Or frontend does all this since we are not actually accessing the database! <- makes more sense to me

	What I envision for this is that a weeklong calendar is displayed with the schedule filled in.
	If the user clicks on a section, it becomes highlighted and the "Keep these" button appears or is ungrayed,
	then once clicked, a new schedule with the highlighted section remain, still highlighted.
	They can choose more to highlight and remove highlights.

	We will also need the sections of the classes not selected to make sure the roll doesnt give
	back the same result right after rerolling, confusing the user.
	Might be a good idea to put that schedule at the end.

	restrictions is an associative array that has two elements indexed by the strings "selected" and "not selected". Each of these contains an
	array of sections. 
	restrictions = {
			"selected" = [
					{Section Stuff},
					{Section Stuff},
					...
				]
			"not selected" = [
						{Section Stuff},
						...
					]
		}

	The schedules array we all know and love.
	schedules = [
			[
				{Section Stuff},
				{Section Stuff},
				...
			],
			[
				{Section Stuff},
				{Section Stuff},
				...
			],
			...
		]
*/


//Preconditions: must be a reroll variable declared with other global fields, restrictions is an associative array described above,
//schedules have already been generated before calling.
//Creates a new array of schedules that satisfy the restrictions given by the user and stores in reroll.
//The schdule the user had up before rolling will be the last schedule in the reroll.
function createReroll(restrictions) {
	reroll = [];
	var origFound = false;
	for(var i = 0; i < schedules.length; i++)
	{
		if(createRerollHelper(restrictions["selected"], schedules[i]))
		{
			if(!origFound)
			{
				if(createRerollHelper(restrictions["not selected"], schedules[i])
				{
					var orig = schedules[i];
					origFound = true;
				}
				else reroll.push(schedules[i]);
			}
			else reroll.push(schedules[i]);
		}
	}
	reroll.push(orig);
}

//does this schedule contain the selected or not selected stuff
function createRerollHelper(selected, schedule) {
	var found = false;
	for(var i = 0; i < selected.length; i++) {
		var j = 0;
		while(j < schedule.length && !found)
		{
			if((schedule[j]["Subj"] === selected[i]["Subj"]) && (schedule[j]["Crse"] === selected[i]["Crse"]))
			{
				if(schedule[j]["CRN"] !== selected[i]["CRN"])
					return false;
				found = true;
			}
			j++;
		}
	}
	return true;
}