function getStorage(key) {
    return chrome.storage.sync.get(key);
}

function setStorage(key, value) {
    chrome.storage.sync.set(key, value);
}