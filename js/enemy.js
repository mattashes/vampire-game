import { ENEMY_TYPES, ENEMY_SPAWN_INTERVAL } from './config.js';

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.lastEnemySpawn = Date.now();
    }

    spawnEnemy(canvas, level) {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch(side) {
            case 0: // top
                x = Math.random() * canvas.width;
                y = -20;
                break;
            case 1: // right
                x = canvas.width + 20;
                y = Math.random() * canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 20;
                break;
            case 3: // left
                x = -20;
                y = Math.random() * canvas.height;
                break;
        }
        
        // Randomly select enemy type based on level
        const types = Object.values(ENEMY_TYPES);
        const typeIndex = Math.floor(Math.random() * Math.min(types.length, Math.ceil(level / 2)));
        const type = types[typeIndex];
        
        this.enemies.push({
            x,
            y,
            type,
            health: type.health,
            size: type.size,
            speed: type.speed * (1 + level * 0.1) // Increase speed with level
        });
    }

    update(canvas, player, level, createParticles) {
        const now = Date.now();
        if (now - this.lastEnemySpawn >= ENEMY_SPAWN_INTERVAL / Math.sqrt(level)) {
            this.spawnEnemy(canvas, level);
            this.lastEnemySpawn = now;
        }
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move enemy towards player
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
            
            // Check collision with player
            if (distance < player.size + enemy.size) {
                createParticles(player.x, player.y, player.color, 30);
                return true; // Game over
            }
            
            // Check collision with projectiles
            for (let j = player.projectiles.length - 1; j >= 0; j--) {
                const projectile = player.projectiles[j];
                const pdx = projectile.x - enemy.x;
                const pdy = projectile.y - enemy.y;
                const pDistance = Math.sqrt(pdx * pdx + pdy * pdy);
                
                if (pDistance < enemy.size + projectile.size) {
                    enemy.health--;
                    player.projectiles.splice(j, 1);
                    createParticles(enemy.x, enemy.y, enemy.type.color, 5);
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(i, 1);
                        createParticles(enemy.x, enemy.y, enemy.type.color, 15);
                        return { points: enemy.type.points };
                    }
                    break;
                }
            }
        }
        return false;
    }

    reset() {
        this.enemies = [];
        this.lastEnemySpawn = Date.now();
    }
}

export default EnemyManager;
