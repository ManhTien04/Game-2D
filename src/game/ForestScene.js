import Phaser from 'phaser';
import { TileGenerator } from './TileGenerator';
import { Plant } from './Plant';
import { Environment } from './Environment';
import { GameState } from './GameState';
import TimeManager from './TimeManager';
import RandomEventManager from './RandomEvent';

export class ForestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ForestScene' });
    this.gameState = new GameState();
    this.environment = new Environment();
    this.tileGenerator = new TileGenerator();
    this.plants = [];
    this.tiles = [];
    this.gameData = {
      carbonCredits: 0,
      energyOrbs: 100,
      currentArea: 'Forest Valley',
      co2Absorbed: 0,
      co2Target: 1000,
      areaHealth: 100
    };
    this.updateCallback = null;
    this.pauseCallback = null;
    this.currentTool = 'plant';
    this.tickTime = 0;
    this.tickInterval = 1000;
    this.lastDay = TimeManager.getCurrentDay();
    this.lastEvent = null;
    this.tickCount = 0;
    this.isDragging = false;
  }

  preload() {
    this.load.image('Sapling', 'assetGame/Sapling.png');
    this.load.image('GrowingTree', 'assetGame/GrowingTree.png');
    this.load.image('Trees', 'assetGame/Trees.png');
    this.load.image('DeadTree', 'assetGame/DeadTree.png');
    this.load.image('TreeRoot', 'assetGame/TreeRoot.png');
    this.load.image('Rock', 'assetGame/Rock.png');
    this.load.image('Wheatfield', 'assetGame/Wheatfield.jpg');
    this.load.image('1WaterCell', 'assetGame/1WaterCell.png');
  }

  create() {
    const mapTiles = 62;
    const tileSize = 16;
    this.tileSize = tileSize;

    this.createTileMap();

    // Camera Setup
    const mapSize = mapTiles * tileSize;
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);

    this.setupCameraControls();
    this.setupInput();
    this.startGameLoop();
    this.sendEnvironmentData();
  }

  setupCameraControls() {
    const cam = this.cameras.main;

    // Zoom bằng cuộn chuột
    // this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    //   cam.zoom -= deltaY * 0.001;
    //   cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.5, 3);
    // });

    // Pan bản đồ
    this.input.on('pointerdown', (pointer) => {
      if (pointer.button === 0) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.isDragging) return;
      cam.scrollX -= (pointer.x - this.dragStartX) / cam.zoom;
      cam.scrollY -= (pointer.y - this.dragStartY) / cam.zoom;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  createTileMap() {
    const mapTiles = 62;
    const tileSize = 16;

    for (let x = 0; x < mapTiles; x++) {
      this.tiles[x] = [];
      for (let y = 0; y < mapTiles; y++) {
        const tileX = x * tileSize;
        const tileY = y * tileSize;
        const tileType = this.tileGenerator.getTileType(x, y);
        const tileSpriteKey = tileType.type === 'dirt' ? 'Wheatfield' : '1WaterCell';

        const tile = this.add.image(tileX + tileSize / 2, tileY + tileSize / 2, tileSpriteKey);
        tile.setDisplaySize(tileSize, tileSize);
        tile.setDepth(0);
        tile.tileData = {
          x,
          y,
          type: tileType.type,
          plant: null,
          watered: false,
          fertilized: false,
          isRock: tileType.isRock || false
        };

        this.tiles[x][y] = tile;

        if (tileType.isRock) {
          const rock = this.add.image(tileX + tileSize / 2, tileY + tileSize / 2, 'Rock');
          rock.setDisplaySize(tileSize, tileSize);
          rock.setDepth(1);
          tile.tileData.rock = rock;
        }

        if (tileType.type === 'dirt' && tileType.hasTree && !tileType.isRock) {
          const plant = new Plant(this, tileX + tileSize / 2, tileY + tileSize / 2, 'trees');
          plant.stage = 'mature';
          plant.setSpriteByStage();
          tile.tileData.plant = plant;
          this.plants.push(plant);
        }
      }
    }
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (pointer.button === 0 && !this.input.keyboard.addKey('SPACE').isDown && !this.isDragging) {
        this.handleMouseClick(pointer);
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.pauseCallback) this.pauseCallback();
    });

    this.input.keyboard.on('keydown-ONE', () => {
      this.currentTool = 'plant';
    });

    this.input.keyboard.on('keydown-TWO', () => {
      this.currentTool = 'water';
    });

    this.input.keyboard.on('keydown-THREE', () => {
      this.currentTool = 'fertilize';
    });
  }

  handleMouseClick(pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main);
    const tileX = Math.floor(worldPoint.x / this.tileSize);
    const tileY = Math.floor(worldPoint.y / this.tileSize);

    if (tileX < 0 || tileY < 0 || tileX >= 62 || tileY >= 62) return;

    const tile = this.tiles[tileX][tileY];

    if (tile.tileData.plant && tile.tileData.plant.stage === 'dead') {
      if (tile.tileData.plant.status === 'deadtree') {
        tile.tileData.plant.setTreeRoot();
      } else if (tile.tileData.plant.status === 'treeroot') {
        tile.tileData.plant.destroy();
        tile.tileData.plant = null;
      }
      return;
    }

    switch (this.currentTool) {
      case 'plant': this.plantSeed(tileX, tileY); break;
      case 'water': this.waterTile(tileX, tileY); break;
      case 'fertilize': this.fertilizeTile(tileX, tileY); break;
    }
  }

  plantSeed(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    if (
      tile.tileData.type === 'dirt' &&
      !tile.tileData.plant &&
      !tile.tileData.isRock &&
      tile.texture.key === 'Wheatfield' &&
      this.gameData.energyOrbs >= 10
    ) {
      const plant = new Plant(this, tileX * this.tileSize + this.tileSize / 2, tileY * this.tileSize + this.tileSize / 2, 'sapling');
      tile.tileData.plant = plant;
      this.plants.push(plant);
      this.updateGameData({ energyOrbs: this.gameData.energyOrbs - 10 });
    }
  }

  waterTile(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    if (tile.tileData.plant && !tile.tileData.watered && this.gameData.energyOrbs >= 5) {
      tile.tileData.watered = true;
      tile.tileData.plant.water();
      this.updateGameData({ energyOrbs: this.gameData.energyOrbs - 5 });
    }
  }

  fertilizeTile(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    if (tile.tileData.plant && !tile.tileData.fertilized && this.gameData.energyOrbs >= 15) {
      tile.tileData.fertilized = true;
      tile.tileData.plant.fertilize();
      this.updateGameData({ energyOrbs: this.gameData.energyOrbs - 15 });
    }
  }

  startGameLoop() {
    this.time.addEvent({
      delay: this.tickInterval,
      callback: this.gameTick,
      callbackScope: this,
      loop: true
    });
  }

  gameTick() {
    if (!this.gameData) return;

    this.tickCount = (this.tickCount || 0) + 1;
    if (this.tickCount >= 10) {
      this.tickCount = 0;
      TimeManager.nextDay();
      this.handleNewDay();
    }

    this.environment.update();
    this.sendEnvironmentData();

    let totalCarbonAbsorbed = 0;
    this.plants.forEach(plant => {
      const absorbed = plant.grow(this.environment);
      totalCarbonAbsorbed += absorbed;

      if (plant.isMature() && !plant.harvested) {
        plant.harvest();
        this.updateGameData({
          carbonCredits: this.gameData.carbonCredits + 50,
          co2Absorbed: this.gameData.co2Absorbed + plant.carbonRate
        });
      }
    });

    if (totalCarbonAbsorbed > 0) {
      this.updateGameData({
        co2Absorbed: this.gameData.co2Absorbed + totalCarbonAbsorbed
      });
    }

    const health = Math.min(100, (this.gameData.co2Absorbed / this.gameData.co2Target) * 100);
    this.updateGameData({ areaHealth: health });
  }

  handleNewDay() {
    const currentDay = TimeManager.getCurrentDay();
    this.plants.forEach(p => {
      p.watered = false;
      p.fertilized = false;
    });

    const event = RandomEventManager.getRandomEvent(currentDay);
    this.lastEvent = event;

    if (event) {
      const alivePlants = this.plants.filter(p => p.stage !== 'dead' && p.status === 'normal');
      const numAffected = Math.max(1, Math.floor(alivePlants.length * 0.2));
      for (let i = 0; i < numAffected; i++) {
        const idx = Math.floor(Math.random() * alivePlants.length);
        alivePlants[idx].applyDisaster(event);
        alivePlants.splice(idx, 1);
      }
      this.showDisasterNotification(event);
    }

    window.dispatchEvent(new CustomEvent('dayEvent', {
      detail: { day: currentDay, event }
    }));
  }

  sendEnvironmentData() {
    const env = this.environment.getEnvironmentalFactors();
    window.dispatchEvent(new CustomEvent('environmentUpdate', {
      detail: { environment: env }
    }));
  }

  updateGameData(data) {
    if (this.updateCallback) {
      this.updateCallback(data);
    }
  }

  update(time, delta) {
    this.plants.forEach(p => p.update(delta));
  }

  pauseGame() {
    this.scene.pause();
    this.physics.world.pause();
    this.time.timeScale = 0;
    this.isGamePaused = true;
  }

  resumeGame() {
    this.scene.resume();
    this.physics.world.resume();
    this.time.timeScale = 1;
    this.isGamePaused = false;
  }

  setPaused(paused) {
    paused ? this.pauseGame() : this.resumeGame();
  }

  setGameData(data) {
    this.gameData = data;
  }

  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  setPauseCallback(callback) {
    this.pauseCallback = callback;
  }

  setTool(tool) {
    this.currentTool = tool;
  }

  showDisasterNotification(event) {
    const text = this.add.text(this.sys.game.config.width / 2, 40, `Thiên tai xảy ra: ${event}`, {
      font: '20px Arial',
      fill: '#ff3333',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 },
      align: 'center'
    }).setOrigin(0.5);
    text.setDepth(100);
    this.time.delayedCall(2000, () => text.destroy());
  }
}
