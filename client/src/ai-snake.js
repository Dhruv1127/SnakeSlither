// AI Enemy Snake
class AISnake {
    constructor(game) {
        this.game = game;
        this.segments = [];
        this.direction = 0;
        this.targetDirection = 0;
        this.speed = 3;
        this.segmentSize = 10;
        this.segmentSpacing = 14;
        this.turnSpeed = 0.1;
        this.color = '#FF5252';
        this.headColor = '#D32F2F';
        
        // AI behavior
        this.target = null;
        this.lastDecisionTime = 0;
        this.decisionInterval = 500; // ms
        this.aggressiveness = 0.7; // 0-1, how likely to chase player
        this.avoidanceRadius = 50;
        this.chaseRadius = 100;
        
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
        console.log('Player collided with AI snake!');
        this.game.endGame();
    }
    
    eatFood() {
        // AI snake eats food - generate new food
        console.log('AI snake ate food!');
        this.game.generateFood();
        
        // Create particles
        this.game.particles.createFoodExplosion(
            this.game.food.x, this.game.food.y, this.color
        );
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
            ctx.fillStyle = isHead ? this.headColor : this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = isHead ? 15 : 8;
            
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