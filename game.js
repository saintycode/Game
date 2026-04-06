
document.addEventListener('DOMContentLoaded', () => {
  // 1) State
  const resLoose = { wood: 10, stone: 10, food: 10, coin: 0, metal: 0 };   // usable now
  const resStorable = { wood: 0, stone: 0, food: 0, coin: 0, metal: 0 };   // worker-made, not yet stored
  const resStored = { wood: 0, stone: 0, food: 0, coin: 0, metal: 0 };     // warehouse protected

  const buildings = {
    townCentre: 1,
    house: 0,
    farm: 0,
    logging: 0,
    market: 0,
    mine: 0,
    metalMine: 0,
    warehouse: 0,
    tower: 0,
    barracks: 0,
    archery: 0
  };

  const villagers = {
    idle: 2,
    gathering: 0,
    working: 0,
    training: 0,
    guards: 0,
    soldiers: 0,
    archers: 0
  };

  const workersAssigned = {
    farm: 0,
    logging: 0,
    market: 0,
    mine: 0,
    metalMine: 0
  };

  // 2) Canvas + grid
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const GRID = 20;
  const snap = (v) => Math.round(v / GRID) * GRID;

  // 3) Building config (add/edit here)
  const BUILDINGS = {
    townCentre: {
      label: 'Town Centre',
      cost: { wood: 0, stone: 0, food: 0, coin: 0, metal: 0 },
      size: { w: 120, h: 80 },
      sprite: 'images/town-centre.png',
      workerSlots: 0,
      productionPerWorker: {},
      requires: [],
      onBuild: () => {}
    },

    house: {
      label: 'House',
      cost: { wood: 10, stone: 5, food: 0, coin: 0, metal: 0 },
      size: { w: 70, h: 70 },
      sprite: 'images/house.png',
      workerSlots: 0,
      productionPerWorker: {},
      requires: [],
      onBuild: () => { villagers.idle += 2; }
    },

    farm: {
      label: 'Farm',
      cost: { wood: 15, stone: 7, food: 0, coin: 0, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/farm.png',
      workerSlots: 2,
      productionPerWorker: { food: 1 },
      requires: [],
      onBuild: () => {}
    },

    logging: {
      label: 'Logging',
      cost: { wood: 20, stone: 10, food: 0, coin: 0, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/logging.png',
      workerSlots: 2,
      productionPerWorker: { wood: 1 },
      requires: [],
      onBuild: () => {}
    },

    market: {
      label: 'Market',
      cost: { wood: 25, stone: 15, food: 0, coin: 0, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/market.png',
      workerSlots: 2,
      productionPerWorker: { coin: 1 },
      requires: [],
      unique: true,
      onBuild: () => {}
    },

    // Mine (stone) – gated behind market + 5 coin
    mine: {
      label: 'Mine',
      cost: { wood: 20, stone: 12, food: 0, coin: 5, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/mine.png',
      workerSlots: 2,
      productionPerWorker: { stone: 1 },
      requires: [{ type: 'market', min: 1 }],
      onBuild: () => {}
    },

    // Metal Mine – also gated behind market (no gathering metal)
    metalMine: {
      label: 'Metal Mine',
      cost: { wood: 30, stone: 20, food: 0, coin: 10, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/metal-mine.png', // add later (placeholder draws)
      workerSlots: 2,
      productionPerWorker: { metal: 1 },
      requires: [{ type: 'market', min: 1 }],
      onBuild: () => {}
    },

    // Warehouse – stores ONLY worker-produced storable resources
    warehouse: {
      label: 'Warehouse',
      cost: { wood: 40, stone: 20, food: 0, coin: 0, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/warehouse.png', // add later (placeholder draws)
      workerSlots: 0,
      productionPerWorker: {},
      requires: [],
      capacity: { wood: 1000, stone: 1000, food: 1000, metal: 1000, coin: 100 },
      onBuild: () => {}
    },

    // Guard Tower – training + guards
    tower: {
      label: 'Guard Tower',
      cost: { wood: 30, stone: 20, food: 0, coin: 10, metal: 0 },
      size: { w: 70, h: 90 },
      sprite: 'images/guard-tower.png',
      workerSlots: 0,
      productionPerWorker: {},
      requires: [],
      trainingSlots: 2,
      guardSlots: 2,
      trainingTimeMs: 5000,
      onBuild: () => {}
    },

    // Archery Range – cheaper military training
    archery: {
      label: 'Archery Range',
      cost: { wood: 100, stone: 200, food: 0, coin: 50, metal: 0 },
      size: { w: 90, h: 70 },
      sprite: 'images/archery.png', // add later
      workerSlots: 0,
      productionPerWorker: {},
      requires: [{ type: 'market', min: 1 }],
      trainingSlots: 2,
      trainingTimeMs: 7000,
      onBuild: () => {}
    },

    // Barracks – heavy military training (needs metal)
    barracks: {
      label: 'Barracks',
      cost: { wood: 100, stone: 300, food: 0, coin: 150, metal: 300 },
      size: { w: 90, h: 70 },
      sprite: 'images/barracks.png', // add later
      workerSlots: 0,
      productionPerWorker: {},
      requires: [{ type: 'metalMine', min: 1 }, { type: 'market', min: 1 }],
      trainingSlots: 2,
      trainingTimeMs: 9000,
      onBuild: () => {}
    }
  };

  // 4) DOM id maps (optional, safe)
  const COUNT_ID = {
    house: 'house-count',
    farm: 'farm-count',
    logging: 'logging-count',
    market: 'market-count',
    mine: 'mine-count',
    metalMine: 'metal-mine-count',
    warehouse: 'warehouse-count',
    tower: 'tower-count',
    archery: 'archery-count',
    barracks: 'barracks-count'
  };

  const WORKER_UI = {
    farm: 'farm-workers',
    logging: 'logging-workers',
    market: 'market-workers',
    mine: 'mine-workers',
    metalMine: 'metal-mine-workers'
  };

  // 5) Sprites
  const sprites = {};
  const loadSprites = () => {
    Object.keys(BUILDINGS).forEach((type) => {
      const img = new Image();
      img.onload = () => drawAll();
      img.src = BUILDINGS[type].sprite;
      sprites[type] = img;
    });
  };

  // 6) World + placement
  const placed = [{ type: 'townCentre', x: 400, y: 400 }];
  const placeMode = { active: false, type: null };
  const ghost = { x: 0, y: 0, visible: false, valid: false };

  const footprint = (type) => BUILDINGS[type].size;

  const inBounds = (x, y, type) => {
    const { w, h } = footprint(type);
    return x - w / 2 >= 0 && x + w / 2 <= canvas.width && y - h / 2 >= 0 && y + h / 2 <= canvas.height;
  };

  const collides = (x, y, type) => {
    const a = footprint(type);
    return placed.some((b) => {
      const c = footprint(b.type);
      return (
        x - a.w / 2 < b.x + c.w / 2 &&
        x + a.w / 2 > b.x - c.w / 2 &&
        y - a.h / 2 < b.y + c.h / 2 &&
        y + a.h / 2 > b.y - c.h / 2
      );
    });
  };

  const canPlace = (x, y, type) => inBounds(x, y, type) && !collides(x, y, type);

  // 7) UI (safe updates)
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

  const updateResourcesUI = () => {
    setText('food', `🌾:${Math.floor(resLoose.food)}`);
    setText('wood', `🪵:${Math.floor(resLoose.wood)}`);
    setText('stone', `⛏️:${Math.floor(resLoose.stone)}`);
    setText('coin', `🪙:${Math.floor(resLoose.coin)}`);
    // Optional (only if you add these spans later):
    setText('metal', `🔩:${Math.floor(resLoose.metal)}`);
    setText('stored-wood', `Stored 🪵:${Math.floor(resStored.wood)}`);
    setText('stored-stone', `Stored ⛏️:${Math.floor(resStored.stone)}`);
    setText('stored-food', `Stored 🌾:${Math.floor(resStored.food)}`);
    setText('stored-coin', `Stored 🪙:${Math.floor(resStored.coin)}`);
    setText('stored-metal', `Stored 🔩:${Math.floor(resStored.metal)}`);
    setText('storable-wood', `Storable 🪵:${Math.floor(resStorable.wood)}`);
    setText('storable-stone', `Storable ⛏️:${Math.floor(resStorable.stone)}`);
    setText('storable-food', `Storable 🌾:${Math.floor(resStorable.food)}`);
    setText('storable-coin', `Storable 🪙:${Math.floor(resStorable.coin)}`);
    setText('storable-metal', `Storable 🔩:${Math.floor(resStorable.metal)}`);
  };

  const updateVillagersUI = () => {
    setText('villagers-idle', `Idle: ${villagers.idle}`);
    setText('villagers-gathering', `Gathering: ${villagers.gathering}`);
    setText('villagers-working', `Working: ${villagers.working}`);
    setText('villagers-training', `Training: ${villagers.training}`);
    setText('villagers-guards', `Guards: ${villagers.guards}`);
    setText('villagers-soldiers', `Soldiers: ${villagers.soldiers}`);
    setText('villagers-archers', `Archers: ${villagers.archers}`);
  };

  const updateWorkersUI = () => {
    Object.keys(WORKER_UI).forEach((type) => {
      const max = buildings[type] * (BUILDINGS[type].workerSlots ?? 0);
      setText(WORKER_UI[type], `${workersAssigned[type]} / ${max}`);
    });
  };

  const updateTowerGuardsUI = () => {
    const max = buildings.tower * (BUILDINGS.tower.guardSlots ?? 0);
    setText('tower-workers', `${villagers.guards} / ${max}`);
  };

  const updateAllUI = () => {
    updateResourcesUI();
    updateVillagersUI();
    updateWorkersUI();
    updateTowerGuardsUI();
  };

  // 8) Drawing
  const drawSprite = (type, x, y) => {
    const img = sprites[type];
    const { w, h } = footprint(type);
    if (!img || !img.complete) {
      ctx.fillStyle = '#666';
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      return;
    }
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  };

  const drawAll = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    placed.forEach((b) => drawSprite(b.type, b.x, b.y));

    if (placeMode.active && ghost.visible) {
      drawSprite(placeMode.type, ghost.x, ghost.y);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = ghost.valid ? '#3CB371' : '#FF3333';
      const { w, h } = footprint(placeMode.type);
      ctx.fillRect(ghost.x - w / 2, ghost.y - h / 2, w, h);
      ctx.restore();
    }
  };

  // 9) Build rules
  const hasCost = (cost) => Object.keys(cost).every((k) => (resLoose[k] ?? 0) >= cost[k]);
  const payCost = (cost) => Object.keys(cost).forEach((k) => { resLoose[k] -= cost[k]; });

  const meetsRequires = (type) => {
    const reqs = BUILDINGS[type].requires ?? [];
    return reqs.every((r) => (buildings[r.type] ?? 0) >= (r.min ?? 1));
  };

  const startPlacement = (type) => {
    const def = BUILDINGS[type];

    if (def.unique && buildings[type] > 0) {
      alert(`Only one ${def.label} allowed`);
      return;
    }

    if (!meetsRequires(type)) {
      alert(`Missing dependency for ${def.label}`);
      return;
    }

    if (!hasCost(def.cost)) {
      alert('Not enough resources');
      return;
    }

    placeMode.active = true;
    placeMode.type = type;
    ghost.visible = true;

    ghost.x = snap(canvas.width / 2);
    ghost.y = snap(canvas.height / 2);
    ghost.valid = canPlace(ghost.x, ghost.y, type);

    drawAll();
  };

  // 10) Input (placement)
  canvas.addEventListener('mousemove', (e) => {
    if (!placeMode.active) return;
    const r = canvas.getBoundingClientRect();
    ghost.x = snap(e.clientX - r.left);
    ghost.y = snap(e.clientY - r.top);
    ghost.valid = canPlace(ghost.x, ghost.y, placeMode.type);
    drawAll();
  });

  canvas.addEventListener('click', () => {
    if (!placeMode.active || !ghost.valid) return;

    const type = placeMode.type;
    const def = BUILDINGS[type];

    payCost(def.cost);
    placed.push({ type, x: ghost.x, y: ghost.y });
    buildings[type]++;

    def.onBuild?.();

    const id = COUNT_ID[type];
    if (id) setText(id, `Built: ${buildings[type]}`);

    placeMode.active = false;
    placeMode.type = null;
    ghost.visible = false;

    updateAllUI();
    drawAll();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!placeMode.active) return;
    placeMode.active = false;
    placeMode.type = null;
    ghost.visible = false;
    drawAll();
  });

  // 11) Workers (+/- generic)
  const assignWorkerTo = (type) => {
    const max = buildings[type] * (BUILDINGS[type].workerSlots ?? 0);
    if (villagers.idle <= 0) return alert('No idle villagers available');
    if (workersAssigned[type] >= max) return alert('No free work slots');

    villagers.idle--;
    villagers.working++;
    workersAssigned[type]++;
    updateAllUI();
  };

  const removeWorkerFrom = (type) => {
    if (workersAssigned[type] <= 0) return;
    workersAssigned[type]--;
    villagers.working--;
    villagers.idle++;
    updateAllUI();
  };

  // 12) Guards (+/-)
  const assignGuard = () => {
    const max = buildings.tower * (BUILDINGS.tower.guardSlots ?? 0);
    if (villagers.idle <= 0) return alert('No available villagers to assign');
    if (villagers.guards >= max) return alert('All guard slots are full');

    villagers.idle--;
    villagers.guards++;
    updateAllUI();
  };

  const removeGuard = () => {
    if (villagers.guards <= 0) return;
    villagers.guards--;
    villagers.idle++;
    updateAllUI();
  };

  // 13) Training (tower / barracks / archery)
  const trainingQueue = [];

  const startTraining = (buildingType, unitType) => {
    const count = buildings[buildingType] ?? 0;
    if (count <= 0) return alert(`You need a ${BUILDINGS[buildingType].label}`);

    const slots = (BUILDINGS[buildingType].trainingSlots ?? 0) * count;
    if (villagers.idle <= 0) return alert('No idle villagers available');
    if (villagers.training >= slots) return alert('All training slots are full');

    villagers.idle--;
    villagers.training++;
    updateAllUI();

    const ms = BUILDINGS[buildingType].trainingTimeMs ?? 5000;
    const t = setTimeout(() => {
      villagers.training--;
      // promote
      if (unitType === 'soldier') villagers.soldiers++;
      else if (unitType === 'archer') villagers.archers++;
      else villagers.idle++; // fallback
      updateAllUI();
    }, ms);

    trainingQueue.push(t);
  };

  // 14) Warehouse storage logic
  const applyWarehouseStorage = () => {
    const wCount = buildings.warehouse ?? 0;
    if (wCount <= 0) return;

    const cap = BUILDINGS.warehouse.capacity;
    const max = {
      wood: cap.wood * wCount,
      stone: cap.stone * wCount,
      food: cap.food * wCount,
      metal: cap.metal * wCount,
      coin: cap.coin * wCount
    };

    // move storable -> stored (only worker-made can move)
    Object.keys(resStorable).forEach((k) => {
      const room = Math.max(0, (max[k] ?? 0) - (resStored[k] ?? 0));
      if (room <= 0) return;
      const moved = Math.min(room, resStorable[k]);
      resStorable[k] -= moved;
      resStored[k] += moved;
    });
  };

  // 15) Tick (gathering + worker production)
  setInterval(() => {
    // 15.1 Gathering -> Loose only
    resLoose.wood += villagers.gathering * 1;
    resLoose.stone += villagers.gathering * 1;
    resLoose.food += villagers.gathering * 1;
    // NOTE: no gathering metal, by design

    // 15.2 Workers -> Storable only
    Object.keys(workersAssigned).forEach((type) => {
      const count = workersAssigned[type];
      if (count <= 0) return;
      const prod = BUILDINGS[type].productionPerWorker ?? {};
      Object.keys(prod).forEach((r) => {
        resStorable[r] += prod[r] * count;
      });
    });

    // 15.3 Warehouse converts Storable -> Stored up to capacity
    applyWarehouseStorage();

    updateAllUI();
  }, 3000);

  // 16) Wire existing buttons (safe if missing)
  // 16.1 Villagers gather
  document.getElementById('send-villagers')?.addEventListener('click', () => {
    if (villagers.idle <= 0) return alert('No idle villagers available!');
    villagers.idle--;
    villagers.gathering++;
    updateAllUI();
  });

  document.getElementById('recall-villagers')?.addEventListener('click', () => {
    if (villagers.gathering <= 0) return;
    villagers.gathering--;
    villagers.idle++;
    updateAllUI();
  });

  // 16.2 Build buttons (add HTML ids for new ones)
  document.getElementById('build-house')?.addEventListener('click', () => startPlacement('house'));
  document.getElementById('build-farm')?.addEventListener('click', () => startPlacement('farm'));
  document.getElementById('build-logging')?.addEventListener('click', () => startPlacement('logging'));
  document.getElementById('build-market')?.addEventListener('click', () => startPlacement('market'));
  document.getElementById('build-mine')?.addEventListener('click', () => startPlacement('mine'));
  document.getElementById('build-metal-mine')?.addEventListener('click', () => startPlacement('metalMine'));
  document.getElementById('build-warehouse')?.addEventListener('click', () => startPlacement('warehouse'));
  document.getElementById('build-tower')?.addEventListener('click', () => startPlacement('tower'));
  document.getElementById('build-archery')?.addEventListener('click', () => startPlacement('archery'));
  document.getElementById('build-barracks')?.addEventListener('click', () => startPlacement('barracks'));

  // 16.3 Worker buttons (farm/logging/market/mine/metalMine)
  ['farm', 'logging', 'market', 'mine', 'metalMine'].forEach((t) => {
    document.getElementById(`${t}-add-worker`)?.addEventListener('click', () => assignWorkerTo(t));
    document.getElementById(`${t}-remove-worker`)?.addEventListener('click', () => removeWorkerFrom(t));
  });

  // 16.4 Guard tower duty
  document.getElementById('tower-add-worker')?.addEventListener('click', assignGuard);
  document.getElementById('tower-remove-worker')?.addEventListener('click', removeGuard);

  // 16.5 Training buttons
  // (Tower trains “guards later”; barracks trains soldiers; archery trains archers)
  document.getElementById('send-villagers-training')?.addEventListener('click', () => startTraining('tower', 'idle'));
  document.getElementById('train-soldier')?.addEventListener('click', () => startTraining('barracks', 'soldier'));
  document.getElementById('train-archer')?.addEventListener('click', () => startTraining('archery', 'archer'));

  // 17) Init
  loadSprites();
  updateAllUI();
  drawAll();
});
