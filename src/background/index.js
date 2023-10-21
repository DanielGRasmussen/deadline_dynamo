// // Utility Functions
// function getStorage(key) {
//     return chrome.storage.sync.get(key);
// }

// function setStorage(key, value) {
//     chrome.storage.sync.set(key, value);
// }
// // End of Utility Functions

// // On install schedule requests and run initial request.
// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Installed");
//     scheduleRequest();
//     startRequest();
// });

// // When the browser starts then run an initial request.
// chrome.runtime.onStartup.addListener(() => {
//     console.log("Browser just started");
//     startRequest();
// });

// // Trigger the request when the alarm runs.
// chrome.alarms.onAlarm.addListener(alarm => {
//     // TODO change it to run every 15 minutes if the user has a canvas tab open.
//     if (alarm && alarm.name === "refresh") {
//         startRequest();
//     }
// });

// // Schedule the alarm to run every 2 hours.
// function scheduleRequest() {
//     console.log("Scheduling the alarm");
//     chrome.alarms.create("refresh", { periodInMinutes: 120 });
// }

// function getAuth() {
//     const canvasInstallUrl = "https://canvas.instructure.com/api/v1/courses";
//     const clientId = "460969305247-1f65p9feaf8p166pl00o0v7tnmu1apn4.apps.googleusercontent.com";
//     const redirectUri = "https://canvas.instructure.com/api/v1/courses/oauth_complete";
  
//     const authUrl = `${canvasInstallUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  
//     fetch(authUrl)
//         .then(response => {
//             if (response.ok) {
                
//                 setStorage("Auth", response.json)
//                 return response.json(); // You can parse JSON response if needed
//             } else {
                
//                 throw new Error(`Error: ${response.status} - ${response.statusText}`);
//             }
//         })
// }


// // The useKey function isn't a final fix, it's just to test the other parts of the project we can't access until we fix the OAuth bitsies
// function useKey() {
//     fetch("https://byui.instructure.com/api/v1/courses?access_token=10706~Oz3w0n27AiRiD3CdoXOjGMawnB79DU4LD3n6O3YZhlVCGxvYxc7CrOPi7yfAH9oR")
//     .then(response => {
//         if (response.ok) {
                        
//                 setStorage("Auth", response.json)
//                 return response.json(); // You can parse JSON response if needed
//             } else {
                        
//                 throw new Error(`Error: ${response.status} - ${response.statusText}`);
//             }
//         })
// }

// async function getCourseInfo() {
//     const response = await fetch("https://canvas.instructure.com/api/v1/courses")
//     const courseInfo = await response.json();

//     // courseInfo = "";

//     // await $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent("https://canvas.instructure.com/api/v1/courses?access_token=10706~Oz3w0n27AiRiD3CdoXOjGMawnB79DU4LD3n6O3YZhlVCGxvYxc7CrOPi7yfAH9oR") + '&callback=?', function(data){
// 	// coursInfo = data;
//     // });

//     // setStorage("courseData", courseInfo);
// }

// // Run a request.
// async function startRequest() {
//     console.log("Schedule refresh alarm to run every 2 hours");
//     const get1 = await useKey();
//     const get2 = await getCourseInfo();
//     console.log(get1);
//     console.log(get2);
//     console.log(getStorage("courseData"));
//     console.log(getStorage("Auth"));
// }