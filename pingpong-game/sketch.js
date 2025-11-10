/*
 * @name Retro Arcade Pong
 * @description A classic two-player Pong game with a clean, wide-screen UI (960x540), 
 * retro arcade aesthetics, and full game logic.
 * Player 1 (Left): W / S keys
 * Player 2 (Right): Up / Down Arrow keys
 */

// --- Game State Variables ---
let gameMode = 'TITLE'; // States: 'TITLE', 'COUNTDOWN', 'RUNNING', 'PAUSED', 'GAME_OVER'
let countdownTimer = 3;
let countdownInterval;

// --- Game Objects ---
let ball, player1, player2;

// --- Score ---
let player1Score = 0;
let player2Score = 0;
const WINNING_SCORE = 5;

// --- Style Constants ---
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FONT_COLOR = '#00FF99'; // Neon Aqua
const ACCENT_COLOR = '#FF0055'; // Neon Red
const BG_COLOR = '#1a1a24';   // Dark retro background

// --- DOM UI Elements ---
let titleDiv, legendDiv, scoreDiv;
let controlBox, startButton, pauseButton, homeButton;

function setup() {
    // 1. Create Main Game Canvas
    let cnv = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    cnv.style('display', 'block');
    cnv.style('margin', '20px auto 0 auto'); 
    cnv.style('box-shadow', '0 0 20px rgba(0,255,153,0.2)');
    
    frameRate(60); // Pong needs a smoother framerate
    noStroke();
    
    // 2. Initialize Styles & UI
    styleBody(); 
    createControlBox(); // The "Box" for buttons
    createOverlays();   // Title, Legend, Score
    
    // 3. Initialize Game Objects
    ball = new Ball();
    player1 = new Paddle(true); // isLeft = true
    player2 = new Paddle(false); // isLeft = false
    
    // 4. Show Title
    showTitleScreen();
    noLoop(); 
}

// --- 🎨 STYLING FUNCTIONS ---

function styleBody() {
    let link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    select('body').style('background-color', BG_COLOR);
    select('body').style('font-family', '"Press Start 2P", monospace');
    select('body').style('color', FONT_COLOR);
    select('body').style('display', 'flex');
    select('body').style('flex-direction', 'column');
    select('body').style('align-items', 'center');
    select('body').style('margin', '0');
}

function createControlBox() {
    controlBox = createDiv('');
    controlBox.style('width', GAME_WIDTH + 'px');
    controlBox.style('background-color', '#111');
    controlBox.style('border', `3px solid ${ACCENT_COLOR}`);
    controlBox.style('padding', '15px');
    controlBox.style('margin-top', '10px');
    controlBox.style('display', 'flex');
    controlBox.style('justify-content', 'center');
    controlBox.style('gap', '20px');
    controlBox.style('box-sizing', 'border-box');
    controlBox.style('min-height', '70px');

    const btnStyle = `
        font-family: "Press Start 2P", monospace;
        font-size: 14px;
        padding: 12px 24px;
        cursor: pointer;
        border: 2px solid ${FONT_COLOR};
        background-color: ${ACCENT_COLOR};
        color: #fff;
        text-transform: uppercase;
        box-shadow: 4px 4px 0px ${FONT_COLOR};
    `;

    startButton = createButton('START GAME');
    startButton.parent(controlBox);
    startButton.style(btnStyle);
    startButton.mousePressed(startGame);

    pauseButton = createButton('PAUSE');
    pauseButton.parent(controlBox);
    pauseButton.style(btnStyle);
    pauseButton.style('background-color', '#333');
    pauseButton.mousePressed(togglePause);
    pauseButton.hide();

    homeButton = createButton('HOME');
    homeButton.parent(controlBox);
    homeButton.style(btnStyle);
    homeButton.style('background-color', FONT_COLOR);
    homeButton.style('color', BG_COLOR);
    homeButton.style('box-shadow', `4px 4px 0px ${ACCENT_COLOR}`);
    homeButton.mousePressed(showTitleScreen);
    homeButton.hide();
}

