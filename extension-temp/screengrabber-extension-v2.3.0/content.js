// ScreenGrabber Content Script

let isSelectionMode = false;
let isCaptureMode = false;
let isPaused = false;
let selectionBox = null;
let overlay = null;
let captureRegion = null;
let captureRegionViewport = null; // Store viewport-relative position
let lastScrollY = 0;
let frameCount = 0;
let dailyFrameCount = 0; // Track frames captured today
let dailyLimitResetTime = null; // When the daily limit resets
let sessionId = null;
let frames = [];
let sidebar = null;
let scrollContainer = null; // The element being scrolled
let scrollListeners = []; // Track all scroll listeners
const SCROLL_THRESHOLD = 300; // pixels

// Initialize daily limit tracking
async function initializeDailyLimit() {
  try {
    const result = await chrome.storage.local.get(['dailyFrameCount', 'dailyLimitResetTime']);
    
    const now = new Date();
    const resetTime = result.dailyLimitResetTime ? new Date(result.dailyLimitResetTime) : null;
    
    // Check if we need to reset (past midnight)
    if (!resetTime || now >= resetTime) {
      // Reset to midnight tonight
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      dailyFrameCount = 0;
      dailyLimitResetTime = midnight.toISOString();
      
      await chrome.storage.local.set({
        dailyFrameCount: 0,
        dailyLimitResetTime: midnight.toISOString()
      });
    } else {
      // Load existing count
      dailyFrameCount = result.dailyFrameCount || 0;
      dailyLimitResetTime = result.dailyLimitResetTime;
    }
    
    console.log(`Daily limit initialized: ${dailyFrameCount}/10 frames used today`);
  } catch (error) {
    console.error('Failed to initialize daily limit:', error);
    dailyFrameCount = 0;
  }
}

// Initialize on load
initializeDailyLimit();

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSelection') {
    startSelectionMode();
    sendResponse({ success: true });
  }
  
  if (request.action === 'stopCapture') {
    stopCaptureMode();
    sendResponse({ success: true });
  }
  
  if (request.action === 'framesUpdated') {
    updateSidebarFrames(request.frames);
    sendResponse({ success: true });
  }
  
  return true;
});

// Start selection mode
function startSelectionMode() {
  if (isSelectionMode) return;
  
  isSelectionMode = true;
  createSelectionOverlay();
}

// Create selection overlay
function createSelectionOverlay() {
  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'screengrabber-overlay';
  
  // Create selection box
  selectionBox = document.createElement('div');
  selectionBox.className = 'sg-selection-box';
  
  // Add resize handles
  const handles = ['nw', 'ne', 'sw', 'se'];
  handles.forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `sg-resize-handle sg-${pos}`;
    handle.dataset.position = pos;
    selectionBox.appendChild(handle);
  });
  
  // Add move handle
  const moveHandle = document.createElement('div');
  moveHandle.className = 'sg-move-handle';
  moveHandle.textContent = 'Drag to move';
  selectionBox.appendChild(moveHandle);
  
  // Add size indicator
  const sizeIndicator = document.createElement('div');
  sizeIndicator.className = 'sg-size-indicator';
  selectionBox.appendChild(sizeIndicator);
  
  // Create controls
  const controls = document.createElement('div');
  controls.className = 'sg-controls';
  
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'sg-confirm';
  confirmBtn.textContent = 'Confirm Selection';
  confirmBtn.onclick = confirmSelection;
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'sg-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = cancelSelection;
  
  controls.appendChild(confirmBtn);
  controls.appendChild(cancelBtn);
  
  // Set initial position (center of viewport)
  const width = Math.min(600, window.innerWidth * 0.6);
  const height = Math.min(400, window.innerHeight * 0.6);
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  
  updateSizeIndicator();
  
  overlay.appendChild(selectionBox);
  overlay.appendChild(controls);
  document.body.appendChild(overlay);
  
  // Initialize drag and resize
  initDragAndResize();
}

