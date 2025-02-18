chrome.runtime.onInstalled.addListener(async () => {
  console.log("Background script loaded")
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      if (tab.url.match(/(chrome|chrome-extension):\/\//gi) || tab.url.startsWith('https://chromewebstore') || tab.url.startsWith('file')) {
        continue;
      }
      try {
        const target = { tabId: tab.id, allFrames: cs.all_frames };
        if (cs.js[0]) {
          await chrome.scripting.executeScript({
            files: cs.js,
            injectImmediately: cs.run_at === 'document_start',
            world: cs.world,
            target,
          });
        }
      } catch (err) {
        console.error(`Failed to inject script into tab: ${tab.url}`, err);
      }
    }
  }
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
    console.log(message)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleMagnifyingGlass', magnifyingScale: message.magnifyingScale, 
                                              magnifyingSize: message.magnifyingSize, isRectangle: message.isRectangle,
                                              magnifyingHeight: message.magnifyingHeight, magnifyingWidth: message.magnifyingWidth}, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending MG message:", chrome.runtime.lastError);
          } else{
            console.log("MG message sent successfully:", response);
          } 
        });
      } else {
        console.warn('No active tab found or invalid tab ID.')
      }
    });
  }

  else if (message.action === 'toggleHighContrast') {
    console.log('HC message received in worker', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        console.log('sending HC message...');
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHighContrast', filterTypeHC: message.filterTypeHC }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending HC message:', chrome.runtime.lastError.message);
          } else {
            console.log('HC message sent successfully:', response);
          }
        });
      } else {
        console.warn('No active tab found or invalid tab ID.');
      }
    });
  }
  
  else if (message.action === 'toggleColorBlindFilter') {
    console.log('CBF message received in worker', message);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        console.log('sending CBF message...');
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleColorBlindFilter', filterTypeCB: message.filterTypeCB }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending CBF message:', chrome.runtime.lastError.message);
          } else {
            console.log('CBF message sent successfully:', response);
          }
        });
      } else {
        console.warn('No active tab found or invalid tab ID.');
      }
    });
  }

  else if (message.action === "captureVisibleTab") {
    // Query the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        // Capture the visible tab of the current window
        chrome.tabs.captureVisibleTab({ format: "jpeg" }, (imageData) => {
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

  else if (message.action === "startTTS") {
    console.log("TTS message received in service worker:", message.text);

    chrome.tts.getVoices((voices) => {
      console.log("Available voices:", voices);
    });

    

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

  else if(message.action === 'pauseTTS'){
    try{
      chrome.tts.pause();
      sendResponse({ status: "TTS paused using chrome.tts" });
      return true; 
    }
    catch(e){
      console.error("Error pausing TTS:", e);
    }
  }

  else if(message.action === 'resumeTTS'){
    try{
      chrome.tts.resume();
      sendResponse({ status: "TTS resumed using chrome.tts" });
      return true; 
    }
    catch(e){
      console.error("Error resuming TTS:", e);
    }
  }
  else if(message.action === 'stopTTS'){
    try{
      chrome.tts.stop();
      sendResponse({ status: "TTS stopped using chrome.tts" });
      return true;
      }
      catch(e){
        console.error("Error stopping TTS:", e);
        }
    }

  else{
    console.log('Message not understood: ', message)
  }
});





