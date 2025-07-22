// Main Snake Game Class for Standalone HTML Version
class SnakeGame {
    constructor(mode, level, settings) {
        this.mode = mode;
        this.level = level;
        this.settings = settings;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.score = 0;
        this.gameStartTime = 0;
        
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8, 600);
        
        // Game objects
        this.snake = [];
        this.food = null;
        this.obstacles = [];
        this.powerBalls = [];
        
        // Movement
        this.direction = 0; // radians
        this.targetDirection = 0;
        this.speed = 100 + (level * 20); // pixels per second
        this.turnSpeed = 8;
        
        // Sizes
        this.snakeSize = Math.max(8, this.canvasSize / 40);
        this.foodSize = Math.max(6, this.canvasSize / 50);
        
        // Initialize systems
        this.audioSystem = new AudioSystem(settings);
        this.particles = new ParticleSystem(this.ctx);
        this.aiSnake = new AISnake(this.canvasSize, this.snakeSize);
        this.specialAbilities = new SpecialAbilities(this);
        
        this.setupCanvas();
        this.setupControls();
        this.initializeGame();
        
        console.log(`Snake Game initialized: ${mode} mode, level ${level}`);
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        this.canvas.style.width = this.canvasSize + 'px';
        this.canvas.style.height = this.canvasSize + 'px';
        
        // Chrome optimizations
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.display = 'block';
        this.canvas.style.visibility = 'visible';
        this.canvas.style.transform = 'translateZ(0)';
        
