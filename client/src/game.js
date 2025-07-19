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
        
        // Snake properties for smooth movement
        this.snake = [];
        this.snakeSize = 12; // Snake segment radius
        this.segmentSpacing = 16; // Distance between segments
        this.food = null;
        this.foodSize = 8;
        this.obstacles = [];
        
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
        
        // Input handling
        this.setupInputHandlers();
        
        // Animation frame
        this.animationId = null;
        
        console.log('Snake Viper game initialized with smooth movement');
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
        const obstacleCount = 8; // Fixed number of obstacles
        
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let attempts = 0;
            
            do {
                obstacle = {
                    x: 30 + Math.random() * (this.canvasSize - 60),
                    y: 30 + Math.random() * (this.canvasSize - 60),
                    size: 15 + Math.random() * 10
                };
                attempts++;
            } while (this.isPositionOccupied(obstacle.x, obstacle.y, obstacle.size) && attempts < 100);
            
            if (attempts < 100) {
                this.obstacles.push(obstacle);
            }
        }
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
        // Smooth direction interpolation
        this.smoothTurn(deltaTime);
        
        // Move snake head
        const head = this.snake[0];
        const moveDistance = this.gameSpeed * deltaTime;
        
        const newHead = {
            x: head.x + Math.cos(this.direction) * moveDistance,
            y: head.y + Math.sin(this.direction) * moveDistance
        };
        
        // Check wall collision
        if (newHead.x < this.snakeSize || newHead.x > this.canvasSize - this.snakeSize || 
            newHead.y < this.snakeSize || newHead.y > this.canvasSize - this.snakeSize) {
            this.particles.createWallHitEffect(newHead.x, newHead.y);
            this.gameOver();
            return;
        }
        
        // Check self collision (skip first few segments for smoother turning)
        for (let i = 4; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const distance = Math.sqrt((newHead.x - segment.x) ** 2 + (newHead.y - segment.y) ** 2);
            if (distance < this.snakeSize * 1.5) {
                this.gameOver();
                return;
            }
        }
        
        // Check obstacle collision
        for (let obstacle of this.obstacles) {
            const distance = Math.sqrt((newHead.x - obstacle.x) ** 2 + (newHead.y - obstacle.y) ** 2);
            if (distance < this.snakeSize + obstacle.size) {
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
        // Smooth direction interpolation
        let angleDiff = this.targetDirection - this.direction;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply smooth turning
        if (Math.abs(angleDiff) > 0.01) {
            this.direction += angleDiff * this.turnSpeed * deltaTime;
        }
    }

    updateSnakeBody(newHead) {
        // Add new head
        this.snake.unshift(newHead);
        
        // Update body positions to follow properly
        for (let i = 1; i < this.snake.length; i++) {
            const current = this.snake[i];
            const target = this.snake[i - 1];
            
            // Calculate distance to previous segment
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too far, move closer
            if (distance > this.segmentSpacing) {
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
        return 3 + Math.floor(this.score / 10); // Grow every 10 points
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
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.snakeSize);
        gradient.addColorStop(0, this.getSnakeHeadColor());
        gradient.addColorStop(1, this.getSnakeColor());
        
        this.ctx.fillStyle = gradient;
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
        
        const eyeX1 = x + Math.cos(this.direction - 0.5) * eyeOffset;
        const eyeY1 = y + Math.sin(this.direction - 0.5) * eyeOffset;
        const eyeX2 = x + Math.cos(this.direction + 0.5) * eyeOffset;
        const eyeY2 = y + Math.sin(this.direction + 0.5) * eyeOffset;
        
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderSnakeSegment(x, y, alpha, index) {
        const size = this.snakeSize * (0.8 + alpha * 0.2);
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, this.getSnakeColor() + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, this.getSnakeColor() + '40');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
    }

    renderFood() {
        if (!this.food) return;
        
        this.ctx.save();
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
        const size = this.foodSize * pulse;
        
        // Glow effect
        this.ctx.shadowColor = this.getFoodColor();
        this.ctx.shadowBlur = 20;
        
        const gradient = this.ctx.createRadialGradient(
            this.food.x, this.food.y, 0,
            this.food.x, this.food.y, size
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, this.getFoodColor());
        gradient.addColorStop(1, this.getFoodColor() + '40');
        
        this.ctx.fillStyle = gradient;
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
