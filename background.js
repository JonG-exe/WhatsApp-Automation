chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch(err => console.log("Error: ", err))
    
console.log("Listener registered.");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if(message.type === "BACKGROUND") {

        console.log("Background Message: ", message)

        if(message.sendMessage !== null) {
            chrome.tabs.query({}, (tabs) => {
                const foundTab = tabs.find(tab => tab.url.includes("web.whatsapp.com/"))

                chrome.tabs.sendMessage(foundTab.id, message)
            })
        }

    }
    else if(message.type === "SIDEPANEL") {

        console.log("JAX Message: ", message)
        const m = message;

        if(message.code === "add-num-to-crhrome-storage") {
            console.log("Received num: ", message)
            addNumberToChromeLocalStorage(m.phoneNumber, m.storeName, m.searchQuery);
        }
    }
})


async function addNumberToChromeLocalStorage(storeNumber, storeName, searchQuery) {

	if(await chrome.storage.local.get("google-maps-scrape") === null) {

		// create maps scrape storage

		await chrome.storage.local.set({"google-maps-scrape": {
			"maps-search-query": {
				"restaurants near me": {
					_EXAMPLE: "888-888-8888"
				}
			}
		}})
	}
	else {

		let googleMapsScrape = await chrome.storage.local.get("google-maps-scrape");
        googleMapsScrape = googleMapsScrape["google-maps-scrape"];

		if(googleMapsScrape["maps-search-query"][searchQuery] === undefined) {
			googleMapsScrape["maps-search-query"][searchQuery] = {};
		}
		else {
			googleMapsScrape["maps-search-query"][searchQuery][storeName] = storeNumber;
		}

		await chrome.storage.local.set({ "google-maps-scrape": googleMapsScrape });

	}

}

// async function tabGroupsTest() {
    
//     const tabQuery = await chrome.tabs.query({ currentWindow: true })
//     let allDotHtmls = tabQuery.filter(tab => {
//         if(tab.url.includes("www.youtube.com")) return tab.id
//     });

//     allDotHtmls = allDotHtmls.map(tab => tab.id)

//     console.log("chrome tabs options: ", chrome.tabs);
//     console.log("chrome tabs: ", tabQuery);
//     console.log("allDotHtmls: ", allDotHtmls);

//     const [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     });

//     const groupId = await chrome.tabs.group({
//         tabIds: allDotHtmls
//     });

//     console.log("Group ID: ", groupId);
//     console.log(chrome.tabGroups)

//     await chrome.tabGroups.update(groupId, { title: "Youtube", color: "blue"})
// }

// tabGroupsTest()



