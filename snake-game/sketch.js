/*
 * @name Retro Snake (Laptop Version - Final)
 * @description Complete, working Snake game with a 960x540 resolution,
 * clean UI, 3-second countdown, and bug fixes.
 */

// --- Game State Variables ---
let gameMode = 'TITLE'; // States: 'TITLE', 'COUNTDOWN', 'RUNNING', 'PAUSED', 'ENDED'
let gamePaused = false; 

// --- Countdown Variables ---
let countdownTimer = 3;
let countdownInterval;

// --- Core Game Variables ---
let numSegments = 10;
let direction = 'right';

// NEW RESOLUTION: Wide screen format (Laptop friendly)
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const xStart = GAME_WIDTH / 2; 
const yStart = GAME_HEIGHT / 2; 
const diff = 10; 

let xCor = [];
let yCor = [];
let xFruit = 0;
let yFruit = 0;
let xBonusFruit = -1;
let yBonusFruit = -1; 
let bonusFruitTimer = 0; 
const BONUS_FRUIT_DURATION = 90; 
let celebrationEffect = []; 

// --- Style Constants ---
const WALL_PADDING = 20; 
const BRICK_SIZE = 20;
const FONT_COLOR = '#00FF99'; // Neon Aqua
const ACCENT_COLOR = '#FF0055'; // Neon Red
const BG_COLOR = '#1a1a24';   // Dark retro background

// --- DOM UI Elements ---
let scoreElem, bonusTimerElem; 
let titleDiv, legendDiv;
let controlBox, startButton, pauseButton, homeButton;

function setup() {
    // 1. Create Main Game Canvas
    let cnv = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    cnv.style('display', 'block');
    cnv.style('margin', '20px auto 0 auto'); // Center canvas horizontally
    cnv.style('box-shadow', '0 0 20px rgba(0,255,153,0.2)'); // glowing border
    
    frameRate(15);
    noStroke();
    
    // 2. Initialize Styles & UI Containers
    styleBody(); 
    createControlBox(); // The "Box" for buttons
    createOverlays();   // Title, Legend, Score
    
    // 3. Initialize Game State
    initializeGame();
    // Manually call draw once to show the title screen on load
    draw();
    noLoop(); // Wait for user to press Start
}

// --- 🎨 STYLING FUNCTIONS ---

function styleBody() {
    // Load Retro Font
    let link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Apply base styles to page
    select('body').style('background-color', BG_COLOR);
    select('body').style('font-family', '"Press Start 2P", monospace');
    select('body').style('color', FONT_COLOR);
    select('body').style('display', 'flex');
    select('body').style('flex-direction', 'column');
    select('body').style('align-items', 'center');
    select('body').style('margin', '0');
}

function createControlBox() {
    // This is the "Box" that will hold the buttons below the game
    controlBox = createDiv('');
    controlBox.style('width', GAME_WIDTH + 'px');
    controlBox.style('background-color', '#111');
    controlBox.style('border', `3px solid ${ACCENT_COLOR}`);
    controlBox.style('padding', '15px');
    controlBox.style('margin-top', '10px');
    controlBox.style('display', 'flex');
    controlBox.style('justify-content', 'center');
    controlBox.style('gap', '20px'); // Space between buttons
    controlBox.style('box-sizing', 'border-box');

    // Define common button style
    const btnStyle = `
        font-family: "Press Start 2P", monospace;
        font-size: 14px;
        padding: 12px 24px;
        cursor: pointer;
        border: 2px solid ${FONT_COLOR};
        background-color: ${ACCENT_COLOR};
        color: #fff;
        text-transform: uppercase;
        transition: all 0.2s;
        box-shadow: 4px 4px 0px ${FONT_COLOR};
    `;

    // Create Buttons and place them INSIDE the controlBox
    startButton = createButton('START GAME');
    startButton.parent(controlBox); // Put inside box
    startButton.style(btnStyle);
    startButton.mousePressed(startGame);

    pauseButton = createButton('PAUSE');
    pauseButton.parent(controlBox); // Put inside box
    pauseButton.style(btnStyle);
    pauseButton.style('background-color', '#333'); // Different color for operational buttons
    pauseButton.mousePressed(togglePause);
    pauseButton.hide(); // Hidden initially

    homeButton = createButton('HOME');
    homeButton.parent(controlBox); // Put inside box
    homeButton.style(btnStyle);
    homeButton.style('background-color', FONT_COLOR);
    homeButton.style('color', BG_COLOR);
    homeButton.style('box-shadow', `4px 4px 0px ${ACCENT_COLOR}`);
    homeButton.mousePressed(returnToHome);
    homeButton.hide(); // Hidden initially
}

