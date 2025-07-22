// Microsoft Edge Compatibility Fixes for Snake Slither Game
// Applies specific fixes for rendering, collision detection, and visibility issues

(function() {
    'use strict';
    
    // Only apply fixes if Edge is detected
    if (!window.edgeCompatibility || !window.edgeCompatibility.isEdge) {
        return;
    }
    
    console.log('Applying Microsoft Edge compatibility fixes...');
    
    // Override game rendering methods for Edge
    function applyEdgeRenderingFixes() {
        // Wait for game to be loaded
        const checkGame = setInterval(() => {
            if (window.Game && window.Game.prototype) {
                clearInterval(checkGame);
                
                // Store original methods
                const originalRenderFood = window.Game.prototype.renderFood;
                const originalRenderSnakeHead = window.Game.prototype.renderSnakeHead;
                const originalRenderSnakeSegment = window.Game.prototype.renderSnakeSegment;
                
                // Override renderFood for better Edge visibility
                window.Game.prototype.renderFood = function() {
                    if (!this.food || !isFinite(this.food.x) || !isFinite(this.food.y)) return;
                    
                    this.ctx.save();
                    
                    // Pulsing effect
                    const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
                    const size = this.foodSize * pulse;
                    
                    // Edge-specific bright rendering
                    this.ctx.fillStyle = '#00ff00'; // Bright green
                    this.ctx.strokeStyle = '#ffffff'; // White border
                    this.ctx.lineWidth = 3;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(this.food.x, this.food.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                };
                
                // Override renderSnakeHead for better Edge visibility
                window.Game.prototype.renderSnakeHead = function(x, y) {
                    if (!isFinite(x) || !isFinite(y)) return;
                    
                    this.ctx.save();
                    
                    // Bright orange for Goku's head in Edge
                    this.ctx.fillStyle = '#ff6b35';
                    this.ctx.strokeStyle = '#ffaa00';
                    this.ctx.lineWidth = 3;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.snakeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Draw eyes with better visibility
                    this.ctx.fillStyle = '#000000';
                    const eyeOffset = this.snakeSize * 0.4;
                    const eyeSize = 3; // Slightly larger for Edge
                    
                    const dir = isFinite(this.direction) ? this.direction : 0;
                    const eyeX1 = x + Math.cos(dir - 0.5) * eyeOffset;
                    const eyeY1 = y + Math.sin(dir - 0.5) * eyeOffset;
                    const eyeX2 = x + Math.cos(dir + 0.5) * eyeOffset;
                    const eyeY2 = y + Math.sin(dir + 0.5) * eyeOffset;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                    this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.restore();
                };
                
                // Override renderSnakeSegment for better Edge visibility
                window.Game.prototype.renderSnakeSegment = function(x, y, alpha, index) {
                    if (!isFinite(x) || !isFinite(y) || !isFinite(alpha)) return;
                    
                    const size = this.snakeSize * (0.8 + alpha * 0.2);
                    
                    this.ctx.save();
                    this.ctx.fillStyle = '#ff8c42'; // Bright orange for body
                    this.ctx.strokeStyle = '#ffaa00';
                    this.ctx.lineWidth = 1;
                    this.ctx.globalAlpha = Math.max(0.5, alpha); // More visible in Edge
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                };
                
                console.log('Edge rendering fixes applied successfully');
            }
        }, 100);
    }
    
    // Apply collision detection fixes for Edge
    function applyEdgeCollisionFixes() {
        const checkGame = setInterval(() => {
            if (window.Game && window.Game.prototype && window.Game.prototype.update) {
                clearInterval(checkGame);
                
                // Store original update method
                const originalUpdate = window.Game.prototype.update;
                
                // Override update method with Edge-specific collision fixes
                window.Game.prototype.update = function(deltaTime) {
                    // Ensure valid deltaTime to prevent instant movement
                    if (!isFinite(deltaTime) || deltaTime <= 0 || deltaTime > 2) {
                        deltaTime = 1;
                    }
                    
                    // Update special abilities
                    if (this.specialAbilities && typeof this.specialAbilities.update === 'function') {
                        this.specialAbilities.update(deltaTime);
                    }
                    
                    // Smooth direction interpolation
                    this.smoothTurn(deltaTime);
                    
                    // Move snake head with speed boost consideration
                    const head = this.snake[0];
                    let currentSpeed = this.gameSpeed;
                    
                    // Apply speed boosts from special abilities
                    if (this.specialAbilities) {
                        currentSpeed *= this.specialAbilities.getSpeedMultiplier();
                    }
                    
                    const moveDistance = currentSpeed * deltaTime * 0.5; // Slower movement
                    
                    const newHead = {
                        x: head.x + Math.cos(this.direction) * moveDistance,
                        y: head.y + Math.sin(this.direction) * moveDistance
                    };
                    
                    // Enhanced Edge collision detection with safety margins
                    const baseMargin = this.snakeSize + 5;
                    const edgeMargin = this.snakeSize + 25; // Very large margin for Edge
                    const margin = edgeMargin; // Always use large margin in Edge
                    
                    if (newHead.x < margin || newHead.x > this.canvasSize - margin || 
                        newHead.y < margin || newHead.y > this.canvasSize - margin) {
                        
                        // Edge-specific collision prevention
                        const centerX = this.canvasSize / 2;
                        const centerY = this.canvasSize / 2;
                        const distanceFromCenter = Math.sqrt((newHead.x - centerX) ** 2 + (newHead.y - centerY) ** 2);
                        const gameJustStarted = (this.gameTime || 0) < 5; // First 5 seconds
                        
                        // Prevent false positives during game start or near center
                        if (distanceFromCenter < this.canvasSize * 0.4 || gameJustStarted) {
                            console.log('Edge: Preventing false wall collision');
                            // Keep snake safely within bounds
                            newHead.x = Math.max(margin, Math.min(this.canvasSize - margin, centerX));
                            newHead.y = Math.max(margin, Math.min(this.canvasSize - margin, centerY));
                        } else {
                            // Real collision detected
                            console.log('Wall collision detected (Edge safe mode)');
                            this.gameOver(false, 'Hit wall');
                            return;
                        }
                    }
                    
                    // Continue with rest of original update logic
                    // Check self collision (skip first few segments)
                    for (let i = 4; i < this.snake.length; i++) {
                        const segment = this.snake[i];
                        const distance = Math.sqrt((newHead.x - segment.x) ** 2 + (newHead.y - segment.y) ** 2);
                        if (distance < this.snakeSize * 1.2) {
                            this.gameOver(false, 'Hit self');
                            return;
                        }
                    }
                    
                    // Update snake body
                    this.updateSnakeBody(newHead);
                    
                    // Check food collision
                    if (this.food) {
                        const foodDistance = Math.sqrt((newHead.x - this.food.x) ** 2 + (newHead.y - this.food.y) ** 2);
                        if (foodDistance < this.snakeSize + this.foodSize) {
                            this.eatFood();
                        }
                    }
                    
                    // Update AI snake
                    if (this.aiSnake && typeof this.aiSnake.update === 'function') {
                        this.aiSnake.update(deltaTime, this.snake[0], this.food);
                    }
                    
                    // Update particles (skip for Edge)
                    // this.particles.update(deltaTime);
                };
                
                console.log('Edge collision fixes applied successfully');
            }
        }, 100);
    }
    
    // Initialize Edge fixes
    applyEdgeRenderingFixes();
    applyEdgeCollisionFixes();
    
})();