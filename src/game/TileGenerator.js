import { STATIC_MAP } from './staticMap';

export class TileGenerator {
  constructor() {
    this.tileTypes = {
      dirt: {
        type: 'dirt', // Wheatfield
        color: 0xE2C275, // màu vàng nhạt giống lúa mì
        plantable: true
      },
      water: {
        type: 'water', // 1WaterCell
        color: 0x4169E1,
        plantable: false
      }
    };
  }

  getTileType(x, y) {
    // Lấy loại tile từ STATIC_MAP
    const row = STATIC_MAP[y % STATIC_MAP.length];
    const char = row[x % row.length];
    // Thêm Rock ngẫu nhiên trên dirt (Wheatfield) không phải Forest
    if (char === 'R') {
      return { ...this.tileTypes.water, hasTree: false };
    } else if (char === 'F') {
      return { ...this.tileTypes.dirt, hasTree: true };
    } else {
      // 10% cơ hội là Rock trên Wheatfield thường
      if (this.simpleNoise(x, y) > 0.9) {
        return { ...this.tileTypes.dirt, hasTree: false, isRock: true };
      }
      return { ...this.tileTypes.dirt, hasTree: false };
    }
  }

  simpleNoise(x, y) {
    // Simple pseudo-random noise function
    const seed = x * 73856093 ^ y * 19349663;
    return (Math.sin(seed) + 1) / 2;
  }
} 