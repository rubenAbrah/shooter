/**
 * Bullet class - represents a projectile fired by the player
 */
export class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = '#ffff00';
        this.speed = 12;
        this.angle = angle;
        
        // Calculate velocity based on angle
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        // Track if bullet is active
        this.active = true;
    }
    
    /**
     * Update bullet position
     */
    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Deactivate if out of bounds
        if (this.x < 0 || this.x > canvasWidth ||
            this.y < 0 || this.y > canvasHeight) {
            this.active = false;
        }
    }
    
    /**
     * Draw bullet on canvas
     */
    draw(ctx) {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Check collision with enemy
     */
    checkCollision(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + enemy.radius;
    }
}
