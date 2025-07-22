// Chrome-Optimized Rendering Functions for Snake Game
class ChromeRenderer {
    static enhanceGameRendering(game) {
        // Override the main render function for Chrome compatibility
        const originalRender = game.render.bind(game);
        
        game.render = function() {
            if (!this.ctx || !this.canvas) return;
            
            // Force Chrome canvas update
            this.ctx.save();
            
            // Clear with explicit dimensions
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Solid background for visibility
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Render all game elements with enhanced visibility
            ChromeRenderer.renderFood(this);
            ChromeRenderer.renderSnake(this);
            ChromeRenderer.renderObstacles(this);
            
            // Render AI snake
            if (this.aiSnake) {
                this.aiSnake.render(this.ctx);
            }
            
            this.ctx.restore();
            
            // Force canvas update
            this.canvas.style.transform = 'translateZ(0)';
        };
    }
    
    static renderSnake(game) {
        if (!game.snake || game.snake.length === 0) return;
        
        game.ctx.save();
        
        for (let i = 0; i < game.snake.length; i++) {
            const segment = game.snake[i];
            if (!segment || !isFinite(segment.x) || !isFinite(segment.y)) continue;
            
            const isHead = i === 0;
            const size = isHead ? Math.max(8, game.snakeSize * 1.2) : Math.max(6, game.snakeSize);
            
            // High contrast colors for Chrome
            if (isHead) {
                // Head - bright green with white outline
                game.ctx.fillStyle = '#00ff00';
                game.ctx.strokeStyle = '#ffffff';
                game.ctx.lineWidth = 2;
            } else {
                // Body - darker green with visible outline
                game.ctx.fillStyle = '#4CAF50';
                game.ctx.strokeStyle = '#ffffff';
                game.ctx.lineWidth = 1;
            }
            
            game.ctx.beginPath();
            game.ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
            game.ctx.fill();
            game.ctx.stroke();
            
            // Add eyes to head for visibility
            if (isHead) {
                game.ctx.fillStyle = '#000000';
                const eyeSize = size * 0.15;
                const eyeOffset = size * 0.3;
                
                game.ctx.beginPath();
                game.ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                game.ctx.fill();
                
                game.ctx.beginPath();
                game.ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                game.ctx.fill();
            }
        }
        
        game.ctx.restore();
    }
    
    static renderFood(game) {
        if (!game.food || !isFinite(game.food.x) || !isFinite(game.food.y)) return;
        
        game.ctx.save();
        
        const size = Math.max(8, game.foodSize * 1.5);
        
        // Bright red food with white outline
        game.ctx.fillStyle = '#ff0000';
        game.ctx.strokeStyle = '#ffffff';
        game.ctx.lineWidth = 2;
        
        game.ctx.beginPath();
        game.ctx.arc(game.food.x, game.food.y, size, 0, Math.PI * 2);
        game.ctx.fill();
        game.ctx.stroke();
        
        // Add inner circle for visibility
        game.ctx.fillStyle = '#ffaaaa';
        game.ctx.beginPath();
        game.ctx.arc(game.food.x, game.food.y, size * 0.5, 0, Math.PI * 2);
        game.ctx.fill();
        
        game.ctx.restore();
    }
    
    static renderObstacles(game) {
        if (!game.obstacles || game.obstacles.length === 0) return;
        
        game.ctx.save();
        
        for (let obstacle of game.obstacles) {
            if (!obstacle || !isFinite(obstacle.x) || !isFinite(obstacle.y)) continue;
            
            // Gray obstacles with white outline
            game.ctx.fillStyle = '#666666';
            game.ctx.strokeStyle = '#ffffff';
            game.ctx.lineWidth = 1;
            
            game.ctx.beginPath();
            game.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            game.ctx.fill();
            game.ctx.stroke();
        }
        
        game.ctx.restore();
    }
    
    static optimizeCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        
        // Chrome-specific optimizations
        ctx.imageSmoothingEnabled = false; // Better for pixel art style
        canvas.style.imageRendering = 'pixelated';
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        
        // Force hardware acceleration
        canvas.style.transform = 'translateZ(0)';
        canvas.style.willChange = 'transform';
        
        return ctx;
    }
}

// Auto-apply Chrome rendering when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.game) {
            ChromeRenderer.enhanceGameRendering(window.game);
            ChromeRenderer.optimizeCanvas(window.game.canvas);
        }
    });
} else {
    setTimeout(() => {
        if (window.game) {
            ChromeRenderer.enhanceGameRendering(window.game);
            ChromeRenderer.optimizeCanvas(window.game.canvas);
        }
    }, 100);
}

console.log('Chrome rendering optimizations loaded');