// Google Maps Automation

const MIN_ALLOWED_STAR_RATING = 4;
let counter = 1;
let phoneNumbers = [];
let allLinks = null;
let stopped = false;
let initialGo = true;
let searchBar = undefined;
let searchButton = undefined;

const goButton = document.createElement("button");
goButton.textContent = "Go";
document.body.appendChild(goButton);

Object.assign(goButton.style, {
    "zIndex": "1000px",
    "position": "fixed",
    "bottom": "140px",
    "left": "10px",
    "backgroundColor": "#14d514",
    "borderRadius": "2px",
	"padding": "4px 8px",
	"color": "#ffffff",
	"cursor": "pointer",
	"font-weight": "bold"
})

let i = 0;
goButton.onclick = async () => {
	
	allLinks = await waitForManyElements(`[role="article"]`);

	// i === 0 && sendInfoToSidePanel("Minimum Star Rating --> ", MIN_ALLOWED_STAR_RATING) && sendInfoToSidePanel("", "");

	console.log("Els: ", allLinks);

	if((i < allLinks.length - 1) && stopped === false) {
		
		initialGo && updateStatus("Running...");
		initialGo = false;

		await getPhoneNumber(i);
		i++;
		await sleep(700);
		goButton.click();
	}
	else if( stopped === true ) {
		updateStatus("Stopped Scraping.");
	}
	else {
		updateStatus("Done");
	}
}

//----------------------------------------------------------- Star Rating & Review Count -----------------------------------------------------------------------

function getStarRatingAndReviewCount(linkContainer) {
	const allAriaLabels = linkContainer.querySelectorAll(`[aria-label]`);
	var rating = undefined;
	var reviewsCount = undefined;

	Array.from(allAriaLabels).forEach(label => {
		if(label.getAttribute("aria-label").includes("stars")) {
			console.log("LABEL: ", label.getAttribute(`aria-label`));

			rating = new Number(label.getAttribute(`aria-label`).split("stars")[0].replaceAll(" ", ""));
			reviewsCount = label.getAttribute(`aria-label`).split("stars")[1].split("Reviews")[0].replaceAll(" ", "") - 0;

		}
	})

	return {
		rating,
		reviewsCount
	};
}


//---------------------------------------------------------- Get Phone Number --------------------------------------------------------------------------------------------------------

async function getPhoneNumber(index) {

	const linkContainer = allLinks[index];
	const link = linkContainer.children[0];
	link.focus(); link.click();

	let storeCardName = await waitForElement(".DUwDvf.lfPIob");
	storeCardName = storeCardName.textContent;
	let storeCardPhoneNumber = Array.from(document.querySelectorAll(".Io6YTe.fontBodyMedium.kR99db.fdkmkc"))?.filter(node => node?.textContent.includes("868"))[0]?.textContent;
	let storeCardRating = getStarRatingAndReviewCount(linkContainer)?.rating;
	let reviewsCount = getStarRatingAndReviewCount(linkContainer)?.reviewsCount;

	console.log("Reviews Count: ", reviewsCount)

	if(storeCardPhoneNumber) {
		if(storeCardRating >= MIN_ALLOWED_STAR_RATING) {
			searchBar = await waitForElement(`[role="combobox"]`);

			addNumberToLocalStorage(storeCardPhoneNumber, storeCardName, searchBar.value);
			sendNumToChromeStorage(storeCardPhoneNumber, storeCardName, searchBar.value);

			saveToPhoneNumbersArray(storeCardPhoneNumber, storeCardName);
			await sendInfoToSidePanel(storeCardPhoneNumber?.replace("(", "")?.replace(")", "")?.replace(" ", "")?.replace("-", ""), storeCardName);
		}
		console.log(counter + ". " + storeCardPhoneNumber + " - " + storeCardName);
	}
	else console.log(counter + ". " + " NO NUMBER - " + storeCardName);
	counter++;
	
	const closeBtn = await waitForElement(`.VfPpkd-icon-LgbsSe.yHy1rc.eT1oJ.mN1ivc`);
	closeBtn.click();
	
	const vanished = await waitForElementToVanish(".bJzME.Hu9e2e.tTVLSc");
	// vanished === null && console.log("");

}

