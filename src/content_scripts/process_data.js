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
		
        newAssignment.loadFromJson(json); //Filter out assignments without due dates
        if (newAssignment.due_date != null) {
            newAssignment.course_name = this.name;
            newAssignment.course_id = this.id;
            this.assignment_names += newAssignment.name;
            this.assignments.push(newAssignment);
        }
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
    course_id = 0;
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
                this.due_date = null;
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
		if (parsedJson.has_submitted_submissions == true) {
            this.due_date = null;
        }

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
        if (this.name.indexOf("final") != -1 || this.name.indexOf("exam") != -1) {
            this.guessed_percent = 3;
            return 3;
        }
        if (this.name.indexOf("quiz") != -1) {
            this.guessed_percent = 3;
            return 3;
        }
        if (this.name.indexOf("homework") != -1) {
            this.guessed_percent = 1;
            return 1;
        }

		//Submission type strategy
		// console.log("keyword strategy for percentage guess failed; using submission type strategy");


		switch(this.submission_types) {
		case "online_quiz":
			this.guessed_percent = 2;
			return 2;
		case "none":
			this.guessed_percent = 0;
			return 0;
		case "on_paper":
			this.guessed_percent = 2;
			return 3;
		case "discussion_topic":
			this.guessed_percent = 1;
			return 1.5;
		case "external_tool":
			this.guessed_percent = 2;
			return 2;
		case "online_upload":
			this.guessed_percent = 2;
			return 3;
		case "online_text_entry":
			this.guessed_percent = 1;
			return 1;
		case "online_url":
			this.guessed_percent = 2;
			return 3;
		case "media_recording":
			this.guessed_percent = 2;
			return 3;
		case "student_annotation":
			this.guessed_percent = 1;
			return 1;
		default:
			// console.log("WARNING: Submission type strategy for weight guessing failed.");
			// console.log("Returning 1, weight will be ignored");
			// console.log("submission_types = " + this.submission_types);
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
				// console.log("WARNING: somehow reached default in calculateDuration in assignment.js");
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

		const unadjustedDuration = Math.floor( ( (30 * this.similar_assignments + 60 * keywordModifier * typeModifier) + 0.2 * this.points_possible) / 2.2 );

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
		stringBuilder += `"id": ${this.id},`;
		stringBuilder += `"course_id": ${this.course_id},`;
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
    // console.log(courseAssignments);
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

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ---------------------------------------Renderer-----------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

async function replaceAssignments(assignments, courses) {
	removeAllAssignments();
	courses = assignColors(courses);

	const days = allocateAssignments(assignments, [
		300,
		300,
		300,
		300,
		300,
		180,
		180,
		0
	]);
	// Allocate assignments modifies worktimes, don't use the same between the two.
	renderAssignments(days, courses, [
		300,
		300,
		300,
		300,
		300,
		180,
		180,
		0
	]);
}

function removeAllAssignments() {
	for (let remover of document.querySelectorAll(".Day-styles__root.planner-day")) {
		remover.remove();
	}

	for (let remover of document.querySelectorAll(".EmptyDays-styles__nothingPlannedContainer")) {
		remover.remove();
	}

	for (let remover of document.querySelectorAll("div.planner-empty-days.EmptyDays-styles__root")) {
		remover.remove()
	}

	const day_wrappers = document.querySelectorAll(".day-wrapper");
	if (day_wrappers.length > 1) {
		day_wrappers[0].remove()
	}
}

function assignColors(courses) {
    const colorOptions = ["gray", "lightblue", "pink", "orange", "blue", "red", "purple"]
    for (let key of Object.keys(courses)) {
        courses[key].color = colorOptions.pop();
    }

	return courses;
}

function findCourseByTitle(courses, title) {
	for (let key of Object.keys(courses)) {
        if (courses[key].title === title) {
			return courses[key];
		}
    }
}

function getWeekOfYear(date) {
	const now = new Date(date);
	const currentWeek = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 604800000);

	return currentWeek;
}

