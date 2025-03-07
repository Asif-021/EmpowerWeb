console.log("Content script loaded");
chrome.runtime.sendMessage({ action: "contentScriptReady" });

let isSVGInjected = false;

// Centralized magnifying glass management object
const MagnifyingGlassManager = {
  size: 200, // Size of the magnifying glass
  scale: 2, // Magnification level
  glassClass: "mgnfng-glss", // Class for the magnifying glass
  position: { x: 0, y: 0 }, // Initial position of the magnifying glass
  imageData: "",
  height: 200,
  width:200,
  isRectangle: false,

  // Toggles the magnifying glass
  toggle(magnifyingScale, magnifyingSize, isRectangle, magnifyingHeight, magnifyingWidth) {

    const existingDiv = document.querySelector(`.${this.glassClass}`);
    if (existingDiv) {
      this.remove(existingDiv);

    } else {
      this.scale = Number(magnifyingScale);
      this.size = Number(magnifyingSize);
      this.height = Number(magnifyingHeight);
      this.width = Number(magnifyingWidth);
      this.isRectangle = isRectangle;
      // console.log('scale is now ', magnifyingScale);
      // console.log('size is now ', magnifyingSize);
      console.log('isRectangle is now ', this.isRectangle);
      console.log('Height is now ', this.height);
      console.log('Width is now ', this.width);
      this.create();
    }
  },
  // Creates the magnifying glass
  create() {
    console.log("Creating magnifying glass...");
    const div = document.createElement("div");
    div.classList.add(this.glassClass, "rounded-0", "shadow");
    div.style.position = "absolute";
    if (!this.isRectangle){
      div.style.width = `${this.size}px`;
      div.style.height = `${this.size}px`;
      div.style.borderRadius = "50%";
    }
    else{
      div.style.width = `${this.width}px`;
      div.style.height = `${this.height}px`;
      div.style.borderRadius = "0";
    }
    div.style.overflow = "hidden";
    div.style.border = "2px solid rgba(0, 0, 0, 0.2)";
    div.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    div.style.pointerEvents = "none";
    div.style.zIndex = "9999";

    document.body.appendChild(div);

    // Set up the background image for magnifying glass
    this.setupBackground(div);

    // Add mousemove listener to move the magnifying glass
    document.addEventListener("mousemove", this.move.bind(this));
    document.addEventListener("click", this.onClick.bind(this));
    document.addEventListener("scroll", this.onScroll.bind(this));
  },

  // Sets up the background image of the magnifying glass based on the entire page
  async setupBackground(div) {
    try {
      // Wrap chrome.runtime.sendMessage in a Promise
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "captureVisibleTab" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if (response && response.imageData) {
        this.imageData = response.imageData;
        
        // console.log("Captured image data:", this.imageData);

        // Set the background for the magnifying glass
        div.style.backgroundImage = `url(${this.imageData})`;
        // div.style.backgroundSize = `${window.innerWidth * this.scale}px ${window.innerHeight * this.scale}px`;
        // div.style.backgroundSize = `${window.innerWidth * this.scale * window.devicePixelRatio}px 
        //                             ${window.innerHeight * this.scale * window.devicePixelRatio}px`;
        // div.style.backgroundSize = `${window.innerWidth * this.scale}px ${window.innerHeight * this.scale}px`;  // Zoom effect
        div.style.backgroundRepeat = "no-repeat";
        // div.style.backgroundAttachment = "fixed";
        div.style.scale = this.scale/devicePixelRatio;
      }
    } catch (error) {
      console.error("Error setting up background:", error);
    }
  },

  // Moves the magnifying glass based on mouse position
  move(event) {
    const div = document.querySelector(`.${this.glassClass}`);
    dpr = window.devicePixelRatio || 1;
    if (div) {
      const { clientX: x, clientY: y } = event;
      this.position = { x, y };
      

      const halfWidth = this.isRectangle ? this.width / 2 : this.size / 2;
      const halfHeight = this.isRectangle ? this.height / 2 : this.size / 2;
      const scrollX = window.scrollX || 0;
      const scrollY = window.scrollY || 0;
      const dpr = window.devicePixelRatio || 1;


      // Position the magnifying glass centered around the cursor
      // div.style.left = `${x / dpr - halfWidth}px`;
      // div.style.top = `${y / dpr - halfHeight}px`;
      div.style.left = `${x - halfWidth}px`;
      div.style.top = `${y - halfHeight}px`;

      
      // Adjust the background position so the zoomed area aligns with the crosshair
      // div.style.backgroundPosition = `-${(x + scrollX) * this.scale * dpr - halfWidth}px -${(y + scrollY) * this.scale * dpr - halfHeight}px`;

      // div.style.backgroundPosition = `-${(x * this.scale) - this.size / 2}px -${(y * this.scale) - this.size / 2}px`;
      // div.style.backgroundPosition = `-${(x * this.scale * dpr) - (this.size / 2)}px -${(y * this.scale * dpr) - (this.size / 2)}px`;
      div.style.backgroundPosition = (halfWidth - x * devicePixelRatio) + 'px ' + (halfHeight - y * devicePixelRatio) + 'px';
      // div.style.backgroundPosition = `-${(x + scrollX) * this.scale - halfWidth}px -${(y + scrollY) * this.scale - halfHeight}px`;

    }
  },

  onClick() {
    const existingDiv = document.querySelector(`.${this.glassClass}`);
    if (existingDiv) {
      this.remove(existingDiv);
    }
  },

  onScroll(){
    const existingDiv = document.querySelector(`.${this.glassClass}`);
    if (existingDiv) {
      this.remove(existingDiv);
    }
  },

  // Removes the magnifying glass
  remove(existingDiv) {
    console.log("Removing magnifying glass...");
    this.imageData = "";
    existingDiv.remove();
    document.removeEventListener("mousemove", this.move.bind(this));
    document.removeEventListener("click", this.onClick.bind(this));
    document.removeEventListener("scroll", this.onScroll.bind(this));

  },
};
// MGManager END

