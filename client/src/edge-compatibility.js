// Microsoft Edge Compatibility Module for Snake Slither Game
// Fixes rendering and performance issues in Microsoft Edge browser

class EdgeCompatibility {
    constructor() {
        this.isEdge = this.detectEdge();
        this.isIE = this.detectIE();
        
        if (this.isEdge) {
            console.log('Microsoft Edge detected - applying compatibility fixes');
            this.applyEdgeFixes();
        }
    }
    
    detectEdge() {
        return navigator.userAgent.indexOf('Edge') > -1 || navigator.userAgent.indexOf('Edg/') > -1;
    }
    
    detectIE() {
        return navigator.userAgent.indexOf('MSIE') > -1 || navigator.appVersion.indexOf('Trident/') > -1;
    }
    
    applyEdgeFixes() {
        // Polyfill for requestAnimationFrame if needed
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return setTimeout(callback, 16);
            };
        }
        
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
        
        // Override console methods to prevent Edge console issues
        if (this.isEdge && !window.edgeConsoleFixed) {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
                try {
                    originalLog.apply(console, args);
                } catch (e) {
                    // Silent fail for Edge console issues
                }
            };
            
            console.error = function(...args) {
                try {
                    originalError.apply(console, args);
                } catch (e) {
                    // Silent fail for Edge console issues
                }
            };
            
            console.warn = function(...args) {
                try {
                    originalWarn.apply(console, args);
                } catch (e) {
                    // Silent fail for Edge console issues
                }
            };
            
            window.edgeConsoleFixed = true;
        }
    }
    
    getCompatibleContext(canvas) {
        const ctx = canvas.getContext('2d');
        if (this.isEdge && ctx) {
            // Disable anti-aliasing for better Edge performance
            ctx.imageSmoothingEnabled = false;
            
            // Add fallback methods for Edge
            if (!ctx.createRadialGradient) {
                ctx.createRadialGradient = function() {
                    return {
                        addColorStop: function() {},
                        toString: function() { return '#1a1a1a'; }
                    };
                };
            }
        }
        return ctx;
    }
    
    createSimpleBackground(ctx, width, height, theme = 'dark') {
        let bgColor = '#1a1a1a';
        if (theme === 'neon') {
            bgColor = '#001122';
        } else if (theme === 'retro') {
            bgColor = '#3d2820';
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
    }
    
    createCompatibleGradient(ctx, width, height, theme = 'dark') {
        if (this.isEdge) {
            // Use simple background for Edge
            this.createSimpleBackground(ctx, width, height, theme);
            return;
        }
        
        try {
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, width / 2
            );
            
            if (theme === 'neon') {
                gradient.addColorStop(0, '#001122');
                gradient.addColorStop(1, '#000011');
            } else if (theme === 'retro') {
                gradient.addColorStop(0, '#3d2820');
                gradient.addColorStop(1, '#2d1810');
            } else {
                gradient.addColorStop(0, '#1a1a1a');
                gradient.addColorStop(1, '#0a0a0a');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } catch (e) {
            // Fallback to simple background
            this.createSimpleBackground(ctx, width, height, theme);
        }
    }
    
    normalizeTime(currentTime, lastTime) {
        if (this.isEdge) {
            // Use Date.now() for Edge for better compatibility
            const now = Date.now();
            const delta = Math.min((now - (lastTime || now)) / 16.67, 2);
            return { deltaTime: delta, normalizedTime: now };
        } else {
            const delta = (currentTime - (lastTime || 0)) / 16.67;
            return { 
                deltaTime: isFinite(delta) && delta > 0 ? Math.min(delta, 2) : 1, 
                normalizedTime: currentTime 
            };
        }
    }
    
    shouldSkipParticles() {
        return this.isEdge; // Skip particles in Edge for better performance
    }
    
    shouldSkipShadows() {
        return this.isEdge; // Skip shadows in Edge for better performance
    }
    
    getOptimizedRenderSettings() {
        if (this.isEdge) {
            return {
                skipParticles: true,
                skipShadows: true,
                skipGradients: true,
                useSimpleShapes: true,
                reducedAnimations: true
            };
        }
        
        return {
            skipParticles: false,
            skipShadows: false,
            skipGradients: false,
            useSimpleShapes: false,
            reducedAnimations: false
        };
    }
}

// Create global instance
window.edgeCompatibility = new EdgeCompatibility();

console.log('Edge compatibility module loaded');