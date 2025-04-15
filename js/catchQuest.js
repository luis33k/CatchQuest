const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let basket = { x: canvas.width / 2 - 25, width: 50, height: 20 };
let objects = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let lossNotificationShown = false;
let lastTime = 0;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let difficulty = 'Easy';
let fallingSpeed = 4;
let objectCreationInterval = 1000;

// Default colors
let canvasBackground = 'white'; // Blue
let playerColor = '#33ffdc'; // Pink
let objectColor = '#ff33e0'; // Yellow

const muteButton = document.getElementById('muteButton');

// Toggle mute functionality
muteButton.addEventListener('click', () => {
    if (currentVolume > 0) {
        // Mute the game
        currentVolume = 0;
        catchSound.volume = 0;
        gameOverSound.volume = 0;
        volumeControl.value = 0;
        volumeValue.textContent = '0%';
        muteButton.textContent = 'Unmute';  // Change button text
        
        // Change the button color to indicate muted state
        muteButton.style.backgroundColor = '#FF4081';  // Pink color for mute
        muteButton.style.color = 'white';  // Text color for contrast
    } else {
        // Unmute the game
        currentVolume = 1;
        catchSound.volume = currentVolume;
        gameOverSound.volume = currentVolume;
        volumeControl.value = currentVolume;
        volumeValue.textContent = '100%';
        muteButton.textContent = 'Mute';  // Change button text back
        
        // Change the button color back to the original color
        muteButton.style.backgroundColor = '#4CAF50';  // Green color for unmuted
        muteButton.style.color = 'white';  // Text color for contrast
    }
});

// Keyboard input handling
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        basket.x -= 40;
        if (basket.x < 0) basket.x = 0;
    } else if (event.key === 'ArrowRight') {
        basket.x += 40;
        if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
    }
});

// Object creation function
function createObject() {
    const x = Math.random() * (canvas.width - 20);
    const size = Math.random() * (25 - 15) + 15;
    // Use fixed fallingSpeed with no variation
    objects.push({
        x: x,
        y: 0,
        width: size,
        height: size,
        speed: fallingSpeed
    });
}

// Function to apply new colors to the game
function applyColors() {
    // Update canvas background color
    canvas.style.background = canvasBackground;

    // Update the game rendering logic
    ctx.fillStyle = playerColor; // Player color
    ctx.fillRect(basket.x, canvas.height - basket.height, basket.width, basket.height);

    // Apply object color during rendering
    ctx.fillStyle = objectColor;
    objects.forEach((obj) => {
        obj.y += obj.speed;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });
}

// Function to toggle dark/light mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.classList.toggle('light-mode'));
    const canvasElement = document.getElementById('gameCanvas');
    canvasElement.classList.toggle('light-mode');

    // Set canvas background color based on dark mode state
    if (body.classList.contains('light-mode')) {
        canvasBackground = '#212121'; // Light mode background
    } else {
        canvasBackground = 'white'; // Dark mode background
    }
    applyColors(); // Update canvas background color
}

// Event listener for color change button
document.getElementById('changeColorsButton').addEventListener('click', () => {
    // Prompt user to select new colors (or use a color picker UI)
    const newCanvasColor = prompt("Enter Canvas Background Color (e.g., #2196f3, red, etc.):", canvasBackground);
    const newPlayerColor = prompt("Enter Player Color (e.g., #FF4081, pink, etc.):", playerColor);
    const newObjectColor = prompt("Enter Object Color (e.g., #FFEB3B, yellow, etc.):", objectColor);

    // Apply the selected colors
    if (newCanvasColor) canvasBackground = newCanvasColor;
    if (newPlayerColor) playerColor = newPlayerColor;
    if (newObjectColor) objectColor = newObjectColor;

    applyColors(); // Apply new colors to the game
});

// Event listener for dark/light mode toggle
document.getElementById('toggleDarkModeButton').addEventListener('click', toggleDarkMode);

// Update game state and render objects
function update() {
    if (gameOver) {
        console.log('Game Over triggered!');
    }
    if (gameOver) return;
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyColors(); // Apply colors during each update

    // Render falling objects and basket
    objects.forEach((obj, index) => {
        if (!paused) obj.y += obj.speed;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

        // Sound for catching an object
        const catchSound = document.getElementById("catchSound");

        // Collision detection and game over conditions
        if (obj.y + obj.height > canvas.height - basket.height && obj.x < basket.x + basket.width && obj.x + obj.width > basket.x) {
            score++;
            objects.splice(index, 1);
            catchSound.play();  // Play sound when an object is caught
        }

        if (obj.y > canvas.height + obj.height) {
            gameOver = true;
        }
    });

    // Score rendering with gradient
    ctx.font = '26px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const gradient = ctx.createLinearGradient(0, 0, 0, 70);
    gradient.addColorStop(0, "#FF4081");
    gradient.addColorStop(0.8, "#2196F3");
    gradient.addColorStop(1.0, "#FFEB3B");

    ctx.fillStyle = gradient;
    ctx.fillText(`Score: ${score}`, 10, 20);

}

