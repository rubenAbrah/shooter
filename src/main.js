import { Game } from './Game.js';

/**
 * Main entry point for the shooter game
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // Create game instance
    const game = new Game(canvas);
    
    // Start the game
    game.start();
    
    // Setup restart button
    const restartBtn = document.getElementById('restartBtn');
    restartBtn.addEventListener('click', () => {
        game.restart();
    });
    
    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});
