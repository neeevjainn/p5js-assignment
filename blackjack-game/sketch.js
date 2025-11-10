/*
 * @name Retro Arcade Blackjack
 * @description A full Blackjack game with a clean, wide-screen UI (960x540), 
 * retro arcade aesthetics, and full betting and game logic.
 */

// --- Game State Variables ---
let gameMode = 'TITLE'; // States: 'TITLE', 'BETTING', 'PLAYING', 'DEALER_TURN', 'ROUND_OVER'
let deck = [];
let playerHand = [];
let dealerHand = [];

let playerBank = 500;
let currentBet = 0;

let playerScore = 0;
let dealerScore = 0;

// --- Style Constants ---
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FONT_COLOR = '#00FF99'; // Neon Aqua
const ACCENT_COLOR = '#FF0055'; // Neon Red
const BG_COLOR = '#1a1a24';   // Dark retro background
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

// --- DOM UI Elements ---
let titleDiv, messageDiv, bankElem, betElem, playerScoreElem, dealerScoreElem;
let controlBox;
// Buttons
let startButton, bet10Button, bet50Button, dealButton, hitButton, standButton, nextRoundButton, restartButton;

function setup() {
    // 1. Create Main Game Canvas
    let cnv = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    cnv.style('display', 'block');
    cnv.style('margin', '20px auto 0 auto'); 
    cnv.style('box-shadow', '0 0 20px rgba(0,255,153,0.2)');
    
    frameRate(15);
    noStroke();
    
    // 2. Initialize Styles & UI
    styleBody(); 
    createControlBox(); // The "Box" for buttons
    createOverlays();   // Title, Messages, Scores
    
    // 3. Initialize Game State
    showTitleScreen();
    noLoop(); // Wait for user to press Start
}

// --- 🎨 STYLING FUNCTIONS ---

function styleBody() {
    // Load Retro Font
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
    controlBox.style('min-height', '70px'); // Ensure box doesn't shrink

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
    
    // Create all buttons, then hide/show them as needed
    startButton = createButton('START');
    startButton.parent(controlBox);
    startButton.style(btnStyle);
    startButton.mousePressed(startGame);

    bet10Button = createButton('BET 10');
    bet10Button.parent(controlBox);
    bet10Button.style(btnStyle);
    bet10Button.mousePressed(() => placeBet(10));

    bet50Button = createButton('BET 50');
    bet50Button.parent(controlBox);
    bet50Button.style(btnStyle);
    bet50Button.mousePressed(() => placeBet(50));

    dealButton = createButton('DEAL');
    dealButton.parent(controlBox);
    dealButton.style(btnStyle);
    dealButton.style('background-color', FONT_COLOR); // Highlight
    dealButton.style('color', BG_COLOR);
    dealButton.mousePressed(dealHand);

    hitButton = createButton('HIT');
    hitButton.parent(controlBox);
    hitButton.style(btnStyle);
    hitButton.mousePressed(playerHit);

    standButton = createButton('STAND');
    standButton.parent(controlBox);
    standButton.style(btnStyle);
    standButton.mousePressed(playerStand);

    nextRoundButton = createButton('NEXT ROUND');
    nextRoundButton.parent(controlBox);
    nextRoundButton.style(btnStyle);
    nextRoundButton.mousePressed(startBetting);
    
    restartButton = createButton('PLAY AGAIN');
    restartButton.parent(controlBox);
    restartButton.style(btnStyle);
    restartButton.mousePressed(showTitleScreen);
}

