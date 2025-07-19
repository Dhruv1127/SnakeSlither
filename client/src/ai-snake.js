// AI Enemy Snake - Vegeta (The Prince of Saiyans)
class AISnake {
    constructor(game) {
        this.game = game;
        this.segments = [];
        this.direction = 0;
        this.targetDirection = 0;
        this.speed = 3.5; // Faster - Vegeta's pride
        this.segmentSize = 11; // Slightly larger
        this.segmentSpacing = 15;
        this.turnSpeed = 0.12;
        this.name = "Vegeta";
        
        // Saiyan Prince colors - Royal blue with electric aura
        this.color = '#1a237e'; // Deep royal blue
        this.headColor = '#0d47a1'; // Darker royal blue for head
        this.glowColor = '#3f51b5'; // Electric blue glow
        this.accentColor = '#ffeb3b'; // Golden yellow accents
        this.auraColor = '#00e5ff'; // Cyan energy aura
        
        // AI behavior - More aggressive like Vegeta
        this.target = null;
        this.lastDecisionTime = 0;
        this.decisionInterval = 400; // Faster decisions
        this.aggressiveness = 0.85; // High aggression - Saiyan Prince
        this.avoidanceRadius = 40; // Less cautious
        this.chaseRadius = 120; // Wider hunting range
        
        // Scoring system
        this.score = 0;
        this.targetScore = 100; // Score to beat player
        
        // Initialize position away from player
        this.initializePosition();
        
        console.log('AI Snake initialized');
    }
    
    initializePosition() {
        // Start in a random corner away from player
        const corners = [
            { x: 50, y: 50 },
            { x: this.game.canvasSize - 50, y: 50 },
            { x: 50, y: this.game.canvasSize - 50 },
            { x: this.game.canvasSize - 50, y: this.game.canvasSize - 50 }
        ];
        
        const startPos = corners[Math.floor(Math.random() * corners.length)];
        
        // Create initial segments
        for (let i = 0; i < 5; i++) {
            this.segments.push({
                x: startPos.x - (i * this.segmentSpacing),
                y: startPos.y,
                size: this.segmentSize * (1 - i * 0.05)
            });
        }
        
        this.direction = Math.random() * Math.PI * 2;
        this.targetDirection = this.direction;
    }
    
    update(deltaTime) {
        if (!this.game.isRunning || this.segments.length === 0) return;
        
        this.makeDecision();
        this.smoothTurn(deltaTime);
        this.move(deltaTime);
        this.checkBoundaries();
        this.checkCollisions();
        this.grow();
    }
    
    makeDecision() {
        const now = Date.now();
        if (now - this.lastDecisionTime < this.decisionInterval) return;
        
        this.lastDecisionTime = now;
        
        const head = this.segments[0];
        if (!head) return;
        
        // Get player position
        const playerHead = this.game.snake[0];
        if (!playerHead) return;
        
        const distanceToPlayer = this.getDistance(head, playerHead);
        
        // Determine behavior based on distance and situation
        if (distanceToPlayer < this.avoidanceRadius) {
            this.avoidPlayer(head, playerHead);
        } else if (distanceToPlayer < this.chaseRadius && Math.random() < this.aggressiveness) {
            this.chaseTarget(head, this.game.food || playerHead);
        } else {
            this.wanderBehavior(head);
        }
    }
    
    avoidPlayer(head, playerHead) {
        // Move away from player
        const dx = head.x - playerHead.x;
        const dy = head.y - playerHead.y;
        this.targetDirection = Math.atan2(dy, dx);
    }
    
    chaseTarget(head, target) {
        if (!target) return;
        
        // Move towards target (food or player)
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        this.targetDirection = Math.atan2(dy, dx);
    }
    
    wanderBehavior(head) {
        // Random wandering with occasional direction changes
        if (Math.random() < 0.3) {
            this.targetDirection += (Math.random() - 0.5) * Math.PI;
        }
        
        // Avoid getting too close to walls
        const margin = 30;
        if (head.x < margin) this.targetDirection = 0; // Go right
        if (head.x > this.game.canvasSize - margin) this.targetDirection = Math.PI; // Go left
        if (head.y < margin) this.targetDirection = Math.PI / 2; // Go down
        if (head.y > this.game.canvasSize - margin) this.targetDirection = -Math.PI / 2; // Go up
    }
    
    smoothTurn(deltaTime) {
        // Normalize angles
        while (this.targetDirection > Math.PI) this.targetDirection -= 2 * Math.PI;
        while (this.targetDirection < -Math.PI) this.targetDirection += 2 * Math.PI;
        while (this.direction > Math.PI) this.direction -= 2 * Math.PI;
        while (this.direction < -Math.PI) this.direction += 2 * Math.PI;
        
        let angleDiff = this.targetDirection - this.direction;
        
        // Take shortest path
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply smooth turning
        if (Math.abs(angleDiff) > 0.01) {
            this.direction += angleDiff * this.turnSpeed * Math.min(deltaTime, 2);
        }
    }
    
    move(deltaTime) {
        if (this.segments.length === 0) return;
        
        const head = this.segments[0];
        
        // Calculate new head position
        const moveDistance = this.speed * Math.min(deltaTime, 2);
        const newHead = {
            x: head.x + Math.cos(this.direction) * moveDistance,
            y: head.y + Math.sin(this.direction) * moveDistance,
            size: this.segmentSize
        };
        
        // Update body segments
        this.updateBody(newHead);
    }
    
