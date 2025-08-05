// Quản lý sự kiện thiên tai ngẫu nhiên trong game
class RandomEventManager {
  constructor() {
    this.lastEventDay = 0;
    this.cooldown = 5; // số ngày tối thiểu giữa 2 thiên tai
    this.activeEvent = null; // current disaster event
    this.environmentImpact = {
      temperature: 0,
      humidity: 0,
      pH: 0,
      airQuality: 0
    };
  }

  getRandomEvent(currentDay, stats = {}) {
    if (!stats || currentDay - this.lastEventDay < this.cooldown) {
      this.activeEvent = null;
      this.resetEnvironmentalImpact();
      return null;
    }

    const { totalTrees = 0, treesAlive = 0 } = stats;
    const treeHealthRatio = totalTrees > 0 ? treesAlive / totalTrees : 1;

    const baseProbability = 0.3;
    const adjustedProbability = baseProbability + (1 - treeHealthRatio) * 0.2;

    if (Math.random() < adjustedProbability) {
      const events = ['Hạn hán', 'Bão Lớn', 'Sâu Bệnh'];
      const event = events[Math.floor(Math.random() * events.length)];

      this.lastEventDay = currentDay;
      this.activeEvent = event;
      this.setEnvironmentalImpact(event);

      return event;
    }

    this.activeEvent = null;
    this.resetEnvironmentalImpact();
    return null;
  }

  getCurrentDisaster() {
    return this.activeEvent;
  }

  getEnvironmentalImpact() {
    return this.environmentImpact;
  }

  setEnvironmentalImpact(event) {
    switch (event) {
      case 'Hạn hán': // Heatwave
        this.environmentImpact = {
          temperature: 1.5,
          humidity: -2.5,
          pH: -1,
          airQuality: -0.5
        };
        break;
      case 'Sâu bệnh': // Pests
        this.environmentImpact = {
          temperature: 0.5,
          humidity: -1,
          pH: -1.5,
          airQuality: -1.5
        };
        break;
      case 'Lũ lụt': // Flood
        this.environmentImpact = {
          temperature: -1,
          humidity: -2,
          pH: -2,
          airQuality: -1
        };
        break;
      default:
        this.resetEnvironmentalImpact();
        break;
    }
  }

  resetEnvironmentalImpact() {
    this.environmentImpact = {
      temperature: 0,
      humidity: 0,
      pH: 0,
      airQuality: 0
    };
  }
}

export default new RandomEventManager();
