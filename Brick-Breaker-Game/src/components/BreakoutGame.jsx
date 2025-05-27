import React, { useRef, useEffect } from 'react';

const BreakoutBricks = () => {
  const canvasRef = useRef(null);

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
  const bricks = [];
  for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
      const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
      const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
      bricks[i][j] = { x, y, ...brickInfo };
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw bricks
    const drawBricks = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bricks.forEach((column) => {
        column.forEach((brick) => {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.w, brick.h);
          ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
          ctx.fill();
          ctx.closePath();
        });
      });
    };

    drawBricks();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <h1 className="text-white text-4xl mb-4">Bricks Breaker</h1>
      <canvas ref={canvasRef} width="800" height="600" className="bg-gray-200 rounded"></canvas>
    </div>
  );
};

export default BreakoutBricks;