// Initialize drag and resize functionality
function initDragAndResize() {
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startLeft, startTop, startWidth, startHeight;
  let resizePosition = null;
  
  // Mouse down on selection box (for moving)
  selectionBox.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('sg-resize-handle')) {
      isResizing = true;
      resizePosition = e.target.dataset.position;
    } else if (e.target === selectionBox || e.target.classList.contains('sg-move-handle')) {
      isDragging = true;
    } else {
      return;
    }
    
    startX = e.clientX;
    startY = e.clientY;
    startLeft = selectionBox.offsetLeft;
    startTop = selectionBox.offsetTop;
    startWidth = selectionBox.offsetWidth;
    startHeight = selectionBox.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Mouse move
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      
      // Constrain to viewport
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - selectionBox.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - selectionBox.offsetHeight));
      
      selectionBox.style.left = newLeft + 'px';
      selectionBox.style.top = newTop + 'px';
      
      updateSizeIndicator();
    }
    
    if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
      
      if (resizePosition.includes('e')) {
        newWidth = Math.max(100, startWidth + dx);
      }
      if (resizePosition.includes('w')) {
        newWidth = Math.max(100, startWidth - dx);
        newLeft = startLeft + dx;
      }
      if (resizePosition.includes('s')) {
        newHeight = Math.max(100, startHeight + dy);
      }
      if (resizePosition.includes('n')) {
        newHeight = Math.max(100, startHeight - dy);
        newTop = startTop + dy;
      }
      
      // Constrain to viewport
      if (newLeft < 0) {
        newWidth += newLeft;
        newLeft = 0;
      }
      if (newTop < 0) {
        newHeight += newTop;
        newTop = 0;
      }
      if (newLeft + newWidth > window.innerWidth) {
        newWidth = window.innerWidth - newLeft;
      }
      if (newTop + newHeight > window.innerHeight) {
        newHeight = window.innerHeight - newTop;
      }
      
      selectionBox.style.left = newLeft + 'px';
      selectionBox.style.top = newTop + 'px';
      selectionBox.style.width = newWidth + 'px';
      selectionBox.style.height = newHeight + 'px';
      
      updateSizeIndicator();
    }
  });
  
  // Mouse up
  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    resizePosition = null;
  });
}

// Update size indicator
function updateSizeIndicator() {
  const sizeIndicator = selectionBox.querySelector('.sg-size-indicator');
  const width = Math.round(selectionBox.offsetWidth);
  const height = Math.round(selectionBox.offsetHeight);
  sizeIndicator.textContent = `${width} × ${height} px`;
}

// Confirm selection
function confirmSelection() {
  // Store viewport-relative position (fixed position)
  captureRegionViewport = {
    x: selectionBox.offsetLeft,
    y: selectionBox.offsetTop,
    width: selectionBox.offsetWidth,
    height: selectionBox.offsetHeight
  };
  
  // Store document-relative position for first capture
  captureRegion = {
    x: selectionBox.offsetLeft,
    y: selectionBox.offsetTop + window.scrollY,
    width: selectionBox.offsetWidth,
    height: selectionBox.offsetHeight
  };
  
  // Remove overlay
  overlay.remove();
  isSelectionMode = false;
  
  // Start capture mode
  startCaptureMode();
}

// Cancel selection
function cancelSelection() {
  overlay.remove();
  isSelectionMode = false;
  selectionBox = null;
  overlay = null;
}

// Start capture mode
function startCaptureMode() {
  isCaptureMode = true;
  isPaused = false;
  frameCount = 0;
  frames = [];
  sessionId = 'session-' + Date.now();
  lastScrollY = 0; // Will be updated based on actual scroll container
  
  // Create capture UI
  createCaptureUI();
  
  // Show active region (fixed position)
  showActiveRegion();
  
  // Create and show sidebar
  createSidebar();
  
  // Capture first frame
  captureFrame();
  
  // Listen for scroll on window
  window.addEventListener('scroll', handleScroll, true);
  scrollListeners.push({ element: window, handler: handleScroll });
  
  // Find and listen to all scrollable containers
  detectAndMonitorScrollContainers();
  
  console.log('Capture mode started - monitoring all scroll containers');
}

