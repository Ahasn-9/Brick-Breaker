import React from 'react';
import BreakoutGame from './components/BreakoutGame';
import { ScoreProvider } from './context/ScoreContext';
import './App.css';

function App() {
  return (
    <ScoreProvider>
      <BreakoutGame />
    </ScoreProvider>
  );
}

export default App;
