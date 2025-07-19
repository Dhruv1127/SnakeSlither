// Start Screen Animation - Snake Biting Game Controller
class StartAnimation {
    constructor() {
        this.canvas = document.getElementById('start-animation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.phase = 'enter'; // enter, approach, bite, finish
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
            biteFlash: 0
        };
        
        // Initialize snake segments
        for (let i = 0; i < 15; i++) {
            this.snake.segments.push({
                x: this.snake.headX - (i * this.snake.segmentSpacing),
                y: this.snake.headY + Math.sin(i * 0.3) * 5,
                size: this.snake.segmentSize * (1 - i * 0.02)
            });
        }
    }
    
    start(onComplete) {
        this.onComplete = onComplete;
        this.phase = 'enter';
        this.time = 0;
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
            case 'approach':
                this.updateApproachPhase();
                break;
            case 'bite':
                this.updateBitePhase();
                break;
            case 'finish':
                this.updateFinishPhase();
                break;
        }
        
        this.updateParticles();
        this.updateSnakeWave();
    }
    
    updateEnterPhase() {
        // Snake enters from left
        this.snake.headX += this.snake.speed;
        
        // Update snake body following head
        this.updateSnakeBody();
        
        if (this.snake.headX >= 200) {
            this.phase = 'approach';
            this.snake.speed = 1;
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
        this.controller.shake = Math.sin(this.time * 50) * 3;
        this.effects.biteFlash = Math.max(0, this.effects.biteFlash - 0.05);
        
        if (!this.controller.bitten) {
            this.controller.bitten = true;
            this.effects.biteFlash = 1;
            this.createBiteEffects();
        }
        
        if (this.time > 2) {
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
        // Smooth following movement for snake body
        for (let i = 1; i < this.snake.segments.length; i++) {
            const current = this.snake.segments[i];
            const target = this.snake.segments[i - 1];
            
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.snake.segmentSpacing) {
                const ratio = (distance - this.snake.segmentSpacing) / distance;
                current.x += dx * ratio * 0.8;
                current.y += dy * ratio * 0.8;
            }
        }
        
        // Update head position
        this.snake.segments[0].x = this.snake.headX;
        this.snake.segments[0].y = this.snake.headY;
    }
    
    updateSnakeWave() {
        // Add wave motion to snake body
        for (let i = 1; i < this.snake.segments.length; i++) {
            const segment = this.snake.segments[i];
            const waveOffset = Math.sin(this.time * 3 + i * 0.5) * 3;
            segment.y += waveOffset * 0.1;
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
    
    createBiteEffects() {
        // Create particles when snake bites controller
        for (let i = 0; i < 20; i++) {
            this.effects.particles.push({
                x: this.controller.x - 30,
                y: this.controller.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                life: 1,
                color: `hsl(${Math.random() * 60 + 20}, 70%, 60%)`
            });
        }
        
        // Create controller cracks
        for (let i = 0; i < 5; i++) {
            this.effects.cracks.push({
                x: this.controller.x - 40 + Math.random() * 80,
                y: this.controller.y - 20 + Math.random() * 40,
                length: Math.random() * 20 + 10,
                angle: Math.random() * Math.PI * 2
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game controller
        this.renderController();
        
        // Render snake
        this.renderSnake();
        
        // Render effects
        this.renderEffects();
        
        // Render title if in finish phase
        if (this.phase === 'finish' || this.phase === 'finished') {
            this.renderTitle();
        }
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
        
        // Render cracks if bitten
        if (this.controller.bitten) {
            this.ctx.strokeStyle = '#ff4444';
            this.ctx.lineWidth = 2;
            this.effects.cracks.forEach(crack => {
                this.ctx.beginPath();
                this.ctx.moveTo(crack.x, crack.y);
                this.ctx.lineTo(
                    crack.x + Math.cos(crack.angle) * crack.length,
                    crack.y + Math.sin(crack.angle) * crack.length
                );
                this.ctx.stroke();
            });
        }
        
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
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 20;
        
        const alpha = Math.min(1, (this.time - 2) * 2);
        this.ctx.globalAlpha = alpha;
        
        this.ctx.fillText('SNAKE VIPER', this.canvas.width / 2, 100);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('Ready to Hunt!', this.canvas.width / 2, 140);
        
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.startAnimation = new StartAnimation();
    });
} else {
    window.startAnimation = new StartAnimation();
}