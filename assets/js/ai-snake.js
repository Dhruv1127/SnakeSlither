// AI Snake (Vegeta) for Snake Game
class AISnake {
    constructor(canvasSize, segmentSize) {
        this.canvasSize = canvasSize;
        this.segmentSize = segmentSize * 0.9; // Slightly smaller than player
        this.segments = [];
        this.direction = 0;
        this.speed = 80;
        this.color = '#ff0066'; // Royal red for Vegeta
        this.isActive = true;
        this.regenerating = false;
        this.aggressiveMode = false;
        this.lastDecisionTime = 0;
        this.decisionInterval = 200; // Make decisions every 200ms
        
        // AI behavior parameters
        this.chaseDistance = 150;
        this.avoidDistance = 80;
        this.randomMoveProbability = 0.1;
        
        console.log('AI Snake (Vegeta) initialized');
    }
    
    initialize() {
        // Start Vegeta on the opposite side of the player
        const centerX = this.canvasSize * 0.75;
        const centerY = this.canvasSize * 0.25;
        
        this.segments = [
            { x: centerX, y: centerY },
            { x: centerX + this.segmentSize, y: centerY },
            { x: centerX + this.segmentSize * 2, y: centerY }
        ];
        
        this.direction = Math.PI; // Start facing left
        this.isActive = true;
        this.regenerating = false;
        
        console.log('Vegeta AI snake spawned at', centerX, centerY);
    }
    
    update(deltaTime, playerHead, food) {
        if (!this.isActive || this.regenerating || !this.segments || this.segments.length === 0) {
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - this.lastDecisionTime > this.decisionInterval) {
            this.makeDecision(playerHead, food);
            this.lastDecisionTime = currentTime;
        }
        
        this.move(deltaTime);
        this.checkBoundaries();
        this.checkFoodCollision(food);
    }
    
    makeDecision(playerHead, food) {
        if (!playerHead || !this.segments[0]) return;
        
        const head = this.segments[0];
        const distanceToPlayer = Math.sqrt(
            (head.x - playerHead.x) ** 2 + (head.y - playerHead.y) ** 2
        );
        
        let targetX, targetY;
        
        // Decision making based on distance to player
        if (distanceToPlayer < this.avoidDistance) {
            // Too close to player - move away
            targetX = head.x + (head.x - playerHead.x);
            targetY = head.y + (head.y - playerHead.y);
        } else if (distanceToPlayer > this.chaseDistance && food) {
            // Far from player - go for food
            targetX = food.x;
            targetY = food.y;
        } else {
            // Medium distance - aggressive chase mode
            if (!this.aggressiveMode && Math.random() < 0.3) {
                this.activateAggressiveMode();
            }
            targetX = playerHead.x;
            targetY = playerHead.y;
        }
        
        // Add some randomness
        if (Math.random() < this.randomMoveProbability) {
            targetX = this.segmentSize + Math.random() * (this.canvasSize - this.segmentSize * 2);
            targetY = this.segmentSize + Math.random() * (this.canvasSize - this.segmentSize * 2);
        }
        
        // Calculate direction to target
        const targetDirection = Math.atan2(targetY - head.y, targetX - head.x);
        
        // Smooth direction change
        let angleDiff = targetDirection - this.direction;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Don't make sharp turns
        if (Math.abs(angleDiff) > Math.PI / 4) {
            angleDiff = Math.sign(angleDiff) * Math.PI / 4;
        }
        
        this.direction += angleDiff * 0.3; // Smooth turning
    }
    
    activateAggressiveMode() {
        this.aggressiveMode = true;
        this.speed = 120; // Increase speed
        this.color = '#ff0000'; // Turn red
        console.log('Vegeta Aggressive Mode Activated!');
        
        // Deactivate after 3 seconds
        setTimeout(() => {
            this.aggressiveMode = false;
            this.speed = 80;
            this.color = '#ff0066';
        }, 3000);
    }
    
