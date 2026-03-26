// Game state
let resources = {
    wood: 10,
    stone: 10,
    food: 10
};

let buildings = {
    townCentre: 1,
    house: 1,
    farm: 0,
    mill: 0,
    market: 0,
    tower: 0
};

let villagers = {
    idle: 2,
    gathering: 0
};

let placedBuildings = [
    { type: 'townCentre', x: 355, y: 285 }
];

let placedHouses = [];

let placementMode = null;

// Building costs
const buildingCosts = {
    townCentre: { wood: 0, stone: 0, food: 0 },
    house: { wood: 10, stone: 5, food: 0 },
    farm: { wood: 15, stone: 7, food: 0 },
    mill: { wood: 20, stone: 10, food: 0 },
    market: { wood: 25, stone: 15, food: 0 },
    tower: { wood: 30, stone: 20, food: 0 }
};

// Resource generation rates per minute
const generationRates = {
    townCentre: { wood: 1, stone: 1, food: 1 }
};

// Gathering rates per villager per cycle
const gatherRates = {
    wood: 2,
    stone: 2,
    food: 1
};

// Get canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Draw Town Centre
function drawTownCentre(x, y) {
    // Calculate center position
    const centerX = x;
    const centerY = y;
    
    // Draw base (stone foundation)
    ctx.fillStyle = '#8B8680';
    ctx.fillRect(centerX - 60, centerY - 20, 120, 40);
    
    // Draw walls (brown wood)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 50, centerY - 50, 100, 50);
    
    // Draw roof (red)
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 50);
    ctx.lineTo(centerX, centerY - 80);
    ctx.lineTo(centerX + 50, centerY - 50);
    ctx.closePath();
    ctx.fill();
    
    // Draw door (dark brown)
    ctx.fillStyle = '#654321';
    ctx.fillRect(centerX - 15, centerY - 30, 30, 40);
    
    // Draw door handle (gold)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX + 10, centerY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw windows (light blue)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(centerX - 40, centerY - 35, 15, 15);
    ctx.fillRect(centerX + 25, centerY - 35, 15, 15);
    
    // Draw window panes (black lines)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 32.5, centerY - 35);
    ctx.lineTo(centerX - 32.5, centerY - 20);
    ctx.moveTo(centerX - 40, centerY - 27.5);
    ctx.lineTo(centerX - 40, centerY - 27.5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + 32.5, centerY - 35);
    ctx.lineTo(centerX + 32.5, centerY - 20);
    ctx.moveTo(centerX + 25, centerY - 27.5);
    ctx.lineTo(centerX + 40, centerY - 27.5);
    ctx.stroke();
    
    // Draw flag on roof (yellow flag)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(centerX - 3, centerY - 85, 20, 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + 17, centerY - 80);
    ctx.lineTo(centerX + 17, centerY - 55);
    ctx.stroke();
}

// Draw House
function drawHouse(x, y) {
    // Draw base
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(x - 30, y - 20, 60, 40);
    
    // Draw walls
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x - 25, y - 40, 50, 40);
    
    // Draw roof
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(x - 25, y - 40);
    ctx.lineTo(x, y - 55);
    ctx.lineTo(x + 25, y - 40);
    ctx.closePath();
    ctx.fill();
    
    // Draw door
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 8, y - 20, 16, 25);
    
    // Draw window
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(x - 18, y - 32, 12, 12);
}

// Draw Farm
function drawFarm(x, y) {
    // Draw fence posts
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 30, y - 5, 6, 35);
    ctx.fillRect(x + 24, y - 5, 6, 35);
    ctx.fillRect(x - 30, y + 25, 60, 5);
    
    // Draw crops
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(x - 18 + (i * 18), y + 5 + (j * 12), 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Draw Mill
function drawMill(x, y) {
    // Draw base
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x - 25, y - 10, 50, 35);
    
    // Draw walls
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x - 20, y - 35, 40, 35);
    
    // Draw roof
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 35);
    ctx.lineTo(x, y - 50);
    ctx.lineTo(x + 20, y - 35);
    ctx.closePath();
    ctx.fill();
    
    // Draw mill wheel
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 22, y, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 22, y);
        ctx.lineTo(x + 22 + Math.cos(i * Math.PI / 2) * 15, y + Math.sin(i * Math.PI / 2) * 15);
        ctx.stroke();
    }
}

// Draw Market
function drawMarket(x, y) {
    // Draw base
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(x - 35, y - 10, 70, 35);
    
    // Draw stalls
    ctx.fillStyle = '#B8860B';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x - 28 + (i * 30), y - 5, 20, 20);
    }
    
    // Draw roof (tent)
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(x - 35, y - 10);
    ctx.lineTo(x, y - 30);
    ctx.lineTo(x + 35, y - 10);
    ctx.closePath();
    ctx.fill();
}

