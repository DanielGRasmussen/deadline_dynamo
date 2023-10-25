const accountDynamoSettings = document.createElement("div");
accountDynamoSettings.setAttribute("class", "fOyUs_bGBk jpyTq_bGBk jpyTq_ycrn jpyTq_bCcs");
accountDynamoSettings.setAttribute("style", "padding: 0px; max-width: 100%;");
accountDynamoSettings.innerHTML =
	'<div class="fOyUs_bGBk profile-tab-profile_settings" style="margin: 0.75rem 0;"><a href="/deadline_dynamo" class="fOyUs_bGBk fbyHH_bGBk fbyHH_bSMN">Deadline Dynamo</a></div>';

async function addDynamo() {
	// It seems there's a slight animation waiting period. It probably takes about 0.175 seconds to load the menu.
	// Also, the html doesn't exist until the menu is clicked.
	setTimeout(() => {
		// It's a deep child, but it's the first (and only) ul that's part of that ID.
		document.querySelector("#nav-tray-portal ul").appendChild(accountDynamoSettings);
	}, 180);
}

document.getElementById("global_nav_profile_link").addEventListener("click", addDynamo);
