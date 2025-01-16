console.log("Content script loaded");

// Centralized magnifying glass management object
const MagnifyingGlassManager = {
  size: 200, // Size of the magnifying glass
  scale: 2, // Magnification level
  glassClass: "mgnfng-glss", // Class for the magnifying glass
  position: { x: 0, y: 0 }, // Initial position of the magnifying glass
  imageData: "",

  // Toggles the magnifying glass
  toggle() {
    const existingDiv = document.querySelector(`.${this.glassClass}`);
    if (existingDiv) {
      this.remove(existingDiv);
    } else {
      this.create();
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

    // Set up the background image for magnifying glass
    this.setupBackground(div);

    // Add mousemove listener to move the magnifying glass
    document.addEventListener("mousemove", this.move.bind(this));
    document.addEventListener("click", this.onClick.bind(this));
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

        console.log("Captured image data:", this.imageData);

        // Set the background for the magnifying glass
        div.style.backgroundImage = `url(${this.imageData})`;
        div.style.backgroundSize = `${window.innerWidth * this.scale}px ${window.innerHeight * this.scale}px`;
        div.style.backgroundRepeat = "no-repeat";
        div.style.backgroundAttachment = "fixed";
      }
    } catch (error) {
      console.error("Error setting up background:", error);
    }
  },

  // Moves the magnifying glass based on mouse position
  move(event) {
    const div = document.querySelector(`.${this.glassClass}`);
    if (div) {
      const { clientX: x, clientY: y } = event;
      this.position = { x, y };

      hs = this.size/2
      div.style.left = `${x - hs}px`;
      div.style.top = `${y - hs}px`;
      div.style.backgroundPosition = `-${(x * this.scale) - this.size / 2}px -${(y * this.scale) - this.size / 2}px`;
    }
  },

  onClick() {
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
  },
};

// Listen for messages from app.tsx
window.addEventListener("message", (event) => {
  if (event.data.action === "toggleMagnifyingGlass") {
    MagnifyingGlassManager.toggle();
  }
});

// Listen for messages from the background script
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "toggleMagnifyingGlass") {
//     console.log("Message received in content script", message);
//     MagnifyingGlassManager.toggle();
//   }
// });
