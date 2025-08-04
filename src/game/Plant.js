export class Plant {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type || 'sapling';
    
    // Plant properties
    this.maxGrowthTime = 60; // seconds
    this.currentGrowth = 0;
    this.carbonRate = 10; // CO2 absorbed per tick
    this.growthStage = 0; // 0: seed, 1: sprout, 2: young, 3: mature
    this.harvested = false;
    
    // Environmental factors
    this.watered = false;
    this.fertilized = false;
    this.health = 100;
    
    // Growth animation
    this.growthTween = null;

    this.age = 0; // số ngày tuổi
    this.stage = 'seedling'; // 'seedling', 'young', 'mature', 'dead'
    this.status = 'normal'; // 'normal', 'broken', 'burned', 'deadtree', 'treeroot'
    // Không tạo rectangle sprite nữa
    this.sprite = null;
    this.setSpriteByStage();
  }

  setSpriteByStage() {
    // Xóa sprite cũ nếu có
    if (this.sprite) this.sprite.destroy();
    let key = '';
    switch (this.stage) {
      case 'seedling':
        key = 'Sapling'; break;
      case 'young':
        key = 'GrowingTree'; break;
      case 'mature':
        key = 'Trees'; break;
      case 'dead':
        if (this.status === 'deadtree') key = 'DeadTree';
        else if (this.status === 'treeroot') key = 'TreeRoot';
        break;
    }
    if (key) {
      this.sprite = this.scene.add.image(this.x, this.y, key);
      this.sprite.setDisplaySize(16, 16);
      this.sprite.setDepth(1);
    }
  }

  grow(environment) {
    if (this.harvested || this.stage === 'dead') return 0;
    
    // Calculate growth factor based on environment
    const tempFactor = this.getTemperatureFactor(environment.temperature);
    const humidityFactor = this.getHumidityFactor(environment.humidity);
    const pHFactor = this.getPHFactor(environment.pH);
    
    // Base growth increment
    let growthIncrement = 1 / this.maxGrowthTime;
    
    // Apply environmental factors
    growthIncrement *= tempFactor * humidityFactor * pHFactor;
    
    // Apply care factors
    if (this.watered) growthIncrement *= 1.5;
    if (this.fertilized) growthIncrement *= 1.3;
    
    // Update growth
    this.currentGrowth += growthIncrement;
    
    // Update growth stage
    this.updateGrowthStage();
    
    // Calculate carbon absorbed
    const carbonAbsorbed = this.carbonRate * growthIncrement;
    
    this.age += 1;
    if (this.age > 5 && this.stage === 'seedling') {
      this.stage = 'young';
      this.setSpriteByStage();
    }
    if (this.age > 10 && this.stage === 'young') {
      this.stage = 'mature';
      this.setSpriteByStage();
    }
    
    return carbonAbsorbed;
  }

  updateGrowthStage() {
    // Đã chuyển sang dùng age và stage, không cần logic này nữa
  }

  updateSprite() {
    // Không còn dùng rectangle nên bỏ các hiệu ứng fillStyle
  }

  water() {
    this.watered = true;
    this.health = Math.min(100, this.health + 20);
    // Có thể thêm hiệu ứng tint nếu muốn
    if (this.sprite && this.sprite.setTint) {
      this.sprite.setTint(0x4169E1);
      this.scene.time.delayedCall(500, () => {
        this.sprite.clearTint();
      });
    }
    if (this.status === 'burned') {
      this.status = 'normal';
    }
  }

  fertilize() {
    this.fertilized = true;
    this.health = Math.min(100, this.health + 30);
    if (this.sprite && this.sprite.setTint) {
      this.sprite.setTint(0xFFD700);
      this.scene.time.delayedCall(500, () => {
        this.sprite.clearTint();
      });
    }
  }

  harvest() {
    this.harvested = true;
    if (this.sprite && this.sprite.setTint) {
      this.sprite.setTint(0xFFD700);
      this.scene.time.delayedCall(1000, () => {
        this.sprite.destroy();
      });
    } else if (this.sprite) {
      this.scene.time.delayedCall(1000, () => {
        this.sprite.destroy();
      });
    }
  }

  isMature() {
    return this.growthStage >= 3;
  }

  getTemperatureFactor(temperature) {
    // Optimal temperature range: 15-30°C
    if (temperature >= 15 && temperature <= 30) {
      return 1.0;
    } else if (temperature >= 10 && temperature <= 35) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  getHumidityFactor(humidity) {
    // Optimal humidity range: 40-80%
    if (humidity >= 40 && humidity <= 80) {
      return 1.0;
    } else if (humidity >= 20 && humidity <= 90) {
      return 0.8;
    } else {
      return 0.5;
    }
  }

  getPHFactor(pH) {
    // Optimal pH range: 6.0-7.5
    if (pH >= 6.0 && pH <= 7.5) {
      return 1.0;
    } else if (pH >= 5.5 && pH <= 8.0) {
      return 0.8;
    } else {
      return 0.4;
    }
  }

  update(delta) {
    // Reset care effects over time
    if (this.watered && Math.random() < 0.001) {
      this.watered = false;
    }
    
    if (this.fertilized && Math.random() < 0.0005) {
      this.fertilized = false;
    }
  }

  applyDisaster(disasterType) {
    if (this.stage === 'dead') return;
    // Chỉ cây trưởng thành loại 'trees' mới bị thiên tai biến thành DeadTree
    if (this.type === 'trees' && this.stage === 'mature') {
      this.stage = 'dead';
      this.status = 'deadtree';
      this.setSpriteByStage();
    }
    // Các loại cây khác không bị ảnh hưởng bởi thiên tai
  }

  chopDown() {
    if (this.status === 'broken') {
      this.stage = 'dead';
      this.status = 'normal';
    }
  }

  setTreeRoot() {
    // Chỉ cho phép chuyển nếu đang là DeadTree
    if (this.stage === 'dead' && this.status === 'deadtree') {
      this.status = 'treeroot';
      // stage vẫn là 'dead'
      this.setSpriteByStage();
    }
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
  }
}

export default Plant; 