function createOverlays() {
    // Title Screen Text
    titleDiv = createDiv('SNAKE');
    titleDiv.style('position', 'absolute');
    titleDiv.style('width', '100%');
    titleDiv.style('text-align', 'center');
    titleDiv.style('top', '180px'); // Position relative to page top
    titleDiv.style('font-size', '80px');
    titleDiv.style('color', ACCENT_COLOR);
    titleDiv.style('text-shadow', `4px 4px 0px ${FONT_COLOR}`);
    titleDiv.style('pointer-events', 'none'); // Let clicks pass through

    // Legend Text
    legendDiv = createDiv(`
        <div style="background:#000; border:2px solid ${FONT_COLOR}; padding:20px; text-align:left; display:inline-block;">
            <p style="color:#fff; margin-bottom:15px;">// CONTROLS //</p>
            <p>WASD = MOVE</p>
            <p>SPACE = PAUSE</p>
            <br>
            <p><span style="color:#ff0">■</span> +1 POINT</p>
            <p><span style="color:#f0f">■</span> +5 POINTS (BONUS)</p>
        </div>
    `);
    legendDiv.style('position', 'absolute');
    legendDiv.style('width', '100%');
    legendDiv.style('text-align', 'center');
    legendDiv.style('top', '320px');
    legendDiv.style('font-size', '12px');
    legendDiv.style('line-height', '1.6');
    legendDiv.style('pointer-events', 'none');

    // Scoreboard (Top Left of canvas area)
    scoreElem = createDiv('SCORE: 0');
    scoreElem.position(windowWidth/2 - GAME_WIDTH/2 + WALL_PADDING + 10, 45);
    scoreElem.style('color', '#fff');
    scoreElem.style('font-size', '16px');
    scoreElem.style('z-index', '10'); // Ensure it's on top

    // Bonus Timer (Top Right)
    bonusTimerElem = createDiv('');
    bonusTimerElem.position(windowWidth/2 + GAME_WIDTH/2 - 250, 45);
    bonusTimerElem.style('color', ACCENT_COLOR);
    bonusTimerElem.style('font-size', '16px');
    bonusTimerElem.style('text-align', 'right');
    bonusTimerElem.style('width', '200px');
    bonusTimerElem.style('z-index', '10');
}

// --- 🎮 GAME LOGIC ---

function initializeGame() {
    xCor = [];
    yCor = [];
    numSegments = 10;
    direction = 'right';
    for (let i = 0; i < numSegments; i++) {
        // ---
        // 🚨 BUG FIX IS HERE 🚨
        // Was: xCor.push(xStart - (i * diff)); // This spawned the snake colliding with itself
        // Is:
        xCor.push(xStart + (i * diff)); // This spawns the snake correctly
        // ---
        yCor.push(yStart);
    }
    updateFruitCoordinates();
    xBonusFruit = -1;
    yBonusFruit = -1;
    bonusFruitTimer = 0;
    scoreElem.html('SCORE: 0');
    bonusTimerElem.html('');
}

function startGame() {
    initializeGame();
    gameMode = 'COUNTDOWN'; // New state
    gamePaused = false;
    countdownTimer = 3;
    
    // Hide UI
    titleDiv.hide();
    legendDiv.hide();
    startButton.hide();
    pauseButton.hide(); 
    homeButton.hide(); 

    loop(); // Start drawing the countdown

    // Clear any old interval
    if (countdownInterval) clearInterval(countdownInterval); 
    
    // Start a new interval
    countdownInterval = setInterval(() => {
        countdownTimer--;
        if (countdownTimer === 0) {
            clearInterval(countdownInterval);
            countdownInterval = null; // Clear the interval ID
            gameMode = 'RUNNING'; // Start the game!
            pauseButton.show(); // Show buttons now
            homeButton.show();
        }
    }, 1000); // Ticks every 1 second
}

function togglePause() {
    // Prevent pausing during countdown or game over
    if (gameMode !== 'RUNNING' && gameMode !== 'PAUSED') return;
    
    if (gameMode === 'RUNNING') {
        gameMode = 'PAUSED';
        gamePaused = true;
        pauseButton.html('RESUME');
        noLoop();
    } else if (gameMode === 'PAUSED') {
        gameMode = 'RUNNING';
        gamePaused = false;
        pauseButton.html('PAUSE');
        loop();
    }
}

function returnToHome() {
    // Stop the countdown if it's running
    if (countdownInterval) clearInterval(countdownInterval);
    
    gameMode = 'TITLE';
    initializeGame();
    
    // Update UI for Title state
    titleDiv.show();
    titleDiv.html('SNAKE'); // Reset title in case it said "GAME OVER"
    legendDiv.show();
    startButton.show();
    startButton.html('START GAME');
    pauseButton.hide();
    homeButton.hide();
    
    draw(); // Draw one frame to show the title screen background
    noLoop(); // Stop the loop
}

