// Audio manager for game sound effects
const audioManager = {
    sounds: {
        deal: new Audio('sounds/dealing.mp3'),
        win: new Audio('sounds/player wins.mp3'),
        lose: new Audio('sounds/player lose.mp3'),
        click: new Audio('sounds/button clicking.mp3'),
        bet: new Audio('sounds/betting.mp3')
    },
    // Play a sound by its name
    play(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => console.log('Audio playback failed:', error));
        }
    }
};

// Game state variables to track progress and scores
let deck = [];
let playerHand = [];
let dealerHand = [];
let currentBet = 0;
let bank = 500;
let games = 0;
let wins = 0;
let totalLosses = 0;
let totalGains = 0;
let highestBank = 500;

// Initialize the game state
function initializeGame() {
    createDeck();
    shuffleDeck();
    updateStats();
    enableBetting();
}

// Create a new deck of 52 cards
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Deal a card from the deck
function dealCard() {
    audioManager.play('deal');
    return deck.pop();
}

// Calculate the total value of a hand
function calculateHand(hand) {
    let sum = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === 'A') {
            aces += 1;
            sum += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            sum += 10;
        } else {
            sum += parseInt(card.value);
        }
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces -= 1;
    }

    return sum;
}

// Setup event listeners for game buttons
function setupEventListeners() {
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', () => placeBet(parseInt(btn.dataset.amount)));
    });

    document.getElementById('hit-btn').addEventListener('click', hit);
    document.getElementById('stand-btn').addEventListener('click', stand);
    document.getElementById('double-btn').addEventListener('click', double);
}

// Place a bet and start the round
async function placeBet(amount) {
    audioManager.play('bet');
    if (bank >= amount) {
        currentBet = amount;
        bank -= amount;
        document.getElementById('current-bet').textContent = currentBet;
        document.getElementById('bank').textContent = bank;
        document.querySelector('.betting-buttons').style.display = 'none';
        updateStats();
        setTimeout(() => {
            startRound();
        }, 500);
    }
}

// Start a new round of blackjack
async function startRound() {
    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];
    dealerHand[0].revealed = false;
    updateUI(true);
    disableBetting();

    const playerScore = calculateHand(playerHand);

    if (playerScore === 21) {
        await showMessage('Blackjack! You win!');
        bank += currentBet * 2.5;
        wins++;
        totalGains += currentBet * 1.5;
        games++;
        updateStats();
        setTimeout(resetRound, 2000);
        return;
    }

    document.querySelector('.game-buttons').classList.add('active');
    enableGameButtons();
}

// Handle player's hit action
async function hit() {
    playerHand.push(dealCard());
    updateUI();
    
    const playerScore = calculateHand(playerHand);
    if (playerScore === 21) {
        await stand();
    } else if (playerScore > 21) {
        await new Promise(resolve => setTimeout(resolve, 750));
        await endRound();
    }
}

