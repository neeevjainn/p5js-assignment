/*
 * @name Brick Wall Enhanced Snake Game
 * @description An enhanced version of the classic Snake game featuring a detailed brick-patterned wall, WASD controls, improved graphics, and a bonus fruit that appears every 10 points.
 * Modified by Gemini.
 */

// --- Global Variables ---
let numSegments = 10;
let direction = 'right';

const xStart = 50; 
const yStart = 250; 
const diff = 10; 
let snakeColor;
let fruitColor;
let bonusFruitColor; // New color for bonus
let celebrationEffect = []; 

let xCor = [];
let yCor = [];

let xFruit = 0;
let yFruit = 0;

let xBonusFruit = -1; // -1 means no bonus fruit is active
let yBonusFruit = -1; 
let bonusFruitTimer = 0; // Timer to track how long the bonus fruit is active
const BONUS_FRUIT_DURATION = 90; // Bonus fruit lasts for 90 frames (6 seconds at 15fps)

let scoreElem;
let bonusTimerElem; // New element to show bonus timer

// --- Constants for Walls ---
const WALL_PADDING = 30; 
const BRICK_SIZE = 15; // Size of the brick rectangle

function setup() {
    // 🎨 Color Setup
    snakeColor = color(50, 200, 50); 
    fruitColor = color(255, 255, 0); 
    bonusFruitColor = color(255, 100, 255); // Vibrant Pink/Magenta

    // 🖼️ Canvas and Rate Setup
    createCanvas(500, 500);
    frameRate(15);
    
    // 📜 Score and Timer Elements
    scoreElem = createDiv('Score = 0');
    scoreElem.position(WALL_PADDING, WALL_PADDING - 20); 
    scoreElem.style('color', 'white');
    scoreElem.style('font-size', '16px');

    bonusTimerElem = createDiv('');
    bonusTimerElem.position(width - 150, WALL_PADDING - 20); 
    bonusTimerElem.style('color', bonusFruitColor.toString()); // Match bonus fruit color
    bonusTimerElem.style('font-size', '16px');

    // Initialize Snake position
    updateFruitCoordinates();
    for (let i = 0; i < numSegments; i++) {
        xCor.push(xStart + i * diff);
        yCor.push(yStart);
    }
}

function draw() {
    background(20); 
    drawWalls();

    // Draw the Snake as connected circles
    noStroke();
    fill(snakeColor);
    for (let i = 0; i < numSegments; i++) {
        circle(xCor[i], yCor[i], diff);
    }
    // Draw the Head 
    fill(255); 
    circle(xCor[numSegments - 1], yCor[numSegments - 1], diff);

    updateSnakeCoordinates();
    checkGameStatus();
    checkForFruit();
    checkForBonusFruit(); // New function call
    drawCelebrationEffect();
}

// --- Drawing and Wall Logic ---

/**
 * Draws a boundary around the playing area with a brick texture.
 */
function drawWalls() {
    noStroke();
    
    // Brick Color 1 (Mortar) - Background
    fill(50); 
    rect(0, 0, width, WALL_PADDING); // Top
    rect(0, height - WALL_PADDING, width, WALL_PADDING); // Bottom
    rect(0, WALL_PADDING, WALL_PADDING, height - 2 * WALL_PADDING); // Left
    rect(width - WALL_PADDING, WALL_PADDING, WALL_PADDING, height - 2 * WALL_PADDING); // Right

    // Brick Color 2 - The Bricks
    fill(100, 50, 50); // Dark Red/Brown Brick Color
    
    // Draw Bricks for Top and Bottom Walls
    for (let x = 0; x < width; x += BRICK_SIZE * 2) {
        // Top Row
        rect(x, 0, BRICK_SIZE, WALL_PADDING);
        rect(x + BRICK_SIZE, 0, BRICK_SIZE, WALL_PADDING / 2); // Staggered half-brick
        rect(x + BRICK_SIZE, WALL_PADDING / 2, BRICK_SIZE, WALL_PADDING / 2); // Staggered half-brick
        
        // Bottom Row
        rect(x, height - WALL_PADDING, BRICK_SIZE, WALL_PADDING);
    }
    
    // Draw Bricks for Left and Right Walls
    for (let y = WALL_PADDING; y < height - WALL_PADDING; y += BRICK_SIZE * 2) {
        // Left Column
        rect(0, y, WALL_PADDING, BRICK_SIZE);
        // Right Column
        rect(width - WALL_PADDING, y, WALL_PADDING, BRICK_SIZE);
    }
    
    // Draw the inner game area boundary 
    stroke(100); 
    strokeWeight(2);
    noFill();
    rect(WALL_PADDING, WALL_PADDING, width - WALL_PADDING * 2, height - WALL_PADDING * 2);

    noStroke();
}

// --- Game Logic Functions (Unchanged from previous response) ---
function updateSnakeCoordinates() {
    for (let i = 0; i < numSegments - 1; i++) {
        xCor[i] = xCor[i + 1];
        yCor[i] = yCor[i + 1];
    }
    switch (direction) {
        case 'right':
            xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
            yCor[numSegments - 1] = yCor[numSegments - 2];
            break;
        case 'up':
            xCor[numSegments - 1] = xCor[numSegments - 2];
            yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
            break;
        case 'left':
            xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
            yCor[numSegments - 1] = yCor[numSegments - 2];
            break;
        case 'down':
            xCor[numSegments - 1] = xCor[numSegments - 2];
            yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
            break;
    }
}

