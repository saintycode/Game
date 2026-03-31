# 🌲 Isle of Simpleton - Village Building Game 🌊

A progressive web-based village building game where you manage resources, construct buildings, and grow your island settlement. Built with vanilla HTML5, CSS3, and JavaScript.

## 🎮 Game Overview

**Isle of Simpleton** is an idle/incremental building game that combines resource management with strategic building placement. Watch your village grow as buildings generate resources automatically, then use those resources to construct new buildings and expand your empire.

### Key Features

- **🏗️ Dynamic Building System** - 8 unique building types with different costs and production rates
- **📊 Real-Time Resource Production** - Watch resources accumulate automatically
- **🎨 Professional Dark Gaming UI** - Beautiful gradient backgrounds and smooth animations
- **💾 Persistent Save System** - Your progress is automatically saved to browser storage
- **🎯 Grid-Based Placement** - Strategic 10x10 grid with collision detection
- **⚡ Real-Time Feedback** - Instant visual feedback on all actions
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

## 🏢 Available Buildings

| Building | Cost | Production | Size | Notes |
|----------|------|-----------|------|-------|
| 🏠 Town Centre | Starting Building | 2 villages | 3x3 | Basic residential |
| 🏠 House | 10F, 20W, 5S | 2 villages | 1x2 | Basic residential |
| 🌾 Farm | 15F, 10W, 0S | 1F/sec | 2x3 | Food production |
| 📦 Warehouse | 30G, 40W, 20S | None | 2x2 | Storage facility |
| ⛏️ Mine | 20F, 30W, 50S | 10S/sec | 2x2 | Stone extraction |
| 🪵 Lumbermill | 40G, 50W, 30S | 8W/sec | 3x2 | Wood processing |
| 🏪 Market | 0G, 30F, 40W, 40S | -10F/sec, 10G/sec | 3x4 | Trade hub |
| 🗼 Barracks | 80G, 100F, 30W, 60S | None | 3x3 | Defense Training |
| 🗼 Guard Tower | 70G, 50F, 30W, 60S | None | 1x1 | Defense structure |
| ⛩️ Temple | 100G, ,200F, 50W, 80S | 15G/sec | 3x3 | Monument |

**Resource Legend:**
- **G** = Gold 🪙
- **F** = Food 🌾
- **W** = Wood 🪓
- **S** = Stone ⛏️

## 🚀 Getting Started

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/saintycode/game.git
   cd game
