class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas dimensions
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // Game state
    this.state = {
      score: 0,
      lives: 3,
      gameOver: false,
      paused: false,
      lastTime: 0,
      spawnTimer: 0,
      spawnInterval: 1.5, // seconds between enemy spawns
      difficulty: 1
    };

    // Game objects
    this.player = null;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerUps = [];

    // Input state
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      Space: false
    };

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  init() {
    // Initialize player
    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      width: 40,
      height: 40,
      speed: 5,
      color: '#0ff',
      shooting: false,
      lastShot: 0,
      shotInterval: 0.25, // seconds between shots
      powerLevel: 1
    };

    // Set up input handlers
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Start game loop
    this.gameLoop();
  }

  handleKeyDown(e) {
    if (e.key in this.keys) this.keys[e.key] = true;
    if (e.key === 'p') this.state.paused = !this.state.paused;
  }

  handleKeyUp(e) {
    if (e.key in this.keys) this.keys[e.key] = false;
  }

  update(deltaTime) {
    if (this.state.paused) return;

    // Update player
    this.updatePlayer(deltaTime);

    // Update bullets
    this.updateBullets(deltaTime);

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Spawn enemies
    this.state.spawnTimer += deltaTime;
    if (this.state.spawnTimer >= this.state.spawnInterval) {
      this.spawnEnemy();
      this.state.spawnTimer = 0;
      // Increase difficulty
      this.state.difficulty += 0.1;
      this.state.spawnInterval = Math.max(0.5, 1.5 - this.state.difficulty * 0.1);
    }

    // Check collisions
    this.checkCollisions();

    // Update UI
    this.updateUI();
  }

  updatePlayer(deltaTime) {
    // Movement
    if (this.keys.w || this.keys.ArrowUp) this.player.y -= this.player.speed;
    if (this.keys.s || this.keys.ArrowDown) this.player.y += this.player.speed;
    if (this.keys.a || this.keys.ArrowLeft) this.player.x -= this.player.speed;
    if (this.keys.d || this.keys.ArrowRight) this.player.x += this.player.speed;

    // Keep player in bounds
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));

    // Shooting
    if ((this.keys.Space || this.player.shooting) && 
        performance.now() / 1000 - this.player.lastShot >= this.player.shotInterval) {
      this.shoot();
      this.player.lastShot = performance.now() / 1000;
    }
  }

  updateBullets(deltaTime) {
    // Move bullets
    this.bullets.forEach(bullet => {
      bullet.y -= bullet.speed * deltaTime;
    });

    // Remove off-screen bullets
    this.bullets = this.bullets.filter(bullet => bullet.y > 0);
  }

  updateEnemies(deltaTime) {
    // Move enemies
    this.enemies.forEach(enemy => {
      enemy.y += enemy.speed * deltaTime;
    });

    // Remove off-screen enemies
    this.enemies = this.enemies.filter(enemy => enemy.y < this.canvas.height);
  }

  updateParticles(deltaTime) {
    // Update particle positions
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= deltaTime;
    });

    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  updatePowerUps(deltaTime) {
    // Move power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.y += powerUp.speed * deltaTime;
    });

    // Remove off-screen power-ups
    this.powerUps = this.powerUps.filter(powerUp => powerUp.y < this.canvas.height);
  }

  checkCollisions() {
    // Check bullet-enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          // Remove bullet and enemy
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
          
          // Add score
          this.state.score += 100;
          
          // Create explosion particles
          this.createExplosion(enemy.x, enemy.y);
          
          // Randomly spawn power-up
          if (Math.random() < 0.1) {
            this.spawnPowerUp(enemy.x, enemy.y);
          }
        }
      });
    });

    // Check player-enemy collisions
    this.enemies.forEach((enemy, index) => {
      if (this.isColliding(this.player, enemy)) {
        // Remove enemy
        this.enemies.splice(index, 1);
        
        // Create explosion particles
        this.createExplosion(enemy.x, enemy.y);
        
        // Damage player
        this.state.lives--;
        if (this.state.lives <= 0) {
          this.state.gameOver = true;
        }
      }
    });

    // Check player-power-up collisions
    this.powerUps.forEach((powerUp, index) => {
      if (this.isColliding(this.player, powerUp)) {
        // Remove power-up
        this.powerUps.splice(index, 1);
        
        // Apply power-up effect
        this.applyPowerUp(powerUp.type);
      }
    });
  }

  isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  shoot() {
    const bulletCount = this.player.powerLevel;
    const spread = 0.2;
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = (i - (bulletCount - 1) / 2) * spread;
      this.bullets.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y,
        width: 4,
        height: 8,
        speed: 10,
        angle: angle,
        color: '#0ff'
      });
    }
  }

  spawnEnemy() {
    const types = ['normal', 'fast', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let enemy = {
      x: Math.random() * (this.canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      type: type,
      color: type === 'normal' ? '#f00' : type === 'fast' ? '#ff0' : '#f0f'
    };

    switch (type) {
      case 'normal':
        enemy.speed = 2 + this.state.difficulty;
        enemy.health = 1;
        break;
      case 'fast':
        enemy.speed = 4 + this.state.difficulty;
        enemy.health = 1;
        break;
      case 'tank':
        enemy.speed = 1 + this.state.difficulty;
        enemy.health = 3;
        break;
    }

    this.enemies.push(enemy);
  }

  spawnPowerUp(x, y) {
    const types = ['doubleShot', 'shield', 'rapidFire'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.powerUps.push({
      x: x,
      y: y,
      width: 20,
      height: 20,
      speed: 2,
      type: type,
      color: type === 'doubleShot' ? '#0f0' : type === 'shield' ? '#00f' : '#ff0'
    });
  }

  applyPowerUp(type) {
    switch (type) {
      case 'doubleShot':
        this.player.powerLevel = Math.min(3, this.player.powerLevel + 1);
        break;
      case 'shield':
        // Implement shield logic
        break;
      case 'rapidFire':
        this.player.shotInterval = Math.max(0.1, this.player.shotInterval * 0.5);
        setTimeout(() => {
          this.player.shotInterval = 0.25;
        }, 5000);
        break;
    }
  }

  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: '#f00'
      });
    }
  }

  updateUI() {
    document.getElementById('score').textContent = this.state.score;
    document.getElementById('lives').textContent = this.state.lives;
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw player
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Draw bullets
    this.bullets.forEach(bullet => {
      this.ctx.save();
      this.ctx.translate(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
      this.ctx.rotate(bullet.angle);
      this.ctx.fillStyle = bullet.color;
      this.ctx.fillRect(-bullet.width/2, -bullet.height/2, bullet.width, bullet.height);
      this.ctx.restore();
    });
    
    // Draw enemies
    this.enemies.forEach(enemy => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw power-ups
    this.powerUps.forEach(powerUp => {
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillRect(particle.x, particle.y, 2, 2);
    });
    this.ctx.globalAlpha = 1;

    // Draw game over screen
    if (this.state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
    }

    // Draw pause screen
    if (this.state.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
    }
  }

  gameLoop() {
    const currentTime = performance.now() / 1000;
    const deltaTime = currentTime - this.state.lastTime;
    this.state.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game
const game = new Game();
game.init(); 