function allocateAssignments(assignments, workTimes) {
	const days = {
		"monday": [],
		"tuesday": [],
		"wednesday": [],
		"thursday": [],
		"friday": [],
		"saturday": [],
		"sunday": [],
		"overflow": []
	};

	const currentWeek = getWeekOfYear(new Date());
	let currentDay = 0; // 0 = monday
    for (const assignment of assignments) {
		// Get a link to the estTime
        let remainingWorkTime = assignment.estTime;
        // Save original worktime for x/total.
        assignment.totalWorkTime = remainingWorkTime;

		assignment.weekNum = getWeekOfYear(new Date(assignment.due_date.slice(4)));
		
        while (remainingWorkTime > 0) {
			if (!(assignment.weekNum <= currentWeek + 1)) {
				break;
			}
			if (currentDay >= workTimes.length) {
				// No more time? It is now overflow.
				days.overflow.push(assignment);
				break;
			}
			const availableTime = workTimes[currentDay];
			if (remainingWorkTime <= availableTime) {
				workTimes[currentDay] -= remainingWorkTime; // Reduce the available work time on the current day.
				days[Object.keys(days)[currentDay]].push(assignment);
				break;
			} else if (Object.keys(days)[currentDay] === "overflow") {
				days[Object.keys(days)[currentDay]].push(assignment);
				break;
			} else {
				// No more time? Split it.
				const alternateAssignment = JSON.parse(JSON.stringify(assignment));
				alternateAssignment.estTime = workTimes[currentDay];
				assignment.estTime -= workTimes[currentDay]; // Subtracts it for when it finally appears
				days[Object.keys(days)[currentDay]].push(alternateAssignment);

				workTimes[currentDay] = 0;
				currentDay++;
			}
        }
    }
	return days;
}

function formatDate(date) {
    const parts = date.split("-");

    const months = {
        // We are unsure if it gives it in MM or just m
        "1": "January",
        "01": "January",
        "2": "Febuary",
        "02": "Febuary",
        "3": "March",
        "03": "March",
        "4": "April",
        "04": "April",
        "5": "May",
        "05": "May",
        "6": "June",
        "06": "June",
        "7": "July",
        "07": "July",
        "8": "August",
        "08": "August",
        "9": "September",
        "09": "September",
        "10": "October",
        "11": "November",
        "12": "December"
    }

    let ending = parts[2].substring(1, 2);
    if (parts[2].length === 1) {
        ending = parts[2];
    }

    const suffix = {
        "1": "st",
        "2": "nd",
        "3": "rd",
        "4": "th",
        "5": "th",
        "6": "th",
        "7": "th",
        "8": "th",
        "9": "th",
        "0": "th"
    }

    return `${months[parts[1]]} ${parts[2]}${suffix[ending]}`
}

function formatLongDate(date) {
	const days = {
		"Mon": "Monday",
		"Tue": "Tuesday",
		"Wed": "Wednesday",
		"Thu": "Thursday",
		"Fri": "Friday",
		"Sat": "Saturday",
		"Sun": "Sunday"
	}

    const months = {
        "Jan": "January",
        "Feb": "February",
        "Mar": "March",
        "Apr": "April",
        "May": "May",
        "Jun": "June",
        "Jul": "July",
        "Aug": "August",
        "Sep": "September",
        "Oct": "October",
        "Nov": "November",
        "Dec": "December"
    }

    const suffix = {
        "1": "st",
        "2": "nd",
        "3": "rd",
        "4": "th",
        "5": "th",
        "6": "th",
        "7": "th",
        "8": "th",
        "9": "th",
        "0": "th"
    }
    
    parts = date.split(" ");
	return `${days[parts[0]]}, ${months[parts[1]]} ${parts[2]}${suffix[parts[2].slice(1)]}`
}