function createOverlays() {
    // Title Div
    titleDiv = createDiv('P O N G');
    titleDiv.style('position', 'absolute');
    titleDiv.style('width', '100%');
    titleDiv.style('text-align', 'center');
    titleDiv.style('top', '180px');
    titleDiv.style('font-size', '80px');
    titleDiv.style('color', ACCENT_COLOR);
    titleDiv.style('text-shadow', `4px 4px 0px ${FONT_COLOR}`);
    titleDiv.style('pointer-events', 'none');

    // Legend Div
    legendDiv = createDiv(`
        <div style="background:#000; border:2px solid ${FONT_COLOR}; padding:20px; text-align:left; display:inline-block;">
            <p style="color:#fff; margin-bottom:15px;">// CONTROLS //</p>
            <p>PLAYER 1 (LEFT): W / S</p>
            <p>PLAYER 2 (RIGHT): UP / DOWN</p>
            <p>FIRST TO 5 WINS</p>
        </div>
    `);
    legendDiv.style('position', 'absolute');
    legendDiv.style('width', '100%');
    legendDiv.style('text-align', 'center');
    legendDiv.style('top', '320px');
    legendDiv.style('font-size', '12px');
    legendDiv.style('line-height', '1.6');
    legendDiv.style('pointer-events', 'none');
    
    // Score Div
    scoreDiv = createDiv('0 - 0');
    scoreDiv.style('position', 'absolute');
    scoreDiv.style('width', '100%');
    scoreDiv.style('text-align', 'center');
    scoreDiv.style('top', '40px');
    scoreDiv.style('font-size', '50px');
    scoreDiv.style('color', FONT_COLOR);
    scoreDiv.style('text-shadow', `2px 2px 0px ${ACCENT_COLOR}`);
    scoreDiv.style('pointer-events', 'none');
    scoreDiv.hide();
}

// --- 🔄 GAME STATE MANAGEMENT ---

function showTitleScreen() {
    if (countdownInterval) clearInterval(countdownInterval);
    gameMode = 'TITLE';
    
    titleDiv.html('P O N G').show();
    legendDiv.show();
    scoreDiv.hide();
    
    startButton.html('START GAME').show();
    pauseButton.hide();
    homeButton.hide();

    resetGame();
    draw(); // Draw one frame
    noLoop();
}

function startGame() {
    resetGame();
    gameMode = 'COUNTDOWN';
    countdownTimer = 3;
    
    titleDiv.hide();
    legendDiv.hide();
    scoreDiv.show();
    startButton.hide();
    pauseButton.hide();
    homeButton.hide();

    loop(); 

    if (countdownInterval) clearInterval(countdownInterval); 
    countdownInterval = setInterval(() => {
        countdownTimer--;
        if (countdownTimer === 0) {
            clearInterval(countdownInterval);
            countdownInterval = null; 
            gameMode = 'RUNNING'; 
            pauseButton.show();
            homeButton.show();
            ball.serve();
        }
    }, 1000); 
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    updateScore();
    ball.reset();
    player1.reset();
    player2.reset();
}

function togglePause() {
    if (gameMode !== 'RUNNING' && gameMode !== 'PAUSED') return;
    
    if (gameMode === 'RUNNING') {
        gameMode = 'PAUSED';
        pauseButton.html('RESUME');
        noLoop();
    } else if (gameMode === 'PAUSED') {
        gameMode = 'RUNNING';
        pauseButton.html('PAUSE');
        loop();
    }
}

function updateScore() {
    scoreDiv.html(`${player1Score} - ${player2Score}`);
}

function pointScored(player) {
    if (player === 1) {
        player1Score++;
    } else {
        player2Score++;
    }
    updateScore();
    
    if (player1Score === WINNING_SCORE || player2Score === WINNING_SCORE) {
        gameOver();
    } else {
        ball.reset();
        ball.serve();
    }
}

function gameOver() {
    gameMode = 'GAME_OVER';
    noLoop();
    
    let winner = player1Score === WINNING_SCORE ? "PLAYER 1" : "PLAYER 2";
    titleDiv.html(`${winner} WINS!`).show();
    
    startButton.html('PLAY AGAIN').show();
    pauseButton.hide();
    homeButton.show();
}


// --- 🔄 MAIN DRAW LOOP ---

