/**
 * Enemy class - represents enemies that chase the player
 */
export class Enemy {
    constructor(x, y, type = 'basic', difficultyMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Apply difficulty multiplier to all stats
        const multiplier = difficultyMultiplier;
        
        // Set properties based on enemy type
        switch (type) {
            case 'fast':
                this.radius = 15;
                this.color = '#ff6b6b';
                this.speed = 3 * multiplier;
                this.health = Math.ceil(1 * multiplier);
                this.damage = Math.ceil(10 * multiplier);
                break;
            case 'tank':
                this.radius = 30;
                this.color = '#9b59b6';
                this.speed = 1 * multiplier;
                this.health = Math.ceil(5 * multiplier);
                this.damage = Math.ceil(25 * multiplier);
                break;
            case 'basic':
            default:
                this.radius = 20;
                this.color = '#ff9f43';
                this.speed = 2 * multiplier;
                this.health = Math.ceil(2 * multiplier);
                this.damage = Math.ceil(15 * multiplier);
                break;
        }
        
        this.maxHealth = this.health;
        this.active = true;
    }
    
    /**
     * Update enemy position - chase the player
     */
    update(playerX, playerY) {
        const angle = Math.atan2(playerY - this.y, playerX - this.x);
        
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
    
    /**
     * Draw enemy on canvas
     */
    draw(ctx) {
        ctx.save();
        
        // Draw enemy body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw health indicator for damaged enemies
        if (this.health < this.maxHealth) {
            const healthBarWidth = this.radius * 2;
            const healthBarHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(
                this.x - this.radius,
                this.y - this.radius - 10,
                healthBarWidth,
                healthBarHeight
            );
            
            // Health
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(
                this.x - this.radius,
                this.y - this.radius - 10,
                healthBarWidth * healthPercent,
                healthBarHeight
            );
        }
        
        ctx.restore();
    }
    
    /**
     * Check collision with another object (player or bullet)
     */
    checkCollision(otherX, otherY, otherRadius) {
        const dx = this.x - otherX;
        const dy = this.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + otherRadius;
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
        }
    }
    
    /**
     * Check if enemy is alive
     */
    isAlive() {
        return this.active;
    }
}
