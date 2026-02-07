# ScreenGrabber - Installation Guide

This guide will walk you through installing the ScreenGrabber Chrome extension step by step.

## Prerequisites

- Google Chrome browser (latest version recommended)
- The `screengrabber-extension` folder or ZIP file

## Installation Steps

### Step 1: Extract the Extension (If you have a ZIP file)

If you received a ZIP file:
1. Locate the `screengrabber-extension.zip` file
2. Right-click on it
3. Select "Extract All..." or "Extract Here"
4. Remember the location of the extracted folder

### Step 2: Open Chrome Extensions Page

**Option A - Using the Menu:**
1. Open Google Chrome
2. Click the three dots (⋮) in the top-right corner
3. Hover over "More Tools"
4. Click "Extensions"

**Option B - Using the Address Bar:**
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar
3. Press Enter

### Step 3: Enable Developer Mode

1. Look for the "Developer mode" toggle in the top-right corner of the Extensions page
2. Click the toggle to turn it ON
3. It should turn blue when enabled
4. You'll see new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button
2. A file browser window will open
3. Navigate to the `screengrabber-extension` folder
4. Click on the folder to select it
5. Click **"Select Folder"** (or "Open" depending on your system)

### Step 5: Verify Installation

You should now see the ScreenGrabber extension in your extensions list with:
- ✅ An orange icon with a checkmark
- ✅ The name "ScreenGrabber"
- ✅ Version 1.0.0
- ✅ A blue toggle that says "ON"

### Step 6: Pin the Extension (Recommended)

To easily access the extension:
1. Look for the puzzle piece icon (🧩) in your Chrome toolbar
2. Click it to see all your extensions
3. Find "ScreenGrabber" in the list
4. Click the pin icon (📌) next to it
5. The ScreenGrabber icon will now appear in your toolbar

## Testing the Extension

Let's make sure everything works:

### Quick Test

1. Open any webpage (try a news article or blog post)
2. Click the ScreenGrabber icon in your toolbar
3. Click "Start Capture"
4. You should see a dark overlay with a selection box
5. Click "Confirm Selection"
6. Scroll down the page slowly
7. You should see frames being captured
8. Click "Stop" to finish
9. The sidebar should open showing your captured frames

If all these steps work, congratulations! Your extension is installed correctly! 🎉

## Troubleshooting

### Problem: Extension icon doesn't appear

**Solution:**
- Make sure Developer mode is enabled
- Try reloading the extension:
  1. Go to `chrome://extensions/`
  2. Find ScreenGrabber
  3. Click the refresh icon (🔄)

### Problem: "Load unpacked" button is not visible

**Solution:**
- Make sure Developer mode is turned ON (toggle in top-right)
- The toggle should be blue when enabled

### Problem: Error when loading extension

**Solution:**
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check that all files are present in the folder
- Try extracting the ZIP file again

### Problem: Selection overlay doesn't appear

**Solution:**
- Refresh the webpage and try again
- Some websites may block extensions
- Try on a different website

### Problem: Can't capture frames

**Solution:**
- Make sure you clicked "Confirm Selection"
- Try scrolling more slowly
- Check that the extension has permission for the website

## Permissions Explained

The extension requests these permissions:

- **activeTab**: To capture screenshots of the current tab
- **storage**: To save your captured frames locally
- **sidePanel**: To show the frames sidebar
- **scripting**: To inject the selection overlay

All data stays on your computer - nothing is sent to external servers.

## Next Steps

Now that the extension is installed:

1. Read the [README.md](README.md) for detailed usage instructions
2. Try capturing some content
3. Experiment with annotations
4. Test copying frames to AI chats

## Uninstalling

If you need to remove the extension:

1. Go to `chrome://extensions/`
2. Find ScreenGrabber
3. Click "Remove"
4. Confirm the removal

## Getting Help

If you encounter any issues not covered here:
- Check the README.md file for usage tips
- Make sure you're using the latest version of Chrome
- Try disabling other extensions temporarily to check for conflicts

---

**Happy capturing! 📸**
