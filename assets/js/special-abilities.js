// Special Abilities System for Dragon Ball Z Snake Game
class SpecialAbilities {
    constructor(game) {
        this.game = game;
        this.speedBoostActive = false;
        this.speedBoostCooldown = 0;
        this.speedBoostDuration = 2000; // 2 seconds
        this.speedBoostCooldownTime = 5000; // 5 seconds
        this.speedMultiplier = 1;
        
        this.powerBallCooldown = 0;
        this.powerBallCooldownTime = 1000; // 1 second
        this.powerBalls = [];
        
        console.log('Special abilities system initialized');
    }
    
    update(deltaTime) {
        this.updateCooldowns(deltaTime);
        this.updatePowerBalls(deltaTime);
    }
    
    updateCooldowns(deltaTime) {
        const deltaMs = deltaTime * 1000;
        
        if (this.speedBoostCooldown > 0) {
            this.speedBoostCooldown -= deltaMs;
        }
        
        if (this.powerBallCooldown > 0) {
            this.powerBallCooldown -= deltaMs;
        }
    }
    
    updatePowerBalls(deltaTime) {
        for (let i = this.powerBalls.length - 1; i >= 0; i--) {
            const powerBall = this.powerBalls[i];
            
            // Move power ball
            powerBall.x += powerBall.vx * deltaTime * 300;
            powerBall.y += powerBall.vy * deltaTime * 300;
            
            // Create trail particles
            if (this.game.particles) {
                this.game.particles.createPowerBallTrail(powerBall.x, powerBall.y);
            }
            
            // Check bounds
            if (powerBall.x < 0 || powerBall.x > this.game.canvasSize ||
                powerBall.y < 0 || powerBall.y > this.game.canvasSize) {
                this.powerBalls.splice(i, 1);
                continue;
            }
            
            // Check collision with AI snake
            if (this.game.aiSnake && this.game.aiSnake.segments) {
                for (let segment of this.game.aiSnake.segments) {
                    if (!segment) continue;
                    
                    const distance = Math.sqrt(
                        (powerBall.x - segment.x) ** 2 + (powerBall.y - segment.y) ** 2
                    );
                    
                    if (distance < powerBall.size + this.game.aiSnake.segmentSize) {
                        // Hit!
                        console.log('Power Ball hit Vegeta! Starting regeneration...');
                        this.game.audioSystem.playSound('explosion');
                        
                        if (this.game.particles) {
                            this.game.particles.createExplosion(powerBall.x, powerBall.y, 2);
                        }
                        
                        this.game.aiSnake.takeDamage();
                        this.powerBalls.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
    activateSpeedBoost() {
        if (this.speedBoostCooldown > 0 || this.speedBoostActive) {
            return false;
        }
        
        console.log('Goku Speed Boost activated!');
        this.speedBoostActive = true;
        this.speedMultiplier = 2.5;
        this.speedBoostCooldown = this.speedBoostCooldownTime;
        
        // Play sound effect
        this.game.audioSystem.playSound('speedboost');
        
        // Create visual effect
        if (this.game.particles && this.game.snake.length > 0) {
            const head = this.game.snake[0];
            this.game.particles.createSpeedBoostEffect(head.x, head.y);
        }
        
        // Deactivate after duration
        setTimeout(() => {
            this.speedBoostActive = false;
            this.speedMultiplier = 1;
            console.log('Speed boost ended');
        }, this.speedBoostDuration);
        
        return true;
    }
    
    launchPowerBall() {
        if (this.powerBallCooldown > 0 || this.game.snake.length === 0) {
            return false;
        }
        
        const head = this.game.snake[0];
        const powerBall = {
            x: head.x,
            y: head.y,
            vx: Math.cos(this.game.direction),
            vy: Math.sin(this.game.direction),
            size: 6,
            color: '#00ffff'
        };
        
        this.powerBalls.push(powerBall);
        this.powerBallCooldown = this.powerBallCooldownTime;
        
        console.log('Goku launched Power Ball!');
        this.game.audioSystem.playSound('whoosh');
        
        return true;
    }
    
    isSpeedBoostActive() {
        return this.speedBoostActive;
    }
    
    getSpeedMultiplier() {
        return this.speedMultiplier;
    }
    
    canUseSpeedBoost() {
        return this.speedBoostCooldown <= 0 && !this.speedBoostActive;
    }
    
    canUsePowerBall() {
        return this.powerBallCooldown <= 0;
    }
    
    getSpeedBoostCooldown() {
        return Math.max(0, this.speedBoostCooldown);
    }
    
    getPowerBallCooldown() {
        return Math.max(0, this.powerBallCooldown);
    }
    
    renderPowerBalls(ctx) {
        if (!ctx) return;
        
        ctx.save();
        
        for (const powerBall of this.powerBalls) {
            // Main power ball
            ctx.fillStyle = powerBall.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(powerBall.x, powerBall.y, powerBall.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Inner glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(powerBall.x, powerBall.y, powerBall.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    render() {
        if (this.game.ctx) {
            this.renderPowerBalls(this.game.ctx);
        }
    }
    
    reset() {
        this.speedBoostActive = false;
        this.speedBoostCooldown = 0;
        this.speedMultiplier = 1;
        this.powerBallCooldown = 0;
        this.powerBalls = [];
    }
}