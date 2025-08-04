import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ForestScene } from '../game/ForestScene';
import './GameScene.css';

const GameScene = ({ gameData, updateGameData, onPause, isPaused = false, onToolChange }) => {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delay hiển thị game sau loading screen
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timeout);
  }, []);

  // Khởi tạo game chỉ một lần
  useEffect(() => {
    if (!isLoading && !gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#2c5530',
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: ForestScene
      };

      gameInstanceRef.current = new Phaser.Game(config);

      // Gửi dữ liệu vào scene sau khi đã sẵn sàng
      const checkSceneReady = setInterval(() => {
        const scene = gameInstanceRef.current?.scene.getScene('ForestScene');
        if (scene?.scene?.isActive()) {
          scene.setGameData?.(gameData);
          scene.setUpdateCallback?.(updateGameData);
          scene.setPauseCallback?.(onPause);
          clearInterval(checkSceneReady);
        }
      }, 100);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [isLoading]);

  // Xử lý pause/resume
  useEffect(() => {
    if (!isLoading && gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      if (scene?.scene?.isActive()) {
        if (isPaused && scene.pauseGame) {
          scene.pauseGame();
        } else if (!isPaused && scene.resumeGame) {
          scene.resumeGame();
        }
      }
    }
  }, [isPaused, isLoading]);

  // Cập nhật gameData nếu không tạm dừng
  useEffect(() => {
    if (!isLoading && !isPaused && gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      scene?.setGameData?.(gameData);
    }
  }, [gameData, isPaused, isLoading]);

  // ESC để tạm dừng
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && gameInstanceRef.current) {
        const scene = gameInstanceRef.current.scene.getScene('ForestScene');
        if (scene?.pauseGame) {
          scene.pauseGame();
          onPause?.(); // callback tạm dừng
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onPause]);

  // Cho phép gọi setTool từ ngoài
  const setTool = (tool) => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      scene?.setTool?.(tool);
    }
  };

  useEffect(() => {
    if (onToolChange) {
      onToolChange(setTool);
    }
  }, [onToolChange]);

  return (
    <div className="game-scene">
      {isLoading ? (
        <div className="loading-screen">
          <h2>Đang tải bản đồ...</h2>
        </div>
      ) : (
        <div ref={gameRef} className="phaser-container" />
      )}
    </div>
  );
};

export default GameScene;
