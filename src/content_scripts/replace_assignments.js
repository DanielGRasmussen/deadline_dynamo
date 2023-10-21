async function getStorage(key) {
	const assignments = [
		{
			"title": "W06 Reflection",
			"course": "WDD 331R",
			"type": "Quiz",
			"estTime": 300,
			"priority": 6, // I don’t know the complete metric
			"status": 1, // 0 = incomplete, 1 = in-progress, 2 = complete
			"due_date": "2023-10-22"
		},
		{
			"title": "W07 Reflection",
			"course": "WDD 331R",
			"type": "Assignment",
			"estTime": 150,
			"priority": 3, // I don’t know the complete metric
			"status": 1, // 0 = incomplete, 1 = in-progress, 2 = complete
			"due_date": "2023-10-22"
		}
	]
    
	if (key === "assignments") {
		return assignments;
	} else if (key === "workTimes") {
		return [
			360,
			180,
			420,
			180,
			360,
			420,
			480,
			0
		];
	} else {
		return await chrome.storage.sync.get(key);
	}
	return assignments;//await chrome.storage.sync.get(key);
}

async function saveStorage(key, value) {
	chrome.storage.sync.set({[key]: value});
}

async function replaceAssignments() {
	removeAllAssignments();

	const assignments = await getStorage("assignments");
	const courses = await getStorage("courses");
	const workTimes = await getStorage("workTimes");

	assignColors(courses);
	const days = allocateAssignments(assignments, workTimes);
	// Allocate assignments modifies worktimes, don't use the same between the two.
	renderAssignments(days, await getStorage("workTimes"));
}

function removeAllAssignments() {
	const assignments = document.querySelectorAll(".Day-styles__root.planner-day");

	for (let assignment of assignments) {
		assignment.remove();
	}
}

