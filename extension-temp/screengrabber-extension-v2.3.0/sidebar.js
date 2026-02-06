// Sidebar script for ScreenGrabber

let frames = [];
let draggedElement = null;
let draggedIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  loadFrames();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const copyAllBtn = document.getElementById('copyAllBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const copyDropdown = document.getElementById('copyDropdown');
  
  // Copy all button - toggle dropdown
  copyAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!copyDropdown.contains(e.target) && e.target !== copyAllBtn) {
      copyDropdown.classList.remove('show');
    }
  });
  
  // Dropdown actions
  copyDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      const action = e.currentTarget.dataset.action;
      copyDropdown.classList.remove('show');
      
      if (action === 'copy-all') {
        await copyAllFrames();
      } else if (action === 'copy-individual') {
        showToast('Use the copy button on each frame to copy individually');
      }
    });
  });
  
  // Clear all button
  clearAllBtn.addEventListener('click', async () => {
    if (frames.length === 0) {
      showToast('No frames to clear');
      return;
    }
    
    if (confirm('Are you sure you want to clear all frames?')) {
      await chrome.runtime.sendMessage({ action: 'clearFrames' });
      frames = [];
      renderFrames();
      showToast('All frames cleared');
    }
  });
}

// Load frames from storage
async function loadFrames() {
  try {
    const result = await chrome.storage.local.get(['frames']);
    frames = result.frames || [];
    renderFrames();
  } catch (error) {
    console.error('Error loading frames:', error);
  }
}

// Render frames
function renderFrames() {
  const container = document.getElementById('framesContainer');
  
  if (frames.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="12" width="40" height="40" rx="4" stroke="hsl(25, 95%, 65%)" stroke-width="3" stroke-dasharray="4 4"/>
          <circle cx="32" cy="32" r="8" fill="hsl(25, 95%, 65%)"/>
        </svg>
        <p>No frames captured yet</p>
        <p class="hint">Click the extension icon and start capturing!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  frames.forEach((frame, index) => {
    const frameCard = createFrameCard(frame, index);
    container.appendChild(frameCard);
  });
}

// Create frame card element
function createFrameCard(frame, index) {
  const card = document.createElement('div');
  card.className = 'frame-card';
  card.draggable = true;
  card.dataset.index = index;
  
  const timestamp = new Date(frame.timestamp).toLocaleString();
  
  card.innerHTML = `
    <div class="frame-header">
      <div class="frame-number">Frame ${frame.number}</div>
      <div class="frame-actions">
        <button class="frame-btn copy" title="Copy frame">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="6" y="6" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4 4h8v2H4V4z" fill="currentColor"/>
          </svg>
        </button>
        <button class="frame-btn delete" title="Delete frame">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 7h10M8 7V5a1 1 0 011-1h2a1 1 0 011 1v2M7 7v8a2 2 0 002 2h2a2 2 0 002-2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    <img src="${frame.imageDataUrl}" alt="Frame ${frame.number}" class="frame-thumbnail">
    <div class="frame-info">
      <div class="frame-timestamp">${timestamp}</div>
      <textarea 
        class="annotation-input" 
        placeholder="Add annotation..."
        data-frame-id="${frame.id}"
      >${frame.annotation || ''}</textarea>
    </div>
  `;
  
  // Add event listeners
  const copyBtn = card.querySelector('.copy');
  const deleteBtn = card.querySelector('.delete');
  const annotationInput = card.querySelector('.annotation-input');
  
  copyBtn.addEventListener('click', () => copyFrame(index));
  deleteBtn.addEventListener('click', () => deleteFrame(index));
  annotationInput.addEventListener('change', (e) => updateAnnotation(frame.id, e.target.value));
  
  // Drag and drop
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);
  card.addEventListener('dragover', handleDragOver);
  card.addEventListener('drop', handleDrop);
  
  return card;
}

// Copy single frame with annotation
async function copyFrame(index) {
  try {
    const frame = frames[index];
    
    // Convert data URL to blob
    const response = await fetch(frame.imageDataUrl);
    const blob = await response.blob();
    
    // Copy image to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    
    showToast(`Frame ${frame.number} copied!`);
    
    // If there's an annotation, show it in a toast after copying
    if (frame.annotation) {
      setTimeout(() => {
        showToast(`Annotation: ${frame.annotation.substring(0, 50)}${frame.annotation.length > 50 ? '...' : ''}`);
      }, 1500);
    }
  } catch (error) {
    console.error('Error copying frame:', error);
    showToast('Failed to copy frame');
  }
}

