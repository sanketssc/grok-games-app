"use client";

import { useEffect, useRef, useState } from "react";

export default function Classic1942() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPowerUpDetails, setShowPowerUpDetails] = useState(false);
  const gameStateRef = useRef({
    player: { x: 0, y: 0, width: 40, height: 40, speedBoost: 0, rapidFire: 0 },
    bullets: [] as { x: number; y: number }[],
    enemies: [] as {
      x: number;
      y: number;
      width: number;
      height: number;
      markedForDeletion: boolean;
    }[],
    powerUps: [] as {
      x: number;
      y: number;
      width: number;
      height: number;
      type: "speed" | "rapid" | "life";
      markedForDeletion: boolean;
    }[],
    lastBulletTime: 0,
    lastEnemyTime: 0,
    lastPowerUpTime: 0,
  });
  const pressedRef = useRef({ left: false, right: false });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setInitialCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth * 0.9, 480);
      const maxHeight = Math.min(window.innerHeight * 0.65, 640);
      const aspectRatio = 480 / 640;

      let newWidth = maxWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      const scaleX = newWidth / 480;
      const scaleY = newHeight / 640;

      if (
        gameStateRef.current.player.x === 0 &&
        gameStateRef.current.player.y === 0
      ) {
        gameStateRef.current.player = {
          x: newWidth / 2 - 20 * scaleX,
          y: newHeight - 60 * scaleY,
          width: 40 * scaleX,
          height: 40 * scaleY,
          speedBoost: 0,
          rapidFire: 0,
        };
      } else {
        const oldScaleX = canvas.width / 480;
        const oldScaleY = canvas.height / 640;
        gameStateRef.current.player.x *= scaleX / oldScaleX;
        gameStateRef.current.player.y *= scaleY / oldScaleY;
        gameStateRef.current.player.width = 40 * scaleX;
        gameStateRef.current.player.height = 40 * scaleY;
      }
    };

    let resizeTimeout: NodeJS.Timeout;
    const debounceResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setInitialCanvasSize, 100);
    };

    setInitialCanvasSize();
    window.addEventListener("resize", debounceResize);

    // Event listeners for keyboard
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight")
        pressedRef.current.right = true;
      else if (e.key === "Left" || e.key === "ArrowLeft")
        pressedRef.current.left = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight")
        pressedRef.current.right = false;
      else if (e.key === "Left" || e.key === "ArrowLeft")
        pressedRef.current.left = false;
    };
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    // Game loop with fixed time step
    let lastTime = 0;
    const fixedTimeStep = 1000 / 60;
    const POWER_UP_DURATION = 10000;

    const draw = (timestamp: number) => {
      if (!ctx) return;

      const deltaTime = Math.min(timestamp - lastTime, 100);
      lastTime = timestamp;

      const state = gameStateRef.current;
      const scaleX = canvas.width / 480;
      const scaleY = canvas.height / 640;

      // Difficulty scaling
      const spawnInterval = Math.max(300, 1000 - score * 20);
      const enemyBaseSpeed = 3 * scaleY;
      const enemySpeedIncrease = Math.min(3, score * 0.05);
      const enemySpeed = enemyBaseSpeed + enemySpeedIncrease;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Player movement with power-up boost
      const basePlayerSpeed = 5 * scaleX;
      const playerSpeed =
        state.player.speedBoost > 0 ? basePlayerSpeed * 1.5 : basePlayerSpeed;
      if (!gameOver) {
        if (
          pressedRef.current.right &&
          state.player.x < canvas.width - state.player.width
        )
          state.player.x += playerSpeed * (deltaTime / fixedTimeStep);
        if (pressedRef.current.left && state.player.x > 0)
          state.player.x -= playerSpeed * (deltaTime / fixedTimeStep);
      }
      if (state.player.speedBoost > 0) state.player.speedBoost -= deltaTime;

      // Draw player
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
      );

      // Shoot bullets with rapid fire power-up
      const bulletInterval = state.player.rapidFire > 0 ? 100 : 200;
      if (
        !gameOver &&
        timestamp - state.lastBulletTime > bulletInterval &&
        state.bullets.length < 20
      ) {
        state.bullets.push({
          x: state.player.x + state.player.width / 2 - 2 * scaleX,
          y: state.player.y - 5 * scaleY,
        });
        state.lastBulletTime = timestamp;
      }
      if (state.player.rapidFire > 0) state.player.rapidFire -= deltaTime;

      // Move and draw bullets
      const bulletSpeed = 7 * scaleY;
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        state.bullets[i].y -= bulletSpeed * (deltaTime / fixedTimeStep);
        if (state.bullets[i].y < -10 * scaleY) {
          state.bullets.splice(i, 1);
          continue;
        }
        ctx.fillStyle = "#333333";
        ctx.fillRect(
          state.bullets[i].x,
          state.bullets[i].y,
          4 * scaleX,
          10 * scaleY
        );
      }

      // Spawn enemies
      if (
        !gameOver &&
        timestamp - state.lastEnemyTime > spawnInterval &&
        state.enemies.length < 10
      ) {
        state.enemies.push({
          x: Math.random() * (canvas.width - 30 * scaleX),
          y: -30 * scaleY,
          width: 30 * scaleX,
          height: 30 * scaleY,
          markedForDeletion: false,
        });
        state.lastEnemyTime = timestamp;
      }

      // Spawn power-ups (every 10 seconds, max 1 on screen)
      if (
        !gameOver &&
        timestamp - state.lastPowerUpTime > 10000 &&
        state.powerUps.length < 1
      ) {
        const types: ("speed" | "rapid" | "life")[] = [
          "speed",
          "rapid",
          "life",
        ];
        state.powerUps.push({
          x: Math.random() * (canvas.width - 20 * scaleX),
          y: -20 * scaleY,
          width: 20 * scaleX,
          height: 20 * scaleY,
          type: types[Math.floor(Math.random() * types.length)],
          markedForDeletion: false,
        });
        state.lastPowerUpTime = timestamp;
      }

      // Move and draw enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        if (state.enemies[i].markedForDeletion) continue;

        state.enemies[i].y += enemySpeed * (deltaTime / fixedTimeStep);
        if (state.enemies[i].y > canvas.height) {
          state.enemies[i].markedForDeletion = true;
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) setGameOver(true);
            return newLives;
          });
          continue;
        }

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(
          state.enemies[i].x,
          state.enemies[i].y,
          state.enemies[i].width,
          state.enemies[i].height
        );

        // Check collision with player
        if (
          !gameOver &&
          state.enemies[i].x < state.player.x + state.player.width &&
          state.enemies[i].x + state.enemies[i].width > state.player.x &&
          state.enemies[i].y < state.player.y + state.player.height &&
          state.enemies[i].y + state.enemies[i].height > state.player.y
        ) {
          state.enemies[i].markedForDeletion = true;
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) setGameOver(true);
            return newLives;
          });
          continue;
        }

        // Check collision with bullets
        for (let j = state.bullets.length - 1; j >= 0; j--) {
          if (
            state.bullets[j].x < state.enemies[i].x + state.enemies[i].width &&
            state.bullets[j].x + 4 * scaleX > state.enemies[i].x &&
            state.bullets[j].y < state.enemies[i].y + state.enemies[i].height &&
            state.bullets[j].y + 10 * scaleY > state.enemies[i].y
          ) {
            state.enemies[i].markedForDeletion = true;
            state.bullets.splice(j, 1);
            setScore((prev) => prev + 1);
            break;
          }
        }
      }

      // Move and draw power-ups
      const powerUpSpeed = 2 * scaleY;
      for (let i = state.powerUps.length - 1; i >= 0; i--) {
        if (state.powerUps[i].markedForDeletion) continue;

        state.powerUps[i].y += powerUpSpeed * (deltaTime / fixedTimeStep);
        if (state.powerUps[i].y > canvas.height) {
          state.powerUps[i].markedForDeletion = true;
          continue;
        }

        ctx.fillStyle =
          state.powerUps[i].type === "speed"
            ? "#00FFFF"
            : state.powerUps[i].type === "rapid"
            ? "#FF00FF"
            : "#FFFF00";
        ctx.fillRect(
          state.powerUps[i].x,
          state.powerUps[i].y,
          state.powerUps[i].width,
          state.powerUps[i].height
        );

        // Check collision with player
        if (
          !gameOver &&
          state.powerUps[i].x < state.player.x + state.player.width &&
          state.powerUps[i].x + state.powerUps[i].width > state.player.x &&
          state.powerUps[i].y < state.player.y + state.player.height &&
          state.powerUps[i].y + state.powerUps[i].height > state.player.y
        ) {
          state.powerUps[i].markedForDeletion = true;
          switch (state.powerUps[i].type) {
            case "speed":
              state.player.speedBoost = POWER_UP_DURATION;
              break;
            case "rapid":
              state.player.rapidFire = POWER_UP_DURATION;
              break;
            case "life":
              setLives((prev) => Math.min(prev + 1, 5));
              break;
          }
        }
      }

      // Clean up marked enemies and power-ups
      state.enemies = state.enemies.filter((enemy) => !enemy.markedForDeletion);
      state.powerUps = state.powerUps.filter(
        (powerUp) => !powerUp.markedForDeletion
      );

      // Draw power-up indicators with timer bars
      const barWidth = 50 * scaleX;
      const barHeight = 10 * scaleY;
      if (state.player.speedBoost > 0) {
        const progress = state.player.speedBoost / POWER_UP_DURATION;
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(10 * scaleX, 10 * scaleY, barWidth * progress, barHeight);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1 * scaleX;
        ctx.strokeRect(10 * scaleX, 10 * scaleY, barWidth, barHeight);
      }
      if (state.player.rapidFire > 0) {
        const progress = state.player.rapidFire / POWER_UP_DURATION;
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(
          canvas.width - 60 * scaleX,
          10 * scaleY,
          barWidth * progress,
          barHeight
        );
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1 * scaleX;
        ctx.strokeRect(
          canvas.width - 60 * scaleX,
          10 * scaleY,
          barWidth,
          barHeight
        );
      }

      if (!gameOver) animationFrameRef.current = requestAnimationFrame(draw);
    };

    if (gameStarted) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      if (animationFrameRef.current !== null)
        cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(resizeTimeout);
    };
  }, [gameStarted, gameOver, lives]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setShowPowerUpDetails(false);
    gameStateRef.current.bullets = [];
    gameStateRef.current.enemies = [];
    gameStateRef.current.powerUps = [];
    pressedRef.current.left = false;
    pressedRef.current.right = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const scaleX = canvas.width / 480;
      const scaleY = canvas.height / 640;
      gameStateRef.current.player = {
        x: canvas.width / 2 - 20 * scaleX,
        y: canvas.height - 60 * scaleY,
        width: 40 * scaleX,
        height: 40 * scaleY,
        speedBoost: 0,
        rapidFire: 0,
      };
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setLives(3);
    setShowPowerUpDetails(false);
    gameStateRef.current.bullets = [];
    gameStateRef.current.enemies = [];
    gameStateRef.current.powerUps = [];
    pressedRef.current.left = false;
    pressedRef.current.right = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const scaleX = canvas.width / 480;
      const scaleY = canvas.height / 640;
      gameStateRef.current.player = {
        x: canvas.width / 2 - 20 * scaleX,
        y: canvas.height - 60 * scaleY,
        width: 40 * scaleX,
        height: 40 * scaleY,
        speedBoost: 0,
        rapidFire: 0,
      };
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[480px] mx-auto">
      {!gameStarted ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Classic 1942</h1>
          <div className="bg-gray-800 text-white p-4 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Power-Ups</h2>
            <ul className="text-left">
              <li className="mb-2">
                <span className="inline-block w-4 h-4 bg-cyan-400 mr-2"></span>
                <strong>Speed Boost</strong>: Increases player speed by 50% for
                10 seconds (Cyan).
              </li>
              <li className="mb-2">
                <span className="inline-block w-4 h-4 bg-magenta-400 mr-2"></span>
                <strong>Rapid Fire</strong>: Doubles bullet firing rate for 10
                seconds (Magenta).
              </li>
              <li>
                <span className="inline-block w-4 h-4 bg-yellow-400 mr-2"></span>
                <strong>Extra Life</strong>: Grants an additional life, up to 5
                (Yellow).
              </li>
            </ul>
          </div>
          <button
            onClick={startGame}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-4">
            <span>Score: {score}</span>
            <span>Lives: {lives}</span>
          </div>
          {gameOver && (
            <div className="text-center">
              <p className="text-red-600 text-xl mb-2">Game Over!</p>
              <p className="text-gray-600 mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Play Again
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="border border-gray-300 w-full" />
          <button
            onClick={() => setShowPowerUpDetails((prev) => !prev)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2"
          >
            {showPowerUpDetails
              ? "Hide Power-Up Details"
              : "Show Power-Up Details"}
          </button>
          {showPowerUpDetails && (
            <div className="bg-gray-800 text-white p-4 rounded w-full">
              <h3 className="text-lg font-semibold mb-2">Active Power-Ups</h3>
              {gameStateRef.current.player.speedBoost > 0 ? (
                <p>
                  Speed Boost:{" "}
                  {(gameStateRef.current.player.speedBoost / 1000).toFixed(1)}s
                  remaining
                </p>
              ) : (
                <p>No Speed Boost active</p>
              )}
              {gameStateRef.current.player.rapidFire > 0 ? (
                <p>
                  Rapid Fire:{" "}
                  {(gameStateRef.current.player.rapidFire / 1000).toFixed(1)}s
                  remaining
                </p>
              ) : (
                <p>No Rapid Fire active</p>
              )}
            </div>
          )}
          {/* Mobile controls */}
          <div className="flex gap-4 mt-4 md:hidden">
            <button
              onTouchStart={() => (pressedRef.current.left = true)}
              onTouchEnd={() => (pressedRef.current.left = false)}
              className="bg-gray-700 text-white px-6 py-3 rounded-full text-lg font-bold active:bg-gray-900 select-none focus:outline-none"
            >
              Left
            </button>
            <button
              onTouchStart={() => (pressedRef.current.right = true)}
              onTouchEnd={() => (pressedRef.current.right = false)}
              className="bg-gray-700 text-white px-6 py-3 rounded-full text-lg font-bold active:bg-gray-900 select-none focus:outline-none"
            >
              Right
            </button>
          </div>
        </>
      )}
    </div>
  );
}
