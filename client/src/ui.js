// UI Management for Snake Game
class GameUI {
    constructor() {
        this.elements = this.getElements();
        this.currentMode = 'classic';
        this.selectedMode = 'classic';
        this.isSettingsOpen = false;
        this.isPaused = false;
        
        this.bindEvents();
        this.loadSettings();
    }

    getElements() {
        return {
            // Screens
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            settingsModal: document.getElementById('settings-modal'),
            
            // Game Info
            score: document.getElementById('score'),
            highScore: document.getElementById('high-score'),
            gameMode: document.getElementById('game-mode'),
            timer: document.getElementById('timer'),
            
            // Buttons
            startGameBtn: document.getElementById('start-game-btn'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resumeBtn: document.getElementById('resume-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            closeSettingsBtn: document.getElementById('close-settings-btn'),
            soundBtn: document.getElementById('sound-btn'),
            resetHighScoreBtn: document.getElementById('reset-high-score-btn'),
            
            // Mode buttons
            modeButtons: document.querySelectorAll('.mode-btn'),
            
            // Settings
            speedSelect: document.getElementById('speed-select'),
            gridSelect: document.getElementById('grid-select'),
            themeSelect: document.getElementById('theme-select'),
            controlsSelect: document.getElementById('controls-select'),
            
            // Game Over
            gameOverTitle: document.getElementById('game-over-title'),
            finalScore: document.getElementById('final-score'),
            highScoreMsg: document.getElementById('high-score-msg'),
            
            // Mobile controls
            mobileControls: document.getElementById('mobile-controls'),
            directionButtons: document.querySelectorAll('.direction-btn')
        };
    }

    bindEvents() {
        // Mode selection
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectMode(btn.dataset.mode);
            });
        });

        // Game control buttons
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.menuBtn.addEventListener('click', () => this.showMainMenu());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resumeBtn.addEventListener('click', () => this.resumeGame());

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.resetHighScoreBtn.addEventListener('click', () => this.resetHighScore());

        // Sound toggle
        this.elements.soundBtn.addEventListener('click', () => this.toggleSound());

        // Settings changes
        this.elements.speedSelect.addEventListener('change', () => this.saveSettings());
        this.elements.gridSelect.addEventListener('change', () => this.saveSettings());
        this.elements.themeSelect.addEventListener('change', () => this.saveSettings());
        this.elements.controlsSelect.addEventListener('change', () => this.saveSettings());

        // Mobile controls
        this.elements.directionButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileDirection(btn.dataset.direction);
            });
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMobileDirection(btn.dataset.direction);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.isPaused) {
                        this.resumeGame();
                    } else if (window.game && window.game.isRunning) {
                        this.togglePause();
                    }
                    break;
                case 'Escape':
                    if (this.isSettingsOpen) {
                        this.closeSettings();
                    } else if (!this.isPaused && window.game && window.game.isRunning) {
                        this.togglePause();
                    }
                    break;
            }
        });

        // Modal click outside to close
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    selectMode(mode) {
        this.selectedMode = mode;
        
        // Update button selection
        this.elements.modeButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.mode === mode) {
                btn.classList.add('selected');
            }
        });

        // Update mode display
        const modeNames = {
            classic: 'Classic Mode',
            timeattack: 'Time Attack',
            obstacle: 'Obstacle Mode'
        };
        
        this.currentMode = mode;
        this.elements.gameMode.textContent = modeNames[mode];
        
        // Show/hide timer for time attack mode
        if (mode === 'timeattack') {
            this.elements.timer.style.display = 'block';
        } else {
            this.elements.timer.style.display = 'none';
        }
    }

    startGame() {
        this.hideScreen('start');
        if (window.game) {
            window.game.start(this.currentMode);
        }
    }

    restartGame() {
        this.hideScreen('gameOver');
        if (window.game) {
            window.game.restart();
        }
    }

    showMainMenu() {
        this.hideScreen('gameOver');
        this.showScreen('start');
        if (window.game) {
            window.game.reset();
        }
    }

    togglePause() {
        if (window.game && window.game.isRunning) {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.showScreen('pause');
        if (window.game) {
            window.game.pause();
        }
        gameAudio.pauseBackgroundMusic();
    }

    resumeGame() {
        this.isPaused = false;
        this.hideScreen('pause');
        if (window.game) {
            window.game.resume();
        }
        gameAudio.resumeBackgroundMusic();
    }

    showScreen(screen) {
        const screens = {
            start: this.elements.startScreen,
            gameOver: this.elements.gameOverScreen,
            pause: this.elements.pauseScreen
        };
        
        if (screens[screen]) {
            screens[screen].style.display = 'flex';
        }
    }

    hideScreen(screen) {
        const screens = {
            start: this.elements.startScreen,
            gameOver: this.elements.gameOverScreen,
            pause: this.elements.pauseScreen
        };
        
        if (screens[screen]) {
            screens[screen].style.display = 'none';
        }
    }

    openSettings() {
        this.isSettingsOpen = true;
        this.elements.settingsModal.style.display = 'flex';
        this.loadSettingsValues();
    }

    closeSettings() {
        this.isSettingsOpen = false;
        this.elements.settingsModal.style.display = 'none';
        this.saveSettings();
    }

    loadSettings() {
        const settings = gameStorage.getSettings();
        this.updateSoundButton(settings.soundEnabled);
        gameStorage.applyTheme(settings.theme);
        gameAudio.setEnabled(settings.soundEnabled);
    }

    loadSettingsValues() {
        const settings = gameStorage.getSettings();
        this.elements.speedSelect.value = settings.speed;
        this.elements.gridSelect.value = settings.gridSize;
        this.elements.themeSelect.value = settings.theme;
        this.elements.controlsSelect.value = settings.controls;
    }

    saveSettings() {
        const settings = {
            speed: this.elements.speedSelect.value,
            gridSize: this.elements.gridSelect.value,
            theme: this.elements.themeSelect.value,
            controls: this.elements.controlsSelect.value,
            soundEnabled: gameAudio.isEnabled
        };
        
        gameStorage.saveSettings(settings);
        gameStorage.applyTheme(settings.theme);
        
        // Apply changes to game if running
        if (window.game) {
            window.game.updateSettings(settings);
        }
    }

    toggleSound() {
        const isEnabled = gameAudio.toggleEnabled();
        this.updateSoundButton(isEnabled);
        this.saveSettings();
    }

    updateSoundButton(isEnabled) {
        this.elements.soundBtn.textContent = isEnabled ? '🔊' : '🔇';
        this.elements.soundBtn.title = isEnabled ? 'Mute Sound' : 'Enable Sound';
    }

    resetHighScore() {
        if (confirm('Are you sure you want to reset the high score?')) {
            gameStorage.resetHighScore();
            this.updateHighScore(0);
        }
    }

    // Game state updates
    updateScore(score) {
        this.elements.score.textContent = `Score: ${score}`;
    }

    updateHighScore(highScore) {
        this.elements.highScore.textContent = `High Score: ${highScore}`;
    }

    updateTimer(timeLeft) {
        this.elements.timer.textContent = `Time: ${timeLeft}s`;
    }

    showGameOver(gameData) {
        const isNewHighScore = gameStorage.setHighScore(gameData.score);
        
        this.elements.finalScore.textContent = gameData.score;
        this.elements.highScoreMsg.style.display = isNewHighScore ? 'block' : 'none';
        
        if (gameData.mode === 'timeattack') {
            this.elements.gameOverTitle.textContent = 'Time\'s Up!';
        } else {
            this.elements.gameOverTitle.textContent = 'Game Over!';
        }
        
        this.updateHighScore(gameStorage.getHighScore());
        this.showScreen('gameOver');
        
        // Update stats
        gameStorage.updateStats(gameData);
        
        // Stop music
        gameAudio.stopBackgroundMusic();
    }

    handleMobileDirection(direction) {
        if (window.game && window.game.isRunning && !this.isPaused) {
            const directionMap = {
                up: { dx: 0, dy: -1 },
                down: { dx: 0, dy: 1 },
                left: { dx: -1, dy: 0 },
                right: { dx: 1, dy: 0 }
            };
            
            const dir = directionMap[direction];
            if (dir && window.game.setDirection) {
                window.game.setDirection(dir.dx, dir.dy);
            }
        }
    }

    // Screen shake effect
    screenShake() {
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }

    // Responsive design helpers
    isMobile() {
        return window.innerWidth <= 768;
    }

    updateMobileControls() {
        if (this.isMobile()) {
            this.elements.mobileControls.style.display = 'block';
        } else {
            this.elements.mobileControls.style.display = 'none';
        }
    }

    // Initialize UI
    init() {
        this.selectMode('classic');
        this.updateHighScore(gameStorage.getHighScore());
        this.updateMobileControls();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateMobileControls();
        });
    }
}

// Create global UI instance
const gameUI = new GameUI();