// Show sidebar (reopen if closed)
function showSidebar() {
  const existingSidebar = document.getElementById('screengrabber-sidebar');
  if (existingSidebar) {
    existingSidebar.style.display = 'flex';
    existingSidebar.style.visibility = 'visible';
    existingSidebar.style.opacity = '1';
    console.log('Sidebar reopened');
  } else {
    console.log('Sidebar does not exist, creating new one');
    createSidebar();
  }
}

// Create sidebar
function createSidebar() {
  // If sidebar already exists, clear it and show it
  if (sidebar) {
    sidebar.style.display = 'block';
    const container = document.getElementById('sg-frames-list');
    if (container) {
      container.innerHTML = `
        <div class="sg-empty-state">
          <p>No frames captured yet</p>
          <p class="sg-hint">Scroll down to capture frames</p>
        </div>
      `;
    }
    return;
  }
  
  sidebar = document.createElement('div');
  sidebar.id = 'screengrabber-sidebar';
  sidebar.className = 'sg-sidebar';
  sidebar.style.display = 'flex';
  sidebar.style.visibility = 'visible';
  sidebar.style.opacity = '1';
  
  sidebar.innerHTML = `
    <div class="sg-sidebar-header">
      <h3>Captured Frames</h3>
      <button class="sg-sidebar-close" title="Close sidebar">×</button>
    </div>
    <div class="sg-sidebar-actions">
      <button class="sg-copy-all" title="Copy all frames as one combined image">
        📋 Copy All at Once
      </button>
      <button class="sg-clear-all" title="Clear all frames">
        🗑️ Clear All
      </button>
    </div>
    <div class="sg-frames-container" id="sg-frames-list">
      <div class="sg-empty-state">
        <p>No frames captured yet</p>
        <p class="sg-hint">Scroll down to capture frames</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  // Add event listeners
  sidebar.querySelector('.sg-sidebar-close').addEventListener('click', () => {
    sidebar.style.display = 'none';
  });
  
  sidebar.querySelector('.sg-copy-all').addEventListener('click', copyAllFramesCombined);
  sidebar.querySelector('.sg-clear-all').addEventListener('click', clearAllFrames);
  
  console.log('Sidebar created and added to page');
}

// Update sidebar with frames
function updateSidebarFrames(newFrames) {
  console.log('updateSidebarFrames called with', newFrames ? newFrames.length : 0, 'frames');
  
  if (!sidebar) {
    console.error('Sidebar not found!');
    return;
  }
  
  frames = newFrames || [];
  const container = document.getElementById('sg-frames-list');
  
  if (!container) {
    console.error('Frames container not found!');
    return;
  }
  
  console.log('Container found, updating with', frames.length, 'frames');
  
  if (frames.length === 0) {
    container.innerHTML = `
      <div class="sg-empty-state">
        <p>No frames captured yet</p>
        <p class="sg-hint">Scroll down to capture frames</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  // Force DOM reflow to ensure container is ready
  container.offsetHeight;
  
  // Ensure sidebar is visible
  if (sidebar) {
    sidebar.style.display = 'block';
  }
  
  console.log('Cleared container, now rendering', frames.length, 'frames');
  
  frames.forEach((frame, index) => {
    console.log(`Rendering frame ${index + 1}:`, frame.number, 'hasImage:', !!frame.imageDataUrl);
    const frameEl = document.createElement('div');
    frameEl.className = 'sg-frame-item';
    frameEl.dataset.frameId = frame.id;
    
    frameEl.innerHTML = `
      <div class="sg-frame-number">#${frame.number}</div>
      <img src="${frame.imageDataUrl}" alt="Frame ${frame.number}" class="sg-frame-image">
      <textarea 
        class="sg-frame-annotation" 
        placeholder="Add annotation..."
        data-frame-id="${frame.id}"
      >${frame.annotation || ''}</textarea>
      <div class="sg-frame-actions">
        <button class="sg-copy-frame" data-frame-id="${frame.id}" title="Copy this frame">📋 Copy</button>
        <button class="sg-delete-frame" data-frame-id="${frame.id}" title="Delete this frame">🗑️</button>
      </div>
    `;
    
    container.appendChild(frameEl);
    console.log(`Frame #${frame.number} added to sidebar`);
    
    // Add annotation listener
    const textarea = frameEl.querySelector('.sg-frame-annotation');
    textarea.addEventListener('change', (e) => {
      updateFrameAnnotation(frame.id, e.target.value);
    });
    
    // Add copy listener
    frameEl.querySelector('.sg-copy-frame').addEventListener('click', () => {
      copyFrame(frame.id);
    });
    
    // Add delete listener
    frameEl.querySelector('.sg-delete-frame').addEventListener('click', () => {
      deleteFrame(frame.id);
    });
  });
  
  console.log(`Updated sidebar with ${frames.length} frames`);
}

