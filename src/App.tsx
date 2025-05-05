// import html2canvas from 'html2canvas';
import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


function App() {
  const [colour, setColour] = useState<string>('');
  const [highContrastType, setHighContrastType] = useState<string>('normal')
  const [colorBlindness, setColorBlindness] = useState<string>('normal')
  const [magnifyingGlassActive, setMagnifyingGlassActive] = useState<boolean>(false);
  const [magnifyingScale, setMagnifyingScale] = useState<string>('2');
  const [magnifyingSize, setMagnifyingSize] = useState<string>('100');
  const [magnifyingHeight, setMagnifyingHeight] = useState<string>('200');
  const [magnifyingWidth, setMagnifyingWidth] = useState<string>('400');
  const [isRectangle, setIsRectangle] = useState<boolean>(false);
  const [textTTS, setTextTTS] = useState<string>('');
  const [rateTTS, setRateTTS] = useState<string>('1.0');

  useEffect(() => {
    chrome.storage.local.get(['magnifyingGlassPreferences', 'textToSpeechPreferences'], (result) => {
      if (result.magnifyingGlassPreferences) {
        const prefs = result.magnifyingGlassPreferences;
        setMagnifyingScale(prefs.magnifyingScale || '2');
        setMagnifyingSize(prefs.magnifyingSize || '100');
        setIsRectangle(prefs.isRectangle ?? false);
        setMagnifyingHeight(prefs.magnifyingHeight || '200');
        setMagnifyingWidth(prefs.magnifyingWidth || '400');
      }
      if (result.textToSpeechPreferences){
        const prefs = result.textToSpeechPreferences;
        setTextTTS(prefs.textTTS);
        setRateTTS(prefs.rateTTS);
      }
    });
  }, []);


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
    chrome.storage.local.set({
      magnifyingGlassPreferences: {
        magnifyingScale: magnifyingScale,
        magnifyingSize: magnifyingSize,
        isRectangle: isRectangle,
        magnifyingHeight: magnifyingHeight,
        magnifyingWidth: magnifyingWidth,
      }
    });
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
          args: [textTTS, interrupt, rateTTS],
          func: (textTTS, interrupt, rateTTS) => {
            if(interrupt==='start'){
            chrome.runtime.sendMessage({ action: 'startTTS', text: textTTS, rate: rateTTS });
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
            else if(interrupt==='clear'){
              chrome.runtime.sendMessage({ action: 'stopTTS' });
              console.log('Clear TTS and stop message sent');
               // Clear textTTS and rateTTS in the storage
                chrome.storage.local.set({
                  textToSpeechPreferences: {
                    textTTS: "", // Set to empty string when clearing
                    rateTTS: rateTTS
                  }
                });
              }
          },
        });
      }   
    });
    chrome.storage.local.set({
      textToSpeechPreferences: {
        textTTS: textTTS,
        rateTTS: rateTTS
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
            <div className="shortcut-hint mt-2">
              <em>Shortcut: <strong>Ctrl+Shift+1</strong> / <strong>Cmd+Shift+1</strong> </em>
            </div>
            <div className="accordion-body d-flex flex-column">
              <div className="form-check form-switch d-flex mb-0 ps-0">
                <label className="form-check-label mb-0" htmlFor="flexSwitchCheckDefault">Rectangular Shape</label>
                <input
                  className="form-check-input ms-3"
                  type="checkbox"
                  checked={isRectangle}
                  onChange={() => setIsRectangle(!isRectangle)}
                  role="switch"
                  id="flexSwitchCheckDefault"
                />
              </div>

              {!isRectangle ? (
                <label className="input-label" htmlFor="magnifyingSize" id='magnifyingSizeContainer'>
                  Size:
                <input
                  className="w-50"
                  style={{margin:"0 0.1rem"}}
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
                <label className="input-label" htmlFor="magnifyingHeight" id='magnifyingHeightContainer'>
                  Height:
                  <input
                    style={{width: "50%", margin:"0 0.1rem"}}
                    id='magnifyingHeight'
                    type="number"
                    min={100}
                    value={magnifyingHeight}
                    onChange={(e) => setMagnifyingHeight(e.currentTarget.value)}
                  />
                  px
                </label>
                <label className="input-label" htmlFor="magnifyingWidth" id='magnifyingWidthContainer'>
                  Width:
                  <input
                    style={{width: "50%", margin:"0 0.1rem"}}
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
              <label className="input-label scale" id='magnifyingScaleContainer'>
                Zoom:
              <input
                className="w-50"
                style={{margin:"0 0.1rem"}}
                id='magnifyingScale'
                type="number"
                min={1}
                value={magnifyingScale}
                onChange={(e) => setMagnifyingScale(e.currentTarget.value)}
              />
              x
              </label>
              <button className="btn btn-primary mt-2 align-self-center width-fit-content" onClick={toggleMagnifyingGlass}>
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
            <div className="shortcut-hint mt-2">
              <em>Note: <strong>For use on static webpages</strong></em>
            </div>
            <div className="accordion-body d-flex flex-column align-items-center">
              Select Colour:
              <input className="mt-2 mb-2" type="color" onChange={(e) => setColour(e.currentTarget.value)} />
              <button className="btn btn-primary" onClick={toggleColour}>Apply Colour</button>
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
            <div className="accordion-body d-flex justify-content-center">
              <form className="d-flex flex-column align-items-start">
                <label >
                  <input
                    type="radio"
                    name="highContrast"
                    value="normal"
                    checked={highContrastType === 'normal'}
                    onChange={handleHighContrastChange}
                  />
                  Normal
                </label>

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
                <button className="btn btn-primary align-self-center mt-1" id="toggleHighContrastBtn" onClick={toggleHighContrast}>
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
            <div className="accordion-body d-flex justify-content-center">
              <form className='d-flex flex-column align-items-start'>
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

                <label>
                  <input
                    type="radio"
                    name="colorBlindness"
                    value="protanomaly"
                    checked={colorBlindness === 'protanomaly'}
                    onChange={handleColorBlindnessChange}
                  />
                  Protanomaly (Red-Green)
                </label>

                <label>
                  <input
                    type="radio"
                    name="colorBlindness"
                    value="deuteranomaly"
                    checked={colorBlindness === 'deuteranomaly'}
                    onChange={handleColorBlindnessChange}
                  />
                  Deuteranomaly (Green-Red)
                </label>

                <label>
                  <input
                    type="radio"
                    name="colorBlindness"
                    value="tritanomaly"
                    checked={colorBlindness === 'tritanomaly'}
                    onChange={handleColorBlindnessChange}
                  />
                  Tritanomaly (Blue-Yellow)
                </label>

                <button className="btn btn-primary align-self-center mt-1" type="button" onClick={toggleColorBlindFilter}>
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
                id = "textareaTTS"
                placeholder="Paste text here to be spoken"
                spellCheck="false"
                onChange={(e) => setTextTTS(e.target.value)}
                value={textTTS}
              />
              <div className="rate-container">
                <label htmlFor='rate'>Speed:</label>
                <input 
                  className='ms-1'
                  type="number" 
                  min={1}
                  step={0.1}
                  max={3}
                  name="rate"
                  onChange={(e) => setRateTTS(e.target.value)}
                  value={rateTTS}
                />
              </div>
              <div className="tts-button-container d-flex flex-column">
                <button className="btn btn-primary my-1" onClick={() => handleTTS("start")}>Start</button>
                <button className="btn btn-outline-primary my-1" onClick={() => handleTTS("pause")}>Pause</button>
                <button className="btn btn-outline-info my-1" onClick={() => handleTTS("resume")}>Resume</button>
                <button className="btn btn-danger my-1" onClick={() => handleTTS("stop")}>Stop</button>
                <button className="btn btn-secondary my-1"onClick={() => {handleTTS("clear");
                                        setTextTTS("");}
                }>Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}




export default App
