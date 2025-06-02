import React, { createContext, useContext, useState, useEffect } from 'react';

const ScoreContext = createContext();

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};

export const ScoreProvider = ({ children }) => {
  const [highScores, setHighScores] = useState([]);
  const [playerName, setPlayerName] = useState('');

  // Load high scores from localStorage on mount
  useEffect(() => {
    const storedScores = localStorage.getItem('highScores');
    const storedName = localStorage.getItem('playerName');
    if (storedScores) {
      setHighScores(JSON.parse(storedScores));
    }
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Save high score
  const saveHighScore = (score) => {
    if (!playerName) return;

    let updatedScores = [...highScores];
    const existingIndex = updatedScores.findIndex(s => s.name === playerName);

    if (existingIndex !== -1) {
      // If the new score is higher, update it
      if (score > updatedScores[existingIndex].score) {
        updatedScores[existingIndex] = {
          ...updatedScores[existingIndex],
          score,
          id: Date.now()
        };
      }
    } else {
      // Add new entry
      updatedScores.push({
        id: Date.now(),
        name: playerName,
        score
      });
    }

    updatedScores = updatedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setHighScores(updatedScores);
    localStorage.setItem('highScores', JSON.stringify(updatedScores));
  };

  // Save player name
  const savePlayerName = (name) => {
    setPlayerName(name);
    localStorage.setItem('playerName', name);
  };

  // Get highest score
  const getHighestScore = () => {
    return highScores.length > 0 ? highScores[0] : { name: '', score: 0 };
  };

  const value = {
    highScores,
    playerName,
    saveHighScore,
    savePlayerName,
    getHighestScore
  };

  return (
    <ScoreContext.Provider value={value}>
      {children}
    </ScoreContext.Provider>
  );
}; 