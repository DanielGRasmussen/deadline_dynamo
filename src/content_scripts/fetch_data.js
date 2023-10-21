function getAccessTokenFromUser() {
    // Get token elsewhere when finalized.
    const token = prompt("Please enter your Canvas Access Token: ");
  
    if (token !== null) {
      accessToken = token;
      console.log("Access Token set to:", accessToken);
      chrome.storage.sync.set("Access Token", accessToken);
    } else {
      console.log("No Access Token provided.");
    }
  }


function getAuth() {
    const canvasInstallUrl = "https://byui.instructure.com/api/v1/courses";
    const clientId = "460969305247-1f65p9feaf8p166pl00o0v7tnmu1apn4.apps.googleusercontent.com";
    const redirectUri = "https://byui.instructure.com/api/v1/courses/oauth_complete";
  
    // const authUrl = `${canvasInstallUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  
    // fetch(authUrl)
    //     .then(response => {
    //         if (response.ok) {
                
    //             setStorage("Auth", response.json)
    //             // return response.json();
    //         }
            
    //         else {
                
    //             throw new Error(`Error: ${response.status} - ${response.statusText}`);
    //         }
    //     })
}

// The useKey function isn't a final fix, it's just to test the other parts of the project we can't access until we fix the OAuth bitsies
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

async function getCourseInfo() {
    const response = await fetch("https://byui.instructure.com/api/v1/courses")
    const courseInfo = await response.json();

    console.log(response);
    console.log(courseInfo);

    // courseInfo = "";

    // await $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent("https://canvas.instructure.com/api/v1/courses?access_token=10706~Oz3w0n27AiRiD3CdoXOjGMawnB79DU4LD3n6O3YZhlVCGxvYxc7CrOPi7yfAH9oR") + '&callback=?', function(data){
	// courseInfo = data;
    // });

    // setStorage("courseData", courseInfo);
}

getAccessTokenFromUser();

getAuth();

getCourseInfo();