function injectSVG(){
  if (!isSVGInjected){
    const svgFilters = `
        <svg id="hc-cb-filters" xmlns="http://www.w3.org/2000/svg" version="1.1" style="display: none;">
            <defs>
                <filter id="increased-contrast">
                    <feComponentTransfer>
                        <feFuncR type="gamma" exponent="3" />
                        <feFuncG type="gamma" exponent="3" />
                        <feFuncB type="gamma" exponent="3" />
                    </feComponentTransfer>
                </filter>
                <filter id="grayscale">
                    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0
                                                          0.33 0.33 0.33 0 0
                                                          0.33 0.33 0.33 0 0
                                                          0    0    0    1 0" />
                </filter>
                <filter id="invert">
                    <feComponentTransfer>
                        <feFuncR type="table" tableValues="1 0" />
                        <feFuncG type="table" tableValues="1 0" />
                        <feFuncB type="table" tableValues="1 0" />
                    </feComponentTransfer>
                </filter>
                <filter id="yellow-on-black">
                  <feComponentTransfer>
                      <feFuncR type="gamma" amplitude="-1" exponent="3" offset="1"/>
                      <feFuncG type="gamma" amplitude="-1" exponent="3" offset="1"/>
                      <feFuncB type="gamma" amplitude="-1" exponent="3" offset="1"/>
                  </feComponentTransfer>
                  <feColorMatrix type="matrix" values="0.3 0.7 0 0 0 
                                                      0.3 0.7 0 0 0
                                                      0 0 0 0 0
                                                      0 0 0 1 0"/>
                </filter>
                <filter id="protanomaly" x="0" y="0" width="99999" height="99999">
                  <feColorMatrix type="matrix" values="
                    0.472 -1.2946 0.9857 0 0
                    -0.6128 1.6326 0.0187 0 0
                    0.1407 -0.338 -0.0044 0 0
                    -0.142 0.2488 0.0044 0 0
                    0.1872 -0.3908 0.9942 0 0
                    -0.0451 0.142 0.0013 0 0
                    0.0222 -0.0253 -0.0004 0 0
                    -0.029 -0.0201 0.0006 0 0
                    0.0068 0.0454 0.999 0 0
                  " />
                </filter>
                <!-- Deuteranomaly Filter -->
                <filter id="deuteranomaly" x="0" y="0" width="99999" height="99999">
                  <feColorMatrix type="matrix" values="
                    0.5442 -1.1454 0.9818 0 0
                    -0.7091 1.5287 0.0238 0 0
                    0.165 -0.3833 -0.0055 0 0
                    -0.1664 0.4368 0.0056 0 0
                    0.2178 -0.5327 0.9927 0 0
                    -0.0514 0.0958 0.0017 0 0
                    0.018 -0.0288 -0.0006 0 0
                    -0.0232 -0.0649 0.0007 0 0
                    0.0052 0.036 0.9998 0 0
                  " />
                </filter>
                <!-- Tritanomaly Filter -->
                <filter id="tritanomaly" x="0" y="0" width="99999" height="99999">
                  <feColorMatrix type="matrix" values="
                    0.4275 -0.0181 0.9307 0 0
                    -0.2454 0.0013 0.0827 0 0
                    -0.1821 0.0168 -0.0134 0 0
                    -0.128 0.0047 0.0202 0 0
                    0.0233 -0.0398 0.9728 0 0
                    0.1048 0.0352 0.007 0 0
                    -0.0156 0.0061 0.0071 0 0
                    0.3841 0.2947 0.0151 0 0
                    -0.3685 -0.3008 0.9778 0 0
                  " />
                </filter>
            </defs>
        </svg>
    `;

    const div = document.createElement('div');
    div.id = 'hc-cb-filter-container'
    div.innerHTML = svgFilters;
    div.style.position = 'absolute';
    div.style.height = '0';
    div.style.width = '0';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    isSVGInjected = true;
  }
  else return
}
// Manager for High Contrast
const HighContrastManager = {
  isHighContrastEnabled: false,
  isFiltersInjected: false, // Flag to track if SVG filters are already injected

  toggle(filterType) {
    // console.log(this.isFiltersInjected)
    // if (!this.isFiltersInjected) {
    //   this.injectSVGFilters(); // Inject filters only once
    //   this.isFiltersInjected = true;
    // }
    // this.applyFilter(filterType); // Apply the high-contrast filter

    if (filterType === 'normal'){
      this.removeFilter()
      return
    }
    else{
      if (!isSVGInjected) {
        injectSVG(); // Inject filters only once
        
      }
      
      setTimeout(() => {
        console.log('applying filter after 100ms')
        this.applyFilter(filterType)
      }, 100); // Apply the high-contrast filter
    }
  },

  // injectSVGFilters() {
  //   const existingSVG = document.getElementById('high-contrast-filters');
  //   if (existingSVG) {
  //     // If the filters are already in the DOM, do nothing
  //     return;
  //   }

  //   const svgFilters = `
  //       <svg id="high-contrast-filters" xmlns="http://www.w3.org/2000/svg" version="1.1" style="display: none;">
  //           <defs>
  //               <filter id="increased-contrast">
  //                   <feComponentTransfer>
  //                       <feFuncR type="gamma" exponent="3" />
  //                       <feFuncG type="gamma" exponent="3" />
  //                       <feFuncB type="gamma" exponent="3" />
  //                   </feComponentTransfer>
  //               </filter>
  //               <filter id="grayscale">
  //                   <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0
  //                                                         0.33 0.33 0.33 0 0
  //                                                         0.33 0.33 0.33 0 0
  //                                                         0    0    0    1 0" />
  //               </filter>
  //               <filter id="invert">
  //                   <feComponentTransfer>
  //                       <feFuncR type="table" tableValues="1 0" />
  //                       <feFuncG type="table" tableValues="1 0" />
  //                       <feFuncB type="table" tableValues="1 0" />
  //                   </feComponentTransfer>
  //               </filter>
  //               <filter id="yellow-on-black">
  //                 <feComponentTransfer>
  //                     <feFuncR type="gamma" amplitude="-1" exponent="3" offset="1"/>
  //                     <feFuncG type="gamma" amplitude="-1" exponent="3" offset="1"/>
  //                     <feFuncB type="gamma" amplitude="-1" exponent="3" offset="1"/>
  //                 </feComponentTransfer>
  //                 <feColorMatrix type="matrix" values="0.3 0.7 0 0 0 
  //                                                     0.3 0.7 0 0 0
  //                                                     0 0 0 0 0
  //                                                     0 0 0 1 0"/>
  //               </filter>
  //           </defs>
  //       </svg>
  //   `;

  //   const div = document.createElement('div');
  //   div.id = 'high-contrast-filters'
  //   div.innerHTML = svgFilters;
  //   div.style.position = 'absolute';
  //   div.style.height = '0';
  //   div.style.width = '0';
  //   div.style.visibility = 'hidden';
  //   document.body.appendChild(div);
  // },

  applyFilter(filterId) {
    const html = document.documentElement; // Apply filter to the entire page
    html.style.filter = `url(#${filterId})`;
  },


  removeFilter() {
    const html = document.documentElement;
    const div = document.getElementById('high-contrast-filters')
    html.style.filter = 'none'; // Reset the filter
    //   setTimeout(() => {
    //     if (div) {
    //         div.remove();
    //     }
    // }, 100); // 100ms delay to ensure reset has occurred
    this.isFiltersInjected = false;
  },

}

