document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const detectedTextDiv = document.getElementById('detectedText');
    const speedInput = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    const statusDiv = document.getElementById('status');
    
    // Add new human-like settings elements
    const errorRateInput = document.getElementById('errorRate');
    const errorRateValue = document.getElementById('errorRateValue');
    const speedVariationInput = document.getElementById('speedVariation');
    const speedVariationValue = document.getElementById('speedVariationValue');
    const pauseProbabilityInput = document.getElementById('pauseProbability');
    const pauseProbabilityValue = document.getElementById('pauseProbabilityValue');
    
    let isTyping = false;
    let detectedText = '';
    
    // Update speed value display
    speedInput.addEventListener('input', function() {
        speedValue.textContent = this.value + 'ms';
    });
    
    // Update error rate value display
    if (errorRateInput) {
        errorRateInput.addEventListener('input', function() {
            errorRateValue.textContent = (this.value * 100).toFixed(1) + '%';
        });
    }
    
    // Update speed variation value display
    if (speedVariationInput) {
        speedVariationInput.addEventListener('input', function() {
            speedVariationValue.textContent = (this.value * 100).toFixed(0) + '%';
        });
    }
    
    // Update pause probability value display
    if (pauseProbabilityInput) {
        pauseProbabilityInput.addEventListener('input', function() {
            pauseProbabilityValue.textContent = (this.value * 100).toFixed(1) + '%';
        });
    }
    
    // Auto-detect text when popup opens
    detectTextOnPage();
    
    // Check current typing state
    checkTypingState();
    
    // Start typing
    startBtn.addEventListener('click', async function() {
        const baseSpeed = parseInt(speedInput.value);
        const errorRate = errorRateInput ? parseFloat(errorRateInput.value) : 0.02;
        const speedVariation = speedVariationInput ? parseFloat(speedVariationInput.value) : 0.2;
        const pauseProbability = pauseProbabilityInput ? parseFloat(pauseProbabilityInput.value) : 0.05;
        
        if (!detectedText) {
            updateStatus('No text detected! Please refresh and try again. ⚠️', 'inactive');
            return;
        }
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: startHumanLikeTyping,
                args: ['#trackTextWrapper .lettersTrack', baseSpeed, errorRate, speedVariation, pauseProbability]
            });
            
            isTyping = true;
            updateStatus('Human-like typing in progress... 🚀', 'active');
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Update button visibility
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            
        } catch (error) {
            console.error('Error starting typing:', error);
            updateStatus('Error starting typing! ❌', 'inactive');
        }
    });
    
    // Stop typing
    stopBtn.addEventListener('click', async function() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: stopTyping
            });
            
            isTyping = false;
            updateStatus('Typing stopped! ⏹️', 'inactive');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            
            // Update button visibility
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
            
        } catch (error) {
            console.error('Error stopping typing:', error);
            updateStatus('Error stopping typing! ❌', 'inactive');
        }
    });
    
    function updateStatus(message, className) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${className}`;
    }
    
    // Function to detect text on the current page
    async function detectTextOnPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: detectTypingText
            });
            
            if (result && result[0] && result[0].result) {
                detectedText = result[0].result;
                updateDetectedTextDisplay(detectedText);
                updateStatus('Text detected! Ready for human-like typing! 🎯', 'inactive');
            } else {
                updateDetectedTextDisplay('No typing text found on this page');
                updateStatus('No typing text detected ⚠️', 'inactive');
            }
        } catch (error) {
            console.error('Error detecting text:', error);
            updateDetectedTextDisplay('Error detecting text');
            updateStatus('Error detecting text! ❌', 'inactive');
        }
    }
    
    // Function to update the detected text display
    function updateDetectedTextDisplay(text) {
        if (detectedTextDiv) {
            if (text.length > 100) {
                detectedTextDiv.textContent = text.substring(0, 100) + '...';
                detectedTextDiv.title = text; // Show full text on hover
        } else {
                detectedTextDiv.textContent = text;
                detectedTextDiv.title = '';
            }
        }
    }
    
    // Function to check current typing state
    async function checkTypingState() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return window.typingBotInterval !== null;
                }
            });
            
            if (result && result[0] && result[0].result) {
                // Typing is in progress
                isTyping = true;
                updateStatus('Typing in progress... 🚀', 'active');
                startBtn.disabled = true;
                stopBtn.disabled = false;
                startBtn.style.display = 'none';
                stopBtn.style.display = 'block';
            } else {
                // No typing in progress
            isTyping = false;
                updateStatus('Ready to type! 🎯', 'inactive');
            startBtn.disabled = false;
            stopBtn.disabled = true;
                startBtn.style.display = 'block';
                stopBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking typing state:', error);
        }
    }
});

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

function startHumanLikeTyping(selector, baseSpeed, errorRate, speedVariation, pauseProbability) {
    console.log('🤖 Starting human-like typing with settings:', {
        selector, baseSpeed, errorRate, speedVariation, pauseProbability
    });
    
    // Check if typing is already in progress
    if (window.typingBotInterval) {
        clearInterval(window.typingBotInterval);
        clearTimeout(window.typingBotInterval);
    }
    
    const elements = document.querySelectorAll(selector);
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
    
    // Human-like typing patterns
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
    
    function getHumanLikeSpeed() {
        // Base speed with random variation
        let speed = baseSpeed;
        
        // Add random variation
        const variation = (Math.random() - 0.5) * 2 * speedVariation;
        speed += speed * variation;
        
        // Add occasional longer pauses
        if (Math.random() < pauseProbability) {
            speed += 1000; // 1 second pause
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
            clearTimeout(window.typingBotInterval);
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
            clearTimeout(window.typingBotInterval);
            window.typingBotInterval = setTimeout(typeNextCharacter, nextSpeed);
            } else {
            // Schedule next character with human-like timing
            const nextSpeed = getHumanLikeSpeed();
            clearTimeout(window.typingBotInterval);
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

function stopTyping() {
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