    move(deltaTime) {
        if (!this.segments || this.segments.length === 0) return;
        
        const head = this.segments[0];
        let currentSpeed = this.speed;
        
        if (this.aggressiveMode) {
            currentSpeed *= 1.5;
        }
        
        const moveDistance = currentSpeed * deltaTime;
        
        const newHead = {
            x: head.x + Math.cos(this.direction) * moveDistance,
            y: head.y + Math.sin(this.direction) * moveDistance
        };
        
        // Update segments
        this.segments.unshift(newHead);
        
        // Grow occasionally by not removing tail
        if (Math.random() < 0.02 && this.segments.length < 15) {
            // Keep growing
        } else {
            this.segments.pop();
        }
        
        // Update remaining segments to follow smoothly
        for (let i = 1; i < this.segments.length; i++) {
            const current = this.segments[i];
            const target = this.segments[i - 1];
            
            // Move towards the segment in front
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            
            if (distance > this.segmentSize * 1.5) {
                current.x += (dx / distance) * this.segmentSize * 0.3;
                current.y += (dy / distance) * this.segmentSize * 0.3;
            }
        }
    }
    
    checkBoundaries() {
        if (!this.segments || this.segments.length === 0) return;
        
        const head = this.segments[0];
        const margin = this.segmentSize;
        
        // Bounce off walls by changing direction
        if (head.x < margin || head.x > this.canvasSize - margin) {
            this.direction = Math.PI - this.direction;
        }
        
        if (head.y < margin || head.y > this.canvasSize - margin) {
            this.direction = -this.direction;
        }
        
        // Keep within bounds
        head.x = Math.max(margin, Math.min(this.canvasSize - margin, head.x));
        head.y = Math.max(margin, Math.min(this.canvasSize - margin, head.y));
    }
    
    checkFoodCollision(food) {
        if (!food || !this.segments || this.segments.length === 0) return;
        
        const head = this.segments[0];
        const distance = Math.sqrt((head.x - food.x) ** 2 + (head.y - food.y) ** 2);
        
        if (distance < this.segmentSize + 10) { // Food collision
            // Grow AI snake
            for (let i = 0; i < 2; i++) {
                const lastSegment = this.segments[this.segments.length - 1];
                this.segments.push({ x: lastSegment.x, y: lastSegment.y });
            }
            console.log('Vegeta ate food! Length:', this.segments.length);
            return true;
        }
        
        return false;
    }
    
    takeDamage() {
        if (this.regenerating) return;
        
        console.log('Vegeta hit by power ball! Starting regeneration...');
        this.regenerating = true;
        this.isActive = false;
        
        // Regeneration time based on snake length
        const regenTime = Math.max(2000, this.segments.length * 100);
        console.log(`Vegeta regeneration started - ${regenTime/1000} seconds`);
        
        setTimeout(() => {
            this.regenerating = false;
            this.isActive = true;
            console.log('Vegeta regeneration complete!');
        }, regenTime);
    }
    
    render(ctx) {
        if (!this.isActive && !this.regenerating) return;
        if (!this.segments || this.segments.length === 0) return;
        
        ctx.save();
        
        // Different rendering if regenerating
        if (this.regenerating) {
            ctx.globalAlpha = 0.5;
        }
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (!segment) continue;
            
            const isHead = i === 0;
            const size = isHead ? this.segmentSize * 1.1 : this.segmentSize;
            
            // Vegeta's colors
            let color = this.color;
            if (this.aggressiveMode) {
                color = '#ff0000'; // Bright red when aggressive
            }
            
            ctx.fillStyle = color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Vegeta's distinctive features
            if (isHead) {
                // Eyes
                ctx.fillStyle = '#ffffff';
                const eyeSize = size * 0.2;
                const eyeOffset = size * 0.3;
                
                ctx.beginPath();
                ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Pupils
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    reset() {
        this.initialize();
    }
}