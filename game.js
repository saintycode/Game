// Game state
let resources = {
    wood: 10,
    stone: 10,
    food: 10
};

let buildings = {
    townCentre: 1,
    house: 0,
    farm: 0,
    mill: 0,
    market: 0,
    tower: 0
};

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

// Gathering rates (for future manual gathering)
const gatherRates = {
    wood: 5,
    stone: 3,
    food: 4
};

// Get canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Draw Town Centre
function drawTownCentre() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate center position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
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
    ctx.lineTo(centerX - 25, centerY - 27.5);
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
    
    // Draw label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Town Centre', centerX, centerY + 70);
}

// Update display
function updateDisplay() {
    document.getElementById('wood').textContent = 'Wood: ' + Math.floor(resources.wood);
    document.getElementById('stone').textContent = 'Stone: ' + Math.floor(resources.stone);
    document.getElementById('food').textContent = 'Food: ' + Math.floor(resources.food);
}

// Generate resources from buildings
function generateResources() {
    if (buildings.townCentre > 0) {
        resources.wood += generationRates.townCentre.wood * buildings.townCentre;
        resources.stone += generationRates.townCentre.stone * buildings.townCentre;
        resources.food += generationRates.townCentre.food * buildings.townCentre;
        updateDisplay();
    }
}

// Resource generation every 60 seconds (1 minute)
setInterval(generateResources, 60000);

// Gather resources (manual gathering for testing)
document.getElementById('gather-wood')?.addEventListener('click', () => {
    resources.wood += gatherRates.wood;
    updateDisplay();
});

document.getElementById('gather-stone')?.addEventListener('click', () => {
    resources.stone += gatherRates.stone;
    updateDisplay();
});

document.getElementById('gather-food')?.addEventListener('click', () => {
    resources.food += gatherRates.food;
    updateDisplay();
});

// Build House
document.getElementById('build-house')?.addEventListener('click', () => {
    const cost = buildingCosts.house;
    if (resources.wood >= cost.wood && resources.stone >= cost.stone) {
        resources.wood -= cost.wood;
        resources.stone -= cost.stone;
        buildings.house += 1;
        document.getElementById('house-count').textContent = 'Built: ' + buildings.house;
        updateDisplay();
    } else {
        alert('Not enough resources! Need ' + cost.wood + ' Wood and ' + cost.stone + ' Stone.');
    }
});

// Update house count on page load
document.getElementById('house-count').textContent = 'Built: ' + buildings.house;

// Initialize
updateDisplay();
drawTownCentre();
