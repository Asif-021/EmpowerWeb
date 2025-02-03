// import html2canvas from 'html2canvas';
import './App.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


function App() {
  const [colour, setColour] = useState<string>('');
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState<boolean>(false);
  const [magnifyingScale, setMagnifyingScale] = useState<string>('2');
  const [magnifyingSize, setMagnifyingSize] = useState<string>('200');
  const [magnifyingHeight, setMagnifyingHeight] = useState('200');
  const [magnifyingWidth, setMagnifyingWidth] = useState('200');
  const [isRectangle, setIsRectangle] = useState<boolean>(false);
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

 
  const toggleMagnifyingGlass = () => { 
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) { 
        chrome.scripting.executeScript<[String, String, boolean, String, String], void>({ 
          target: { tabId: tabs[0].id }, 
          args: [magnifyingScale, magnifyingSize, isRectangle, magnifyingHeight, magnifyingWidth],
          func: (magnifyingScale, magnifyingSize, isRectangle, magnifyingHeight, magnifyingWidth) => {
             chrome.runtime.sendMessage({ action: 'toggleMagnifyingGlass', magnifyingScale: magnifyingScale, 
                                          magnifyingSize: magnifyingSize, isRectangle:isRectangle,
                                          magnifyingHeight: magnifyingHeight, magnifyingWidth: magnifyingWidth}); 
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

  const handleTTS = (interrupt: String) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) {
        chrome.scripting.executeScript<String[], void>({
          target: { tabId: tabs[0].id },
          args: [textTTS, interrupt],
          func: (textTTS, interrupt) => {
            // chrome.runtime.sendMessage({ action: 'startTTS', text: textTTS });
            // console.log('TTS message sent');
            if(interrupt==='start'){
            chrome.runtime.sendMessage({ action: 'startTTS', text: textTTS });
            console.log('TTS message sent');
            }
            else if(interrupt==='pause'){
              chrome.runtime.sendMessage({ action: 'pauseTTS'});
              console.log('Pause TTS message sent');
            }
            else if(interrupt==='resume'){
              chrome.runtime.sendMessage({ action: 'resumeTTS'});
              console.log('Resume TTS message sent');
            }
            else if(interrupt==='stop'){
              chrome.runtime.sendMessage({ action: 'stopTTS'});
              console.log('Stop TTS message sent');
            }
          },
        });
      }   
    });
  }

  return (
    <>
      <h1>EmpowerWeb</h1>
      <div className="accordion" id="accessibilityAccordion">
        {/* Magnifying Glass */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="magnifyingGlassHeader">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#magnifyingGlass"
              aria-expanded="true"
              aria-controls="magnifyingGlass"
            >
              Magnifying Glass
            </button>
          </h2>
          <div
            id="magnifyingGlass"
            className="accordion-collapse collapse show"
            aria-labelledby="magnifyingGlassHeader"
            data-bs-parent="#accessibilityAccordion"
          >
            <div className="accordion-body">
            <div className="form-check form-switch d-flex justify-content-between">
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Rectangular Shape</label>
                <input className="form-check-input" type="checkbox" checked={isRectangle} onChange={() => setIsRectangle(!isRectangle)} role="switch" id="flexSwitchCheckDefault"/>
              </div>
              {!isRectangle ? (
            <label htmlFor="magnifyingSize" id='magnifyingSizeContainer'>
                Size:
              <input
                id='magnifyingSize'
                type="number"
                min={100}
                value={magnifyingSize}
                onChange={(e) => setMagnifyingSize(e.currentTarget.value)}
              />
              px
              </label>
              ):(
                <>
                <label htmlFor="magnifyingHeight" id='magnifyingHeightContainer'>
                  Height:
                  <input
                    id='magnifyingHeight'
                    type="number"
                    min={100}
                    value={magnifyingHeight}
                    onChange={(e) => setMagnifyingHeight(e.currentTarget.value)}
                  />
                  px
                </label>
                <label htmlFor="magnifyingWidth" id='magnifyingWidthContainer'>
                  Width:
                  <input
                    id='magnifyingWidth'
                    type="number"
                    min={100}
                    value={magnifyingWidth}
                    onChange={(e) => setMagnifyingWidth(e.currentTarget.value)}
                  />
                  px
                </label>
                </>
              )}
              <label id='magnifyingScaleContainer'>
                Zoom:
              <input
                id='magnifyingScale'
                type="number"
                min={1}
                value={magnifyingScale}
                onChange={(e) => setMagnifyingScale(e.currentTarget.value)}
              />
              x
              </label>
              <button onClick={toggleMagnifyingGlass}>
                {magnifyingGlassActive ? 'Hide Magnifying Glass' : 'Show Magnifying Glass'}
              </button>
            </div>
          </div>
        </div>

        {/* Background Colour */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="backgroundColorHeader">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#backgroundColor"
              aria-expanded="false"
              aria-controls="backgroundColor"
            >
              Background Colour
            </button>
          </h2>
          <div
            id="backgroundColor"
            className="accordion-collapse collapse"
            aria-labelledby="backgroundColorHeader"
            data-bs-parent="#accessibilityAccordion"
          >
            <div className="accordion-body">
              <input type="color" onChange={(e) => setColour(e.currentTarget.value)} />
              <button onClick={toggleColour}>Apply Colour</button>
            </div>
          </div>
        </div>

        {/* High Contrast */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="highContrastHeader">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#highContrast"
              aria-expanded="false"
              aria-controls="highContrast"
            >
              High Contrast
            </button>
          </h2>
          <div
            id="highContrast"
            className="accordion-collapse collapse"
            aria-labelledby="highContrastHeader"
            data-bs-parent="#accessibilityAccordion"
          >
            <div className="accordion-body">
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
          </div>
        </div>

        {/* Color Blindness */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="colorBlindnessHeader">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#colorBlindness"
              aria-expanded="false"
              aria-controls="colorBlindness"
            >
              Color Blindness
            </button>
          </h2>
          <div
            id="colorBlindness"
            className="accordion-collapse collapse"
            aria-labelledby="colorBlindnessHeader"
            data-bs-parent="#accessibilityAccordion"
          >
            <div className="accordion-body">
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
          </div>
        </div>

        {/* Text-to-Speech */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="ttsHeader">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#tts"
              aria-expanded="false"
              aria-controls="tts"
            >
              Text to Speech
            </button>
          </h2>
          <div
            id="tts"
            className="accordion-collapse collapse"
            aria-labelledby="ttsHeader"
            data-bs-parent="#accessibilityAccordion"
          >
            <div className="accordion-body">
              <textarea
                placeholder="Paste text here to be spoken"
                onChange={(e) => setTextTTS(e.target.value)}
                value={textTTS}
              />
              <button onClick={() => handleTTS("start")}>Start TTS</button>
              <button onClick={() => handleTTS("pause")}>Pause</button>
              <button onClick={() => handleTTS("resume")}>Resume</button>
              <button onClick={() => handleTTS("stop")}>Stop</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}




export default App
