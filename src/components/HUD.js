import React, { useState, useEffect } from 'react';
import './HUD.css';

const HUD = ({ gameData, onPause, tool, onToolChange }) => {
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22,
    humidity: 65,
    pH: 6.5,
    airQuality: 'Good'
  });
  const [currentDay, setCurrentDay] = useState(1);
  const [disasterEvent, setDisasterEvent] = useState(null);

  const healthPercentage = (gameData.areaHealth / 100) * 100;

  // Listen for environment updates
  useEffect(() => {
    const handleEnvironmentUpdate = (event) => {
      if (event.detail?.environment) {
        setEnvironmentData(event.detail.environment);
      }
    };
    window.addEventListener('environmentUpdate', handleEnvironmentUpdate);
    return () => {
      window.removeEventListener('environmentUpdate', handleEnvironmentUpdate);
    };
  }, []);

  // Listen for day and disaster events
  useEffect(() => {
    const handleDayEvent = (event) => {
      if (event.detail) {
        setCurrentDay(event.detail.day);
        setDisasterEvent(event.detail.event);
      }
    };
    window.addEventListener('dayEvent', handleDayEvent);
    return () => {
      window.removeEventListener('dayEvent', handleDayEvent);
    };
  }, []);

  // Handle ESC key to pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onPause?.(); // gọi callback để set trạng thái pause
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPause]);

  return (
    <div className="hud">
      <div className="d-flex justify-between items-start">
        <div>
          <div className="hud-section">
            <div className="hud-label">🗓️ Ngày</div>
            <div className="hud-value">{currentDay}</div>
          </div>

          <div className="hud-section">
            <div className="hud-label">🌳 Sức khỏe khu vực</div>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
            <div className="hud-value">{Math.round(gameData.areaHealth)}%</div>
          </div>

          <div className="hud-section">
            <div className="hud-label">🌱 CO₂ Hấp thụ</div>
            <div className="hud-value">{Math.round(gameData.co2Absorbed)} / {gameData.co2Target}</div>
          </div>

          <div className="hud-section">
            <div className="hud-label">💎 Năng lượng</div>
            <div className="hud-value">{gameData.energyOrbs}</div>
          </div>

          <div className="hud-section">
            <div className="hud-label">🌲 Tín dụng Carbon</div>
            <div className="hud-value">{gameData.carbonCredits}</div>
          </div>

          {disasterEvent && (
            <div className="hud-section2 disaster-event">
              <div className="hud-label">⚠️ Thảm họa!</div>
              <div className="hud-value">
                {disasterEvent === 'storm' && 'Một cơn bão đã phá hủy một số cây!'}
                {disasterEvent === 'heatwave' && 'Một đợt nắng nóng đã đốt cháy một số cây!'}
              </div>
            </div>
          )}
        </div>

        {/* Environment stats */}
        <div className="hud-section">
          <div className="env-title">Environment</div>
          <div className="env-stats">
            <div className="env-stat">
              <span className="env-label">🌡️ Nhiệt độ:</span>
              <span className="env-value">{environmentData.temperature.toFixed(1)}°C</span>
            </div>
            <div className="env-stat">
              <span className="env-label">💧 Độ ẩm:</span>
              <span className="env-value">{environmentData.humidity.toFixed(0)}%</span>
            </div>
            <div className="env-stat">
              <span className="env-label">🧪 Độ pH:</span>
              <span className="env-value">{environmentData.pH.toFixed(1)}</span>
            </div>
            <div className="env-stat">
              <span className="env-label">☁️ Chất lượng không khí:</span>
              <span className="env-value">{environmentData.airQuality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="hud-bottom">
        <div className="tool-panel">
          <div className={`tool-item${tool === 'plant' ? ' active' : ''}`} onClick={() => onToolChange?.('plant')}>
            <div className="tool-icon">🌱</div>
            <div className="tool-label">Trồng cây (1)</div>
          </div>
          <div className={`tool-item${tool === 'water' ? ' active' : ''}`} onClick={() => onToolChange?.('water')}>
            <div className="tool-icon">💧</div>
            <div className="tool-label">Tưới nước (2)</div>
          </div>
          <div className={`tool-item${tool === 'fertilize' ? ' active' : ''}`} onClick={() => onToolChange?.('fertilize')}>
            <div className="tool-icon">🌿</div>
            <div className="tool-label">Bón phân (3)</div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={onPause}>
            ⏸️ Tạm dừng (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default HUD;
