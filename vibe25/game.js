import { GameMap } from './map.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const state = {
  debug: false,
  player: null,
  gameMap: null
};

// Initialize game
function init() {
  state.gameMap = new GameMap(25, 15);
  state.gameMap.generateSampleMap();

  const spawn = getSafeSpawn(state.gameMap);
  state.player = {
    x: spawn.x,
    y: spawn.y,
    width: 24,
    height: 24,
    color: '#e74c3c',
    speed: 2
  };
}

function getSafeSpawn(map) {
  const safeSpots = [
    [3, 3], [4, 3], [3, 4],
    [20, 10], [21, 10],
    [12, 2]
  ];
  
  for (const [x, y] of safeSpots) {
    if (!map.blockedTiles.has(`${x},${y}`)) {
      return {
        x: x * map.tileSize + map.tileSize/2,
        y: y * map.tileSize + map.tileSize/2,
        tileX: x,
        tileY: y
      };
    }
  }
  return { x: map.tileSize, y: map.tileSize, tileX: 1, tileY: 1 };
}

// Input handling
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  Backquote: false // The | key (registered as Backquote)
};

window.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
  if (e.key === '|') state.debug = !state.debug; // Toggle debug mode
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Movement
  let newX = state.player.x;
  let newY = state.player.y;

  if (keys.w || keys.ArrowUp) newY -= state.player.speed;
  if (keys.s || keys.ArrowDown) newY += state.player.speed;
  if (keys.a || keys.ArrowLeft) newX -= state.player.speed;
  if (keys.d || keys.ArrowRight) newX += state.player.speed;

  // Collision checks
  if (state.gameMap.isWalkable(newX, state.player.y) && 
      state.gameMap.isWalkable(newX + state.player.width, state.player.y) &&
      state.gameMap.isWalkable(newX, state.player.y + state.player.height) &&
      state.gameMap.isWalkable(newX + state.player.width, state.player.y + state.player.height)) {
    state.player.x = newX;
  }

  if (state.gameMap.isWalkable(state.player.x, newY) && 
      state.gameMap.isWalkable(state.player.x + state.player.width, newY) &&
      state.gameMap.isWalkable(state.player.x, newY + state.player.height) &&
      state.gameMap.isWalkable(state.player.x + state.player.width, newY + state.player.height)) {
    state.player.y = newY;
  }
}

function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw map
  state.gameMap.draw(ctx);
  
  // Draw player
  ctx.fillStyle = state.player.color;
  ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

  // Debug overlay
  if (state.debug) {
    drawDebugOverlay();
  }
}

function drawDebugOverlay() {
  // Draw collision points
  ctx.fillStyle = 'rgba(255,255,0,0.5)';
  const points = [
    {x: state.player.x, y: state.player.y},
    {x: state.player.x + state.player.width, y: state.player.y},
    {x: state.player.x, y: state.player.y + state.player.height},
    {x: state.player.x + state.player.width, y: state.player.y + state.player.height}
  ];
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
    ctx.fill();
  });

  // Draw spawn info
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText(`Position: ${Math.floor(state.player.x)}, ${Math.floor(state.player.y)}`, 10, 20);
  ctx.fillText(`Tile: ${Math.floor(state.player.x/state.gameMap.tileSize)}, ${Math.floor(state.player.y/state.gameMap.tileSize)}`, 10, 40);
  ctx.fillText(`Debug: ON (Press | to toggle)`, 10, 60);
}

// Start the game
init();
gameLoop();