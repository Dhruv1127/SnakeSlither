// Enhanced Snake Game Logic
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameMode = 'classic';
        this.score = 0;
        this.gameTime = 0;
        this.timeLeft = 60; // For time attack mode
        
        // Game settings
        this.settings = gameStorage.getSettings();
        this.gridSize = gameStorage.getGridSizeValue(this.settings.gridSize);
        this.gameSpeed = gameStorage.getSpeedValue(this.settings.speed);
        
        // Canvas sizing
        this.canvasSize = 400; // Base size
        this.resizeCanvas();
        
        // Game objects
        this.snake = [];
        this.food = null;
        this.obstacles = [];
        this.direction = { dx: 0, dy: 0 };
        this.nextDirection = { dx: 0, dy: 0 };
        
        // Timing
        this.lastRenderTime = 0;
        this.lastMoveTime = 0;
        this.gameStartTime = 0;
        this.gameTimer = null;
        
        // Visual effects
        this.particles = new ParticleSystem(this.canvas, this.ctx);
        
        // Input handling
        this.setupInputHandlers();
        
        // Animation frame
        this.animationId = null;
        
        console.log('Snake game initialized');
    }

    resizeCanvas() {
        // Calculate canvas size based on grid setting
        const baseSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 600);
        this.canvasSize = Math.floor(baseSize / this.gridSize) * this.gridSize;
        
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        this.gridCount = this.canvasSize / this.gridSize;
        
        console.log(`Canvas resized: ${this.canvasSize}x${this.canvasSize}, Grid: ${this.gridCount}x${this.gridCount}`);
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyPress(e) {
        if (!this.isRunning || this.isPaused) return;
        
        const key = e.code;
        const settings = this.settings;
        
        // Check control scheme
        let validKeys = [];
        if (settings.controls === 'arrows' || settings.controls === 'both') {
            validKeys.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight');
        }
        if (settings.controls === 'wasd' || settings.controls === 'both') {
            validKeys.push('KeyW', 'KeyS', 'KeyA', 'KeyD');
        }
        
        if (!validKeys.includes(key)) return;
        
        let newDirection = { ...this.direction };
        
        switch(key) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.dy !== 1) newDirection = { dx: 0, dy: -1 };
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.dy !== -1) newDirection = { dx: 0, dy: 1 };
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.dx !== 1) newDirection = { dx: -1, dy: 0 };
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.dx !== -1) newDirection = { dx: 1, dy: 0 };
                break;
        }
        
        this.nextDirection = newDirection;
        e.preventDefault();
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (!this.isRunning || this.isPaused) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        const deltaX = touchX - centerX;
        const deltaY = touchY - centerY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && this.direction.dx !== -1) {
                this.nextDirection = { dx: 1, dy: 0 };
            } else if (deltaX < 0 && this.direction.dx !== 1) {
                this.nextDirection = { dx: -1, dy: 0 };
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && this.direction.dy !== -1) {
                this.nextDirection = { dx: 0, dy: 1 };
            } else if (deltaY < 0 && this.direction.dy !== 1) {
                this.nextDirection = { dx: 0, dy: -1 };
            }
        }
    }

    setDirection(dx, dy) {
        // External direction setting (for mobile UI)
        if ((dx === 1 && this.direction.dx !== -1) ||
            (dx === -1 && this.direction.dx !== 1) ||
            (dy === 1 && this.direction.dy !== -1) ||
            (dy === -1 && this.direction.dy !== 1)) {
            this.nextDirection = { dx, dy };
        }
    }

    start(gameMode = 'classic') {
        this.gameMode = gameMode;
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.gameTime = 0;
        this.gameStartTime = Date.now();
        
        // Initialize game based on mode
        this.initializeGame();
        
        // Start game timer for time attack mode
        if (gameMode === 'timeattack') {
            this.timeLeft = 60;
            this.gameTimer = setInterval(() => {
                this.timeLeft--;
                gameUI.updateTimer(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }, 1000);
        }
        
        // Start game loop
        this.gameLoop();
        
        // Start background music
        gameAudio.playBackgroundMusic();
        
        console.log(`Game started in ${gameMode} mode`);
    }

    initializeGame() {
        // Reset canvas size based on current settings
        this.resizeCanvas();
        
        // Initialize snake in center
        const centerX = Math.floor(this.gridCount / 2);
        const centerY = Math.floor(this.gridCount / 2);
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        this.direction = { dx: 1, dy: 0 };
        this.nextDirection = { dx: 1, dy: 0 };
        
        // Generate initial food
        this.generateFood();
        
        // Generate obstacles for obstacle mode
        if (this.gameMode === 'obstacle') {
            this.generateObstacles();
        }
        
        // Clear particles
        this.particles.clear();
        
        // Update UI
        gameUI.updateScore(this.score);
    }

    generateFood() {
        let validPositions = [];
        
        // Find all valid positions (not occupied by snake or obstacles)
        for (let x = 0; x < this.gridCount; x++) {
            for (let y = 0; y < this.gridCount; y++) {
                let isValid = true;
                
                // Check snake collision
                for (let segment of this.snake) {
                    if (segment.x === x && segment.y === y) {
                        isValid = false;
                        break;
                    }
                }
                
                // Check obstacle collision
                if (isValid) {
                    for (let obstacle of this.obstacles) {
                        if (obstacle.x === x && obstacle.y === y) {
                            isValid = false;
                            break;
                        }
                    }
                }
                
                if (isValid) {
                    validPositions.push({ x, y });
                }
            }
        }
        
        if (validPositions.length > 0) {
            this.food = validPositions[Math.floor(Math.random() * validPositions.length)];
        } else {
            // No valid positions - player wins!
            this.gameOver(true);
        }
    }

    generateObstacles() {
        this.obstacles = [];
        const obstacleCount = Math.floor(this.gridCount * 0.1); // 10% of grid
        
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let attempts = 0;
            
            do {
                obstacle = {
                    x: Math.floor(Math.random() * this.gridCount),
                    y: Math.floor(Math.random() * this.gridCount)
                };
                attempts++;
            } while (this.isPositionOccupied(obstacle.x, obstacle.y) && attempts < 100);
            
            if (attempts < 100) {
                this.obstacles.push(obstacle);
            }
        }
    }

    isPositionOccupied(x, y) {
        // Check snake
        for (let segment of this.snake) {
            if (segment.x === x && segment.y === y) return true;
        }
        
        // Check food
        if (this.food && this.food.x === x && this.food.y === y) return true;
        
        // Check existing obstacles
        for (let obstacle of this.obstacles) {
            if (obstacle.x === x && obstacle.y === y) return true;
        }
        
        return false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastRenderTime;
        
        // Update game state
        if (currentTime - this.lastMoveTime >= this.gameSpeed) {
            if (!this.isPaused) {
                this.update();
                this.lastMoveTime = currentTime;
            }
        }
        
        // Always render (for smooth animations)
        this.render();
        this.lastRenderTime = currentTime;
    }

    update() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Calculate new head position
        const head = { ...this.snake[0] };
        head.x += this.direction.dx;
        head.y += this.direction.dy;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridCount || 
            head.y < 0 || head.y >= this.gridCount) {
            this.particles.createWallHitEffect(
                head.x * this.gridSize + this.gridSize / 2,
                head.y * this.gridSize + this.gridSize / 2
            );
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        // Check obstacle collision
        for (let obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                this.gameOver();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        // Create trail particles
        if (this.snake.length > 1) {
            const neck = this.snake[1];
            this.particles.createSnakeTrail(
                neck.x * this.gridSize + this.gridSize / 2,
                neck.y * this.gridSize + this.gridSize / 2,
                this.getSnakeColor()
            );
        }
        
        // Update particles
        this.particles.update();
        
        // Update game time
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
        
        // Add obstacles periodically in obstacle mode
        if (this.gameMode === 'obstacle' && this.gameTime % 10 < 0.1 && Math.random() < 0.3) {
            this.addRandomObstacle();
        }
    }

    eatFood() {
        this.score += 10;
        gameUI.updateScore(this.score);
        
        // Create particle explosion
        this.particles.createFoodExplosion(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.getFoodColor()
        );
        
        // Play sound effect
        gameAudio.playEatSound();
        
        // Generate new food
        this.generateFood();
        
        // Increase speed slightly in classic mode
        if (this.gameMode === 'classic' && this.gameSpeed > 100) {
            this.gameSpeed = Math.max(100, this.gameSpeed - 2);
        }
    }

    addRandomObstacle() {
        let newObstacle;
        let attempts = 0;
        
        do {
            newObstacle = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
            attempts++;
        } while (this.isPositionOccupied(newObstacle.x, newObstacle.y) && attempts < 50);
        
        if (attempts < 50) {
            this.obstacles.push(newObstacle);
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render grid (optional visual enhancement)
        if (this.settings.theme === 'retro') {
            this.renderGrid();
        }
        
        // Render obstacles
        this.renderObstacles();
        
        // Render food
        this.renderFood();
        
        // Render snake
        this.renderSnake();
        
        // Render particles
        this.particles.render();
    }

    renderGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridCount; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridCount; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    renderSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Render head
                this.renderSnakeHead(x, y);
            } else {
                // Render body with gradient
                this.renderSnakeBody(x, y, index);
            }
        });
    }

    renderSnakeHead(x, y) {
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 1;
        
        // Head glow effect
        this.ctx.save();
        this.ctx.shadowColor = this.getSnakeColor();
        this.ctx.shadowBlur = 10;
        
        // Head circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.getSnakeHeadColor();
        this.ctx.fill();
        
        // Eyes
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#000000';
        const eyeSize = 2;
        const eyeOffset = radius * 0.3;
        
        // Calculate eye positions based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        if (this.direction.dx === 1) { // Right
            eyeX1 = centerX + eyeOffset;
            eyeY1 = centerY - eyeOffset;
            eyeX2 = centerX + eyeOffset;
            eyeY2 = centerY + eyeOffset;
        } else if (this.direction.dx === -1) { // Left
            eyeX1 = centerX - eyeOffset;
            eyeY1 = centerY - eyeOffset;
            eyeX2 = centerX - eyeOffset;
            eyeY2 = centerY + eyeOffset;
        } else if (this.direction.dy === -1) { // Up
            eyeX1 = centerX - eyeOffset;
            eyeY1 = centerY - eyeOffset;
            eyeX2 = centerX + eyeOffset;
            eyeY2 = centerY - eyeOffset;
        } else { // Down
            eyeX1 = centerX - eyeOffset;
            eyeY1 = centerY + eyeOffset;
            eyeX2 = centerX + eyeOffset;
            eyeY2 = centerY + eyeOffset;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderSnakeBody(x, y, index) {
        const size = this.gridSize - 2;
        const alpha = 1 - (index / this.snake.length) * 0.3; // Fade towards tail
        
        // Create gradient for body segment
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        const baseColor = this.getSnakeColor();
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, this.darkenColor(baseColor, 20));
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 1, y + 1, size, size);
        
        // Border
        this.ctx.strokeStyle = this.darkenColor(baseColor, 40);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 1, y + 1, size, size);
        
        this.ctx.restore();
    }

    renderFood() {
        if (!this.food) return;
        
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        // Food glow effect
        this.ctx.save();
        this.ctx.shadowColor = this.getFoodColor();
        this.ctx.shadowBlur = 15;
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1;
        const currentRadius = radius * pulse;
        
        // Food circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.getFoodColor();
        this.ctx.fill();
        
        // Inner highlight
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.lightenColor(this.getFoodColor(), 40);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Create sparkle particles
        this.particles.createFoodSparkle(centerX, centerY, this.gridSize);
    }

    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * this.gridSize;
            const y = obstacle.y * this.gridSize;
            const size = this.gridSize - 1;
            
            this.ctx.fillStyle = this.getObstacleColor();
            this.ctx.fillRect(x, y, size, size);
            
            // Border
            this.ctx.strokeStyle = this.darkenColor(this.getObstacleColor(), 30);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, size, size);
        });
    }

    // Color management based on theme
    getBackgroundColor() {
        const themes = {
            dark: '#0a0a0a',
            neon: '#000011',
            retro: '#2d1810'
        };
        return themes[this.settings.theme] || themes.dark;
    }

    getSnakeColor() {
        const themes = {
            dark: '#4CAF50',
            neon: '#ff00ff',
            retro: '#ff6b35'
        };
        return themes[this.settings.theme] || themes.dark;
    }

    getSnakeHeadColor() {
        const themes = {
            dark: '#66BB6A',
            neon: '#ff44ff',
            retro: '#ff8c42'
        };
        return themes[this.settings.theme] || themes.dark;
    }

    getFoodColor() {
        const themes = {
            dark: '#FF5252',
            neon: '#ffff00',
            retro: '#f7931e'
        };
        return themes[this.settings.theme] || themes.dark;
    }

    getObstacleColor() {
        const themes = {
            dark: '#666666',
            neon: '#00ffff',
            retro: '#8b4513'
        };
        return themes[this.settings.theme] || themes.dark;
    }

    // Utility color functions
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    gameOver(isWin = false) {
        this.isRunning = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Screen shake effect
        gameUI.screenShake();
        
        // Create game over particle explosion
        if (!isWin) {
            this.particles.createGameOverExplosion(this.snake);
            gameAudio.playGameOverSound();
        }
        
        // Prepare game data for UI
        const gameData = {
            score: this.score,
            snakeLength: this.snake.length,
            gameTime: this.gameTime,
            mode: this.gameMode,
            isWin: isWin
        };
        
        // Show game over screen after a delay
        setTimeout(() => {
            gameUI.showGameOver(gameData);
        }, isWin ? 500 : 1000);
        
        console.log('Game over:', gameData);
    }

    pause() {
        this.isPaused = true;
        gameAudio.pauseBackgroundMusic();
    }

    resume() {
        this.isPaused = false;
        gameAudio.resumeBackgroundMusic();
    }

    restart() {
        this.reset();
        this.start(this.gameMode);
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.particles.clear();
        gameAudio.stopBackgroundMusic();
    }

    updateSettings(newSettings) {
        this.settings = newSettings;
        
        // Update game speed and grid size
        this.gridSize = gameStorage.getGridSizeValue(newSettings.gridSize);
        this.gameSpeed = gameStorage.getSpeedValue(newSettings.speed);
        
        // Resize canvas if needed
        this.resizeCanvas();
        
        console.log('Game settings updated:', newSettings);
    }
}

// Create global game instance
let game = null;
