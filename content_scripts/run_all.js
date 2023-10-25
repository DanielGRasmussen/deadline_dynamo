function run_everything() {
	removeAllAssignments();
	process_data().then(response => {
		const assignments = response[0];
		const courses = response[1];

		replaceAssignments(assignments, courses);
	});
}

window.onload = async function () {
	const elements = document.getElementsByClassName("PlannerApp");
	const config = { attributes: true, childList: true, subtree: true };
	for (let element of elements) {
		const observer = new MutationObserver(run_everything);
		observer.observe(element, config);
	}
	run_everything();
};