// Draw Tower
function drawTower(x, y) {
    // Draw base
    ctx.fillStyle = '#696969';
    ctx.fillRect(x - 20, y - 10, 40, 35);
    
    // Draw walls
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(x - 15, y - 45, 30, 45);
    
    // Draw crenellations on top
    ctx.fillStyle = '#696969';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - 13 + (i * 10), y - 48, 4, 6);
    }
    
    // Draw flag
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(x + 13, y - 50, 15, 8);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 28, y - 46);
    ctx.lineTo(x + 28, y - 20);
    ctx.stroke();
}

// Draw all buildings
function drawAllBuildings() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw placed buildings
    placedBuildings.forEach(building => {
        if (building.type === 'townCentre') {
            drawTownCentre(building.x, building.y);
        }
    });
    
    // Draw placed houses
    placedHouses.forEach(house => {
        drawHouse(house.x, house.y);
    });
}

// Update display
function updateDisplay() {
    document.getElementById('wood').textContent = 'Wood: ' + Math.floor(resources.wood);
    document.getElementById('stone').textContent = 'Stone: ' + Math.floor(resources.stone);
    document.getElementById('food').textContent = 'Food: ' + Math.floor(resources.food);
    document.getElementById('villagers-idle').textContent = 'Idle: ' + villagers.idle;
    document.getElementById('villagers-gathering').textContent = 'Gathering: ' + villagers.gathering;
}

// Generate resources from buildings
function generateResources() {
    if (buildings.townCentre > 0) {
        resources.wood += generationRates.townCentre.wood * buildings.townCentre;
        resources.stone += generationRates.townCentre.stone * buildings.townCentre;
        resources.food += generationRates.townCentre.food * buildings.townCentre;
    }
    
    // Villagers gather resources
    if (villagers.gathering > 0) {
        resources.wood += gatherRates.wood * villagers.gathering;
        resources.stone += gatherRates.stone * villagers.gathering;
        resources.food += gatherRates.food * villagers.gathering;
    }
    
    updateDisplay();
}

// Resource generation every 30 seconds
setInterval(generateResources, 30000);

// Canvas click event for building placement
canvas.addEventListener('click', (event) => {
    if (placementMode) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is within canvas bounds
        if (x > 30 && x < canvas.width - 30 && y > 50 && y < canvas.height - 50) {
            if (placementMode === 'house') {
                placedHouses.push({ type: 'house', x: x, y: y });
                buildings.house += 1;
                document.getElementById('house-count').textContent = 'Built: ' + buildings.house;
            }
            placementMode = null;
            document.getElementById('build-house').textContent = 'Build';
            document.getElementById('build-house').style.backgroundColor = '';
            drawAllBuildings();
        }
    }
});

// Build House - Start placement mode
document.getElementById('build-house')?.addEventListener('click', () => {
    const cost = buildingCosts.house;
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.house -= 1;
        placementMode = 'house';
        document.getElementById('build-house').textContent = 'Click on canvas to place';
        document.getElementById('build-house').style.backgroundColor = '#4CAF50';
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Send villagers to gather
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

// Recall villagers
document.getElementById('recall-villagers')?.addEventListener('click', () => {
    if (villagers.gathering > 0) {
        villagers.gathering -= 1;
        villagers.idle += 1;
        updateDisplay();
        alert('1 villager recalled!');
    } else {
        alert('No villagers gathering!');
    }
});

// Build Farm
document.getElementById('build-farm')?.addEventListener('click', () => {
    const cost = buildingCosts.farm;
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.farm += 1;
        document.getElementById('farm-count').textContent = 'Built: ' + buildings.farm;
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Build Mill
document.getElementById('build-mill')?.addEventListener('click', () => {
    const cost = buildingCosts.mill;
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.mill += 1;
        document.getElementById('mill-count').textContent = 'Built: ' + buildings.mill;
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Build Market
document.getElementById('build-market')?.addEventListener('click', () => {
    const cost = buildingCosts.market;
    if (buildings.market > 0) {
        alert('You already have a market! A village can only have one market.');
        return;
    }
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.market += 1;
        document.getElementById('market-count').textContent = 'Built: ' + buildings.market;
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Build Tower
document.getElementById('build-tower')?.addEventListener('click', () => {
    const cost = buildingCosts.tower;
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.tower += 1;
        document.getElementById('tower-count').textContent = 'Built: ' + buildings.tower;
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Initialize
updateDisplay();
drawAllBuildings();
