import React, { useRef, useEffect, useCallback } from 'react';

const BreakoutBricks = () => {
  const canvasRef = useRef(null);

  // Game state
  const gameStateRef = useRef({
    paddle: {
      x: 300,
      y: 580,
      w: 150,
      h: 10,
      visible: true,
    },
    ball: {
      x: 375, 
      y: 570,
      size: 10,
      visible: true,
    },
    bricks: [],
  });

  // Brick configuration
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

  // Initialize bricks
  const initializeBricks = useCallback(() => {
    const state = gameStateRef.current;
    state.bricks = [];
    for (let i = 0; i < brickRowCount; i++) {
      state.bricks[i] = [];
      for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        state.bricks[i][j] = { x, y, ...brickInfo };
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Initialize game state
    initializeBricks();

    const drawBackground = () => {
      ctx.fillStyle = '#ffffff'; // White background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

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

    const drawBricks = () => {
      state.bricks.forEach((column) => {
        column.forEach((brick) => {
          if (brick.visible) {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = '#0095dd';
            ctx.fill();
            ctx.closePath();
          }
        });
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawBricks();
      drawPaddle();
      drawBall();
    };

    draw();
  }, [initializeBricks]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <h1 className="text-white text-4xl mb-4">Bricks Breaker</h1>
      <canvas ref={canvasRef} width="800" height="600" className="bg-gray-200 rounded"></canvas>
    </div>
  );
};

export default BreakoutBricks;