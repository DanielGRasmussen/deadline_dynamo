// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ---------------------------------------Catalog------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class Catalog {
	courses = [];
    
    
	saveToStorage() {
		chrome.storage.sync.set("courses", this.courses);
	}

	loadfromstorage() {
		return chrome.storage.sync.get("courses");
	}

	createNewCourse(json) {
		const newCourse = new Course();
		newCourse.loadFromJson(json);
		this.courses.push(newCourse);
	}

	populateCourseAssignments(json, course_id) {
        this.getCourse(course_id).addAssignment(json);
	}

	calculateAllScores() {
		for (let i=0; i < this.courses.length; i++) {
			this.courses[i].computeAllAssignmentScores();
		}
	}

	getCourse(id) {
		for (let i=0; i < this.courses.length; i++) {
			if (this.courses[i].id == id) {
				return this.courses[i];
			}
		}
		throw new Error("Catalog.getCourse: Course id " + id + " does not exist.");
	}

	getAllAssignments() {
		let assignments = [];
		for (let i=0; i < this.courses.length; i++) {
			assignments = assignments.concat(this.courses[i].assignments);
		}
		return assignments;
	}

	toJSON() {
		let stringBuilder = "[";
		for (let i=0; i < this.courses.length; i++) {
			if (i == this.courses.length) {
				stringBuilder += this.courses[i].allAssignmentsToJSON(false);
			} else {
				stringBuilder += this.courses[i].allAssignmentsToJSON(false); //bool is backwards from how you'd expect. true=no comma, false=comma
			}
		}
		stringBuilder = stringBuilder.slice(0, -1);
		stringBuilder += "]";
		const assignments = JSON.parse(stringBuilder);

		stringBuilder = "{";
		for (let i=0; i < this.courses.length; i++) {
			stringBuilder += this.courses[i].toJSON();
			if (i !== this.courses.length - 1) {
				stringBuilder += ",";
			}
		}
		stringBuilder += "}";
		console.log(stringBuilder);
		const courses = JSON.parse(stringBuilder);
		return [assignments, courses];
	}

}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ---------------------------------------Course------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class Course {

	id = 0;
	course_code = "";
	grade = 0;
	assignments = [];
	assignment_names = "";
	name = "";
 
	addAssignment(json) {
		let newAssignment = new Assignment();
		newAssignment.loadFromJson(json);
		newAssignment.course_name = this.name;
        newAssignment.course_id = this.id;
		this.assignment_names += newAssignment.name;
		this.assignments.push(newAssignment);
	}
 
	loadFromJson(json) {
		this.name = json.name;
		this.course_code = json.course_code;
		this.id = json.id;
	}
 
	countOccurrences(string, subString, allowOverlapping) { //https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
 
		string += "";
		subString += "";
		if (subString.length <= 0) return (string.length + 1);
   
		var n = 0,
			pos = 0,
			step = allowOverlapping ? 1 : subString.length;
   
		while (true) {
			pos = string.indexOf(subString, pos);
			if (pos >= 0) {
				++n;
				pos += step;
			} else break;
		}
		return n;
	}
 
	countSimilarAssignments(assignment) {
		const assignmentName = assignment.name;
       
		const occurences = this.countOccurrences(this.assignment_names, assignmentName);
		return occurences - 1;
	}
 
	computeAllAssignmentScores() {
		for (let i=0; i < this.assignments.length; i++) {
			this.assignments[i].similar_assignments = this.countSimilarAssignments(this.assignments[i]);
			this.assignments[i].computeAllScores();
		}
	}
 
	toJSON() {
		let stringBuilder = "";
		stringBuilder += `"${this.course_code}": {`;
		stringBuilder += `"title": "${this.name}" }`;
		return stringBuilder;
	}
 
	allAssignmentsToJSON(removeTrailingComma=false) {
		// let firstAssignment = true; //this really should be "isFirstAssignment" for readibility but it's 4am and I already wrote it this way
		let stringBuilder = "";
		for (let i=0 ; i < this.assignments.length; i++) {
			
 
			stringBuilder += this.assignments[i].toJSON();
			if (i !== this.assignments.length) {
				stringBuilder += ",";
			}
		}
 
		if (removeTrailingComma == true) {
			return stringBuilder.slice(0, -1);
		} else {
			return stringBuilder;
		}
 
	}
 
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// --------------------------------------Assignment----------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class Assignment {
	id = 0;
	description = "";
	due_date;
	points_possible = 0;
	name = "";
	submission_types = "";
	has_submitted_submissions = false;
	guessed_percent = 0;
	importance_score = 0;
	similar_assignments = 0;
	overall_score = 0;
	duration = 0;
	course_name = "";

	loadFromJson(json) {
        try {
		    this.due_date = new Date(json.due_at);
        } catch {
            try {
                this.due_date = new Date(json.due_date);
            } catch {
                this.due_date = new Date(0);
            }
        };

        let stringifiedJson = JSON.stringify(json);
		stringifiedJson = stringifiedJson.toLowerCase();
		const parsedJson = JSON.parse(stringifiedJson);

		this.id = parsedJson.id;
		this.description = parsedJson.description;
		this.points_possible = parsedJson.points_possible;
		this.name = parsedJson.name;
		this.submission_types = parsedJson.submission_types;
		this.has_submitted_submissions = parsedJson.has_submitted_submissions;

        // Make null descriptions impossible
        if (this.description == null) {
            this.description = "a";
        }
	}

	findTimeInDescription() {
		//Find indexes of time keywords
		let minutes_index = this.description.indexOf("minute");
		if (minutes_index == -1) {
			minutes_index = this.description.indexOf("minutes");
		}
		let hours_index = this.description.indexOf("hour");
		if (hours_index == -1) {
			hours_index = this.description.indexOf("hours");
		}
		let days_index = this.description.indexOf("day");
		if (days_index == -1) {
			days_index = this.description.indexOf("days");
		}

		//Find numbers surrounding the words
		if (minutes_index == -1) {
			if (!isNaN(this.description[minutes_index - 1])) {
				return ["minutes", this.description[minutes_index]];
			}
		}
        
		else if (hours_index == -1) {
			if (!isNaN(this.description[hours_index - 1])) {
				return ["hours", this.description[hours_index]];
			}
		}
        
		else if (days_index == -1) {
			if (!isNaN(this.description[days_index - 1])) {
				return ["minutes", this.description[days_index]];
			}
		}

		else {
			return ["null", 0];
		}
	}

	guessPercentage() {
		// Keyword strategy
        if (this.description.indexOf("final") != -1 || this.description.indexOf("exam") != -1) {
            this.guessed_percent = 6;
            return 6;
        }
        if (this.description.indexOf("quiz") != -1) {
            this.guessed_percent = 3;
            return 3;
        }
        if (this.description.indexOf("homework") != -1) {
            this.guessed_percent = 20;
            return 6;
        }

		//Submission type strategy
		console.log("keyword strategy for percentage guess failed; using submission type strategy");


		switch(this.submission_types) {
		case "online_quiz":
			this.guessed_percent = 3;
			return 3;
		case "none":
			this.guessed_percent = 0;
			return 0;
		case "on_paper":
			this.guessed_percent = 3;
			return 3;
		case "discussion_topic":
			this.guessed_percent = 1;
			return 1.5;
		case "external_tool":
			this.guessed_percent = 2;
			return 2;
		case "online_upload":
			this.guessed_percent = 3;
			return 3;
		case "online_text_entry":
			this.guessed_percent = 1;
			return 1;
		case "online_url":
			this.guessed_percent = 3;
			return 3;
		case "media_recording":
			this.guessed_percent = 3;
			return 3;
		case "student_annotation":
			this.guessed_percent = 1;
			return 1;
		default:
			console.log("WARNING: Submission type strategy for weight guessing failed.");
			console.log("Returning 1, weight will be ignored");
			console.log("submission_types = " + this.submission_types);
			this.guessed_percent = 1;
			return 1;
		}
	}

	calculateImportance() {
		const points = this.points_possible;
		const percentage = this.guessPercentage();
        // console.log(this.points_possible);
        // console.log(this.guessed_percent);
		this.importance_score = points * percentage;
	}

    async getFromStorageSync(key) { //Chrome storage is officialy synchronous, but returns promises, which is infuriating and stupid and has been just one of MANY MANY MANY cases of libraries just being poorly designed during this project. here's what chatGPT spat out so I don't have to deal with it.
        let value;
        await new Promise((resolve) => {
          chrome.storage.sync.get(key, (result) => {
            value = result[key];
            resolve();
          });
        });
        return value;
      }

	calculateDuration() {
		//Try direct search
		const foundTime = this.findTimeInDescription();
		if (!foundTime == ["null", 0]) {
			switch(foundTime[0]) {
			case "minutes":
				return foundTime[1];
			case "hours":
				return foundTime[1] * 60;
			case "days":
				return foundTime[1] * 3 * 60;
			default:
				console.log("WARNING: somehow reached default in calculateDuration in assignment.js");
			}
		}
		//Guess with algorithm
		if (this.name.includes("attendance")) {
			this.duration = 1;
			return;
		}
		// Define type modifier
		let typeModifier = 1;
		switch(this.submission_types) {
            case "online_quiz":
                typeModifier = 1;
                break;
            case "online_text_entry":
                typeModifier = 1;
                break;
            case "online_upload" || "on_paper":
                typeModifier = 2;
                break;
            default:
                typeModifier = 1;
                break;
		}

		// Set keyword modifiers
		let keywordModifier = 1;
		if (this.name.includes("self-assessment") || this.name.includes("self assessment")) {
			keywordModifier++;
		}
		if (this.name.includes("final") || this.name.includes("notes")) {
			keywordModifier = keywordModifier + 2;
		}
		if (this.name.includes("paper") || this.name.includes("project") || this.name.includes("essay") || this.name.includes("draft")) {
			keywordModifier = keywordModifier + 3;
		}

		const unadjustedDuration = Math.floor( ( (30 * this.similar_assignments + 60 * keywordModifier * typeModifier) + 0.5 * this.points_possible) / 2 );

		const adjustedDuration = unadjustedDuration;

		this.duration = adjustedDuration;
		return;
	}

	calculateOverallScore() {
		const today = new Date();
		const daysUntilDue = ( today.getTime() - this.due_date.getTime() ) / (1000 * 3600 * 24);
		this.overall_score = ( this.duration + this.importance_score ) / daysUntilDue;
	}

	computeAllScores() {
		this.calculateImportance();
		this.calculateDuration();
		this.calculateOverallScore();
	}

	toJSON() {
		let stringBuilder = "{";
		stringBuilder += `"title": "${this.name}",`;
		stringBuilder += `"course": "${this.course_name}",`;
		stringBuilder += `"type": "${this.submission_types}",`;
		stringBuilder += `"points": ${this.points_possible},`;
		stringBuilder += `"estTime": ${this.duration},`;
		stringBuilder += `"importance": ${this.importance_score},`;
		stringBuilder += `"priority": ${this.overall_score},`;
		stringBuilder += `"due_date": "${this.due_date.toDateString()}",`;
		stringBuilder += `"status": ${this.has_submitted_submissions ? 0 : 1}`;
		stringBuilder += `}`;
		return stringBuilder;
	}

}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// --------------------------------------Fetch Data----------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------


