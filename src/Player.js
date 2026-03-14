/**
 * Player class - represents the game player
 */
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = '#00ff88';
        this.speed = 5;
        this.health = 100;
        
        // Movement state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Mouse position for aiming
        this.mouseX = x;
        this.mouseY = y;
        
        // Canvas dimensions
        this.canvasWidth = 0;
        this.canvasHeight = 0;
    }
    
    /**
     * Set canvas dimensions
     */
    setCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    
    /**
     * Handle keydown event
     */
    handleKeyDown(key) {
        const keyLower = key.toLowerCase();
        if (this.keys.hasOwnProperty(keyLower)) {
            this.keys[keyLower] = true;
        }
    }
    
    /**
     * Handle keyup event
     */
    handleKeyUp(key) {
        const keyLower = key.toLowerCase();
        if (this.keys.hasOwnProperty(keyLower)) {
            this.keys[keyLower] = false;
        }
    }
    
    /**
     * Handle mouse move event
     */
    handleMouseMove(mouseX, mouseY) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }
    
    /**
     * Update player position
     */
    update() {
        // Movement based on keys
        if (this.keys.w && this.y - this.radius > 0) {
            this.y -= this.speed;
        }
        if (this.keys.s && this.y + this.radius < this.canvasHeight) {
            this.y += this.speed;
        }
        if (this.keys.a && this.x - this.radius > 0) {
            this.x -= this.speed;
        }
        if (this.keys.d && this.x + this.radius < this.canvasWidth) {
            this.x += this.speed;
        }
    }
    
    /**
     * Draw player on canvas
     */
    draw(ctx) {
        ctx.save();
        
        // Draw player body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#00cc6a';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw aim direction indicator
        const angle = Math.atan2(this.mouseY - this.y, this.mouseX - this.x);
        const indicatorLength = this.radius + 15;
        
        ctx.beginPath();
        ctx.moveTo(
            this.x + Math.cos(angle) * this.radius,
            this.y + Math.sin(angle) * this.radius
        );
        ctx.lineTo(
            this.x + Math.cos(angle) * indicatorLength,
            this.y + Math.sin(angle) * indicatorLength
        );
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Get aim angle in radians
     */
    getAimAngle() {
        return Math.atan2(this.mouseY - this.y, this.mouseX - this.x);
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }
    
    /**
     * Check if player is alive
     */
    isAlive() {
        return this.health > 0;
    }
    
    /**
     * Reset player state
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.keys = { w: false, a: false, s: false, d: false };
    }
}
