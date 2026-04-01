document.addEventListener('DOMContentLoaded', () => {
// ----game stats start -----
let resources = { wood: 10, stone: 10, food: 10, coin: 0 };
  
let buildings = {
  townCentre: 1,
  house: 0,
  farm: 0,
  logging: 0,
  market: 0,
  tower: 0
};

let villagers = { idle: 2, gathering: 0, working: 0, training: 0 };
let workersAssigned = { farm: 0, logging: 0, market: 0 };
  
const GRID_SIZE = 20;
const workerProduction = {
  farm: { food: 1 },
  logging: { wood: 1 },
  market: { coin: 1 }
};


// ---- canvas ----
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let placedBuildings = [{ type: 'townCentre', x: 400, y: 400 }];


// ---------- UI Helper functions ----------
  
function updateDisplay() {
  document.getElementById('food').textContent = `🌾:${resources.food}`;
  document.getElementById('wood').textContent = `🪵:${resources.wood}`;
  document.getElementById('stone').textContent = `⛏️:${resources.stone}`;
  document.getElementById('coin').textContent = `🪙:${resources.coin}`;

  document.getElementById('villagers-idle').textContent = `Idle: ${villagers.idle}`;
  document.getElementById('villagers-gathering').textContent = `Gathering: ${villagers.gathering}`;
  document.getElementById('villagers-working').textContent = `Working: ${villagers.working}`;
  document.getElementById('villagers-training').textContent = `Training: ${villagers.training}`;
}
function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
// ---------- Canvas Drawing buildings ----------
// ======================
// Placement + Collision
// ======================

// Placement state
let placementMode = {
  active: false,
  type: null
};

// Ghost preview
let ghost = {
  x: 0,
  y: 0,
  visible: false,
  valid: false
};

// Simple box collision check
  function withinBounds(x, y, type) {
  const size = type === 'townCentre'
    ? { w: 120, h: 40 }
    : { w: 50, h: 40 };
  return placedBuildings.some(b => {
    const otherSize = b.type === 'townCentre'
      ? { w: 120, h: 40 }
      : { w: 50, h: 40 };
  return (
    x - size.w / 2 >= 0 &&
    x + size.w / 2 <= canvas.width &&
    y - size.h / 2 >= 0 &&
    y + size.h / 2 <= canvas.height
  );
 });
} 


// ======================
// Draw everything
// ======================
function drawAllBuildings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw placed buildings
  placedBuildings.forEach(b => {
    if (b.type === 'townCentre') {
      ctx.fillStyle = '#8B8680';
      ctx.fillRect(b.x - 60, b.y - 20, 120, 40);
    }

    if (b.type === 'house') {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(b.x - 25, b.y - 20, 50, 40);
    }
  });

  // Draw ghost preview
  if (placementMode.active && ghost.visible) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = ghost.valid ? '#3CB371' : '#FF3333'; // ✅ green = valid, red = invalid
    ctx.fillRect(ghost.x - 25, ghost.y - 20, 50, 40);
    ctx.restore();
  }
}

// ======================
// Build House → enter placement mode
// ======================
document.getElementById('build-house')?.addEventListener('click', () => {
  if (resources.wood < 10 || resources.stone < 5) {
    alert('Not enough resources');
    return;
  }

  placementMode.active = true;
  placementMode.type = 'house';
  ghost.visible = true;

  // Start ghost in centre
  ghost.x = canvas.width / 2;
  ghost.y = canvas.height / 2;
  ghost.valid = !collides(ghost.x, ghost.y, 'house');

  drawAllBuildings();
});

// ======================
// Move ghost with mouse
// ======================
  canvas.addEventListener('mousemove', (e) => {
  if (!placementMode.active) return;

  const rect = canvas.getBoundingClientRect();

  ghost.x = snapToGrid(e.clientX - rect.left);
  ghost.y = snapToGrid(e.clientY - rect.top);

  ghost.valid =
    withinBounds(ghost.x, ghost.y, placementMode.type) &&
    !collides(ghost.x, ghost.y, placementMode.type);

  drawAllBuildings();
});

// ======================
// Click canvas → place building
// ======================
canvas.addEventListener('click', () => {
  if (!placementMode.active) return;
  if (!ghost.valid) return;

  // Pay cost
  resources.wood -= 10;
  resources.stone -= 5;

  // Place house
  placedBuildings.push({
    type: placementMode.type,
    x: ghost.x,
    y: ghost.y
  });

  buildings.house++;
  villagers.idle += 2;

  const houseCountEl = document.getElementById('house-count');
  if (houseCountEl) {
    houseCountEl.textContent = `Built: ${buildings.house}`;
  }

  placementMode.active = false;
  placementMode.type = null;
  ghost.visible = false;

  updateDisplay();
  drawAllBuildings();
});

// ======================
// ESC cancels placement
// ======================
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!placementMode.active) return;

  placementMode.active = false;
  placementMode.type = null;
  ghost.visible = false;

  drawAllBuildings();
});


// ---------- Buttons ----------
document.getElementById('send-villagers')?.addEventListener('click', () => {
  if (villagers.idle <= 0) return;
  villagers.idle--;
  villagers.gathering++;
  updateDisplay();
});

document.getElementById('recall-villagers')?.addEventListener('click', () => {
  if (villagers.gathering <= 0) return;
  villagers.gathering--;
  villagers.idle++;
  updateDisplay();
});

  

// ---------- Resource Tick ----------
setInterval(() => {
  resources.food += villagers.gathering;
  updateDisplay();
}, 3000);

// ---------- Init ----------
updateDisplay();
drawAllBuildings();

});
