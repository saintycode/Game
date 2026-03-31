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

// ---------- Canvas ----------
function drawAllBuildings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placedBuildings.forEach(b => {
    if (b.type === 'townCentre') {
      ctx.fillStyle = '#8B8680';
      ctx.fillRect(b.x - 60, b.y - 20, 120, 40);
    }
  });
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

document.getElementById('build-house')?.addEventListener('click', () => {
  if (resources.wood < 10 || resources.stone < 5) return alert('Not enough resources');
  resources.wood -= 10;
  resources.stone -= 5;
  buildings.house++;
  villagers.idle += 2;
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
