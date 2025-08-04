import React from 'react';
import './MainMenu.css';

const MainMenu = ({ onStartGame }) => {
  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="game-title">🌲 Forest Guardian 🌲</h1>
        <p className="game-subtitle">Bảo vệ môi trường, từng cây một</p>
        
        <div className="menu-buttons">
          <button className="menu-button primary" onClick={onStartGame}>
            🎮 Bắt đầu
          </button>
          <button className="menu-button">
            📊 Thống kê
          </button>
          <button className="menu-button">
            ⚙️ Cài đặt
          </button>
          <button className="menu-button">
            ❓ Hướng dẫn
          </button>
        </div>
        
        <div className="game-info">
          <h3>Cách chơi:</h3>
          <ul>
            <li>🌱 Trồng cây để hấp thụ CO₂</li>
            <li>💧 Tưới và bón phân cho cây</li>
            <li>⚔️ Đánh các con vật ô nhiễm</li>
            <li>🌍 Phục hồi hệ sinh thái</li>
          </ul>
        </div>
        
        <div className="controls-info">
          <h3>Điều khiển:</h3>
          <p>WASD - Di chuyển | Chuột - Trồng/Tương tác | ESC - Tạm dừng</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu; 