    updateBody(newHead) {
        // Add new head
        this.segments.unshift(newHead);
        
        // Update body positions to follow properly
        for (let i = 1; i < this.segments.length; i++) {
            const current = this.segments[i];
            const target = this.segments[i - 1];
            
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too far, move closer
            if (distance > this.segmentSpacing && distance > 0) {
                const ratio = (distance - this.segmentSpacing) / distance;
                current.x += dx * ratio * 0.8;
                current.y += dy * ratio * 0.8;
            }
        }
        
        // Limit length
        const maxLength = 5 + Math.floor(this.game.score / 100);
        while (this.segments.length > maxLength) {
            this.segments.pop();
        }
    }
    
    checkBoundaries() {
        if (this.segments.length === 0) return;
        
        const head = this.segments[0];
        const margin = this.segmentSize;
        
        // Wrap around boundaries or bounce
        if (head.x < margin) {
            head.x = this.game.canvasSize - margin;
        } else if (head.x > this.game.canvasSize - margin) {
            head.x = margin;
        }
        
        if (head.y < margin) {
            head.y = this.game.canvasSize - margin;
        } else if (head.y > this.game.canvasSize - margin) {
            head.y = margin;
        }
    }
    
    checkCollisions() {
        if (this.segments.length === 0 || this.game.snake.length === 0) return;
        
        const aiHead = this.segments[0];
        const playerHead = this.game.snake[0];
        
        // Check collision with player
        const distance = this.getDistance(aiHead, playerHead);
        if (distance < this.segmentSize + this.game.snakeSize) {
            this.handlePlayerCollision();
        }
        
        // Check if AI eats food
        if (this.game.food) {
            const foodDistance = this.getDistance(aiHead, this.game.food);
            if (foodDistance < this.segmentSize + this.game.foodSize) {
                this.eatFood();
            }
        }
    }
    
    handlePlayerCollision() {
        // End game if player collides with AI
        console.log('Vegeta collided with Son Goku! Battle ended!');
        this.game.isRunning = false;
        this.game.gamePhase = 'ended';
        
        // Properly trigger game over through game's method
        if (this.game.gameOver) {
            this.game.gameOver();
        } else if (gameUI && gameUI.showGameOver) {
            // Store final score before showing game over
            const finalScore = this.game.score || 0;
            const gameTime = (Date.now() - this.game.gameStartTime) / 1000 || 0;
            
            // Show game over screen with proper data
            setTimeout(() => {
                gameUI.showGameOver({
                    score: finalScore,
                    gameTime: gameTime,
                    reason: 'Defeated by Vegeta!'
                });
            }, 100);
        }
    }
    
    eatFood() {
        // AI snake eats food - generate new food
        this.score += 15; // Vegeta scores higher per food
        console.log(`Vegeta scored! Current score: ${this.score}`);
        
        // Check if Vegeta wins
        if (this.score >= this.targetScore) {
            console.log('Vegeta reached target score! Player loses!');
            this.game.isRunning = false;
            this.game.gamePhase = 'ended';
            
            setTimeout(() => {
                if (gameUI && gameUI.showGameOver) {
                    gameUI.showGameOver({
                        score: this.game.score || 0,
                        gameTime: (Date.now() - this.game.gameStartTime) / 1000 || 0,
                        reason: 'Vegeta reached the target score first!'
                    });
                }
            }, 100);
            return;
        }
        
        this.game.generateFood();
        
        // Create particles
        this.game.particles.createFoodExplosion(
            this.game.food.x, this.game.food.y, this.color
        );
        
        // Update UI with Vegeta's score
        if (gameUI && gameUI.updateVegetaScore) {
            gameUI.updateVegetaScore(this.score);
        }
    }
    
    grow() {
        // Gradual growth based on time
        if (Math.random() < 0.001 && this.segments.length < 15) {
            this.segments.push({
                x: this.segments[this.segments.length - 1].x,
                y: this.segments[this.segments.length - 1].y,
                size: this.segmentSize * 0.8
            });
        }
    }
    
    render(ctx) {
        if (this.segments.length === 0) return;
        
        ctx.save();
        
        // Render body segments (back to front)
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            const isHead = i === 0;
            const alpha = 1 - (i * 0.03);
            
            ctx.globalAlpha = Math.max(0.4, alpha);
            
            // Add Saiyan aura effect
            if (isHead) {
                // Head with royal blue and golden accents
                ctx.fillStyle = this.headColor;
                ctx.shadowColor = this.auraColor;
                ctx.shadowBlur = 20;
            } else {
                // Body with royal blue color
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.glowColor;
                ctx.shadowBlur = 12;
            }
            
            // Add wave motion to body
            const waveY = segment.y + Math.sin(Date.now() * 0.003 + i * 0.5) * 2;
            
            ctx.beginPath();
            ctx.arc(segment.x, waveY, segment.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eyes on head
            if (isHead) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#000000';
                
                const eyeOffset = segment.size * 0.4;
                const eyeSize = 2;
                
                const eyeX1 = segment.x + Math.cos(this.direction - 0.5) * eyeOffset;
                const eyeY1 = waveY + Math.sin(this.direction - 0.5) * eyeOffset;
                const eyeX2 = segment.x + Math.cos(this.direction + 0.5) * eyeOffset;
                const eyeY2 = waveY + Math.sin(this.direction + 0.5) * eyeOffset;
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    reset() {
        this.segments = [];
        this.initializePosition();
        this.lastDecisionTime = 0;
    }
}