// Main entry point for Enhanced Snake Game
(function() {
    'use strict';
    
    console.log('Snake Viper starting...');
    
    // Show loading screen initially
    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    // Hide loading screen and show start screen
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const startScreen = document.getElementById('start-screen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
    }

    // Initialize game when DOM is loaded
    async function initializeGame() {
        try {
            // Show loading screen
            showLoadingScreen();
            
            // Simulate loading time for smooth experience
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create game instance
            window.game = new SnakeGame();
            
            // Initialize UI
            gameUI.init();
            
            // Load user settings and apply theme
            const settings = gameStorage.getSettings();
            gameStorage.applyTheme(settings.theme);
            gameAudio.setEnabled(settings.soundEnabled);
            
            console.log('Snake Viper initialized successfully');
            
            // Hide loading screen and show start screen
            hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            showError('Failed to initialize Snake Viper. Please refresh the page.');
        }
    }
    
    // Error handling
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff5252;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ff5252;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }
    
    // Performance monitoring
    function monitorPerformance() {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark('game-init-start');
            
            // Monitor FPS
            let frameCount = 0;
            let lastTime = performance.now();
            
            function updateFPS() {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime >= 1000) {
                    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                    
                    // Log low FPS warnings
                    if (fps < 30) {
                        console.warn(`Low FPS detected: ${fps}`);
                    }
                    
                    frameCount = 0;
                    lastTime = currentTime;
                }
                
                requestAnimationFrame(updateFPS);
            }
            
            requestAnimationFrame(updateFPS);
        }
    }
    
    // Responsive design handler
    function handleResize() {
        if (window.game) {
            window.game.resizeCanvas();
        }
        gameUI.updateMobileControls();
    }
    
    // Visibility change handler (pause game when tab is hidden)
    function handleVisibilityChange() {
        if (document.hidden) {
            if (window.game && window.game.isRunning && !window.game.isPaused) {
                gameUI.pauseGame();
            }
        }
    }
    
    // Prevent accidental page navigation
    function preventAccidentalNavigation() {
        window.addEventListener('beforeunload', (e) => {
            if (window.game && window.game.isRunning) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your game progress will be lost.';
                return e.returnValue;
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        initializeGame();
    }
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start performance monitoring
    monitorPerformance();
    
    // Prevent accidental navigation
    preventAccidentalNavigation();
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        if (!window.game) {
            showError('A critical error occurred. Please refresh the page.');
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });
    
    // Expose debug functions for development
    if (typeof window !== 'undefined') {
        window.debug = {
            game: () => window.game,
            storage: () => gameStorage,
            audio: () => gameAudio,
            ui: () => gameUI,
            exportData: () => gameStorage.exportSettings(),
            importData: (data) => gameStorage.importSettings(data),
            clearData: () => {
                if (confirm('This will clear all game data. Are you sure?')) {
                    gameStorage.clearAllData();
                    location.reload();
                }
            }
        };
    }
    
    console.log('Snake Viper loaded successfully!');
})();
