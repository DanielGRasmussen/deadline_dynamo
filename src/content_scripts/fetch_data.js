// The useKey function isn't a final fix, it's just to test the other parts of the project we can't access until we fix the OAuth bitsies
function useKey() {
    fetch("https://byui.instructure.com/api/v1/courses?access_token=10706~Oz3w0n27AiRiD3CdoXOjGMawnB79DU4LD3n6O3YZhlVCGxvYxc7CrOPi7yfAH9oR")
    .then(response => {
        if (response.ok) {
                        
                setStorage("Auth", response.json)
                return response.json(); // You can parse JSON response if needed
            } else {
                        
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        })
}

async function getCourseInfo() {
    const response = await fetch("https://canvas.instructure.com/api/v1/courses")
    const courseInfo = await response.json();

    // courseInfo = "";

    // await $.getJSON('http://www.whateverorigin.org/get?url=' + encodeURIComponent("https://canvas.instructure.com/api/v1/courses?access_token=10706~Oz3w0n27AiRiD3CdoXOjGMawnB79DU4LD3n6O3YZhlVCGxvYxc7CrOPi7yfAH9oR") + '&callback=?', function(data){
	// coursInfo = data;
    // });

    // setStorage("courseData", courseInfo);
}
