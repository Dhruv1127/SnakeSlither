// Start Screen Animation - Epic Snake vs Laser Saber
class StartAnimation {
    constructor() {
        this.canvas = document.getElementById('start-animation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.phase = 'enter'; // enter, dodge, approach, bite, explosion, finish
        this.time = 0;
        this.onComplete = null;
        
        // Animation elements
        this.snake = {
            segments: [],
            headX: -50,
            headY: 200,
            targetX: 250,
            targetY: 200,
            speed: 2,
            segmentSize: 8,
            segmentSpacing: 12
        };
        
        // Make canvas full screen
        this.setupFullScreen();
        
        this.controller = {
            x: 400,
            y: 200,
            width: 120,
            height: 80,
            shake: 0,
            bitten: false
        };
        
        this.effects = {
            particles: [],
            cracks: [],
            biteFlash: 0,
            explosionParticles: [],
            fireParticles: [],
            screenShake: 0
        };
        
        // Laser saber - Glowing neon blue/green (random direction) - SLOWER SPEED
        this.laserSaber = {
            x: 0,
            y: 0,
            speed: 3, // Reduced from 8 to 3 for slower movement
            angle: 0,
            length: 200,
            active: false,
            color: '#00ffff', // Cyan
            coreColor: '#00ff88', // Neon green
            glowColor: '#4dd0e1', // Light cyan glow
            direction: { x: 0, y: 0 }, // Movement direction
            rotationSpeed: 0.1 // Also slower rotation
        };
        
        // Initialize snake segments after other properties are set
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                this.snake.segments.push({
                    x: this.snake.headX - (i * this.snake.segmentSpacing),
                    y: this.snake.headY + Math.sin(i * 0.3) * 5,
                    size: this.snake.segmentSize * (1 - i * 0.02)
                });
            }
        }, 0);
    }
    
    setupFullScreen() {
        // Make canvas full screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1000';
        
        // Update positions for full screen
        if (this.snake) {
            this.snake.headY = this.canvas.height / 2;
            this.snake.targetY = this.canvas.height / 2;
            this.snake.targetX = this.canvas.width - 350;
        }
        if (this.controller) {
            this.controller.x = this.canvas.width - 200;
            this.controller.y = this.canvas.height / 2;
        }
        if (this.laserSaber) {
            this.laserSaber.active = false; // Will be activated when needed
        }
    }
    
    start(onComplete) {
        this.onComplete = onComplete;
        this.phase = 'enter';
        this.time = 0;
        
        // Play start animation sound effects
        if (window.gameAudio) {
            window.gameAudio.playSound('whoosh'); // Snake entering
        }
        
        this.animate();
    }
    
    animate() {
        this.time += 0.016; // 60fps
        this.update();
        this.render();
        
        if (this.phase !== 'finished') {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            setTimeout(() => {
                if (this.onComplete) this.onComplete();
            }, 500);
        }
    }
    
    update() {
        switch (this.phase) {
            case 'enter':
                this.updateEnterPhase();
                break;
            case 'dodge':
                this.updateDodgePhase();
                break;
            case 'approach':
                this.updateApproachPhase();
                break;
            case 'bite':
                this.updateBitePhase();
                break;
            case 'explosion':
                this.updateExplosionPhase();
                break;
            case 'finish':
                this.updateFinishPhase();
                break;
        }
        
        this.updateLaserSaber();
        this.updateParticles();
        this.updateExplosionEffects();
        this.updateSnakeWave();
        this.updateScreenShake();
    }
    
    updateEnterPhase() {
        // Snake enters from left
        this.snake.headX += this.snake.speed;
        
        // Update snake body following head
        this.updateSnakeBody();
        
        if (this.snake.headX >= this.canvas.width * 0.3) {
            this.phase = 'dodge';
            this.snake.speed = 3;
            // Start laser saber attack from random direction
            this.initializeRandomSaber();
        }
    }
    
    updateDodgePhase() {
        if (this.laserSaber.active) {
            // Calculate distance to saber
            const dx = this.snake.headX - this.laserSaber.x;
            const dy = this.snake.headY - this.laserSaber.y;
            const saberDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (saberDistance < 150) {
                // Dodge by moving away from saber
                const dodgeAmplitude = 100;
                const dodgeAngle = Math.atan2(dy, dx); // Angle away from saber
                this.snake.headY += Math.sin(dodgeAngle) * dodgeAmplitude * 0.02;
                this.snake.headX += Math.cos(dodgeAngle) * dodgeAmplitude * 0.02;
                
                // Add dramatic evasive movement
                this.snake.headY += Math.sin(this.time * 15) * 60;
            } else {
                // Return to center position gradually
                this.snake.headY += (this.canvas.height / 2 - this.snake.headY) * 0.05;
            }
        }
        
        // Continue moving right while dodging
        this.snake.headX += this.snake.speed;
        this.updateSnakeBody();
        
        // Keep snake within bounds during dodge
        this.snake.headX = Math.max(50, Math.min(this.canvas.width - 200, this.snake.headX));
        this.snake.headY = Math.max(50, Math.min(this.canvas.height - 50, this.snake.headY));
        
        // Transition to approach when laser saber passes
        if (!this.laserSaber.active) {
            this.phase = 'approach';
            this.snake.speed = 2;
            this.snake.targetY = this.controller.y;
        }
    }
    
    updateApproachPhase() {
        // Slow approach to controller
        const dx = this.snake.targetX - this.snake.headX;
        const dy = this.snake.targetY - this.snake.headY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.snake.headX += (dx / distance) * this.snake.speed;
            this.snake.headY += (dy / distance) * this.snake.speed;
            this.updateSnakeBody();
        } else {
            this.phase = 'bite';
            this.snake.speed = 0;
        }
    }
    
    updateBitePhase() {
        // Bite animation
        this.controller.shake = Math.sin(this.time * 50) * 5;
        this.effects.biteFlash = Math.max(0, this.effects.biteFlash - 0.05);
        
        if (!this.controller.bitten) {
            this.controller.bitten = true;
            this.effects.biteFlash = 1;
            this.createBiteEffects();
            
            // Play bite sound effect
            if (window.gameAudio) {
                window.gameAudio.playSound('bite');
            }
            
            // Transition to explosion phase
            setTimeout(() => {
                this.phase = 'explosion';
                this.createExplosion();
                
                // Play explosion sound effect
                if (window.gameAudio) {
                    window.gameAudio.playSound('explosion');
                }
            }, 1000);
        }
    }
    
    updateExplosionPhase() {
        // Screen shake during explosion
        this.effects.screenShake = Math.max(0, this.effects.screenShake - 0.5);
        
        if (this.time > 4) {
            this.phase = 'finish';
        }
    }
    
    updateFinishPhase() {
        this.effects.biteFlash = Math.max(0, this.effects.biteFlash - 0.02);
        if (this.time > 3) {
            this.phase = 'finished';
        }
    }
    
    updateSnakeBody() {
        // Ensure snake and segments exist
        if (!this.snake || !this.snake.segments || this.snake.segments.length === 0) {
            return;
        }
        
        // Update head position first
        if (this.snake.segments[0]) {
            this.snake.segments[0].x = this.snake.headX;
            this.snake.segments[0].y = this.snake.headY;
        }
        
        // Smooth following movement for snake body
        for (let i = 1; i < this.snake.segments.length; i++) {
            const current = this.snake.segments[i];
            const target = this.snake.segments[i - 1];
            
            // Ensure both segments exist
            if (!current || !target) {
                continue;
            }
            
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.snake.segmentSpacing) {
                const ratio = (distance - this.snake.segmentSpacing) / distance;
                current.x += dx * ratio * 0.8;
                current.y += dy * ratio * 0.8;
            }
        }
    }
    
    updateSnakeWave() {
        // Add wave motion to snake body
        if (!this.snake || !this.snake.segments) {
            return;
        }
        
        for (let i = 1; i < this.snake.segments.length; i++) {
            const segment = this.snake.segments[i];
            if (segment) {
                const waveOffset = Math.sin(this.time * 3 + i * 0.5) * 3;
                segment.y += waveOffset * 0.1;
            }
        }
    }
    
    updateParticles() {
        // Update and remove old particles
        this.effects.particles = this.effects.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= 0.02;
            particle.size *= 0.99;
            return particle.life > 0;
        });
    }
    
    initializeRandomSaber() {
        // Random direction: 0=right, 1=top, 2=left, 3=bottom
        const directions = [
            { // From right
                x: this.canvas.width + 100,
                y: Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2,
                dx: -1, dy: 0
            },
            { // From top
                x: Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2,
                y: -100,
                dx: 0, dy: 1
            },
            { // From left
                x: -100,
                y: Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2,
                dx: 1, dy: 0
            },
            { // From bottom
                x: Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2,
                y: this.canvas.height + 100,
                dx: 0, dy: -1
            }
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        this.laserSaber.x = direction.x;
        this.laserSaber.y = direction.y;
        this.laserSaber.direction.x = direction.dx;
        this.laserSaber.direction.y = direction.dy;
        this.laserSaber.active = true;
        this.laserSaber.angle = Math.atan2(direction.dy, direction.dx);
    }
    
    updateLaserSaber() {
        if (this.laserSaber.active) {
            // Move in the specified direction
            this.laserSaber.x += this.laserSaber.direction.x * this.laserSaber.speed;
            this.laserSaber.y += this.laserSaber.direction.y * this.laserSaber.speed;
            this.laserSaber.angle += this.laserSaber.rotationSpeed;
            
            // Deactivate when off screen
            const margin = 300;
            if (this.laserSaber.x < -margin || this.laserSaber.x > this.canvas.width + margin ||
                this.laserSaber.y < -margin || this.laserSaber.y > this.canvas.height + margin) {
                this.laserSaber.active = false;
            }
        }
    }
    
    updateExplosionEffects() {
        // Update explosion particles
        this.effects.explosionParticles = this.effects.explosionParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= 0.01;
            particle.size *= 0.98;
            return particle.life > 0;
        });
        
        // Update fire particles
        this.effects.fireParticles = this.effects.fireParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.size *= 0.99;
            return particle.life > 0;
        });
    }
    
    updateScreenShake() {
        this.effects.screenShake = Math.max(0, this.effects.screenShake - 0.3);
    }
    
    createBiteEffects() {
        // Create particles when snake bites controller (NO RED CRACK LINES)
        for (let i = 0; i < 30; i++) {
            this.effects.particles.push({
                x: this.controller.x - 30,
                y: this.controller.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3,
                life: 1,
                color: `hsl(${Math.random() * 60 + 20}, 70%, 60%)`
            });
        }
        
        // REMOVED: Controller crack lines (red lines) as requested by user
        // No crack effects will be created
    }
    
    createExplosion() {
        // Create massive explosion effect
        this.effects.screenShake = 20;
        
        // Explosion particles
        for (let i = 0; i < 100; i++) {
            this.effects.explosionParticles.push({
                x: this.controller.x,
                y: this.controller.y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 15 + 5,
                life: 1,
                color: `hsl(${Math.random() * 60 + 10}, 90%, ${50 + Math.random() * 30}%)`
            });
        }
        
        // Fire particles covering screen
        for (let i = 0; i < 200; i++) {
            this.effects.fireParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                size: Math.random() * 20 + 10,
                life: 1,
                color: `hsl(${Math.random() * 40 + 10}, 90%, ${40 + Math.random() * 40}%)`
            });
        }
    }
    
    render() {
        this.ctx.save();
        
        // Apply screen shake
        if (this.effects.screenShake > 0) {
            this.ctx.translate(
                (Math.random() - 0.5) * this.effects.screenShake,
                (Math.random() - 0.5) * this.effects.screenShake
            );
        }
        
        // Clear canvas with space background
        this.renderSpaceBackground();
        
        // Render laser saber
        if (this.laserSaber.active) {
            this.renderLaserSaber();
        }
        
        // Render game controller
        this.renderController();
        
        // Render snake
        this.renderSnake();
        
        // Render effects
        this.renderEffects();
        
        // Render explosion effects
        this.renderExplosionEffects();
        
        // Render title if in finish phase
        if (this.phase === 'finish' || this.phase === 'finished') {
            this.renderTitle();
        }
        
        this.ctx.restore();
    }
    
    renderSpaceBackground() {
        // Space gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.5, '#000008');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add stars
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 241) % this.canvas.height;
            const size = Math.abs(Math.sin(i)) + 0.5; // Ensure positive radius, minimum 0.5
            if (size > 0) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    renderLaserSaber() {
        this.ctx.save();
        
        this.ctx.translate(this.laserSaber.x, this.laserSaber.y);
        this.ctx.rotate(this.laserSaber.angle);
        
        // Outer glow
        this.ctx.strokeStyle = this.laserSaber.glowColor;
        this.ctx.lineWidth = 20;
        this.ctx.shadowColor = this.laserSaber.glowColor;
        this.ctx.shadowBlur = 30;
        this.ctx.globalAlpha = 0.3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.laserSaber.length / 2);
        this.ctx.lineTo(0, this.laserSaber.length / 2);
        this.ctx.stroke();
        
        // Middle blade
        this.ctx.strokeStyle = this.laserSaber.color;
        this.ctx.lineWidth = 12;
        this.ctx.shadowBlur = 20;
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.laserSaber.length / 2);
        this.ctx.lineTo(0, this.laserSaber.length / 2);
        this.ctx.stroke();
        
        // Core blade
        this.ctx.strokeStyle = this.laserSaber.coreColor;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 10;
        this.ctx.globalAlpha = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.laserSaber.length / 2);
        this.ctx.lineTo(0, this.laserSaber.length / 2);
        this.ctx.stroke();
        
        // Saber handle
        this.ctx.fillStyle = '#333333';
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.fillRect(-8, -25, 16, 50);
        
        // Handle details
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        for (let i = -15; i <= 15; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(-6, i);
            this.ctx.lineTo(6, i);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    renderExplosionEffects() {
        // Render explosion particles
        this.effects.explosionParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Render fire particles
        this.effects.fireParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life * 0.7;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    renderController() {
        this.ctx.save();
        
        // Apply shake effect
        this.ctx.translate(this.controller.shake, this.controller.shake * 0.5);
        
        // Controller body
        this.ctx.fillStyle = '#333333';
        this.ctx.strokeStyle = '#555555';
        this.ctx.lineWidth = 2;
        
        const x = this.controller.x - this.controller.width / 2;
        const y = this.controller.y - this.controller.height / 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, this.controller.width, this.controller.height, 10);
        this.ctx.fill();
        this.ctx.stroke();
        
        // D-pad
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(x + 20, y + 25, 25, 8);
        this.ctx.fillRect(x + 28, y + 17, 8, 25);
        
        // Buttons
        this.ctx.fillStyle = '#444444';
        this.ctx.beginPath();
        this.ctx.arc(x + 80, y + 25, 8, 0, Math.PI * 2);
        this.ctx.arc(x + 95, y + 35, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // REMOVED: Crack rendering (red lines) as requested by user
        // Controller will show bite damage through particles and shake effects only
        
        this.ctx.restore();
    }
    
    renderSnake() {
        // Render snake body segments (back to front)
        for (let i = this.snake.segments.length - 1; i >= 0; i--) {
            const segment = this.snake.segments[i];
            const isHead = i === 0;
            
            this.ctx.fillStyle = isHead ? '#4CAF50' : '#2E7D32';
            this.ctx.shadowColor = '#4CAF50';
            this.ctx.shadowBlur = isHead ? 15 : 5;
            
            this.ctx.beginPath();
            this.ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw eyes on head
            if (isHead && this.phase !== 'enter') {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(segment.x - 3, segment.y - 2, 2, 0, Math.PI * 2);
                this.ctx.arc(segment.x - 3, segment.y + 2, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Fangs when biting
                if (this.phase === 'bite' || this.phase === 'finish') {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(segment.x - 8, segment.y - 1, 3, 6);
                    this.ctx.fillRect(segment.x - 8, segment.y - 3, 3, 6);
                }
            }
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    renderEffects() {
        // Render particles
        this.effects.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Render bite flash
        if (this.effects.biteFlash > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.effects.biteFlash * 0.3;
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }
    
    renderTitle() {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 30;
        
        const alpha = Math.min(1, (this.time - 3) * 3);
        this.ctx.globalAlpha = alpha;
        
        this.ctx.fillText('SNAKE VIPER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillText('Ready to Hunt!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.restore();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Create global instance when DOM is ready
function initStartAnimation() {
    try {
        const canvas = document.getElementById('start-animation-canvas');
        if (canvas) {
            window.startAnimation = new StartAnimation();
            console.log('Start animation initialized successfully');
        } else {
            console.error('Start animation canvas not found');
        }
    } catch (error) {
        console.error('Failed to initialize start animation:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStartAnimation);
} else {
    initStartAnimation();
}