import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ForestScene } from '../game/ForestScene';
import './GameScene.css';

const GameScene = ({ gameData, updateGameData, onPause, isPaused = false, onToolChange, tool }) => {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delay loading screen
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timeout);
  }, []);

  // Khởi tạo game
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
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: ForestScene,
      };

      gameInstanceRef.current = new Phaser.Game(config);

      // Gửi dữ liệu vào scene sau khi khởi tạo
      const checkSceneReady = setInterval(() => {
        const scene = gameInstanceRef.current?.scene.getScene('ForestScene');
        if (scene?.scene?.isActive()) {
          console.log("GameScene: ForestScene is ready");
          scene.setGameData?.(gameData);
          scene.setUpdateCallback?.(updateGameData);
          scene.setPauseCallback?.(onPause);
          scene.setTool?.(tool); // đảm bảo công cụ được set khi scene sẵn sàng
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

  // Cập nhật gameData vào scene khi dữ liệu hoặc trạng thái thay đổi
  useEffect(() => {
    if (!isLoading && !isPaused && gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      scene?.setGameData?.(gameData);
    }
  }, [gameData, isPaused, isLoading]);

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

  // ESC để tạm dừng
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && gameInstanceRef.current) {
        const scene = gameInstanceRef.current.scene.getScene('ForestScene');
        if (scene?.pauseGame) {
          scene.pauseGame();
          onPause?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onPause]);

  // Cập nhật công cụ từ HUD xuống Scene khi tool thay đổi
  useEffect(() => {
    if (gameInstanceRef.current && tool) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      console.log("GameScene: Setting tool to", tool);
      scene?.setTool?.(tool);
    }
  }, [tool]);

  // Gửi hàm setTool lên App để HUD sử dụng
  useEffect(() => {
    if (onToolChange && gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      const setTool = (tool) => {
        console.log("GameScene: Tool set via onToolChange", tool);
        scene?.setTool?.(tool);
      };
      onToolChange(setTool);
      console.log("GameScene: Registered tool setter");
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
