// Enhanced Snake Viper Game Logic with Smooth Movement
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
        this.gameSpeed = 4; // Pixels per frame for smooth movement
        
        // Canvas sizing
        this.canvasSize = 400; // Base size
        this.resizeCanvas();
        
        // Snake properties for smooth movement with wave mechanics
        this.snake = [];
        this.snakeSize = 12; // Snake segment radius
        this.segmentSpacing = 16; // Distance between segments
        this.food = null;
        this.foodSize = 8;
        this.obstacles = [];
        this.waveAmplitude = 0; // Wave motion intensity
        this.waveFrequency = 0.1; // Wave motion speed
        this.growthQueue = 0; // Number of segments to grow
        
        // Smooth movement direction (angle in radians)
        this.direction = 0; // Current direction
        this.targetDirection = 0; // Target direction from input
        this.turnSpeed = 0.15; // How fast snake turns
        
        // Mouse/Touch input
        this.mousePos = { x: 0, y: 0 };
        this.isMouseControlling = false;
        this.targetPos = null;
        
        // Timing for smooth animation
        this.lastRenderTime = 0;
        this.gameStartTime = 0;
        this.gameTimer = null;
        
        // Visual effects
        this.particles = new ParticleSystem(this.canvas, this.ctx);
        
        // AI Enemy Snake (initialize after game setup)
        this.aiSnake = null;
        
        // Special Abilities System
        this.specialAbilities = null;
        
        // Input handling
        this.setupInputHandlers();
        
        // Animation frame
        this.animationId = null;
        
        // Player name
        this.playerName = "Son Goku";
        
        // Initialize special abilities after a brief delay
        setTimeout(() => {
            if (window.SpecialAbilities) {
                this.specialAbilities = new SpecialAbilities(this);
                console.log('Special abilities initialized');
            }
        }, 100);
        
        // Special Abilities System
        this.gokuAbilities = {
            speedBoost: {
                active: false,
                duration: 0,
                maxDuration: 120, // 2 seconds at 60fps
                multiplier: 2.5,
                cooldown: 0,
                maxCooldown: 300, // 5 seconds
                activations: 0
            },
            powerBall: {
                x: 0, y: 0,
                vx: 0, vy: 0,
                active: false,
                size: 8,
                energy: 100,
                cooldown: 0,
                maxCooldown: 180, // 3 seconds
                trail: []
            }
        };
        
        this.vegetaAbilities = {
            powerBall: {
                x: 0, y: 0,
                vx: 0, vy: 0,
                active: false,
                size: 8,
                energy: 100,
                cooldown: 0,
                maxCooldown: 180,
                trail: []
            },
            aggressiveMode: {
                active: false,
                duration: 0,
                maxDuration: 180, // 3 seconds
                speedMultiplier: 1.8,
                cooldown: 0,
                maxCooldown: 240 // 4 seconds
            }
        };
        
        console.log('Snake Viper game initialized with smooth movement and AI enemy');
    }

    resizeCanvas() {
        // Calculate canvas size for smooth movement (no grid constraint)
        const baseSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 600);
        this.canvasSize = baseSize;
        
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        console.log(`Canvas resized: ${this.canvasSize}x${this.canvasSize} (smooth movement)`);
    }

    setupInputHandlers() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyPress(e) {
        if (!this.isRunning || this.isPaused) return;
        
        const key = e.code;
        const settings = this.settings;
        
        // Special abilities
        if (key === 'Space' && this.specialAbilities) {
            this.specialAbilities.activateGokuSpeedBoost();
            return;
        }
        
        if ((key === 'ShiftLeft' || key === 'ShiftRight') && this.specialAbilities) {
            this.specialAbilities.launchGokuPowerBall();
            return;
        }
        
        // Check control scheme
        let validKeys = [];
        if (settings.controls === 'arrows' || settings.controls === 'both') {
            validKeys.push('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight');
        }
        if (settings.controls === 'wasd' || settings.controls === 'both') {
            validKeys.push('KeyW', 'KeyS', 'KeyA', 'KeyD');
        }
        
        if (!validKeys.includes(key)) return;
        
        // Convert to angle for smooth movement
        switch(key) {
            case 'ArrowUp':
            case 'KeyW':
                this.targetDirection = -Math.PI / 2; // Up
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.targetDirection = Math.PI / 2; // Down
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.targetDirection = Math.PI; // Left
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.targetDirection = 0; // Right
                break;
        }
        
        this.isMouseControlling = false;
        e.preventDefault();
        console.log('Key pressed:', key, 'Target direction:', this.targetDirection);
    }

    handleMouseMove(e) {
        if (!this.isRunning || this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
        
        if (this.isMouseControlling && this.snake.length > 0) {
            this.updateDirectionToMouse();
        }
    }

    handleMouseDown(e) {
        if (!this.isRunning || this.isPaused) return;
        this.isMouseControlling = true;
        this.updateDirectionToMouse();
        e.preventDefault();
    }

    handleMouseUp(e) {
        this.isMouseControlling = false;
    }

    updateDirectionToMouse() {
        if (this.snake.length === 0) return;
        
        const head = this.snake[0];
        const dx = this.mousePos.x - head.x;
        const dy = this.mousePos.y - head.y;
        
        this.targetDirection = Math.atan2(dy, dx);
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (!this.isRunning || this.isPaused) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
        
        this.isMouseControlling = true;
        this.updateDirectionToMouse();
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isRunning || this.isPaused || !this.isMouseControlling) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
        
        this.updateDirectionToMouse();
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isMouseControlling = false;
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

    start(gameMode = 'classic', level = 1) {
        this.gameMode = gameMode;
        this.gameLevel = level;
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.gameTime = 0;
        this.gameStartTime = Date.now();
        
        // Apply level-specific settings
        this.applyLevelSettings(gameMode, level);
        
        // Reset AI snake score
        if (this.aiSnake) {
            this.aiSnake.score = 0;
            if (gameUI && gameUI.updateVegetaScore) {
                gameUI.updateVegetaScore(0);
            }
        }
        
        // Initialize game based on mode
        this.initializeGame();
        
        // Start game timer for time attack mode
        if (gameMode === 'timeattack') {
            // Level affects time limit
            const timeLimits = { 1: 60, 2: 45, 3: 30 };
            this.timeLeft = timeLimits[level] || 60;
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
        
        console.log(`Game started in ${gameMode} mode, level ${level}`);
    }

    applyLevelSettings(gameMode, level) {
        // Apply level-specific settings for each game mode
        if (gameMode === 'classic') {
            const speedSettings = { 1: 2, 2: 3, 3: 4 };
            this.gameSpeed = speedSettings[level] || 2;
        } else if (gameMode === 'timeattack') {
            const speedSettings = { 1: 3, 2: 4, 3: 5 };
            this.gameSpeed = speedSettings[level] || 3;
        } else if (gameMode === 'obstacle') {
            const speedSettings = { 1: 2, 2: 2.5, 3: 3 };
            this.gameSpeed = speedSettings[level] || 2;
            
            // Number of obstacles based on level
            this.obstacleCount = level === 1 ? 3 : level === 2 ? 5 : 8;
        }
    }

    initializeGame() {
        // Reset canvas size based on current settings
        this.resizeCanvas();
        
        // Initialize snake in center with smooth positions
        const centerX = this.canvasSize / 2;
        const centerY = this.canvasSize / 2;
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - this.segmentSpacing, y: centerY },
            { x: centerX - this.segmentSpacing * 2, y: centerY }
        ];
        
        this.direction = 0; // Moving right
        this.targetDirection = 0;
        
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
        let attempts = 0;
        let food;
        
        do {
            food = {
                x: this.foodSize + Math.random() * (this.canvasSize - this.foodSize * 2),
                y: this.foodSize + Math.random() * (this.canvasSize - this.foodSize * 2)
            };
            attempts++;
        } while (this.isPositionOccupied(food.x, food.y, this.foodSize) && attempts < 100);
        
        if (attempts < 100) {
            this.food = food;
        } else {
            // No valid positions - player wins!
            this.gameOver(true);
        }
    }

    generateObstacles() {
        this.obstacles = [];
        const obstacleCount = this.obstacleCount || 3; // Use level-based count
        
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let attempts = 0;
            
            do {
                obstacle = {
                    x: 80 + Math.random() * (this.canvasSize - 160), // More space from edges
                    y: 80 + Math.random() * (this.canvasSize - 160),
                    size: 15 + Math.random() * 8
                };
                attempts++;
            } while (this.isPositionOccupied(obstacle.x, obstacle.y, obstacle.size) && attempts < 100);
            
            if (attempts < 100) {
                // Ensure obstacle is not too close to starting position
                const centerX = this.canvasSize / 2;
                const centerY = this.canvasSize / 2;
                const distanceFromCenter = Math.sqrt((obstacle.x - centerX) ** 2 + (obstacle.y - centerY) ** 2);
                
                if (distanceFromCenter > 100) { // Only add if far from center
                    this.obstacles.push(obstacle);
                }
            }
        }
        
        console.log('Generated obstacles:', this.obstacles.length);
    }

    isPositionOccupied(x, y, size) {
        // Check snake collision
        for (let segment of this.snake) {
            const distance = Math.sqrt((segment.x - x) ** 2 + (segment.y - y) ** 2);
            if (distance < this.snakeSize + size) return true;
        }
        
        // Check food collision
        if (this.food) {
            const distance = Math.sqrt((this.food.x - x) ** 2 + (this.food.y - y) ** 2);
            if (distance < this.foodSize + size) return true;
        }
        
        // Check obstacles collision
        for (let obstacle of this.obstacles) {
            const distance = Math.sqrt((obstacle.x - x) ** 2 + (obstacle.y - y) ** 2);
            if (distance < obstacle.size + size) return true;
        }
        
        return false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        
        // Calculate delta time for smooth movement
        const deltaTime = (currentTime - this.lastRenderTime) / 16.67; // Normalize to 60fps
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        // Always render for smooth animations
        this.render();
        this.lastRenderTime = currentTime;
    }

    update(deltaTime) {
        // Ensure valid deltaTime to prevent instant movement
        if (!isFinite(deltaTime) || deltaTime <= 0 || deltaTime > 2) {
            deltaTime = 1;
        }
        
        // Update special abilities
        if (this.specialAbilities) {
            this.specialAbilities.updateGokuAbilities(deltaTime);
            this.specialAbilities.updateVegetaAbilities(deltaTime);
        }
        
        // Smooth direction interpolation
        this.smoothTurn(deltaTime);
        
        // Move snake head with speed boost consideration
        const head = this.snake[0];
        let currentSpeed = this.gameSpeed;
        
        // Apply speed boosts from special abilities
        if (this.specialAbilities) {
            currentSpeed *= this.specialAbilities.getSpeedMultiplier();
        }
        
        const moveDistance = currentSpeed * deltaTime * 0.5; // Slower movement
        
        const newHead = {
            x: head.x + Math.cos(this.direction) * moveDistance,
            y: head.y + Math.sin(this.direction) * moveDistance
        };
        
        // Check wall collision - add some debug logging
        if (newHead.x < this.snakeSize || newHead.x > this.canvasSize - this.snakeSize || 
            newHead.y < this.snakeSize || newHead.y > this.canvasSize - this.snakeSize) {
            console.log('Wall collision:', {
                newHead: newHead,
                canvasSize: this.canvasSize,
                snakeSize: this.snakeSize,
                boundaries: {
                    minX: this.snakeSize,
                    maxX: this.canvasSize - this.snakeSize,
                    minY: this.snakeSize,
                    maxY: this.canvasSize - this.snakeSize
                }
            });
            this.particles.createWallHitEffect(newHead.x, newHead.y);
            this.gameOver();
            return;
        }
        
        // Check self collision (skip more segments for better gameplay)
        for (let i = 8; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const distance = Math.sqrt((newHead.x - segment.x) ** 2 + (newHead.y - segment.y) ** 2);
            if (distance < this.snakeSize * 1.2) { // Reduced collision threshold
                console.log('Self collision:', {
                    newHead: newHead,
                    segment: segment,
                    distance: distance,
                    snakeLength: this.snake.length
                });
                this.gameOver();
                return;
            }
        }
        
        // Check obstacle collision - add debug logging
        for (let obstacle of this.obstacles) {
            const distance = Math.sqrt((newHead.x - obstacle.x) ** 2 + (newHead.y - obstacle.y) ** 2);
            if (distance < this.snakeSize + obstacle.size) {
                console.log('Obstacle collision:', {
                    newHead: newHead,
                    obstacle: obstacle,
                    distance: distance,
                    collisionThreshold: this.snakeSize + obstacle.size
                });
                this.gameOver();
                return;
            }
        }
        
        // Update snake body following head
        this.updateSnakeBody(newHead);
        
        // Check food collision
        if (this.food) {
            const distance = Math.sqrt((newHead.x - this.food.x) ** 2 + (newHead.y - this.food.y) ** 2);
            if (distance < this.snakeSize + this.foodSize) {
                this.eatFood();
            }
        }
        
        // Create trail particles
        if (this.snake.length > 1) {
            this.particles.createSnakeTrail(
                this.snake[1].x, this.snake[1].y, this.getSnakeColor()
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

    smoothTurn(deltaTime) {
        // Ensure valid directions
        if (!isFinite(this.targetDirection)) this.targetDirection = 0;
        if (!isFinite(this.direction)) this.direction = 0;
        if (!isFinite(deltaTime) || deltaTime <= 0) deltaTime = 1;
        
        // Smooth direction interpolation
        let angleDiff = this.targetDirection - this.direction;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply smooth turning
        if (Math.abs(angleDiff) > 0.01) {
            this.direction += angleDiff * this.turnSpeed * Math.min(deltaTime, 2);
        }
    }

    updateSnakeBody(newHead) {
        // Validate new head position
        if (!isFinite(newHead.x) || !isFinite(newHead.y)) {
            console.error('Invalid head position:', newHead);
            return;
        }
        
        // Add new head
        this.snake.unshift(newHead);
        
        // Update body positions to follow properly
        for (let i = 1; i < this.snake.length; i++) {
            const current = this.snake[i];
            const target = this.snake[i - 1];
            
            // Ensure valid positions
            if (!isFinite(current.x) || !isFinite(current.y) || 
                !isFinite(target.x) || !isFinite(target.y)) {
                continue;
            }
            
            // Calculate distance to previous segment
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too far, move closer
            if (distance > this.segmentSpacing && distance > 0) {
                const ratio = (distance - this.segmentSpacing) / distance;
                current.x += dx * ratio;
                current.y += dy * ratio;
            }
        }
        
        // Remove tail segments if snake hasn't grown
        while (this.snake.length > this.getSnakeLength()) {
            this.snake.pop();
        }
    }

    getSnakeLength() {
        return 3 + Math.floor(this.score / 50); // Grow every 50 points instead of 10
    }

    eatFood() {
        this.score += 10;
        gameUI.updateScore(this.score);
        
        // Create particle explosion
        this.particles.createFoodExplosion(
            this.food.x, this.food.y, this.getFoodColor()
        );
        
        // Play sound effect
        gameAudio.playEatSound();
        
        // Generate new food
        this.generateFood();
        
        // Increase speed slightly in classic mode
        if (this.gameMode === 'classic' && this.gameSpeed < 6) {
            this.gameSpeed += 0.1;
        }
    }

    addRandomObstacle() {
        let newObstacle;
        let attempts = 0;
        
        do {
            newObstacle = {
                x: 30 + Math.random() * (this.canvasSize - 60),
                y: 30 + Math.random() * (this.canvasSize - 60),
                size: 10 + Math.random() * 8
            };
            attempts++;
        } while (this.isPositionOccupied(newObstacle.x, newObstacle.y, newObstacle.size) && attempts < 50);
        
        if (attempts < 50) {
            this.obstacles.push(newObstacle);
        }
    }

    render() {
        // Clear canvas with gradient background
        this.renderBackground();
        
        // Render obstacles
        this.renderObstacles();
        
        // Render food with glow effect
        this.renderFood();
        
        // Render snake with smooth segments
        this.renderSnake();
        
        // Render particles
        this.particles.render();
    }

    renderBackground() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvasSize / 2, this.canvasSize / 2, 0,
            this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
        );
        
        if (this.settings.theme === 'neon') {
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#000011');
        } else if (this.settings.theme === 'retro') {
            gradient.addColorStop(0, '#3d2820');
            gradient.addColorStop(1, '#2d1810');
        } else {
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderSnake() {
        if (this.snake.length === 0) return;
        
        this.ctx.save();
        
        // Draw snake body segments
        for (let i = this.snake.length - 1; i >= 0; i--) {
            const segment = this.snake[i];
            const isHead = i === 0;
            const alpha = 1 - (i * 0.05); // Fade towards tail
            
            if (isHead) {
                this.renderSnakeHead(segment.x, segment.y);
            } else {
                this.renderSnakeSegment(segment.x, segment.y, alpha, i);
            }
        }
        
        this.ctx.restore();
    }

    renderSnakeHead(x, y) {
        // Ensure valid coordinates
        if (!isFinite(x) || !isFinite(y)) return;
        
        this.ctx.save();
        this.ctx.fillStyle = this.getSnakeHeadColor();
        this.ctx.shadowColor = this.getSnakeColor();
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.snakeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#000000';
        const eyeOffset = this.snakeSize * 0.4;
        const eyeSize = 2;
        
        // Ensure direction is valid
        const dir = isFinite(this.direction) ? this.direction : 0;
        
        const eyeX1 = x + Math.cos(dir - 0.5) * eyeOffset;
        const eyeY1 = y + Math.sin(dir - 0.5) * eyeOffset;
        const eyeX2 = x + Math.cos(dir + 0.5) * eyeOffset;
        const eyeY2 = y + Math.sin(dir + 0.5) * eyeOffset;
        
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderSnakeSegment(x, y, alpha, index) {
        // Ensure valid coordinates
        if (!isFinite(x) || !isFinite(y) || !isFinite(alpha)) return;
        
        const size = this.snakeSize * (0.8 + alpha * 0.2);
        
        this.ctx.fillStyle = this.getSnakeColor();
        this.ctx.globalAlpha = Math.max(0.3, alpha);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }

    renderFood() {
        if (!this.food || !isFinite(this.food.x) || !isFinite(this.food.y)) return;
        
        this.ctx.save();
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
        const size = this.foodSize * pulse;
        
        // Glow effect
        this.ctx.shadowColor = this.getFoodColor();
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = this.getFoodColor();
        
        this.ctx.beginPath();
        this.ctx.arc(this.food.x, this.food.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add sparkle particles
        this.particles.createFoodSparkle(this.food.x, this.food.y, size);
        
        this.ctx.restore();
    }

    renderObstacles() {
        this.ctx.save();
        
        for (let obstacle of this.obstacles) {
            this.ctx.fillStyle = this.getObstacleColor();
            this.ctx.shadowColor = this.getObstacleColor();
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    // Color methods
    getSnakeColor() {
        if (this.settings.theme === 'neon') return '#ff00ff';
        if (this.settings.theme === 'retro') return '#ff6b35';
        return '#4CAF50';
    }

    getSnakeHeadColor() {
        if (this.settings.theme === 'neon') return '#ffff00';
        if (this.settings.theme === 'retro') return '#f7931e';
        return '#81C784';
    }

    getFoodColor() {
        if (this.settings.theme === 'neon') return '#00ff00';
        if (this.settings.theme === 'retro') return '#c5282f';
        return '#FF5252';
    }

    getObstacleColor() {
        if (this.settings.theme === 'neon') return '#00ffff';
        if (this.settings.theme === 'retro') return '#8b4513';
        return '#666666';
    }

    // Game control methods
    gameOver(isWin = false) {
        this.isRunning = false;
        clearInterval(this.gameTimer);
        cancelAnimationFrame(this.animationId);
        
        // Create explosion effect
        if (!isWin) {
            this.particles.createGameOverExplosion(this.snake);
            gameAudio.playGameOverSound();
            gameUI.screenShake();
        }
        
        // Show game over screen
        const gameData = {
            score: this.score,
            snakeLength: this.snake.length,
            gameTime: this.gameTime,
            mode: this.gameMode,
            isWin: isWin
        };
        
        console.log('Game over:', gameData);
        setTimeout(() => gameUI.showGameOver(gameData), 500);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    restart() {
        this.start(this.gameMode);
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.gameTimer);
        cancelAnimationFrame(this.animationId);
    }

    updateSettings(settings) {
        this.settings = settings;
        this.gameSpeed = settings.speed === 'fast' ? 6 : settings.speed === 'slow' ? 2 : 4;
        
        if (this.isRunning) {
            // Apply settings immediately if game is running
            this.resizeCanvas();
        }
    }

    // Mobile direction control
    setDirection(dx, dy) {
        // Convert grid directions to angles for smooth movement
        if (dx === 1 && dy === 0) this.targetDirection = 0; // Right
        else if (dx === -1 && dy === 0) this.targetDirection = Math.PI; // Left  
        else if (dx === 0 && dy === -1) this.targetDirection = -Math.PI / 2; // Up
        else if (dx === 0 && dy === 1) this.targetDirection = Math.PI / 2; // Down
        
        this.isMouseControlling = false;
    }

    // Render methods
    render() {
        // Clear canvas with gradient background
        this.renderBackground();
        
        // Render obstacles
        this.renderObstacles();
        
        // Render food with glow effect
        this.renderFood();
        
        // Render snake with smooth segments
        this.renderSnake();
        
        // Render particles
        this.particles.render();
        
        // Render special abilities
        if (this.specialAbilities) {
            this.specialAbilities.renderSpecialAbilities(this.ctx);
        }
    }

    renderBackground() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvasSize / 2, this.canvasSize / 2, 0,
            this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
        );
        
        if (this.settings.theme === 'neon') {
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#000011');
        } else if (this.settings.theme === 'retro') {
            gradient.addColorStop(0, '#3d2820');
            gradient.addColorStop(1, '#2d1810');
        } else {
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderSnake() {
        if (this.snake.length === 0) return;
        
        this.ctx.save();
        
        // Draw snake body segments
        for (let i = this.snake.length - 1; i >= 0; i--) {
            const segment = this.snake[i];
            const isHead = i === 0;
            const alpha = 1 - (i * 0.05); // Fade towards tail
            
            if (isHead) {
                this.renderSnakeHead(segment.x, segment.y);
            } else {
                this.renderSnakeSegment(segment.x, segment.y, alpha, i);
            }
        }
        
        this.ctx.restore();
    }

    renderSnakeHead(x, y) {
        // Ensure valid coordinates
        if (!isFinite(x) || !isFinite(y)) return;
        
        this.ctx.save();
        this.ctx.fillStyle = this.getSnakeHeadColor();
        this.ctx.shadowColor = this.getSnakeColor();
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.snakeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#000000';
        const eyeOffset = this.snakeSize * 0.4;
        const eyeSize = 2;
        
        // Ensure direction is valid
        const dir = isFinite(this.direction) ? this.direction : 0;
        
        const eyeX1 = x + Math.cos(dir - 0.5) * eyeOffset;
        const eyeY1 = y + Math.sin(dir - 0.5) * eyeOffset;
        const eyeX2 = x + Math.cos(dir + 0.5) * eyeOffset;
        const eyeY2 = y + Math.sin(dir + 0.5) * eyeOffset;
        
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderSnakeSegment(x, y, alpha, index) {
        // Ensure valid coordinates
        if (!isFinite(x) || !isFinite(y) || !isFinite(alpha)) return;
        
        const size = this.snakeSize * (0.8 + alpha * 0.2);
        
        this.ctx.fillStyle = this.getSnakeColor();
        this.ctx.globalAlpha = Math.max(0.3, alpha);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }

    renderFood() {
        if (!this.food || !isFinite(this.food.x) || !isFinite(this.food.y)) return;
        
        this.ctx.save();
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
        const size = this.foodSize * pulse;
        
        // Glow effect
        this.ctx.shadowColor = this.getFoodColor();
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = this.getFoodColor();
        
        this.ctx.beginPath();
        this.ctx.arc(this.food.x, this.food.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add sparkle particles
        this.particles.createFoodSparkle(this.food.x, this.food.y, size);
        
        this.ctx.restore();
    }

    renderObstacles() {
        this.ctx.save();
        
        for (let obstacle of this.obstacles) {
            this.ctx.fillStyle = this.getObstacleColor();
            this.ctx.shadowColor = this.getObstacleColor();
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    // Color methods
    getSnakeColor() {
        if (this.settings.theme === 'neon') return '#ff00ff';
        if (this.settings.theme === 'retro') return '#ff6b35';
        return '#4CAF50';
    }

    getSnakeHeadColor() {
        if (this.settings.theme === 'neon') return '#ffff00';
        if (this.settings.theme === 'retro') return '#f7931e';
        return '#81C784';
    }

    getFoodColor() {
        if (this.settings.theme === 'neon') return '#00ff00';
        if (this.settings.theme === 'retro') return '#c5282f';
        return '#FF5252';
    }

    getObstacleColor() {
        if (this.settings.theme === 'neon') return '#00ffff';
        if (this.settings.theme === 'retro') return '#8b4513';
        return '#666666';
    }

    // Game control methods
    gameOver(isWin = false) {
        this.isRunning = false;
        clearInterval(this.gameTimer);
        cancelAnimationFrame(this.animationId);
        
        // Create explosion effect
        if (!isWin) {
            this.particles.createGameOverExplosion(this.snake);
            gameAudio.playGameOverSound();
            gameUI.screenShake();
        }
        
        // Show game over screen
        const gameData = {
            score: this.score,
            snakeLength: this.snake.length,
            gameTime: this.gameTime,
            mode: this.gameMode,
            isWin: isWin
        };
        
        console.log('Game over:', gameData);
        setTimeout(() => gameUI.showGameOver(gameData), 500);
    }

    eatFood() {
        this.score += 10;
        gameUI.updateScore(this.score);
        
        // Create particle explosion
        this.particles.createFoodExplosion(
            this.food.x, this.food.y, this.getFoodColor()
        );
        
        // Play sound effect
        gameAudio.playEatSound();
        
        // Generate new food
        this.generateFood();
        
        // Increase speed slightly in classic mode
        if (this.gameMode === 'classic' && this.gameSpeed < 6) {
            this.gameSpeed += 0.1;
        }
    }

    addRandomObstacle() {
        let newObstacle;
        let attempts = 0;
        
        do {
            newObstacle = {
                x: 30 + Math.random() * (this.canvasSize - 60),
                y: 30 + Math.random() * (this.canvasSize - 60),
                size: 10 + Math.random() * 8
            };
            attempts++;
        } while (this.isPositionOccupied(newObstacle.x, newObstacle.y, newObstacle.size) && attempts < 50);
        
        if (attempts < 50) {
            this.obstacles.push(newObstacle);
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    restart() {
        this.start(this.gameMode);
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.gameTimer);
        cancelAnimationFrame(this.animationId);
    }
}

// Create global game instance
let game = null;