function gameOver() {
    // Stop the countdown if it's running
    if (countdownInterval) clearInterval(countdownInterval);

    gameMode = 'ENDED';
    noLoop();
    
    let finalScore = scoreElem.html().split(':')[1];
    titleDiv.html(`GAME OVER<br><span style="font-size:30px">FINAL SCORE:${finalScore}</span>`);
    titleDiv.show();
    
    startButton.show();
    startButton.html('PLAY AGAIN');
    pauseButton.hide();
    homeButton.show(); // Allow going home from game over
}

// --- 🔄 MAIN DRAW LOOP ---

function draw() {
    background(BG_COLOR);
    drawWalls();
    
    if (gameMode === 'RUNNING') {
        drawCelebrationEffect();
        drawSnake();
        moveSnake();
        checkCollisions();
        checkForFruit();
        checkForBonusFruit();
    } else if (gameMode === 'COUNTDOWN') {
        // Draw the snake in its starting position (but don't move it)
        drawSnake(); 
        // Draw the countdown timer on top
        fill(FONT_COLOR);
        textAlign(CENTER, CENTER);
        textSize(80);
        text(countdownTimer, width / 2, height / 2);
    } else if (gameMode === 'PAUSED') {
        drawSnake(); // Keep showing snake while paused
        // Draw transparent overlay
        fill(0, 0, 0, 150);
        rect(0,0,width,height);
        // Draw "PAUSED" text
        fill(FONT_COLOR);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("PAUSED", width/2, height/2);
    } else if (gameMode === 'TITLE' || gameMode === 'ENDED') {
        // Just draw the walls, the DOM elements handle the rest
    }
}

// --- 🧱 DRAWING HELPERS ---

function drawWalls() {
    // Outer wall boundary
    stroke(ACCENT_COLOR);
    strokeWeight(4);
    noFill();
    rect(WALL_PADDING, WALL_PADDING, width - WALL_PADDING*2, height - WALL_PADDING*2);
    noStroke();

    // Decorative Bricks
    fill(30, 30, 40);
    for(let x = 0; x < width; x += BRICK_SIZE) {
        rect(x, 0, BRICK_SIZE-2, WALL_PADDING-2);
        rect(x, height-WALL_PADDING, BRICK_SIZE-2, WALL_PADDING-2);
    }
    for(let y = 0; y < height; y += BRICK_SIZE) {
        rect(0, y, WALL_PADDING-2, BRICK_SIZE-2);
        rect(width-WALL_PADDING, y, WALL_PADDING-2, BRICK_SIZE-2);
    }
}

function drawSnake() {
    for (let i = 0; i < numSegments; i++) {
        // Gradient snake color
        let segColor = lerpColor(color(FONT_COLOR), color(0, 150, 100), i / numSegments);
        fill(segColor);
        rect(xCor[i] - diff/2, yCor[i] - diff/2, diff, diff); // Use squares for retro
    }
    // White eyes on head to show direction
    fill(255);
    let headX = xCor[numSegments - 1];
    let headY = yCor[numSegments - 1];
    
    // Draw eyes based on direction
    if (direction === 'right') {
        rect(headX, headY - 3, 2, 2);
        rect(headX, headY + 1, 2, 2);
    } else if (direction === 'left') {
        rect(headX - 2, headY - 3, 2, 2);
        rect(headX - 2, headY + 1, 2, 2);
    } else if (direction === 'up') {
        rect(headX - 3, headY - 2, 2, 2);
        rect(headX + 1, headY - 2, 2, 2);
    } else if (direction === 'down') {
        rect(headX - 3, headY, 2, 2);
        rect(headX + 1, headY, 2, 2);
    }
}

// --- ⚙️ MECHANICS ---

function moveSnake() {
    for (let i = 0; i < numSegments - 1; i++) {
        xCor[i] = xCor[i + 1];
        yCor[i] = yCor[i + 1];
    }
    let headIndex = numSegments - 1;
    let neckIndex = numSegments - 2;

    switch (direction) {
        case 'right':
            xCor[headIndex] = xCor[neckIndex] + diff;
            yCor[headIndex] = yCor[neckIndex];
            break;
        case 'up':
            xCor[headIndex] = xCor[neckIndex];
            yCor[headIndex] = yCor[neckIndex] - diff;
            break;
        case 'left':
            xCor[headIndex] = xCor[neckIndex] - diff;
            yCor[headIndex] = yCor[neckIndex];
            break;
        case 'down':
            xCor[headIndex] = xCor[neckIndex];
            yCor[headIndex] = yCor[neckIndex] + diff;
            break;
    }
}

