chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url === 'about:blank') {
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error removing tab: ${chrome.runtime.lastError.message}`);
      }
    });
  }
});

// Function to close blank tabs with error handling
function closeBlankTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url === 'about:blank') {
        chrome.tabs.remove(tab.id, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error removing tab with id ${tab.id}: ${chrome.runtime.lastError.message}`);
          }
        });
      }
    });
  });
}

// Listener for messages to close blank tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'closeBlankTabs') {
    closeBlankTabs();
    sendResponse({status: 'Tabs closed'});
  }
});

// Periodically close blank tabs based on interval stored in storage
function startTabCleanupInterval() {
  chrome.storage.sync.get({ interval: 60 }, (items) => {
    const interval = items.interval * 1000; // Convert seconds to milliseconds
    setInterval(closeBlankTabs, interval);
  });
}

// Start the interval when the background script is loaded
startTabCleanupInterval();