// Class for color blind filter
const ColorBlindFilterManager = {
  isFiltersInjected: false,

  toggle(filterId){
    // if (filterId === 'normal'){
    //   this.removeFilter()
    //   return
    // }
    // else{
    //   if (!this.isFiltersInjected) {
    //     this.injectSVGFilters(); // Inject filters only once
    //     this.isFiltersInjected = true;
    //   }
    //   this.applyFilter(filterId); // Apply the high-contrast filter
    // }
    if (filterId === 'normal'){
      this.removeFilter()
      return
    }
    else{
      if (!isSVGInjected) {
        injectSVG(); // Inject filters only once
      }
      setTimeout(() => {
        console.log('applying filter after 100ms')
        this.applyFilter(filterId)
      }, 100); // Apply the high-contrast filter
    }


  },

  // injectSVGFilters(){
  //   const existingSVG = document.getElementById('colorblind-filters')
  //   if (existingSVG){
  //     // if filters are already in the DOM, do nothing
  //     return;
  //   }
    
  //   // Colourblind filters sourced from Dalton for google chrome
  //   const svgFilters = `
  //   <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  //     <defs>
  //       <!-- Protanomaly Filter -->
  //       <filter id="protanomaly" x="0" y="0" width="99999" height="99999">
  //         <feColorMatrix type="matrix" values="
  //           0.472 -1.2946 0.9857 0 0
  //           -0.6128 1.6326 0.0187 0 0
  //           0.1407 -0.338 -0.0044 0 0
  //           -0.142 0.2488 0.0044 0 0
  //           0.1872 -0.3908 0.9942 0 0
  //           -0.0451 0.142 0.0013 0 0
  //           0.0222 -0.0253 -0.0004 0 0
  //           -0.029 -0.0201 0.0006 0 0
  //           0.0068 0.0454 0.999 0 0
  //         " />
  //       </filter>
  //       <!-- Deuteranomaly Filter -->
  //       <filter id="deuteranomaly" x="0" y="0" width="99999" height="99999">
  //         <feColorMatrix type="matrix" values="
  //           0.5442 -1.1454 0.9818 0 0
  //           -0.7091 1.5287 0.0238 0 0
  //           0.165 -0.3833 -0.0055 0 0
  //           -0.1664 0.4368 0.0056 0 0
  //           0.2178 -0.5327 0.9927 0 0
  //           -0.0514 0.0958 0.0017 0 0
  //           0.018 -0.0288 -0.0006 0 0
  //           -0.0232 -0.0649 0.0007 0 0
  //           0.0052 0.036 0.9998 0 0
  //         " />
  //       </filter>
  //       <!-- Tritanomaly Filter -->
  //       <filter id="tritanomaly" x="0" y="0" width="99999" height="99999">
  //         <feColorMatrix type="matrix" values="
  //           0.4275 -0.0181 0.9307 0 0
  //           -0.2454 0.0013 0.0827 0 0
  //           -0.1821 0.0168 -0.0134 0 0
  //           -0.128 0.0047 0.0202 0 0
  //           0.0233 -0.0398 0.9728 0 0
  //           0.1048 0.0352 0.007 0 0
  //           -0.0156 0.0061 0.0071 0 0
  //           0.3841 0.2947 0.0151 0 0
  //           -0.3685 -0.3008 0.9778 0 0
  //         " />
  //       </filter>
  //     </defs>
  //   </svg>
  //   `;

  //   const div = document.createElement('div');
  //   div.id = 'colorblind-filters'
  //   div.innerHTML = svgFilters;
  //   div.style.position = 'absolute';
  //   div.style.height = '0';
  //   div.style.width = '0';
  //   div.style.visibility = 'hidden';
  //   document.body.appendChild(div);
  // },

  
  applyFilter(filterId) {
    const html = document.documentElement; // Apply filter to the entire page
    html.style.filter = `url(#${filterId})`;
    switch(filterId){
      case 'protanomaly':
        console.log('applying ', filterId)
        break;
      case 'deuteranomaly':
        console.log('applying ', filterId)
        break;
      case 'tritanomaly':
        console.log('applying ', filterId)
        break;
    }
  },


  removeFilter() {
      const html = document.documentElement;
      const div = document.getElementById('colorblind-filters')
      
      html.style.filter = 'none'; // Reset the filter
    //   setTimeout(() => {
    //     if (div) {
    //         div.remove();
    //     }
    // }, 100); // 100ms delay to ensure reset has occurred
  },
}
// Listen for messages from app.tsx
// window.addEventListener("message", (event) => {
//   if (event.data.action === "toggleMagnifyingGlass") {
//     console.log(event.data)
//     MagnifyingGlassManager.toggle(event.data.magnifyingScale);
//   }
// });

