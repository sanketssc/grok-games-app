"use client";

import { useEffect, useRef, useState } from "react";

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 840 });
  const pacmanRef = useRef({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    nextDx: 0,
    nextDy: 0,
    moving: false,
    lastMoveTime: 0,
  });
  const ghostsRef = useRef<
    {
      x: number;
      y: number;
      dx: number;
      dy: number;
      color: string;
      moving: boolean;
      lastMoveTime: number;
      speedScale: number;
      behavior: "follow" | "random" | "patrol";
      prevDx?: number;
      prevDy?: number;
    }[]
  >([]);
  const dotsRef = useRef<{ x: number; y: number; collected: boolean }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Updated maze with 6-tile (3x3) middle block and teleport passages
  const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1], // Middle row with 3x3 block from (8,9) to (10,11)
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Teleport passage
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  useEffect(() => {
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);

    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth * 0.9, 760);
      const maxHeight = Math.min(window.innerHeight * 0.8, 840);
      const aspectRatio = 760 / 840;

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
    if (isMobile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game variables
    const tileSize = canvasSize.width / 19;
    const pacmanMoveInterval = 200; // 0.2 seconds in milliseconds
    const ghostMoveInterval = 400; // 0.4 seconds in milliseconds
    const pacmanSpeed = tileSize; // Full tile jump for Pac-Man
    const ghostSpeed = tileSize; // Full tile jump for ghosts

    // Initialize Pac-Man
    pacmanRef.current = {
      x: tileSize,
      y: tileSize,
      dx: 0,
      dy: 0,
      nextDx: 0,
      nextDy: 0,
      moving: false,
      lastMoveTime: 0,
    };

    // Initialize three ghosts at center open space (9, 10) with different behaviors
    ghostsRef.current = [
      {
        x: tileSize * 9,
        y: tileSize * 10,
        dx: ghostSpeed,
        dy: 0,
        color: "#FF0000",
        moving: false,
        lastMoveTime: 0,
        speedScale: 1.0,
        behavior: "follow",
      }, // Follows Pac-Man
      {
        x: tileSize * 9,
        y: tileSize * 10,
        dx: -ghostSpeed,
        dy: 0,
        color: "#FFB8FF",
        moving: false,
        lastMoveTime: 0,
        speedScale: 0.8,
        behavior: "random",
      }, // Random movement
      {
        x: tileSize * 9,
        y: tileSize * 10,
        dx: 0,
        dy: -ghostSpeed,
        color: "#00FFFF",
        moving: false,
        lastMoveTime: 0,
        speedScale: 1.2,
        behavior: "patrol",
        prevDx: 0,
        prevDy: -ghostSpeed,
      }, // Patrols
    ];

    // Verify initial positions are in open spaces
    ghostsRef.current.forEach((ghost) => {
      const tileX = Math.floor((ghost.x + tileSize / 2) / tileSize);
      const tileY = Math.floor((ghost.y + tileSize / 2) / tileSize);
      if (maze[tileY][tileX] === 1) {
        console.error(`Ghost spawned on wall at (${tileX}, ${tileY})`);
      }
    });

    // Initialize dots
    dotsRef.current = [];
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === 0) {
          dotsRef.current.push({
            x: x * tileSize + tileSize / 2,
            y: y * tileSize + tileSize / 2,
            collected: false,
          });
        }
      }
    }

    // Event listeners for keyboard
    const keyDownHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "ArrowRight":
          pacmanRef.current.nextDx = pacmanSpeed;
          pacmanRef.current.nextDy = 0;
          break;
        case "ArrowLeft":
          pacmanRef.current.nextDx = -pacmanSpeed;
          pacmanRef.current.nextDy = 0;
          break;
        case "ArrowUp":
          pacmanRef.current.nextDx = 0;
          pacmanRef.current.nextDy = -pacmanSpeed;
          break;
        case "ArrowDown":
          pacmanRef.current.nextDx = 0;
          pacmanRef.current.nextDy = pacmanSpeed;
          break;
      }
    };
    document.addEventListener("keydown", keyDownHandler);

    // Game loop
    const draw = (timestamp: number) => {
      if (!ctx) return;

      // Set dark background
      ctx.fillStyle = "#1A1A1A"; // Dark gray
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw maze
      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
          if (maze[y][x] === 1) {
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          }
        }
      }

      // Move and draw Pac-Man (1 block per 0.2s, block-by-block)
      if (
        pacmanRef.current.moving ||
        pacmanRef.current.nextDx !== 0 ||
        pacmanRef.current.nextDy !== 0
      ) {
        if (timestamp - pacmanRef.current.lastMoveTime >= pacmanMoveInterval) {
          pacmanRef.current.dx = pacmanRef.current.nextDx;
          pacmanRef.current.dy = pacmanRef.current.nextDy;
          const newX = pacmanRef.current.x + pacmanRef.current.dx;
          const newY = pacmanRef.current.y + pacmanRef.current.dy;
          const pacmanTileX = Math.floor((newX + tileSize / 2) / tileSize);
          const pacmanTileY = Math.floor((newY + tileSize / 2) / tileSize);

          // Teleport if crossing middle passage (row 10, columns 0 or 18)
          if (pacmanTileY === 10 && pacmanTileX === 0) {
            pacmanRef.current.x = tileSize * 17; // Teleport to right side
          } else if (pacmanTileY === 10 && pacmanTileX === 18) {
            pacmanRef.current.x = tileSize; // Teleport to left side
          } else if (
            pacmanTileX >= 0 &&
            pacmanTileX < maze[0].length &&
            pacmanTileY >= 0 &&
            pacmanTileY < maze.length &&
            maze[pacmanTileY][pacmanTileX] !== 1
          ) {
            pacmanRef.current.x = newX;
            pacmanRef.current.y = newY;
          }

          pacmanRef.current.moving =
            pacmanRef.current.dx !== 0 || pacmanRef.current.dy !== 0;
          pacmanRef.current.lastMoveTime = timestamp;
        }
      }

      ctx.beginPath();
      ctx.arc(
        pacmanRef.current.x + tileSize / 2,
        pacmanRef.current.y + tileSize / 2,
        tileSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#FFFF00";
      ctx.fill();
      ctx.closePath();

      // Move and draw ghosts (1 block per 0.4s base, block-by-block)
      ghostsRef.current.forEach((ghost) => {
        if (
          timestamp - ghost.lastMoveTime >=
          ghostMoveInterval / ghost.speedScale
        ) {
          if (ghost.moving) {
            const newGhostX = ghost.x + ghost.dx;
            const newGhostY = ghost.y + ghost.dy;
            const ghostTileX = Math.floor(
              (newGhostX + tileSize / 2) / tileSize
            );
            const ghostTileY = Math.floor(
              (newGhostY + tileSize / 2) / tileSize
            );

            // Teleport if crossing middle passage
            if (ghostTileY === 10 && ghostTileX === 0) {
              ghost.x = tileSize * 17; // Teleport to right side
            } else if (ghostTileY === 10 && ghostTileX === 18) {
              ghost.x = tileSize; // Teleport to left side
            } else if (
              ghostTileX >= 0 &&
              ghostTileX < maze[0].length &&
              ghostTileY >= 0 &&
              ghostTileY < maze.length &&
              maze[ghostTileY][ghostTileX] !== 1
            ) {
              ghost.x = newGhostX;
              ghost.y = newGhostY;
            }

            ghost.moving = false;
            if (ghost.behavior === "patrol") {
              ghost.prevDx = ghost.dx;
              ghost.prevDy = ghost.dy;
            }
          }

          // Pick new direction if not moving
          if (!ghost.moving) {
            const directions = [
              { dx: ghostSpeed, dy: 0 },
              { dx: -ghostSpeed, dy: 0 },
              { dx: 0, dy: ghostSpeed },
              { dx: 0, dy: -ghostSpeed },
            ];

            let validDirections: { dx: number; dy: number }[] = [];

            if (ghost.behavior === "follow") {
              // Follow Pac-Man: Prioritize direction toward Pac-Man
              const pacmanTileX = Math.floor(
                (pacmanRef.current.x + tileSize / 2) / tileSize
              );
              const pacmanTileY = Math.floor(
                (pacmanRef.current.y + tileSize / 2) / tileSize
              );
              const ghostTileX = Math.floor(
                (ghost.x + tileSize / 2) / tileSize
              );
              const ghostTileY = Math.floor(
                (ghost.y + tileSize / 2) / tileSize
              );

              const dx = pacmanTileX - ghostTileX;
              const dy = pacmanTileY - ghostTileY;

              // Sort directions by proximity to Pac-Man
              validDirections = directions
                .map((dir) => ({
                  dx: dir.dx,
                  dy: dir.dy,
                  distance:
                    Math.abs(dx - dir.dx / tileSize) +
                    Math.abs(dy - dir.dy / tileSize),
                }))
                .filter((dir) => {
                  const testX = ghost.x + dir.dx;
                  const testY = ghost.y + dir.dy;
                  const testTileX = Math.floor(
                    (testX + tileSize / 2) / tileSize
                  );
                  const testTileY = Math.floor(
                    (testY + tileSize / 2) / tileSize
                  );
                  return (
                    testX >= 0 &&
                    testX <= canvasSize.width - tileSize &&
                    testY >= 0 &&
                    testY <= canvasSize.height - tileSize &&
                    testTileX >= 0 &&
                    testTileY >= 0 &&
                    testTileX < maze[0].length &&
                    testTileY < maze.length &&
                    maze[testTileY][testTileX] !== 1
                  );
                })
                .sort((a, b) => a.distance - b.distance)
                .map((dir) => ({ dx: dir.dx, dy: dir.dy }));
            } else if (ghost.behavior === "random") {
              // Random movement
              validDirections = directions.filter((dir) => {
                const testX = ghost.x + dir.dx;
                const testY = ghost.y + dir.dy;
                const testTileX = Math.floor((testX + tileSize / 2) / tileSize);
                const testTileY = Math.floor((testY + tileSize / 2) / tileSize);
                return (
                  testX >= 0 &&
                  testX <= canvasSize.width - tileSize &&
                  testY >= 0 &&
                  testY <= canvasSize.height - tileSize &&
                  testTileX >= 0 &&
                  testTileY >= 0 &&
                  testTileX < maze[0].length &&
                  testTileY < maze.length &&
                  maze[testTileY][testTileX] !== 1
                );
              });
            } else if (ghost.behavior === "patrol") {
              // Patrol: Prefer continuing in current direction unless stuck
              validDirections = directions
                .filter((dir) => {
                  const testX = ghost.x + dir.dx;
                  const testY = ghost.y + dir.dy;
                  const testTileX = Math.floor(
                    (testX + tileSize / 2) / tileSize
                  );
                  const testTileY = Math.floor(
                    (testY + tileSize / 2) / tileSize
                  );
                  return (
                    testX >= 0 &&
                    testX <= canvasSize.width - tileSize &&
                    testY >= 0 &&
                    testY <= canvasSize.height - tileSize &&
                    testTileX >= 0 &&
                    testTileY >= 0 &&
                    testTileX < maze[0].length &&
                    testTileY < maze.length &&
                    maze[testTileY][testTileX] !== 1
                  );
                })
                .sort((a, b) => {
                  const aIsPrev =
                    a.dx === ghost.prevDx && a.dy === ghost.prevDy ? -1 : 0;
                  const bIsPrev =
                    b.dx === ghost.prevDx && b.dy === ghost.prevDy ? -1 : 0;
                  return aIsPrev - bIsPrev;
                });
            }

            if (validDirections.length > 0) {
              const newDir =
                ghost.behavior === "follow" || ghost.behavior === "patrol"
                  ? validDirections[0] // Follow or patrol prefers best direction
                  : validDirections[
                      Math.floor(Math.random() * validDirections.length)
                    ]; // Random picks any
              ghost.dx = newDir.dx;
              ghost.dy = newDir.dy;
              ghost.moving = true;
              ghost.lastMoveTime = timestamp;
            }
          }
        }

        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x, ghost.y, tileSize, tileSize);

        // Check collision with Pac-Man
        if (
          Math.abs(ghost.x - pacmanRef.current.x) < tileSize &&
          Math.abs(ghost.y - pacmanRef.current.y) < tileSize
        ) {
          setGameOver(true);
          return;
        }
      });

      // Draw and collect dots
      dotsRef.current.forEach((dot) => {
        if (!dot.collected) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, tileSize / 8, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.closePath();

          if (
            Math.abs(dot.x - pacmanRef.current.x - tileSize / 2) <
              tileSize / 2 &&
            Math.abs(dot.y - pacmanRef.current.y - tileSize / 2) < tileSize / 2
          ) {
            dot.collected = true;
            setScore((prev) => prev + 10);
          }
        }
      });

      if (!gameOver) animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      if (animationFrameRef.current !== null)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameOver, canvasSize]);

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    pacmanRef.current = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      nextDx: 0,
      nextDy: 0,
      moving: false,
      lastMoveTime: 0,
    };
    ghostsRef.current = [];
    dotsRef.current = [];
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-[480px] mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Pac-Man</h1>
        <p className="text-red-600 text-xl mb-4">
          Warning: This game is not supported on mobile devices. Please switch
          to a PC to play.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[760px] mx-auto">
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
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border border-gray-300 w-full"
      />
    </div>
  );
}
