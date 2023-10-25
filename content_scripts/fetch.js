class Fetch {
	courseUrl = "https://byui.instructure.com/api/v1/courses?enrollment_state=active&per_page=50";
	courses = [];
	assignments = {};

	async fetchAllCourses() {
		const response = await fetch(this.courseUrl);
		this.courses = await response.json();
	}

	// Function to fetch data and handle pagination
	async fetchAllAssignments(courseId) {
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
	}

	async fetchData() {
		await this.fetchAllCourses();

		for (let course of this.courses) {
			this.assignments[course.id] = await this.fetchAllAssignments(course.id);
		}
	}

	async processData() {
		await this.fetchData();
		const catalog = new Catalog();

		for (let course of this.courses) {
			catalog.createNewCourse(course);

			for (let assignment of this.assignments[course.id]) {
				catalog.populateCourseAssignments(assignment, course.id);
			}
		}

		catalog.calculateAllScores();
		catalog.toJSON();
	}
}
