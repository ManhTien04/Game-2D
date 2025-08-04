export class GameState {
  constructor() {
    this.loadGameState();
  }

  saveGameState(gameData) {
    try {
      const state = {
        ...gameData,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      localStorage.setItem('forestGuardian_save', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  loadGameState() {
    try {
      const saved = localStorage.getItem('forestGuardian_save');
      if (saved) {
        const state = JSON.parse(saved);
        
        // Check if save is from current version
        if (state.version === '1.0.0') {
          return {
            carbonCredits: state.carbonCredits || 0,
            energyOrbs: state.energyOrbs || 100,
            currentArea: state.currentArea || 'Forest Valley',
            co2Absorbed: state.co2Absorbed || 0,
            co2Target: state.co2Target || 1000,
            areaHealth: state.areaHealth || 100
          };
        }
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    
    // Return default state if no save found or error
    return {
      carbonCredits: 0,
      energyOrbs: 100,
      currentArea: 'Forest Valley',
      co2Absorbed: 0,
      co2Target: 1000,
      areaHealth: 100
    };
  }

  clearSave() {
    try {
      localStorage.removeItem('forestGuardian_save');
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  getSaveInfo() {
    try {
      const saved = localStorage.getItem('forestGuardian_save');
      if (saved) {
        const state = JSON.parse(saved);
        return {
          exists: true,
          timestamp: state.timestamp,
          version: state.version,
          carbonCredits: state.carbonCredits,
          co2Absorbed: state.co2Absorbed
        };
      }
    } catch (error) {
      console.error('Failed to get save info:', error);
    }
    
    return { exists: false };
  }
} 