function createOverlays() {
    // Title Div
    titleDiv = createDiv('BLACKJACK');
    titleDiv.style('position', 'absolute');
    titleDiv.style('width', '100%');
    titleDiv.style('text-align', 'center');
    titleDiv.style('top', '180px');
    titleDiv.style('font-size', '80px');
    titleDiv.style('color', ACCENT_COLOR);
    titleDiv.style('text-shadow', `4px 4px 0px ${FONT_COLOR}`);
    titleDiv.style('pointer-events', 'none');

    // Message Div (for game status)
    messageDiv = createDiv('WELCOME TO THE ARCADE');
    messageDiv.style('position', 'absolute');
    messageDiv.style('width', '100%');
    messageDiv.style('text-align', 'center');
    messageDiv.style('top', '300px');
    messageDiv.style('font-size', '20px');
    messageDiv.style('color', '#FFFF00'); // Yellow for status
    messageDiv.style('pointer-events', 'none');

    // Bank and Bet Divs (Bottom of canvas)
    bankElem = createDiv('BANK: ' + playerBank);
    bankElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, GAME_HEIGHT - 40);
    bankElem.style('font-size', '16px');

    betElem = createDiv('BET: ' + currentBet);
    betElem.position(windowWidth/2 + GAME_WIDTH/2 - 150, GAME_HEIGHT - 40);
    betElem.style('font-size', '16px');
    
    // Score Divs (Next to hands)
    dealerScoreElem = createDiv('');
    dealerScoreElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, 100);
    dealerScoreElem.style('font-size', '20px');
    dealerScoreElem.style('color', ACCENT_COLOR);
    
    playerScoreElem = createDiv('');
    playerScoreElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, 350);
    playerScoreElem.style('font-size', '20px');
    playerScoreElem.style('color', FONT_COLOR);
}

// --- 🔄 GAME STATE MANAGEMENT ---

function showTitleScreen() {
    gameMode = 'TITLE';
    playerBank = 500;
    currentBet = 0;
    
    titleDiv.show();
    messageDiv.html('PRESS START TO PLAY').show();
    bankElem.hide();
    betElem.hide();
    playerScoreElem.hide();
    dealerScoreElem.hide();

    startButton.show();
    bet10Button.hide();
    bet50Button.hide();
    dealButton.hide();
    hitButton.hide();
    standButton.hide();
    nextRoundButton.hide();
    restartButton.hide();

    draw(); // Draw one frame
    noLoop();
}

function startGame() {
    createDeck();
    shuffleDeck();
    startBetting();
}

function startBetting() {
    gameMode = 'BETTING';
    currentBet = 0;
    playerHand = [];
    dealerHand = [];
    
    // Check if deck is low
    if (deck.length < 15) {
        createDeck();
        shuffleDeck();
        messageDiv.html('SHUFFLING NEW DECK...');
    } else {
        messageDiv.html('PLACE YOUR BET');
    }

    titleDiv.hide();
    
    bankElem.html('BANK: ' + playerBank).show(); 
    betElem.html('BET: ' + currentBet).show();
    playerScoreElem.hide();
    dealerScoreElem.hide();
    
    startButton.hide();
    bet10Button.show();
    bet50Button.show();
    dealButton.show();
    hitButton.hide();
    standButton.hide();
    nextRoundButton.hide();
    restartButton.hide();
    
    dealButton.attribute('disabled', ''); // Disable until a bet is placed
    
    loop(); // Start loop to draw empty table
}

function dealHand() {
    if (currentBet === 0) return;
    
    gameMode = 'PLAYING';
    
    // Deal two cards to each
    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    
    updateScores();
    
    messageDiv.html('PLAYER\'S TURN');
    bet10Button.hide();
    bet50Button.hide();
    dealButton.hide();
    hitButton.show();
    standButton.show();
    
    // Check for immediate Blackjack
    if (playerScore === 21) {
        messageDiv.html('BLACKJACK! YOU WIN!');
        endRound('win_blackjack');
    }
}

function playerHit() {
    playerHand.push(dealCard());
    updateScores();
    
    if (playerScore > 21) {
        messageDiv.html('PLAYER BUSTS!');
        endRound('lose');
    }
}

function playerStand() {
    gameMode = 'DEALER_TURN';
    hitButton.hide();
    standButton.hide();
    messageDiv.html('DEALER\'S TURN');
    
    // Use interval to create a delay for dealer's turns
    let dealerInterval = setInterval(() => {
        updateScores();
        if (dealerScore < 17) {
            dealerHand.push(dealCard());
            draw(); // Force redraw
        } else {
            clearInterval(dealerInterval);
            determineWinner();
        }
    }, 1000); // 1-second delay per dealer hit
}

function endRound(result) {
    gameMode = 'ROUND_OVER';
    
    // Calculate winnings
    if (result === 'win' || result === 'dealer_bust') {
        playerBank += currentBet * 2;
    } else if (result === 'win_blackjack') {
        playerBank += currentBet * 2.5; // Blackjack pays 3:2
    } else if (result === 'push') {
        playerBank += currentBet; // Get bet back
    }
    // On 'lose', bank is already reduced from the bet
    
    currentBet = 0;
    bankElem.html('BANK: ' + playerBank);
    
    hitButton.hide();
    standButton.hide();
    
    if (playerBank === 0) {
        messageDiv.html('GAME OVER! YOU ARE OUT OF MONEY!');
        restartButton.show();
    } else {
        nextRoundButton.show();
    }
}

