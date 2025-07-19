// Special Abilities System for Dragon Ball Z Snake Game
class SpecialAbilities {
    constructor(game) {
        this.game = game;
        
        // Goku abilities
        this.gokuAbilities = {
            speedBoost: {
                active: false,
                duration: 0,
                maxDuration: 120, // 2 seconds at 60fps
                multiplier: 2.5,
                cooldown: 0,
                maxCooldown: 300, // 5 seconds
                activations: 0
            },
            powerBall: {
                x: 0, y: 0,
                vx: 0, vy: 0,
                active: false,
                size: 8,
                energy: 100,
                cooldown: 0,
                maxCooldown: 180, // 3 seconds
                trail: []
            }
        };
        
        // Vegeta abilities
        this.vegetaAbilities = {
            powerBall: {
                x: 0, y: 0,
                vx: 0, vy: 0,
                active: false,
                size: 8,
                energy: 100,
                cooldown: 0,
                maxCooldown: 180,
                trail: []
            },
            aggressiveMode: {
                active: false,
                duration: 0,
                maxDuration: 180, // 3 seconds
                speedMultiplier: 1.8,
                cooldown: 0,
                maxCooldown: 240 // 4 seconds
            }
        };
    }
    
    // Goku Special Abilities
    activateGokuSpeedBoost() {
        const speedBoost = this.gokuAbilities.speedBoost;
        
        if (speedBoost.cooldown > 0) {
            console.log('Speed boost on cooldown');
            return;
        }
        
        speedBoost.active = true;
        speedBoost.duration = speedBoost.maxDuration;
        speedBoost.cooldown = speedBoost.maxCooldown;
        speedBoost.activations++;
        
        // Notify Vegeta AI that Goku used an ability (this counts as a dodge action)
        if (this.game.aiSnake && this.game.aiSnake.onGokuDodge) {
            this.game.aiSnake.onGokuDodge();
        }
        
        // Play sound effect
        if (window.gameAudio) {
            window.gameAudio.playSound('speedboost');
        }
        
        // Create visual effect
        if (this.game.particles && this.game.snake.length > 0) {
            this.game.particles.createSpeedBoostEffect(this.game.snake[0].x, this.game.snake[0].y);
        }
        
        console.log('Goku Speed Boost Activated!', { duration: speedBoost.duration });
    }
    
    launchGokuPowerBall() {
        const powerBall = this.gokuAbilities.powerBall;
        
        if (powerBall.cooldown > 0 || powerBall.active) {
            console.log('Power ball on cooldown or already active');
            return;
        }
        
        const head = this.game.snake[0];
        powerBall.x = head.x;
        powerBall.y = head.y;
        powerBall.vx = Math.cos(this.game.direction) * 8;
        powerBall.vy = Math.sin(this.game.direction) * 8;
        powerBall.active = true;
        powerBall.energy = 100;
        powerBall.cooldown = powerBall.maxCooldown;
        powerBall.trail = [];
        
        // Notify Vegeta AI that Goku used an ability
        if (this.game.aiSnake && this.game.aiSnake.onGokuDodge) {
            this.game.aiSnake.onGokuDodge();
        }
        
        // Play sound effect
        if (window.gameAudio) {
            window.gameAudio.playSound('powerup');
        }
        
        console.log('Goku Power Ball Launched!');
    }
    
    // Update Methods
    updateGokuAbilities(deltaTime) {
        const speedBoost = this.gokuAbilities.speedBoost;
        const powerBall = this.gokuAbilities.powerBall;
        
        // Update speed boost
        if (speedBoost.active) {
            speedBoost.duration -= deltaTime;
            if (speedBoost.duration <= 0) {
                speedBoost.active = false;
                console.log('Speed boost ended');
            }
        }
        
        if (speedBoost.cooldown > 0) {
            speedBoost.cooldown -= deltaTime;
        }
        
        // Update power ball
        if (powerBall.active) {
            powerBall.x += powerBall.vx * deltaTime;
            powerBall.y += powerBall.vy * deltaTime;
            
            // Add trail
            powerBall.trail.push({ x: powerBall.x, y: powerBall.y, alpha: 1 });
            if (powerBall.trail.length > 8) {
                powerBall.trail.shift();
            }
            
            // Check bounds
            if (powerBall.x < 0 || powerBall.x > this.game.canvasSize || 
                powerBall.y < 0 || powerBall.y > this.game.canvasSize) {
                powerBall.active = false;
            }
            
            // Check collision with Vegeta AI
            if (this.game.aiSnake && this.game.aiSnake.snake.length > 0) {
                const vegetaHead = this.game.aiSnake.snake[0];
                const distance = Math.sqrt(
                    Math.pow(powerBall.x - vegetaHead.x, 2) + 
                    Math.pow(powerBall.y - vegetaHead.y, 2)
                );
                
                if (distance < 20) {
                    // Power ball hit Vegeta!
                    this.handlePowerBallHit(powerBall, vegetaHead);
                    powerBall.active = false;
                }
            }
        }
        
        if (powerBall.cooldown > 0) {
            powerBall.cooldown -= deltaTime;
        }
    }
    
