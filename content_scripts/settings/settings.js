const targetElement = document.getElementById("wrapper");

targetElement.innerHTML = "";
document.querySelector("title").innerHTML = "Deadline Dynamo Settings";
document.querySelector("#mobile-header .mobile-header-title").innerHTML =
	"Deadline Dynamo Settings";

// I did some testing, and it is pretty much the same speed to load the HTML from a file as it is to just throw minified HTML into the JS file.
fetch(chrome.runtime.getURL("content_scripts/settings/settings.html"))
	.then(response => response.text())
	.then(htmlContent => {
		// Insert the HTML content into the target element
		targetElement.innerHTML = htmlContent;
		// Click on the course menu toggle to reshow it.
		document.getElementById("courseMenuToggle").click();
	});
