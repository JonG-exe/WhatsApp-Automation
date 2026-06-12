const allPhoneNumbers = [];

//----------------------------------- Message Listener  --------------------------------------

console.log("listener registered");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if(message.type === "SIDEPANEL") {

        if(message.code === "phoneNumber") {

            const phoneNumbers = document.querySelector(".phone-numbers");
            const newNum = document.createElement("div");
            newNum.textContent = `${message.phoneNumber} - ${message.storeName}`;

            phoneNumbers.appendChild(newNum);
            allPhoneNumbers.push(message.phoneNumber)
        }
        else if(message.code === "status") {

            updateStatusUi(message.status);

        }
    }
})

//------------------------------------ Status UI ---------------------------------------

async function updateStatusUi(status) {
    const statusUI = document.querySelector("#status");
    statusUI.textContent = status;
    statusUI.classList.add("flash-status");
    await sleep(2000);
    statusUI.classList.remove("flash-status");
}

//------------------------------------ Stop Map Scrape  ---------------------------------------

const stopBtn = document.querySelector("#stop-maps-btn");

stopBtn.onclick = () => {

    const message = {type: "SIDEPANEL", code: "stop-maps-search"};

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const tab = tabs.find(t => t.url.includes("google.com/maps"));

        chrome.tabs.sendMessage(tab.id, message)
    })
}

//------------------------------------ Stop WhatsApp Messaging  ---------------------------------------

const stopWhatsAppBtn = document.querySelector("#stop-whatsapp-btn");

stopWhatsAppBtn.onclick = () => {

    const message = {type: "WHATSAPP", code: "stop-messaging"};

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const tab = tabs.find(t => t.url.includes("web.whatsapp.com"));

        chrome.tabs.sendMessage(tab.id, message)
    })
}



//--------------------------------------- Copy All -------------------------------------------------


const copyAllBtn = document.querySelector(".copy-all-btn");
copyAllBtn.onclick = async () => {
    await navigator.clipboard.writeText(allPhoneNumbers.map(num => num + "\n"));
}

//--------------------------------------- Go Btn  -------------------------------------------------

const goBtn = document.querySelector("#go-btn")
goBtn.onclick = () => {

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tabID = tabs[0].id
        const message = {
            "go": true,
            "type": "SIDEPANEL"
        }
        
        chrome.tabs.sendMessage(tabID, message)
    })
}

//------------------------------------ Open Google Maps---------------------------------------------

const mapsBtn = document.querySelector("#open-maps");

mapsBtn.onclick = () => {

    console.log("Opening Google Maps");

    chrome.tabs.query({}, async (tabs) => {
        const foundTab = tabs.find(tab => tab.url.includes("google.com/maps"));
        
        if(foundTab) {
            chrome.windows.update(foundTab.windowId, { focused: true });
            chrome.tabs.update(foundTab.id, { active: true });
            await sleep(100);
            chrome.tabs.reload(foundTab.id);
        }
        else {
            chrome.tabs.create({url: "https://google.com/maps/"})
        }
    })
}

//------------------------------------ Open Whatsapp ----------------------------------------------

const openWhatsAppBtn = document.querySelector("#open-whatsapp-btn");
openWhatsAppBtn.onclick = () => {

    console.log("Opening WhatsApp");

    chrome.tabs.query({}, async tabs => {
        const foundTab = tabs.find(tab => tab.url.includes('https://web.whatsapp.com'));

        if(foundTab) {
            chrome.windows.update(foundTab.windowId, { focused: true } )
            chrome.tabs.update(foundTab.id, { active: true } )
            await sleep(100);
            chrome.tabs.reload(foundTab.id);
        }
        else {
            chrome.tabs.create({ url: "https://web.whatsapp.com/", active: true})
        }

    })
}

//------------------------------------ Run Whatsapp ----------------------------------------------

const runWhatsAppBtn = document.querySelector("#run-whatsapp-btn");

runWhatsAppBtn.onclick = () => {

    console.log("WhatsApp about to run");

    const message = { 
        "run-whatsapp": true, 
        "type": "WHATSAPP",
        "allPhoneNumbers": allPhoneNumbers
    }

    chrome.tabs.query({}, tabs => {
        const foundTab = tabs.find(tab => tab.url.includes('web.whatsapp.com'));

        if(foundTab) {
            chrome.tabs.sendMessage(foundTab.id, {...message});
        }
        else {
            console.log("---- NO WHATSAPP TAB FOUND ----")
        }
    })
}


//------------------------------------------- Utilities ---------------------------------------------------

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
}









//// INCOMPLETE //// //// INCOMPLETE //// //// INCOMPLETE //// //// INCOMPLETE //// //// INCOMPLETE //// //// INCOMPLETE //// //// INCOMPLETE ////

const findNumberInput = document.querySelector("#find-number-input");

addNumberToLocalStorage();

console.log("Found");

findNumberInput.oninput = async () => {

    console.log("Found chrome storage: ", chrome.storage)
    const searchedNumber = findNumberInput.value;
    const googleMapsScrape = JSON.parse(await chrome.storage.local.get("google-maps-scrape"));

    const foundNumbers = document.querySelector("#found-numbers");

    Object.keys(googleMapsScrape["maps-search-query"]).forEach(query => {   
        Object.keys(googleMapsScrape["maps-search-query"][query]).forEach(companyName => {

            const companyNumber = googleMapsScrape["maps-search-query"][query][companyName];

            if(searchedNumber.includes(companyNumber.replace("-", "")))


            console.log("Company Name: ", companyName)
            console.log("Number: ", companyNumber);
            console.log("-------------------------------------------");

            foundNumbers.innerText += companyName + " - " + companyNumber + "\n";
        })
    })
}


async function addNumberToLocalStorage(storeNumber, storeName, searchQuery) {

	if(await chrome.storage.local.get("google-maps-scrape") === null) {
		// create maps scrape storage
		// localStorage.setItem("google-maps-scrape", JSON.stringify({}))

		await chrome.storage.local.set("google-maps-scrape", JSON.stringify({
			"maps-search-query": {
				"restaurants near me": {
					_EXAMPLE: "888-888-8888"
				}
			}
		}))
	}
	else {

		const googleMapsScrape = JSON.parse(await chrome.storage.local.get("google-maps-scrape"));

		if(googleMapsScrape["maps-search-query"][searchQuery] === undefined) {
			googleMapsScrape["maps-search-query"][searchQuery] = {};
		}
		else {
			googleMapsScrape["maps-search-query"][searchQuery][storeName] = storeNumber;
		}

		await chrome.storage.local.set("google-maps-scrape", JSON.stringify(googleMapsScrape));

	}
}


