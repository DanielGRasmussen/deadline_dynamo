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
