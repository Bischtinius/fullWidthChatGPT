let isEnabled = true;
let reloadedTabs = new Set(); // Set to keep track of reloaded tabs

// Load the initial state from storage
browser.storage.local.get('isEnabled', (result) => {
  isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
  updateIcon();
  applyCssToExistingTabs();
});

// Listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("chat.openai.com") && changeInfo.status === "complete") {
    if (isEnabled) {
      browser.tabs.insertCSS(tab.id, {file: "full-width.css"});
    } else if (!reloadedTabs.has(tab.id)) {
      reloadedTabs.add(tab.id);
      browser.tabs.reload(tab.id);
    }
  }
});

function toggleExtension() {
  isEnabled = !isEnabled;
  browser.storage.local.set({isEnabled: isEnabled});
  updateIcon();
  applyCssToExistingTabs();
  reloadedTabs.clear(); // Clear the set when toggling the extension
}

// Update the extension icon
function updateIcon() {
  browser.browserAction.setIcon({
    path: isEnabled ? "icons/fullWidthChatGPT_on.png" : "icons/fullWidthChatGPT_off.png"
  });
}

// Apply CSS to existing tabs
function applyCssToExistingTabs() {
  browser.tabs.query({url: "*://chat.openai.com/*"}, (tabs) => {
    tabs.forEach(tab => updateTabCss(tab));
  });
}

function updateTabCss(tab) {
  if (isEnabled) {
    browser.tabs.insertCSS(tab.id, {file: "full-width.css"});
  } else if (!reloadedTabs.has(tab.id)) {
    reloadedTabs.add(tab.id);
    browser.tabs.reload(tab.id);
  }
}

browser.browserAction.onClicked.addListener(toggleExtension);
