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
                // Click the start game button to go through the normal flow
                const startBtn = document.getElementById('play-btn');
                if (startBtn) {
                    console.log('Debug: Clicking Start Game button');
                    startBtn.click();
                    
                    // Auto-select classic mode after a brief delay
                    setTimeout(() => {
                        const classicBtn = document.querySelector('[data-mode="classic"]');
                        if (classicBtn) {
                            console.log('Debug: Selecting Classic mode');
                            classicBtn.click();
                            
                            // Auto-continue to levels
                            setTimeout(() => {
                                const continueBtn = document.getElementById('continue-to-levels-btn');
                                if (continueBtn && !continueBtn.disabled) {
                                    console.log('Debug: Continuing to levels');
                                    continueBtn.click();
                                    
                                    // Auto-select level 1
                                    setTimeout(() => {
                                        const level1Btn = document.querySelector('[data-level="1"]');
                                        if (level1Btn) {
                                            console.log('Debug: Selecting Level 1');
                                            level1Btn.click();
                                            
                                            // Start the actual game
                                            setTimeout(() => {
                                                const startGameBtn = document.getElementById('start-game-btn');
                                                if (startGameBtn && !startGameBtn.disabled) {
                                                    console.log('Debug: Starting the game');
                                                    startGameBtn.click();
                                                }
                                            }, 500);
                                        }
                                    }, 500);
                                }
                            }, 500);
                        }
                    }, 500);
                }
            }, 3000); // Wait 3 seconds after game loads
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