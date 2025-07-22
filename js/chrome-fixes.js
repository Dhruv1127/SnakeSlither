// Chrome Browser Optimizations for Snake Slither Game
class ChromeOptimizations {
    constructor() {
        this.isChrome = this.detectChrome();
        this.isSafari = this.detectSafari();
        this.isFirefox = this.detectFirefox();
        
        if (this.isChrome) {
            console.log('Chrome browser detected - applying optimizations');
            this.applyChromeOptimizations();
        } else if (this.isSafari) {
            console.log('Safari browser detected - applying optimizations');
            this.applySafariOptimizations();
        } else if (this.isFirefox) {
            console.log('Firefox browser detected - applying optimizations');
            this.applyFirefoxOptimizations();
        }
    }
    
    detectChrome() {
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    
    detectSafari() {
        return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    }
    
    detectFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }
    
    applyChromeOptimizations() {
        // Enable hardware acceleration hints
        document.body.style.transform = 'translateZ(0)';
        
        // Optimize requestAnimationFrame
        this.optimizeAnimationFrame();
        
        // Improve font rendering
        this.optimizeFontRendering();
        
        // Add performance monitoring
        this.addPerformanceMonitoring();
    }
    
    applySafariOptimizations() {
        // Safari-specific fixes
        document.body.style.webkitBackfaceVisibility = 'hidden';
        document.body.style.webkitPerspective = '1000';
        
        // Fix touch events
        this.fixSafariTouch();
    }
    
    applyFirefoxOptimizations() {
        // Firefox-specific fixes
        document.body.style.mozBackfaceVisibility = 'hidden';
        
        // Improve rendering
        this.optimizeFirefoxRendering();
    }
    
    optimizeAnimationFrame() {
        // Add fallback for older browsers
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                         window.mozRequestAnimationFrame ||
                                         window.oRequestAnimationFrame ||
                                         window.msRequestAnimationFrame ||
                                         function(callback) {
                                             return window.setTimeout(callback, 1000 / 60);
                                         };
        }
        
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = window.webkitCancelAnimationFrame ||
                                        window.mozCancelAnimationFrame ||
                                        window.oCancelAnimationFrame ||
                                        window.msCancelAnimationFrame ||
                                        function(id) {
                                            window.clearTimeout(id);
                                        };
        }
    }
    
    optimizeFontRendering() {
        // Add font display optimizations
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Arial';
                font-display: swap;
            }
            
            body, button, input, select, textarea {
                font-rendering: optimizeSpeed;
                text-rendering: optimizeSpeed;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .modal-content h1, .modal-content h2, .modal-content h3 {
                font-weight: bold;
                letter-spacing: 0.5px;
            }
        `;
        document.head.appendChild(style);
    }
    
    addPerformanceMonitoring() {
        // Basic performance monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
                
                // Log performance issues
                if (fps < 30 && window.game && window.game.isRunning) {
                    console.warn(`Performance warning: ${fps} FPS`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
    
    fixSafariTouch() {
        // Fix Safari touch event issues
        document.addEventListener('touchstart', function() {}, {passive: true});
        document.addEventListener('touchmove', function() {}, {passive: false});
    }
    
    optimizeFirefoxRendering() {
        // Firefox-specific rendering optimizations
        const style = document.createElement('style');
        style.textContent = `
            #game-canvas {
                image-rendering: -moz-crisp-edges;
                image-rendering: pixelated;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fix keyboard event compatibility
    static fixKeyboardEvents() {
        const originalAddEventListener = Element.prototype.addEventListener;
        
        Element.prototype.addEventListener = function(type, listener, options) {
            if (type === 'keydown' || type === 'keyup') {
                const wrappedListener = function(event) {
                    // Ensure key and code properties exist
                    if (!event.code && event.keyCode) {
                        const keyMap = {
                            37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown',
                            87: 'KeyW', 65: 'KeyA', 83: 'KeyS', 68: 'KeyD',
                            32: 'Space', 16: 'Shift'
                        };
                        event.code = keyMap[event.keyCode] || `Key${String.fromCharCode(event.keyCode)}`;
                    }
                    
                    if (!event.key && event.keyCode) {
                        const keyMap = {
                            37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown',
                            87: 'w', 65: 'a', 83: 's', 68: 'd',
                            32: ' ', 16: 'Shift'
                        };
                        event.key = keyMap[event.keyCode] || String.fromCharCode(event.keyCode).toLowerCase();
                    }
                    
                    return listener.call(this, event);
                };
                
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
}

// Apply keyboard fixes immediately
ChromeOptimizations.fixKeyboardEvents();

// Initialize optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChromeOptimizations();
    });
} else {
    new ChromeOptimizations();
}

console.log('Chrome optimizations loaded');