// Create capture mode UI
function createCaptureUI() {
  const captureUI = document.createElement('div');
  captureUI.className = 'sg-capture-mode';
  captureUI.id = 'sg-capture-ui';
  
  captureUI.innerHTML = `
    <div class="sg-recording-indicator">
      <div class="sg-recording-dot"></div>
      <span>Recording</span>
    </div>
    <div class="sg-frame-counter">0 frames</div>
    <div class="sg-capture-controls">
      <button class="sg-view-captures-btn">📋 View Captures</button>
      <button class="sg-pause-btn">Pause</button>
      <button class="sg-stop-btn">Stop</button>
    </div>
  `;
  
  document.body.appendChild(captureUI);
  
  // Add event listeners
  captureUI.querySelector('.sg-view-captures-btn').addEventListener('click', showSidebar);
  captureUI.querySelector('.sg-pause-btn').addEventListener('click', togglePause);
  captureUI.querySelector('.sg-stop-btn').addEventListener('click', stopCaptureMode);
}

// Show active capture region (FIXED POSITION)
function showActiveRegion() {
  const activeRegion = document.createElement('div');
  activeRegion.className = 'sg-active-region';
  activeRegion.id = 'sg-active-region';
  
  // Use viewport-relative position (fixed)
  activeRegion.style.left = captureRegionViewport.x + 'px';
  activeRegion.style.top = captureRegionViewport.y + 'px';
  activeRegion.style.width = captureRegionViewport.width + 'px';
  activeRegion.style.height = captureRegionViewport.height + 'px';
  
  document.body.appendChild(activeRegion);
}

// Detect and monitor all scrollable containers
function detectAndMonitorScrollContainers() {
  // Find all elements that might be scrollable
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    // Check if element is scrollable
    const hasVerticalScroll = element.scrollHeight > element.clientHeight;
    const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
    const overflowY = window.getComputedStyle(element).overflowY;
    const overflowX = window.getComputedStyle(element).overflowX;
    
    const isScrollable = (hasVerticalScroll || hasHorizontalScroll) && 
                        (overflowY === 'auto' || overflowY === 'scroll' || 
                         overflowX === 'auto' || overflowX === 'scroll');
    
    if (isScrollable) {
      // Add scroll listener to this container
      element.addEventListener('scroll', handleScroll, true);
      scrollListeners.push({ element: element, handler: handleScroll });
      console.log('Monitoring scroll on:', element.tagName, element.className);
    }
  });
  
  console.log(`Found and monitoring ${scrollListeners.length} scrollable containers`);
}

