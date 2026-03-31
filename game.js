// ====================== State
// ======================
document.addEventListener('DOMContentLoaded', () => {
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

const workerProduction = {
  farm: { food: 1 },
  logging: { wood: 1 },
  market: { coin: 1 }
};

let placedBuildings = [{ type: 'townCentre', x: 355, y: 285 }];
let placementMode = { active: false, type: null, refundCost: null };
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

const generationRates = { townCentre: { wood: 1, stone: 1, food: 1 } };
const gatherRates = { wood: 2, stone: 2, food: 1 };
const buildingWorkSlots = { farm: 2, logging: 2, market: 2 };

// ======================
// Canvas
// ======================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
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
  return isWithinBounds(x, y) && !collides(x, y, type);
}

// ======================
// Init
// ======================
function updateDisplay() {
  document.getElementById('food').textContent = `🌾:${resources.food}`;
  document.getElementById('wood').textContent = `🪵:${resources.wood}`;
  document.getElementById('stone').textContent = `⛏️:${resources.stone}`;
  document.getElementById('coin').textContent = `🪙:${resources.coin}`;
}

function drawAllBuildings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placedBuildings.forEach(b => {
    if (b.type === 'townCentre') {
      ctx.fillStyle = '#8B8680';
      ctx.fillRect(b.x - 60, b.y - 20, 120, 40);
    }
  });
}

window.addEventListener('load', () => {
  updateDisplay();
  drawAllBuildings();
});});

