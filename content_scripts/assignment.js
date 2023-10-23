// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// --------------------------------------Assignment----------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class Assignment {
	id = 0;
    course_id = 0;
	description = "";
	due_date;
	points_possible = 0;
	name = "";
	submission_types = "";
	has_submitted_submissions = false;
	guessed_percent = 0;
	importance_score = 0;
	similar_assignments = 0;
	overall_score = 0;
	duration = 0;
	course_name = "";

	loadFromJson(json) {
        try {
		    this.due_date = new Date(json.due_at);
        } catch {
            try {
                this.due_date = new Date(json.due_date);
            } catch {
                this.due_date = null;
            }
        };

        let stringifiedJson = JSON.stringify(json);
		stringifiedJson = stringifiedJson.toLowerCase();
		const parsedJson = JSON.parse(stringifiedJson);

		this.id = parsedJson.id;
		this.description = parsedJson.description;
		this.points_possible = parsedJson.points_possible;
		this.name = parsedJson.name;
		this.submission_types = parsedJson.submission_types;
		if (parsedJson.has_submitted_submissions == true) {
            this.due_date = null;
        }

        // Make null descriptions impossible
        if (this.description == null) {
            this.description = "a";
        }
	}

	findTimeInDescription() {
		//Find indexes of time keywords
		let minutes_index = this.description.indexOf("minute");
		if (minutes_index == -1) {
			minutes_index = this.description.indexOf("minutes");
		}
		let hours_index = this.description.indexOf("hour");
		if (hours_index == -1) {
			hours_index = this.description.indexOf("hours");
		}
		let days_index = this.description.indexOf("day");
		if (days_index == -1) {
			days_index = this.description.indexOf("days");
		}

		//Find numbers surrounding the words
		if (minutes_index == -1) {
			if (!isNaN(this.description[minutes_index - 1])) {
				return ["minutes", this.description[minutes_index]];
			}
		}
        
		else if (hours_index == -1) {
			if (!isNaN(this.description[hours_index - 1])) {
				return ["hours", this.description[hours_index]];
			}
		}
        
		else if (days_index == -1) {
			if (!isNaN(this.description[days_index - 1])) {
				return ["minutes", this.description[days_index]];
			}
		}

		else {
			return ["null", 0];
		}
	}

	guessPercentage() {
		// Keyword strategy
        if (this.name.indexOf("final") != -1 || this.name.indexOf("exam") != -1) {
            this.guessed_percent = 3;
            return 3;
        }
        if (this.name.indexOf("quiz") != -1) {
            this.guessed_percent = 3;
            return 3;
        }
        if (this.name.indexOf("homework") != -1) {
            this.guessed_percent = 1;
            return 1;
        }

		//Submission type strategy
		// console.log("keyword strategy for percentage guess failed; using submission type strategy");


		switch(this.submission_types) {
		case "online_quiz":
			this.guessed_percent = 2;
			return 2;
		case "none":
			this.guessed_percent = 0;
			return 0;
		case "on_paper":
			this.guessed_percent = 2;
			return 3;
		case "discussion_topic":
			this.guessed_percent = 1;
			return 1.5;
		case "external_tool":
			this.guessed_percent = 2;
			return 2;
		case "online_upload":
			this.guessed_percent = 2;
			return 3;
		case "online_text_entry":
			this.guessed_percent = 1;
			return 1;
		case "online_url":
			this.guessed_percent = 2;
			return 3;
		case "media_recording":
			this.guessed_percent = 2;
			return 3;
		case "student_annotation":
			this.guessed_percent = 1;
			return 1;
		default:
			// console.log("WARNING: Submission type strategy for weight guessing failed.");
			// console.log("Returning 1, weight will be ignored");
			// console.log("submission_types = " + this.submission_types);
			this.guessed_percent = 1;
			return 1;
		}
	}

	calculateImportance() {
		const points = this.points_possible;
		const percentage = this.guessPercentage();
        // console.log(this.points_possible);
        // console.log(this.guessed_percent);
		this.importance_score = points * percentage;
	}

    async getFromStorageSync(key) { //Chrome storage is officialy synchronous, but returns promises, which is infuriating and stupid and has been just one of MANY MANY MANY cases of libraries just being poorly designed during this project. here's what chatGPT spat out so I don't have to deal with it.
        let value;
        await new Promise((resolve) => {
          chrome.storage.sync.get(key, (result) => {
            value = result[key];
            resolve();
          });
        });
        return value;
      }

	calculateDuration() {
		//Try direct search
		const foundTime = this.findTimeInDescription();
		if (!foundTime == ["null", 0]) {
			switch(foundTime[0]) {
			case "minutes":
				return foundTime[1];
			case "hours":
				return foundTime[1] * 60;
			case "days":
				return foundTime[1] * 3 * 60;
			default:
				// console.log("WARNING: somehow reached default in calculateDuration in assignment.js");
			}
		}
		//Guess with algorithm
		if (this.name.includes("attendance")) {
			this.duration = 1;
			return;
		}
		// Define type modifier
		let typeModifier = 1;
		switch(this.submission_types) {
            case "online_quiz":
                typeModifier = 1;
                break;
            case "online_text_entry":
                typeModifier = 1;
                break;
            case "online_upload" || "on_paper":
                typeModifier = 2;
                break;
            default:
                typeModifier = 1;
                break;
		}

		// Set keyword modifiers
		let keywordModifier = 1;
		if (this.name.includes("self-assessment") || this.name.includes("self assessment")) {
			keywordModifier++;
		}
		if (this.name.includes("final") || this.name.includes("notes")) {
			keywordModifier = keywordModifier + 2;
		}
		if (this.name.includes("paper") || this.name.includes("project") || this.name.includes("essay") || this.name.includes("draft")) {
			keywordModifier = keywordModifier + 3;
		}

		const unadjustedDuration = Math.floor( ( (30 * this.similar_assignments + 60 * keywordModifier * typeModifier) + 0.2 * this.points_possible) / 2.2 );

		const adjustedDuration = unadjustedDuration;

		this.duration = adjustedDuration;
		return;
	}

	calculateOverallScore() {
		const today = new Date();
		const daysUntilDue = ( today.getTime() - this.due_date.getTime() ) / (1000 * 3600 * 24);
		this.overall_score = ( this.duration + this.importance_score ) / daysUntilDue;
	}

	computeAllScores() {
		this.calculateImportance();
		this.calculateDuration();
		this.calculateOverallScore();
	}

	toJSON() {
		let stringBuilder = "{";
		stringBuilder += `"id": ${this.id},`;
		stringBuilder += `"course_id": ${this.course_id},`;
		stringBuilder += `"title": "${this.name}",`;
		stringBuilder += `"course": "${this.course_name}",`;
		stringBuilder += `"type": "${this.submission_types}",`;
		stringBuilder += `"points": ${this.points_possible},`;
		stringBuilder += `"estTime": ${this.duration},`;
		stringBuilder += `"importance": ${this.importance_score},`;
		stringBuilder += `"priority": ${this.overall_score},`;
		stringBuilder += `"due_date": "${this.due_date.toDateString()}",`;
		stringBuilder += `"status": ${this.has_submitted_submissions ? 0 : 1}`;
		stringBuilder += `}`;
		return stringBuilder;
	}

}