"use client";

import { useEffect, useRef, useState } from "react";

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 320 });
  const pressedRef = useRef({ left: false, right: false });

  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth * 0.9, 480); // 90% of viewport width, max 480
      const maxHeight = Math.min(window.innerHeight * 0.6, 320); // 60% of viewport height, max 320
      const aspectRatio = 480 / 320; // 3:2 aspect ratio

      let newWidth = maxWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }

      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale factors based on current canvas size
    const scaleX = canvasSize.width / 480;
    const scaleY = canvasSize.height / 320;

    // Game variables (scaled)
    const ballRadius = 10 * scaleX;
    let x = canvasSize.width / 2;
    let y = canvasSize.height - 30 * scaleY;
    let dx = 2 * scaleX;
    let dy = -2 * scaleY;
    const paddleHeight = 10 * scaleY;
    const paddleWidth = 75 * scaleX;
    let paddleX = (canvasSize.width - paddleWidth) / 2;
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75 * scaleX;
    const brickHeight = 20 * scaleY;
    const brickPadding = 10 * scaleX;
    const brickOffsetTop = 30 * scaleY;
    const brickOffsetLeft = 30 * scaleX;

    // Create bricks
    const bricks: { x: number; y: number; status: number }[][] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

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

    // Check if all bricks are cleared
    const checkWinCondition = () => {
      let remainingBricks = 0;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            remainingBricks++;
          }
        }
      }
      return remainingBricks === 0;
    };

    // Game loop
    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw ball
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();

      // Draw paddle
      ctx.beginPath();
      ctx.rect(
        paddleX,
        canvasSize.height - paddleHeight,
        paddleWidth,
        paddleHeight
      );
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();

      // Draw bricks
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
          }
        }
      }

      // Ball movement
      x += dx;
      y += dy;

      // Paddle movement using ref values
      if (pressedRef.current.right && paddleX < canvasSize.width - paddleWidth)
        paddleX += 7 * scaleX;
      if (pressedRef.current.left && paddleX > 0) paddleX -= 7 * scaleX;

      // Collision detection
      if (x + dx > canvasSize.width - ballRadius || x + dx < ballRadius)
        dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvasSize.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else {
          setGameOver(true);
          return;
        }
      }

      // Brick collision
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              x > b.x &&
              x < b.x + brickWidth &&
              y > b.y &&
              y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              setScore((prev) => prev + 1);

              // Check win condition after each brick hit
              if (checkWinCondition()) {
                setGameWon(true);
                return;
              }
            }
          }
        }
      }

      if (!gameOver && !gameWon) requestAnimationFrame(draw);
    };

    draw();

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, [gameOver, gameWon, canvasSize]);

  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    pressedRef.current.left = false;
    pressedRef.current.right = false;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[480px] mx-auto">
      <div>Score: {score}</div>
      {gameOver && (
        <div className="text-center">
          <p className="text-red-600 text-xl mb-2">Game Over!</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
      {gameWon && (
        <div className="text-center">
          <p className="text-green-600 text-xl mb-2">
            Congratulations! You Won!
          </p>
          <p className="text-gray-600 mb-4">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border border-gray-300 w-full"
      />
      {/* Mobile controls */}
      <div className="flex gap-4 mt-4 md:hidden">
        <button
          onTouchStart={() => (pressedRef.current.left = true)}
          onTouchEnd={() => (pressedRef.current.left = false)}
          className="bg-gray-700 text-white px-6 py-3 rounded-full text-lg font-bold active:bg-gray-900"
        >
          Left
        </button>
        <button
          onTouchStart={() => (pressedRef.current.right = true)}
          onTouchEnd={() => (pressedRef.current.right = false)}
          className="bg-gray-700 text-white px-6 py-3 rounded-full text-lg font-bold active:bg-gray-900"
        >
          Right
        </button>
      </div>
    </div>
  );
}
