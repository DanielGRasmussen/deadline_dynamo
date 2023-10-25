class Catalog {
	courses = [];
	createNewCourse(json) {
		const newCourse = new Course();
		newCourse.loadFromJson(json);
		this.courses.push(newCourse);
	}

	populateCourseAssignments(json, course_id) {
		this.getCourse(course_id).addAssignment(json);
	}

	calculateAllScores() {
		for (let i = 0; i < this.courses.length; i++) {
			this.courses[i].computeAllAssignmentScores();
		}
	}

	getCourse(id) {
		for (let i = 0; i < this.courses.length; i++) {
			if (this.courses[i].id === id) {
				return this.courses[i];
			}
		}
		throw new Error("Catalog.getCourse: Course id " + id + " does not exist.");
	}

	getAllAssignments() {
		let assignments = [];
		for (let i = 0; i < this.courses.length; i++) {
			assignments = assignments.concat(this.courses[i].assignments);
		}
		return assignments;
	}

	toJSON() {
		const assignments = [];
		const courses = {};
		let courseCode, courseTitle;
		for (let course of this.courses) {
			assignments.push(...course.allAssignmentsToJSON());

			[courseCode, courseTitle] = course.toJSON();
			courses[courseCode] = { title: courseTitle };
		}
		return [assignments, courses];
	}
}
