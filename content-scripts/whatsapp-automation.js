// WhatsApp Automation - Jon.G Original

let stopped = false;
let testButton = document.createElement("button");
let allowSendMessage = false;
let prevPhoneNumberLength = 0;
let DummyNumbers = [8687431018, 8687489524];
let i = 0;

// testButton.textContent = "Test Button";
// Object.assign(testButton.style, {
//     backgroundColor: `rgb(217, 253, 211)`,
//     borderRadius: `8px`,
//     padding: `8px`,
//     position: `fixed`,
//     bottom: `90px`,
//     right: `40px`,
//     zIndex: `1000`,
//     border: `1px solid green`,
//     boxShadow: `4px 4px 2px rgba(0, 0, 0, 0.1)`,
// })
// document.body.appendChild(testButton);

testButton.addEventListener("click", async () => {

	try {
		console.log("DummyNumbers: ", DummyNumbers);
		console.log("...Running WhatsApp Message Automation...");

		if(DummyNumbers[i] && !stopped) {
			let newChat = await waitForElement(`button[aria-label="New chat"]`)
			await sleep(500);
			newChat.click();
			await sleep(500);
			let phoneButton = await waitForElement(`button[aria-label="Phone number"]`);
			await sleep(500);
			phoneButton.click();
			await sleep(500);
			// await dialPhoneNumber(DummyNumbers[i]);
			await pastePhoneNumber(DummyNumbers[i]);
			await sleep(1000);

			let noResultsCheck = document.querySelector(`[data-testid="no-search-results"]`) // only present if no results found

			if(noResultsCheck) { 
				console.log("No Result Found For: " + DummyNumbers[i])
				await pressBackButton();
				await pressBackButton();
			}
			else { 
				// contact result found
				await clickUser();
				await sleep(1000);
				// await typeMessage("*Ignore this automated letter just checking something's working*");

				// if(!hasMessagedBefore()) {
					await pasteMessage("Hey goodmorning");
					await sleep(1000);

					if(allowSendMessage) {
						await sendMessage();
					}
					// await saveContact();
				// }

			}

			i++;
			testButton.click(); // go through all numbers in DummyNumbers array
		}
		else {
			console.log("--- No More Phone Numbers ---");
			console.log("--- Reseting to first Number ---");
			i = 0;
		}

	}
	catch (err) { 
		console.log("Error: ", err)
	}
});


let numberButtons = undefined;

function getNumberButtons() {
	return {
		1: document.querySelector(`[data-testid="dialer-pad-1"]`),
		2: document.querySelector(`[data-testid="dialer-pad-2"]`),
		3: document.querySelector(`[data-testid="dialer-pad-3"]`),
		4: document.querySelector(`[data-testid="dialer-pad-4"]`),
		5: document.querySelector(`[data-testid="dialer-pad-5"]`),
		6: document.querySelector(`[data-testid="dialer-pad-6"]`),
		7: document.querySelector(`[data-testid="dialer-pad-7"]`),
		8: document.querySelector(`[data-testid="dialer-pad-8"]`),
		9: document.querySelector(`[data-testid="dialer-pad-9"]`),
		0: document.querySelector(`[data-testid="dialer-pad-0"]`),
		"backspace": document.querySelector(`[data-testid="dialer-pad-backspace"]`)
	}
}

let tries = 0;

async function waitForElement(selector) { 
    const element = document.querySelector(selector);

    if(element || tries >= 25) {
		tries = 0; // should be around 5 seconds of retries
		return element;
	}
    await sleep(200);
	tries++;
    return await waitForElement(selector);
}

async function dialPhoneNumber(phoneNumber) {

	numberButtons = getNumberButtons();
	let phNum = phoneNumber.toString().replace(" ", "");

	for(let i = 0; i < phNum.length; i++) {
		if(!stopped) {
			// console.log("Num: " + phNum[i]);
			numberButtons[phNum[i]].click();
			await sleep(100);
		}
	}

	prevPhoneNumberLength = phNum.length;
}

async function pastePhoneNumber(phoneNumber) {

	if(!stopped) {
		numberButtons = getNumberButtons();
		let phNum = phoneNumber.toString().replace(" ", "");

		const phoneNumberInput = await waitForElement(`[data-testid="phone-number-input"]`);

		phoneNumberInput.focus();
		document.execCommand("selectAll");
		document.execCommand("delete");
		document.execCommand("insertText", false, phoneNumber);
		await sleep(100);

		prevPhoneNumberLength = phNum.length;
	}

}


async function removeNumbers() {
	numberButtons = getNumberButtons();
	for(let i = 0; i < prevPhoneNumberLength; i++) {
		numberButtons["backspace"].click();
		await sleep(100);
	}
}

//------------------------------------------ Click The User ------------------------------------------

async function clickUser() {

	let user = await waitForElement(`[data-testid="cell-frame-container"]`);
	await sleep(300);
	user.click();
	await sleep(200);
}

//------------------------------------------ Paste Message ------------------------------------------

async function pasteMessage(message) {

	if(!stopped) {
		const messageInput = await waitForElement(`[data-testid="conversation-compose-box-input"]`)
		messageInput.click();
		messageInput.focus();
		await sleep(100);
		document.execCommand("insertText", false, message);
	}
	
}

