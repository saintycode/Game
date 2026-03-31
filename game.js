// ======================
// stats
// ======================
let resources = { wood: 10, stone: 10, food: 10, coin: 0 };

let buildings = {
  townCentre: 1,
  house: 0,
  farm: 0,
  logging: 0,
  market: 0,
  tower: 0
};

let villagers = {
  idle: 2,
  gathering: 0,
  working: 0
};

let workersAssigned = {
  farm: 0,
  logging: 0,
  market: 0
};

const workerProduction = {
  farm:    { food: 1 },
  logging: { wood: 1 },
  market:  { coin: 1 }
};
let lastMouse = { x: canvas.width / 2, y: canvas.height / 2 };

// ONLY town centre present at load 
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
const BUILDING_RADIUS = 35;

const buildingCosts = {
  townCentre: { wood: 0, stone: 0, food: 0, coin: 0 },
  house: { wood: 10, stone: 5, food: 0, coin: 0 },
  farm: { wood: 15, stone: 7, food: 0, coin: 0 },
  logging: { wood: 20, stone: 10, food: 0, coin: 0 },
  market: { wood: 25, stone: 15, food: 0, coin: 0 },
  tower: { wood: 30, stone: 20, food: 0, coin: 10 }
};

const generationRates = {
  townCentre: { wood: 1, stone: 1, food: 1 }
};

const gatherRates = { wood: 2, stone: 2, food: 1 };

const buildingWorkSlots = {
  farm: 2,
  logging: 2,
  market: 2
  // house, townCentre, tower intentionally omitted (0 slots)
};
// ======================
// Canvas
// ======================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// track last mouse position (
let lastMouse = { x: canvas.width / 2, y: canvas.height / 2 };

// ======================
// Helpers
// ======================
function snapToGrid(v) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

function getRadiusForType(type) {
  switch (type) {
    case 'townCentre': return 60;
    case 'market': return 45;
    case 'farm': return 40;
    case 'logging': return 40;
    case 'tower': return 35;
    case 'house': return 30;
    default: return BUILDING_RADIUS;
  }
}

function isWithinBounds(x, y, r = BUILDING_RADIUS) {
  return (
    x > EDGE_BUFFER + r &&
    y > EDGE_BUFFER + r &&
    x < canvas.width - EDGE_BUFFER - r &&
    y < canvas.height - EDGE_BUFFER - r
  );
}

function collides(x, y, type) {
  const r1 = getRadiusForType(type);
  return placedBuildings.some(b => {
    const r2 = getRadiusForType(b.type);
    return Math.hypot(b.x - x, b.y - y) < (r1 + r2);
  });
}

function canPlace(x, y, type) {
  const r = getRadiusForType(type);
  return isWithinBounds(x, y, r) && !collides(x, y, type);
}
function getTotalWorkSlots() {
  return Object.entries(buildingWorkSlots).reduce((total, [type, slots]) => {
    return total + (buildings[type] * slots);
  }, 0);
}
// ======================
// Drawing
// ======================

// Town Centre (your existing)
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

// House 
function drawHouse(x, y, ghostMode = false, valid = true) {
  ctx.globalAlpha = ghostMode ? 0.55 : 1;
  ctx.fillStyle = valid ? '#A0522D' : '#FF0000';
  ctx.fillRect(x - 25, y - 40, 50, 40);
  ctx.globalAlpha = 1;
}

// Minimal fallback draw functions so nothing crashes
function drawFarm(x, y) {
  ctx.fillStyle = '#228B22';
  ctx.fillRect(x - 30, y - 20, 60, 40);
  ctx.fillStyle = '#8B4513';
  ctx.strokeRect(x - 32, y - 22, 64, 44);
}

