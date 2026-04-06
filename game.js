document.addEventListener('DOMContentLoaded', () => {
  // 1) GAME STATE (numbers that change during play)
  const resources = { wood: 10, stone: 10, food: 10, coin: 0 };

const buildings = {const buildings 1,
  house: 0,
  farm: 0,
  logging: 0,
  market: 0,
  mine: 0,
  tower: 0
};


  const villagers = {
  idle: 2,
  gathering: 0,
  working: 0,
  training: 0,
  guards: 0
};
 
  // How many workers are assigned to each workplace type
const workersAssigned = {
: 0,  farm: 0,
  market: 0,
  mine: 0 
};

  
  // How many training/guards are assigned
  const trainingQueue = [];
  const guardsAssigned = 0;
  
  // 2) CANVAS + GRID
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const GRID_SIZE = 20; // change to 16/32 later if you want a different feel

  const snapToGrid = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE;


  // 3) BUILDING DEFINITIONS (edit here to add new buildings)
  const BUILDINGS = {
    townCentre: {
      label: 'Town Centre',
      cost: { wood: 0, stone: 0, food: 0, coin: 0 },
      size: { w: 120, h: 80 }, // bigger so the sprite reads well
      sprite: 'images/town-centre.png',
      workerSlots: 0,
      productionPerWorker: {},
      onBuild: () => {}
    },

    house: {
      label: 'House',
      cost: { wood: 10, stone: 5, food: 0, coin: 0 },
      size: { w: 70, h: 70 },
      sprite: 'images/house.png',
      workerSlots: 0,
      productionPerWorker: {},
      onBuild: () => {
        // House bonus: +2 idle villagers
        villagers.idle += 2;
      }
    },

    farm: {
      label: 'Farm',
      cost: { wood: 15, stone: 7, food: 0, coin: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/farm.png',
      workerSlots: 2,
      productionPerWorker: { food: 1 },
      onBuild: () => {}
    },

    logging: {
      label: 'Logging',
      cost: { wood: 20, stone: 10, food: 0, coin: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/logging.png',
      workerSlots: 2,
      productionPerWorker: { wood: 1 },
      onBuild: () => {}
    },
   mine: {
    label: 'Mine',
    cost: { wood: 20, stone: 12, food: 0, coin: 5 },
    size: { w: 90, h: 70 },
    sprite: 'images/mine.png',
    workerSlots: 2,
    productionPerWorker: { stone: 1 },
    onBuild: () => {}
    },
    market: {
      label: 'Market',
      cost: { wood: 25, stone: 15, food: 0, coin: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/market.png',
      workerSlots: 2,
      productionPerWorker: { coin: 1 },
      onBuild: () => {}
    },

    tower: { label: 'Guard Tower',
    cost: { wood: 30, stone: 20, food: 0, coin: 10 },
    size: { w: 70, h: 90 },
    sprite: 'images/guard-tower.png',

    trainingSlots: 2,     // training at a time
    guardSlots: 2,        // ✅ NEW: guard duty slots per tower
    trainingTimeMs: 5000,

    onBuild: () => {}
    }
  };

  // Which DOM element holds "Built: X" for each building type
  const COUNT_ID = {const COUNT: 'house-count',
  farm: 'farm-count',
  logging: 'logging-count',
  market: 'market-count',
  mine: 'mine-count',     
  tower: 'tower-count'
};


  // Worker UI elements in your cards
  const WORKER_UI = {
  farm logging: 'logging-workers',  
  farm: 'farm-workers',
  market: 'market-workers',
  mine: 'mine-workers'    
};


  // 4) SPRITE LOADING (images)
  const sprites = {};

  function loadSprites() {
    Object.keys(BUILDINGS).forEach((type) => {
      const img = new Image();
      img.onload = () => drawAll(); // redraw as soon as each sprite arrives
      img.src = BUILDINGS[type].sprite;
      sprites[type] = img;
    });
  }

  // 5) WORLD STATE (what is placed on the canvas)
  const placedBuildings = [
    { type: 'townCentre', x: 400, y: 400 } // starting building
  ];

  // 6) PLACEMENT MODE + GHOST
  const placementMode = { active: false, type: null };

  const ghost = { x: 0, y: 0, visible: false, valid: false };

  function getFootprint(type) {
    return BUILDINGS[type].size;
  }

  function withinBounds(x, y, type) {
    const { w, h } = getFootprint(type);
    return (
      x - w / 2 >= 0 &&
      x + w / 2 <= canvas.width &&
      y - h / 2 >= 0 &&
      y + h / 2 <= canvas.height
    );
  }

  function collides(x, y, type) {
    const a = getFootprint(type);
    return placedBuildings.some((b) => {
      const c = getFootprint(b.type);
      return (
        x - a.w / 2 < b.x + c.w / 2 &&
        x + a.w / 2 > b.x - c.w / 2 &&
        y - a.h / 2 < b.y + c.h / 2 &&
        y + a.h / 2 > b.y - c.h / 2
      );
    });
  }

  function canPlace(x, y, type) {
    return withinBounds(x, y, type) && !collides(x, y, type);
  }

  // 7) UI UPDATE FUNCTIONS
  function updateResourceUI() {
    const foodEl = document.getElementById('food');
    const woodEl = document.getElementById('wood');
    const stoneEl = document.getElementById('stone');
    const coinEl = document.getElementById('coin');

    if (foodEl) foodEl.textContent = `🌾:${Math.floor(resources.food)}`;
    if (woodEl) woodEl.textContent = `🪵:${Math.floor(resources.wood)}`;
    if (stoneEl) stoneEl.textContent = `⛏️:${Math.floor(resources.stone)}`;
    if (coinEl) coinEl.textContent = `🪙:${Math.floor(resources.coin)}`;
  }

  function updateVillagerUI() {
    const idleEl = document.getElementById('villagers-idle');
    const gatheringEl = document.getElementById('villagers-gathering');
    const workingEl = document.getElementById('villagers-working');
    const trainingEl = document.getElementById('villagers-training');

    if (idleEl) idleEl.textContent = `Idle: ${villagers.idle}`;
    if (gatheringEl) gatheringEl.textContent = `Gathering: ${villagers.gathering}`;
    if (workingEl) workingEl.textContent = `Working: ${villagers.working}`;
    if (trainingEl) trainingEl.textContent = `Training: ${villagers.training}`;
  }

  function updateWorkerUI() {
    Object.keys(WORKER_UI).forEach((type) => {
      const el = document.getElementById(WORKER_UI[type]);
      if (!el) return;

      const max = buildings[type] * BUILDINGS[type].workerSlots;
      const cur = workersAssigned[type];
      el.textContent = `${cur} / ${max}`;
    });
  }

  function updateWorkerButtons() {
    ['farm', 'logging', 'market'].forEach((type) => {
      const addBtn = document.getElementById(`${type}-add-worker`);
      const removeBtn = document.getElementById(`${type}-remove-worker`);

      const max = buildings[type] * BUILDINGS[type].workerSlots;
      const cur = workersAssigned[type];

      if (addBtn) addBtn.disabled = villagers.idle === 0 || cur >= max;
      if (removeBtn) removeBtn.disabled = cur === 0;
    });
  }
function updateGuardUI() {
  const guardEl = document.getElementById('tower-workers');
  if (!guardEl) return;

  const maxGuards =
    buildings.tower * (BUILDINGS.tower.guardSlots ?? 0);

  guardEl.textContent = `${villagers.guards} / ${maxGuards}`;
}
  
function updateDisplay() {
  updateResourceUI();
  updateVillagerUI();
  updateWorkerUI();
  updateWorkerButtons();
  updateGuardUI(); // ✅ new
}
  // 8) DRAWING (sprites + ghost)
  function drawBuildingSprite(type, x, y) {
    const img = sprites[type];
    const { w, h } = getFootprint(type);

    // If sprite hasn't loaded yet, draw a placeholder box so you still see something.
    if (!img || !img.complete) {
      ctx.fillStyle = '#999';
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      return;
    }

    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  }

  function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw placed buildings
    placedBuildings.forEach((b) => drawBuildingSprite(b.type, b.x, b.y));

    // Draw ghost preview (green overlay if valid, red overlay if invalid)
    if (placementMode.active && ghost.visible) {
      drawBuildingSprite(placementMode.type, ghost.x, ghost.y);

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = ghost.valid ? '#3CB371' : '#FF3333';
      const { w, h } = getFootprint(placementMode.type);
      ctx.fillRect(ghost.x - w / 2, ghost.y - h / 2, w, h);
      ctx.restore();
    }
  }

  // 9) BUILD FLOW (enter placement mode from a card)
  function hasResources(cost) {
    return Object.keys(cost).every((r) => (resources[r] ?? 0) >= cost[r]);
  }

  function payCost(cost) {
    Object.keys(cost).forEach((r) => {
      resources[r] -= cost[r];
    });
  }

  function startPlacement(type) {
    const def = BUILDINGS[type];

    // Example rule: only one market allowed (easy to remove if you want)
    if (type === 'market' && buildings.market > 0) {
      alert('Only one market allowed');
      return;
    }
    if (type === 'mine' && (buildings.market <= 0 || resources.coin < 5)) {
    alert('You need a Market and 5 coin to build a Mine');
    return;
    }
    if (!hasResources(def.cost)) {
      alert('Not enough resources');
      return;
    }

    placementMode.active = true;
    placementMode.type = type;
    ghost.visible = true;

    ghost.x = snapToGrid(canvas.width / 2);
    ghost.y = snapToGrid(canvas.height / 2);
    ghost.valid = canPlace(ghost.x, ghost.y, type);

    drawAll();
  }

  // 10) INPUT: mousemove / click / escape
  canvas.addEventListener('mousemove', (e) => {
    if (!placementMode.active) return;

    const rect = canvas.getBoundingClientRect();
    ghost.x = snapToGrid(e.clientX - rect.left);
    ghost.y = snapToGrid(e.clientY - rect.top);

    ghost.valid = canPlace(ghost.x, ghost.y, placementMode.type);
    drawAll();
  });

  canvas.addEventListener('mouseleave', () => {
    if (!placementMode.active) return;
    ghost.visible = false;
    drawAll();
  });

  canvas.addEventListener('mouseenter', () => {
    if (!placementMode.active) return;
    ghost.visible = true;
    drawAll();
  });

  canvas.addEventListener('click', () => {
    if (!placementMode.active || !ghost.valid) return;

    const type = placementMode.type;
    const def = BUILDINGS[type];

    payCost(def.cost);

    placedBuildings.push({ type, x: ghost.x, y: ghost.y });
    buildings[type]++;

    // run special build effects (e.g. house adds villagers)
    def.onBuild?.();

    // update built counter in the card (if it has one)
    const countId = COUNT_ID[type];
    if (countId) {
      const el = document.getElementById(countId);
      if (el) el.textContent = `Built: ${buildings[type]}`;
    }

    placementMode.active = false;
    placementMode.type = null;
    ghost.visible = false;

    updateDisplay();
    drawAll();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!placementMode.active) return;

    placementMode.active = false;
    placementMode.type = null;
    ghost.visible = false;

    drawAll();
  });


  // 11) BUTTONS (villagers + build cards + workers)
  // Villagers: gathering
  document.getElementById('send-villagers')?.addEventListener('click', () => {
    if (villagers.idle <= 0) return alert('No idle villagers available!');
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
  // Villagers: traning for guard 
// Guards UI (villager row)
function updateGuardsUI() {
  const guardsEl = document.getElementById('villagers-guards');
  if (guardsEl) guardsEl.textContent = `Guards: ${villagers.guards}`;
}

// Guard Tower UI (card row)
function updateGuardUI() {
  const guardEl = document.getElementById('tower-workers');
  if (!guardEl) return;

  const maxGuards = buildings.tower * (BUILDINGS.tower.guardSlots ?? 0);
  guardEl.textContent = `${villagers.guards} / ${maxGuards}`;
}

// Training (time-based)
document.getElementById('send-villagers-training')?.addEventListener('click', () => {
  const towerCount = buildings.tower;

  if (towerCount <= 0) {
    alert('You need a Guard Tower to train villagers');
    return;
  }

  const maxTraining = towerCount * (BUILDINGS.tower.trainingSlots ?? 0);

  if (villagers.idle <= 0) {
    alert('No idle villagers available');
    return;
  }

  if (villagers.training >= maxTraining) {
    alert('All training slots are full');
    return;
  }

  villagers.idle--;
  villagers.training++;
  updateDisplay();

  const trainingTime = BUILDINGS.tower.trainingTimeMs ?? 5000;

  const timeoutId = setTimeout(() => {
    villagers.training--;
    villagers.idle++; // v1: trained villagers return to idle
    updateDisplay();
  }, trainingTime);

  trainingQueue.push(timeoutId);
});


// Guard Duty Assignment (+ / -)
function assignGuard() {
  const maxGuards = buildings.tower * (BUILDINGS.tower.guardSlots ?? 0);

  if (villagers.idle <= 0) {
    alert('No available villagers to assign');
    return;
  }

  if (villagers.guards >= maxGuards) {
    alert('All guard slots are full');
    return;
  }

  villagers.idle--;
  villagers.guards++;
  updateDisplay();
}

function removeGuard() {
  if (villagers.guards <= 0) return;

  villagers.guards--;
  villagers.idle++;
  updateDisplay();
}

//  Attach guard buttons 
document.getElementById('tower-add-worker')?.addEventListener('click', assignGuard);
document.getElementById('tower-remove-worker')?.addEventListener('click', removeGuard);

  // Build buttons (cards)
  document.getElementById('build-house')?.addEventListener('click', () => startPlacement('house'));
  document.getElementById('build-farm')?.addEventListener('click', () => startPlacement('farm'));
  document.getElementById('build-logging')?.addEventListener('click', () => startPlacement('logging'));
  document.getElementById('build-market')?.addEventListener('click', () => startPlacement('market'));
  document.getElementById('build-tower')?.addEventListener('click', () => startPlacement('tower'));
  document.getElementById('build-mine')?.addEventListener('click', () => startPlacement('mine'));

  // Worker + / -
  function assignWorkerTo(type) {
    const max = buildings[type] * BUILDINGS[type].workerSlots;
    if (villagers.idle <= 0) return alert('No idle villagers available');
    if (workersAssigned[type] >= max) return alert('No free work slots');

    villagers.idle--;
    villagers.working++;
    workersAssigned[type]++;
    updateDisplay();
  }

  function removeWorkerFrom(type) {
    if (workersAssigned[type] <= 0) return;
    workersAssigned[type]--;
    villagers.working--;
    villagers.idle++;
    updateDisplay();
  }

  document.getElementById('farm-add-worker')?.addEventListener('click', () => assignWorkerTo('farm'));
  document.getElementById('farm-remove-worker')?.addEventListener('click', () => removeWorkerFrom('farm'));
  document.getElementById('logging-add-worker')?.addEventListener('click', () => assignWorkerTo('logging'));
  document.getElementById('logging-remove-worker')?.addEventListener('click', () => removeWorkerFrom('logging'));
  document.getElementById('market-add-worker')?.addEventListener('click', () => assignWorkerTo('market'));
  document.getElementById('market-remove-worker')?.addEventListener('click', () => removeWorkerFrom('market'));
  document.getElementById('mine-add-worker')?.addEventListener('click', () => assignWorkerTo('mine'));
  document.getElementById('mine-remove-worker')?.addEventListener('click', () => removeWorkerFrom('mine'));
  
function updateDisplay() {
  updateResourceUI();
  updateVillagerUI();
  updateWorkerUI();
  updateWorkerButtons();
  updateGuardsUI(); 
  updateGuardUI();   
}

  // 12) RESOURCE TICK (simple + predictable)

  setInterval(() => {
    // Gathering
    resources.wood += villagers.gathering * 1;
    resources.stone += villagers.gathering * 1;
    resources.food += villagers.gathering * 1;

    // Working (per building type)
    Object.keys(workersAssigned).forEach((type) => {
      const count = workersAssigned[type];
      if (count <= 0) return;

      const prod = BUILDINGS[type].productionPerWorker;
      Object.keys(prod).forEach((res) => {
        resources[res] += prod[res] * count;
      });
    });

    updateDisplay();
  }, 3000);

  // 13) INIT
  loadSprites();
  updateDisplay();
  drawAll();
});
``
