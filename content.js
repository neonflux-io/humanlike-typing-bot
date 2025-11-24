// Content script for Typing Bot Extension
console.log('🤖 Typing Bot Extension loaded!');

// Check if already loaded to prevent duplicate execution
if (window.typingBotContentScriptLoaded) {
    console.log('🤖 Typing Bot Extension already loaded, skipping...');
} else {
    window.typingBotContentScriptLoaded = true;
    
    // Initialize the extension
    initializeTypingBot();
}

// Function to initialize the typing bot
function initializeTypingBot() {
    // Global variables - check if already declared to prevent conflicts
    if (typeof window.typingBotInterval === 'undefined') {
        window.typingBotInterval = null;
    }
    if (typeof window.typingBotIsTyping === 'undefined') {
        window.typingBotIsTyping = false;
    }

    // Local variables for this script instance
    let typingInterval = null;
    let isTyping = false;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Message received:', message);
        
        if (message.action === 'startTyping') {
            startTyping(message.selector, message.speed);
        } else if (message.action === 'stopTyping') {
            stopTyping();
        }
    });

    // Function to extract text from elements
    function extractTextFromElements(selector) {
        const elements = document.querySelectorAll(selector);
        let text = '';
        
        elements.forEach(element => {
            const elementText = element.textContent || element.innerText;
            if (elementText) {
                text += elementText;
            }
        });
        
        return text.trim();
    }

    // Function to find the specific typing input field
    function findInputField() {
        // Look for the specific typing input field
        const inputElement = document.querySelector('#userInputTrack');
        
        if (inputElement && inputElement.offsetParent !== null) {
            // Enable the input field if it's disabled
            if (inputElement.disabled) {
                inputElement.disabled = false;
                console.log('Enabled the typing input field');
            }
            return inputElement;
        }
        
        // Fallback to temporary input if not found
        return createTemporaryInput();
    }

    // Function to create a temporary input if none exists
    function createTemporaryInput() {
        // Check if there's already a temporary input
        let tempInput = document.getElementById('typing-bot-temp-input');
        if (tempInput) {
            return tempInput;
        }
        
        // Create a temporary input field
        tempInput = document.createElement('input');
        tempInput.id = 'typing-bot-temp-input';
        tempInput.type = 'text';
        tempInput.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 200px;
            height: 30px;
            z-index: 9999;
            background: white;
            border: 2px solid #4CAF50;
            border-radius: 5px;
            padding: 5px;
            font-size: 14px;
            opacity: 0.8;
        `;
        tempInput.placeholder = 'Typing Bot Input';
        
        document.body.appendChild(tempInput);
        return tempInput;
    }

    // Human-like typing patterns and error simulation
    const commonErrors = {
        'a': 's', 's': 'a', 'e': 'r', 'r': 'e', 't': 'y', 'y': 't',
        'i': 'u', 'u': 'i', 'o': 'p', 'p': 'o', 'n': 'm', 'm': 'n',
        'the': 'teh', 'and': 'adn', 'for': 'fro', 'with': 'wth',
        'that': 'taht', 'this': 'thsi', 'have': 'hvae', 'from': 'form'
    };

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

    function getHumanLikeSpeed(baseSpeed, speedVariation = 0.3, pauseProbability = 0.1, pauseDuration = 1000) {
        // Base speed with random variation
        let speed = baseSpeed;
        
        // Add random variation (±30%)
        const variation = (Math.random() - 0.5) * 2 * speedVariation;
        speed += speed * variation;
        
        // Add occasional longer pauses (10% chance)
        if (Math.random() < pauseProbability) {
            speed += pauseDuration;
        }
        
        return Math.max(50, Math.min(500, speed)); // Clamp between 50ms and 500ms
    }

    function simulateTypingError(char, errorRate = 0.05) {
        // Check for common typing errors
        if (Math.random() < errorRate) {
            // Character substitution errors
            if (commonErrors[char]) {
                return commonErrors[char];
            }
            
            // Random character substitution for adjacent keys
            if (adjacentKeys[char.toLowerCase()]) {
                const adjacent = adjacentKeys[char.toLowerCase()];
                return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
        }
        
        return char; // No error
    }

    // Function to simulate human-like typing
    function simulateTyping(inputElement, text, baseSpeed, errorRate = 0.05, correctionDelay = 500) {
        let currentIndex = 0;
        let typedText = '';
        
        function typeNextCharacter() {
            if (currentIndex >= text.length) {
                console.log('✅ Typing completed!');
                clearTimeout(typingInterval);
                typingInterval = null;
                isTyping = false;
                return;
            }
            
            const originalChar = text[currentIndex];
            const typedChar = simulateTypingError(originalChar, errorRate);
            
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
                const nextSpeed = getHumanLikeSpeed(baseSpeed);
                clearTimeout(typingInterval);
                typingInterval = setTimeout(typeNextCharacter, nextSpeed);
            } else {
                // Schedule next character with human-like timing
                const nextSpeed = getHumanLikeSpeed(baseSpeed);
                clearTimeout(typingInterval);
                typingInterval = setTimeout(typeNextCharacter, nextSpeed);
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
        const initialSpeed = getHumanLikeSpeed(baseSpeed);
        typingInterval = setTimeout(typeNextCharacter, initialSpeed);
        console.log('🚀 Human-like typing started!');
    }

    async function startTyping(selector, baseSpeed = 80) {
        console.log('🤖 Starting human-like typing with selector:', selector, 'and base speed:', baseSpeed + 'ms');
        
        if (isTyping) {
            console.log('Typing already in progress, stopping first...');
            stopTyping();
        }
        
        const text = extractTextFromElements(selector);
        if (!text) {
            console.error('No text found with selector:', selector);
            return;
        }
        
        console.log('Extracted text:', text);
        
        const inputElement = findInputField();
        if (!inputElement) {
            console.error('No input field found');
            return;
        }
        
        // Click and focus the input field first
        inputElement.click();
        inputElement.focus();
        console.log('Clicked and focused the input field');
        
        isTyping = true;
        
        // Start human-like typing
        simulateTyping(inputElement, text, baseSpeed);
    }

    function stopTyping() {
        console.log('🛑 Stopping typing...');
        
        if (typingInterval) {
            clearTimeout(typingInterval);
            typingInterval = null;
        }
        
        isTyping = false;
        console.log('✅ Typing stopped!');
    }

    // Handle typing site specific logic
    function handleTypingSite(selector, baseSpeed) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.error('No typing elements found');
            return;
        }
        
        let fullText = '';
        elements.forEach(element => {
            const elementText = element.textContent || element.innerText;
            if (elementText) {
                fullText += elementText;
            }
        });
        
        const inputElement = document.querySelector('#userInputTrack');
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
        
        function typeCharacter() {
            if (currentIndex >= fullText.length) {
                console.log('✅ Typing completed!');
                return;
            }
            
            const originalChar = fullText[currentIndex];
            const typedChar = simulateTypingError(originalChar);
            
            // Focus the input
            inputElement.focus();
            
            // Create and dispatch keyboard events
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
                const nextSpeed = getHumanLikeSpeed(baseSpeed);
                setTimeout(typeCharacter, nextSpeed);
            } else {
                // Schedule next character with human-like timing
                const nextSpeed = getHumanLikeSpeed(baseSpeed);
                setTimeout(typeCharacter, nextSpeed);
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
        const initialSpeed = getHumanLikeSpeed(baseSpeed);
        setTimeout(typeCharacter, initialSpeed);
        console.log('🚀 Human-like typing started!');
    }

    // Listen for keyboard shortcuts (Ctrl+Shift+T to start typing)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            console.log('Keyboard shortcut detected - starting typing');
            // You can add default selector here
            startTyping('#trackTextWrapper .lettersTrack', 100);
        }
    });

    // Add visual indicator when extension is active
    const style = document.createElement('style');
    style.textContent = `
        .typing-bot-active {
            outline: 2px solid #4CAF50 !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(style);
} 