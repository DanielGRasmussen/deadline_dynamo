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
		// Filter out assignments without due dates
		if (newAssignment.due_date !== null) {
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

	countOccurrences(string, subString, allowOverlapping) {
		// https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
		if (subString.length <= 0) return string.length + 1;

		let n = 0,
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
		for (let i = 0; i < this.assignments.length; i++) {
			this.assignments[i].similar_assignments = this.countSimilarAssignments(
				this.assignments[i]
			);
			this.assignments[i].computeAllScores();
		}
	}

	toJSON() {
		return [this.course_code, this.name];
	}

	allAssignmentsToJSON() {
		let json = [];
		for (let assignment of this.assignments) {
			json.push(assignment.toJSON());
		}
		return json;
	}
}
