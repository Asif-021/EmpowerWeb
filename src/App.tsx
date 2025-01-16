import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import html2canvas from 'html2canvas';
import './App.css'
import { useState } from 'react'


function App() {
  const [colour, setColour] = useState(String);
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState(false);
  const [highContrastActive, setHighContrastActive] = useState(false);


  const onclick = async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true});
    if (tab && tab.id !== undefined) {
      chrome.scripting.executeScript<string[], void>({
        target: {tabId: tab.id},
        args: [colour],
        func: (colour) => {
          document.body.style.backgroundColor = colour;
        }
      });
    }
  }

  // const toggleMagnifyingGlass = async () => {
  //   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //   if (tab && tab.id !== undefined) {
  //     chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       func: () => {
  //         // Check if magnifying glass already exists
  //         let existingDiv = document.querySelector(".mgnfng-glss");
  //         if (existingDiv) {
  //           existingDiv.remove(); // Remove if exists
  //         } else {
  //           // Create new magnifying glass
  //           const div = document.createElement("div");
  //           div.classList.add("mgnfng-glss", "rounded-circle", "shadow");
  //           document.documentElement.append(div);

  //           // Style and behavior of the magnifying glass
  //           div.style.position = "absolute";
  //           div.style.width = "200px";
  //           div.style.height = "200px";
  //           div.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  //           div.style.borderRadius = "50%";
  //           div.style.pointerEvents = "none";
  //           div.style.zIndex = "9999";

  //           let animationId: number | null;
  //           document.addEventListener("mousemove", (e) => {
  //             if (animationId) return;
  //               animationId = requestAnimationFrame(() => {
  //                 div.style.left = `${e.clientX - 100}px`;
  //                 div.style.top = `${e.clientY - 100}px`;
  //                 animationId = null;
  //             });
  //           });
  //         }
  //       },
  //     });
  //   }
  //   setMagnifyingGlassActive(!magnifyingGlassActive);
  // }


  // const toggleMagnifyingGlass1 = async () => {
  //   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //   if (tab && tab.id !== undefined) {
  //     chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       func: () => {
  //         // Check if magnifying glass already exists
  //         let existingDiv = document.querySelector(".mgnfng-glss");
  //         if (existingDiv) {
  //           existingDiv.remove(); // Remove if exists
  //         } else {
  //           // Create new magnifying glass
  //           const div = document.createElement("div");
  //           div.classList.add("mgnfng-glss", "rounded-circle", "shadow");
  //           document.documentElement.append(div);
  
  //           // Style the magnifying glass
  //           const size = 200; // Size of magnifying glass
  //           const scale = 10; // Magnification level
  //           div.style.position = "absolute";
  //           div.style.width = `${size}px`;
  //           div.style.height = `${size}px`;
  //           div.style.borderRadius = "50%";
  //           div.style.overflow = "hidden";
  //           div.style.border = "2px solid rgba(0, 0, 0, 0.2)";
  //           div.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  //           div.style.pointerEvents = "none";
  //           div.style.zIndex = "9999";
  
  //           // Capture the entire page as the background for the magnifying glass
  //           const body = document.body;
  //           const html = document.documentElement;
  //           const width = Math.max(
  //             body.scrollWidth,
  //             body.offsetWidth,
  //             html.clientWidth,
  //             html.scrollWidth,
  //             html.offsetWidth
  //           );
  //           const height = Math.max(
  //             body.scrollHeight,
  //             body.offsetHeight,
  //             html.clientHeight,
  //             html.scrollHeight,
  //             html.offsetHeight
  //           );
  
  //           // Set up the magnifying glass background
  //           html.style.backgroundAttachment = "fixed";
  //           div.style.backgroundImage = `url(${document.location.href})`;
  //           div.style.backgroundSize = `${width * scale}px ${height * scale}px`;
  //           div.style.backgroundRepeat = "no-repeat";
  
  //           // Attach mousemove listener to the document
  //           document.addEventListener("mousemove", (e) => {
  //             const x = e.clientX;
  //             const y = e.clientY;
  
  //             div.style.left = `${x - size / 2}px`;
  //             div.style.top = `${y - size / 2}px`;
  //             div.style.backgroundPosition = `-${x * scale - size / 2}px -${y * scale - size / 2}px`;
  //           });
  
  //           // Add the magnifying glass to the document
  //           document.documentElement.append(div);
  //         }
  //       },
  //     });
  //   }
  //   setMagnifyingGlassActive(!magnifyingGlassActive);
  // };

  const toggleMagnifyingGlass = () => { 
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) { 
        chrome.scripting.executeScript({ 
          target: { tabId: tabs[0].id }, 
          func: () => {
             chrome.runtime.sendMessage({ action: 'toggleMagnifyingGlass' }); 
             console.log('MG message sent');
            } 
          }); 
        } 
      });
    setMagnifyingGlassActive(!magnifyingGlassActive);
    };

  const toggleHighContrast = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            chrome.runtime.sendMessage({ action: 'toggleHighContrast' });
            console.log('HC message sent');
          },
        });
      }
    });
    setHighContrastActive(!highContrastActive);
  }
  
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <input type="color" onChange={(e) => setColour(e.currentTarget.value)} />
        <button onClick={onclick}>
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* Button to toggle Magnifying Glass */}
      {/* <button onClick={toggleMagnifyingGlass1}>
        {magnifyingGlassActive ? "Hide Magnifying Glass" : "Show Magnifying Glass"}
      </button> */}

      {/* Button to toggle Magnifying Glass */}
      <button id="toggleMagnifyingGlassBtn" onClick={toggleMagnifyingGlass}>
        {magnifyingGlassActive ? "Hide Magnifying Glass (Content script)" : "Show Magnifying Glass (Content Script)"}
      </button>

      <button id="toggleHighContrastBtn" onClick={toggleHighContrast}>
        {highContrastActive ? "Disable High Contrast" : "Enable High Contrast"}
      </button>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}




export default App