function checkGameStatus() {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];

    const hitWall = (
        snakeHeadX >= width - WALL_PADDING ||
        snakeHeadX <= WALL_PADDING ||
        snakeHeadY >= height - WALL_PADDING ||
        snakeHeadY <= WALL_PADDING
    );

    if (hitWall || checkSnakeCollision()) {
        noLoop();
        const scoreVal = parseInt(scoreElem.html().substring(8));
        scoreElem.html('<span style="color:red; font-weight:bold;">Game Over!</span> Score: ' + scoreVal);
        bonusTimerElem.html('');
    }
}

function checkSnakeCollision() {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];
    for (let i = 0; i < xCor.length - 2; i++) { 
        if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
            return true;
        }
    }
    return false;
}

// --- Fruit and Bonus Logic ---

/**
 * Draws the regular fruit and checks for consumption.
 */
function checkForFruit() {
    // 🍎 Draw the Fruit - Pulsing Yellow
    fill(fruitColor);
    const fruitSize = diff * 0.8 + sin(frameCount * 0.3) * 2; 
    circle(xFruit, yFruit, fruitSize);

    // Check for consumption
    if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
        triggerCelebrationEffect(xFruit, yFruit);
        
        const prevScore = parseInt(scoreElem.html().substring(8));
        const newScore = prevScore + 1;
        scoreElem.html('Score = ' + newScore);
        
        // Bonus Fruit Check!
        if (newScore % 10 === 0 && newScore !== 0) {
            spawnBonusFruit();
        }

        // Grow and Move
        xCor.unshift(xCor[0]);
        yCor.unshift(yCor[0]);
        numSegments++;
        updateFruitCoordinates();
    }
}

/**
 * Handles drawing, timing, and checking for the bonus fruit.
 */
function checkForBonusFruit() {
    if (xBonusFruit !== -1) {
        // 🌟 Draw the Bonus Fruit - Flashing Pink
        fill(bonusFruitColor);
        const bonusSize = diff * 1.2 + sin(frameCount * 0.6) * 3; // Larger and faster flash
        circle(xBonusFruit, yBonusFruit, bonusSize);

        // Update Timer
        bonusFruitTimer++;
        const timeLeft = ceil((BONUS_FRUIT_DURATION - bonusFruitTimer) / frameRate());
        bonusTimerElem.html(`BONUS: ${timeLeft}s`);

        // Check for consumption (Bonus Fruit)
        if (xCor[xCor.length - 1] === xBonusFruit && yCor[yCor.length - 1] === yBonusFruit) {
            triggerCelebrationEffect(xBonusFruit, yBonusFruit);
            
            // +5 points for bonus fruit
            const prevScore = parseInt(scoreElem.html().substring(8));
            scoreElem.html('Score = ' + (prevScore + 5)); 
            
            // Grow the snake significantly
            for (let i = 0; i < 5; i++) {
                xCor.unshift(xCor[0]);
                yCor.unshift(yCor[0]);
            }
            numSegments += 5;

            // Reset Bonus Fruit
            xBonusFruit = -1;
            yBonusFruit = -1;
            bonusFruitTimer = 0;
            bonusTimerElem.html('');
            return; 
        }

        // Check if time ran out
        if (bonusFruitTimer > BONUS_FRUIT_DURATION) {
            xBonusFruit = -1;
            yBonusFruit = -1;
            bonusFruitTimer = 0;
            bonusTimerElem.html('');
        }
    }
}

/**
 * Spawns the bonus fruit in a new, valid coordinate.
 */
function spawnBonusFruit() {
    let newX, newY;
    do {
        newX = generateValidCoordinate(width);
        newY = generateValidCoordinate(height);
    } while (isCoordinateOnSnake(newX, newY) || (newX === xFruit && newY === yFruit)); // Ensure it's not on snake or regular fruit
    
    xBonusFruit = newX;
    yBonusFruit = newY;
    bonusFruitTimer = 0; // Start timer
}

function updateFruitCoordinates() {
    let newX, newY;
    do {
        newX = generateValidCoordinate(width);
        newY = generateValidCoordinate(height);
    } while (isCoordinateOnSnake(newX, newY)); // Ensure it's not on the snake

    xFruit = newX;
    yFruit = newY;
}

function generateValidCoordinate(dimension) {
    const minCoord = WALL_PADDING + diff;
    const maxCoord = dimension - WALL_PADDING - diff;
    return floor(random(minCoord / diff, maxCoord / diff)) * diff;
}

function isCoordinateOnSnake(x, y) {
    for (let i = 0; i < numSegments; i++) {
        if (xCor[i] === x && yCor[i] === y) {
            return true;
        }
    }
    return false;
}

// --- Celebration and Input Functions (Unchanged) ---
function triggerCelebrationEffect(x, y) {
    for (let i = 0; i < 15; i++) { 
        celebrationEffect.push({
            x: x,
            y: y,
            vx: random(-3, 3), 
            vy: random(-3, 3), 
            life: 255, 
            c: color(random(255), random(255), random(255)) 
        });
    }
}

function drawCelebrationEffect() {
    for (let i = celebrationEffect.length - 1; i >= 0; i--) {
        let p = celebrationEffect[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 15; 
        p.c.setAlpha(p.life);
        fill(p.c);
        circle(p.x, p.y, 5);
        if (p.life < 0) {
            celebrationEffect.splice(i, 1);
        }
    }
}

function keyPressed() {
    switch (key) {
        case 'a': 
        case 'A':
            if (direction !== 'right') {
                direction = 'left';
            }
            break;
        case 'd': 
        case 'D':
            if (direction !== 'left') {
                direction = 'right';
            }
            break;
        case 'w': 
        case 'W':
            if (direction !== 'down') {
                direction = 'up';
            }
            break;
        case 's': 
        case 'S':
            if (direction !== 'up') {
                direction = 'down';
            }
            break;
    }
}