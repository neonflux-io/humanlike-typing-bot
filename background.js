// Background service worker for Typing Bot Extension
console.log('🤖 Typing Bot Background Service Worker loaded!');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason);
    
    if (details.reason === 'install') {
        // Set default settings with human-like parameters
                 chrome.storage.local.set({
             defaultSelector: '#trackTextWrapper .lettersTrack',
             baseSpeed: 80, // Base typing speed in ms (faster)
             speedVariation: 0.2, // 20% speed variation (less variation)
             errorRate: 0.02, // 2% error rate (much lower)
             correctionDelay: 500, // Delay before correcting errors
             pauseProbability: 0.05, // 5% chance of longer pauses (less pauses)
             pauseDuration: 800, // Duration of longer pauses (shorter)
             enabled: true
         });
    }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    if (message.type === 'typingComplete') {
        // Notify popup that typing is complete
        chrome.runtime.sendMessage(message);
    } else if (message.type === 'typingError') {
        // Notify popup about typing error
        chrome.runtime.sendMessage(message);
    } else if (message.type === 'typingCorrection') {
        // Notify popup about typing correction
        chrome.runtime.sendMessage(message);
    }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);
        
        // Check if content script is already loaded before injecting
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                return window.typingBotContentScriptLoaded || false;
            }
        }).then((result) => {
            const isAlreadyLoaded = result && result[0] && result[0].result;
            
            if (!isAlreadyLoaded) {
                // Inject content script only if not already loaded
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }).catch(error => {
                    console.log('Could not inject content script:', error);
                });
            } else {
                console.log('Content script already loaded, skipping injection');
            }
        }).catch(error => {
            console.log('Could not check content script status:', error);
        });
    }
});

// Handle extension icon click - Auto start typing
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked on tab:', tab.id);
    
    try {
        // First, detect if there's typing text on the page
        const detectResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: detectTypingText
        });
        
        if (detectResult && detectResult[0] && detectResult[0].result) {
            console.log('Typing text detected, starting auto-typing...');
            
            // Check if typing is already in progress
            const isTypingResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return window.typingBotInterval !== null;
                }
            });
            
            const isTyping = isTypingResult && isTypingResult[0] && isTypingResult[0].result;
            
            if (isTyping) {
                // Stop typing if already in progress
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: stopAutoTyping
                });
                
                // Update the extension icon to show it's stopped
                chrome.action.setBadgeText({ 
                    text: 'STOPPED', 
                    tabId: tab.id 
                });
                chrome.action.setBadgeBackgroundColor({ 
                    color: '#f44336', 
                    tabId: tab.id 
                });
                
                // Clear the badge after 2 seconds
                setTimeout(() => {
                    chrome.action.setBadgeText({ 
                        text: '', 
                        tabId: tab.id 
                    });
                }, 2000);
                
            } else {
                // Start typing automatically with default speed (100ms)
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: startAutoTyping,
                    args: [100] // Default speed
                });
                
                // Update the extension icon to show it's active
                chrome.action.setBadgeText({ 
                    text: 'TYPING', 
                    tabId: tab.id 
                });
                chrome.action.setBadgeBackgroundColor({ 
                    color: '#4CAF50', 
                    tabId: tab.id 
                });
            }
            
        } else {
            console.log('No typing text found on this page');
            // Show a notification that no typing text was found
            chrome.action.setBadgeText({ 
                text: 'NO TEXT', 
                tabId: tab.id 
            });
            chrome.action.setBadgeBackgroundColor({ 
                color: '#f44336', 
                tabId: tab.id 
            });
            
            // Clear the badge after 3 seconds
            setTimeout(() => {
                chrome.action.setBadgeText({ 
                    text: '', 
                    tabId: tab.id 
                });
            }, 3000);
        }
        
    } catch (error) {
        console.error('Error starting auto-typing:', error);
        chrome.action.setBadgeText({ 
            text: 'ERROR', 
            tabId: tab.id 
        });
        chrome.action.setBadgeBackgroundColor({ 
            color: '#f44336', 
            tabId: tab.id 
        });
        
        // Clear the badge after 3 seconds
        setTimeout(() => {
            chrome.action.setBadgeText({ 
                text: '', 
                tabId: tab.id 
            });
        }, 3000);
    }
});

