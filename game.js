import Player from './player.js';
import EnemyManager from './enemy.js';
import ParticleSystem from './particles.js';
import Controls from './controls.js';
import Renderer from './renderer.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.joystickElement = document.getElementById('joystick');
        this.stickElement = document.getElementById('stick');

        this.setupCanvas();
        this.initializeGame();
        this.setupEventListeners();
        this.gameLoop();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    initializeGame() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;

        // Power-ups
        this.powerUps = {
            rapidFire: false,
            multiShot: false,
            firewall: false
        };

        // Initialize game systems
        this.player = new Player(this.canvas);
        this.enemyManager = new EnemyManager();
        this.particleSystem = new ParticleSystem();
        this.controls = new Controls(this.joystickElement, this.stickElement, this.player);
        this.renderer = new Renderer(this.canvas, this.ctx);
    }

    setupEventListeners() {
        this.canvas.addEventListener('touchstart', () => {
            if (this.gameOver) {
                this.resetGame();
            }
        });
    }

    resetGame() {
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.scoreElement.textContent = 'Score: 0';
        this.levelElement.textContent = 'Level 1';
        
        // Reset all systems
        this.player.reset(this.canvas);
        this.enemyManager.reset();
        this.particleSystem.reset();
        this.controls.reset();
        
        // Reset power-ups
        Object.keys(this.powerUps).forEach(key => this.powerUps[key] = false);
    }

    update() {
        if (this.gameOver) return;

        // Update game objects
        this.player.update(this.canvas);
        this.player.shoot(this.powerUps);
        this.player.updateProjectiles(this.canvas);
        
        // Update enemies and check collisions
        const result = this.enemyManager.update(
            this.canvas,
            this.player,
            this.level,
            this.particleSystem.createParticles.bind(this.particleSystem)
        );

        if (result === true) {
            this.gameOver = true;
        } else if (result && result.points) {
            this.score += result.points;
            this.player.xp += result.points;
            this.scoreElement.textContent = `Score: ${this.score}`;
            
            // Level up system
            if (this.player.xp >= this.player.xpToLevel) {
                this.player.level++;
                this.player.xp = 0;
                this.player.xpToLevel *= 1.5;
                this.level = this.player.level;
                this.levelElement.textContent = `Level ${this.level}`;
                
                // Random power-up
                const powerUpTypes = ['rapidFire', 'multiShot', 'firewall'];
                const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                this.powerUps[randomPowerUp] = true;
            }
        }

        this.particleSystem.update();
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawParticles(this.particleSystem.particles);
        this.renderer.drawPlayer(this.player);
        this.renderer.drawEnemies(this.enemyManager.enemies);
        
        if (this.gameOver) {
            this.renderer.drawGameOver(this.score);
        }
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
