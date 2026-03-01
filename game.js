// Game variables
let gameRunning = false;
let score = 0;
let carPosition = 50; // Percentage
let obstacles = [];
let gameLoop;
let obstacleSpeed = 5;
let spawnRate = 1500; // milliseconds
let lastSpawn = 0;

// DOM elements
const car = document.getElementById('car');
const gameCanvas = document.getElementById('game-canvas');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverDiv = document.getElementById('game-over');

// Game constants
const carWidth = 50;
const canvasWidth = gameCanvas.offsetWidth;
const lanes = [25, 50, 75]; // Three lanes as percentages

// Initialize game
function init() {
    carPosition = 50;
    updateCarPosition();
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft') {
        moveCarLeft();
    } else if (e.key === 'ArrowRight') {
        moveCarRight();
    }
}

// Move car left
function moveCarLeft() {
    const currentIndex = lanes.indexOf(carPosition);
    if (currentIndex > 0) {
        carPosition = lanes[currentIndex - 1];
        updateCarPosition();
    }
}

// Move car right
function moveCarRight() {
    const currentIndex = lanes.indexOf(carPosition);
    if (currentIndex < lanes.length - 1) {
        carPosition = lanes[currentIndex + 1];
        updateCarPosition();
    }
}

// Update car position on screen
function updateCarPosition() {
    car.style.left = carPosition + '%';
}

// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    obstacles = [];
    obstacleSpeed = 5;
    spawnRate = 1500;
    lastSpawn = Date.now();
    
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameOverDiv.style.display = 'none';
    
    updateScore();
    gameLoop = setInterval(update, 20);
    
    // Start spawning obstacles
    spawnObstacle();
}

// Reset game
function resetGame() {
    // Clear all obstacles
    obstacles.forEach(obs => {
        if (obs.element.parentNode) {
            obs.element.parentNode.removeChild(obs.element);
        }
    });
    
    startGame();
}

// Spawn obstacle
function spawnObstacle() {
    if (!gameRunning) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // Random lane
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    obstacle.style.left = lane + '%';
    obstacle.style.top = '-80px';
    obstacle.style.transform = 'translateX(-50%)';
    
    gameCanvas.appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        position: -80,
        lane: lane
    });
    
    // Schedule next spawn
    const nextSpawn = Math.max(800, spawnRate - (score * 10));
    setTimeout(spawnObstacle, nextSpawn);
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position += obstacleSpeed;
        obs.element.style.top = obs.position + 'px';
        
        // Check collision
        if (checkCollision(obs)) {
            endGame();
            return;
        }
        
        // Remove obstacle if off screen
        if (obs.position > gameCanvas.offsetHeight) {
            obs.element.parentNode.removeChild(obs.element);
            obstacles.splice(i, 1);
            
            // Increase score
            score += 10;
            updateScore();
            
            // Increase difficulty
            if (score % 100 === 0) {
                obstacleSpeed += 0.5;
            }
        }
    }
}

// Check collision
function checkCollision(obstacle) {
    const carRect = car.getBoundingClientRect();
    const obsRect = obstacle.element.getBoundingClientRect();
    
    return !(carRect.right < obsRect.left || 
             carRect.left > obsRect.right || 
             carRect.bottom < obsRect.top || 
             carRect.top > obsRect.bottom);
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    finalScoreDisplay.textContent = score;
    gameOverDiv.style.display = 'block';
    restartBtn.style.display = 'inline-block';
}

// Initialize game when page loads
window.addEventListener('load', init);