// Copy all frames - Create a downloadable HTML file with all images
async function copyAllFrames() {
  if (frames.length === 0) {
    showToast('No frames to copy');
    return;
  }
  
  try {
    showToast('Preparing frames for copy...');
    
    // Method 1: Try to copy as rich HTML with embedded images
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
    .frame { background: white; margin-bottom: 30px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .frame-title { color: #ff934f; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .frame img { width: 100%; border-radius: 8px; margin: 10px 0; }
    .annotation { background: #fff3e0; padding: 12px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #ff934f; }
    .timestamp { color: #999; font-size: 12px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1 style="color: #ff934f;">ScreenGrabber Captured Frames</h1>
  <p style="color: #666;">Total frames: ${frames.length}</p>
`;

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      htmlContent += `
  <div class="frame">
    <div class="frame-title">Frame ${frame.number}</div>
    <img src="${frame.imageDataUrl}" alt="Frame ${frame.number}">
    <div class="timestamp">${new Date(frame.timestamp).toLocaleString()}</div>
`;
      
      if (frame.annotation) {
        htmlContent += `    <div class="annotation"><strong>Note:</strong> ${frame.annotation}</div>\n`;
      }
      
      htmlContent += `  </div>\n`;
    }
    
    htmlContent += `</body>\n</html>`;
    
    // Copy HTML to clipboard
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const textBlob = new Blob([`ScreenGrabber - ${frames.length} frames captured`], { type: 'text/plain' });
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ]);
    
    showToast(`✅ ${frames.length} frames copied! Paste into any document or AI chat.`);
    
    // Also offer to download as HTML file
    setTimeout(() => {
      if (confirm('Would you like to download the frames as an HTML file for easy sharing?')) {
        downloadFramesAsHTML(htmlContent);
      }
    }, 2000);
    
  } catch (error) {
    console.error('Error copying all frames:', error);
    
    // Fallback: Download as HTML file
    if (confirm('Copy to clipboard failed. Would you like to download the frames as an HTML file instead?')) {
      try {
        let htmlContent = generateHTMLContent();
        downloadFramesAsHTML(htmlContent);
      } catch (downloadError) {
        console.error('Error downloading frames:', downloadError);
        showToast('Failed to copy or download frames');
      }
    }
  }
}

// Generate HTML content for all frames
function generateHTMLContent() {
  let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ScreenGrabber Frames</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
    .frame { background: white; margin-bottom: 30px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .frame-title { color: #ff934f; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .frame img { width: 100%; border-radius: 8px; margin: 10px 0; }
    .annotation { background: #fff3e0; padding: 12px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #ff934f; }
    .timestamp { color: #999; font-size: 12px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1 style="color: #ff934f;">ScreenGrabber Captured Frames</h1>
  <p style="color: #666;">Total frames: ${frames.length}</p>
`;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    htmlContent += `
  <div class="frame">
    <div class="frame-title">Frame ${frame.number}</div>
    <img src="${frame.imageDataUrl}" alt="Frame ${frame.number}">
    <div class="timestamp">${new Date(frame.timestamp).toLocaleString()}</div>
`;
    
    if (frame.annotation) {
      htmlContent += `    <div class="annotation"><strong>Note:</strong> ${frame.annotation}</div>\n`;
    }
    
    htmlContent += `  </div>\n`;
  }
  
  htmlContent += `</body>\n</html>`;
  return htmlContent;
}

// Download frames as HTML file
function downloadFramesAsHTML(htmlContent) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `screengrabber-frames-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ HTML file downloaded! Open it to view all frames.');
}

// Delete frame
async function deleteFrame(index) {
  if (confirm(`Delete Frame ${frames[index].number}?`)) {
    frames.splice(index, 1);
    
    // Update frame numbers
    frames.forEach((frame, i) => {
      frame.number = i + 1;
    });
    
    await chrome.runtime.sendMessage({ action: 'updateFrames', frames: frames });
    renderFrames();
    showToast('Frame deleted');
  }
}

// Update annotation
async function updateAnnotation(frameId, annotation) {
  const frame = frames.find(f => f.id === frameId);
  if (frame) {
    frame.annotation = annotation;
    await chrome.runtime.sendMessage({ action: 'updateFrames', frames: frames });
    showToast('Annotation saved');
  }
}

// Drag and drop handlers
function handleDragStart(e) {
  draggedElement = e.currentTarget;
  draggedIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  
  // Remove drag-over class from all cards
  document.querySelectorAll('.frame-card').forEach(card => {
    card.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  e.dataTransfer.dropEffect = 'move';
  
  const target = e.currentTarget;
  if (target !== draggedElement) {
    target.classList.add('drag-over');
  }
  
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  e.currentTarget.classList.remove('drag-over');
  
  const dropIndex = parseInt(e.currentTarget.dataset.index);
  
  if (draggedIndex !== dropIndex) {
    // Reorder frames
    const draggedFrame = frames[draggedIndex];
    frames.splice(draggedIndex, 1);
    frames.splice(dropIndex, 0, draggedFrame);
    
    // Update frame numbers
    frames.forEach((frame, i) => {
      frame.number = i + 1;
    });
    
    // Save and re-render
    chrome.runtime.sendMessage({ action: 'updateFrames', frames: frames });
    renderFrames();
    showToast('Frames reordered');
  }
  
  return false;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.frames) {
    frames = changes.frames.newValue || [];
    renderFrames();
  }
});

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'framesUpdated') {
    frames = request.frames || [];
    renderFrames();
  }
});