// Handle scroll (works with any container)
function handleScroll(event) {
  if (!isCaptureMode || isPaused) return;
  
  // Get scroll position from the scrolling element
  let currentScrollY;
  if (event && event.target !== window && event.target !== document) {
    // Scrolling inside a container
    currentScrollY = event.target.scrollTop;
  } else {
    // Scrolling the main window
    currentScrollY = window.scrollY;
  }
  
  const delta = Math.abs(currentScrollY - lastScrollY);
  
  if (delta >= SCROLL_THRESHOLD) {
    captureFrame();
    lastScrollY = currentScrollY;
  }
}

// Capture frame
async function captureFrame() {
  try {
    console.log('Capturing frame...');
    
    // Check Pro status and frame limit
    const { isPro } = await chrome.storage.local.get(['isPro']);
    const FREE_FRAME_LIMIT = 10;
    
    // Check daily limit for free users
    if (!isPro && dailyFrameCount >= FREE_FRAME_LIMIT) {
      console.log(`Daily limit reached: ${dailyFrameCount}/10 frames used today`);
      showUpgradePrompt();
      return;
    }
    
    // Request screenshot from background
    const response = await chrome.runtime.sendMessage({ action: 'captureTab' });
    
    if (response.error) {
      console.error('Capture error:', response.error);
      showNotification('Capture failed: ' + response.error, 'error');
      return;
    }
    
    console.log('Screenshot captured, cropping...');
    
    // Use viewport-relative position for cropping (always capture the fixed region)
    const croppedImage = await cropImage(response.dataUrl, captureRegionViewport);
    
    // Create frame object
    const frame = {
      id: 'frame-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      sessionId: sessionId,
      number: frameCount + 1,
      imageDataUrl: croppedImage,
      timestamp: new Date().toISOString(),
      annotation: '',
      captureArea: captureRegionViewport,
      scrollPosition: window.scrollY,
      pageUrl: window.location.href,
      pageTitle: document.title
    };
    
    // Add to local frames array
    frames.push(frame);
    console.log('Frame object created:', {
      id: frame.id,
      number: frame.number,
      hasImage: frame.imageDataUrl ? 'YES' : 'NO',
      imageLength: frame.imageDataUrl ? frame.imageDataUrl.length : 0
    });
    
    // Save frame to storage
    await chrome.runtime.sendMessage({ action: 'saveFrame', frame: frame });
    
    frameCount++;
    
    // Increment daily count for free users
    if (!isPro) {
      dailyFrameCount++;
      await chrome.storage.local.set({ dailyFrameCount });
      console.log(`Daily usage: ${dailyFrameCount}/10 frames`);
    }
    
    updateFrameCounter();
    
    // Force immediate sidebar update
    console.log('About to call updateSidebarFrames with', frames.length, 'frames');
    console.log('Frames array:', frames.map(f => ({ id: f.id, number: f.number, hasImage: !!f.imageDataUrl })));
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      updateSidebarFrames(frames);
    }, 100);
    
    // Show flash effect
    showCaptureFlash();
    
    console.log(`Frame ${frameCount} captured successfully`);
    
  } catch (error) {
    console.error('Error capturing frame:', error);
    showNotification('Error capturing frame', 'error');
  }
}

