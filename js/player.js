import { PLAYER_CONFIG } from './config.js';

class Player {
    constructor(canvas) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = PLAYER_CONFIG.size;
        this.speed = PLAYER_CONFIG.speed;
        this.dx = 0;
        this.dy = 0;
        this.projectiles = [];
        this.lastShot = 0;
        this.shootInterval = PLAYER_CONFIG.shootInterval;
        this.color = PLAYER_CONFIG.color;
        this.level = PLAYER_CONFIG.initialLevel;
        this.xp = PLAYER_CONFIG.initialXp;
        this.xpToLevel = PLAYER_CONFIG.initialXpToLevel;
    }

    update(canvas) {
        // Update position
        this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x + this.dx));
        this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y + this.dy));
    }

    shoot(powerUps) {
        const now = Date.now();
        if (now - this.lastShot >= (powerUps.rapidFire ? this.shootInterval / 2 : this.shootInterval)) {
            const angles = powerUps.multiShot ? 16 : 8;
            for (let i = 0; i < angles; i++) {
                const angle = (Math.PI * 2 * i) / angles;
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    dx: Math.cos(angle) * 7,
                    dy: Math.sin(angle) * 7,
                    size: 5
                });
            }
            this.lastShot = now;
        }
        
        // Firewall power-up
        if (powerUps.firewall && now % 1000 < 16) {
            const angle = (now / 1000) * Math.PI;
            this.projectiles.push({
                x: this.x + Math.cos(angle) * 50,
                y: this.y + Math.sin(angle) * 50,
                dx: Math.cos(angle) * 5,
                dy: Math.sin(angle) * 5,
                size: 8
            });
        }
    }

    updateProjectiles(canvas) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.dx;
            projectile.y += projectile.dy;
            
            // Remove projectiles that are off screen
            if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
                projectile.y < -50 || projectile.y > canvas.height + 50) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    reset(canvas) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.dx = 0;
        this.dy = 0;
        this.projectiles = [];
        this.level = PLAYER_CONFIG.initialLevel;
        this.xp = PLAYER_CONFIG.initialXp;
        this.xpToLevel = PLAYER_CONFIG.initialXpToLevel;
    }
}

export default Player;
