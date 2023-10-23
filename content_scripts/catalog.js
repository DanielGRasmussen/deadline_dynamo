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