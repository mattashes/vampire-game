import { MAX_PARTICLES } from './config.js';

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particlePool = [];
    }

    getParticle() {
        return this.particlePool.pop() || {};
    }

    returnParticle(particle) {
        if (this.particlePool.length < MAX_PARTICLES) {
            this.particlePool.push(particle);
        }
    }

    createParticles(x, y, color, count = 10) {
        // Adjust particle size based on device
        const baseSize = window.devicePixelRatio > 1 ? 5 : 3;
        
        // Limit particle count based on current count
        const actualCount = Math.min(count, MAX_PARTICLES - this.particles.length);
        
        for (let i = 0; i < actualCount; i++) {
            const angle = (Math.PI * 2 * i) / actualCount;
            const speed = 2 + Math.random() * 2;
            const particle = this.getParticle();
            
            particle.x = x;
            particle.y = y;
            particle.dx = Math.cos(angle) * speed;
            particle.dy = Math.sin(angle) * speed;
            particle.size = baseSize;
            particle.color = color;
            particle.life = 1;
            particle.decay = 0.02 + Math.random() * 0.02;
            
            this.particles.push(particle);
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.returnParticle(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    reset() {
        this.particles = [];
        this.particlePool = [];
    }
}

export default ParticleSystem;