function renderAssignments(days, courses, workTimes) {
    let day_wrapper, day, title, assignments, left_area, course_title, course_link, assignment_area, currentDay, renderedCourses;
    let assignment_div, main_area, icon, assignment_name, assignment_name_link, right_side, estTime, due_date, currentCourse;

	const styleFile = document.createElement("style");
	styleFile.innerText = "body,html{width:100%;height:100%;margin:0;padding:0}body{margin-top:10px}.lower{text-transform:lowercase}.day{font-family:LatoWeb, 'Lato Extended', Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif;margin-left:10px}.day h3{font-size:12pt;font-weight:normal;text-transform:capitalize}.assignments.purple{border-top:1px solid purple;border-left:1px solid purple}.assignments.red{border-top:1px solid red;border-left:1px solid red}.assignments.blue{border-top:1px solid blue;border-left:1px solid blue}.assignments.orange{border-top:1px solid orange;border-left:1px solid orange}.assignments.pink{border-top:1px solid pink;border-left:1px solid pink}.assignments.lightblue{border-top:1px solid lightblue;border-left:1px solid lightblue}.assignments.gray{border-top:1px solid gray;border-left:1px solid gray}.assignments{margin-left:50px;display:grid;grid-template-columns:175px 1fr}.purple .left-area{border-right:1px solid purple;background:purple}.red .left-area{border-right:1px solid red;background:red}.blue .left-area{border-right:1px solid blue;background:blue}.orange .left-area{border-right:1px solid orange;background:orange}.pink .left-area{border-right:1px solid pink;background:pink}.lightblue .left-area{border-right:1px solid lightblue;background:lightblue}.gray .left-area{border-right:1px solid gray;background:gray}.left-area{background:purple;width:175px}.course-title{background:white;font-size:9pt;text-align:center;padding:10px 0;text-transform:uppercase}.course-title a{color:#0076b6;text-decoration:none}.course-title a:hover{text-decoration:underline}.assignment{border-bottom:1px solid #6B7780;display:grid;grid-template-columns:1fr 150px;padding:15px 10px}.main-area{grid-column:1/2;grid-row:1/2;display:flex;align-items:center}.assignment p{padding:0;margin:0}.assignment .title{font-size:13pt;margin-left:10px;height:fit-content;text-transform:capitalize}.assignment .title a{text-decoration:none;color:#0076b6}.assignment .title a:hover{text-decoration:underline}.assignment .right-side{color:#6B7780;text-align:right;font-size:10pt;grid-column:2/3;grid-row:1/2;display:flex;flex-direction:column;justify-content:center}.due-date{text-transform:capitalize}"
	document.querySelector("head").appendChild(styleFile);

    let i = 0;
    for (let curDay of Object.keys(days).reverse()) {
        currentDay = days[curDay];
        renderedCourses = [];
		console.log(currentDay);

		day_wrapper = document.createElement("div");
		day_wrapper.setAttribute("class", "day-wrapper");

		for (let assignment of currentDay) {
			currentCourse = findCourseByTitle(courses, assignment.course);

			if (!renderedCourses.includes(assignment.course)) {
				day = document.createElement("div");
				day.setAttribute("class", "day");

				title = document.createElement("h3");
				title.innerHTML = `${formatLongDate(assignment.due_date)}`

				assignments = document.createElement("div");
				assignments.setAttribute("class", `assignments ${currentCourse.color}`);

				left_area = document.createElement("div");
				left_area.setAttribute("class", "left-area");

				course_title = document.createElement("div");
				course_title.setAttribute("class", "course-title");

				course_link = document.createElement("a");
				// console.log(assignment);
				course_link.setAttribute("href", `https://byui.instructure.com/courses/${assignment.course_id}`);
				course_link.textContent = currentCourse.title;

				assignment_area = document.createElement("div");
				assignment_area.setAttribute("class", "assignment-area");

				day.appendChild(title);
				
				course_title.appendChild(course_link);
				left_area.appendChild(course_title);
				assignments.appendChild(left_area);

				assignments.appendChild(assignment_area);
				day.appendChild(assignments);

				day_wrapper.appendChild(day);
				
				document.querySelector("#dashboard-planner div").appendChild(day_wrapper);
				renderedCourses.push(assignment.course);
			}
			
			assignment_div = document.createElement("div");
			assignment_div.setAttribute("class", "assignment");

			main_area = document.createElement("div");
			main_area.setAttribute("class", "main-area");

			icon = document.createElement("div");
			icon.setAttribute("class", "icon");
			if (assignment.type === "online_quiz") {
				icon.innerHTML = "<svg class='icon' name='IconQuiz' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><g fill-rule='evenodd' stroke='none' stroke-width='1'><path d='M746.255375,1466.76417 L826.739372,1547.47616 L577.99138,1796.11015 L497.507383,1715.51216 L746.255375,1466.76417 Z M580.35118,1300.92837 L660.949178,1381.52637 L329.323189,1713.15236 L248.725192,1632.55436 L580.35118,1300.92837 Z M414.503986,1135.20658 L495.101983,1215.80457 L80.5979973,1630.30856 L0,1549.71056 L414.503986,1135.20658 Z M1119.32036,264.600006 C1475.79835,-91.8779816 1844.58834,86.3040124 1848.35034,88.1280123 L1848.35034,88.1280123 L1865.45034,96.564012 L1873.88634,113.664011 C1875.71034,117.312011 2053.89233,486.101999 1697.30034,842.693987 L1697.30034,842.693987 L1550.69635,989.297982 L1548.07435,1655.17196 L1325.43235,1877.81395 L993.806366,1546.30196 L415.712386,968.207982 L84.0863971,636.467994 L306.72839,413.826001 L972.602367,411.318001 Z M1436.24035,1103.75398 L1074.40436,1465.70397 L1325.43235,1716.61796 L1434.30235,1607.74796 L1436.24035,1103.75398 Z M1779.26634,182.406009 C1710.18234,156.41401 1457.90035,87.1020124 1199.91836,345.198004 L1199.91836,345.198004 L576.90838,968.207982 L993.806366,1385.10597 L1616.70235,762.095989 C1873.65834,505.139998 1804.68834,250.920007 1779.26634,182.406009 Z M858.146371,525.773997 L354.152388,527.597997 L245.282392,636.467994 L496.310383,887.609985 L858.146371,525.773997 Z'></path><path d='M1534.98715,372.558003 C1483.91515,371.190003 1403.31715,385.326002 1321.69316,466.949999 L1281.22316,507.305998 L1454.61715,680.585992 L1494.97315,640.343994 C1577.16715,558.035996 1591.87315,479.033999 1589.82115,427.164001 L1587.65515,374.610003 L1534.98715,372.558003 Z'></path></g></g></svg>";
			} else {
				icon.innerHTML = "<svg class='icon' name='IconAssignment' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><path d='M1468.2137,0 L1468.2137,564.697578 L1355.27419,564.697578 L1355.27419,112.939516 L112.939516,112.939516 L112.939516,1807.03225 L1355.27419,1807.03225 L1355.27419,1581.15322 L1468.2137,1581.15322 L1468.2137,1919.97177 L2.5243549e-29,1919.97177 L2.5243549e-29,0 L1468.2137,0 Z M1597.64239,581.310981 C1619.77853,559.174836 1655.46742,559.174836 1677.60356,581.310981 L1677.60356,581.310981 L1903.4826,807.190012 C1925.5058,829.213217 1925.5058,864.902104 1903.4826,887.038249 L1903.4826,887.038249 L1225.8455,1564.67534 C1215.22919,1575.17872 1200.88587,1581.16451 1185.86491,1581.16451 L1185.86491,1581.16451 L959.985883,1581.16451 C928.814576,1581.16451 903.516125,1555.86606 903.516125,1524.69475 L903.516125,1524.69475 L903.516125,1298.81572 C903.516125,1283.79477 909.501919,1269.45145 920.005294,1258.94807 L920.005294,1258.94807 Z M1442.35055,896.29929 L1016.45564,1322.1942 L1016.45564,1468.225 L1162.48643,1468.225 L1588.38135,1042.33008 L1442.35055,896.29929 Z M677.637094,1242.34597 L677.637094,1355.28548 L338.818547,1355.28548 L338.818547,1242.34597 L677.637094,1242.34597 Z M903.516125,1016.46693 L903.516125,1129.40645 L338.818547,1129.40645 L338.818547,1016.46693 L903.516125,1016.46693 Z M1637.62298,701.026867 L1522.19879,816.451052 L1668.22958,962.481846 L1783.65377,847.057661 L1637.62298,701.026867 Z M1129.39516,338.829841 L1129.39516,790.587903 L338.818547,790.587903 L338.818547,338.829841 L1129.39516,338.829841 Z M1016.45564,451.769356 L451.758062,451.769356 L451.758062,677.648388 L1016.45564,677.648388 L1016.45564,451.769356 Z' fill-rule='evenodd' stroke='none' stroke-width='1'></path></g></svg>";
			}

			assignment_name = document.createElement("p");
			assignment_name.setAttribute("class", "title");

			assignment_name_link = document.createElement("a");
			assignment_name_link.setAttribute("href", `https://byui.instructure.com/courses/${assignment.course_id}/assignments/${assignment.id}`);
			assignment_name_link.textContent = assignment.title;

			right_side = document.createElement("div");
			right_side.setAttribute("class", "right-side");

			estTime = document.createElement("p");
			estTime.setAttribute("class", "estTime");
			estTime.textContent = `${Math.round(assignment.estTime / 60 * 10) / 10}h / ${Math.round(assignment.totalWorkTime / 60 * 10) / 10}h`;

			due_date = document.createElement("p");
			due_date.setAttribute("class", "due-date");

			// Swap from date opject to YYYY-MM-DD
            // console.log(assignment.due_date);
			if (assignment.due_date.length > 11) {
				const dateObject = new Date(assignment.due_date)
				const string_due_date = `${dateObject.getFullYear()}-${dateObject.getMonth()}-${dateObject.getDate()}`;
				due_date.textContent = `due: ${formatDate(string_due_date)}`;
			} else {
				due_date.textContent = `due: ${formatDate(assignment.due_date)}`;
			}
			
			
			assignment_div.appendChild(main_area);

			main_area.appendChild(icon);

			assignment_name.appendChild(assignment_name_link);
			main_area.appendChild(assignment_name);

			right_side.appendChild(estTime);
			right_side.appendChild(due_date);

			assignment_div.appendChild(right_side);

			assignment_area.appendChild(assignment_div);
		}
		i++;
    }
}

function run_everything() {
	removeAllAssignments();
	process_data().then(response => {
		const assignments = response[0];
		const courses = response[1];
		// console.log(courses);
		replaceAssignments(assignments, courses);
	})
}

window.onload = async function() {
	const elements = document.getElementsByClassName("PlannerApp");
	const config = { attributes: true, childList: true, subtree: true};
	for (let element of elements) {
		const observer = new MutationObserver(run_everything);
		observer.observe(element, config);
	}
	run_everything()

};
