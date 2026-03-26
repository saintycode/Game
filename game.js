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

// Building costs
const buildingCosts = {
    townCentre: { wood: 0, stone: 0, food: 0 },
    house: { wood: 10, stone: 5, food: 10 },
    farm: { wood: 15, stone: 7, food: 0 },
    mill: { wood: 20, stone: 10, food: 20 },
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

// Initialize
updateDisplay();