function draw() {
    background(BG_COLOR);
    drawField();
    
    if (gameMode === 'RUNNING') {
        ball.update(player1, player2);
        player1.update();
        player2.update();
        
        ball.draw();
        player1.draw();
        player2.draw();
        
    } else if (gameMode === 'COUNTDOWN') {
        ball.draw();
        player1.draw();
        player2.draw();
        
        fill(FONT_COLOR);
        textAlign(CENTER, CENTER);
        textSize(80);
        text(countdownTimer, width / 2, height / 2);
        
    } else if (gameMode === 'PAUSED') {
        ball.draw();
        player1.draw();
        player2.draw();
        
        fill(0, 0, 0, 150);
        rect(0,0,width,height);
        fill(FONT_COLOR);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("PAUSED", width/2, height/2);
        
    } else if (gameMode === 'TITLE' || gameMode === 'GAME_OVER') {
        ball.draw();
        player1.draw();
        player2.draw();
    }
}

function drawField() {
    stroke(FONT_COLOR);
    strokeWeight(4);
    for (let i = 0; i < height; i += 30) {
        rect(width / 2 - 2, i, 4, 20);
    }
    noStroke();
}

// --- ⌨️ INPUT HANDLING ---

function keyPressed() {
    if (key === ' ') {
        togglePause();
    }
    
    // Player 1 Controls (W/S)
    if (key === 'w' || key === 'W') {
        player1.move(-1);
    } else if (key === 's' || key === 'S') {
        player1.move(1);
    }
    
    // Player 2 Controls (Arrows)
    if (keyCode === UP_ARROW) {
        player2.move(-1);
    } else if (keyCode === DOWN_ARROW) {
        player2.move(1);
    }
}

function keyReleased() {
    // Player 1
    if ((key === 'w' || key === 'W') && player1.speed < 0) {
        player1.move(0);
    } else if ((key === 's' || key === 'S') && player1.speed > 0) {
        player1.move(0);
    }
    
    // Player 2
    if (keyCode === UP_ARROW && player2.speed < 0) {
        player2.move(0);
    } else if (keyCode === DOWN_ARROW && player2.speed > 0) {
        player2.move(0);
    }
}

// --- 🎾 Ball Class ---
class Ball {
    constructor() {
        this.w = 15;
        this.reset();
    }
    
    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.vx = 0;
        this.vy = 0;
    }
    
    serve() {
        this.vx = random() > 0.5 ? 6 : -6;
        this.vy = random(-3, 3);
    }
    
    update(p1, p2) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wall collision (Top/Bottom)
        if (this.y - this.w / 2 < 0) {
            this.y = this.w / 2;
            this.vy *= -1;
        }
        if (this.y + this.w / 2 > height) {
            this.y = height - this.w / 2;
            this.vy *= -1;
        }
        
        // Score detection (Left/Right)
        if (this.x - this.w / 2 < 0) {
            pointScored(2); // Player 2 scores
        }
        if (this.x + this.w / 2 > width) {
            pointScored(1); // Player 1 scores
        }
        
        // Paddle collision
        this.checkPaddleCollision(p1);
        this.checkPaddleCollision(p2);
    }
    
    checkPaddleCollision(paddle) {
        if (this.x + this.w / 2 > paddle.x && 
            this.x - this.w / 2 < paddle.x + paddle.w &&
            this.y + this.w / 2 > paddle.y &&
            this.y - this.w / 2 < paddle.y + paddle.h) {
            
            this.vx *= -1.05; // Reverse direction and speed up
            
            // Calculate bounce angle
            let diff = this.y - (paddle.y + paddle.h / 2);
            this.vy = map(diff, -paddle.h / 2, paddle.h / 2, -5, 5);
        }
    }
    
    draw() {
        fill(FONT_COLOR);
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.w);
        rectMode(CORNER);
    }
}

// --- 🥢 Paddle Class ---
class Paddle {
    constructor(isLeft) {
        this.w = 15;
        this.h = 100;
        this.isLeft = isLeft;
        this.reset();
    }
    
    reset() {
        this.y = height / 2 - this.h / 2;
        this.x = this.isLeft ? 30 : width - 30 - this.w;
        this.speed = 0;
    }
    
    move(dir) {
        this.speed = dir * 8; // Set paddle speed
    }
    
    update() {
        this.y += this.speed;
        
        // Constrain to screen
        this.y = constrain(this.y, 0, height - this.h);
    }
    
    draw() {
        fill(this.isLeft ? FONT_COLOR : ACCENT_COLOR);
        rect(this.x, this.y, this.w, this.h);
    }
}

// Handle window resizing to keep overlays centered
function windowResized() {
    // This is optional but good practice if you expect resize
}