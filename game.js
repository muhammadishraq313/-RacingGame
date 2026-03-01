// Game configuration
const config = {
    canvasWidth: 400,
    canvasHeight: 500,
    playerWidth: 40,
    playerHeight: 60,
    enemyWidth: 40,
    enemyHeight: 60,
    roadLineWidth: 10,
    roadLineHeight: 40,
    playerSpeed: 5,
    enemySpeed: 3,
    maxLives: 3,
    maxGameSpeed: 8,
    spawnIntervalReduction: 50,
    minSpawnInterval: 800
};

// Game state
let gameState = {
    isRunning: false,
    score: 0,
    lives: config.maxLives,
    gameSpeed: 3,
    lastEnemySpawn: 0,
    enemySpawnInterval: 1500,
    lastDifficultyIncrease: 0
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

// Game objects
const player = {
    x: config.canvasWidth / 2 - config.playerWidth / 2,
    y: config.canvasHeight - config.playerHeight - 20,
    width: config.playerWidth,
    height: config.playerHeight,
    speed: config.playerSpeed
};

let enemies = [];
let roadLines = [];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'a' || e.key === 'd') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize road lines
function initRoadLines() {
    roadLines = [];
    for (let i = 0; i < config.canvasHeight / config.roadLineHeight; i++) {
        roadLines.push({
            x: config.canvasWidth / 2 - config.roadLineWidth / 2,
            y: i * config.roadLineHeight * 2,
            width: config.roadLineWidth,
            height: config.roadLineHeight
        });
    }
}

// Enemy management
function spawnEnemy() {
    const lanes = [
        config.canvasWidth * 0.2,
        config.canvasWidth * 0.5,
        config.canvasWidth * 0.8
    ];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    enemies.push({
        x: lane - config.enemyWidth / 2,
        y: -config.enemyHeight,
        width: config.enemyWidth,
        height: config.enemyHeight,
        speed: gameState.gameSpeed
    });
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Drawing functions
function drawPlayer() {
    // Car body
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Car top
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 20);
    
    // Wheels
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x - 3, player.y + 10, 6, 15);
    ctx.fillRect(player.x + player.width - 3, player.y + 10, 6, 15);
    ctx.fillRect(player.x - 3, player.y + player.height - 25, 6, 15);
    ctx.fillRect(player.x + player.width - 3, player.y + player.height - 25, 6, 15);
}

function drawEnemy(enemy) {
    // Car body
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Car top
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 30, enemy.width - 10, 20);
    
    // Wheels
    ctx.fillStyle = '#000';
    ctx.fillRect(enemy.x - 3, enemy.y + 10, 6, 15);
    ctx.fillRect(enemy.x + enemy.width - 3, enemy.y + 10, 6, 15);
    ctx.fillRect(enemy.x - 3, enemy.y + enemy.height - 25, 6, 15);
    ctx.fillRect(enemy.x + enemy.width - 3, enemy.y + enemy.height - 25, 6, 15);
}

function drawRoad() {
    // Road background
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // Road edges
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 5, config.canvasHeight);
    ctx.fillRect(config.canvasWidth - 5, 0, 5, config.canvasHeight);
    
    // Road lines
    ctx.fillStyle = '#ffeb3b';
    roadLines.forEach(line => {
        ctx.fillRect(line.x, line.y, line.width, line.height);
    });
}

// Update functions
function updatePlayer() {
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 10) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d']) && player.x < config.canvasWidth - player.width - 10) {
        player.x += player.speed;
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Remove enemies that are off screen
        if (enemies[i].y > config.canvasHeight) {
            enemies.splice(i, 1);
            gameState.score += 10;
            updateScore();
        }
    }
}

function updateRoadLines() {
    roadLines.forEach(line => {
        line.y += gameState.gameSpeed;
        if (line.y > config.canvasHeight) {
            line.y = -config.roadLineHeight;
        }
    });
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (checkCollision(player, enemies[i])) {
            enemies.splice(i, 1);
            gameState.lives--;
            updateLives();
            
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    }
}

// UI updates
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateLives() {
    document.getElementById('lives').textContent = gameState.lives;
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // Draw
    drawRoad();
    drawPlayer();
    enemies.forEach(drawEnemy);
    
    // Update
    updatePlayer();
    updateEnemies();
    updateRoadLines();
    checkCollisions();
    
    // Spawn enemies
    if (timestamp - gameState.lastEnemySpawn > gameState.enemySpawnInterval) {
        spawnEnemy();
        gameState.lastEnemySpawn = timestamp;
    }
    
    // Gradually increase difficulty at score milestones
    const currentMilestone = Math.floor(gameState.score / 100);
    if (currentMilestone > gameState.lastDifficultyIncrease) {
        gameState.lastDifficultyIncrease = currentMilestone;
        gameState.gameSpeed = Math.min(gameState.gameSpeed + 0.2, config.maxGameSpeed);
        gameState.enemySpawnInterval = Math.max(gameState.enemySpawnInterval - config.spawnIntervalReduction, config.minSpawnInterval);
    }
    
    requestAnimationFrame(gameLoop);
}

// Game state management
function startGame() {
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.lives = config.maxLives;
    gameState.gameSpeed = 3;
    gameState.enemySpawnInterval = 1500;
    gameState.lastEnemySpawn = 0;
    gameState.lastDifficultyIncrease = 0;
    
    enemies = [];
    initRoadLines();
    
    player.x = config.canvasWidth / 2 - config.playerWidth / 2;
    
    updateScore();
    updateLives();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('game-screen').style.display = 'block';
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.isRunning = false;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('game-over-screen').classList.remove('hidden');
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Initial setup
document.getElementById('game-screen').style.display = 'none';
initRoadLines();
