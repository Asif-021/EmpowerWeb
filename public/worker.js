chrome.runtime.onInstalled.addListener(async () => {
  console.log("Background script loaded")
});

let isContentScriptReady = false;

// function sendMessageToContentScript(tabId, message, retries = 5) {
//   if (retries <= 0) {
//     console.error("Failed to send message to content script after multiple attempts.");
//     return;
//   }

//   chrome.tabs.sendMessage(tabId, message, (response) => {
//     if (chrome.runtime.lastError || !response) {
//       console.warn("Content script not ready. Retrying...");
//       setTimeout(() => sendMessageToContentScript(tabId, message, retries - 1), 200);
//     } else {
//       console.log("Message successfully sent to content script:", response);
//     }
//   });
// }


// function ensureContentScriptInjected(tabId, callback) {
//   chrome.scripting.executeScript(
//     {
//       target: { tabId: tabId },
//       files: ["/content.js"], 
//     },
//     () => {
//       if (chrome.runtime.lastError) {
//         console.error("Failed to inject content script:", chrome.runtime.lastError);
//       } else {
//         console.log("Content script successfully injected into tab:", tabId);
//         if (callback) callback();
//       }
//     }
//   );
// }


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "contentScriptReady") {
    console.log("Content script is ready.");
    isContentScriptReady = true;
  }

  else if (message.action === 'toggleMagnifyingGlass') {
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

  else if (message.action === 'toggleHighContrast') {
    console.log('HC message received in worker', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        // Content script will handle HC toggle
        console.log('sending HC message...')
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHighContrast', filterTypeHC: message.filterTypeHC });
      }
    });
  }
  
  else if (message.action === 'toggleColorBlindFilter') {
    console.log('CBF message received in worker', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        // Content script will handle CB toggle
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleColorBlindFilter', filterTypeCB: message.filterTypeCB });
      }
    });
  }

  else if (message.action === "captureVisibleTab") {
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

  else if (message.action === "toggleTTS") {
    console.log("TTS message received in service worker:", message.text);

    chrome.tts.speak(message.text, {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      onEvent: (event) => {
        if (event.type === "end") {
          console.log("TTS finished speaking.");
        } else if (event.type === "error") {
          console.error("TTS encountered an error:", event.errorMessage);
        }
      },
    });
    sendResponse({ status: "TTS started using chrome.tts" });
    return true; // Indicate async response
  }

  else{
    console.log('Message not understood: ', message)
  }
});





