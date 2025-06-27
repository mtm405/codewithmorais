/**
 * Development Utilities
 * Helper functions for debugging and development
 */

// Debug mode flag
window.DEBUG_MODE = window.location.search.includes("debug") || window.location.search.includes("dev=1");

// Development utilities namespace
window.DevUtils = {
    // Component debugging
    components: {
        list: () => {
            console.log("Available Components:", Object.keys(window.Components || {}));
            return window.Components;
        },
        
        inspect: (componentInstance) => {
            if (!componentInstance) {
                console.error("No component instance provided");
                return;
            }
            console.log("Component State:", {
                container: componentInstance.container,
                options: componentInstance.options || "N/A",
                state: Object.keys(componentInstance).reduce((acc, key) => {
                    if (typeof componentInstance[key] !== "function") {
                        acc[key] = componentInstance[key];
                    }
                    return acc;
                }, {})
            });
        }
    },
    
    // API debugging
    api: {
        testEndpoint: async (endpoint, method = "GET", data = null) => {
            console.log(`Testing ${method} ${endpoint}`);
            try {
                const options = {
                    method,
                    headers: { "Content-Type": "application/json" }
                };
                if (data) options.body = JSON.stringify(data);
                
                const response = await fetch(endpoint, options);
                const result = await response.json();
                console.log("Response:", result);
                return result;
            } catch (error) {
                console.error("API Test Error:", error);
                return { error: error.message };
            }
        },
        
        listEndpoints: () => {
            const endpoints = [
                "/api/announcements",
                "/api/leaderboard", 
                "/api/quiz/submit",
                "/api/quiz/purchase_hint",
                "/api/daily_challenge/activities",
                "/api/daily_challenge/submit",
                "/api/notifications",
                "/api/progress",
                "/api/schedule"
            ];
            console.table(endpoints);
            return endpoints;
        }
    },
    
    // Performance monitoring
    performance: {
        startTimer: (label) => {
            console.time(label);
        },
        
        endTimer: (label) => {
            console.timeEnd(label);
        },
        
        measureRender: (callback, label = "Render") => {
            console.time(label);
            const result = callback();
            console.timeEnd(label);
            return result;
        }
    },
    
    // Local storage debugging
    storage: {
        list: () => {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items[key] = localStorage.getItem(key);
            }
            console.table(items);
            return items;
        },
        
        clear: (pattern) => {
            if (!pattern) {
                if (confirm("Clear ALL localStorage items?")) {
                    localStorage.clear();
                    console.log("All localStorage cleared");
                }
                return;
            }
            
            const keys = Object.keys(localStorage);
            const matching = keys.filter(key => key.includes(pattern));
            matching.forEach(key => {
                localStorage.removeItem(key);
                console.log(`Removed: ${key}`);
            });
        }
    },
    
    // DOM utilities
    dom: {
        highlight: (selector, duration = 3000) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.outline = "3px solid red";
                el.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
                setTimeout(() => {
                    el.style.outline = "";
                    el.style.backgroundColor = "";
                }, duration);
            });
            console.log(`Highlighted ${elements.length} elements matching "${selector}"`);
        },
        
        info: (selector) => {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements matching "${selector}"`);
            elements.forEach((el, i) => {
                console.log(`Element ${i}:`, {
                    tag: el.tagName,
                    id: el.id || "no-id",
                    classes: Array.from(el.classList),
                    attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`),
                    textContent: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? "..." : "")
                });
            });
        }
    },
    
    // Quiz system debugging
    quiz: {
        simulateSubmit: (questionId, isCorrect = true, points = 1) => {
            if (typeof handleQuizSubmit === "function") {
                return handleQuizSubmit({
                    questionId,
                    type: "multiple_choice",
                    userInput: isCorrect ? 0 : 1,
                    correctAnswer: 0,
                    points,
                    feedbackElement: null
                });
            } else {
                console.error("handleQuizSubmit function not found");
            }
        },
        
        listGlobals: () => {
            const quizFunctions = [
                "handleQuizSubmit",
                "gradeMCQ", 
                "gradeFillInTheBlank",
                "gradeDragAndDrop",
                "gradeCode",
                "gradeDebug",
                "showFeedback",
                "updateUserCurrency",
                "updateUserPoints"
            ];
            
            const available = {};
            quizFunctions.forEach(fn => {
                available[fn] = typeof window[fn] !== "undefined";
            });
            
            console.table(available);
            return available;
        }
    }
};

// Auto-enable debug mode features
if (window.DEBUG_MODE) {
    console.log("🔧 Debug mode enabled");
    console.log("Available utilities: window.DevUtils");
    
    // Add debug styles
    const debugStyle = document.createElement("style");
    debugStyle.textContent = `
        .debug-highlight {
            outline: 2px solid #ff0000 !important;
            background-color: rgba(255, 0, 0, 0.1) !important;
        }
        .debug-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        }
    `;
    document.head.appendChild(debugStyle);
    
    // Add debug info panel
    const debugInfo = document.createElement("div");
    debugInfo.className = "debug-info";
    debugInfo.innerHTML = `
        <strong>🔧 Debug Mode</strong><br>
        Page: ${window.location.pathname}<br>
        Components: ${Object.keys(window.Components || {}).length}<br>
        <small>Check console for DevUtils</small>
    `;
    document.body.appendChild(debugInfo);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (debugInfo.parentNode) {
            debugInfo.style.opacity = "0.3";
        }
    }, 5000);
}

// Export for ES modules if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = window.DevUtils;
}