// --- 🃏 CARD & DECK LOGIC ---

function createDeck() {
    deck = [];
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            let value = 0;
            if (['J', 'Q', 'K'].includes(rank)) {
                value = 10;
            } else if (rank === 'A') {
                value = 11; // Handle 1 or 11 logic in calculateScore
            } else {
                value = parseInt(rank);
            }
            deck.push({ suit, rank, value });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
    }
}

function dealCard() {
    return deck.pop();
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    
    for (let card of hand) {
        score += card.value;
        if (card.rank === 'A') {
            aceCount++;
        }
    }
    
    // Adjust for Aces
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
    
    playerScoreElem.html('PLAYER: ' + playerScore).show();
    
    // Hide dealer's score during player's turn if not over
    if (gameMode === 'PLAYING') {
        dealerScoreElem.html('DEALER: ?').show();
    } else {
        dealerScoreElem.html('DEALER: ' + dealerScore).show();
    }
}

function determineWinner() {
    updateScores(); // Reveal final dealer score
    
    if (dealerScore > 21) {
        messageDiv.html('DEALER BUSTS! YOU WIN!');
        endRound('dealer_bust');
    } else if (playerScore > dealerScore) {
        messageDiv.html('PLAYER WINS!');
        endRound('win');
    } else if (dealerScore > playerScore) {
        messageDiv.html('DEALER WINS!');
        endRound('lose');
    } else {
        messageDiv.html('PUSH! (TIE)');
        endRound('push');
    }
}

// --- 💵 BETTING LOGIC ---

function placeBet(amount) {
    if (amount <= playerBank) {
        playerBank -= amount;
        currentBet += amount;
        bankElem.html('BANK: ' + playerBank);
        // ---
        // 🚨 THIS IS THE FIXED LINE 🚨
        // ---
        betElem.html('BET: ' + currentBet); 
        dealButton.removeAttribute('disabled'); // Enable Deal button
    } else {
        messageDiv.html('NOT ENOUGH MONEY!');
    }
}

// --- 🔄 MAIN DRAW LOOP ---

function draw() {
    background(BG_COLOR);
    
    if (gameMode !== 'TITLE') {
        // Draw Dealer's Hand
        drawHand(dealerHand, 100, gameMode === 'PLAYING');
        
        // Draw Player's Hand
        drawHand(playerHand, 350, false);
    }
}

// --- 🖌️ DRAWING HELPERS ---

function drawHand(hand, yPos, hideFirstCard) {
    let handWidth = hand.length * (CARD_WIDTH + 10) - 10;
    let startX = (GAME_WIDTH - handWidth) / 2;
    
    for (let i = 0; i < hand.length; i++) {
        let xPos = startX + i * (CARD_WIDTH + 10);
        let card = hand[i];
        
        if (i === 0 && hideFirstCard) {
            drawCardBack(xPos, yPos);
        } else {
            drawCard(xPos, yPos, card);
        }
    }
}

function drawCard(x, y, card) {
    // Card face
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(x, y, CARD_WIDTH, CARD_HEIGHT, 5);
    
    // Determine color
    if (['♥', '♦'].includes(card.suit)) {
        fill(ACCENT_COLOR);
    } else {
        fill(0);
    }
    
    noStroke();
    textAlign(CENTER, CENTER);
    
    // Rank
    textSize(24);
    text(card.rank, x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 - 10);
    
    // Suit
    textSize(30);
    text(card.suit, x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 25);
}

function drawCardBack(x, y) {
    // Card back
    fill('#333');
    stroke(ACCENT_COLOR);
    strokeWeight(4);
    rect(x, y, CARD_WIDTH, CARD_HEIGHT, 5);
    
    // Simple retro design
    fill(FONT_COLOR);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text("P5", x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2);
}

// Handle window resizing to keep overlays centered
function windowResized() {
    bankElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, GAME_HEIGHT - 40);
    betElem.position(windowWidth/2 + GAME_WIDTH/2 - 150, GAME_HEIGHT - 40);
    dealerScoreElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, 100);
    playerScoreElem.position(windowWidth/2 - GAME_WIDTH/2 + 30, 350);
}