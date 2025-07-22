// Debug auto-start for testing
(function() {
    'use strict';
    
    // Wait for game to be ready
    function waitForGameReady() {
        if (window.game && window.gameUI) {
            console.log('Auto-starting game for testing...');
            
            // Set default selections
            window.gameUI.selectedMode = 'classic';
            window.gameUI.selectedLevel = 1;
            
            // Start the game after a short delay
            setTimeout(() => {
                console.log('Debug: Starting game automatically');
                window.gameUI.startGame();
            }, 2000); // Wait 2 seconds after game loads
        } else {
            // Try again in 100ms
            setTimeout(waitForGameReady, 100);
        }
    }
    
    // Only auto-start in development (when URL contains localhost or replit)
    if (window.location.href.includes('localhost') || window.location.href.includes('replit')) {
        console.log('Debug mode: Will auto-start game in 2 seconds');
        waitForGameReady();
    }
})();