function checkCollisions() {
    const headX = xCor[numSegments - 1];
    const headY = yCor[numSegments - 1];

    // Wall Collision (Added tolerance for 'diff')
    if (headX >= width - WALL_PADDING - (diff/2) || headX <= WALL_PADDING + (diff/2) ||
        headY >= height - WALL_PADDING - (diff/2) || headY <= WALL_PADDING + (diff/2)) {
        gameOver();
    }

    // Self Collision
    for (let i = 0; i < numSegments - 2; i++) {
        if (xCor[i] === headX && yCor[i] === headY) {
            gameOver();
        }
    }
}

function checkForFruit() {
    fill(255, 255, 0);
    // Pulsing fruit
    rect(xFruit - (diff/2), yFruit - (diff/2), diff, diff); // Square fruit

    if (dist(xCor[numSegments-1], yCor[numSegments-1], xFruit, yFruit) < diff) {
        scoreElem.html('SCORE: ' + (parseInt(scoreElem.html().split(':')[1]) + 1));
        xCor.unshift(xCor[0]);
        yCor.unshift(yCor[0]);
        numSegments++;
        triggerCelebration(xFruit, yFruit, color(255,255,0));
        updateFruitCoordinates();
        
        // Bonus chance
        if (parseInt(scoreElem.html().split(':')[1]) % 10 === 0) spawnBonusFruit();
    }
}

function checkForBonusFruit() {
    if (xBonusFruit !== -1) {
        bonusFruitTimer++;
        let timeLeft = floor((BONUS_FRUIT_DURATION - bonusFruitTimer)/15); // approx seconds
        bonusTimerElem.html('BONUS TIME: ' + timeLeft);
        
        fill(255, 0, 255);
        let bonusSize = diff + sin(frameCount * 0.8) * 5; // Fast pulse
        rect(xBonusFruit - (bonusSize/2), yBonusFruit - (bonusSize/2), bonusSize, bonusSize);

        if (dist(xCor[numSegments-1], yCor[numSegments-1], xBonusFruit, yBonusFruit) < diff) {
             scoreElem.html('SCORE: ' + (parseInt(scoreElem.html().split(':')[1]) + 5));
             // Grow 5 times
             for(let k=0; k<5; k++) { xCor.unshift(xCor[0]); yCor.unshift(yCor[0]); numSegments++; }
             triggerCelebration(xBonusFruit, yBonusFruit, color(255,0,255));
             resetBonus();
        }
        if (bonusFruitTimer > BONUS_FRUIT_DURATION) resetBonus();
    }
}

function resetBonus() {
    xBonusFruit = -1;
    yBonusFruit = -1;
    bonusFruitTimer = 0;
    bonusTimerElem.html('');
}

function updateFruitCoordinates() {
    xFruit = floor(random((WALL_PADDING+diff)/diff, (width-WALL_PADDING-diff)/diff)) * diff;
    yFruit = floor(random((WALL_PADDING+diff)/diff, (height-WALL_PADDING-diff)/diff)) * diff;
}

function spawnBonusFruit() {
    xBonusFruit = floor(random((WALL_PADDING+diff)/diff, (width-WALL_PADDING-diff)/diff)) * diff;
    yBonusFruit = floor(random((WALL_PADDING+diff)/diff, (height-WALL_PADDING-diff)/diff)) * diff;
    bonusFruitTimer = 0;
}

function triggerCelebration(x, y, col) {
    for(let i=0; i<10; i++) {
        celebrationEffect.push({x, y, vx:random(-5,5), vy:random(-5,5), life:255, col});
    }
}

function drawCelebrationEffect() {
    for(let i=celebrationEffect.length-1; i>=0; i--) {
        let p = celebrationEffect[i];
        fill(red(p.col), green(p.col), blue(p.col), p.life);
        rect(p.x, p.y, 4, 4); // square particles
        p.x += p.vx; p.y += p.vy; p.life -= 10;
        if(p.life <= 0) celebrationEffect.splice(i,1);
    }
}

function keyPressed() {
    // Stop spacebar from triggering pause during countdown/title
    if (key === ' ' && (gameMode === 'RUNNING' || gameMode === 'PAUSED')) {
        togglePause();
    }

    if (gameMode === 'RUNNING' && !gamePaused) {
        if ((key === 'w' || key === 'W') && direction !== 'down') direction = 'up';
        if ((key === 's' || key === 'S') && direction !== 'up') direction = 'down';
        if ((key === 'a' || key === 'A') && direction !== 'right') direction = 'left';
        if ((key === 'd' || key === 'D') && direction !== 'left') direction = 'right';
    }
}
// Handle window resizing to keep overlays centered
function windowResized() {
    scoreElem.position(windowWidth/2 - GAME_WIDTH/2 + WALL_PADDING + 10, 45);
    bonusTimerElem.position(windowWidth/2 + GAME_WIDTH/2 - 250, 45);
}