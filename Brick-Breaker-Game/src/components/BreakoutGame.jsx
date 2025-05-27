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
    },
    paddle: {
      x: 0,
      y: 0,
      w: 150,
      h: 10,
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

    // Only reset paddle position if the game is not already started
    if (!gameStarted) {
      state.paddle.x = canvas.width / 2 - state.paddle.w / 2;
      state.paddle.y = canvas.height - 20;
    }
    state.paddle.dx = 0;
    state.paddle.visible = true;

    // Reset bricks
    const brickRowCount = 9;
    const brickColumnCount = 5;
    const brickInfo = {
      w: 70,
      h: 20,
      padding: 10,
      offsetX: 45,
      offsetY: 50,
      visible: true,
    };

    state.bricks = [];
    for (let i = 0; i < brickRowCount; i++) {
      state.bricks[i] = [];
      for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        state.bricks[i][j] = { x, y, ...brickInfo };
      }
    }
  }, [gameStarted]); // Add gameStarted as a dependency

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    resetGame();

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.size, 0, Math.PI * 2);
      ctx.fillStyle = state.ball.visible ? '#0095dd' : 'transparent';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);
      ctx.fillStyle = state.paddle.visible ? '#0095dd' : 'transparent';
      ctx.fill();
      ctx.closePath();
    };

    const drawScore = () => {
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${state.score}`, canvas.width - 100, 30);
    };

    const drawBricks = () => {
      state.bricks.forEach((column) => {
        column.forEach((brick) => {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.w, brick.h);
          ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
          ctx.fill();
          ctx.closePath();
        });
      });
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
      drawBall();
      drawPaddle();
      drawScore();
      drawBricks();

      if (!gameStarted) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 relative">
      <h1 className="text-white text-4xl mb-4">Breakout!</h1>
      <button
        onClick={() => setShowRules(true)}
        className="btn absolute top-8 left-8 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Show Rules
      </button>
      {showRules && (
        <div className="absolute top-0 left-0 bg-gray-800 text-white h-full w-96 p-5 transform transition-transform duration-1000 ease-in-out z-10">
          <h2 className="text-xl mb-2">How To Play:</h2>
          <p className="mb-2">
            Use your right and left keys to move the paddle to bounce the ball up and break the blocks.
          </p>
          <p className="mb-4">If you miss the ball, your score and the blocks will reset.</p>
          <button
            onClick={() => setShowRules(false)}
            className="btn bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      )}
      <canvas ref={canvasRef} width="800" height="600" className="bg-gray-200 rounded"></canvas>
    </div>
  );
};

export default BreakoutGame;