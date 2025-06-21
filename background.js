/**
 * Sends the list of domains to the backend for checking.
 * @param {string[]} urls - Array of URLs to check
 * @returns {Promise<Array>} The API response
 */
async function checkDomain(urls) {
  const response = await fetch(
    "https://fastapi-homograph-detector.onrender.com/api/check",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, model: "rdf" }),
    }
  );
  return await response.json();
}

/**
 * Checks if the URL is a homograph attack and blocks it if it is.
 * @param {string} url - The URL to check
 * @param {number} tabId - The ID of the tab containing the URL
 */
async function checkAndBlock(url, tabId) {
  try {
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://"))
      return;
    const res = await checkDomain([url]);
    if (res[0].label === 1) {
      await chrome.tabs.create({
        url: "block.html",
        active: true,
      });
      await chrome.tabs.remove(tabId);
    }
    console.log(res);
  } catch (error) {
    console.error("Error in checkAndBlock:", error);
  }
}

const tabUrls = {};

/**
 * Listens for URL updates in any tab
 * Sends a message with the current URL whenever a tab's URL changes
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    try {
      const currentUrl = new URL(changeInfo.url);
      const previousUrl = tabUrls[tabId] ? new URL(tabUrls[tabId]) : null;

      if (!previousUrl || currentUrl.hostname !== previousUrl.hostname) {
        checkAndBlock(changeInfo.url, tabId);
      }

      console.log(`Tab  changeInfo: ${changeInfo.url} and tab: ${tab.url}`);
      tabUrls[tabId] = changeInfo.url;
    } catch (error) {
      console.error("Error processing URL update:", error);
    }
  }
});

/**
 * Listens for tab activation events
 * Sends a message with the current URL whenever a user switches tabs
 * @param {Object} activeInfo - Contains information about the activated tab
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    // Get the complete tab information
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      checkAndBlock(tab.url, activeInfo.tabId);
    }
    console.log(`Tab  activeInfo: ${activeInfo.tabId} and tab: ${tab.url}`);
    tabUrls[activeInfo.tabId] = tab.url;
  } catch (error) {
    console.error("Error processing tab activation:", error);
  }
});

/**
 * Listens for tab removal events
 * Removes the tab's URL from the tabUrls object
 * @param {number} tabId - The ID of the tab that was removed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabUrls[tabId];
});