// Show capture flash effect
function showCaptureFlash() {
  const flash = document.createElement('div');
  flash.className = 'sg-capture-flash';
  document.body.appendChild(flash);
  
  setTimeout(() => {
    flash.remove();
  }, 300);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `sg-notification sg-notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('sg-notification-show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('sg-notification-show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Crop image to region
function cropImage(dataUrl, region) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = region.width * dpr;
      canvas.height = region.height * dpr;
      
      // Draw cropped region (viewport-relative, no scroll offset)
      ctx.drawImage(
        img,
        region.x * dpr,
        region.y * dpr,
        region.width * dpr,
        region.height * dpr,
        0,
        0,
        region.width * dpr,
        region.height * dpr
      );
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Update frame counter
function updateFrameCounter() {
  const counter = document.querySelector('.sg-frame-counter');
  if (counter) {
    counter.textContent = `${frameCount} frame${frameCount !== 1 ? 's' : ''}`;
  }
}

// Toggle pause
function togglePause() {
  isPaused = !isPaused;
  const pauseBtn = document.querySelector('.sg-pause-btn');
  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  }
  showNotification(isPaused ? 'Capture paused' : 'Capture resumed');
}

// Update frame annotation
function updateFrameAnnotation(frameId, annotation) {
  const frame = frames.find(f => f.id === frameId);
  if (frame) {
    frame.annotation = annotation;
    // Update in storage
    chrome.runtime.sendMessage({ action: 'updateFrames', frames: frames });
  }
}

// Copy single frame with annotation
async function copyFrame(frameId) {
  const frame = frames.find(f => f.id === frameId);
  if (!frame) return;
  
  try {
    // Load the image
    const img = await new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = frame.imageDataUrl;
    });
    
    // Calculate canvas dimensions
    const padding = 20;
    const headerHeight = 40;
    const annotationHeight = frame.annotation ? 60 : 0;
    
    const canvasWidth = img.width + (padding * 2);
    const canvasHeight = padding + headerHeight + img.height + annotationHeight + padding;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let currentY = padding;
    
    // Draw frame number
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Frame ${frame.number}`, padding, currentY + 25);
    currentY += headerHeight;
    
    // Draw image with border
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.strokeRect(padding - 2, currentY - 2, img.width + 4, img.height + 4);
    ctx.drawImage(img, padding, currentY);
    currentY += img.height;
    
    // Draw annotation if exists
    if (frame.annotation) {
      currentY += 25; // More space between image and annotation
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      
      // Word wrap annotation
      const words = frame.annotation.split(' ');
      let line = '';
      let lineY = currentY;
      const maxLineWidth = img.width;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && line !== '') {
          ctx.fillText(line, padding, lineY);
          line = word + ' ';
          lineY += 20;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, padding, lineY);
    }
    
    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    
    const message = frame.annotation 
      ? `Frame ${frame.number} copied with annotation!`
      : `Frame ${frame.number} copied to clipboard!`;
    showNotification(message, 'success');
  } catch (error) {
    console.error('Copy error:', error);
    showNotification('Failed to copy frame', 'error');
  }
}

