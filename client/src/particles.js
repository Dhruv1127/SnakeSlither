// Particle System for Snake Game
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 100;
    }

    // Create particle explosion when snake eats food
    createFoodExplosion(x, y, color = '#FF5252') {
        const particleCount = 8;
        const baseVelocity = 3;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = baseVelocity + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                maxLife: 1.0,
                size: 3 + Math.random() * 3,
                color: color,
                type: 'explosion',
                gravity: 0.1,
                decay: 0.02
            });
        }
    }

    // Create trail particles behind the snake
    createSnakeTrail(x, y, color = '#4CAF50') {
        if (Math.random() < 0.3) { // Only create particles occasionally
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 0.8,
                maxLife: 0.8,
                size: 1 + Math.random() * 2,
                color: color,
                type: 'trail',
                gravity: 0,
                decay: 0.01
            });
        }
    }

    // Create sparkle effect around food
    createFoodSparkle(x, y, size) {
        if (Math.random() < 0.1) { // Occasional sparkles
            const offsetX = (Math.random() - 0.5) * size * 1.5;
            const offsetY = (Math.random() - 0.5) * size * 1.5;
            
            this.particles.push({
                x: x + offsetX,
                y: y + offsetY,
                vx: 0,
                vy: -0.5,
                life: 1.0,
                maxLife: 1.0,
                size: 1,
                color: '#FFD700',
                type: 'sparkle',
                gravity: 0,
                decay: 0.03
            });
        }
    }

    // Create game over explosion
    createGameOverExplosion(snakeSegments) {
        snakeSegments.forEach((segment, index) => {
            setTimeout(() => {
                const particleCount = 6;
                for (let i = 0; i < particleCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 2 + Math.random() * 3;
                    
                    this.particles.push({
                        x: segment.x,
                        y: segment.y,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity,
                        life: 1.0,
                        maxLife: 1.0,
                        size: 2 + Math.random() * 2,
                        color: index === 0 ? '#FF5252' : '#FF8A80', // Head is brighter
                        type: 'explosion',
                        gravity: 0.05,
                        decay: 0.015
                    });
                }
            }, index * 50); // Stagger the explosions
        });
    }

    // Create screen border particles when snake hits wall
    createWallHitEffect(x, y) {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                maxLife: 1.0,
                size: 2,
                color: '#FF5252',
                type: 'impact',
                gravity: 0,
                decay: 0.025
            });
        }
    }

    // Update all particles
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += particle.gravity;
            
            // Update life
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Particle type specific updates
            switch (particle.type) {
                case 'trail':
                    particle.vx *= 0.98; // Slow down
                    particle.vy *= 0.98;
                    break;
                    
                case 'sparkle':
                    particle.size = particle.size * 0.99; // Shrink
                    break;
                    
                case 'explosion':
                    particle.vx *= 0.95; // Friction
                    particle.vy *= 0.95;
                    break;
            }
        }
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    // Render all particles
    render() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            
            this.ctx.save();
            
            // Set particle opacity
            this.ctx.globalAlpha = alpha;
            
            // Draw particle based on type
            switch (particle.type) {
                case 'sparkle':
                    this.drawStar(particle.x, particle.y, particle.size, particle.color);
                    break;
                    
                case 'trail':
                    this.drawCircle(particle.x, particle.y, particle.size, particle.color, alpha * 0.5);
                    break;
                    
                default:
                    this.drawCircle(particle.x, particle.y, particle.size, particle.color);
                    break;
            }
            
            this.ctx.restore();
        });
    }

    // Draw a circular particle
    drawCircle(x, y, size, color, alphaOverride = null) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        
        if (alphaOverride !== null) {
            this.ctx.globalAlpha = alphaOverride;
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    // Draw a star-shaped particle
    drawStar(x, y, size, color) {
        const spikes = 4;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const dx = x + Math.cos(angle) * radius;
            const dy = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(dx, dy);
            } else {
                this.ctx.lineTo(dx, dy);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    // Clear all particles
    clear() {
        this.particles = [];
    }

    // Get particle count for debugging
    getParticleCount() {
        return this.particles.length;
    }

    // Create ambient particles for visual flair
    createAmbientParticles() {
        if (this.particles.length < 20 && Math.random() < 0.02) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.2 - Math.random() * 0.3,
                life: 1.0,
                maxLife: 1.0,
                size: 1,
                color: '#333333',
                type: 'ambient',
                gravity: 0,
                decay: 0.005
            });
        }
    }
}
