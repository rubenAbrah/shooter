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
    level: 1,
    kills: 0,
    killsNeeded: 10,
    paused: false,
    inMenu: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Prevent multiple game instances
    if (!canvas || gameRef.current) return;

    // Create game instance
    const game = new Game(canvas);
    gameRef.current = game;
    
    console.log('[GameCanvas] Game instance created, waiting for START button...');
    
    // NOTE: Don't start any game loop until user clicks START button
    // The game will be started when user clicks the START button

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
      // Only update state when game is running (not in menu)
      if (gameRef.current && gameRef.current.player && !gameRef.current.inMenu) {
        setGameState(prev => ({
          score: gameRef.current.score,
          health: gameRef.current.player.health,
          gameOver: gameRef.current.gameOver,
          level: gameRef.current.level,
          kills: gameRef.current.kills,
          killsNeeded: gameRef.current.killsNeededForLevel,
          paused: gameRef.current.paused,
          inMenu: gameRef.current.inMenu,
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    console.log('[GameCanvas] handleStart called - starting game');
    if (gameRef.current) {
      gameRef.current.startGame();
      setGameState(prev => { 
        console.log('[GameCanvas] Setting inMenu to false');
        return ({ ...prev, inMenu: false, paused: false }); 
      });
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      setGameState({
        score: 0,
        health: 100,
        gameOver: false,
        level: 1,
        kills: 0,
        killsNeeded: 10,
        paused: false,
        inMenu: false,
      });
    }
  };

  const handleResume = () => {
    if (gameRef.current) {
      gameRef.current.resume();
      setGameState(prev => ({ ...prev, paused: false }));
    }
  };

  const handleUpgrade = (type) => {
    if (gameRef.current) {
      gameRef.current.applyUpgrade(type);
      setGameState(prev => ({
        ...prev,
        level: gameRef.current.level,
        kills: 0,
        killsNeeded: gameRef.current.killsNeededForLevel,
      }));
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
        <div id="level">
          Level: <span id="levelValue">{gameState.level || 1}</span>
        </div>
        <div id="kills">
          Kills: <span id="killsValue">{gameState.kills || 0}/{(gameState.killsNeeded || 10)}</span>
        </div>
        <div id="upgrades">
          <span>Прокачка: скорость движения <span id="speedCount">0</span> | урон <span id="damageCount">0</span> | скорость стрельбы <span id="fireRateCount">0</span></span>
        </div>
      </div>
      {gameState.inMenu && (
        <div id="mainMenu">
          <h1>КОСМОС</h1>
          <h2>СТРЕЛЯЛКА</h2>
          <div className="controls-info">
            <p>🎮 <strong>Управление:</strong></p>
            <p>WASD / Стрелки - движение</p>
            <p>Мышь - прицел</p>
            <p>ЛКМ - стрельба (зажать для авто-огня)</p>
            <p>ESC / Пробел - пауза</p>
          </div>
          <div className="game-info">
            <p>💀 Убивай врагов - получай уровни</p>
            <p>⬆️ Прокачивай персонажа между уровнями</p>
            <p>🏆 Набирай очки!</p>
          </div>
          <button id="startBtn" onClick={handleStart}>
            СТАРТ
          </button>
        </div>
      )}
      {gameState.gameOver && !gameState.inMenu && (
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
      {gameState.paused && !gameState.inMenu && !gameState.gameOver && (
        <div id="pauseMenu">
          <h1>ПАУЗА</h1>
          <button id="resumeBtn" onClick={handleResume}>
            ПРОДОЛЖИТЬ
          </button>
          <button id="restartBtn" onClick={handleRestart}>
            В НАЧАЛО
          </button>
        </div>
      )}
      <div id="levelUp" className="hidden">
        <h1>Повышение уровня!</h1>
        <p>Выберите способность:</p>
        <div className="upgrade-buttons">
          <button onClick={() => handleUpgrade('speed')}>
            Скорость движения
          </button>
          <button onClick={() => handleUpgrade('damage')}>
            Урон
          </button>
          <button onClick={() => handleUpgrade('fireRate')}>
            Скорость стрельбы
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameCanvas;
