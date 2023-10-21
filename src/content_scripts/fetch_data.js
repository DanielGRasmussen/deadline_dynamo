const courseUrl = "https://byui.instructure.com/api/v1/courses?enrollment_state=active&per_page=50";

function setStorage(key, value) {
    chrome.storage.sync.set({key: value});
}

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

	for (course of courseData) {
		course.assignments = await fetchAllAssignments(course.id);
	}
	console.log(courseData);
	setStorage("allData", JSON.stringify(courseData));
}

fetch_data().then(() => {
	console.log(JSON.parse(chrome.storage.sync.get("allData")));
	console.log(JSON.parse(chrome.storage.sync.get("key")));
});

/*
go through the array from the initial fetch request.
they all are courses with an id attribute.
do a fetch request to the second link with the id replaced in the link
if there are 50 items in the array thats returned then request again with "&page=2" 
repeat until less than 50 items returned by that


{
    "id": 251030,
    "name": "Advanced Writing & Research",
    "account_id": 70,
    "uuid": "y2gZ6SdUvCN8aLsHBOiwDL5zTD8bDnmsia4lNI66",
    "start_at": null,
    "grading_standard_id": 0,
    "is_public": false,
    "created_at": "2023-06-30T18:16:08Z",
    "course_code": "ENG 301",
    "default_view": "wiki",
    "root_account_id": 1,
    "enrollment_term_id": 299,
    "license": "private",
    "grade_passback_setting": null,
    "end_at": null,
    "public_syllabus": false,
    "public_syllabus_to_auth": false,
    "storage_quota_mb": 2000,
    "is_public_to_auth_users": false,
    "homeroom_course": false,
    "course_color": null,
    "friendly_name": null,
    "apply_assignment_group_weights": true,
    "locale": "en",
    "calendar": {
        "ics": "https://byui.instructure.com/feeds/calendars/course_y2gZ6SdUvCN8aLsHBOiwDL5zTD8bDnmsia4lNI66.ics"
    },
    "time_zone": "America/Denver",
    "blueprint": false,
    "template": false,
    "enrollments": [
        {
            "type": "student",
            "role": "StudentEnrollment",
            "role_id": 3,
            "user_id": 57707,
            "enrollment_state": "active",
            "limit_privileges_to_course_section": true
        }
    ],
    "hide_final_grades": false,
    "workflow_state": "available",
    "course_format": "on_campus",
    "restrict_enrollments_to_course_dates": false
}
*/