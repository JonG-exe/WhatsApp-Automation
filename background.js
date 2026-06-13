chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch(err => console.log("Error: ", err))
    
console.log("Listener registered.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if(message.type === "BACKGROUND") {

        console.log("Background Message: ", message)

        if(message.sendMessage !== null) {
            chrome.tabs.query({}, (tabs) => {
                const foundTab = tabs.find(tab => tab.url.includes("web.whatsapp.com/"))

                chrome.tabs.sendMessage(foundTab.id, message)
            })
        }

    }
})


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



