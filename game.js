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

const workerProduction = {
  farm: { food: 1 },
  logging: { wood: 1 },
  market: { coin: 1 }
};

// ---- placement state ----
let placementMode = {
  active: false,
  type: null
};

let ghost = {
  x: 0,
  y: 0,
  visible: false
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let placedBuildings = [{ type: 'townCentre', x: 400, y: 400 }];

// ---------- UI ----------
  
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

// ---------- Canvas Drawing buildings ----------
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

  // Draw ghost (preview)
  if (placementMode.active && ghost.visible) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(ghost.x - 25, ghost.y - 20, 50, 40);
    ctx.restore();
  }
}



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

//------- Build building ------
document.getElementById('build-house')?.addEventListener('click', () => {
  if (resources.wood < 10 || resources.stone < 5) {
    alert('Not enough resources');
    return;
  }

  placementMode.active = true;
  placementMode.type = 'house';
  ghost.visible = true;
});

canvas.addEventListener('mousemove', (e) => {
  if (!placementMode.active) return;

  const rect = canvas.getBoundingClientRect();
  ghost.x = e.clientX - rect.left;
  ghost.y = e.clientY - rect.top;

  drawAllBuildings();
});

canvas.addEventListener('click', () => {
  if (!placementMode.active) return;
  if (placementMode.type !== 'house') return;

  // ✅ Pay cost NOW
  resources.wood -= 10;
  resources.stone -= 5;

  // ✅ Place house
  placedBuildings.push({
    type: 'house',
    x: ghost.x,
    y: ghost.y
  });

  buildings.house++;
  villagers.idle += 2;

  // ✅ Update UI
  const houseCountEl = document.getElementById('house-count');
  if (houseCountEl) {
    houseCountEl.textContent = `Built: ${buildings.house}`;
  }

  // ✅ Exit placement mode
  placementMode.active = false;
  placementMode.type = null;
  ghost.visible = false;

  updateDisplay();
  drawAllBuildings();
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
