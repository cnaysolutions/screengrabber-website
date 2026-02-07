// Settings page logic for ScreenGrabber

const API_URL = 'https://scrollframe.tech/api';

// Load saved license key on page load
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get(['licenseKey', 'isPro', 'proValidatedAt']);
  
  if (result.licenseKey) {
    document.getElementById('licenseKey').value = result.licenseKey;
  }
  
  if (result.isPro) {
    updateStatus(true, result.licenseKey);
  }
});

// Validate license button
document.getElementById('validateBtn').addEventListener('click', async () => {
  const licenseKey = document.getElementById('licenseKey').value.trim();
  
  if (!licenseKey) {
    showMessage('Please enter a license key', 'error');
    return;
  }
  
  // Validate format - accept both old SG- format and new SCROLLFRAME-PRO- format
  if (!licenseKey.startsWith('SG-') && !licenseKey.startsWith('SCROLLFRAME-PRO-')) {
    showMessage('Invalid license key format', 'error');
    return;
  }
  
  // Show loading state
  const btn = document.getElementById('validateBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Validating...';
  btn.disabled = true;
  
  try {
    // Call the validation API
    const response = await fetch(`${API_URL}/license/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey: licenseKey
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.result && data.result.data && data.result.data.valid) {
      // License is valid
      await chrome.storage.local.set({
        licenseKey: licenseKey,
        isPro: true,
        proValidatedAt: Date.now()
      });
      
      updateStatus(true, licenseKey);
      showMessage('✅ License activated successfully! You now have unlimited frames.', 'success');
    } else {
      // License is invalid
      await chrome.storage.local.set({
        isPro: false
      });
      
      updateStatus(false);
      showMessage('❌ Invalid or expired license key. Please check and try again.', 'error');
    }
  } catch (error) {
    console.error('Validation error:', error);
    showMessage('❌ Could not validate license. Please check your internet connection.', 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Clear license button
document.getElementById('clearBtn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to remove your Pro license?')) {
    await chrome.storage.local.set({
      licenseKey: '',
      isPro: false,
      proValidatedAt: null
    });
    
    document.getElementById('licenseKey').value = '';
    updateStatus(false);
    showMessage('License removed. You are now on the Free plan.', 'success');
  }
});

// Update status badge
function updateStatus(isPro, licenseKey = '') {
  const badge = document.getElementById('statusBadge');
  
  if (isPro) {
    badge.textContent = '✨ Pro Plan - Unlimited frames';
    badge.className = 'status-badge status-pro';
  } else {
    badge.textContent = 'Free Plan - 10 frames limit';
    badge.className = 'status-badge status-free';
  }
}

// Show message
function showMessage(text, type) {
  const message = document.getElementById('message');
  message.textContent = text;
  message.className = `message ${type} show`;
  
  setTimeout(() => {
    message.classList.remove('show');
  }, 5000);
}
