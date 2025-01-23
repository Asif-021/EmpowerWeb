// import html2canvas from 'html2canvas';
import './App.css'
import { useState } from 'react'


function App() {
  const [colour, setColour] = useState<string>('');
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState<boolean>(false);
  const [magnifyingScale, setMagnifyingScale] = useState<string>('2');
  // const [highContrastActive, setHighContrastActive] = useState<boolean>(false);
  const [highContrastType, setHighContrastType] = useState<string>('normal')
  const [colorBlindness, setColorBlindness] = useState<string>('normal')
  const [textTTS, setTextTTS] = useState<string>('')


  const toggleColour = async () => {
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
        chrome.scripting.executeScript<String[], void>({ 
          target: { tabId: tabs[0].id }, 
          args: [magnifyingScale],
          func: (magnifyingScale) => {
             chrome.runtime.sendMessage({ action: 'toggleMagnifyingGlass', magnifyingScale: magnifyingScale}); 
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
        chrome.scripting.executeScript<String[], void>({
          target: { tabId: tabs[0].id },
          args: [highContrastType],
          func: (highContrastType) => {
            chrome.runtime.sendMessage({ action: 'toggleHighContrast', filterTypeHC: highContrastType });
            console.log(`Applying filter: ${highContrastType}`);
            console.log('HC message sent');
          },
        });
      }
    });

  }

  const handleHighContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHighContrastType(event.target.value);
  };
  
  // Function to handle colorblind filter change
   
   
  const handleColorBlindnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorBlindness(event.target.value);
  };

  // Function to apply colorblind filter (stub function, customize as per requirement)
  const toggleColorBlindFilter = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) {
        chrome.scripting.executeScript<String[], void>({
          target: { tabId: tabs[0].id },
          args: [colorBlindness],
          func: (colorBlindness) => {
            chrome.runtime.sendMessage({ action: 'toggleColorBlindFilter', filterTypeCB: colorBlindness });
            console.log(`Color Blindness filter applied: ${colorBlindness}`);
          },
        });
      }
    });
  };

  const toggleTTS = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) {
        chrome.scripting.executeScript<String[], void>({
          target: { tabId: tabs[0].id },
          args: [textTTS],
          func: (textTTS) => {
            chrome.runtime.sendMessage({ action: 'toggleTTS', text: textTTS });
            console.log('TTS message sent');
          },
        });
      }   
    });
  }

  return (
    <>
      <h1>EmpowerWeb</h1>
      <div className="card">
        <input type="color" onChange={(e) => setColour(e.currentTarget.value)} />
        <button onClick={toggleColour}>
        </button>

        {/* Button to toggle Magnifying Glass */}
        <div className="magnifying-glass-container">
          <input type="number" min={1} value={magnifyingScale} onChange={(e) => setMagnifyingScale(e.currentTarget.value)}/>
          <button id="toggleMagnifyingGlassBtn" onClick={toggleMagnifyingGlass}>
            {magnifyingGlassActive ? "Hide Magnifying Glass (Content script)" : "Show Magnifying Glass (Content Script)"}
          </button>
        </div>

        <div className="high-contrast-container">
          <h3>Select High Contrast Type:</h3>
          <form>
            <label>
              <input
                type="radio"
                name="highContrast"
                value="normal"
                checked={highContrastType === 'normal'}
                onChange={handleHighContrastChange}
              />
              Normal
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="highContrast"
                value="increased-contrast"
                checked={highContrastType === 'increased-contrast'}
                onChange={handleHighContrastChange}
              />
              Increased Contrast
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="highContrast"
                value="grayscale"
                checked={highContrastType === 'grayscale'}
                onChange={handleHighContrastChange}
              />
              Greyscale
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="highContrast"
                value="invert"
                checked={highContrastType === 'invert'}
                onChange={handleHighContrastChange}
              />
              Inverted
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="highContrast"
                value="yellow-on-black"
                checked={highContrastType === 'yellow-on-black'}
                onChange={handleHighContrastChange}
              />
              Yellow on black
            </label>
            <br />
            <button id="toggleHighContrastBtn" onClick={toggleHighContrast}>
              Apply Filter
            </button>
          </form>
        </div>
        <div>
          <h3>Select Color Blindness Type:</h3>
          <form>
            <label>
              <input
                type="radio"
                name="colorBlindness"
                value="normal"
                checked={colorBlindness === 'normal'}
                onChange={handleColorBlindnessChange}
              />
              Normal Vision
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="colorBlindness"
                value="protanomaly"
                checked={colorBlindness === 'protanomaly'}
                onChange={handleColorBlindnessChange}
              />
              Protanomaly (Red-Green Color Blindness)
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="colorBlindness"
                value="deuteranomaly"
                checked={colorBlindness === 'deuteranomaly'}
                onChange={handleColorBlindnessChange}
              />
              Deuteranomaly (Green-Red Color Blindness)
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="colorBlindness"
                value="tritanomaly"
                checked={colorBlindness === 'tritanomaly'}
                onChange={handleColorBlindnessChange}
              />
              Tritanomaly (Blue-Yellow Color Blindness)
            </label>
            <br />
            <button type="button" onClick={toggleColorBlindFilter}>
              Apply Color Blindness Filter
            </button>
          </form>
        </div>

        <div className="text-to-speech-container">
          <textarea placeholder='Paste text here to be spoken' onChange={(e) => setTextTTS(e.target.value)} value={textTTS}/>
          <button onClick={toggleTTS}>
            Start TTS
          </button>
        </div>
      </div>

    </>
  )
}




export default App
