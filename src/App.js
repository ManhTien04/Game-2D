import React, { useState } from 'react';
import GameScene from './components/GameScene';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused'
  const [gameData, setGameData] = useState({
    carbonCredits: 0,
    energyOrbs: 100,
    currentArea: 'Forest Valley',
    co2Absorbed: 0,
    co2Target: 1000,
    areaHealth: 100
  });
  const [tool, setTool] = useState('plant');
  const gameToolSetter = React.useRef(null);

  const startGame = () => {
    setGameState('playing');
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  const updateGameData = (newData) => {
    setGameData(prev => ({ ...prev, ...newData }));
  };

  // Khi đổi tool từ HUD, cập nhật state và gọi setTool trên GameScene
  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (gameToolSetter.current) {
      gameToolSetter.current(newTool);
    }
  };

  return (
    <div className="App">
      {gameState === 'menu' && (
        <MainMenu onStartGame={startGame} />
      )}
      
      {gameState === 'playing' && (
        <div className="game-container">
          <GameScene 
            gameData={gameData}
            updateGameData={updateGameData}
            onPause={pauseGame}
            onToolChange={fn => { gameToolSetter.current = fn; }}
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
            tool={tool}
            onToolChange={handleToolChange}
          />
        </div>
      )}
      
      {gameState === 'paused' && (
        <div className="game-container">
          <GameScene 
            gameData={gameData}
            updateGameData={updateGameData}
            onPause={pauseGame}
            isPaused={true}
            onToolChange={fn => { gameToolSetter.current = fn; }}
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
            tool={tool}
            onToolChange={handleToolChange}
          />
          <div className="pause-overlay">
            <div className="pause-menu">
              <h2>Tạm dừng</h2>
              <button onClick={resumeGame}>Tiếp tục</button>
              <button onClick={returnToMenu}>Quay về menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 