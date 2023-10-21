async function getStorage(key) {
    return await chrome.storage.sync.get(key);
}

function sort_items() {
    console.log("Sorting Items")
}

window.onload = async function() {
    console.log("Content script here");
    data = await getStorage("testData");
    console.log(JSON.parse(data.testData));

    const elements = document.getElementsByClassName("PlannerApp");
    const config = { attributes: true, childList: true, subtree: true};
    for (element of elements) {
        const observer = new MutationObserver(sort_items);
        observer.observe(element, config);
    }
}