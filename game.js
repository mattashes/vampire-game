const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
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
let gameOver = false;

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
    shootInterval: 500 // ms between shots
};

// Enemies
const enemies = [];
const ENEMY_SPAWN_INTERVAL = 1000;
let lastEnemySpawn = 0;

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
    
    enemies.push({
        x,
        y,
        size: 20,
        speed: 2
    });
}

function shoot() {
    const now = Date.now();
    if (now - player.lastShot >= player.shootInterval) {
        // Create projectiles in 8 directions
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
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
}

function updateProjectiles() {
    for (let i = player.projectiles.length - 1; i >= 0; i--) {
        const projectile = player.projectiles[i];
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        
        // Remove projectiles that are off screen
        if (projectile.x < 0 || projectile.x > canvas.width ||
            projectile.y < 0 || projectile.y > canvas.height) {
            player.projectiles.splice(i, 1);
        }
    }
}

function updateEnemies() {
    const now = Date.now();
    if (now - lastEnemySpawn >= ENEMY_SPAWN_INTERVAL) {
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
        }
        
        // Check collision with projectiles
        for (let j = player.projectiles.length - 1; j >= 0; j--) {
            const projectile = player.projectiles[j];
            const pdx = projectile.x - enemy.x;
            const pdy = projectile.y - enemy.y;
            const pDistance = Math.sqrt(pdx * pdx + pdy * pdy);
            
            if (pDistance < enemy.size + projectile.size) {
                enemies.splice(i, 1);
                player.projectiles.splice(j, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
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

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw projectiles
    ctx.fillStyle = '#ff0';
    player.projectiles.forEach(projectile => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw enemies
    ctx.fillStyle = '#f00';
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw game over
    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Tap to restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

function gameLoop() {
    if (!gameOver) {
        updatePlayer();
        updateProjectiles();
        updateEnemies();
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
        scoreElement.textContent = 'Score: 0';
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.projectiles = [];
        enemies.length = 0;
        lastEnemySpawn = Date.now();
    }
});