//------------------------------------------ Type Message ------------------------------------------

async function typeMessage(message) {

	const messageInput = await waitForElement(`[data-testid="conversation-compose-box-input"]`)
	messageInput.focus();
	document.execCommand("selectAll");
	messageInput.click();

	for(let i = 0; i < message.length; i++ ) {
		if(!stopped) {
			await sleep(30);
			document.execCommand("insertText", false, message[i]);
		}
	}

}

//------------------------------------------ Send Message ------------------------------------------

async function sendMessage() {
	const sendButton = await waitForElement(`[aria-label="Send"]`);
	sendButton.click();
}

// --------------------------------------- Save Contact ------------------------------------------


 //// INCOMPLETE //////  //// INCOMPLETE //////  //// INCOMPLETE //////  //// INCOMPLETE //////  //// INCOMPLETE //////  //// INCOMPLETE //////  //// INCOMPLETE //////
 
async function saveContact() {
	const prospectProfileHeader = await waitForElement(`[data-testid="conversation-info-header"]`);

	prospectProfileHeader.click();

	await sleep(500);

	const buttons = await waitForManyElements("button");

	let addContactBtn = undefined;

	buttons.forEach(button => {
		button.textContent.includes("Add") && (addContactBtn = button)
	})

	await sleep(300);
	addContactBtn.click();
	await sleep(300);

	const firstNameInput = await waitForElement(`[aria-label="First name"]`);
	// await sleep(300);
	// firstNameInput.click();
	await sleep(300);

	firstNameInput.focus();
	firstNameInput.click();
	document.execCommand("selectAll");
	document.execCommand("delete");
	document.execCommand("insertText", false, "Testing 123");

	await sleep(300);


	// document.execCommand("selectAll");
	// document.execCommand("insertText", false, "Testing 123");

	const saveContactBtn = await waitForElement(`[aria-label="Save contact"]`);
	await sleep(300);
	// saveContactBtn.click();

	await sleep(3000);

	const closeProfileBtn = await waitForElement(`[aria-label="Close"]`);
	await sleep(300);
	// closeProfileBtn.click();
}


//------------------------------------------ Utilities ------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function pressBackButton() {
	let backButton = await waitForElement(`[aria-label="Back"]`)
	backButton.click();
	await sleep(300);
}

async function waitForManyElements(selector) { 
    const elements = document.querySelectorAll(selector);

    if(elements) return elements;
    await sleep(200);
    return await waitForManyElements(selector);
}

//------------------------------------- Chrome Extension Messaging -------------------------------------------------

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

	if(message.type === "WHATSAPP") {

		if(message["run-whatsapp"]) {
			console.log("Message: ", message)

			message.allPhoneNumbers.filter(num => {
				if(num !== "undefined" && num !== null) {
					DummyNumbers.push(num);
					// return num;
				}
			});

			await sleep(100);

			updateStatus("Running Whatsapp...");

			stopWhatsapp(false);
			testButton.click();

			return true;
		}
		if(message.code === "stop-messaging") {
			stopWhatsapp();
			updateStatus("Stopped WhatsApp Messaging...")
		}

	}
	else if(message.type === "BACKGROUND") {
		if(message.sendMessage != null) {
			
			if(message.sendMessage) {
				allowSendMessage = true;
			}
			else {
				allowSendMessage = false;
			}
		}
	}
})

function updateStatus(status) {
	// updates text status on side panel
	chrome.runtime.sendMessage({
		type: "SIDEPANEL",
		code: "status",
		status: status
	})
}

function stopWhatsapp(bool) {
	if(bool !== undefined) stopped = bool;
	else {
		stopped ? stopped = false : stopped = true;
	}
}

function hasMessagedBefore() {
	// const conversationPanel = document.querySelector(`[data-testid="conversation-panel-body"]`);
	const messages = document.querySelector(`[data-testid="msg-container"]`);

	if(messages) {
		console.log("Has messages");
		return true;
	}
	
	console.log("Does NOT have messages");
	return false;

}




(async function findOnGoogle() {

	const chatList = await waitForElement(`[aria-label="Chat list"]`);
	console.log("Chat list: ", chatList);
	const chats = chatList.querySelectorAll(`[role="row"]`);

	Array.from(chats).forEach(async (chat) => {

		chat.onclick = async () => {

			console.log("Lawn Mower")


			await sleep(200);
			const chatHeader = await waitForElement(`[data-testid="conversation-info-header-chat-title"]`);
			const chatName = chatHeader.innerText;
			const btn = document.createElement("button");
			btn.classList.add("find-on-google-btn");
			btn.innerText = "Find On Google"

			const foundGoogleBtnAlready = document.querySelector(".find-on-google-btn")
			foundGoogleBtnAlready && foundGoogleBtnAlready.remove();
			document.body.appendChild(btn);

			btn.onclick = () => {

				const anchor = document.createElement("a");
				anchor.href = `https://google.com/search?q=${chatName}`;
				anchor.target = "_blank";
				anchor.click();

			}
		}
	})

})();