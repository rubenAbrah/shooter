import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js';

/**
 * Game class - main game controller with game loop
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 900;
        this.canvas.height = 600;
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.running = false;
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        
        // Spawn timers
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60; // frames
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Mouse shooting state
        this.isMouseDown = false;
        this.lastShotTime = 0;
        this.shootInterval = 150; // milliseconds between shots
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.boundKeyDown = this.boundKeyDown.bind(this);
        this.boundKeyUp = this.boundKeyUp.bind(this);
        this.boundMouseMove = this.boundMouseMove.bind(this);
        this.boundMouseDown = this.boundMouseDown.bind(this);
        this.boundMouseUp = this.boundMouseUp.bind(this);
        
        // Initialize game
        this.init();
    }
    
    /**
     * Initialize game objects
     */
    init() {
        // Create player at center
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        this.player.setCanvasDimensions(this.canvas.width, this.canvas.height);
        
        // Clear arrays
        this.bullets = [];
        this.enemies = [];
        
        // Reset score and state
        this.score = 0;
        this.gameOver = false;
        this.enemySpawnTimer = 0;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup keyboard and mouse event listeners
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mouseup', this.boundMouseUp);
    }
    
    /**
     * Remove event listeners (for cleanup)
     */
    removeEventListeners() {
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        this.canvas.removeEventListener('mousemove', this.boundMouseMove);
        this.canvas.removeEventListener('mousedown', this.boundMouseDown);
        window.removeEventListener('mouseup', this.boundMouseUp);
    }
    
    /**
     * Handle keydown event
     */
    boundKeyDown(e) {
        if (this.gameOver || !this.player) return;
        this.player.handleKeyDown(e.key);
    }
    
    /**
     * Handle keyup event
     */
    boundKeyUp(e) {
        if (this.gameOver || !this.player) return;
        this.player.handleKeyUp(e.key);
    }
    
    /**
     * Handle mouse move
     */
    boundMouseMove(e) {
        if (this.gameOver || !this.player) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.player.handleMouseMove(mouseX, mouseY);
    }
    
    /**
     * Handle mouse down (start shooting)
     */
    boundMouseDown(e) {
        if (this.gameOver || !this.player) return;
        this.isMouseDown = true;
    }
    
    /**
     * Handle mouse up (stop shooting)
     */
    boundMouseUp(e) {
        this.isMouseDown = false;
    }
    
    /**
     * Player shoots a bullet
     */
    shoot() {
        const angle = this.player.getAimAngle();
        
        // Shoot 3 bullets in a spread pattern
        const spreadAngles = [-0.15, 0, 0.15]; // radians
        
        spreadAngles.forEach(spread => {
            const bulletAngle = angle + spread;
            
            // Spawn bullet from player position
            const bullet = new Bullet(
                this.player.x + Math.cos(bulletAngle) * this.player.radius,
                this.player.y + Math.sin(bulletAngle) * this.player.radius,
                bulletAngle
            );
            
            this.bullets.push(bullet);
        });
    }
    
    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        // Random spawn position on edges
        let x, y;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -30;
                break;
            case 1: // Right
                x = this.canvas.width + 30;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 30;
                break;
            case 3: // Left
                x = -30;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        // Random enemy type
        const types = ['basic', 'basic', 'basic', 'fast', 'tank'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const enemy = new Enemy(x, y, type);
        this.enemies.push(enemy);
    }
    
    /**
     * Update game state
     */
    update() {
        if (this.gameOver) return;
        
        // Auto-fire when mouse is held down
        if (this.isMouseDown) {
            const now = Date.now();
            if (now - this.lastShotTime >= this.shootInterval) {
                this.shoot();
                this.lastShotTime = now;
            }
        }
        
        // Update player
        this.player.update();
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(this.canvas.width, this.canvas.height);
            return bullet.active;
        });
        
        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.player.x, this.player.y);
            return enemy.active;
        });
        
        // Check bullet-enemy collisions
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            this.enemies.forEach(enemy => {
                if (!enemy.active) return;
                
                if (bullet.checkCollision(enemy)) {
                    enemy.takeDamage(1);
                    bullet.active = false;
                    
                    // Add score for kill
                    if (!enemy.isAlive()) {
                        switch (enemy.type) {
                            case 'fast':
                                this.score += 30;
                                break;
                            case 'tank':
                                this.score += 50;
                                break;
                            default:
                                this.score += 10;
                        }
                    }
                }
            });
        });
        
        // Check player-enemy collisions
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            if (enemy.checkCollision(this.player.x, this.player.y, this.player.radius)) {
                this.player.takeDamage(enemy.damage);
                enemy.takeDamage(100); // Enemy dies on collision
                
                if (!this.player.isAlive()) {
                    this.endGame();
                }
            }
        });
        
        // Spawn enemies
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            
            // Make spawning faster over time
            if (this.enemySpawnInterval > 20) {
                this.enemySpawnInterval--;
            }
        }
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Render game to canvas
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background
        this.drawGrid();
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
    }
    
    /**
     * Draw background grid
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(74, 74, 106, 0.2)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('healthValue').textContent = this.player.health;
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        this.update();
        this.render();
        
        if (!this.gameOver) {
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    /**
     * Start the game
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.init();
        this.gameLoop();
    }
    
    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        this.running = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    /**
     * Restart the game
     */
    restart() {
        document.getElementById('gameOver').classList.add('hidden');
        this.start();
    }
}