// Initialize default colors
applyColors();

// Sound for game over
const gameOverSound = document.getElementById("gameOverSound");

// Display the Loss Notification with animations and confetti
function showLossNotification() {
    console.log("Showing loss notification!");
    if (lossNotificationShown) return;

    const lossNotification = document.getElementById('lossNotification');
    const finalScore = document.getElementById('finalScore');
    finalScore.textContent = score;

    gameOverSound.play();
    lossNotification.classList.add('show');
    lossNotification.style.display = 'block';
    triggerConfetti();

    lossNotificationShown = true;
}


// Trigger Confetti Effect
function triggerConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        document.body.appendChild(confetti);

        // Randomize direction, size, and speed of the confetti
        const xPosition = Math.random() * window.innerWidth;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        confetti.style.left = `${xPosition}px`;
        confetti.style.animationDuration = `${animationDuration}s`;
        confetti.style.animationDelay = `${delay}s`;

        // Remove confetti after animation ends
        setTimeout(() => {
            confetti.remove();
        }, (animationDuration + delay) * 1000);
    }
}

// Save score functionality
function saveScore(name) {
    const date = new Date().toLocaleString();
    const existingScoreIndex = highScores.findIndex(s => s.name === name && s.difficulty === difficulty);

    if (existingScoreIndex >= 0) {
        if (score > highScores[existingScoreIndex].score) {
            highScores[existingScoreIndex] = { name, score, date, difficulty };
        }
    } else {
        highScores.push({ name, score, date, difficulty });
    }

    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateLeaderboard();

    document.getElementById('lossNotification').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    gameStarted = false;
    gameOver = false;
    score = 0;
    objects = [];
    lossNotificationShown = false;
    
    // Reset difficulty to saved one
    updateDifficulty(); 
    pauseButton.textContent = 'Pause'; // reset pause button
    
    resetGame();   
}


// Function to update the leaderboard with scores by difficulty
function updateLeaderboard() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';

    // Create tabs for each difficulty
    scoreList.innerHTML = `
        <div class="difficulty-tabs">
            <button class="tab active" data-difficulty="all">All</button>
            <button class="tab" data-difficulty="Easy">Easy</button>
            <button class="tab" data-difficulty="Intermediate">Intermediate</button>
            <button class="tab" data-difficulty="Hard">Hard</button>
        </div>
        <div class="scores-container"></div>
    `;

    // Show all scores by default
    showScoresByDifficulty('all');

    // Add tab click handlers
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showScoresByDifficulty(tab.dataset.difficulty);
        });
    });
}

