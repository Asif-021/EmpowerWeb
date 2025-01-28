// import html2canvas from 'html2canvas';
import './App.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [colour, setColour] = useState<string>('');
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState<boolean>(false);
  const [magnifyingScale, setMagnifyingScale] = useState<string>('2');
  // const [highContrastActive, setHighContrastActive] = useState<boolean>(false);
  const [highContrastType, setHighContrastType] = useState<string>('normal')
  const [colorBlindness, setColorBlindness] = useState<string>('normal')
  const [textTTS, setTextTTS] = useState<string>('')
  const [key, setKey] = useState('magnifyingGlass');



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
    // <>
    //   <h1>EmpowerWeb</h1>
    //   <div className="card">
    //     <input type="color" onChange={(e) => setColour(e.currentTarget.value)} />
    //     <button onClick={toggleColour}>
    //     </button>

    //     {/* Button to toggle Magnifying Glass */}
    //     <div className="magnifying-glass-container">
    //       <input type="number" min={1} value={magnifyingScale} onChange={(e) => setMagnifyingScale(e.currentTarget.value)}/>
    //       <button id="toggleMagnifyingGlassBtn" onClick={toggleMagnifyingGlass}>
    //         {magnifyingGlassActive ? "Hide Magnifying Glass (Content script)" : "Show Magnifying Glass (Content Script)"}
    //       </button>
    //     </div>

    //     <div className="high-contrast-container">
    //       <h3>Select High Contrast Type:</h3>
    //       <form>
    //         <label>
    //           <input
    //             type="radio"
    //             name="highContrast"
    //             value="normal"
    //             checked={highContrastType === 'normal'}
    //             onChange={handleHighContrastChange}
    //           />
    //           Normal
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="highContrast"
    //             value="increased-contrast"
    //             checked={highContrastType === 'increased-contrast'}
    //             onChange={handleHighContrastChange}
    //           />
    //           Increased Contrast
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="highContrast"
    //             value="grayscale"
    //             checked={highContrastType === 'grayscale'}
    //             onChange={handleHighContrastChange}
    //           />
    //           Greyscale
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="highContrast"
    //             value="invert"
    //             checked={highContrastType === 'invert'}
    //             onChange={handleHighContrastChange}
    //           />
    //           Inverted
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="highContrast"
    //             value="yellow-on-black"
    //             checked={highContrastType === 'yellow-on-black'}
    //             onChange={handleHighContrastChange}
    //           />
    //           Yellow on black
    //         </label>
    //         <br />
    //         <button id="toggleHighContrastBtn" onClick={toggleHighContrast}>
    //           Apply Filter
    //         </button>
    //       </form>
    //     </div>
    //     <div>
    //       <h3>Select Color Blindness Type:</h3>
    //       <form>
    //         <label>
    //           <input
    //             type="radio"
    //             name="colorBlindness"
    //             value="normal"
    //             checked={colorBlindness === 'normal'}
    //             onChange={handleColorBlindnessChange}
    //           />
    //           Normal Vision
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="colorBlindness"
    //             value="protanomaly"
    //             checked={colorBlindness === 'protanomaly'}
    //             onChange={handleColorBlindnessChange}
    //           />
    //           Protanomaly (Red-Green Color Blindness)
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="colorBlindness"
    //             value="deuteranomaly"
    //             checked={colorBlindness === 'deuteranomaly'}
    //             onChange={handleColorBlindnessChange}
    //           />
    //           Deuteranomaly (Green-Red Color Blindness)
    //         </label>
    //         <br />
    //         <label>
    //           <input
    //             type="radio"
    //             name="colorBlindness"
    //             value="tritanomaly"
    //             checked={colorBlindness === 'tritanomaly'}
    //             onChange={handleColorBlindnessChange}
    //           />
    //           Tritanomaly (Blue-Yellow Color Blindness)
    //         </label>
    //         <br />
    //         <button type="button" onClick={toggleColorBlindFilter}>
    //           Apply Color Blindness Filter
    //         </button>
    //       </form>
    //     </div>

    //     <div className="text-to-speech-container">
    //       <textarea placeholder='Paste text here to be spoken' onChange={(e) => setTextTTS(e.target.value)} value={textTTS}/>
    //       <button onClick={toggleTTS}>
    //         Start TTS
    //       </button>
    //     </div>
    //   </div>

    // </>
    <>
      <h1>EmpowerWeb</h1>
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        {/* Tab Headers */}
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${key === 'magnifyingGlass' ? 'active' : ''}`}
            id="magnifying-glass-tab"
            data-bs-toggle="tab"
            role="tab"
            onClick={() => setKey('magnifyingGlass')}
          >
            Magnifying Glass
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${key === 'backgroundColor' ? 'active' : ''}`}
            id="magnifying-glass-tab"
            data-bs-toggle="tab"
            role="tab"
            onClick={() => setKey('backgroundColor')}
          >
            Background Colour
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${key === 'highContrast' ? 'active' : ''}`}
            id="high-contrast-tab"
            data-bs-toggle="tab"
            role="tab"
            onClick={() => setKey('highContrast')}
          >
            High Contrast
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${key === 'colorBlindness' ? 'active' : ''}`}
            id="color-blindness-tab"
            data-bs-toggle="tab"
            role="tab"
            onClick={() => setKey('colorBlindness')}
          >
            Color Blindness
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${key === 'tts' ? 'active' : ''}`}
            id="tts-tab"
            data-bs-toggle="tab"
            role="tab"
            onClick={() => setKey('tts')}
          >
            Text to Speech
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3" id="myTabContent">
        {key === 'magnifyingGlass' && (
          <div className="tab-pane fade show active" id="magnifying-glass" role="tabpanel">
            <div className="magnifying-glass-container">
              <input type="number" min={1} value={magnifyingScale} onChange={(e) => setMagnifyingScale(e.currentTarget.value)} />
              <button id="toggleMagnifyingGlassBtn" onClick={toggleMagnifyingGlass}>
                {magnifyingGlassActive ? 'Hide Magnifying Glass (Content script)' : 'Show Magnifying Glass (Content Script)'}
              </button>
            </div>
          </div>
        )}
        {key === 'backgroundColor' && (
          <div className="tab-pane fade show active" id="background-color" role="tabpanel">
            <input type="color" onChange={(e) => setColour(e.currentTarget.value)} />
            <button onClick={toggleColour}>
            </button>
          </div>
        )}

        {key === 'highContrast' && (
          <div className="tab-pane fade show active" id="high-contrast" role="tabpanel">
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
        )}

        {key === 'colorBlindness' && (
          <div className="tab-pane fade show active" id="color-blindness" role="tabpanel">
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
        )}

        {key === 'tts' && (
          <div className="tab-pane fade show active" id="tts" role="tabpanel">
            <div className="text-to-speech-container">
              <textarea
                placeholder="Paste text here to be spoken"
                onChange={(e) => setTextTTS(e.target.value)}
                value={textTTS}
              />
              <button onClick={toggleTTS}>Start TTS</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}




export default App
