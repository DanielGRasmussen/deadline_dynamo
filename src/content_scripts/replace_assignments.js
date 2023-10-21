async function getStorage(key) {
    const assignments = [
        {
            "title": "W06 Reflection",
            "course": "WDD 331R",
            "type": "Assignment", // This or "Quiz," optional if there’s no easy way to get this data
            "estimates": [
                {
                    "estTime": 150,
                    "estType": "past"
                },
                {
                    "estTime": 30,
                    "estType": "dataPoints"
                }
             ],
            "priority": 6, // I don’t know the complete metric
            "progress": 0.25, // Default at 0, frontend will change it.
            "status": 1 // 0 = incomplete, 1 = in-progress, 2 = complete
        }
    ]
    
    return assignments;//await chrome.storage.sync.get(key);
}

function replaceAssignments() {
    removeAllAssignments();

}

function removeAllAssignments() {
    const assignments = document.querySelectorAll(".Day-styles__root.planner-day");

    for (assignment of assignments) {
        assignment.remove();
    }
}

window.onload = async function() {
    console.log("Content script here");
    data = await getStorage("testData");
    // console.log(JSON.parse(data.testData));

    const elements = document.getElementsByClassName("PlannerApp");
    const config = { attributes: true, childList: true, subtree: true};
    for (element of elements) {
        const observer = new MutationObserver(replaceAssignments);
        observer.observe(element, config);
    }
}