function drawLogging(x, y) {
  ctx.fillStyle = '#CD853F';
  ctx.fillRect(x - 25, y - 25, 50, 50);
  ctx.strokeStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(x + 22, y, 12, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMarket(x, y) {
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(x - 35, y - 20, 70, 40);
  ctx.fillStyle = '#FF6347';
  ctx.beginPath();
  ctx.moveTo(x - 35, y - 20);
  ctx.lineTo(x, y - 45);
  ctx.lineTo(x + 35, y - 20);
  ctx.closePath();
  ctx.fill();
}

function drawTower(x, y) {
  ctx.fillStyle = '#A9A9A9';
  ctx.fillRect(x - 15, y - 45, 30, 60);
  ctx.fillStyle = '#696969';
  ctx.fillRect(x - 18, y - 50, 36, 8);
}

function drawByType(type, x, y) {
  switch (type) {
    case 'townCentre': drawTownCentre(x, y); break;
    case 'house': drawHouse(x, y); break;
    case 'farm': drawFarm(x, y); break;
    case 'logging': drawLogging(x, y); break;
    case 'market': drawMarket(x, y); break;
    case 'tower': drawTower(x, y); break;
  }
}

function drawGhost(type, x, y, valid) {
  ctx.save();
  ctx.globalAlpha = 0.55;

  // Use house's built-in ghost styling
  if (type === 'house') {
    drawHouse(x, y, true, valid);
  } else {
    // other types: draw faded but never crash (we defined them above)
    drawByType(type, x, y);
  }

  // outline indicator
  ctx.globalAlpha = 1;
  ctx.strokeStyle = valid ? '#3CB371' : '#FF3333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, getRadiusForType(type), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawAllBuildings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  placedBuildings.forEach(b => drawByType(b.type, b.x, b.y));

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
  const workingEl = document.getElementById('villagers-working');

  if (idleEl) idleEl.textContent = `Idle: ${villagers.idle}`;
  if (gatheringEl) gatheringEl.textContent = `Gathering: ${villagers.gathering}`;
  if (workingEl) workingEl.textContent = `Working: ${villagers.working}`;
}
// ======================
// Resource Generation
// ======================
function generateResources() {
  // Town centre passive generation
  resources.wood += generationRates.townCentre.wood * buildings.townCentre;
  resources.stone += generationRates.townCentre.stone * buildings.townCentre;
  resources.food += generationRates.townCentre.food * buildings.townCentre;

  // Gathering villagers
  resources.wood += gatherRates.wood * villagers.gathering;
  resources.stone += gatherRates.stone * villagers.gathering;
  resources.food += gatherRates.food * villagers.gathering;

  // Working villagers (1 resource per worker per tick)
  Object.entries(workersAssigned).forEach(([type, count]) => {
    const production = workerProduction[type];
    if (!production || count <= 0) return;

    Object.entries(production).forEach(([res, amount]) => {
      resources[res] += amount * count;
    });
  });

  updateDisplay();
}
setInterval(generateResources, 30000);

// ======================
// Placement Logic
// ======================

function setGhostFromMouseEvent(e) {
  const r = canvas.getBoundingClientRect();
  ghost.x = snapToGrid(e.clientX - r.left);
  ghost.y = snapToGrid(e.clientY - r.top);
  ghost.visible = true;
  ghost.valid = canPlace(ghost.x, ghost.y, placementMode.type);
}

// Track mouse position ALWAYS
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  lastMouse.x = e.clientX - r.left;
  lastMouse.y = e.clientY - r.top;

  if (!placementMode.active) return;

  setGhostFromMouseEvent(e);
  drawAllBuildings();
});

// FIXED startPlacement
function startPlacement(type) {
  // market singleton rule
  if (type === 'market' && buildings.market > 0) {
    alert('Only one market allowed');
    return;
  }

  const cost = buildingCosts[type];

  for (const r in cost) {
    if (resources[r] < cost[r]) {
      alert('Not enough resources!');
      return;
    }
  }

  for (const r in cost) resources[r] -= cost[r];

  placementMode.active = true;
  placementMode.type = type;
  placementMode.refundCost = cost;

  // ghost appears immediately under cursor
  ghost.x = snapToGrid(lastMouse.x);
  ghost.y = snapToGrid(lastMouse.y);
  ghost.visible = true;
  ghost.valid = canPlace(ghost.x, ghost.y, placementMode.type);

  updateDisplay();
  drawAllBuildings();
}
  //  House bonus: +2 idle villagers
  if (placementMode.type === 'house') {
    villagers.idle += 2;
  }

  const countEl = document.getElementById(`${placementMode.type}-count`);
  if (countEl) countEl.textContent = `Built: ${buildings[placementMode.type]}`;

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
  // market singleton
  if (type === 'market' && buildings.market > 0) {
    alert('Only one market allowed');
    return;
  }
  const cost = buildingCosts[type];
  for (const r in cost) {
    if (resources[r] < cost[r]) {
      alert('Not enough resources!');
      return;
    }
  }
  for (const r in cost) resources[r] -= cost[r];
  placementMode.active = true;
  placementMode.type = type;
  placementMode.refundCost = cost;

  //  Make ghost appear immediately
  ghost.visible = true;
  ghost.valid = false;

  updateDisplay();
  drawAllBuildings();
}

document.getElementById('build-house')?.addEventListener('click', () => startPlacement('house'));
document.getElementById('build-farm')?.addEventListener('click', () => startPlacement('farm'));
document.getElementById('build-logging')?.addEventListener('click', () => startPlacement('logging'));
document.getElementById('build-market')?.addEventListener('click', () => startPlacement('market'));
document.getElementById('build-tower')?.addEventListener('click', () => startPlacement('tower'));

// Villagers
function getMaxSlotsFor(type) {
  return (buildings[type] || 0) * (buildingWorkSlots[type] || 0);
}

function hasFreeSlot(type) {
  return workersAssigned[type] < getMaxSlotsFor(type);
}

document.getElementById('send-villagers-work')?.addEventListener('click', () => {
  if (villagers.idle <= 0) {
    alert('No idle villagers available');
    return;
  }

  // auto-assign: farm -> logging -> market
  const order = ['farm', 'logging', 'market'];
  const target = order.find(t => hasFreeSlot(t));

  if (!target) {
    alert('No available work slots');
    return;
  }

  villagers.idle--;
  villagers.working++;
  workersAssigned[target]++;

  updateDisplay();
});

document.getElementById('recall-villagers-work')?.addEventListener('click', () => {
  if (villagers.working <= 0) return;

  // remove from last assigned: market -> logging -> farm
  const order = ['market', 'logging', 'farm'];
  const target = order.find(t => workersAssigned[t] > 0);

  if (!target) {
    // safety fallback
    villagers.working--;
    villagers.idle++;
    updateDisplay();
    return;
  }

  workersAssigned[target]--;
  villagers.working--;
  villagers.idle++;

  updateDisplay();
});
document.getElementById('send-villagers')?.addEventListener('click', () => {
    if (villagers.idle > 0) {
        villagers.idle -= 1;
        villagers.gathering += 1;
        updateDisplay();
        alert('1 villager sent to gather resources!');
    } else {
        alert('No idle villagers available!');
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



