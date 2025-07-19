// Audio Management for Snake Game
class GameAudio {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.5;
        this.backgroundMusic = null;
        this.isInitialized = false;
        this.audioContext = null;
        
        // Initialize audio when user first interacts
        this.pendingInit = true;
        
        // Sound file paths
        this.soundPaths = {
            background: '/sounds/background.mp3',
            hit: '/sounds/hit.mp3',
            success: '/sounds/success.mp3',
            // New sound effects for enhanced gameplay
            whoosh: '/sounds/hit.mp3', // Reuse for swoosh sounds
            bite: '/sounds/hit.mp3', // Controller bite sound
            explosion: '/sounds/hit.mp3', // Explosion sound
            powerup: '/sounds/success.mp3', // Power ball sound
            speedboost: '/sounds/success.mp3', // Speed boost sound
            clash: '/sounds/hit.mp3' // Power ball clash sound
        };
    }

    async initializeAudio() {
        if (this.isInitialized) return;
        
        try {
            // Create audio context for better control
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load all sound effects
            await this.loadSounds();
            
            this.isInitialized = true;
            this.pendingInit = false;
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.isEnabled = false;
        }
    }

    async loadSounds() {
        const loadPromises = Object.entries(this.soundPaths).map(async ([key, path]) => {
            try {
                const audio = new Audio(path);
                audio.preload = 'auto';
                audio.volume = this.volume;
                
                // Wait for the audio to be ready
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve);
                    audio.addEventListener('error', reject);
                    audio.load();
                });
                
                this.sounds[key] = audio;
                console.log(`Loaded sound: ${key}`);
            } catch (error) {
                console.warn(`Failed to load sound ${key}:`, error);
                // Create a silent audio object as fallback
                this.sounds[key] = { play: () => {}, pause: () => {}, currentTime: 0 };
            }
        });

        await Promise.all(loadPromises);
    }

    // Initialize audio on first user interaction
    async handleFirstInteraction() {
        if (this.pendingInit) {
            await this.initializeAudio();
        }
    }

    // Play sound effect
    playSound(soundName, options = {}) {
        if (!this.isEnabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            
            // Clone the sound for overlapping playback
            const soundClone = sound.cloneNode();
            soundClone.volume = (options.volume || 1) * this.volume;
            
            if (options.loop) {
                soundClone.loop = true;
            }
            
            soundClone.play().catch(error => {
                console.warn(`Error playing sound ${soundName}:`, error);
            });
            
            return soundClone;
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    // Specific game sound methods
    playEatSound() {
        this.playSound('success', { volume: 0.7 });
    }

    playGameOverSound() {
        this.playSound('hit', { volume: 0.8 });
    }

    playBackgroundMusic() {
        if (!this.isEnabled || !this.sounds.background) return;
        
        try {
            this.backgroundMusic = this.sounds.background;
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.volume * 0.3; // Lower volume for background
            this.backgroundMusic.play().catch(error => {
                console.warn('Error playing background music:', error);
            });
        } catch (error) {
            console.warn('Error starting background music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
    }

    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Error resuming background music:', error);
            });
        }
    }

    // Volume control
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all loaded sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound.volume !== undefined) {
                sound.volume = this.volume;
            }
        });
        
        // Update background music volume
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume * 0.3;
        }
    }

    // Enable/disable audio
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled) {
            this.stopBackgroundMusic();
        } else if (enabled && this.backgroundMusic) {
            this.playBackgroundMusic();
        }
        
        // Save setting
        gameStorage.setSetting('soundEnabled', enabled);
    }

    toggleEnabled() {
        this.setEnabled(!this.isEnabled);
        return this.isEnabled;
    }

    // Web Audio API effects (optional enhancement)
    createOscillatorSound(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.isEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error creating oscillator sound:', error);
        }
    }

    // Retro-style sound effects
    playRetroEat() {
        this.createOscillatorSound(800, 0.1, 'square');
    }

    playRetroMove() {
        this.createOscillatorSound(200, 0.05, 'square');
    }

    playRetroGameOver() {
        // Descending tone sequence
        setTimeout(() => this.createOscillatorSound(400, 0.2, 'sawtooth'), 0);
        setTimeout(() => this.createOscillatorSound(300, 0.2, 'sawtooth'), 200);
        setTimeout(() => this.createOscillatorSound(200, 0.3, 'sawtooth'), 400);
    }

    // Clean up
    dispose() {
        this.stopBackgroundMusic();
        
        Object.values(this.sounds).forEach(sound => {
            if (sound.pause) sound.pause();
        });
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create global audio instance
const gameAudio = new GameAudio();

// Initialize audio on first user interaction
document.addEventListener('click', () => gameAudio.handleFirstInteraction(), { once: true });
document.addEventListener('keydown', () => gameAudio.handleFirstInteraction(), { once: true });
document.addEventListener('touchstart', () => gameAudio.handleFirstInteraction(), { once: true });
