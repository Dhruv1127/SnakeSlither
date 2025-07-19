// Local Storage Management for Snake Game
class GameStorage {
    constructor() {
        this.keys = {
            highScore: 'snake-high-score',
            settings: 'snake-settings',
            stats: 'snake-stats'
        };
        
        this.defaultSettings = {
            speed: 'medium',
            gridSize: 'medium',
            theme: 'dark',
            controls: 'arrows',
            soundEnabled: true
        };
        
        this.defaultStats = {
            gamesPlayed: 0,
            totalScore: 0,
            bestTime: 0,
            longestSnake: 1
        };
    }

    // High Score Management
    getHighScore() {
        return parseInt(localStorage.getItem(this.keys.highScore) || '0');
    }

    setHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem(this.keys.highScore, score.toString());
            return true; // New high score
        }
        return false;
    }

    resetHighScore() {
        localStorage.removeItem(this.keys.highScore);
    }

    // Settings Management
    getSettings() {
        try {
            const stored = localStorage.getItem(this.keys.settings);
            return stored ? {...this.defaultSettings, ...JSON.parse(stored)} : this.defaultSettings;
        } catch (error) {
            console.warn('Error loading settings:', error);
            return this.defaultSettings;
        }
    }

    setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    }

    saveSettings(settings) {
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    }

    // Stats Management
    getStats() {
        try {
            const stored = localStorage.getItem(this.keys.stats);
            return stored ? {...this.defaultStats, ...JSON.parse(stored)} : this.defaultStats;
        } catch (error) {
            console.warn('Error loading stats:', error);
            return this.defaultStats;
        }
    }

    updateStats(gameData) {
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.totalScore += gameData.score || 0;
        
        if (gameData.snakeLength > stats.longestSnake) {
            stats.longestSnake = gameData.snakeLength;
        }
        
        if (gameData.gameTime && gameData.gameTime > stats.bestTime) {
            stats.bestTime = gameData.gameTime;
        }
        
        localStorage.setItem(this.keys.stats, JSON.stringify(stats));
    }

    // Speed Settings
    getSpeedValue(speedSetting) {
        const speeds = {
            slow: 120,
            medium: 150,
            fast: 200
        };
        return speeds[speedSetting] || speeds.medium;
    }

    // Grid Size Settings
    getGridSizeValue(gridSetting) {
        const sizes = {
            small: 15,
            medium: 20,
            large: 25
        };
        return sizes[gridSetting] || sizes.medium;
    }

    // Canvas Size Settings
    getCanvasSize(gridSetting) {
        const gridSize = this.getGridSizeValue(gridSetting);
        const gridCount = 20; // 20x20 grid
        return gridSize * gridCount;
    }

    // Theme Management
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Export/Import Settings (for advanced users)
    exportSettings() {
        return {
            settings: this.getSettings(),
            highScore: this.getHighScore(),
            stats: this.getStats()
        };
    }

    importSettings(data) {
        try {
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            if (data.highScore) {
                localStorage.setItem(this.keys.highScore, data.highScore.toString());
            }
            if (data.stats) {
                localStorage.setItem(this.keys.stats, JSON.stringify(data.stats));
            }
            return true;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Migration helper for future updates
    migrate() {
        const version = localStorage.getItem('snake-version');
        if (!version) {
            // First time user or legacy user
            localStorage.setItem('snake-version', '1.0');
        }
        // Future migrations can be added here
    }
}

// Create global storage instance
const gameStorage = new GameStorage();

// Initialize migration on load
gameStorage.migrate();
