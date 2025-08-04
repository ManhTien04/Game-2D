// Quản lý sự kiện thiên tai ngẫu nhiên trong game
class RandomEventManager {
  constructor() {
    this.lastEventDay = 0;
    this.cooldown = 3; // số ngày tối thiểu giữa 2 thiên tai
    this.activeEvent = null;
  }

  getRandomEvent(currentDay) {
    // Không cho phép thiên tai nếu chưa đủ cooldown
    if (currentDay - this.lastEventDay < this.cooldown) {
      this.activeEvent = null;
      return null;
    }
    // Xác suất xảy ra thiên tai (ví dụ 30%)
    if (Math.random() < 0.3) {
      const events = ['storm', 'heatwave'];
      const event = events[Math.floor(Math.random() * events.length)];
      this.lastEventDay = currentDay;
      this.activeEvent = event;
      return event;
    }
    this.activeEvent = null;
    return null;
  }

  getActiveEvent() {
    return this.activeEvent;
  }
}

export default new RandomEventManager(); 