// Background Service Worker for ScreenGrabber

// Handle extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ScreenGrabber extension installed');
  
  // Inject content scripts into all existing tabs
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      // Skip chrome:// and chrome-extension:// URLs
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('edge://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css']
          });
        } catch (error) {
          // Tab may not allow script injection, skip it
          console.log(`Could not inject into tab ${tab.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error injecting content scripts:', error);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  if (request.action === 'captureTab') {
    console.log('Attempting to capture visible tab...');
    // Capture the visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Capture error:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log('Screenshot captured successfully, size:', dataUrl.length);
        sendResponse({ dataUrl: dataUrl });
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getFrames') {
    // Retrieve frames from storage
    chrome.storage.local.get(['currentSession', 'frames'], (result) => {
      sendResponse({
        sessionId: result.currentSession || null,
        frames: result.frames || []
      });
    });
    return true;
  }
  
  if (request.action === 'saveFrame') {
    // Save a new frame
    chrome.storage.local.get(['frames'], (result) => {
      const frames = result.frames || [];
      frames.push(request.frame);
      chrome.storage.local.set({ frames: frames }, () => {
        console.log('Frame saved, total frames:', frames.length);
        sendResponse({ success: true, frameCount: frames.length });
        // Notify content script to update
        if (sender.tab && sender.tab.id) {
          chrome.tabs.sendMessage(sender.tab.id, { 
            action: 'framesUpdated', 
            frames: frames 
          }).catch((error) => {
            console.log('Could not notify content script:', error);
          });
        }
      });
    });
    return true;
  }
  
  if (request.action === 'updateFrames') {
    // Update all frames (for reordering)
    chrome.storage.local.set({ frames: request.frames }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'clearFrames') {
    // Clear all frames
    chrome.storage.local.set({ frames: [], currentSession: null }, () => {
      sendResponse({ success: true });
      // Notify content script
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { 
          action: 'framesUpdated', 
          frames: [] 
        }).catch((error) => {
          console.log('Could not notify content script:', error);
        });
      }
    });
    return true;
  }
  
  return false;
});
