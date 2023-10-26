class Settings {
	constructor() {
		this.initialize_settings_page().then(() => {
			this.settings = this.get_storage("settings");

			// First time? Generate a new settings object first.
			if (this.settings === null) {
				this.get_new_settings().then(this.load_settings);
			} else {
				this.load_settings();
			}
		});
	}

	async get_new_settings() {
		const data = new Fetch();
		await data.fetchAllCourses();
		const courses = [];

		// Filter out all courses that are generalized without actual assignments.
		for (let course of data.courses) {
			if (!(course.name.includes("Majors") || course.name.includes("Devotional"))) {
				course.weight = 1;
				courses.push(course);
			}
		}

		this.settings = {
			prioritize: "low",
			courses: courses,
			work_times: {
				monday: 300,
				tuesday: 300,
				wednesday: 300,
				thursday: 300,
				friday: 300,
				saturday: 180,
				sunday: 180
			}
		};
		this.set_storage("settings", this.settings);
	}

	convert_to_string(minutes) {
		// Returns string in format of "HH:MM"
		let string = `${Math.floor(minutes / 60)}:${minutes % 60}`;
		if (string.split(":")[0].length === 1) {
			string = `0${string}`;
		}
		if (string.split(":")[1].length === 1) {
			const split = string.split(":");
			string = `${split[0]}:0${split[1]}`;
		}
		return string;
	}

	convert_to_int(duration) {
		// Converts "HH:MM" to minutes as an int.
		const split = duration.split(":");
		return parseInt(split[0]) * 60 + parseInt(split[1]);
	}

	get_storage(key) {
		const value = localStorage.getItem(key);
		if (value === null) {
			return value;
		}
		return JSON.parse(value);
	}

	set_storage(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	async initialize_settings_page() {
		const targetElement = document.getElementById("wrapper");

		targetElement.innerHTML = "";
		document.querySelector("title").innerHTML = "Deadline Dynamo Settings";
		document.querySelector("#mobile-header .mobile-header-title").innerHTML =
			"Deadline Dynamo Settings";

		// I did some testing, and it is pretty much the same speed to load the HTML from a file
		// as it is to just throw minified HTML into the JS file.
		fetch(chrome.runtime.getURL("content_scripts/settings/settings.html"))
			.then(response => response.text())
			.then(htmlContent => {
				targetElement.innerHTML = htmlContent;

				// Click on the course menu toggle to reshow it.
				// For some reason it sometimes doesn't work if it doesn't have a delay.
				setTimeout(() => {
					// Making the function after the delay be the click function is apparently invalid.
					document.getElementById("courseMenuToggle").click();
				}, 50);
			});
	}

	load_settings() {
		console.log(this.settings);
		for (let key of Object.keys(this.settings.work_times)) {
			console.log(key);
			document.getElementById(key).value = this.convert_to_string(
				this.settings.work_times[key]
			);
		}
	}
}
new Settings();
