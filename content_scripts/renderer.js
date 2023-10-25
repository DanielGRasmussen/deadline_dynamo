function allocateAssignments(data) {
	const days = {
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
		sunday: [],
		overflow: []
	};

	const currentWeek = getWeekOfYear(new Date());
	let currentDay = 0; // 0 = monday
	for (const assignment of data.assignments) {
		// Get a link to the estTime
		let remainingWorkTime = assignment.estTime;
		// Save original worktime for x/total.
		assignment.totalWorkTime = remainingWorkTime;

		assignment.weekNum = getWeekOfYear(new Date(assignment.due_date.slice(4)));

		while (remainingWorkTime > 0) {
			if (!(assignment.weekNum <= currentWeek)) {
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

function getWeekOfYear(date) {
	const now = new Date(date);
	return Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
}

function formatDate(date, include_day = true) {
	const days = {
		Mon: "Monday",
		Tue: "Tuesday",
		Wed: "Wednesday",
		Thu: "Thursday",
		Fri: "Friday",
		Sat: "Saturday",
		Sun: "Sunday"
	};

	const months = {
		Jan: "January",
		Feb: "February",
		Mar: "March",
		Apr: "April",
		May: "May",
		Jun: "June",
		Jul: "July",
		Aug: "August",
		Sep: "September",
		Oct: "October",
		Nov: "November",
		Dec: "December"
	};

	const suffix = {
		1: "st",
		2: "nd",
		3: "rd",
		4: "th",
		5: "th",
		6: "th",
		7: "th",
		8: "th",
		9: "th",
		0: "th"
	};

	let parts = date.split(" ");
	let initial = "";
	if (include_day) {
		initial += `${days[parts[0]]}, `;
	}
	return `${initial}${months[parts[1]]} ${parts[2]}${suffix[parts[2].slice(1)]}`;
}

function renderFromJSON(elements) {
	let element, current_element;
	for (let key of Object.keys(elements)) {
		current_element = elements[key];
		if (!current_element.element) {
			element = document.createElement(current_element.type);
			element.setAttribute("class", current_element.class);
			if (current_element.type === "a") {
				element.setAttribute("href", current_element.href);
			}
			element.innerHTML = current_element.innerHTML;
			current_element.element = element;
			if (typeof current_element.parent === "string") {
				elements[current_element.parent].element.appendChild(element);
			} else {
				current_element.parent.appendChild(element);
			}
		}
	}
}
