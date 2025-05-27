import React, { useRef, } from 'react';

const BreakoutBricks = () => {
  const canvasRef = useRef(null);

  
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <h1 className="text-white text-4xl mb-4">Brick Breaker</h1>
      <canvas ref={canvasRef} width="800" height="600" className="bg-gray-200 rounded"></canvas>
    </div>
  );
};

export default BreakoutBricks;