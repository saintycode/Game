# 🌲 Isle of Simpleton – Village Building Game 🌊

A progressive web‑based village building and management game where you gather resources, construct buildings, assign workers, and grow an island settlement over time.

Built with **vanilla HTML5, CSS3, and JavaScript** — no frameworks, no dependencies.

---

## 🎮 Game Overview

**Isle of Simpleton** is an idle / incremental village builder focused on **clear systems and player choice**.

Players manage villagers, assign them to specific buildings, and balance production to expand their settlement. Buildings unlock new capabilities, while workers determine how efficiently resources are produced.

The game is designed to grow gradually, with additional buildings and mechanics introduced over time.

---

## 🛠️ Tech Stack

- **HTML5** – Structure  
- **CSS3** – Styling & layout  
- **JavaScript (ES6)** – Game logic  
- **Canvas API** – Map rendering  

---

## ✨ Key Features

- **🏗️ Dynamic Building System**  
  Grid‑based placement with collision detection and ghost previews.

- **👥 Villager Management**  
  Villagers exist in clear states: Idle, Gathering, Working, and Training.

- **⚙️ Worker‑Driven Production**  
  Production buildings use worker slots — each worker contributes to output.

- **🎛️ Building Cards UI**  
  Workers are assigned directly from building cards using + / − controls.

- **🎨 Polished Dark Gaming UI**  
  Gradient backgrounds, animations, and consistent card layout.

- **📱 Responsive Design**  
  Works across desktop, tablet, and mobile screens.

---

## 🏢 Available Buildings

| Building | Cost | Production | Size | Notes |
|----------|------|------------|------|-------|
| 🏠 **Town Centre** | Starting Building | +2 Villagers | 3x3 | Core settlement building |
| 🏠 **House** | 10F, 20W, 5S | +2 Villagers | 1x2 | Increases population |
| 🌾 **Farm** | 15F, 10W, 0S | 1F / sec (per worker) | 2x3 | Food production |
| 📦 **Warehouse** | 30G, 40W, 20S | None | 2x2 | Storage facility *(planned)* |
| ⛏️ **Mine** | 20F, 30W, 50S | 10S / sec | 2x2 | Stone extraction *(planned)* |
| 🪵 **Lumbermill** | 40G, 50W, 30S | 8W / sec | 3x2 | Wood processing *(planned)* |
| 🏪 **Market** | 0G, 30F, 40W, 40S | −10F / sec, +10G / sec | 3x4 | Trade hub |
| 🗼 **Barracks** | 80G, 100F, 30W, 60S | None | 3x3 | Training & defence *(planned)* |
| 🗼 **Guard Tower** | 70G, 50F, 30W, 60S | None | 1x1 | Defensive structure |
| ⛩️ **Temple** | 100G, 200F, 50W, 80S | 15G / sec | 3x3 | Monument *(planned)* |

---

### 📊 Resource Legend

- **G** = Gold 🪙  
- **F** = Food 🌾  
- **W** = Wood 🪵  
- **S** = Stone ⛏️  

---

## 🧑‍🌾 Villager States

| State | Description |
|------|-------------|
| Idle | Available for assignment |
| Gathering | Producing basic resources |
| Working | Assigned to a specific building |
| Training | Reserved for future mechanics |

Villagers are assigned **explicitly per building**, giving players full control over production priorities.

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saintycode/game.git
   cd game
