class Catalog {
    courses = {}
    latestCourseId = 0
    latestAssignmentId = 0
    
    
    saveToStorage() {
        chrome.storage.sync.set("courses", this.assignments);
        chrome.storage.sync.set("latestCourseId", this.assignments);
        chrome.storage.sync.set("latestAssignmentId", this.assignments);
    }

    loadfromstorage() {
        courses = chrome.storage.sync.get("courses");
        latestId = chrome.storage.sync.get("latestCourseId");
        latestId = chrome.storage.sync.get("latestAssignmentId");
    }

    supplyCourseId() {
        latestCourseId++;
        return latestCourseId;
    }

    supplyAssignmentId() {
        latestAssignmentId++;
        return latestAssignmentId;
    }

    createNewCourse() {
        newCourse = new Course();
        newCourse.setId(this.supplyCourseId);
        this.courses.push(newCourse);
    }
}