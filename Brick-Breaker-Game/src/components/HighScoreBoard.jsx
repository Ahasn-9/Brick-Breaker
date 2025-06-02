import React from 'react';
import { useScore } from '../context/ScoreContext';

const HighScoreBoard = () => {
  const { highScores } = useScore();

  return (
    <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-xl w-72 flex flex-col items-center border border-gray-300">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 border-b-2 border-blue-500 pb-2 w-full">High Scores</h2>
      {highScores.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No scores yet!</p>
      ) : (
        <div className="space-y-3 w-full">
          {highScores.map((score, index) => (
            <div
              key={score.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <span className="font-medium text-gray-700 text-lg truncate">{index + 1}. {score.name}</span>
              <span className="text-blue-600 font-bold text-lg flex-shrink-0">{score.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HighScoreBoard; 