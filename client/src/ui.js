// UI Management for Snake Game
class GameUI {
    constructor() {
        this.elements = this.getElements();
        this.currentMode = 'classic';
        this.selectedMode = 'classic';
        this.selectedLevel = 1;
        this.isSettingsOpen = false;
        this.isPaused = false;
        
        this.bindEvents();
        this.loadSettings();
    }

    getElements() {
        return {
            // Screens
            homeScreen: document.getElementById('home-screen'),
            modeScreen: document.getElementById('mode-screen'),
            levelScreen: document.getElementById('level-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            settingsModal: document.getElementById('settings-modal'),
            
            // Game Info
            score: document.getElementById('score'),
            vegetaScore: document.getElementById('vegeta-score'),
            highScore: document.getElementById('high-score'),
            gameMode: document.getElementById('game-mode'),
            timer: document.getElementById('timer'),
            
            // Buttons
            playBtn: document.getElementById('play-btn'),
            quitBtn: document.getElementById('quit-btn'),
            settingsHomeBtn: document.getElementById('settings-home-btn'),
            backToHomeBtn: document.getElementById('back-to-home-btn'),
            continueToLevelsBtn: document.getElementById('continue-to-levels-btn'),
            backToModesBtn: document.getElementById('back-to-modes-btn'),
            startGameBtn: document.getElementById('start-game-btn'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resumeBtn: document.getElementById('resume-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            closeSettingsBtn: document.getElementById('close-settings-btn'),
            soundBtn: document.getElementById('sound-btn'),
            resetHighScoreBtn: document.getElementById('reset-high-score-btn'),
            
            // Mode and level buttons
            modeButtons: document.querySelectorAll('.mode-btn'),
            levelButtons: document.querySelectorAll('.level-btn'),
            levelScreenTitle: document.getElementById('level-screen-title'),
            
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
        // Home screen buttons
        this.elements.playBtn.addEventListener('click', () => this.showModeScreen());
        this.elements.quitBtn.addEventListener('click', () => this.quitGame());
        this.elements.settingsHomeBtn.addEventListener('click', () => this.openSettings());

        // Navigation buttons
        this.elements.backToHomeBtn.addEventListener('click', () => this.showHomeScreen());
        this.elements.continueToLevelsBtn.addEventListener('click', () => this.showLevelScreen());
        this.elements.backToModesBtn.addEventListener('click', () => this.showModeScreen());

        // Mode selection
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectMode(btn.dataset.mode);
            });
        });

        // Level selection
        this.elements.levelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectLevel(parseInt(btn.dataset.level));
            });
        });

        // Game control buttons
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.menuBtn.addEventListener('click', () => this.showHomeScreen());
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

        // Enable continue button
        this.elements.continueToLevelsBtn.disabled = false;

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

    selectLevel(level) {
        this.selectedLevel = level;
        
        // Update button selection
        this.elements.levelButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.level) === level) {
                btn.classList.add('selected');
            }
        });

        // Enable start game button
        this.elements.startGameBtn.disabled = false;
    }

    showHomeScreen() {
        this.hideAllScreens();
        this.elements.homeScreen.style.display = 'flex';
    }

    showModeScreen() {
        this.hideAllScreens();
        this.elements.modeScreen.style.display = 'flex';
        // Reset selections
        this.elements.continueToLevelsBtn.disabled = true;
        this.elements.modeButtons.forEach(btn => btn.classList.remove('selected'));
    }

    showLevelScreen() {
        if (!this.selectedMode) return;
        
        this.hideAllScreens();
        this.elements.levelScreen.style.display = 'flex';
        
        // Update level descriptions based on mode
        this.updateLevelDescriptions();
        
        // Reset level selection
        this.elements.startGameBtn.disabled = true;
        this.elements.levelButtons.forEach(btn => btn.classList.remove('selected'));
    }

    updateLevelDescriptions() {
        const descriptions = {
            classic: {
                1: 'Slow speed, easy gameplay',
                2: 'Medium speed, balanced',
                3: 'Fast speed, challenging'
            },
            timeattack: {
                1: '60 seconds to score',
                2: '45 seconds challenge',
                3: '30 seconds sprint'
            },
            obstacle: {
                1: 'Few obstacles, easier',
                2: 'More obstacles',
                3: 'Many obstacles, expert'
            }
        };

        const modeDescriptions = descriptions[this.selectedMode] || descriptions.classic;
        
        document.getElementById('level-1-desc').textContent = modeDescriptions[1];
        document.getElementById('level-2-desc').textContent = modeDescriptions[2];
        document.getElementById('level-3-desc').textContent = modeDescriptions[3];
        
        this.elements.levelScreenTitle.textContent = `🐍 ${this.selectedMode.charAt(0).toUpperCase() + this.selectedMode.slice(1)} - Choose Level`;
    }

    hideAllScreens() {
        this.elements.homeScreen.style.display = 'none';
        this.elements.modeScreen.style.display = 'none';
        this.elements.levelScreen.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.elements.pauseScreen.style.display = 'none';
    }

    quitGame() {
        if (confirm('Are you sure you want to quit Snake Viper?')) {
            window.close();
        }
    }

    startGame() {
        this.hideAllScreens();
        if (window.game && this.selectedMode && this.selectedLevel) {
            window.game.start(this.selectedMode, this.selectedLevel);
        }
    }

    restartGame() {
        this.hideScreen('gameOver');
        if (window.game) {
            window.game.restart();
        }
    }

    showMainMenu() {
        this.hideAllScreens();
        this.showHomeScreen();
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
            home: this.elements.homeScreen,
            mode: this.elements.modeScreen,
            level: this.elements.levelScreen,
            gameOver: this.elements.gameOverScreen,
            pause: this.elements.pauseScreen
        };
        
        if (screens[screen]) {
            screens[screen].style.display = 'flex';
        }
    }

    hideScreen(screen) {
        const screens = {
            home: this.elements.homeScreen,
            mode: this.elements.modeScreen,
            level: this.elements.levelScreen,
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
        this.elements.score.textContent = `Son Goku: ${score || 0}`;
    }

    updateVegetaScore(score) {
        this.elements.vegetaScore.textContent = `Vegeta: ${score || 0}`;
    }

    updateHighScore(highScore) {
        this.elements.highScore.textContent = `High Score: ${highScore}`;
    }

    updateTimer(timeLeft) {
        this.elements.timer.textContent = `Time: ${timeLeft}s`;
    }

    showGameOver(gameData) {
        // Force stop any running game first
        if (window.game) {
            window.game.isRunning = false;
        }
        
        // Ensure gameData exists and has required properties
        const data = gameData || {};
        const score = data.score || 0;
        const reason = data.reason || '';
        
        console.log('ShowGameOver called with reason:', reason);
        
        const isNewHighScore = gameStorage.setHighScore(score);
        
        this.elements.finalScore.textContent = score;
        this.elements.highScoreMsg.style.display = isNewHighScore ? 'block' : 'none';
        
        // Custom title for collision
        if (reason.includes('Vegeta') || reason.includes('Collided with Vegeta')) {
            this.elements.gameOverTitle.textContent = 'Collision with Vegeta!';
        } else if (reason.includes('Hit wall')) {
            this.elements.gameOverTitle.textContent = 'Hit the Wall!';
        } else if (reason.includes('Hit self')) {
            this.elements.gameOverTitle.textContent = 'Hit Yourself!';
        } else if (reason.includes('Hit obstacle')) {
            this.elements.gameOverTitle.textContent = 'Hit Obstacle!';
        } else if (data.mode === 'timeattack') {
            this.elements.gameOverTitle.textContent = 'Time\'s Up!';
        } else {
            this.elements.gameOverTitle.textContent = 'Game Over!';
        }
        
        // Force hide all other screens first
        this.hideAllScreens();
        
        // Update high score and show game over screen
        this.updateHighScore(gameStorage.getHighScore());
        
        // Force display the game over screen
        this.elements.gameOverScreen.style.display = 'flex';
        this.elements.gameOverScreen.style.zIndex = '1000';
        
        console.log('Game over screen should be visible now');
        
        // Update stats with safe data
        if (data.score !== undefined) {
            gameStorage.updateStats(data);
        }
        
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
        this.showHomeScreen();
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
