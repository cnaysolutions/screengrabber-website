// Popup script for ScreenGrabber

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const viewBtn = document.getElementById('viewBtn');
  const clearBtn = document.getElementById('clearBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const frameCountEl = document.getElementById('frameCount');
  const proStatusEl = document.getElementById('proStatus');
  
  // Load frame count and Pro status
  loadFrameCount();
  loadProStatus();
  
  // Start capture button
  startBtn.addEventListener('click', async () => {
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we can access this tab
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        alert('ScreenGrabber cannot run on browser internal pages. Please try on a regular website.');
        return;
      }
      
      // Try to inject content script if not already present
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        });
        
        // Small delay to ensure script is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (injectionError) {
        console.log('Content script may already be injected or injection failed:', injectionError);
      }
      
      // Send message to content script to start selection
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'startSelection' });
        // Close popup
        window.close();
      } catch (messageError) {
        console.error('Error sending message:', messageError);
        alert('Please refresh the page and try again.\n\nTip: Press F5 or Ctrl+R to refresh, then click the extension icon again.');
      }
    } catch (error) {
      console.error('Error starting capture:', error);
      alert('An error occurred. Please refresh the page and try again.');
    }
  });
  
  // View captures button
  viewBtn.addEventListener('click', async () => {
    try {
      // Open side panel
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      window.close();
    } catch (error) {
      console.error('Error opening side panel:', error);
    }
  });
  
  // Settings button
  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
  });
  
  // Clear all frames button
  clearBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to clear all frames?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearFrames' });
        loadFrameCount();
      } catch (error) {
        console.error('Error clearing frames:', error);
      }
    }
  });
  
  // Load frame count from storage
  async function loadFrameCount() {
    try {
      const result = await chrome.storage.local.get(['frames']);
      const frames = result.frames || [];
      frameCountEl.textContent = frames.length;
    } catch (error) {
      console.error('Error loading frame count:', error);
    }
  }
  
  // Load Pro status
  async function loadProStatus() {
    try {
      const result = await chrome.storage.local.get(['isPro', 'dailyFrameCount']);
      if (result.isPro) {
        proStatusEl.textContent = '✨ Pro';
        proStatusEl.className = 'pro-badge pro-active';
      } else {
        const dailyCount = result.dailyFrameCount || 0;
        const remaining = Math.max(0, 10 - dailyCount);
        proStatusEl.textContent = `Free (${remaining}/10 today)`;
        proStatusEl.className = 'pro-badge pro-inactive';
      }
    } catch (error) {
      console.error('Error loading Pro status:', error);
    }
  }
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.frames) {
        const frames = changes.frames.newValue || [];
        frameCountEl.textContent = frames.length;
      }
      if (changes.dailyFrameCount || changes.isPro) {
        loadProStatus();
      }
    }
  });
});
