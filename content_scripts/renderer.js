async function replaceAssignments(assignments, courses) {
	removeAllAssignments();
	assignColors(courses);

	const days = allocateAssignments(assignments, [300, 300, 300, 300, 300, 180, 180, 0]);
	// Allocate assignments modifies worktimes, don't use the same between the two.
	renderAssignments(days, courses);
}

function removeAllAssignments() {
	// Removes all current assignments.
	for (let remover of document.querySelectorAll(".Day-styles__root.planner-day")) {
		remover.remove();
	}

	for (let remover of document.querySelectorAll(".EmptyDays-styles__nothingPlannedContainer")) {
		remover.remove();
	}

	for (let remover of document.querySelectorAll(
		"div.planner-empty-days.EmptyDays-styles__root"
	)) {
		remover.remove();
	}

	const day_wrappers = document.querySelectorAll(".day-wrapper");
	if (day_wrappers.length > 1) {
		day_wrappers[0].remove();
	}
}

function assignColors(courses) {
	// Yep, if somebody has more than 7 courses it will break.
	const colorOptions = ["gray", "lightblue", "pink", "orange", "blue", "red", "purple"];
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
	for (const assignment of assignments) {
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

function renderAssignments(days, courses) {
	let elements, day_wrapper, currentDay, renderedCourses, currentCourse;

	const styleFile = document.createElement("style");
	const planner = document.querySelector("#dashboard-planner div");
	styleFile.innerText =
		"body,html{width:100%;height:100%;margin:0;padding:0}body{margin-top:10px}.lower{text-transform:lowercase}.day{font-family:LatoWeb, 'Lato Extended', Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif;margin-left:10px}.day h3{font-size:12pt;font-weight:normal;text-transform:capitalize}.assignments.purple{border-top:1px solid purple;border-left:1px solid purple}.assignments.red{border-top:1px solid red;border-left:1px solid red}.assignments.blue{border-top:1px solid blue;border-left:1px solid blue}.assignments.orange{border-top:1px solid orange;border-left:1px solid orange}.assignments.pink{border-top:1px solid pink;border-left:1px solid pink}.assignments.lightblue{border-top:1px solid lightblue;border-left:1px solid lightblue}.assignments.gray{border-top:1px solid gray;border-left:1px solid gray}.assignments{margin-left:50px;display:grid;grid-template-columns:175px 1fr}.purple .left-area{border-right:1px solid purple;background:purple}.red .left-area{border-right:1px solid red;background:red}.blue .left-area{border-right:1px solid blue;background:blue}.orange .left-area{border-right:1px solid orange;background:orange}.pink .left-area{border-right:1px solid pink;background:pink}.lightblue .left-area{border-right:1px solid lightblue;background:lightblue}.gray .left-area{border-right:1px solid gray;background:gray}.left-area{background:purple;width:175px}.course-title{background:white;font-size:9pt;text-align:center;padding:10px 0;text-transform:uppercase}.course-title a{color:#0076b6;text-decoration:none}.course-title a:hover{text-decoration:underline}.assignment{border-bottom:1px solid #6B7780;display:grid;grid-template-columns:1fr 150px;padding:15px 10px}.main-area{grid-column:1/2;grid-row:1/2;display:flex;align-items:center}.assignment p{padding:0;margin:0}.assignment .title{font-size:13pt;margin-left:10px;height:fit-content;text-transform:capitalize}.assignment .title a{text-decoration:none;color:#0076b6}.assignment .title a:hover{text-decoration:underline}.assignment .right-side{color:#6B7780;text-align:right;font-size:10pt;grid-column:2/3;grid-row:1/2;display:flex;flex-direction:column;justify-content:center}.due-date{text-transform:capitalize}";
	document.querySelector("head").appendChild(styleFile);

	for (let curDay of Object.keys(days).reverse()) {
		currentDay = days[curDay];
		renderedCourses = [];

		day_wrapper = document.createElement("div");
		day_wrapper.setAttribute("class", "day-wrapper");

		for (let assignment of currentDay) {
			currentCourse = findCourseByTitle(courses, assignment.course);

			if (!Object.keys(renderedCourses).includes(assignment.course)) {
				elements = {
					day: {
						type: "div",
						class: "day",
						innerHTML: "",
						parent: day_wrapper
					},
					title: {
						type: "h3",
						class: "",
						innerHTML: `${formatDate(assignment.due_date)}`,
						parent: "day"
					},
					assignments: {
						type: "div",
						class: `assignments ${currentCourse.color}`,
						innerHTML: "",
						parent: "day"
					},
					left_area: {
						type: "div",
						class: "left-area",
						innerHTML: "",
						parent: "assignments"
					},
					course_title: {
						type: "div",
						class: "course-title",
						innerHTML: "",
						parent: "left_area"
					},
					course_link: {
						type: "a",
						class: "",
						href: `https://byui.instructure.com/courses/${assignment.course_id}`,
						innerHTML: currentCourse.title,
						parent: "course_title"
					},
					assignment_area: {
						type: "div",
						class: "assignment-area",
						innerHTML: "",
						parent: "assignments"
					}
				};

				renderFromJSON(elements);

				planner.appendChild(day_wrapper);
				renderedCourses[assignment.course] = elements;
			} else {
				elements = renderedCourses[assignment.course];
			}

			elements = {
				...elements,
				assignment_div: {
					type: "div",
					class: "assignment",
					innerHTML: "",
					parent: "assignment_area"
				},
				main_area: {
					type: "div",
					class: "main-area",
					innerHTML: "",
					parent: "assignment_div"
				},
				icon: {
					type: "div",
					class: "icon",
					innerHTML: "", // Defined in if statement below
					parent: "main_area"
				},
				assignment_name: {
					type: "p",
					class: "title",
					innerHTML: "",
					parent: "main_area"
				},
				assignment_name_link: {
					type: "a",
					class: "",
					href: `https://byui.instructure.com/courses/${assignment.course_id}/assignments/${assignment.id}`,
					innerHTML: assignment.title,
					parent: "assignment_name"
				},
				right_side: {
					type: "div",
					class: "right-side",
					innerHTML: "",
					parent: "assignment_div"
				},
				estTime: {
					type: "p",
					class: "estTime",
					innerHTML: `${Math.round((assignment.estTime / 60) * 10) / 10}h / ${
						Math.round((assignment.totalWorkTime / 60) * 10) / 10
					}h`,
					parent: "right_side"
				},
				due_date: {
					type: "p",
					class: "due-date",
					innerHTML: `due: ${formatDate(assignment.due_date, false)}`,
					parent: "right_side"
				}
			};

			if (assignment.type === "online_quiz") {
				elements.icon.innerHTML =
					"<svg class='icon' name='IconQuiz' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><g fill-rule='evenodd' stroke='none' stroke-width='1'><path d='M746.255375,1466.76417 L826.739372,1547.47616 L577.99138,1796.11015 L497.507383,1715.51216 L746.255375,1466.76417 Z M580.35118,1300.92837 L660.949178,1381.52637 L329.323189,1713.15236 L248.725192,1632.55436 L580.35118,1300.92837 Z M414.503986,1135.20658 L495.101983,1215.80457 L80.5979973,1630.30856 L0,1549.71056 L414.503986,1135.20658 Z M1119.32036,264.600006 C1475.79835,-91.8779816 1844.58834,86.3040124 1848.35034,88.1280123 L1848.35034,88.1280123 L1865.45034,96.564012 L1873.88634,113.664011 C1875.71034,117.312011 2053.89233,486.101999 1697.30034,842.693987 L1697.30034,842.693987 L1550.69635,989.297982 L1548.07435,1655.17196 L1325.43235,1877.81395 L993.806366,1546.30196 L415.712386,968.207982 L84.0863971,636.467994 L306.72839,413.826001 L972.602367,411.318001 Z M1436.24035,1103.75398 L1074.40436,1465.70397 L1325.43235,1716.61796 L1434.30235,1607.74796 L1436.24035,1103.75398 Z M1779.26634,182.406009 C1710.18234,156.41401 1457.90035,87.1020124 1199.91836,345.198004 L1199.91836,345.198004 L576.90838,968.207982 L993.806366,1385.10597 L1616.70235,762.095989 C1873.65834,505.139998 1804.68834,250.920007 1779.26634,182.406009 Z M858.146371,525.773997 L354.152388,527.597997 L245.282392,636.467994 L496.310383,887.609985 L858.146371,525.773997 Z'></path><path d='M1534.98715,372.558003 C1483.91515,371.190003 1403.31715,385.326002 1321.69316,466.949999 L1281.22316,507.305998 L1454.61715,680.585992 L1494.97315,640.343994 C1577.16715,558.035996 1591.87315,479.033999 1589.82115,427.164001 L1587.65515,374.610003 L1534.98715,372.558003 Z'></path></g></g></svg>";
			} else {
				elements.icon.innerHTML =
					"<svg class='icon' name='IconAssignment' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><path d='M1468.2137,0 L1468.2137,564.697578 L1355.27419,564.697578 L1355.27419,112.939516 L112.939516,112.939516 L112.939516,1807.03225 L1355.27419,1807.03225 L1355.27419,1581.15322 L1468.2137,1581.15322 L1468.2137,1919.97177 L2.5243549e-29,1919.97177 L2.5243549e-29,0 L1468.2137,0 Z M1597.64239,581.310981 C1619.77853,559.174836 1655.46742,559.174836 1677.60356,581.310981 L1677.60356,581.310981 L1903.4826,807.190012 C1925.5058,829.213217 1925.5058,864.902104 1903.4826,887.038249 L1903.4826,887.038249 L1225.8455,1564.67534 C1215.22919,1575.17872 1200.88587,1581.16451 1185.86491,1581.16451 L1185.86491,1581.16451 L959.985883,1581.16451 C928.814576,1581.16451 903.516125,1555.86606 903.516125,1524.69475 L903.516125,1524.69475 L903.516125,1298.81572 C903.516125,1283.79477 909.501919,1269.45145 920.005294,1258.94807 L920.005294,1258.94807 Z M1442.35055,896.29929 L1016.45564,1322.1942 L1016.45564,1468.225 L1162.48643,1468.225 L1588.38135,1042.33008 L1442.35055,896.29929 Z M677.637094,1242.34597 L677.637094,1355.28548 L338.818547,1355.28548 L338.818547,1242.34597 L677.637094,1242.34597 Z M903.516125,1016.46693 L903.516125,1129.40645 L338.818547,1129.40645 L338.818547,1016.46693 L903.516125,1016.46693 Z M1637.62298,701.026867 L1522.19879,816.451052 L1668.22958,962.481846 L1783.65377,847.057661 L1637.62298,701.026867 Z M1129.39516,338.829841 L1129.39516,790.587903 L338.818547,790.587903 L338.818547,338.829841 L1129.39516,338.829841 Z M1016.45564,451.769356 L451.758062,451.769356 L451.758062,677.648388 L1016.45564,677.648388 L1016.45564,451.769356 Z' fill-rule='evenodd' stroke='none' stroke-width='1'></path></g></svg>";
			}

			renderFromJSON(elements);
		}
	}
}
