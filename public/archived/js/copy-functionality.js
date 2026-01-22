// Enhanced copy functionality with fallback support
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const text = codeElement.textContent || codeElement.innerText;
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess();
        }).catch(err => {
            console.warn('Clipboard API failed, trying fallback:', err);
            fallbackCopy(text);
        });
    } else {
        // Fallback for older browsers or non-HTTPS
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess();
        } else {
            showCopyError();
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyError();
    } finally {
        document.body.removeChild(textarea);
    }
}

function showCopySuccess() {
    const button = event.target.closest('.copy-button');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    }
}

function showCopyError() {
    // Get the code element and select it for easy manual copying
    const button = event.target.closest('.copy-button');
    const codeContainer = button.closest('.code-container');
    const codeElement = codeContainer.querySelector('pre code') || codeContainer.querySelector('code');
    
    if (codeElement) {
        // Create a range and select the code text
        const range = document.createRange();
        range.selectNodeContents(codeElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Change button to indicate selection
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-hand-pointer"></i> Selected!';
        button.style.background = '#fbbf24';
        
        // Show helpful message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1f2937;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        message.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">📋 Code Selected!</div>
            <div>Press <strong>Ctrl+C</strong> (or <strong>Cmd+C</strong> on Mac) to copy</div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">Click anywhere to close</div>
        `;
        document.body.appendChild(message);
        
        // Remove message when clicking anywhere
        const removeMessage = () => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
                button.innerHTML = originalText;
                button.style.background = '';
                selection.removeAllRanges();
                document.removeEventListener('click', removeMessage);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMessage);
        }, 100);
        
        // Auto-remove after 8 seconds
        setTimeout(removeMessage, 8000);
    } else {
        alert('Unable to copy automatically. Please select the code and copy manually (Ctrl+C or Cmd+C).');
    }
}