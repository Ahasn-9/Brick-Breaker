import React, { useRef, useEffect, useState, useCallback } from 'react';

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const [showRules, setShowRules] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({
    score: 0,
    ball: {
      x: 0,
      y: 0,
      size: 10,
      speed: 4,
      dx: 4,
      dy: -4,
      visible: true,
      trail: [], // For ball trail effect
    },
    paddle: {
      x: 0,
      y: 0,
      w: 120, // Slightly smaller for better aesthetics
      h: 15,
      speed: 8,
      dx: 0,
      visible: true,
    },
    bricks: [],
    animationFrameId: null,
  });

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    const state = gameStateRef.current;

    state.score = 0;
    state.ball.visible = true;
    state.ball.dx = 4;
    state.ball.dy = -4;
    state.ball.trail = [];

    if (!gameStarted) {
      state.paddle.x = canvas.width / 2 - state.paddle.w / 2;
      state.paddle.y = canvas.height - 30; // Adjusted for better spacing
    }
    state.paddle.dx = 0;
    state.paddle.visible = true;

    // Reset bricks with color variation
    const brickRowCount = 9;
    const brickColumnCount = 5;
    const brickInfo = {
      w: 70,
      h: 20,
      padding: 10,
      offsetX: 45,
      offsetY: 60,
      visible: true,
    };

    state.bricks = [];
    for (let i = 0; i < brickRowCount; i++) {
      state.bricks[i] = [];
      for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        // Assign color based on row for gradient effect
        const hue = 360 - (j * 60); // Vary hue from red to purple
        state.bricks[i][j] = { x, y, ...brickInfo, color: `hsl(${hue}, 70%, 50%)` };
      }
    }
  }, [gameStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    resetGame();

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e3a8a'); // Dark blue
      gradient.addColorStop(1, '#3b82f6'); // Light blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawBall = () => {
      // Draw trail
      state.ball.trail.forEach((pos, index) => {
        const alpha = 0.3 * (1 - index / state.ball.trail.length);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, state.ball.size * (0.8 + 0.2 * (1 - index / state.ball.trail.length)), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        ctx.closePath();
      });

      // Draw ball
      const gradient = ctx.createRadialGradient(state.ball.x, state.ball.y, 2, state.ball.x, state.ball.y, state.ball.size);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#3b82f6');
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.size, 0, Math.PI * 2);
      ctx.fillStyle = state.ball.visible ? gradient : 'transparent';
      ctx.fill();
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.closePath();

      // Update trail
      if (gameStarted) {
        state.ball.trail.unshift({ x: state.ball.x, y: state.ball.y });
        if (state.ball.trail.length > 5) state.ball.trail.pop();
      }
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.roundRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h, 10);
      const gradient = ctx.createLinearGradient(state.paddle.x, state.paddle.y, state.paddle.x, state.paddle.y + state.paddle.h);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
      ctx.fillStyle = state.paddle.visible ? gradient : 'transparent';
      ctx.fill();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.closePath();
    };

    const drawScore = () => {
      ctx.font = 'bold 24px "Roboto", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.fillText(`Score: ${state.score}`, canvas.width - 120, 40);
      ctx.shadowBlur = 0;
    };

    const drawBricks = () => {
      state.bricks.forEach((column) => {
        column.forEach((brick) => {
          if (brick.visible) {
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 5);
            ctx.fillStyle = brick.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 5;
            ctx.closePath();
          }
        });
      });
      ctx.shadowBlur = 0;
    };

    const movePaddle = () => {
      state.paddle.x += state.paddle.dx;

      if (state.paddle.x + state.paddle.w > canvas.width) {
        state.paddle.x = canvas.width - state.paddle.w;
      }

      if (state.paddle.x < 0) {
        state.paddle.x = 0;
      }

      if (!gameStarted) {
        state.ball.x = state.paddle.x + state.paddle.w / 2;
        state.ball.y = state.paddle.y - state.ball.size;
      }
    };

    const moveBall = () => {
      if (!gameStarted) {
        return;
      }

      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      if (state.ball.x + state.ball.size > canvas.width || state.ball.x - state.ball.size < 0) {
        state.ball.dx *= -1;
      }

      if (state.ball.y - state.ball.size < 0) {
        state.ball.dy *= -1;
      }

      if (
        state.ball.x - state.ball.size > state.paddle.x &&
        state.ball.x + state.ball.size < state.paddle.x + state.paddle.w &&
        state.ball.y + state.ball.size > state.paddle.y
      ) {
        state.ball.dy = -state.ball.speed;
      }

      state.bricks.forEach((column) => {
        column.forEach((brick) => {
          if (brick.visible) {
            if (
              state.ball.x - state.ball.size > brick.x &&
              state.ball.x + state.ball.size < brick.x + brick.w &&
              state.ball.y + state.ball.size > brick.y &&
              state.ball.y - state.ball.size < brick.y + brick.h
            ) {
              state.ball.dy *= -1;
              brick.visible = false;
              state.score++;

              if (state.score % (state.bricks.length * state.bricks[0].length) === 0) {
                state.ball.visible = false;
                state.paddle.visible = false;
                setTimeout(() => {
                  resetGame();
                  setGameStarted(false);
                }, 500);
              }
            }
          }
        });
      });

      if (state.ball.y + state.ball.size > canvas.height) {
        resetGame();
        setGameStarted(false);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawBricks();
      drawPaddle();
      drawBall();
      drawScore();

      if (!gameStarted) {
        ctx.font = 'bold 28px "Roboto", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
      }
    };

    const gameLoop = () => {
      movePaddle();
      moveBall();
      draw();
      state.animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    const keyDown = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        state.paddle.dx = state.paddle.speed;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        state.paddle.dx = -state.paddle.speed;
      } else if (e.key === ' ' && !gameStarted) {
        state.ball.x = state.paddle.x + state.paddle.w / 2;
        state.ball.y = state.paddle.y - state.ball.size;
        setGameStarted(true);
      }
    };

    const keyUp = (e) => {
      if (
        e.key === 'Right' ||
        e.key === 'ArrowRight' ||
        e.key === 'Left' ||
        e.key === 'ArrowLeft'
      ) {
        state.paddle.dx = 0;
      }
    };

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
      }
    };
  }, [gameStarted, resetGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 relative">
      <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">Breakout!</h1>
      <button
        onClick={() => setShowRules(true)}
        className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
      >
        Show Rules
      </button>
      {showRules && (
        <div className="absolute top-0 left-0 bg-gray-900 text-white w-80 p-6 rounded-r-lg shadow-2xl transform transition-transform duration-500 ease-in-out translate-x-0 z-20">
          <h2 className="text-2xl font-bold mb-3">How To Play</h2>
          <p className="mb-3 text-gray-200">
            Use the left and right arrow keys to move the paddle and bounce the ball to break the bricks.
          </p>
          <p className="mb-4 text-gray-200">Missing the ball resets the game and score.</p>
          <button
            onClick={() => setShowRules(false)}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Close
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width="800"
        height="600"
        className="rounded-xl shadow-2xl border-2 border-blue-300 bg-gray-800"
      ></canvas>
    </div>
  );
};

export default BreakoutGame;