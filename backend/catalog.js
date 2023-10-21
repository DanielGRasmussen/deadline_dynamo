class Catalog {
    courses = []
    
    
    saveToStorage() {
        chrome.storage.sync.set("courses", this.courses);
    }

    loadfromstorage() {
        courses = chrome.storage.sync.get("courses");
    }

    createNewCourse(json) {
        newCourse = new Course();
        newCourse.loadFromJson(json);
        this.courses.push(newCourse);
    }

    populateCourseAssignments(json, course_id) {
        course = new Course();
        course.id=-1;
        for (i=0; i < this.courses.length; i++) {
            if (courses[i].id == course_id) {
                course = courses[i];
                break;
            } 
        }

        if (course.id == -1) {
            console.log("WARNING: Course with id " + course_id + " does not exist. Aborting.");
            return;
        }

        assginments = [];
        parsedJson = JSON.parse(json);
        for (i=0; i < parsedJson.length; i++) {
            course.addAssignment(JSON.stringify(parsedJson[i]));
        }
    }

    getCourse(id) {
        for (i=0; i < this.courses.length; i++) {
            if (courses[i].id == id) {
                return courses[i];
            }
        }
        throw new Error("Catalog.getCourse: Course id " + id + " does not exist.");
    }

    getAllAssignments() {
        assignments = [];
        for (i=0; i < this.courses.length; i++) {
            assignments = assignments.concat(courses[i].assignments);
        }
        return assignments;
    }

    calculateAllScores() {
        for (i=0; i < this.courses.length; i++) {
            courses[i].computeAllAssignmentScores();
        }
    }

    toJSON() {
        stringBuilder = "const assignments = [";
        for (i=0; i < this.courses.length; i++) {
            if (i == this.courses.length - 1) {
                stringBuilder += this.courses[i].allAssignmentsToJSON(true);
            } else {
                stringBuilder += this.courses[i].allAssignmentsToJSON(false); //bool is backwards from how you'd expect. true=no comma, false=comma
            }
        }
        stringBuilder += "]";

        stringBuilder += "const courses = {";
        for (i=0; i < this.courses.length; i++) {
            stringBuilder += courses[i].toJSON();
            if (!i == this.courses.length - 1) {
                stringBuilder += ",";
            }
        }
        stringBuilder += "}";
        
        return stringBuilder;
    }

}