// ----- Canvas setup -----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ----- Constants -----
const GRAVITY = 0.8;
const MOVE_SPEED = 2.5;
const JUMP_FORCE = 14;

// ----- Input -----
const keys = {
  left: false,
  right: false,
  up: false
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.up = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.up = false;
});

// ----- Level: platforms (single dorm level) -----
const platforms = [
  // main floor
  { x: 0,   y: 400, width: 800, height: 50 },
  // mid platforms
  { x: 150, y: 320, width: 140, height: 20 },
  { x: 360, y: 260, width: 140, height: 20 },
  // high platform where zombie patrols
  { x: 580, y: 210, width: 140, height: 20 }
];

// ----- Player -----
const playerStart = { x: 60, y: 300 };

const player = {
  x: playerStart.x,
  y: playerStart.y,
  width: 32,
  height: 44,
  vx: 0,
  vy: 0,
  onGround: false
};

// ----- Zombie enemy (single) -----
const zombie = {
  x: 600,
  y: 210 - 28, // stand on high platform
  width: 28,
  height: 40,
  vx: -1.5,
  speed: 1.5
};

// Utility: AABB collision
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ----- Update logic -----
function updatePlayer() {
  // Horizontal
  player.vx = 0;
  if (keys.left) player.vx = -MOVE_SPEED;
  if (keys.right) player.vx = MOVE_SPEED;

  // Gravity
  player.vy += GRAVITY;

  // Jump
  if (keys.up && player.onGround) {
    player.vy = -JUMP_FORCE;
    player.onGround = false;
  }

  // Apply velocity
  player.x += player.vx;
  player.y += player.vy;

  // Simple platform collision (only resolving vertical)
  player.onGround = false;

  platforms.forEach((p) => {
    if (rectsOverlap(player, p)) {
      // falling down onto platform
      if (player.vy > 0 && player.y + player.height - player.vy <= p.y) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
    }
  });

  // World bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  // Fell off the map
  if (player.y > canvas.height) {
    respawnPlayer();
  }
}

function respawnPlayer() {
  player.x = playerStart.x;
  player.y = playerStart.y;
  player.vx = 0;
  player.vy = 0;
}

// Update zombie: patrol back and forth on its platform
function updateZombie() {
  zombie.x += zombie.vx;

  // Find the platform it's on
  const platform = platforms[3]; // high platform we made for it

  // Turn around at edges
  if (zombie.x <= platform.x || zombie.x + zombie.width >= platform.x + platform.width) {
    zombie.vx = -zombie.vx;
  }
}

// Check player–zombie collision
function handlePlayerZombieCollision() {
  if (rectsOverlap(player, zombie)) {
    respawnPlayer();
  }
}

// ----- Drawing -----
function drawBackground() {
  ctx.fillStyle = '#1a1a24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlatforms() {
  ctx.fillStyle = '#3a3a4f';
  platforms.forEach((p) => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function drawPlayer() {
  ctx.fillStyle = '#ffcc66';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // tiny "face" line
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(player.x + 8, player.y + 10, 16, 3);
}

function drawZombie() {
  ctx.fillStyle = '#74ff9d';
  ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);

  ctx.fillStyle = '#225533';
  ctx.fillRect(zombie.x + 6, zombie.y + 10, 16, 3);
}

function drawHUD() {
  ctx.fillStyle = '#ffffffaa';
  ctx.font = '14px system-ui';
  ctx.fillText('Reach the right side. Avoid the zombie. Falling or touching zombie respawns you.', 16, 24);
}

// ----- Game loop -----
function gameLoop() {
  updatePlayer();
  updateZombie();
  handlePlayerZombieCollision();

  drawBackground();
  drawPlatforms();
  drawPlayer();
  drawZombie();
  drawHUD();

  requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
