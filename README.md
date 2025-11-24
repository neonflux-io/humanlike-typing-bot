# 🤖 Typing Bot Extension

A powerful Chrome extension that automatically scrapes text from HTML elements and types it into input fields with **human-like behavior**! Perfect for typing practice, automation, and productivity tasks.

## ✨ Features

- 🚀 **One-Click Auto Typing**: Just click the extension icon to start typing automatically!
- 🎯 **Smart Text Detection**: Automatically detects typing text from `#trackTextWrapper .lettersTrack` elements
- ⚡ **Toggle Functionality**: Click once to start, click again to stop typing
- 🎨 **Visual Feedback**: Extension badge shows typing status (TYPING/STOPPED/NO TEXT)
- 🔧 **Automatic Input Detection**: Finds input fields or creates a temporary one if needed
- ⌨️ **Keyboard Shortcuts**: Use Ctrl+Shift+T for quick activation
- 🛡️ **Safe & Secure**: Only works on active tabs with proper permissions

## 🎭 **NEW: Human-Like Typing Behavior**

- **Variable Speed**: Typing speed changes naturally like a real person
- **Realistic Errors**: Simulates common typing mistakes (5% error rate by default)
- **Auto-Correction**: Automatically corrects errors after a realistic delay
- **Natural Pauses**: Includes occasional longer pauses for authenticity
- **Character-Specific Timing**: Faster for common characters, slower for complex ones
- **Adjacent Key Errors**: Simulates pressing nearby keys by mistake

## 🚀 Installation

### Method 1: Load as Unpacked Extension

1. **Download the Extension**
   - Clone or download this repository
   - Extract the files to a folder on your computer

2. **Open Chrome Extensions**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Typing Bot Extension" and click the pin icon

## 🎯 Usage

### Super Simple Usage! 🚀

1. **Navigate to a Typing Site**
   - Go to any typing practice website
   - Make sure the page has `#trackTextWrapper .lettersTrack` elements

2. **Click the Extension Icon**
   - Click the Typing Bot icon in your Chrome toolbar
   - That's it! Human-like typing starts automatically! 🎯

3. **Toggle On/Off**
   - Click the extension icon again to stop typing
   - Click again to restart typing
   - The badge shows the current status

### Advanced Settings

Open the extension popup to customize human-like behavior:

- **Base Speed**: Overall typing speed (50-300ms)
- **Error Rate**: How often typing errors occur (0-15%)
- **Speed Variation**: Natural speed changes (±10-50%)
- **Pause Probability**: Chance of longer pauses (0-20%)

### Visual Feedback

- **Green "TYPING" badge**: Extension is actively typing
- **Red "STOPPED" badge**: Typing was stopped
- **Red "NO TEXT" badge**: No typing text found on the page
- **No badge**: Ready to start typing

### Advanced Usage

#### Finding CSS Selectors

1. **Right-click** on the text element you want to target
2. **Select "Inspect"** to open Developer Tools
3. **Right-click** on the highlighted element in the Elements tab
4. **Select "Copy > Copy selector"**
5. **Paste** the selector into the extension

#### Common Selectors

- **Typing Sites**: `#trackTextWrapper .lettersTrack`
- **General Text**: `.text-content`, `p`, `span`
- **Specific Elements**: `#main-text`, `.article-content`

#### Keyboard Shortcuts

- **Ctrl+Shift+T**: Quick start typing with default settings
- **Extension Icon**: Click to open popup interface

## 🔧 Configuration

### Default Settings

The extension comes with these human-like default settings:
- **Base Speed**: 80ms per character (faster typing)
- **Error Rate**: 2% (fewer realistic typing mistakes)
- **Speed Variation**: 20% (more consistent speed)
- **Pause Probability**: 5% (fewer pauses)
- **Correction Delay**: 500ms (realistic error correction time)

### Customization

You can modify the default settings by editing the `background.js` file:

```javascript
chrome.storage.local.set({
    defaultSelector: '#trackTextWrapper .lettersTrack',
    baseSpeed: 80,
    speedVariation: 0.2,
    errorRate: 0.02,
    correctionDelay: 500,
    pauseProbability: 0.05,
    pauseDuration: 800,
    enabled: true
});
```

## 🛠️ Technical Details

### File Structure

```
typing-bot-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface with human-like settings
├── popup.js              # Popup functionality
├── content.js            # Content script with human-like typing
├── background.js         # Background service worker
├── icon.svg              # Extension icon
├── create-icons.html     # Icon generation tool
└── README.md            # This file
```

### Permissions

- **activeTab**: Access to the currently active tab
- **scripting**: Ability to inject scripts into web pages

### How It Works

1. **Text Extraction**: Uses `document.querySelectorAll()` to find elements matching the CSS selector
2. **Input Detection**: Automatically finds input fields using common selectors
3. **Human-Like Simulation**: 
   - Variable timing based on character type
   - Random speed variations
   - Occasional typing errors
   - Automatic error correction with backspace
   - Natural pauses and rhythm
4. **Event Simulation**: Creates and dispatches realistic keyboard events

## 🎨 Customization

### Styling

You can customize the popup appearance by editing the CSS in `popup.html`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change colors here */
}
```

### Human-Like Behavior

Modify `content.js` to adjust human-like typing patterns:

```javascript
// Adjust error patterns
const commonErrors = {
    'a': 's', 's': 'a', 'e': 'r', 'r': 'e',
    // Add more common typing mistakes
};

// Adjust speed variations
function getHumanLikeSpeed(baseSpeed, speedVariation = 0.3) {
    // Customize speed calculation
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"No elements found"**
   - Check that the CSS selector is correct
   - Use browser DevTools to verify the selector works
   - Try a simpler selector first

2. **"No input field found"**
   - Make sure there's a text input, textarea, or contenteditable element on the page
   - The extension looks for common input selectors

3. **Typing not working**
   - Some websites may block automated input
   - Try adjusting the typing speed
   - Check browser console for errors

4. **Too many errors**
   - Reduce the error rate in settings
   - Some websites may be more sensitive to errors

### Debug Mode

Open Chrome DevTools and check the console for debug messages:
- Content script messages start with "🤖 Typing Bot"
- Background script messages show extension activity
- Error correction messages show "❌ Typing error" and "🔧 Correcting"

## 🤝 Contributing

Feel free to contribute to this project! Here are some ideas:

- Add support for more typing sites
- Implement different typing patterns
- Add sound effects or visual feedback
- Create themes for the popup interface
- Improve human-like behavior algorithms
- Add more realistic error patterns

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with modern Chrome Extension Manifest V3
- Uses vanilla JavaScript for maximum compatibility
- Inspired by typing practice and automation needs
- Human-like behavior based on real typing patterns

---

**Happy Human-Like Typing! 🚀✨** 