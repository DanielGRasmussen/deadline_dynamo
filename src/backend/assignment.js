/*
relevant json data:

id
description
due_date
points_possible
name
submission_types
has_submitted_submissions

submission types and duration weights:

"online_quiz" 0.75 * questions
"none" 1
"on_paper" 2
"discussion_topic" 1
"external_tool" 1.2
"online_upload" 2
"online_text_entry" 1.2
"online_url" 1
"media_recording" (Only valid when the Kaltura plugin is enabled) 1
"student_annotation" 1.5

guessed percentages (trust keywords first)

final: 60
exam: 60
quiz: 30
homework: 20

"online_quiz" 30
"none" 0
"on_paper" 30
"discussion_topic" 15
"external_tool" 20
"online_upload" 35
"online_text_entry" 10
"online_url" 25
"media_recording" (Only valid when the Kaltura plugin is enabled) 30
"student_annotation" 10

*/

class Assignment {
    id = 0;
    description = '';
    due_date;
    points_possible = 0;
    name = '';
    submission_types = '';
    has_submitted_submissions = false;
    guessed_percent = 0;
    importance_score = 0;
    similar_assignments = 0;
    overall_score = 0;

    loadFromJson(json) {
        parsedJson = JSON.parse(json);
        id = parsedJson.id;
        description = parsedJson.description;
        due_date = Date.parse(parsedJson.due_date);
        points_possible = parsedJson.points_possible;
        name = parsedJson.name;
        submission_types = parsedJson.submission_types;
        has_submitted_submissions = parsedJson.has_submitted_submissions;
        duration = 0;
    }

    findTimeInDescription() {
        //Find indexes of time keywords
        minutes_index = this.description.indexOf('minute');
        if (minutes_index == -1) {
            minutes_index = this.description.indexOf('minutes');
        }
        hours_index = this.description.indexOf('hour');
        if (hours_index == -1) {
            hours_index = this.description.indexOf('hours');
        }
        days_index = this.description.indexOf('day');
        if (days_index == -1) {
            days_index = this.description.indexOf('days');
        }

        //Find numbers surrounding the words
        if (minutes_index == -1) {
            if (!isNaN(this.description[minutes_index - 1])) {
                return ['minutes', this.description[minutes_index]];
            }
        }
        
        else if (hours_index == -1) {
            if (!isNaN(this.description[hours_index - 1])) {
                return ['hours', this.description[hours_index]];
            }
        }
        
        else if (days_index == -1) {
            if (!isNaN(this.description[days_index - 1])) {
                return ['minutes', this.description[days_index]];
            }
        }

        else {
            return ['null', 0];
        }
    }

    guessPercentage() {
        // Keyword strategy
        if (this.description.indexOf("final") != -1 || this.description.indexOf("exam") != -1) {
            this.guessed_percent = 60;
            return;
        }
        if (this.description.indexOf("quiz") != -1) {
            this.guessed_percent = 30;
            return;
        }
        if (this.description.indexOf("homework") != -1) {
            this.guessed_percent = 20;
            return;
        }

        //Submission type strategy
        console.log('keyword strategy for percentage guess failed; using submission type strategy');

        switch(this.submission_types) {
            case "online quiz":
                this.guessed_percent = 30;
                return;
            case "none":
                this.guessed_percent = 0;
                return;
            case "on_paper":
                this.guessed_percent = 30;
                return;
            case "discussion_topic":
                this.guessed_percent = 15;
                return;
            case "external_tool":
                this.guessed_percent = 20;
                return;
            case "online_upload":
                this.guessed_percent = 35;
                return;
            case "online_text_entry":
                this.guessed_percent = 10;
                return;
            case "online_url":
                this.guessed_percent = 25;
                return;
            case "media_recording":
                this.guessed_percent = 30;
                return;
            case "student_annotation":
                this.guessed_percent = 10;
                return;
            default:
                console.log("WARNING: Submission type strategy for weight guessing failed.");
                console.log("Returning -1, weight will be ignored");
                console.log("submission_types = " + this.submission_types);
                this.guessed_percent = -1;
                return;
        }
    }

    calculateImportance() {
        points = this.points_possible;
        percentage = this.guessPercentage() * 0.01;
        this.importance_score = points * percentage;
    }

    calculateDuration() {
        //Try direct search
        foundTime = this.findTimeInDescription();
        if (!foundTime == ["null", 0]) {
            switch(foundTime[0]) {
                case "minutes":
                    return foundTime[1];
                case "hours":
                    return foundTime[1] * 60;
                case "days":
                    return foundTime[1] * 3 * 60
                default:
                    console.log("WARNING: somehow reached default in calculateDuration in assignment.js");
            }
        }
        //Guess with algorithm
        if (this.description.indexOf('attendance') != -1) {
            duration = 1;
            return;
        }
        // Define type modifier
        typeModifier = 1;
        switch(this.submission_types) {
            case "online_quiz":
                typeModifier = 0.9;
            case "online_text_entry":
                typeModifier = 1.1;
            case "online_upload" || "on_paper":
                typeModifier = 2;
            default:
                typeModifier = 1;
        }

        // Set keyword modifiers
        keywordModifier = 1;
        if (this.name.includes("self-assessment") || this.name.includes("self assessment")) {
            keywordModifier++;
        }
        if (this.name.includes("final") || this.name.includes("notes")) {
            keywordModifier = keywordModifier + 2;
        }
        if (this.name.includes("paper") || this.name.includes("project") || this.name.includes("essay") || this.name.includes("draft")) {
            keywordModifier = keywordModifier + 3;
        }

        unadjustedDuration = Math.floor( ( (30 * this.similar_assignments + 60 * keywordModifier * typeModifier) + 0.5 * this.points_possible) / 2 );

        userPercentOffset = chrome.storage.sync.get("durationOffset");

        adjustedDuration = unadjustedDuration + unadjustedDuration * userPercentOffset;

        this.duration = adjustedDuration;
        return;
    }

    calculateOverallScore() {
        today = new Date().toISOString().slice(0, 10);
        daysUntilDue = ( this.due_date.getTime() - today.getTime() ) / (1000 * 3600 * 24);
        this.overall_score = ( this.duration + this.importance_score ) / daysUntilDue;
    }

    computeAllScores() {
        this.calculateImportance();
        this.calculateDuration();
        this.calculateOverallScore();
    }

}