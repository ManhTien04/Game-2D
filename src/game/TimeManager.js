// Quản lý thời gian/ngày đêm cho game
class TimeManager {
  constructor() {
    this.currentDay = 1;
    this.onNextDayCallbacks = [];
  }

  getCurrentDay() {
    return this.currentDay;
  }

  nextDay() {
    this.currentDay += 1;
    this.onNextDayCallbacks.forEach(cb => cb(this.currentDay));
  }

  onNextDay(callback) {
    this.onNextDayCallbacks.push(callback);
  }
}

export default new TimeManager(); 