function assignColors(courses) {
    const colorOptions = ["gray", "lightblue", "pink", "orange", "blue", "red", "purple"]
    for (let key of Object.keys(courses)) {
        courses[key].color = colorOptions.pop();
    }

	saveStorage("courses", courses);
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

    let currentDay = 0; // 0 = monday
    for (const assignment of assignments) {
		// Get a link to the estTime
        let remainingWorkTime = assignment.estTime;
        // Save original worktime for x/total.
        assignment.totalWorkTime = remainingWorkTime;
        // Get week num
        let due_date = new Date(`${assignment.due_date} `);
        let startDate = new Date(due_date.getFullYear(), 0, 1);
        let dayCount = Math.floor((due_date - startDate) /
            (24 * 60 * 60 * 1000) + 1);

        assignment.weekNum = Math.floor(dayCount / 7);
        while (remainingWorkTime > 0) {
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
    // "2023-10-23"
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

function renderAssignments(days, workTimes) {
    let day, title, assignments, left_area, course_title, course_link, assignment_area, currentDay, renderedCourses;
    let assignment_div, main_area, icon, assignment_name, assignment_name_link, right_side, estTime, due_date;

    let i = 0;
    for (let curDay of Object.keys(days)) {
        currentDay = days[curDay];
        renderedCourses = [];
        for (let assignment of currentDay) {
            if (!renderedCourses.includes(assignment.course)) {
                day = document.createElement("div");
                day.setAttribute("class", "day");

                title = document.createElement("h3");
                // "2023-10-23"
                const tempDate = new Date(parseInt(assignment.due_date.substring(0, 4)), 0);
                const newDate = new Date(tempDate.setDate((assignment.weekNum + 4) * 7 + i - 3));
                const dateString = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`;
                title.innerHTML = `${curDay}, ${formatDate(dateString)} <input value="${Math.round(workTimes[i] / 60 * 10) / 10}" type="number" class="total-time-day"><span class="lower">h</span>`

                assignments = document.createElement("div");
                assignments.setAttribute("class", `assignments ${courses[assignment.course].color}`);

                left_area = document.createElement("div");
                left_area.setAttribute("class", "left-area");

                course_title = document.createElement("div");
                course_title.setAttribute("class", "course-title");

                course_link = document.createElement("a");
                course_link.setAttribute("href", "#");
                course_link.textContent = courses[assignment.course].name;

                assignment_area = document.createElement("div");
                assignment_area.setAttribute("class", "assignment-area");

                day.appendChild(title);
                
                course_title.appendChild(course_link);
                left_area.appendChild(course_title);
                assignments.appendChild(left_area);

                assignments.appendChild(assignment_area);
                day.appendChild(assignments);
                
                document.querySelector("#dashboard-planner div").appendChild(day);
                renderedCourses.push(assignment.course);
            }
            
            assignment_div = document.createElement("div");
            assignment_div.setAttribute("class", "assignment");

            main_area = document.createElement("div");
            main_area.setAttribute("class", "main-area");

            icon = document.createElement("div");
            icon.setAttribute("class", "icon");
            if (assignment.type === "Quiz") {
                icon.innerHTML = "<svg class='icon' name='IconQuiz' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><g fill-rule='evenodd' stroke='none' stroke-width='1'><path d='M746.255375,1466.76417 L826.739372,1547.47616 L577.99138,1796.11015 L497.507383,1715.51216 L746.255375,1466.76417 Z M580.35118,1300.92837 L660.949178,1381.52637 L329.323189,1713.15236 L248.725192,1632.55436 L580.35118,1300.92837 Z M414.503986,1135.20658 L495.101983,1215.80457 L80.5979973,1630.30856 L0,1549.71056 L414.503986,1135.20658 Z M1119.32036,264.600006 C1475.79835,-91.8779816 1844.58834,86.3040124 1848.35034,88.1280123 L1848.35034,88.1280123 L1865.45034,96.564012 L1873.88634,113.664011 C1875.71034,117.312011 2053.89233,486.101999 1697.30034,842.693987 L1697.30034,842.693987 L1550.69635,989.297982 L1548.07435,1655.17196 L1325.43235,1877.81395 L993.806366,1546.30196 L415.712386,968.207982 L84.0863971,636.467994 L306.72839,413.826001 L972.602367,411.318001 Z M1436.24035,1103.75398 L1074.40436,1465.70397 L1325.43235,1716.61796 L1434.30235,1607.74796 L1436.24035,1103.75398 Z M1779.26634,182.406009 C1710.18234,156.41401 1457.90035,87.1020124 1199.91836,345.198004 L1199.91836,345.198004 L576.90838,968.207982 L993.806366,1385.10597 L1616.70235,762.095989 C1873.65834,505.139998 1804.68834,250.920007 1779.26634,182.406009 Z M858.146371,525.773997 L354.152388,527.597997 L245.282392,636.467994 L496.310383,887.609985 L858.146371,525.773997 Z'></path><path d='M1534.98715,372.558003 C1483.91515,371.190003 1403.31715,385.326002 1321.69316,466.949999 L1281.22316,507.305998 L1454.61715,680.585992 L1494.97315,640.343994 C1577.16715,558.035996 1591.87315,479.033999 1589.82115,427.164001 L1587.65515,374.610003 L1534.98715,372.558003 Z'></path></g></g></svg>";
            } else {
                icon.innerHTML = "<svg class='icon' name='IconAssignment' viewBox='0 0 1920 1920' rotate='0' width='1em' height='1em' aria-hidden='true' role='presentation' focusable='false' class='dUOHu_bGBk dUOHu_drOs dUOHu_eXrk cGqzL_bGBk cGqzL_owrh' style='width: 1em; height: 1em;'><g role='presentation'><path d='M1468.2137,0 L1468.2137,564.697578 L1355.27419,564.697578 L1355.27419,112.939516 L112.939516,112.939516 L112.939516,1807.03225 L1355.27419,1807.03225 L1355.27419,1581.15322 L1468.2137,1581.15322 L1468.2137,1919.97177 L2.5243549e-29,1919.97177 L2.5243549e-29,0 L1468.2137,0 Z M1597.64239,581.310981 C1619.77853,559.174836 1655.46742,559.174836 1677.60356,581.310981 L1677.60356,581.310981 L1903.4826,807.190012 C1925.5058,829.213217 1925.5058,864.902104 1903.4826,887.038249 L1903.4826,887.038249 L1225.8455,1564.67534 C1215.22919,1575.17872 1200.88587,1581.16451 1185.86491,1581.16451 L1185.86491,1581.16451 L959.985883,1581.16451 C928.814576,1581.16451 903.516125,1555.86606 903.516125,1524.69475 L903.516125,1524.69475 L903.516125,1298.81572 C903.516125,1283.79477 909.501919,1269.45145 920.005294,1258.94807 L920.005294,1258.94807 Z M1442.35055,896.29929 L1016.45564,1322.1942 L1016.45564,1468.225 L1162.48643,1468.225 L1588.38135,1042.33008 L1442.35055,896.29929 Z M677.637094,1242.34597 L677.637094,1355.28548 L338.818547,1355.28548 L338.818547,1242.34597 L677.637094,1242.34597 Z M903.516125,1016.46693 L903.516125,1129.40645 L338.818547,1129.40645 L338.818547,1016.46693 L903.516125,1016.46693 Z M1637.62298,701.026867 L1522.19879,816.451052 L1668.22958,962.481846 L1783.65377,847.057661 L1637.62298,701.026867 Z M1129.39516,338.829841 L1129.39516,790.587903 L338.818547,790.587903 L338.818547,338.829841 L1129.39516,338.829841 Z M1016.45564,451.769356 L451.758062,451.769356 L451.758062,677.648388 L1016.45564,677.648388 L1016.45564,451.769356 Z' fill-rule='evenodd' stroke='none' stroke-width='1'></path></g></svg>";
            }

            assignment_name = document.createElement("p");
            assignment_name.setAttribute("class", "title");

            assignment_name_link = document.createElement("a");
            assignment_name_link.setAttribute("href", "#");
            assignment_name_link.textContent = assignment.title;

            right_side = document.createElement("div");
            right_side.setAttribute("class", "right-side");

            estTime = document.createElement("p");
            estTime.setAttribute("class", "estTime");
            estTime.textContent = `${Math.round(assignment.estTime / 60 * 10) / 10}h / ${Math.round(assignment.totalWorkTime / 60 * 10) / 10}h`;

            due_date = document.createElement("p");
            due_date.setAttribute("class", "due-date");
            due_date.textContent = `due: ${formatDate(assignment.due_date)}`;
            
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

window.onload = async function() {
	console.log("Content script here");

	const elements = document.getElementsByClassName("PlannerApp");
	const config = { attributes: true, childList: true, subtree: true};
	for (let element of elements) {
		const observer = new MutationObserver(replaceAssignments);
		observer.observe(element, config);
	}
};