// Handle keyboard shortcuts (only if commands API is available)
if (chrome.commands) {
    chrome.commands.onCommand.addListener((command) => {
        console.log('Command received:', command);
        
        if (command === 'start-typing') {
            // Get active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: () => {
                            // Start typing with default settings
                            if (typeof startTyping === 'function') {
                                startTyping('#trackTextWrapper .lettersTrack', 100);
                            }
                        }
                    });
                }
            });
        }
    });
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('Storage changed:', changes, namespace);
    
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Storage key "${key}" changed from "${oldValue}" to "${newValue}"`);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started up');
});

// Handle extension shutdown
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension shutting down');
});

// Helper function to get extension settings
async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['defaultSelector', 'defaultSpeed', 'enabled'], (result) => {
            resolve({
                defaultSelector: result.defaultSelector || '#trackTextWrapper .lettersTrack',
                defaultSpeed: result.defaultSpeed || 100,
                enabled: result.enabled !== false
            });
        });
    });
}

// Helper function to save extension settings
async function saveSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.local.set(settings, resolve);
    });
}

// Functions to be injected into the page
function detectTypingText() {
    const elements = document.querySelectorAll('#trackTextWrapper .lettersTrack');
    if (elements.length === 0) {
        return null;
    }
    
    let text = '';
    elements.forEach(element => {
        const elementText = element.textContent || element.innerText;
        if (elementText) {
            text += elementText;
        }
    });
    
    return text.trim();
}

function startAutoTyping(baseSpeed = 80) {
    console.log('🤖 Starting human-like auto-typing with base speed:', baseSpeed + 'ms');
    
    // Check if typing is already in progress
    if (window.typingBotInterval) {
        clearInterval(window.typingBotInterval);
    }
    
    const elements = document.querySelectorAll('#trackTextWrapper .lettersTrack');
    if (elements.length === 0) {
        console.error('No typing elements found');
        return;
    }
    
    // Extract all text
    let fullText = '';
    elements.forEach(element => {
        const elementText = element.textContent || element.innerText;
        if (elementText) {
            fullText += elementText;
        }
    });
    
    console.log('Extracted text:', fullText);
    
    // Find the specific typing input field
    let inputElement = document.querySelector('#userInputTrack');
    
    if (!inputElement) {
        console.error('Typing input field not found');
        return;
    }
    
    // Enable the input field if it's disabled
    if (inputElement.disabled) {
        inputElement.disabled = false;
        console.log('Enabled the typing input field');
    }
    
    // Click and focus the input field first
    inputElement.click();
    inputElement.focus();
    console.log('Clicked and focused the input field');
    
    let currentIndex = 0;
    let typedText = '';
    let speedVariation = 0.3;
    let errorRate = 0.05;
    let correctionDelay = 500;
    let pauseProbability = 0.1;
    let pauseDuration = 1000;
    
    // Human-like typing patterns
    const commonErrors = {
        'a': 's', 's': 'a', 'e': 'r', 'r': 'e', 't': 'y', 'y': 't',
        'i': 'u', 'u': 'i', 'o': 'p', 'p': 'o', 'n': 'm', 'm': 'n',
        'the': 'teh', 'and': 'adn', 'for': 'fro', 'with': 'wth',
        'that': 'taht', 'this': 'thsi', 'have': 'hvae', 'from': 'form'
    };
    
    function getHumanLikeSpeed() {
        // Base speed with random variation
        let speed = baseSpeed;
        
        // Add random variation (±30%)
        const variation = (Math.random() - 0.5) * 2 * speedVariation;
        speed += speed * variation;
        
        // Add occasional longer pauses (10% chance)
        if (Math.random() < pauseProbability) {
            speed += pauseDuration;
        }
        
        // Faster typing for common characters, slower for complex ones
        if (currentIndex < fullText.length) {
            const char = fullText[currentIndex];
            if (char === ' ' || char === '.' || char === ',') {
                speed *= 0.8; // Faster for spaces and punctuation
            } else if (char === char.toUpperCase()) {
                speed *= 1.2; // Slower for uppercase letters
            }
        }
        
        return Math.max(50, Math.min(500, speed)); // Clamp between 50ms and 500ms
    }
    
    function simulateTypingError(char) {
        // Check for common typing errors
        if (Math.random() < errorRate) {
            // Character substitution errors
            if (commonErrors[char]) {
                return commonErrors[char];
            }
            
            // Random character substitution for adjacent keys
            const adjacentKeys = {
                'a': ['q', 's', 'z'], 's': ['a', 'd', 'z', 'x'],
                'd': ['s', 'f', 'x', 'c'], 'f': ['d', 'g', 'c', 'v'],
                'g': ['f', 'h', 'v', 'b'], 'h': ['g', 'j', 'b', 'n'],
                'j': ['h', 'k', 'n', 'm'], 'k': ['j', 'l', 'm'],
                'l': ['k'], 'z': ['a', 's'], 'x': ['z', 's', 'd'],
                'c': ['x', 'd', 'f'], 'v': ['c', 'f', 'g'],
                'b': ['v', 'g', 'h'], 'n': ['b', 'h', 'j'],
                'm': ['n', 'j', 'k']
            };
            
            if (adjacentKeys[char.toLowerCase()]) {
                const adjacent = adjacentKeys[char.toLowerCase()];
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }
        
        return char; // No error
    }
    
    function typeNextCharacter() {
        if (currentIndex >= fullText.length) {
            console.log('✅ Typing completed!');
            clearInterval(window.typingBotInterval);
            window.typingBotInterval = null;
            return;
        }
        
        const originalChar = fullText[currentIndex];
        const typedChar = simulateTypingError(originalChar);
        
        // Focus the input
        inputElement.focus();
        
        // Create and dispatch keyboard events for the typed character
        const events = [
            {
                type: 'keydown',
                key: typedChar,
                code: `Key${typedChar.toUpperCase()}`,
                keyCode: typedChar.charCodeAt(0),
                which: typedChar.charCodeAt(0)
            },
            {
                type: 'keypress',
                key: typedChar,
                code: `Key${typedChar.toUpperCase()}`,
                keyCode: typedChar.charCodeAt(0),
                which: typedChar.charCodeAt(0)
            },
            {
                type: 'input',
                data: typedChar
            },
            {
                type: 'keyup',
                key: typedChar,
                code: `Key${typedChar.toUpperCase()}`,
                keyCode: typedChar.charCodeAt(0),
                which: typedChar.charCodeAt(0)
            }
        ];
        
        events.forEach(eventData => {
            const event = new KeyboardEvent(eventData.type, {
                ...eventData,
                bubbles: true,
                cancelable: true
            });
            inputElement.dispatchEvent(event);
        });
        
        // Update the input value
        if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
            inputElement.value += typedChar;
        } else if (inputElement.contentEditable === 'true') {
            inputElement.textContent += typedChar;
        }
        
        typedText += typedChar;
        currentIndex++;
        
        // Check if we made an error and need to correct it
        if (typedChar !== originalChar) {
            console.log(`❌ Typing error: typed "${typedChar}" instead of "${originalChar}"`);
            
            // Correct the error immediately before moving to next character
            correctTypingError(inputElement, typedText, originalChar);
            
            // Schedule next character after correction
            const nextSpeed = getHumanLikeSpeed();
            clearInterval(window.typingBotInterval);
            window.typingBotInterval = setTimeout(typeNextCharacter, nextSpeed);
        } else {
            // Schedule next character with human-like timing
            const nextSpeed = getHumanLikeSpeed();
            clearInterval(window.typingBotInterval);
            window.typingBotInterval = setTimeout(typeNextCharacter, nextSpeed);
        }
    }
    
    function correctTypingError(inputElement, currentText, correctChar) {
        console.log(`🔧 Correcting typing error to "${correctChar}"`);
        
        // Delete the last character (backspace)
        const backspaceEvents = [
            {
                type: 'keydown',
                key: 'Backspace',
                code: 'Backspace',
                keyCode: 8,
                which: 8
            },
            {
                type: 'keypress',
                key: 'Backspace',
                code: 'Backspace',
                keyCode: 8,
                which: 8
            },
            {
                type: 'input',
                data: null
            },
            {
                type: 'keyup',
                key: 'Backspace',
                code: 'Backspace',
                keyCode: 8,
                which: 8
            }
        ];
        
        backspaceEvents.forEach(eventData => {
            const event = new KeyboardEvent(eventData.type, {
                ...eventData,
                bubbles: true,
                cancelable: true
            });
            inputElement.dispatchEvent(event);
        });
        
        // Remove the last character from input
        if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
            inputElement.value = inputElement.value.slice(0, -1);
        } else if (inputElement.contentEditable === 'true') {
            inputElement.textContent = inputElement.textContent.slice(0, -1);
        }
        
        // Type the correct character immediately
        const correctEvents = [
            {
                type: 'keydown',
                key: correctChar,
                code: `Key${correctChar.toUpperCase()}`,
                keyCode: correctChar.charCodeAt(0),
                which: correctChar.charCodeAt(0)
            },
            {
                type: 'keypress',
                key: correctChar,
                code: `Key${correctChar.toUpperCase()}`,
                keyCode: correctChar.charCodeAt(0),
                which: correctChar.charCodeAt(0)
            },
            {
                type: 'input',
                data: correctChar
            },
            {
                type: 'keyup',
                key: correctChar,
                code: `Key${correctChar.toUpperCase()}`,
                keyCode: correctChar.charCodeAt(0),
                which: correctChar.charCodeAt(0)
            }
        ];
        
        correctEvents.forEach(eventData => {
            const event = new KeyboardEvent(eventData.type, {
                ...eventData,
                bubbles: true,
                cancelable: true
            });
            inputElement.dispatchEvent(event);
        });
        
        // Update the input value with correct character
        if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
            inputElement.value += correctChar;
        } else if (inputElement.contentEditable === 'true') {
            inputElement.textContent += correctChar;
        }
        
        console.log(`✅ Corrected to "${correctChar}"`);
    }
    
    // Start the typing with human-like timing
    const initialSpeed = getHumanLikeSpeed();
    window.typingBotInterval = setTimeout(typeNextCharacter, initialSpeed);
    console.log('🚀 Human-like auto-typing started!');
}

function stopAutoTyping() {
    console.log('🛑 Stopping auto-typing...');
    
    if (window.typingBotInterval) {
        clearInterval(window.typingBotInterval);
        clearTimeout(window.typingBotInterval);
        window.typingBotInterval = null;
        console.log('✅ Auto-typing stopped!');
    } else {
        console.log('No typing interval to stop');
    }
}

// Note: Service workers don't have access to window object
// These functions are available for use within the service worker context 