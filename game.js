// Game state
let resources = {
    wood: 100,
    stone: 50,
    food: 30
};

let buildings = {
    house: 0,
    farm: 0,
    mill: 0,
    market: 0,
    tower: 0
};

// Building costs
const buildingCosts = {
    house: { wood: 10, stone: 5 },
    farm: { wood: 15, stone: 7 },
    mill: { wood: 20, stone: 10 },
    market: { wood: 25, stone: 15 },
    tower: { wood: 30, stone: 20 }
};

// Gathering rates
const gatherRates = {
    wood: 5,
    stone: 3,
    food: 4
};

// Update display
function updateDisplay() {
    document.getElementById('wood').textContent = 'Wood: ' + resources.wood;
    document.getElementById('stone').textContent = 'Stone: ' + resources.stone;
    document.getElementById('food').textContent = 'Food: ' + resources.food;
}

// Gather resources
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