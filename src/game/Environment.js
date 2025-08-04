export class Environment {
  constructor() {
    // Environmental parameters
    this.temperature = 22; // °C
    this.humidity = 65; // %
    this.pH = 6.5;
    this.airQuality = 'Good';
    this.pollutionLevel = 0; // 0-100
    
    // Time tracking
    this.time = 0;
    this.dayLength = 24; // hours
    
    // Weather effects
    this.weather = 'Clear';
    this.rainIntensity = 0;
    this.windSpeed = 0;
    
    // Environmental events
    this.events = [];
  }

  update() {
    // Update time
    this.time += 1; // 1 hour per tick
    
    // Simulate daily temperature cycle
    this.updateTemperature();
    
    // Simulate humidity changes
    this.updateHumidity();
    
    // Simulate pH changes
    this.updatePH();
    
    // Update weather
    this.updateWeather();
    
    // Update pollution level
    this.updatePollution();
    
    // Generate random events
    this.generateEvents();
  }

  updateTemperature() {
    // Daily temperature cycle (colder at night, warmer during day)
    const hourOfDay = this.time % this.dayLength;
    const baseTemp = 20;
    const tempVariation = 8;
    
    // Simple sine wave for daily cycle
    const cycle = Math.sin((hourOfDay / this.dayLength) * 2 * Math.PI);
    this.temperature = baseTemp + (cycle * tempVariation);
    
    // Add some randomness
    this.temperature += (Math.random() - 0.5) * 2;
    
    // Clamp to reasonable range
    this.temperature = Math.max(-5, Math.min(40, this.temperature));
  }

  updateHumidity() {
    // Humidity inversely related to temperature
    const baseHumidity = 70;
    const tempEffect = (this.temperature - 20) * -2;
    
    this.humidity = baseHumidity + tempEffect;
    
    // Rain increases humidity
    if (this.weather === 'Rain') {
      this.humidity += this.rainIntensity * 10;
    }
    
    // Add randomness
    this.humidity += (Math.random() - 0.5) * 10;
    
    // Clamp to reasonable range
    this.humidity = Math.max(10, Math.min(100, this.humidity));
  }

  updatePH() {
    // pH changes slowly over time
    const change = (Math.random() - 0.5) * 0.1;
    this.pH += change;
    
    // Clamp to reasonable range
    this.pH = Math.max(4.0, Math.min(9.0, this.pH));
  }

  updateWeather() {
    // Random weather changes
    if (Math.random() < 0.1) {
      const weatherTypes = ['Clear', 'Cloudy', 'Rain', 'Storm'];
      this.weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      
      if (this.weather === 'Rain') {
        this.rainIntensity = Math.random() * 0.5 + 0.1;
      } else {
        this.rainIntensity = 0;
      }
    }
    
    // Wind speed
    this.windSpeed = Math.random() * 20;
  }

  updatePollution() {
    // Pollution level changes based on various factors
    let change = 0;
    
    // Weather affects pollution
    if (this.weather === 'Rain') {
      change -= 0.5; // Rain cleans the air
    } else if (this.weather === 'Storm') {
      change -= 1.0; // Storm cleans more
    }
    
    // Random pollution events
    if (Math.random() < 0.05) {
      change += Math.random() * 5; // Pollution spike
    }
    
    // Gradual pollution increase
    change += 0.1;
    
    this.pollutionLevel += change;
    this.pollutionLevel = Math.max(0, Math.min(100, this.pollutionLevel));
    
    // Update air quality
    this.updateAirQuality();
  }

  updateAirQuality() {
    if (this.pollutionLevel < 20) {
      this.airQuality = 'Excellent';
    } else if (this.pollutionLevel < 40) {
      this.airQuality = 'Good';
    } else if (this.pollutionLevel < 60) {
      this.airQuality = 'Moderate';
    } else if (this.pollutionLevel < 80) {
      this.airQuality = 'Poor';
    } else {
      this.airQuality = 'Hazardous';
    }
  }

  generateEvents() {
    // Generate random environmental events
    if (Math.random() < 0.02) { // 2% chance per tick
      const eventTypes = [
        'Temperature Spike',
        'Humidity Drop',
        'Acid Rain',
        'Drought',
        'Fertile Soil'
      ];
      
      const event = {
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        duration: Math.floor(Math.random() * 5) + 1,
        intensity: Math.random()
      };
      
      this.events.push(event);
      this.applyEvent(event);
    }
    
    // Update existing events
    this.events = this.events.filter(event => {
      event.duration--;
      if (event.duration <= 0) {
        this.removeEvent(event);
        return false;
      }
      return true;
    });
  }

  applyEvent(event) {
    switch (event.type) {
      case 'Temperature Spike':
        this.temperature += 10 * event.intensity;
        break;
      case 'Humidity Drop':
        this.humidity -= 30 * event.intensity;
        break;
      case 'Acid Rain':
        this.pH -= 1 * event.intensity;
        this.weather = 'Rain';
        break;
      case 'Drought':
        this.humidity -= 50 * event.intensity;
        break;
      case 'Fertile Soil':
        this.pH = 6.5 + (event.intensity * 0.5);
        break;
    }
  }

  removeEvent(event) {
    // Reverse event effects
    switch (event.type) {
      case 'Temperature Spike':
        this.temperature -= 10 * event.intensity;
        break;
      case 'Humidity Drop':
        this.humidity += 30 * event.intensity;
        break;
      case 'Acid Rain':
        this.pH += 1 * event.intensity;
        break;
      case 'Drought':
        this.humidity += 50 * event.intensity;
        break;
      case 'Fertile Soil':
        this.pH = 6.5;
        break;
    }
  }

  getEnvironmentalFactors() {
    return {
      temperature: this.temperature,
      humidity: this.humidity,
      pH: this.pH,
      airQuality: this.airQuality,
      pollutionLevel: this.pollutionLevel,
      weather: this.weather,
      windSpeed: this.windSpeed
    };
  }
} 