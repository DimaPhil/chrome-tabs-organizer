// Background service worker for Chrome extension

// Handle extension icon click - open dashboard in new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'chrome://newtab' });
});

// Listen for tab events to keep state in sync
chrome.tabs.onCreated.addListener((tab) => {
  // Notify newtab pages about new tab
  broadcastMessage({ type: 'TAB_CREATED', tab });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Notify newtab pages about removed tab
  broadcastMessage({ type: 'TAB_REMOVED', tabId, windowId: removeInfo.windowId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only broadcast significant updates
  if (
    changeInfo.title ||
    changeInfo.url ||
    changeInfo.favIconUrl ||
    changeInfo.pinned !== undefined
  ) {
    broadcastMessage({ type: 'TAB_UPDATED', tabId, changeInfo, tab });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  broadcastMessage({
    type: 'TAB_ACTIVATED',
    tabId: activeInfo.tabId,
    windowId: activeInfo.windowId,
  });
});

// Broadcast message to all extension pages
function broadcastMessage(message: unknown) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Ignore errors when no listeners are available
  });
}

// Handle messages from newtab page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TABS') {
    chrome.tabs.query({ currentWindow: true }).then((tabs) => {
      sendResponse({ tabs });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'SWITCH_TO_TAB') {
    chrome.tabs.update(message.tabId, { active: true });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CLOSE_TAB') {
    chrome.tabs.remove(message.tabId).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'PIN_TAB') {
    chrome.tabs.update(message.tabId, { pinned: message.pinned }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'CREATE_TAB') {
    chrome.tabs.create({ url: message.url }).then((tab) => {
      sendResponse({ tab });
    });
    return true;
  }
});

console.log('Tabs Organizer background service worker initialized');
