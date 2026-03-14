import { useEffect, useRef, useState } from 'react';
import { Game } from './Game.js';

/**
 * React wrapper component for the shooter game
 */
function GameCanvas() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState({
    score: 0,
    health: 100,
    gameOver: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Prevent multiple game instances
    if (!canvas || gameRef.current) return;

    // Create game instance
    const game = new Game(canvas);
    gameRef.current = game;

    // Start the game
    game.start();

    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.running = false;
        gameRef.current.removeEventListeners();
        if (gameRef.current.animationFrameId) {
          cancelAnimationFrame(gameRef.current.animationFrameId);
        }
        gameRef.current = null;
      }
    };
  }, []);

  // Update UI state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRef.current && gameRef.current.player) {
        setGameState({
          score: gameRef.current.score,
          health: gameRef.current.player.health,
          gameOver: gameRef.current.gameOver,
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      setGameState({
        score: 0,
        health: 100,
        gameOver: false,
      });
    }
  };

  return (
    <div id="game-container">
      <canvas id="gameCanvas" ref={canvasRef}></canvas>
      <div id="ui">
        <div id="score">
          Score: <span id="scoreValue">{gameState.score}</span>
        </div>
        <div id="health">
          Health: <span id="healthValue">{gameState.health}</span>
        </div>
      </div>
      {gameState.gameOver && (
        <div id="gameOver">
          <h1>Game Over</h1>
          <p>
            Final Score: <span id="finalScore">{gameState.score}</span>
          </p>
          <button id="restartBtn" onClick={handleRestart}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default GameCanvas;
