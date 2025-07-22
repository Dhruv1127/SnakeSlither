// Particle System for Snake Game
class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 100;
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update velocity (gravity, friction)
            particle.vy += particle.gravity || 0;
            particle.vx *= particle.friction || 0.98;
            particle.vy *= particle.friction || 0.98;
            
            // Update life
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }
    
    render() {
        if (!this.ctx) return;
        
        this.ctx.save();
        
        for (const particle of this.particles) {
            if (particle.alpha <= 0) continue;
            
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    createParticle(x, y, options = {}) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * (options.spread || 4),
            vy: (Math.random() - 0.5) * (options.spread || 4),
            size: options.size || Math.random() * 3 + 1,
            color: options.color || '#ffffff',
            life: options.life || 30,
            maxLife: options.life || 30,
            alpha: 1,
            gravity: options.gravity || 0,
            friction: options.friction || 0.98
        };
        
        this.particles.push(particle);
    }
    
    createFoodEffect(x, y) {
        const colors = ['#ff0000', '#ff6666', '#ffaa00', '#ffff00'];
        
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y, {
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
                spread: 8,
                life: 40
            });
        }
    }
    
    createSnakeTrail(x, y, color) {
        if (Math.random() < 0.3) { // Don't create too many trail particles
            this.createParticle(x, y, {
                color: color,
                size: Math.random() * 2 + 1,
                spread: 2,
                life: 20,
                friction: 0.95
            });
        }
    }
    
    createSpeedBoostEffect(x, y) {
        const colors = ['#ffd700', '#ffaa00', '#ff6600'];
        
        for (let i = 0; i < 5; i++) {
            this.createParticle(x, y, {
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 2,
                spread: 6,
                life: 30
            });
        }
    }
    
    createPowerBallTrail(x, y) {
        const colors = ['#00ffff', '#0088ff', '#ffffff'];
        
        this.createParticle(x, y, {
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1,
            spread: 3,
            life: 25
        });
    }
    
    createExplosion(x, y, size = 1) {
        const colors = ['#ff0000', '#ff6600', '#ffaa00', '#ffffff'];
        const particleCount = Math.floor(size * 12);
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(x, y, {
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 2,
                spread: size * 10,
                life: 50,
                gravity: 0.1
            });
        }
    }
    
    createWallHitEffect(x, y) {
        const colors = ['#ffffff', '#cccccc', '#999999'];
        
        for (let i = 0; i < 6; i++) {
            this.createParticle(x, y, {
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1,
                spread: 6,
                life: 35
            });
        }
    }
    
    createFoodSparkle(x, y, size) {
        if (Math.random() < 0.2) { // Occasional sparkles
            this.createParticle(
                x + (Math.random() - 0.5) * size * 2,
                y + (Math.random() - 0.5) * size * 2,
                {
                    color: '#ffffff',
                    size: Math.random() * 2 + 1,
                    spread: 1,
                    life: 15
                }
            );
        }
    }
    
    clear() {
        this.particles = [];
    }
}