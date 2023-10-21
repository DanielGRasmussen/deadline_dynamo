function getAuth() {
    const canvasInstallUrl = "https://canvas.instructure.com/api/v1/courses";
    const clientId = "XXX"; // Replace with your client ID
    const redirectUri = "https://canvas.instructure.com/api/v1/courses/oauth_complete";
    const state = "YYY"; // Replace with your state value
    const scope = "<value_1> <value_2> <value_n>"; // Replace with your scope values
  
    const authUrl = `${canvasInstallUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  
    fetch(authUrl)
      .then(response => {
        if (response.ok) {
          // Handle a successful response here
          return response.json(); // You can parse JSON response if needed
        } else {
          // Handle the error response here
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then(data => {
        // Handle data if needed
      })
      .catch(error => {
        // Handle errors
        console.error(error);
      });
  }  const clientId = "XXX"; // Replace with your client ID
    const redirectUri = "https://canvas.instructure.com/api/v1/courses/oauth_complete";
    const state = "YYY"; // Replace with your state value
    const scope = "<value_1> <value_2> <value_n>"; // Replace with your scope values
  
    const authUrl = `${canvasInstallUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  
    fetch(authUrl)
      .then(response => {
        if (response.ok) {
          // Handle a successful response here
          return response.json(); // You can parse JSON response if needed
        } else {
          // Handle the error response here
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then(data => {
        // Handle data if needed
      })
      .catch(error => {
        // Handle errors
        console.error(error);
      });
  }
  