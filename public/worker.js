chrome.runtime.onInstalled.addListener(async () => {
  console.log("Background script loaded")
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleMagnifyingGlass') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            // The content script will handle the magnifying glass toggle.
            window.postMessage({ action: 'toggleMagnifyingGlass' });
          },
        });
      }
    });
  }

  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.action === 'toggleMagnifyingGlass') {
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       if (tabs[0]?.id !== undefined) {
  //         chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleMagnifyingGlass' });
  //       }
  //     });
  //   }
  // });

  if (message.action === 'toggleHighContrast') {
    console.log('message received in worker');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        // Content script will handle HC toggle
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHighContrast' });
      }
    });
  }
  
  if (message.action === 'toggleColorBlindFilter') {
    console.log('CBF message received in worker', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        // Content script will handle CB toggle
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleColorBlindFilter', filterType: message.filterType });
      }
    });
  }

  if (message.action === "captureVisibleTab") {
    // Query the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        // Capture the visible tab of the current window
        chrome.tabs.captureVisibleTab({ format: "png" }, (imageData) => {
          if (chrome.runtime.lastError) {
            console.error("Error capturing tab:", chrome.runtime.lastError);
            sendResponse({ error: chrome.runtime.lastError });
            return;
          }
          sendResponse({ imageData: imageData });
        });
      } else {
        console.error("No active tab found.");
        sendResponse({ error: "No active tab found." });
      }
    });

    // Keep the message channel open until the response is sent
    return true;
  }

});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "captureVisibleTab") {
//     // Query the active tab in the current window
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs.length > 0) {
//         const tabId = tabs[0].id;
//         // Capture the visible tab of the current window
//         chrome.tabs.captureVisibleTab({ format: "png" }, (imageData) => {
//           if (chrome.runtime.lastError) {
//             console.error("Error capturing tab:", chrome.runtime.lastError);
//             sendResponse({ error: chrome.runtime.lastError });
//             return;
//           }
//           sendResponse({ imageData: imageData });
//         });
//       } else {
//         console.error("No active tab found.");
//         sendResponse({ error: "No active tab found." });
//       }
//     });

//     // Keep the message channel open until the response is sent
//     return true;
//   }
// });



