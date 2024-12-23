const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const joystickElement = document.getElementById('joystick');
const stickElement = document.getElementById('stick');

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let score = 0;
let level = 1;
let gameOver = false;
let particles = [];

// Power-ups
const powerUps = {
    rapidFire: false,
    multiShot: false,
    firewall: false
};

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    speed: 5,
    dx: 0,
    dy: 0,
    projectiles: [],
    lastShot: 0,
    shootInterval: 500, // ms between shots
    color: '#0ff',
    level: 1,
    xp: 0,
    xpToLevel: 100
};

// Enemy types
const ENEMY_TYPES = {
    BASIC: {
        color: '#f00',
        size: 20,
        speed: 2,
        health: 1,
        damage: 1,
        points: 10
    },
    FAST: {
        color: '#ff0',
        size: 15,
        speed: 3.5,
        health: 1,
        damage: 1,
        points: 15
    },
    TANK: {
        color: '#f0f',
        size: 35,
        speed: 1,
        health: 3,
        damage: 2,
        points: 25
    }
};

// Enemies
const enemies = [];
const ENEMY_SPAWN_INTERVAL = 1000;
let lastEnemySpawn = 0;

// Background grid
const grid = {
    spacing: 50,
    opacity: 0.2,
    scroll: 0
};

// Joystick
let joystickActive = false;
let joystickData = {
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0
};

// Touch controls
joystickElement.addEventListener('touchstart', handleTouchStart);
joystickElement.addEventListener('touchmove', handleTouchMove);
joystickElement.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = joystickElement.getBoundingClientRect();
    joystickActive = true;
    joystickData.startX = touch.clientX - rect.left;
    joystickData.startY = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!joystickActive) return;
    
    const touch = e.touches[0];
    const rect = joystickElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Calculate distance from start
    const dx = x - joystickData.startX;
    const dy = y - joystickData.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize to joystick radius
    const maxDistance = 25;
    const normalizedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    
    joystickData.moveX = Math.cos(angle) * normalizedDistance;
    joystickData.moveY = Math.sin(angle) * normalizedDistance;
    
    // Update stick position
    stickElement.style.transform = `translate(${joystickData.moveX}px, ${joystickData.moveY}px)`;
    
    // Update player velocity
    player.dx = (joystickData.moveX / maxDistance) * player.speed;
    player.dy = (joystickData.moveY / maxDistance) * player.speed;
}

function handleTouchEnd(e) {
    e.preventDefault();
    joystickActive = false;
    joystickData.moveX = 0;
    joystickData.moveY = 0;
    player.dx = 0;
    player.dy = 0;
    stickElement.style.transform = 'translate(0px, 0px)';
}

// Particle system
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 2;
        particles.push({
            x,
            y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: 3,
            color,
            life: 1, // 1 = full life, 0 = dead
            decay: 0.02 + Math.random() * 0.02
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Game functions
function spawnEnemy() {
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
    
    enemies.push({
        x,
        y,
        type,
        health: type.health,
        size: type.size,
        speed: type.speed * (1 + level * 0.1) // Increase speed with level
    });
}

function shoot() {
    const now = Date.now();
    if (now - player.lastShot >= (powerUps.rapidFire ? player.shootInterval / 2 : player.shootInterval)) {
        const angles = powerUps.multiShot ? 16 : 8;
        for (let i = 0; i < angles; i++) {
            const angle = (Math.PI * 2 * i) / angles;
            player.projectiles.push({
                x: player.x,
                y: player.y,
                dx: Math.cos(angle) * 7,
                dy: Math.sin(angle) * 7,
                size: 5
            });
        }
        player.lastShot = now;
    }
    
    // Firewall power-up
    if (powerUps.firewall && now % 1000 < 16) {
        const angle = (now / 1000) * Math.PI;
        player.projectiles.push({
            x: player.x + Math.cos(angle) * 50,
            y: player.y + Math.sin(angle) * 50,
            dx: Math.cos(angle) * 5,
            dy: Math.sin(angle) * 5,
            size: 8
        });
    }
}

function updateProjectiles() {
    for (let i = player.projectiles.length - 1; i >= 0; i--) {
        const projectile = player.projectiles[i];
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        
        // Remove projectiles that are off screen
        if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
            projectile.y < -50 || projectile.y > canvas.height + 50) {
            player.projectiles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    const now = Date.now();
    if (now - lastEnemySpawn >= ENEMY_SPAWN_INTERVAL / Math.sqrt(level)) {
        spawnEnemy();
        lastEnemySpawn = now;
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move enemy towards player
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
        
        // Check collision with player
        if (distance < player.size + enemy.size) {
            gameOver = true;
            createParticles(player.x, player.y, player.color, 30);
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
                    enemies.splice(i, 1);
                    createParticles(enemy.x, enemy.y, enemy.type.color, 15);
                    score += enemy.type.points;
                    player.xp += enemy.type.points;
                    scoreElement.textContent = `Score: ${score}`;
                    
                    // Level up system
                    if (player.xp >= player.xpToLevel) {
                        player.level++;
                        player.xp = 0;
                        player.xpToLevel *= 1.5;
                        level = player.level;
                        levelElement.textContent = `Level ${level}`;
                        
                        // Random power-up
                        const powerUpTypes = ['rapidFire', 'multiShot', 'firewall'];
                        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                        powerUps[randomPowerUp] = true;
                    }
                }
                break;
            }
        }
    }
}

function updatePlayer() {
    // Update position
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x + player.dx));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y + player.dy));
    
    // Auto-shoot
    shoot();
}

// Draw functions
function drawBackground() {
    // Scrolling grid effect
    ctx.strokeStyle = `rgba(0, 255, 255, ${grid.opacity})`;
    ctx.lineWidth = 1;
    
    grid.scroll = (grid.scroll + 0.5) % grid.spacing;
    
    // Vertical lines
    for (let x = grid.scroll; x < canvas.width; x += grid.spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = grid.scroll; y < canvas.height; y += grid.spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawNeonCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    // Create gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw particles
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        drawNeonCircle(particle.x, particle.y, particle.size, particle.color);
    });
    ctx.globalAlpha = 1;
    
    // Draw player
    drawNeonCircle(player.x, player.y, player.size, player.color);
    
    // Draw projectiles
    player.projectiles.forEach(projectile => {
        drawNeonCircle(projectile.x, projectile.y, projectile.size, '#ff0');
        
        // Trail effect
        createParticles(projectile.x, projectile.y, '#ff0', 1);
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
        drawNeonCircle(enemy.x, enemy.y, enemy.size, enemy.type.color);
    });
    
    // Draw game over
    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Orbitron';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Tap to restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

function gameLoop() {
    if (!gameOver) {
        updatePlayer();
        updateProjectiles();
        updateEnemies();
        updateParticles();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();

// Restart on tap when game is over
canvas.addEventListener('touchstart', () => {
    if (gameOver) {
        // Reset game state
        gameOver = false;
        score = 0;
        level = 1;
        player.level = 1;
        player.xp = 0;
        player.xpToLevel = 100;
        scoreElement.textContent = 'Score: 0';
        levelElement.textContent = 'Level 1';
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.projectiles = [];
        enemies.length = 0;
        particles.length = 0;
        lastEnemySpawn = Date.now();
        Object.keys(powerUps).forEach(key => powerUps[key] = false);
    }
});