// Handle player's stand action
async function stand() {
    const dealerFirstCard = document.querySelector('#dealer-cards .card');
    if (dealerFirstCard && dealerFirstCard.classList.contains('back')) {
        dealerFirstCard.classList.add('flip');
        await new Promise(resolve => setTimeout(resolve, 300));
        dealerFirstCard.textContent = `${dealerHand[0].value}${dealerHand[0].suit}`;
        dealerFirstCard.style.color = ['♥', '♦'].includes(dealerHand[0].suit) ? 'red' : 'black';
        dealerFirstCard.classList.remove('back');
        dealerHand[0].revealed = true;
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    updateUI(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let dealerScore = calculateHand(dealerHand);
    const playerScore = calculateHand(playerHand);
    
    while (dealerScore < 17 && dealerScore < playerScore) {
        dealerHand.push(dealCard());
        updateUI(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        dealerScore = calculateHand(dealerHand);
    }
    await endRound();
}

// Handle player's double down action
async function double() {
    if (bank >= currentBet) {
        bank -= currentBet;
        currentBet *= 2;
        document.getElementById('current-bet').textContent = currentBet;
        playerHand.push(dealCard());
        updateUI();
        updateStats();
        await stand();
    }
}

// End the current round and determine winner
async function endRound() {
    disableGameButtons();
    document.querySelector('.game-buttons').classList.remove('active');
    
    dealerHand.forEach(card => card.revealed = true);
    updateUI(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const playerScore = calculateHand(playerHand);
    const dealerScore = calculateHand(dealerHand);
    
    let result = 'lose';
    let message = '';
    
    if (playerScore > 21) {
        result = 'lose';
        message = 'Bust! You lose!';
    } else if (dealerScore > 21) {
        result = 'win';
        message = 'Dealer busts! You win!';
    } else if (playerScore === dealerScore) {
        result = 'push';
        message = 'Push! It's a tie!';
    } else {
        result = playerScore > dealerScore ? 'win' : 'lose';
        message = result === 'win' ? 'You win!' : 'Dealer wins!';
    }

    await new Promise(resolve => setTimeout(resolve, 750));
    await showMessage(message);

    await new Promise(resolve => setTimeout(resolve, 500));
    if (result === 'win') {
        bank += currentBet * 2;
        wins++;
        totalGains += currentBet;
    } else if (result === 'push') {
        bank += currentBet;
    }
    if (result === 'lose') {
        totalLosses += currentBet;
    }
    games++;
    updateStats();

    if (bank > highestBank) {
        highestBank = bank;
    }

    if (bank === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const resetGame = confirm('Game Over! Your highest bank amount was £' + highestBank + '. Click OK to reset.');
        if (resetGame) {
            bank = 500;
            games = 0;
            wins = 0;
            totalLosses = 0;
            totalGains = 0;
            highestBank = 500;
            updateStats();
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    await resetRound();
}

// Reset the game table for a new round
async function resetRound() {
    const cards = document.querySelectorAll('.card');
    const fadeOutPromises = Array.from(cards).map(card => {
        return new Promise(resolve => {
            card.style.transition = 'transform 0.5s, opacity 0.5s';
            card.style.transform = 'scale(0)';
            card.style.opacity = '0';
            card.addEventListener('transitionend', resolve, { once: true });
        });
    });
    
    await Promise.all(fadeOutPromises);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('player-cards').innerHTML = '';
    
    if (deck.length < 10) {
        createDeck();
        shuffleDeck();
    }
    
    currentBet = 0;
    playerHand = [];
    dealerHand = [];
    
    document.getElementById('current-bet').textContent = '0';
    document.getElementById('dealer-score').textContent = '0';
    document.getElementById('player-score').textContent = '0';
    
    document.querySelector('.betting-buttons').style.display = 'block';
    enableBetting();
    
    updateUI();
    
    await new Promise(resolve => setTimeout(resolve, 300));
}

// Display game messages with animations
async function showMessage(text) {
    if (text.includes('win')) {
        audioManager.play('win');
    } else if (text.includes('lose') || text.includes('Bust')) {
        audioManager.play('lose');
    }
    await new Promise(resolve => setTimeout(resolve, 750));
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message';
    messageDiv.textContent = text;
    document.querySelector('.game-container').appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2000);
}

// Update the game UI with current state
function updateUI(hideFirstDealerCard = true) {
    document.getElementById('dealer-score').textContent = 
        hideFirstDealerCard ? '?' : calculateHand(dealerHand);
    document.getElementById('player-score').textContent = 
        calculateHand(playerHand);
    
    updateCardDisplay('dealer-cards', dealerHand);
    updateCardDisplay('player-cards', playerHand);
}

// Update the card display on the game table
async function updateCardDisplay(elementId, hand) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    for (let index = 0; index < hand.length; index++) {
        const card = hand[index];
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (elementId === 'dealer-cards' && index === 0 && hand.length === 2 && !dealerHand[0].revealed) {
            cardElement.classList.add('back');
        } else {
            cardElement.textContent = `${card.value}${card.suit}`;
            cardElement.style.color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
        }
        
        container.appendChild(cardElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        requestAnimationFrame(() => cardElement.classList.add('dealt'));
    }
}

// Update game statistics display
function updateStats() {
    document.getElementById('bank').textContent = bank;
    document.getElementById('win-rate').textContent = 
        games ? Math.round((wins / games) * 100) : 0;
    document.getElementById('losses').textContent = totalLosses;
    document.getElementById('gains').textContent = totalGains;
}

// Enable betting buttons
function enableBetting() {
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.disabled = false;
    });
}

// Disable betting buttons
function disableBetting() {
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.disabled = true;
    });
}

// Enable game action buttons
function enableGameButtons() {
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('double-btn').disabled = false;
}

// Disable game action buttons
function disableGameButtons() {
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    document.getElementById('double-btn').disabled = true;
}

// Initialize the game
initializeGame();
setupEventListeners();
