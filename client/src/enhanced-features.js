// Enhanced Snake Features - Wave Motion, Growth, AI Integration
class EnhancedFeatures {
    static applyWaveMotion(ctx, x, y, index, amplitude = 5) {
        // Apply wave motion to snake segments
        const waveOffset = Math.sin(Date.now() * 0.003 + index * 0.3) * amplitude;
        return { x, y: y + waveOffset };
    }
    
    static enhanceSnakeGrowth(game, segments) {
        // Process growth queue for smooth growing
        if (game.growthQueue > 0 && segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            const newSegment = {
                x: lastSegment.x - 5,
                y: lastSegment.y,
                size: game.snakeSize * 0.8
            };
            segments.push(newSegment);
            game.growthQueue--;
        }
        return segments;
    }
    
    static updateGameWithAI(game, deltaTime) {
        // Enhanced game loop with AI integration
        if (game.aiSnake && game.isRunning) {
            game.aiSnake.update(deltaTime);
        }
    }
    
    static renderWithEnhancements(game) {
        // Enhanced rendering with all features
        game.renderBackground();
        game.renderObstacles();
        game.renderFood();
        
        // Render player snake with wave motion
        if (game.snake.length > 0) {
            game.ctx.save();
            
            for (let i = game.snake.length - 1; i >= 0; i--) {
                const segment = game.snake[i];
                const isHead = i === 0;
                const alpha = 1 - (i * 0.05);
                
                if (isHead) {
                    game.renderSnakeHead(segment.x, segment.y);
                } else {
                    // Apply wave motion
                    const wavePos = this.applyWaveMotion(game.ctx, segment.x, segment.y, i, game.waveAmplitude);
                    game.renderSnakeSegmentWithWave(wavePos.x, wavePos.y, alpha, i);
                }
            }
            
            game.ctx.restore();
        }
        
        // Render AI snake
        if (game.aiSnake) {
            game.aiSnake.render(game.ctx);
        }
        
        // Render particles
        game.particles.render();
    }
}

// Wait for SnakeGame to be defined before extending
function extendSnakeGame() {
    if (typeof SnakeGame === 'undefined') {
        setTimeout(extendSnakeGame, 50);
        return;
    }

// Extend SnakeGame with enhanced methods
SnakeGame.prototype.renderSnakeSegmentWithWave = function(x, y, alpha, index) {
    if (!isFinite(x) || !isFinite(y) || !isFinite(alpha)) return;
    
    const size = this.snakeSize * (0.8 + alpha * 0.2);
    
    this.ctx.fillStyle = this.getSnakeColor();
    this.ctx.globalAlpha = Math.max(0.3, alpha);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
};

SnakeGame.prototype.enhancedEatFood = function() {
    this.score += 10;
    gameUI.updateScore(this.score);
    
    // Enhanced growth mechanics
    this.growthQueue = (this.growthQueue || 0) + 3;
    this.waveAmplitude = Math.min(8, (this.waveAmplitude || 0) + 0.5);
    
    // Create enhanced particle explosion
    this.particles.createFoodExplosion(
        this.food.x, this.food.y, this.getFoodColor()
    );
    
    // Play sound effect
    gameAudio.playEatSound();
    
    // Generate new food
    this.generateFood();
    
    // Increase speed slightly
    if (this.gameMode === 'classic' && this.gameSpeed < 6) {
        this.gameSpeed += 0.1;
    }
    
    console.log(`Enhanced eating! Growth queue: ${this.growthQueue}, Wave: ${this.waveAmplitude}`);
};

SnakeGame.prototype.enhancedGameLoop = function(currentTime = 0) {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame((time) => this.enhancedGameLoop(time));
    
    const deltaTime = (currentTime - this.lastRenderTime) / 16.67;
    
    if (!this.isPaused) {
        this.update(deltaTime);
        
        // Update AI snake
        EnhancedFeatures.updateGameWithAI(this, deltaTime);
        
        // Process growth queue
        this.snake = EnhancedFeatures.enhanceSnakeGrowth(this, this.snake);
    }
    
    // Enhanced rendering
    EnhancedFeatures.renderWithEnhancements(this);
    this.lastRenderTime = currentTime;
};

// Global enhancement activator
window.activateEnhancements = function() {
    if (window.game) {
        // Replace eat food method
        window.game.eatFood = window.game.enhancedEatFood;
        
        // Replace game loop method  
        window.game.gameLoop = window.game.enhancedGameLoop;
        
        // Initialize enhanced properties
        window.game.growthQueue = 0;
        window.game.waveAmplitude = 2;
        
        console.log('Enhanced features activated!');
    }
};

}

// Start extending SnakeGame when script loads
extendSnakeGame();

console.log('Enhanced features loaded');