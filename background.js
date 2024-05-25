let checkIntervalSeconds = 60; // Default interval in seconds

// Function to close blank tabs
function closeBlankTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url === "about:blank" || tab.title === "" || tab.title === "Sin título") {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

// Initialize the interval from storage and set up the interval
chrome.storage.sync.get('interval', (data) => {
  if (data.interval) {
    checkIntervalSeconds = data.interval;
  }
  setInterval(closeBlankTabs, checkIntervalSeconds * 1000); // Convert seconds to milliseconds
});

// Listen for changes in storage to update the interval
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.interval) {
    checkIntervalSeconds = changes.interval.newValue;
    clearInterval();
    setInterval(closeBlankTabs, checkIntervalSeconds * 1000);
  }
});
