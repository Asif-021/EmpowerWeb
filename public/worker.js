chrome.runtime.onInstalled.addListener(async () => {
  console.log("Background script loaded")
  // for (const cs of chrome.runtime.getManifest().content_scripts) {
  //   for (const tab of await chrome.tabs.query({url: cs.matches})) {
  //     if (tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
  //       continue;
  //     }
  //     const target = {tabId: tab.id, allFrames: cs.all_frames};
  //     if (cs.js[0]) chrome.scripting.executeScript({
  //       files: cs.js,
  //       injectImmediately: cs.run_at === 'document_start',
  //       world: cs.world, 
  //       target,
  //     });
  //     // if (cs.css[0]) chrome.scripting.insertCSS({
  //     //   files: cs.css,
  //     //   origin: cs.origin,
  //     //   target,
  //     // });
  //   }
  // }
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

  if (message.action === 'toggleHighContrast'){
    console.log('message received in worker');
  }
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === 'toggleMagnifyingGlass') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]?.id !== undefined) {
//         chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleMagnifyingGlass' });
//       }
//     });
//   }
// });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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



