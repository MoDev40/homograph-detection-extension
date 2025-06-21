document.addEventListener("DOMContentLoaded", () => {
  const urlElement = document.getElementById("url");

  async function init() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      urlElement.textContent = tab.url;
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  init();
});
