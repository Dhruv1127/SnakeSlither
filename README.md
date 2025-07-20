# Snake Viper - Enhanced Dragon Ball Z Snake Game

## Overview
A fully standalone HTML/CSS/JavaScript Snake game featuring Dragon Ball Z characters, special abilities, and AI opponents. This game runs completely in the browser without any server requirements.

## Features

### Core Gameplay
- **Son Goku** (player) vs **Vegeta** (AI opponent)
- Smooth directional movement with wave mechanics
- Enhanced growth system with multiple segments per food
- Competitive scoring - race to win against AI

### Special Abilities
- **Speed Boost** (Space key): 2.5x speed multiplier with golden Super Saiyan glow
- **Power Ball** (Shift key): Launch energy projectiles with trails and collision
- **AI Counter-Abilities**: Vegeta uses strategic power balls and aggressive mode

### Visual Effects
- Start animation with glowing laser saber and controller sequence
- Particle effects for all interactions
- Wave motion mechanics for snake segments
- Multiple themes (Dark, Neon, Retro)
- Mobile-responsive touch controls

### Audio System
- Dragon Ball Z background music
- Sound effects for all abilities and interactions
- Volume controls with mute functionality

## File Structure

```
├── index.html          # Main game file (standalone)
├── js/                 # JavaScript modules
│   ├── game.js         # Core game logic
│   ├── ai-snake.js     # AI opponent system
│   ├── special-abilities.js # Special powers
│   ├── start-animation.js   # Opening sequence
│   ├── particles.js    # Visual effects
│   ├── audio.js        # Sound system
│   ├── ui.js           # User interface
│   ├── storage.js      # Local storage
│   ├── enhanced-features.js # Additional features
│   └── main.js         # Main initialization
├── sounds/             # Audio files
│   ├── background.mp3  # Game music
│   ├── hit.mp3         # Impact sounds
│   └── success.mp3     # Success sounds
└── README.md           # This file
```

## How to Run

### Option 1: Simple File Opening
1. Download all files maintaining the directory structure
2. Open `index.html` in any modern web browser
3. The game will start automatically with the cinematic opening

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

### Option 3: Online Hosting
Upload all files to any web hosting service maintaining the folder structure.

## Controls

### Desktop
- **Arrow Keys / WASD**: Movement direction
- **Space**: Goku's Speed Boost ability
- **Shift**: Goku's Power Ball attack
- **P / Escape**: Pause game
- **Mouse**: Alternative directional control

### Mobile
- Touch the direction pad for movement
- Touch and hold for special abilities
- Responsive design adapts to screen size

## Game Modes

1. **Classic**: Infinite play focusing on high scores
2. **Time Attack**: Score maximum points within time limit
3. **Obstacle Mode**: Navigate through barriers and challenges

## Technical Features

- Pure HTML5 Canvas rendering
- Local storage for settings and high scores
- Responsive design for all screen sizes
- Offline functionality (no internet required)
- Cross-browser compatibility
- Touch and keyboard input support

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

This game was originally built with React/Node.js and converted to pure HTML/CSS/JavaScript for maximum compatibility and standalone operation.

### Key Classes
- `SnakeGame`: Main game engine
- `AISnake`: Intelligent opponent
- `SpecialAbilities`: Power system
- `ParticleSystem`: Visual effects
- `GameAudio`: Sound management
- `GameUI`: Interface controls

## License

This project is for educational and entertainment purposes. Dragon Ball Z characters and themes are property of their respective owners.

---

**Enjoy playing as Son Goku in this enhanced Snake experience!** 🐍⚡