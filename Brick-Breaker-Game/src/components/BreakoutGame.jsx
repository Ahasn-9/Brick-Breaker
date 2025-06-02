import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScore } from '../context/ScoreContext';
import HighScoreBoard from './HighScoreBoard';

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const [showRules, setShowRules] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const { playerName, savePlayerName, saveHighScore, getHighestScore } = useScore();
  const [currentHighScore, setCurrentHighScore] = useState({ name: '', score: 0 });

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

  // Load high score when component mounts
  useEffect(() => {
    setCurrentHighScore(getHighestScore());
  }, [getHighestScore]);

  const resetGame = useCallback(async () => {
    const canvas = canvasRef.current;
    const state = gameStateRef.current;

    // Save score if it's higher than current high score
    if (state.score > currentHighScore.score) {
      saveHighScore(state.score);
      setCurrentHighScore(getHighestScore());
    }

    state.score = 0;
    state.ball.visible = true;
    state.ball.dx = 4;
    state.ball.dy = -4;

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
  }, [gameStarted, currentHighScore, saveHighScore, getHighestScore]);

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
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const state = gameStateRef.current;

      ctx.font = '20px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, canvas.width - 150, 30);
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

      // Wall collisions
      if (state.ball.x + state.ball.size > canvas.width || state.ball.x - state.ball.size < 0) {
        state.ball.dx *= -1;
      }
      if (state.ball.y - state.ball.size < 0) {
        state.ball.dy *= -1;
      }

      // Paddle collision
      if (
        state.ball.x - state.ball.size > state.paddle.x &&
        state.ball.x + state.ball.size < state.paddle.x + state.paddle.w &&
        state.ball.y + state.ball.size > state.paddle.y
      ) {
        state.ball.dy = -state.ball.speed;
      }

      // Improved brick collision detection
      state.bricks.forEach((column) => {
        column.forEach((brick) => {
          if (brick.visible) {
            const brickLeft = brick.x;
            const brickRight = brick.x + brick.w;
            const brickTop = brick.y;
            const brickBottom = brick.y + brick.h;
            const ballCenterX = state.ball.x;
            const ballCenterY = state.ball.y;
            const ballRadius = state.ball.size;

            // Check if ball overlaps with brick
            if (
              ballCenterX + ballRadius > brickLeft &&
              ballCenterX - ballRadius < brickRight &&
              ballCenterY + ballRadius > brickTop &&
              ballCenterY - ballRadius < brickBottom
            ) {
              // Determine collision side based on ball's relative position
              const overlapLeft = ballCenterX + ballRadius - brickLeft;
              const overlapRight = brickRight - (ballCenterX - ballRadius);
              const overlapTop = ballCenterY + ballRadius - brickTop;
              const overlapBottom = brickBottom - (ballCenterY - ballRadius);

              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                state.ball.dx *= -1; // Horizontal collision
              } else if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                state.ball.dy *= -1; // Vertical collision
              }

              brick.visible = false;
              state.score++;

              if (state.score % (state.bricks.length * state.bricks[0].length) === 0) {
                state.ball.visible = false;
                state.paddle.visible = false;
                setTimeout(() => {
                  resetGame();
                  setGameStarted(false);
                }, 1000);
              }
            }
          }
        });
      });

      // Reset if ball falls
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

    // Block game start if name popup is open or name is empty
    const keyDown = (e) => {
      if (showNamePopup || !playerName) return;
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameStateRef.current.paddle.dx = gameStateRef.current.paddle.speed;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameStateRef.current.paddle.dx = -gameStateRef.current.paddle.speed;
      } else if (e.key === ' ' && !gameStarted) {
        gameStateRef.current.ball.x = gameStateRef.current.paddle.x + gameStateRef.current.paddle.w / 2;
        gameStateRef.current.ball.y = gameStateRef.current.paddle.y - gameStateRef.current.ball.size;
        setGameStarted(true);
      }
    };

    const keyUp = (e) => {
      if (showNamePopup || !playerName) return;
      if (
        e.key === 'Right' ||
        e.key === 'ArrowRight' ||
        e.key === 'Left' ||
        e.key === 'ArrowLeft'
      ) {
        gameStateRef.current.paddle.dx = 0;
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
  }, [gameStarted, resetGame, showNamePopup, playerName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 py-8">
      <h1 className="text-white text-4xl mb-8 font-bold drop-shadow-lg">Breakout!</h1>
      <div className="flex flex-col lg:flex-row gap-8 p-4">
        <div className="relative bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <button
            onClick={() => setShowRules(true)}
            className="absolute top-4 left-4 bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-gray-600 transition-colors duration-200 z-10"
          >
            Show Rules
          </button>
          {showRules && (
            <div className="absolute inset-0 bg-gray-900 text-white p-8 transform transition-transform duration-300 ease-in-out z-20 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">How To Play:</h2>
              <p className="mb-4 text-lg leading-relaxed">
                Use your <span className="font-bold text-yellow-400">right</span> and <span className="font-bold text-yellow-400">left</span> arrow keys to move the paddle. Your goal is to bounce the ball up and break all the blocks.
              </p>
              <p className="mb-6 text-lg leading-relaxed">If you miss the ball and it goes off the bottom of the screen, your score and the blocks will reset, ending the current game.</p>
              <button
                onClick={() => setShowRules(false)}
                className="mt-4 bg-blue-600 text-white text-lg px-6 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          )}
          <canvas ref={canvasRef} width="800" height="600" className="bg-gray-200 rounded-lg shadow-inner"></canvas>
        </div>
        <HighScoreBoard />
      </div>
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center transform scale-105">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Enter Your Name</h2>
            <input
              type="text"
              className="border border-gray-400 p-3 rounded-lg mb-6 text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && nameInput.trim()) {
                  savePlayerName(nameInput.trim());
                  setShowNamePopup(false);
                }
              }}
              autoFocus
            />
            <button
              className="bg-green-500 text-white text-xl px-8 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!nameInput.trim()}
              onClick={() => {
                savePlayerName(nameInput.trim());
                setShowNamePopup(false);
              }}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakoutGame;