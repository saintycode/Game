// ======================
// Game State
// ======================
let resources = { wood: 10, stone: 10, food: 10, coin: 0 };

let buildings = {
  townCentre: 1,
  house: 0,
  farm: 0,
  mill: 0,
  market: 0,
  tower: 0
};

let villagers = { idle: 2, gathering: 0 };

let placedBuildings = [{ type: 'townCentre', x: 355, y: 285 }];

let placementMode = {
  active: false,
  type: null,
  refundCost: null
};

let ghost = { x: 0, y: 0, visible: false, valid: false };

// ======================
// Constants
// ======================
const GRID_SIZE = 20;
const EDGE_BUFFER = 40;

// simple footprint used for bounds + collision
const BUILDING_RADIUS = 35;

const buildingCosts = {
  townCentre: { wood: 0, stone: 0, food: 0, coin: 0 },
  house: { wood: 10, stone: 5, food: 0, coin: 0 },
  farm: { wood: 15, stone: 7, food: 0, coin: 0 },
  mill: { wood: 20, stone: 10, food: 0, coin: 0 },
  market: { wood: 25, stone: 15, food: 0, coin: 0 },
  tower: { wood: 30, stone: 20, food: 0, coin: 10 }
};

const generationRates = {
  townCentre: { wood: 1, stone: 1, food: 1 }
};

const gatherRates = { wood: 2, stone: 2, food: 1 };

// ======================
// Canvas
// ======================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ======================
// Helpers
// ======================
function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function isWithinBounds(x, y, r = BUILDING_RADIUS) {
  return (
    x > EDGE_BUFFER + r &&
    y > EDGE_BUFFER + r &&
    x < canvas.width - EDGE_BUFFER - r &&
    y < canvas.height - EDGE_BUFFER - r
  );
}

function getRadiusForType(type) {
  // if you want different sizes per building, change here
  switch (type) {
    case 'townCentre': return 60;
    case 'market': return 45;
    case 'tower': return 35;
    default: return BUILDING_RADIUS;
  }
}

function collides(x, y, type) {
  const r1 = getRadiusForType(type);

  return placedBuildings.some(b => {
    const r2 = getRadiusForType(b.type);
    const dx = b.x - x;
    const dy = b.y - y;
    return Math.hypot(dx, dy) < (r1 + r2);
  });
}

function canPlace(x, y, type) {
  const r = getRadiusForType(type);
  return isWithinBounds(x, y, r) && !collides(x, y, type);
}

// ======================
// Drawing (assumes you already have drawFarm/drawMill/drawMarket/drawTower etc.)
// ======================
function drawTownCentre(x, y) {
  ctx.fillStyle = '#8B8680';
  ctx.fillRect(x - 60, y - 20, 120, 40);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x - 50, y - 50, 100, 50);
  ctx.fillStyle = '#DC143C';
  ctx.beginPath();
  ctx.moveTo(x - 50, y - 50);
  ctx.lineTo(x, y - 80);
  ctx.lineTo(x + 50, y - 50);
  ctx.fill();
}

// keep your existing detailed drawHouse if you want;
// this supports ghost styling.
function drawHouse(x, y, ghostMode = false, valid = true) {
  ctx.globalAlpha = ghostMode ? 0.5 : 1;
  ctx.fillStyle = valid ? '#A0522D' : '#FF0000';
  ctx.fillRect(x - 25, y - 40, 50, 40);
  ctx.globalAlpha = 1;
}

function drawByType(type, x, y) {
  switch (type) {
    case 'townCentre': drawTownCentre(x, y); break;
    case 'house': drawHouse(x, y); break;
    case 'farm': drawFarm(x, y); break;
    case 'mill': drawMill(x, y); break;
    case 'market': drawMarket(x, y); break;
    case 'tower': drawTower(x, y); break;
  }
}

function drawGhost(type, x, y, valid) {
  // Generic ghost: draw building with alpha + draw an outline indicator
  ctx.save();
  ctx.globalAlpha = 0.55;

  // If it's a house, use the special ghost-aware drawHouse
  if (type === 'house') {
    drawHouse(x, y, true, valid);
  } else {
    // for other buildings, just draw them faded
    drawByType(type, x, y);
  }

  // outline indicator
  ctx.globalAlpha = 1;
  ctx.strokeStyle = valid ? '#3CB371' : '#FF3333';
  ctx.lineWidth = 2;
  const r = getRadiusForType(type);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawAllBuildings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  placedBuildings.forEach(b => {
    drawByType(b.type, b.x, b.y);
  });

  if (ghost.visible && placementMode.active) {
    drawGhost(placementMode.type, ghost.x, ghost.y, ghost.valid);
  }
}

// ======================
// UI Updates
// ======================
function updateDisplay() {
  const woodEl = document.getElementById('wood');
  const stoneEl = document.getElementById('stone');
  const foodEl = document.getElementById('food');
  const coinEl = document.getElementById('coin');

  if (woodEl) woodEl.textContent = `Wood: ${Math.floor(resources.wood)}`;
  if (stoneEl) stoneEl.textContent = `Stone: ${Math.floor(resources.stone)}`;
  if (foodEl) foodEl.textContent = `Food: ${Math.floor(resources.food)}`;
  if (coinEl) coinEl.textContent = `Coin: ${Math.floor(resources.coin)}`;

  const idleEl = document.getElementById('villagers-idle');
  const gatheringEl = document.getElementById('villagers-gathering');
  if (idleEl) idleEl.textContent = `Idle: ${villagers.idle}`;
  if (gatheringEl) gatheringEl.textContent = `Gathering: ${villagers.gathering}`;
}

// ======================
// Resource Generation
// ======================
function generateResources() {
  resources.wood += generationRates.townCentre.wood * buildings.townCentre;
  resources.stone += generationRates.townCentre.stone * buildings.townCentre;
  resources.food += generationRates.townCentre.food * buildings.townCentre;

  resources.wood += gatherRates.wood * villagers.gathering;
  resources.stone += gatherRates.stone * villagers.gathering;
  resources.food += gatherRates.food * villagers.gathering;

  updateDisplay();
}

setInterval(generateResources, 30000);

// ======================
// Placement Logic
// ======================
canvas.addEventListener('mousemove', e => {
  if (!placementMode.active) return;

  const r = canvas.getBoundingClientRect();
  const x = snapToGrid(e.clientX - r.left);
  const y = snapToGrid(e.clientY - r.top);

  ghost.x = x;
  ghost.y = y;
  ghost.visible = true;
  ghost.valid = canPlace(x, y, placementMode.type);

  drawAllBuildings();
});

canvas.addEventListener('click', () => {
  if (!placementMode.active) return;
  if (!ghost.valid) return;

  placedBuildings.push({ type: placementMode.type, x: ghost.x, y: ghost.y });
  buildings[placementMode.type]++;

  // House bonus
  if (placementMode.type === 'house') {
    villagers.idle += 2;
  }

  // Update count label if present
  const countEl = document.getElementById(`${placementMode.type}-count`);
  if (countEl) countEl.textContent = `Built: ${buildings[placementMode.type]}`;

  // clear placement state
  placementMode.active = false;
  placementMode.type = null;
  placementMode.refundCost = null;
  ghost.visible = false;

  drawAllBuildings();
  updateDisplay();
});

// Cancel + refund
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!placementMode.active) return;

  if (placementMode.refundCost) {
    for (const r in placementMode.refundCost) {
      resources[r] += placementMode.refundCost[r];
    }
  }

  placementMode.active = false;
  placementMode.type = null;
  placementMode.refundCost = null;
  ghost.visible = false;

  drawAllBuildings();
  updateDisplay();
});

// ======================
// Build Buttons
// ======================
function startPlacement(type) {
  // enforce market singleton
  if (type === 'market' && buildings.market > 0) {
    alert('Only one market allowed');
    return;
  }

  const cost = buildingCosts[type];

  // check affordability
  for (const r in cost) {
    if (resources[r] < cost[r]) {
      alert('Not enough resources!');
      return;
    }
  }

  // deduct now, refund if cancelled
  for (const r in cost) resources[r] -= cost[r];

  placementMode.active = true;
  placementMode.type = type;
  placementMode.refundCost = cost;

  updateDisplay();
}

document.getElementById('build-house')?.addEventListener('click', () => startPlacement('house'));
document.getElementById('build-farm')?.addEventListener('click', () => startPlacement('farm'));
document.getElementById('build-mill')?.addEventListener('click', () => startPlacement('mill'));
document.getElementById('build-market')?.addEventListener('click', () => startPlacement('market'));
document.getElementById('build-tower')?.addEventListener('click', () => startPlacement('tower'));

// Villagers
document.getElementById('send-villagers')?.addEventListener('click', () => {
  if (villagers.idle > 0) {
    villagers.idle--;
    villagers.gathering++;
    updateDisplay();
  }
});

document.getElementById('recall-villagers')?.addEventListener('click', () => {
  if (villagers.gathering > 0) {
    villagers.gathering--;
    villagers.idle++;
    updateDisplay();
  }
});

// ======================
// Init
// ======================
function initGame() {
  updateDisplay();
  drawAllBuildings();
}

requestAnimationFrame(initGame);