        console.log(`Canvas setup: ${this.canvasSize}x${this.canvasSize}`);
    }
    
    setupControls() {
        this.keys = new Set();
        
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase());
            this.handleInput(e.key.toLowerCase());
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
            e.preventDefault();
        });
    }
    
    handleInput(key) {
        if (!this.isRunning) return;
        
        const moveKeys = {
            'w': -Math.PI/2,  // Up
            'arrowup': -Math.PI/2,
            's': Math.PI/2,   // Down
            'arrowdown': Math.PI/2,
            'a': Math.PI,     // Left
            'arrowleft': Math.PI,
            'd': 0,           // Right
            'arrowright': 0
        };
        
        if (moveKeys.hasOwnProperty(key)) {
            this.targetDirection = moveKeys[key];
        }
        
        // Special abilities
        if (key === ' ') { // Space - Speed boost
            this.specialAbilities.activateSpeedBoost();
        }
        
        if (key === 'shift') { // Shift - Power ball
            this.specialAbilities.launchPowerBall();
        }
        
        console.log(`Input: ${key}, Direction: ${this.targetDirection}`);
    }
    
    initializeGame() {
        // Initialize snake at center
        const centerX = this.canvasSize / 2;
        const centerY = this.canvasSize / 2;
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - this.snakeSize, y: centerY },
            { x: centerX - this.snakeSize * 2, y: centerY }
        ];
        
        // Spawn food
        this.spawnFood();
        
        // Initialize AI snake
        this.aiSnake.initialize();
        
        // Setup obstacles for obstacle mode
        if (this.mode === 'obstacle') {
            this.spawnObstacles();
        }
        
        console.log('Game initialized successfully');
    }
    
    start() {
        this.isRunning = true;
        this.gameStartTime = Date.now();
        this.audioSystem.playBackgroundMusic();
        this.gameLoop();
        this.updateUI();
        console.log(`Game started: ${this.mode} mode, level ${this.level}`);
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        
        const deltaTime = Math.min((currentTime - (this.lastTime || 0)) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        this.render();
    }
    
    update(deltaTime) {
        if (deltaTime <= 0) return;
        
        // Update game time
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
        
        // Smooth turning
        this.smoothTurn(deltaTime);
        
        // Move snake
        this.moveSnake(deltaTime);
        
        // Update AI snake
        if (this.aiSnake) {
            this.aiSnake.update(deltaTime, this.snake[0], this.food);
            this.checkAICollision();
        }
        
        // Update special abilities
        this.specialAbilities.update(deltaTime);
        
        // Update particles
        this.particles.update();
        
        // Check time attack mode
        if (this.mode === 'time' && this.gameTime > 60) {
            this.gameOver(true, 'Time\'s up!');
        }
    }
    
    smoothTurn(deltaTime) {
        let angleDiff = this.targetDirection - this.direction;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply smooth turning
        if (Math.abs(angleDiff) > 0.01) {
            this.direction += angleDiff * this.turnSpeed * deltaTime;
        }
    }
    
    moveSnake(deltaTime) {
        if (this.snake.length === 0) return;
        
        const head = this.snake[0];
        let currentSpeed = this.speed * (1 + (this.level - 1) * 0.2);
        
        // Apply speed boosts
        currentSpeed *= this.specialAbilities.getSpeedMultiplier();
        
        const moveDistance = currentSpeed * deltaTime;
        
        const newHead = {
            x: head.x + Math.cos(this.direction) * moveDistance,
            y: head.y + Math.sin(this.direction) * moveDistance
        };
        
        // Check wall collision
        if (newHead.x < this.snakeSize || newHead.x > this.canvasSize - this.snakeSize || 
            newHead.y < this.snakeSize || newHead.y > this.canvasSize - this.snakeSize) {
            this.gameOver(false, 'Hit wall');
            return;
        }
        
        // Check self collision
        for (let i = 3; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const distance = Math.sqrt((newHead.x - segment.x) ** 2 + (newHead.y - segment.y) ** 2);
            if (distance < this.snakeSize * 1.2) {
                this.gameOver(false, 'Hit yourself');
                return;
            }
        }
        
        // Check obstacle collision
        for (let obstacle of this.obstacles) {
            const distance = Math.sqrt((newHead.x - obstacle.x) ** 2 + (newHead.y - obstacle.y) ** 2);
            if (distance < this.snakeSize + obstacle.size) {
                this.gameOver(false, 'Hit obstacle');
                return;
            }
        }
        
        // Update snake
        this.snake.unshift(newHead);
        
        // Check food collision
        if (this.food) {
            const distance = Math.sqrt((newHead.x - this.food.x) ** 2 + (newHead.y - this.food.y) ** 2);
            if (distance < this.snakeSize + this.foodSize) {
                this.eatFood();
            } else {
                this.snake.pop(); // Remove tail if no food eaten
            }
        } else {
            this.snake.pop();
        }
    }
    
    checkAICollision() {
        if (!this.aiSnake || !this.aiSnake.segments || this.snake.length === 0) return;
        
        const head = this.snake[0];
        
        // Check collision with AI snake
        for (let segment of this.aiSnake.segments) {
            if (!segment) continue;
            const distance = Math.sqrt((head.x - segment.x) ** 2 + (head.y - segment.y) ** 2);
            if (distance < this.snakeSize + this.aiSnake.segmentSize) {
                this.gameOver(false, 'Collided with Vegeta!');
                return;
            }
        }
    }
    
    eatFood() {
        this.score += 10 * this.level;
        this.audioSystem.playSound('success');
        
        // Create particles
        this.particles.createFoodEffect(this.food.x, this.food.y);
        
        // Grow snake (don't remove tail)
        for (let i = 0; i < 2; i++) { // Add 2 segments per food
            const lastSegment = this.snake[this.snake.length - 1];
            this.snake.push({ x: lastSegment.x, y: lastSegment.y });
        }
        
        this.spawnFood();
        this.updateUI();
        
        console.log(`Food eaten! Score: ${this.score}, Length: ${this.snake.length}`);
    }
    
    spawnFood() {
        let attempts = 0;
        do {
            this.food = {
                x: this.foodSize + Math.random() * (this.canvasSize - this.foodSize * 2),
                y: this.foodSize + Math.random() * (this.canvasSize - this.foodSize * 2)
            };
            attempts++;
        } while (this.isPositionOccupied(this.food.x, this.food.y, this.foodSize) && attempts < 100);
    }
    
    spawnObstacles() {
        const obstacleCount = 3 + this.level;
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let attempts = 0;
            do {
                obstacle = {
                    x: 50 + Math.random() * (this.canvasSize - 100),
                    y: 50 + Math.random() * (this.canvasSize - 100),
                    size: 15 + Math.random() * 15
                };
                attempts++;
            } while (this.isPositionOccupied(obstacle.x, obstacle.y, obstacle.size) && attempts < 50);
            
            this.obstacles.push(obstacle);
        }
    }
    
    isPositionOccupied(x, y, size) {
        // Check snake
        for (let segment of this.snake) {
            const distance = Math.sqrt((x - segment.x) ** 2 + (y - segment.y) ** 2);
            if (distance < size + this.snakeSize) return true;
        }
        
        // Check obstacles
        for (let obstacle of this.obstacles) {
            const distance = Math.sqrt((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2);
            if (distance < size + obstacle.size) return true;
        }
        
        return false;
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.save();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.renderBackground();
        
        // Game objects
        this.renderObstacles();
        this.renderFood();
        this.renderSnake();
        
        // AI snake
        if (this.aiSnake) {
            this.aiSnake.render(this.ctx);
        }
        
        // Particles
        this.particles.render();
        
        // Special abilities (power balls)
        this.specialAbilities.render();
        
        this.ctx.restore();
    }
    
    renderBackground() {
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
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const isHead = i === 0;
            const size = isHead ? this.snakeSize * 1.2 : this.snakeSize;
            
            // Colors based on theme and special abilities
            let color = this.getSnakeColor();
            if (isHead && this.specialAbilities.isSpeedBoostActive()) {
                color = '#FFD700'; // Golden when speed boosting
            }
            
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = isHead ? 2 : 1;
            
            this.ctx.beginPath();
            this.ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Eyes for head
            if (isHead) {
                this.ctx.fillStyle = '#000000';
                const eyeSize = size * 0.15;
                const eyeOffset = size * 0.3;
                
                this.ctx.beginPath();
                this.ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    renderFood() {
        if (!this.food) return;
        
        this.ctx.save();
        
        const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 1;
        const size = this.foodSize * pulse;
        
        this.ctx.fillStyle = this.getFoodColor();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.food.x, this.food.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    renderObstacles() {
        this.ctx.save();
        
        for (let obstacle of this.obstacles) {
            this.ctx.fillStyle = this.getObstacleColor();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    getSnakeColor() {
        if (this.settings.theme === 'neon') return '#ff00ff';
        if (this.settings.theme === 'retro') return '#ff6b35';
        return '#4CAF50';
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
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('lengthValue').textContent = this.snake.length;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('timeValue').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('modeValue').textContent = this.mode.charAt(0).toUpperCase() + this.mode.slice(1);
    }
    
    pause() {
        this.isPaused = true;
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        this.audioSystem.pauseBackgroundMusic();
        console.log('Game paused');
    }
    
    resume() {
        this.isPaused = false;
        this.isRunning = true;
        this.gameLoop();
        this.audioSystem.resumeBackgroundMusic();
        console.log('Game resumed');
    }
    
    gameOver(isWin = false, reason = '') {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        this.audioSystem.stopBackgroundMusic();
        
        if (isWin) {
            this.audioSystem.playSound('success');
        } else {
            this.audioSystem.playSound('hit');
        }
        
        // Show game over screen
        document.getElementById('gameOverTitle').textContent = isWin ? 'Victory!' : 'Game Over!';
        document.getElementById('gameOverReason').textContent = reason;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLength').textContent = this.snake.length;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('gameOverModal').classList.remove('hidden');
        
        console.log(`Game over: ${reason}, Score: ${this.score}`);
    }
    
    destroy() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.audioSystem.stopBackgroundMusic();
        console.log('Game destroyed');
    }
}