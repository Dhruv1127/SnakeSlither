// Audio System for Standalone Snake Game
class AudioSystem {
    constructor(settings) {
        this.settings = settings;
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.volume = settings.volume / 100;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Load sound effects
            const soundList = [
                'hit', 'success', 'background', 'whoosh', 
                'powerup', 'bite', 'speedboost', 'explosion', 'clash'
            ];
            
            for (const soundName of soundList) {
                await this.loadSound(soundName);
            }
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio system failed to initialize:', error);
        }
    }
    
    async loadSound(name) {
        try {
            const audio = new Audio(`assets/sounds/${name}.mp3`);
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            return new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => {
                    this.sounds[name] = audio;
                    console.log(`Loaded sound: ${name}`);
                    resolve();
                });
                
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load sound: ${name}`);
                    resolve(); // Don't reject to continue loading other sounds
                });
                
                // Start loading
                audio.load();
            });
        } catch (error) {
            console.warn(`Error loading sound ${name}:`, error);
        }
    }
    
    playSound(name) {
        if (!this.settings.soundEffects || this.isMuted || !this.sounds[name]) {
            return;
        }
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.volume;
            sound.play().catch(e => console.warn(`Failed to play sound ${name}:`, e));
        } catch (error) {
            console.warn(`Error playing sound ${name}:`, error);
        }
    }
    
    playBackgroundMusic() {
        if (!this.settings.backgroundMusic || this.isMuted || !this.sounds.background) {
            return;
        }
        
        try {
            this.backgroundMusic = this.sounds.background.cloneNode();
            this.backgroundMusic.volume = this.volume * 0.3; // Lower volume for background
            this.backgroundMusic.loop = true;
            this.backgroundMusic.play().catch(e => console.warn('Failed to play background music:', e));
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }
    
    resumeBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(e => console.warn('Failed to resume background music:', e));
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
    }
    
    setVolume(volume) {
        this.volume = volume / 100;
        
        // Update all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume * 0.3;
        }
    }
    
    mute() {
        this.isMuted = true;
        this.pauseBackgroundMusic();
    }
    
    unmute() {
        this.isMuted = false;
        if (this.settings.backgroundMusic) {
            this.resumeBackgroundMusic();
        }
    }
    
    toggle() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
}