//----------------------------------------------------------- Star Rating -----------------------------------------------------------------------

async function sendNumToChromeStorage(num, name, query) {
	chrome.runtime.sendMessage({
		type: "SIDEPANEL",
		code: "add-num-to-crhrome-storage",
		phoneNumber: num,
		storeName: name,
		searchQuery: query
	}, () => {
		console.log("Number Sent.")
	})
}

//----------------------------------------------------------- Star Rating -----------------------------------------------------------------------

const allAriaLabels = document.querySelectorAll(`[aria-label]`);

Array.from(allAriaLabels).forEach(label => {
    if(label.getAttribute("aria-label").includes("stars")) {
        console.log("Label: ", label)
    }
})

// -------------------------------------------- Utilities --------------------------------------------

async function sleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}

function updateStatus(status) {
	// updates text status on side panel
	chrome.runtime.sendMessage({
		type: "SIDEPANEL",
		code: "status",
		status: status
	})
}

async function waitForElementToVanish(selector) { 
    const element = document.querySelector(selector);

    if(element === null) {
		await sleep(100);
		return element;
	}
    await sleep(100);
    return waitForElementToVanish(selector);
}

async function waitForElement(selector) { 
    const element = document.querySelector(selector);

    if(element) return element;
    await sleep(200);
    return await waitForElement(selector);
}

async function waitForManyElements(selector) { 
    const elements = document.querySelectorAll(selector);

    if(elements) return elements;
    await sleep(200);
    return await waitForManyElements(selector);
}

async function waitForTextInElement(text, selector) {
	const element = document.querySelector(selector);

	if (element && element.textContent.includes(text)) {
		return element;
	}

	console.log("Not yet found...");
	await sleep(200);
	await waitForTextInElement(text, selector);
}

async function mapSearch(searchQuery) {
	const searchBar = await waitForElement(`[role="combobox"]`)
	const searchButton = await waitForElement(`[aria-label="Search"]`)

	searchBar.focus();
	document.execCommand("selectAll");
	document.execCommand("delete");
	document.execCommand("insertText", false, searchQuery);
	searchButton.click();
}

function clickButton(textContent) {

	const allButtons = document.querySelectorAll("button");

	allButtons.forEach(button => {
		// click the first button that contains provided textContent
		if(button.textContent.includes(textContent)) button.click();
	})
}

function saveToPhoneNumbersArray(number, name) {
	phoneNumbers.push({name: number});
}

// -------------------------------------------- Chrome Extension --------------------------------------------


async function sendInfoToSidePanel(phoneNumber, name) {

	console.log("Sending numbers: ", phoneNumber);

	chrome.runtime.sendMessage(
		{
			"code": "phoneNumber",
			"type": "SIDEPANEL",
			"phoneNumber": phoneNumber,
			"storeName": name
		}, (response) => {console.log("Response: ", response)}
	)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

	if(message.type === "SIDEPANEL") {

		if(message.go) {
			goButton.click();
		}
		else if( message.code === "stop-maps-search") {

			console.log("--- Stopped Maps Scrape ---")
			// stopButton.click();
			stopped == false ? stopped = true : stopped = false;
		}
	}
})


function addNumberToLocalStorage(storeNumber, storeName, searchQuery) {

	if(localStorage.getItem("google-maps-scrape") === null) {
		// create maps scrape storage
		// localStorage.setItem("google-maps-scrape", JSON.stringify({}))

		localStorage.setItem("google-maps-scrape", JSON.stringify({
			"maps-search-query": {
				"restaurants near me": {
					_EXAMPLE: "888-888-8888"
				}
			}
		}))
	}
	else {

		const googleMapsScrape = JSON.parse(localStorage.getItem("google-maps-scrape"));

		if(googleMapsScrape["maps-search-query"][searchQuery] === undefined) {
			googleMapsScrape["maps-search-query"][searchQuery] = {};
		}
		else {
			googleMapsScrape["maps-search-query"][searchQuery][storeName] = storeNumber;
		}

		localStorage.setItem("google-maps-scrape", JSON.stringify(googleMapsScrape));

	}
}

