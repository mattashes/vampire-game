import { GRID_CONFIG } from './config.js';

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gradientCache = new Map();
    }

    // Cache gradients for better performance
    getNeonGradient(radius, color) {
        const key = `${radius}-${color}`;
        if (!this.gradientCache.has(key)) {
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            this.gradientCache.set(key, gradient);
        }
        return this.gradientCache.get(key);
    }

    drawNeonCircle(x, y, radius, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        // Use cached gradient
        this.ctx.fillStyle = this.getNeonGradient(radius, color);
        
        // Only use glow effect for larger objects
        if (radius > 10) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = color;
        }
        
        this.ctx.fill();
        this.ctx.restore();
    }

    drawBackground() {
        // Scrolling grid effect
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${GRID_CONFIG.opacity})`;
        this.ctx.lineWidth = 1;
        
        GRID_CONFIG.scroll = (GRID_CONFIG.scroll + 0.5) % GRID_CONFIG.spacing;
        
        // Vertical lines
        for (let x = GRID_CONFIG.scroll; x < this.canvas.width; x += GRID_CONFIG.spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = GRID_CONFIG.scroll; y < this.canvas.height; y += GRID_CONFIG.spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        this.drawNeonCircle(player.x, player.y, player.size, player.color);
        
        // Draw projectiles with optimized trails
        player.projectiles.forEach(projectile => {
            this.drawNeonCircle(projectile.x, projectile.y, projectile.size, '#ff0');
        });
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            this.drawNeonCircle(enemy.x, enemy.y, enemy.size, enemy.type.color);
        });
    }

    drawParticles(particles) {
        particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.drawNeonCircle(particle.x, particle.y, particle.size, particle.color);
        });
        this.ctx.globalAlpha = 1;
    }

    drawGameOver(score) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '24px Orbitron';
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText('Tap to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default Renderer;
