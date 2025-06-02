import React from 'react';
import { useScore } from '../context/ScoreContext';

const HighScoreBoard = () => {
  const { highScores } = useScore();

  return (
    <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-64">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">High Scores</h2>
      {highScores.length === 0 ? (
        <p className="text-center text-gray-600">No scores yet!</p>
      ) : (
        <div className="space-y-2">
          {highScores.map((score) => (
            <div
              key={score.id}
              className="flex justify-between items-center p-2 bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">{score.name}</span>
              <span className="text-blue-600 font-bold">{score.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HighScoreBoard; 