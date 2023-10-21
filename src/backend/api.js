// function getAuth() {
//     const canvasInstallUrl = "https://canvas.instructure.com/api/v1/courses";
//     const clientId = "460969305247-1f65p9feaf8p166pl00o0v7tnmu1apn4.apps.googleusercontent.com";
//     const redirectUri = "https://canvas.instructure.com/api/v1/courses/oauth_complete";
  
//     const authUrl = `${canvasInstallUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  
//     fetch(authUrl)
//         .then(response => {
//             if (response.ok) {
                
//                 setStorage("Auth", response.json)
//                 // return response.json();
//             }
            
//             else {
                
//                 throw new Error(`Error: ${response.status} - ${response.statusText}`);
//             }
//         })
// }

async function getCourseInfo() {
    const response = await fetch("https://canvas.instructure.com/api/v1/courses", {mode: 'no-cors'})
    courseInfo = await response.json();
    setStorage("courseData", courseInfo);
};