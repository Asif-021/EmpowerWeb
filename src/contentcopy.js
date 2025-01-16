console.log("Content script loaded");

// Centralized magnifying glass management object
const MagnifyingGlassManager = {
  size: 200, // Size of the magnifying glass (width and height)
  scale: 2, // Magnification level
  glassClass: "mgnfng-glss", // Class for the magnifying glass
  position: { x: 0, y: 0 }, // Initial position of the magnifying glass
  screenshot: null,

  // Toggles the magnifying glass
  toggle() {
    const existingDiv = document.querySelector(`.${this.glassClass}`);
    if (existingDiv) {
      this.remove(existingDiv);
    } else {
      this.create();
      chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' });
    }
  },

  // Creates the magnifying glass
  create() {
    console.log("Creating magnifying glass...");
    const div = document.createElement("div");
    div.classList.add(this.glassClass, "rounded-circle", "shadow");
    div.style.position = "absolute";
    div.style.width = `${this.size}px`;
    div.style.height = `${this.size}px`;
    div.style.borderRadius = "50%";
    div.style.overflow = "hidden";
    div.style.border = "2px solid rgba(0, 0, 0, 0.2)";
    div.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    div.style.pointerEvents = "none";
    div.style.zIndex = "9999";

    document.body.appendChild(div);

    // Add mousemove listener to move the magnifying glass
    document.addEventListener("mousemove", this.move.bind(this));
  },

  // Sets up the background image for the magnifying glass based on the entire page
  setupBackground(div) {
    if (this.screenshot){
      console.log('setting up background')
      const body = document.body;
      const html = document.documentElement;

      // Calculate full page dimensions (width and height)
      const width = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      );
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      // Set the background for the magnifying glass
      // div.style.backgroundColor = "#ff0000";  // Solid red color for testing
      div.style.backgroundImage = `url(${this.screenshot})`; // Use current URL
      div.style.backgroundSize = `${width * this.scale}px ${height * this.scale}px`;
      div.style.backgroundRepeat = "no-repeat";
      div.style.backgroundAttachment = "fixed"; // Fix background to prevent scrolling issues
    }
  },

  // Moves the magnifying glass based on mouse position
  move(event) {
    const div = document.querySelector(`.${this.glassClass}`);
    if (div) {
      const { clientX: x, clientY: y } = event;
      this.position = { x, y };

      div.style.left = `${x - this.size / 2}px`;
      div.style.top = `${y - this.size / 2}px`;
      div.style.backgroundPosition = `-${(x * this.scale) - this.size / 2}px -${(y * this.scale) - this.size / 2}px`;
    }
  },

  // Removes the magnifying glass
  remove(existingDiv) {
    console.log("Removing magnifying glass...");
    existingDiv.remove();
    document.removeEventListener("mousemove", this.move.bind(this));
  },
};

// Listen for messages from app.tsx
window.addEventListener("message", (event) => {
  if (event.data.action === "toggleMagnifyingGlass") {
    MagnifyingGlassManager.toggle();
  }
});

// Listen for messages from the background script 
chrome.runtime.onMessage.addListener((message) => { 
  if (message.type === 'SCREENSHOT_TAKEN') {
    console.log("Screenshot received in content script");
    MagnifyingGlassManager.screenshot = message.screenshot; 
    MagnifyingGlassManager.setupBackground(); 
  } 
});
