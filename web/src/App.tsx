import React from 'react';
import { GameScreen } from './ui/game/GameScreen';
import { useGameViewModel } from './ui/game/GameViewModel';

function App() {
  const {
    state,
    newGame,
    selectCell,
    toggleDirection,
    setDirection,
    inputLetter,
    deleteLetter,
    showSolution,
    hideSolution,
  } = useGameViewModel();

  return (
    <GameScreen
      state={state}
      onCellClick={selectCell}
      onToggleDirection={toggleDirection}
      onSetDirection={setDirection}
      onLetterInput={inputLetter}
      onDelete={deleteLetter}
      onShowSolution={showSolution}
      onHideSolution={hideSolution}
      onNewGame={newGame}
    />
  );
}

export default App;