// Copy all frames as a single combined image
async function copyAllFramesCombined() {
  if (frames.length === 0) {
    showNotification('No frames to copy', 'error');
    return;
  }
  
  try {
    showNotification('Creating combined image...', 'info');
    
    // Load all images first
    const images = await Promise.all(
      frames.map(frame => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ img, frame });
          img.src = frame.imageDataUrl;
        });
      })
    );
    
    // Calculate canvas dimensions
    const padding = 20;
    const headerHeight = 40;
    const annotationHeight = 60;
    const spacing = 30;
    
    const maxWidth = Math.max(...images.map(({ img }) => img.width));
    let totalHeight = padding;
    
    images.forEach(({ img, frame }) => {
      totalHeight += headerHeight + img.height;
      if (frame.annotation) {
        totalHeight += annotationHeight;
      }
      totalHeight += spacing;
    });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth + (padding * 2);
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each frame
    let currentY = padding;
    
    images.forEach(({ img, frame }) => {
      // Draw frame number
      ctx.fillStyle = '#ff6b35';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Frame ${frame.number}`, padding, currentY + 25);
      currentY += headerHeight;
      
      // Draw image with border
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 3;
      ctx.strokeRect(padding - 2, currentY - 2, img.width + 4, img.height + 4);
      ctx.drawImage(img, padding, currentY);
      currentY += img.height;
      
      // Draw annotation if exists
      if (frame.annotation) {
        currentY += 25; // More space between image and annotation
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial';
        
        // Word wrap annotation
        const words = frame.annotation.split(' ');
        let line = '';
        let lineY = currentY;
        const maxLineWidth = maxWidth - padding;
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth && line !== '') {
            ctx.fillText(line, padding, lineY);
            line = word + ' ';
            lineY += 20;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, padding, lineY);
        currentY += annotationHeight;
      }
      
      currentY += spacing;
    });
    
    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    
    showNotification(`${frames.length} frames combined and copied to clipboard!`, 'success');
  } catch (error) {
    console.error('Copy all error:', error);
    showNotification('Failed to copy frames', 'error');
  }
}

// Delete frame
function deleteFrame(frameId) {
  frames = frames.filter(f => f.id !== frameId);
  frameCount = frames.length;
  
  // Update storage
  chrome.runtime.sendMessage({ action: 'updateFrames', frames: frames });
  
  // Update UI
  updateFrameCounter();
  updateSidebarFrames(frames);
  
  showNotification('Frame deleted', 'info');
}

// Clear all frames
function clearAllFrames() {
  if (!confirm('Are you sure you want to clear all frames?')) return;
  
  frames = [];
  frameCount = 0;
  
  // Clear storage
  chrome.runtime.sendMessage({ action: 'clearFrames' });
  
  // Update UI
  updateFrameCounter();
  updateSidebarFrames(frames);
  
  showNotification('All frames cleared', 'info');
}

// Show upgrade prompt when free limit is reached
function showUpgradePrompt() {
  // Pause capturing
  isPaused = true;
  
  // Create upgrade modal
  const modal = document.createElement('div');
  modal.id = 'sg-upgrade-modal';
  modal.innerHTML = `
    <div class="sg-upgrade-overlay">
      <div class="sg-upgrade-content">
        <div class="sg-upgrade-icon">🚀</div>
        <h2>Daily Limit Reached!</h2>
        <p>You've used all <strong>10 frames</strong> for today.</p>
        <p class="sg-reset-info">Resets at midnight • Upgrade to <strong>Pro</strong> for unlimited frames!</p>
        
        <div class="sg-upgrade-features">
          <div class="sg-feature">✓ Unlimited frame captures</div>
          <div class="sg-feature">✓ Advanced annotations</div>
          <div class="sg-feature">✓ Batch export</div>
          <div class="sg-feature">✓ Lifetime updates</div>
        </div>
        
        <div class="sg-upgrade-price">
          <span class="sg-price-label">Limited Time:</span>
          <span class="sg-price-amount">€19.99</span>
          <span class="sg-price-original">€39.99</span>
        </div>
        
        <div class="sg-upgrade-buttons">
          <button class="sg-btn-upgrade" id="sg-upgrade-btn">
            🎯 Upgrade to Pro
          </button>
          <button class="sg-btn-settings" id="sg-settings-btn">
            ⚙️ Enter License Key
          </button>
          <button class="sg-btn-close" id="sg-continue-free">
            Continue with Free
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners to all buttons
  const upgradeBtn = document.getElementById('sg-upgrade-btn');
  const settingsBtn = document.getElementById('sg-settings-btn');
  const continueBtn = document.getElementById('sg-continue-free');
  
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      window.open('https://screengrabber.cloud/#pricing', '_blank');
    });
  }
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      // Remove modal
      modal.remove();
      
      // Stop capturing new frames but allow viewing existing ones
      stopCaptureMode();
      
      // Show notification
      showNotification('You can still view and manage your 10 captured frames!', 'info');
    });
  }
  
  showNotification('Frame limit reached! Upgrade to Pro for unlimited captures.', 'warning');
}

// Stop capture mode
function stopCaptureMode() {
  isCaptureMode = false;
  isPaused = false;
  
  // Remove all scroll event listeners
  scrollListeners.forEach(({ element, handler }) => {
    element.removeEventListener('scroll', handler, true);
  });
  scrollListeners = [];
  scrollContainer = null;
  
  // Remove UI elements
  const captureUI = document.getElementById('sg-capture-ui');
  if (captureUI) captureUI.remove();
  
  const activeRegion = document.getElementById('sg-active-region');
  if (activeRegion) activeRegion.remove();
  
  // Keep sidebar visible
  showNotification(`Capture stopped. ${frameCount} frames captured.`, 'success');
  
  captureRegion = null;
  captureRegionViewport = null;
}
