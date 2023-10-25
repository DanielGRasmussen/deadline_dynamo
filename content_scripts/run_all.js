async function run_everything() {
	const data = new Fetch();
	await data.processData();
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