// Class for TTS
// const TextToSpeechManager = {
//   startTTS(text){
//     const lang = "en-GB";
//     const voiceName = "Google UK English Female"; // Desired voice name

//     // Create the utterance
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;

//     // Get the list of available voices
//     const voices = window.speechSynthesis.getVoices();
    
//     // Find the voice that matches the desired name
//     const selectedVoice = voices.find(voice => voice.name === voiceName);

//     if (selectedVoice) {
//       utterance.voice = selectedVoice;
//     } else {
//       console.warn(`Voice "${voiceName}" not found. Using default voice.`);
//     }

//     // Speak the utterance
//     console.log(voices)
//     window.speechSynthesis.speak(utterance);
//   }
// };


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('CS listening...')
  if (message.action === 'contentScriptReady') {
    console.log('Content script is ready');
  }

  if (message.action === "toggleMagnifyingGlass") {
    console.log("MG message received in content script", message);
    MagnifyingGlassManager.toggle(message.magnifyingScale, message.magnifyingSize, 
                                  message.isRectangle, message.magnifyingHeight, message.magnifyingWidth);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'toggleHighContrast') {
    console.log('Toggling High Contrast Mode');
    HighContrastManager.toggle(message.filterTypeHC);

    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'toggleColorBlindFilter'){
    console.log('Toggling Color Blind Filter');
    ColorBlindFilterManager.toggle(message.filterTypeCB);

    sendResponse({ success: true });
    return true;
  }

});