    updateVegetaAbilities(deltaTime) {
        const vegeta = this.vegetaAbilities;
        
        // Update Vegeta's aggressive mode
        if (vegeta.aggressiveMode.active) {
            vegeta.aggressiveMode.duration -= deltaTime;
            if (vegeta.aggressiveMode.duration <= 0) {
                vegeta.aggressiveMode.active = false;
            }
        }
        
        if (vegeta.aggressiveMode.cooldown > 0) {
            vegeta.aggressiveMode.cooldown -= deltaTime;
        }
        
        // Auto-activate Vegeta abilities based on AI logic
        if (this.game.aiSnake && Math.random() < 0.002) { // 0.2% chance per frame
            this.activateVegetaAbilities();
        }
    }
    
    activateVegetaAbilities() {
        const vegeta = this.vegetaAbilities;
        
        // Activate aggressive mode
        if (vegeta.aggressiveMode.cooldown <= 0) {
            vegeta.aggressiveMode.active = true;
            vegeta.aggressiveMode.duration = vegeta.aggressiveMode.maxDuration;
            vegeta.aggressiveMode.cooldown = vegeta.aggressiveMode.maxCooldown;
            
            console.log('Vegeta Aggressive Mode Activated!');
        }
    }
    
    handlePowerBallHit(powerBall, target) {
        // Create explosion effect
        if (this.game.particles) {
            this.game.particles.createExplosionEffect(target.x, target.y, '#00f5ff');
        }
        
        // Play clash sound
        if (window.gameAudio) {
            window.gameAudio.playSound('clash');
        }
        
        // Damage Vegeta (remove some segments)
        if (this.game.aiSnake && this.game.aiSnake.snake.length > 3) {
            this.game.aiSnake.snake.splice(-2, 2); // Remove 2 tail segments
            console.log('Power ball hit Vegeta! Segments removed.');
        }
    }
    
    // Render Methods
    renderSpecialAbilities(ctx) {
        // Render Goku's power ball
        const powerBall = this.gokuAbilities.powerBall;
        if (powerBall.active) {
            ctx.save();
            
            // Render trail
            for (let i = 0; i < powerBall.trail.length; i++) {
                const trail = powerBall.trail[i];
                const alpha = (i / powerBall.trail.length) * 0.6;
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#00f5ff';
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, powerBall.size * (i / powerBall.trail.length), 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Render power ball
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#00f5ff';
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(powerBall.x, powerBall.y, powerBall.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Render speed boost effect
        if (this.gokuAbilities.speedBoost.active && this.game.snake.length > 0) {
            const head = this.game.snake[0];
            ctx.save();
            
            const pulse = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillStyle = '#ffdf00';
            ctx.shadowColor = '#ffdf00';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(head.x, head.y, this.game.snakeSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Color modification methods
    getGokuColor() {
        // Son Goku colors - Golden/Orange for normal, with speed boost glow
        if (this.gokuAbilities.speedBoost.active) {
            return '#ffdf00'; // Golden Super Saiyan glow
        }
        return '#ff8f00'; // Orange base color
    }
    
    getGokuHeadColor() {
        // Son Goku head with special ability indicators
        if (this.gokuAbilities.speedBoost.active) {
            return '#fff59d'; // Bright golden head during speed boost
        }
        return '#ffb300'; // Orange-gold base
    }
    
    // Get current speed multiplier
    getSpeedMultiplier() {
        let multiplier = 1;
        
        if (this.gokuAbilities.speedBoost.active) {
            multiplier *= this.gokuAbilities.speedBoost.multiplier;
        }
        
        return multiplier;
    }
}

// Make it globally accessible
window.SpecialAbilities = SpecialAbilities;