function showScoresByDifficulty(difficultyFilter) {
    const container = document.querySelector('.scores-container');
    container.innerHTML = '';

    const filteredScores = difficultyFilter === 'all'
        ? highScores
        : highScores.filter(score => score.difficulty === difficultyFilter);

    filteredScores
        .sort((a, b) => b.score - a.score)
        .forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score} (${entry.difficulty}) on ${entry.date}`;
            container.appendChild(li);
        });
}

function startGame() {
    gameStarted = true;  // Set gameStarted to true
    lastTime = 0;  // Reset last time to allow new objects to start falling
    objects = [];  // Reset falling objects array
    score = 0;  // Reset score
    pauseButton.textContent = 'Pause';
    gameOver = false;  // Reset game over flag
    lossNotificationShown = false;
    requestAnimationFrame(gameLoop);  // Start the game loop
}


// Game loop
function gameLoop(timestamp) {
    if (paused || !gameStarted) return;

    if (lastTime === null) {
        lastTime = timestamp;
    }

    if (gameOver) {
        if (!lossNotificationShown) {
            showLossNotification();
        }
        return;
    }

    // Calculate time delta for consistent object creation
    const deltaTime = timestamp - lastTime;

    if (deltaTime > objectCreationInterval) {
        createObject();
        lastTime = timestamp - (deltaTime % objectCreationInterval);
    }

    update();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Event listeners for menu and score
document.getElementById('submitScore').addEventListener('click', () => {
    const name = document.getElementById('playerName').value;
    if (name) {
        saveScore(name);
    } else {
        alert("Please enter your name.");
    }
});

document.getElementById('closeLossNotification').addEventListener('click', () => {
    resetGame();
});

// Difficulty button functionality
function updateDifficulty() {
    // Cycle through difficulty levels
    if (difficulty === 'Easy') {
        difficulty = 'Intermediate';
        fallingSpeed = 4;
        objectCreationInterval = 800;
    } else if (difficulty === 'Intermediate') {
        difficulty = 'Hard';
        fallingSpeed = 6;
        objectCreationInterval = 600;
    } else {
        difficulty = 'Easy';
        fallingSpeed = 2;
        objectCreationInterval = 1000;
    }

    // Reset shown flag so loss popup works after difficulty switch
    lossNotificationShown = false;

    // Update button text
    const difficultyButton = document.getElementById('difficultyButton');
    if (difficultyButton) {
        difficultyButton.textContent = `Set Difficulty: ${difficulty}`;
    }

    // Update game parameters if running
    if (gameStarted) {
        objects.forEach(obj => obj.speed = fallingSpeed);
        lastTime = performance.now();
        objects = [];
    }
}

// Initialize difficulty button
const difficultyButton = document.getElementById('difficultyButton');
if (difficultyButton) {
    difficultyButton.addEventListener('click', updateDifficulty);
    difficultyButton.textContent = `Set Difficulty: ${difficulty}`; // Set initial text
} else {
    console.error('Difficulty button not found!');
}

document.getElementById('restartGame').addEventListener('click', () => {
    restartGame();
    // Reset colors in case they were changed
    applyColors();
});

function restartGame() {
    // Reset all game variables to initial state
    score = 0;
    objects = [];
    gameOver = false;
    gameStarted = false;
    lossNotificationShown = false;
    lastTime = 0;

    // Reset difficulty settings
    difficulty = 'Easy';
    fallingSpeed = 4;
    objectCreationInterval = 1000;
    document.getElementById('difficultyButton').textContent = `Set Difficulty: ${difficulty}`;

    // Hide UI elements
    document.getElementById('lossNotification').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('restartGame').style.display = 'none';

    // Clear any pending animation frames
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Reinitialize the game
    initGame();
}

// Instructions button functionality
document.getElementById('instructionsButton').addEventListener('click', () => {
    const instructions = document.getElementById('instructions');
    const overlay = document.getElementById('overlay');

    instructions.style.display = 'block';  // Show instructions
    overlay.style.display = 'block';  // Show overlay
});

// Close instructions functionality
document.getElementById('closeInstructions').addEventListener('click', () => {
    const instructions = document.getElementById('instructions');
    const overlay = document.getElementById('overlay');

    instructions.style.display = 'none';  // Hide instructions
    overlay.style.display = 'none';  // Hide overlay
});

// Optional: Close instructions if the overlay is clicked
document.getElementById('overlay').addEventListener('click', () => {
    const instructions = document.getElementById('instructions');
    const overlay = document.getElementById('overlay');

    instructions.style.display = 'none';  // Hide instructions
    overlay.style.display = 'none';  // Hide overlay
});

// Event listener for the Toggle Leaderboard button
const toggleBtn = document.getElementById('toggleLeaderboardButton');
const leaderboard = document.getElementById('leaderboard');

if (toggleBtn && leaderboard) {
    // First remove any existing event listeners
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    newToggleBtn.addEventListener('click', function () {
        leaderboard.style.display =
            leaderboard.style.display === 'none' || leaderboard.style.display === ''
                ? 'block'
                : 'none';
    });

    // Initialize leaderboard as hidden
    leaderboard.style.display = 'none';
}

// Hamburger menu interaction
document.getElementById('hamburger').addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Clear leaderboard functionality
document.getElementById('clearLeaderboard').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all leaderboard data?')) {
        highScores = [];
        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateLeaderboard();
    }
});

// Draw start button
function drawStartButton() {
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonRadius = 30;

    // Create rounded rectangle
    ctx.fillStyle = '#ff4081';  // Button color
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - buttonWidth / 2 + buttonRadius, canvas.height / 2 - buttonHeight / 2); // Move to starting point
    ctx.arcTo(canvas.width / 2 + buttonWidth / 2, canvas.height / 2 - buttonHeight / 2, canvas.width / 2 + buttonWidth / 2, canvas.height / 2 + buttonHeight / 2, buttonRadius);  // Top right corner
    ctx.arcTo(canvas.width / 2 + buttonWidth / 2, canvas.height / 2 + buttonHeight / 2, canvas.width / 2 - buttonWidth / 2, canvas.height / 2 + buttonHeight / 2, buttonRadius);  // Bottom right corner
    ctx.arcTo(canvas.width / 2 - buttonWidth / 2, canvas.height / 2 + buttonHeight / 2, canvas.width / 2 - buttonWidth / 2, canvas.height / 2 - buttonHeight / 2, buttonRadius);  // Bottom left corner
    ctx.arcTo(canvas.width / 2 - buttonWidth / 2, canvas.height / 2 - buttonHeight / 2, canvas.width / 2 + buttonWidth / 2, canvas.height / 2 - buttonHeight / 2, buttonRadius);  // Top left corner
    ctx.closePath();
    ctx.fill();

    // Add shadow for a more fancy look
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Button Text
    ctx.fillStyle = 'white'; // Text color
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START GAME', canvas.width / 2, canvas.height / 2);
    
    // Reset shadow to prevent affecting other drawings
    ctx.shadowColor = 'transparent';
}


// Handle canvas click for start button
canvas.addEventListener('click', (e) => {
    if (!gameStarted) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if click is within start button bounds
        if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
            y >= canvas.height / 2 - 30 && y <= canvas.height / 2 + 30) {
            gameStarted = true;  // Set gameStarted to true to start the game
            lastTime = null; // Reset lastTime to avoid timing issues
            startGame();         // Start the game loop
        }
    }
});

function initGame() {
    // Reset game parameters based on current difficulty
    if (difficulty === 'Easy') {
        fallingSpeed = 1;
        objectCreationInterval = 2500;
    } else if (difficulty === 'Intermediate') {
        fallingSpeed = 1.2;
        objectCreationInterval = 1000;
    } else { // Hard
        fallingSpeed = 3.5;
        objectCreationInterval = 900;
    }

    // Update button text to show current difficulty
    const difficultyButton = document.getElementById('difficultyButton');
    if (difficultyButton) {
        difficultyButton.textContent = `Set Difficulty: ${difficulty}`;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStartButton();  // Draw the start button to begin the game

    // If the game isn't started, keep drawing the start button until it's clicked
    if (!gameStarted) {
        requestAnimationFrame(initGame); // Keep the start button in place
    }
}

// Variable to store touch start position
let touchStartX = 0;

// Touch start event
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevents default touch behavior (like scrolling)
    touchStartX = event.touches[0].clientX; // Get the initial touch X position
});

// Touch move event
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Prevent default touch behavior (like scrolling)
    const touchX = event.touches[0].clientX; // Get current touch X position
    moveBasket(touchX);
});

// Function to update the basket's position
function moveBasket(touchX) {
    const offsetX = touchX - touchStartX; // Calculate the horizontal distance moved
    basket.x += offsetX; // Move the basket based on this distance

    // Prevent the basket from going out of bounds
    if (basket.x < 0) basket.x = 0;
    if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;

    // Update touchStartX for the next touch move event
    touchStartX = touchX;
}

// Handle canvas click for start button (for both Mouse and Touch)
canvas.addEventListener('click', handleStartGameClick);
canvas.addEventListener('touchstart', handleStartGameClick);

function handleStartGameClick(e) {
    e.preventDefault(); // Prevents default behavior (like scrolling)

    let x, y;

    if (e.type === 'click') {
        // For mouse click, get the coordinates
        const rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    } else if (e.type === 'touchstart') {
        // For touchstart, get the touch coordinates
        const rect = canvas.getBoundingClientRect();
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    }

    // Check if the coordinates are within the start button bounds
    if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
        y >= canvas.height / 2 - 30 && y <= canvas.height / 2 + 30) {
        // Start the game
        gameStarted = true;
        startGame();
    }
}

let savedGameState = null;
let animationFrameId = null;

const pauseButton = document.getElementById('pauseButton');

let pauseListenerAdded = false;
let paused = false;

pauseButton.addEventListener('click', () => {
    if (!paused) {
        paused = true;
        pauseButton.textContent = 'Resume';

        // Stop the animation loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else {
        paused = false;
        pauseButton.textContent = 'Pause';

        // Resume the game loop
        lastTime = null;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
});




const closeLossNotificationBtn = document.getElementById('closeLossNotification');
if (!pauseListenerAdded) {
    closeLossNotificationBtn.addEventListener('click', () => {
        const lossNotification = document.getElementById('lossNotification');
        const overlay = document.getElementById('overlay');
        lossNotification.classList.remove('show');
        lossNotification.style.display = 'none';
        overlay.style.display = 'none';
        gameStarted = false;
        gameOver = false; // Reset gameOver flag here
        lossNotificationShown = false; // Reset notification shown flag
        initGame(); // Show start button again
    });
    pauseListenerAdded = true;
}

function resetGame() {
    score = 0;
    objects = [];
    gameOver = false;
    gameStarted = false;
    lastTime = null;
    lossNotificationShown = false;
    savedGameState = null;

    // Cancel animation loop if running
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Reset pause/resume button if needed
    pauseButton.textContent = 'Pause';

    // Hide overlays
    document.getElementById('lossNotification').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    // Reset difficulty
    if (difficulty === 'Easy') {
        fallingSpeed = 1;
        objectCreationInterval = 2500;
    } else if (difficulty === 'Intermediate') {
        fallingSpeed = 1.2;
        objectCreationInterval = 1000;
    } else {
        fallingSpeed = 3.5;
        objectCreationInterval = 900;
    }

    // Show start button again
    initGame();
}

initGame();