const courseUrl = "https://byui.instructure.com/api/v1/courses?enrollment_state=active&per_page=50";

async function getCourseInfo() {
	const response = await fetch(courseUrl);
	const courseInfo = await response.json();

	return courseInfo;
}

// Function to fetch data and handle pagination
async function fetchAllAssignments(courseId) {
	const assignmentUrl = `https://byui.instructure.com/api/v1/courses/${courseId}/assignments?per_page=50`;

	let page = 1;
	let allData = [];

	while (true) {
		const url = `${assignmentUrl}&page=${page}`;
		const response = await fetch(url);
		const data = await response.json();

		if (data.length == 0) {
			// No more data to fetch, break the loop
			break;
		}

		allData = allData.concat(data);

		if (data.length < 50) {
			// Less than 50 items returned, stop pagination
			break;
		}
		page++;
	}

	return allData;
}

async function fetch_data() {
	const courseData = await getCourseInfo();

	const courseAssignments = {};
	for (let course of courseData) {
		let currentAssignments = await fetchAllAssignments(course.id);
		courseAssignments[course.id] = currentAssignments;
	}

	return [courseData, courseAssignments];
    
}

async function process_data() {
	const response = await fetch_data();
	const courseData = response[0];
	const courseAssignments = response[1];
	const catalog = new Catalog();

	for (let course of courseData) {
		catalog.createNewCourse(course);

		for (let assignment of courseAssignments[course.id]) {
			catalog.populateCourseAssignments(assignment, course.id);
		}
	}

	catalog.calculateAllScores();

	return catalog.toJSON();
}

process_data().then(response => {
	const assignments = response[0];
	const courses = response[1];
	console.log(assignments);
	console.log(courses);
})

