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
        
        // Set canvas size to full screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.running = false;
        this.inMenu = true;  // Start in menu state
        this.level = 1;
        this.kills = 0;
        this.killsNeededForLevel = 10;
        this.levelingUp = false;
        this.paused = false;
        
        // Upgrade counters
        this.upgrades = {
            speed: 0,
            damage: 0,
            fireRate: 0
        };
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        
        // Spawn timers
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120; // frames - slower spawn (fewer enemies)
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Mouse shooting state
        this.isMouseDown = false;
        this.lastShotTime = 0;
        this.shootInterval = 75; // milliseconds between shots (2x faster)
        
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
        this.level = 1;
        this.kills = 0;
        this.killsNeededForLevel = 10;
        this.levelingUp = false;
        this.upgrades = {
            speed: 0,
            damage: 0,
            fireRate: 0
        };
        
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
        // Ignore keyboard events when in menu
        if (this.inMenu) return;
        if (this.gameOver || !this.player) return;
        
        // Pause with Escape or Space
        if (e.key === 'Escape' || e.key === ' ') {
            this.togglePause();
            return;
        }
        
        this.player.handleKeyDown(e.key);
    }
    
    /**
     * Handle keyup event
     */
    boundKeyUp(e) {
        // Ignore keyboard events when in menu
        if (this.inMenu) return;
        if (this.gameOver || !this.player) return;
        this.player.handleKeyUp(e.key);
    }
    
    /**
     * Handle mouse move
     */
    boundMouseMove(e) {
        // Ignore mouse events when in menu
        if (this.inMenu) return;
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
        // Ignore mouse events when in menu
        if (this.inMenu) return;
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
        
        // Spawn bullet from player position
        const bullet = new Bullet(
            this.player.x + Math.cos(angle) * this.player.radius,
            this.player.y + Math.sin(angle) * this.player.radius,
            angle,
            this.player.damage
        );
        
        this.bullets.push(bullet);
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
        
        // Calculate difficulty multipliers based on level
        // Each level increases enemy stats by 10%
        const difficultyMultiplier = 1 + (this.level - 1) * 0.1;
        
        // Random enemy type - with higher levels, more fast and tank enemies appear
        let types = ['basic'];
        
        // Add more enemy types as level increases
        if (this.level >= 2) {
            types.push('basic'); // More basic enemies
        }
        if (this.level >= 3) {
            types.push('fast'); // Fast enemies start appearing
        }
        if (this.level >= 5) {
            types.push('fast', 'fast'); // More fast enemies
        }
        if (this.level >= 4) {
            types.push('tank'); // Tank enemies start appearing
        }
        if (this.level >= 7) {
            types.push('tank', 'tank'); // More tank enemies
        }
        
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Create enemy with difficulty scaling
        const enemy = new Enemy(x, y, type, difficultyMultiplier);
        this.enemies.push(enemy);
    }
    
    /**
     * Update game state
     */
    update() {
        if (this.gameOver || this.levelingUp || this.paused) return;
        
        // Auto-fire when mouse is held down
        if (this.isMouseDown) {
            const now = Date.now();
            if (now - this.lastShotTime >= this.player.shootInterval) {
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
                    enemy.takeDamage(bullet.damage);
                    bullet.active = false;
                    
                    // Add score for kill
                    if (!enemy.isAlive()) {
                        this.kills++;
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
                        // Check for level up
                        this.checkLevelUp();
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
        // Don't render game objects when in menu - just show background
        if (this.inMenu) {
            // Clear canvas with background color
            this.ctx.fillStyle = '#0f0f1a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // Draw grid background
            this.drawGrid();
            return;
        }
        
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
        const scoreEl = document.getElementById('scoreValue');
        const healthEl = document.getElementById('healthValue');
        const levelEl = document.getElementById('levelValue');
        const killsEl = document.getElementById('killsValue');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (healthEl) healthEl.textContent = this.player.health;
        if (levelEl) levelEl.textContent = this.level;
        if (killsEl) killsEl.textContent = this.kills + '/' + this.killsNeededForLevel;
    }
    
    /**
     * Check if player leveled up
     */
    checkLevelUp() {
        if (this.kills >= this.killsNeededForLevel && !this.levelingUp) {
            this.levelingUp = true;
            this.running = false;
            
            // Stop the game loop
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // Clear enemies and bullets
            this.enemies = [];
            this.bullets = [];
            
            this.showLevelUpScreen();
        }
    }
    
    /**
     * Show level up screen
     */
    showLevelUpScreen() {
        const gameOverEl = document.getElementById('gameOver');
        const levelUpEl = document.getElementById('levelUp');
        
        if (gameOverEl) gameOverEl.classList.add('hidden');
        if (levelUpEl) levelUpEl.classList.remove('hidden');
    }
    
    /**
     * Apply upgrade to player
     */
    applyUpgrade(type) {
        switch(type) {
            case 'speed':
                this.player.speed += 1.5;
                this.upgrades.speed++;
                break;
            case 'damage':
                this.player.damage += 1;
                this.upgrades.damage++;
                break;
            case 'fireRate':
                this.player.shootInterval = Math.max(30, this.player.shootInterval - 15);
                this.upgrades.fireRate++;
                break;
        }
        
        // Next level
        this.level++;
        this.kills = 0;
        this.killsNeededForLevel = Math.floor(this.killsNeededForLevel * 1.5);
        this.enemySpawnInterval = Math.max(40, this.enemySpawnInterval - 5);
        this.levelingUp = false;
        
        // Update upgrade display
        this.updateUpgradeUI();
        
        // Resume game
        const levelUpEl = document.getElementById('levelUp');
        if (levelUpEl) levelUpEl.classList.add('hidden');
        this.running = true;
        this.gameLoop();
    }
    
    /**
     * Update upgrade counts on UI
     */
    updateUpgradeUI() {
        const speedCountEl = document.getElementById('speedCount');
        const damageCountEl = document.getElementById('damageCount');
        const fireRateCountEl = document.getElementById('fireRateCount');
        
        if (speedCountEl) speedCountEl.textContent = this.upgrades.speed;
        if (damageCountEl) damageCountEl.textContent = this.upgrades.damage;
        if (fireRateCountEl) fireRateCountEl.textContent = this.upgrades.fireRate;
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        // Always render, even in menu or paused
        this.render();
        
        // Only update game objects when not in menu, not paused, and not gameover/levelingUp
        if (!this.inMenu && !this.paused && !this.gameOver && !this.levelingUp) {
            this.update();
        }
        
        if (!this.gameOver && !this.levelingUp) {
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    /**
     * Start only the render loop (for menu background)
     * Game objects won't be updated until start() is called
     */
    startRenderLoop() {
        if (this.running) return;
        
        console.log('[Game] Starting render loop (menu mode)...');
        this.running = true; // Set running so gameLoop works
        this.gameLoop();
    }
    
    /**
     * Start the game
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.init();
        console.log('[Game] Game started!');
        this.gameLoop();
    }
    
    /**
     * Start the game (from menu)
     */
    startGame() {
        this.inMenu = false;
        this.paused = false;
        this.start();
    }
    
    /**
     * Toggle pause
     */
    togglePause() {
        if (this.gameOver || this.levelingUp) return;
        
        if (this.paused) {
            this.paused = false;
            this.running = true;
            this.gameLoop();
        } else {
            this.paused = true;
            this.running = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }
    
    /**
     * Resume game
     */
    resume() {
        if (this.paused && !this.gameOver && !this.levelingUp) {
            this.paused = false;
            this.running = true;
            this.gameLoop();
        }
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
        const finalScoreEl = document.getElementById('finalScore');
        const gameOverEl = document.getElementById('gameOver');
        
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (gameOverEl) gameOverEl.classList.remove('hidden');
    }
    
    /**
     * Restart the game
     */
    restart() {
        this.inMenu = false;
        this.paused = false;
        document.getElementById('gameOver').classList.add('hidden');
        this.start();
    }
}
