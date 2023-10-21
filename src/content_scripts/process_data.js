// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ---------------------------------------Catalog------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class Catalog {
    courses = []
    
    
    saveToStorage() {
        chrome.storage.sync.set("courses", this.courses);
    }

    loadfromstorage() {
        courses = chrome.storage.sync.get("courses");
    }

    createNewCourse(json) {
        const newCourse = new Course();
        newCourse.loadFromJson(json);
        this.courses.push(newCourse);
    }

    populateCourseAssignments(json, course_id) {
        course = new Course();
        course.id=-1;
        for (let i=0; i < this.courses.length; i++) {
            if (this.courses[i].id == course_id) {
                course = this.courses[i];
                break;
            } 
        }

        if (course.id == -1) {
            console.log("WARNING: Course with id " + course_id + " does not exist. Aborting.");
            return;
        }

        for (let i=0; i < json.length; i++) {
            course.addAssignment(JSON.stringify(json[i]));
        }
    }

    calculateAllScores() {
        for (let i=0; i < this.courses.length; i++) {
            this.courses[i].computeAllAssignmentScores();
        }
    }

    getCourse(id) {
        for (let i=0; i < this.courses.length; i++) {
            if (courses[i].id == id) {
                return courses[i];
            }
        }
        throw new Error("Catalog.getCourse: Course id " + id + " does not exist.");
    }

    getAllAssignments() {
        assignments = [];
        for (let i=0; i < this.courses.length; i++) {
            assignments = assignments.concat(courses[i].assignments);
        }
        return assignments;
    }

    toJSON() {
        let stringBuilder = "const assignments = [";
        for (let i=0; i < this.courses.length; i++) {
            if (i == this.courses.length - 1) {
                stringBuilder += this.courses[i].allAssignmentsToJSON(true);
            } else {
                stringBuilder += this.courses[i].allAssignmentsToJSON(false); //bool is backwards from how you'd expect. true=no comma, false=comma
            }
        }
        stringBuilder += "]";

        stringBuilder += "const courses = {";
        for (let i=0; i < this.courses.length; i++) {
            stringBuilder += this.courses[i].toJSON();
            if (!i == this.courses.length - 1) {
                stringBuilder += ",";
            }
        }
        stringBuilder += "}"
        return stringBuilder;
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
       assignment_names.push(newAssignment.name);
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
       assignmentName = assignment.name;
       number = 0;
       
       occurences = this.countOccurrences(this.assignment_names, assignmentName);
       return occurences - 1;
      }
 
      computeAllAssignmentScores() {
       for (let i=0; i < this.assignments.length; i++) {
          assignments[i].similar_assignments = this.countSimilarAssignments(assignments[i])
          assignments[i].computeAllAssignmentScores;
       }
      }
 
      toJSON() {
       let stringBuilder = '';
       stringBuilder += "\"" + this.course_code + "\":{";
       stringBuilder += "\"title\":" + this.name + "\"}";
      }
 
      allAssignmentsToJSON(removeTrailingComma=false) {
       let firstAssignment = true; //this really should be "isFirstAssignment" for readibility but it's 4am and I already wrote it this way
       let stringBuilder = "";
       for (let i=0 ; i < this.assignments.length; i++) {
          
          if (firstAssignment === false) {
             stringBuilder += ",";
          } else {
             firstAssignment = false;
          }
 
          stringBuilder += this.assignments[i].toJSON();
 
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
    description = '';
    due_date;
    points_possible = 0;
    name = '';
    submission_types = '';
    has_submitted_submissions = false;
    guessed_percent = 0;
    importance_score = 0;
    similar_assignments = 0;
    overall_score = 0;
    duration = 0;
    course_name = "";

    loadFromJson(json) {
        stringifiedJson = JSON.stringify(json);
        due_date = json.due_date; //pretty sure this is case sensitive

        stringifiedJson = stringifiedJson.toLowerCase();
        parsedJson = JSON.parse(stringifiedJson);

        id = parsedJson.id;
        description = parsedJson.description;
        points_possible = parsedJson.points_possible;
        name = parsedJson.name;
        submission_types = parsedJson.submission_types;
        has_submitted_submissions = parsedJson.has_submitted_submissions;
    }

    findTimeInDescription() {
        //Find indexes of time keywords
        minutes_index = this.description.indexOf('minute');
        if (minutes_index == -1) {
            minutes_index = this.description.indexOf('minutes');
        }
        hours_index = this.description.indexOf('hour');
        if (hours_index == -1) {
            hours_index = this.description.indexOf('hours');
        }
        days_index = this.description.indexOf('day');
        if (days_index == -1) {
            days_index = this.description.indexOf('days');
        }

        //Find numbers surrounding the words
        if (minutes_index == -1) {
            if (!isNaN(this.description[minutes_index - 1])) {
                return ['minutes', this.description[minutes_index]];
            }
        }
        
        else if (hours_index == -1) {
            if (!isNaN(this.description[hours_index - 1])) {
                return ['hours', this.description[hours_index]];
            }
        }
        
        else if (days_index == -1) {
            if (!isNaN(this.description[days_index - 1])) {
                return ['minutes', this.description[days_index]];
            }
        }

        else {
            return ['null', 0];
        }
    }

    guessPercentage() {
        // Keyword strategy
        if (this.description.indexOf("final") != -1 || this.description.indexOf("exam") != -1) {
            this.guessed_percent = 60;
            return;
        }
        if (this.description.indexOf("quiz") != -1) {
            this.guessed_percent = 30;
            return;
        }
        if (this.description.indexOf("homework") != -1) {
            this.guessed_percent = 20;
            return;
        }

        //Submission type strategy
        console.log('keyword strategy for percentage guess failed; using submission type strategy');

        switch(this.submission_types) {
            case "online quiz":
                this.guessed_percent = 30;
                return;
            case "none":
                this.guessed_percent = 0;
                return;
            case "on_paper":
                this.guessed_percent = 30;
                return;
            case "discussion_topic":
                this.guessed_percent = 15;
                return;
            case "external_tool":
                this.guessed_percent = 20;
                return;
            case "online_upload":
                this.guessed_percent = 35;
                return;
            case "online_text_entry":
                this.guessed_percent = 10;
                return;
            case "online_url":
                this.guessed_percent = 25;
                return;
            case "media_recording":
                this.guessed_percent = 30;
                return;
            case "student_annotation":
                this.guessed_percent = 10;
                return;
            default:
                console.log("WARNING: Submission type strategy for weight guessing failed.");
                console.log("Returning -1, weight will be ignored");
                console.log("submission_types = " + this.submission_types);
                this.guessed_percent = -1;
                return;
        }
    }

    calculateImportance() {
        points = this.points_possible;
        percentage = this.guessPercentage() * 0.01;
        this.importance_score = points * percentage;
    }

    calculateDuration() {
        //Try direct search
        foundTime = this.findTimeInDescription();
        if (!foundTime == ["null", 0]) {
            switch(foundTime[0]) {
                case "minutes":
                    return foundTime[1];
                case "hours":
                    return foundTime[1] * 60;
                case "days":
                    return foundTime[1] * 3 * 60
                default:
                    console.log("WARNING: somehow reached default in calculateDuration in assignment.js");
            }
        }
        //Guess with algorithm
        if (this.description.indexOf('attendance') != -1) {
            duration = 1;
            return;
        }
        // Define type modifier
        typeModifier = 1;
        switch(this.submission_types) {
            case "online_quiz":
                typeModifier = 0.9;
            case "online_text_entry":
                typeModifier = 1.1;
            case "online_upload" || "on_paper":
                typeModifier = 2;
            default:
                typeModifier = 1;
        }

        // Set keyword modifiers
        keywordModifier = 1;
        if (this.name.includes("self-assessment") || this.name.includes("self assessment")) {
            keywordModifier++;
        }
        if (this.name.includes("final") || this.name.includes("notes")) {
            keywordModifier = keywordModifier + 2;
        }
        if (this.name.includes("paper") || this.name.includes("project") || this.name.includes("essay") || this.name.includes("draft")) {
            keywordModifier = keywordModifier + 3;
        }

        unadjustedDuration = Math.floor( ( (30 * this.similar_assignments + 60 * keywordModifier * typeModifier) + 0.5 * this.points_possible) / 2 );

        userPercentOffset = chrome.storage.sync.get("durationOffset");

        adjustedDuration = unadjustedDuration + unadjustedDuration * userPercentOffset;

        this.duration = adjustedDuration;
        return;
    }

    calculateOverallScore() {
        today = new Date().toISOString().slice(0, 10);
        daysUntilDue = ( this.due_date.getTime() - today.getTime() ) / (1000 * 3600 * 24);
        this.overall_score = ( this.duration + this.importance_score ) / daysUntilDue;
    }

    computeAllScores() {
        this.calculateImportance();
        this.calculateDuration();
        this.calculateOverallScore();
    }

    toJSON() {
        let stringBuilder = "{";
        stringBuilder += "\"title\":" + "\"" + this.name + "\",";
        stringBuilder += "\"course\":" + "\"" + this.course_name + "\",";
        stringBuilder += "\"type\":" + "\"" + this.submission_types + "\",";
        stringBuilder += "\"estTime\":" + "\"" + this.submission_types + "\",";
        stringBuilder += "\"importance\":" + "\"" + this.importance_score + "\",";
        stringBuilder += "\"priority\":" + "\"" + this.overall_score + "\",";
        stringBuilder += "\"due-date\":" + "\"" + this.due_date + "\",";
        stringBuilder += "\"status\":" + "\"" + this.has_submitted_submissions ? 0 : 1 + "\",";
        stringBuilder += "}";
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

		if (data.length === 0) {
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
};

async function fetch_data() {
	const courseData = await getCourseInfo();

	const courseAssignments = {};
	for (course of courseData) {
		let currentAssignments = await fetchAllAssignments(course.id);
		courseAssignments[course.id] = currentAssignments;
	}

	return [courseData, courseAssignments];
}

fetch_data().then(([courseData, courseAssignments]) => {
    const catalog = new Catalog();
    for (course of courseData) {
        catalog.createNewCourse(course);

        for (assignment of courseAssignments[course.id]) {
            catalog.populateCourseAssignments(assignment, course.id);
        }
    }

    catalog.calculateAllScores();

    const finalJson = catalog.toJSON();
    console.log(finalJson);
});
