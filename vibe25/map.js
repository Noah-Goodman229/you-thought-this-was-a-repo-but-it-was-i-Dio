export class GameMap {
    constructor(width, height) {
      this.tileSize = 32;
      this.width = width;
      this.height = height;
      this.blockedTiles = new Set();
    }
  
    generateSampleMap() {
      this.blockedTiles = new Set();
  
      // Border walls
      for (let x = 0; x < this.width; x++) {
        this.addWall(x, 0);
        this.addWall(x, this.height - 1);
      }
      for (let y = 0; y < this.height; y++) {
        this.addWall(0, y);
        this.addWall(this.width - 1, y);
      }
  
      // Interior walls
      for (let x = 5; x < 10; x++) {
        this.addWall(x, 5);
        this.addWall(x, 10);
      }
      for (let y = 5; y < 10; y++) {
        this.addWall(7, y);
      }
    }
  
    addWall(x, y) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.blockedTiles.add(`${x},${y}`);
      }
    }
  
    isWalkable(x, y) {
      const tileX = Math.floor(x / this.tileSize);
      const tileY = Math.floor(y / this.tileSize);
      return !this.blockedTiles.has(`${tileX},${tileY}`);
    }
  
    draw(ctx) {
      // Draw grass background
      ctx.fillStyle = '#6b8c42';
      ctx.fillRect(0, 0, this.width * this.tileSize, this.height * this.tileSize);
  
      // Draw walls
      ctx.fillStyle = '#4a3c32';
      this.blockedTiles.forEach(tile => {
        const [x, y] = tile.split(',').map(Number);
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      });
    }
  }