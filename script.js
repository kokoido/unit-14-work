// ===== GAME STATE =====
let dealer_hand = [];
let player_hand = [];
let total_player_wins = 0;
let total_dealer_wins = 0;
let ace_count = 0;
let score = 0;

// ===== CARD DECK =====
const new_pack = [
  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣",
  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠"
];
let shuffled_cards = new_pack;

// ===== CARD FUNCTIONS =====
function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function deal(deck) {
  return deck[Math.floor(Math.random() * deck.length)];
}

// ===== GAME LOGIC =====
function starting_poker() {
  shuffled_cards = new_pack;
  shuffleArray(shuffled_cards);
  dealer_hand = [];
  player_hand = [];
  
  for (let i = 0; i < 2; i++) {
    let temp_card = deal(shuffled_cards);
    dealer_hand.push(temp_card);
    shuffled_cards.splice(shuffled_cards.indexOf(temp_card), 1);
    temp_card = deal(shuffled_cards);
    player_hand.push(temp_card);
    shuffled_cards.splice(shuffled_cards.indexOf(temp_card), 1);
  }
  updateUI(true);
}

function give_card_value(card) {
  const cardValue = card.charAt(0);
  if (["J", "Q", "K"].includes(cardValue)) score += 10;
  else if (cardValue == "A") { score += 11; ace_count += 1; }
  else score += Number(cardValue);
  return score;
}

function ace_calculation() {
  while (ace_count != 0 && score > 21) {
    score -= 10;
    ace_count -= 1;
  }
}

function Scorecalculation(hand) {
  score = 0;
  ace_count = 0;
  let temporary_hand = hand.slice(0);
  for (let i = 0; i < temporary_hand.length; i++) {
    const card = temporary_hand[i];
    give_card_value(card);
  }
  ace_calculation();
  return score;
}

// ===== GAME ACTIONS =====
function hit(hand) {
  const new_card = deal(shuffled_cards);
  hand.push(new_card);
  shuffled_cards.splice(shuffled_cards.indexOf(new_card), 1);
  
  if (hand === player_hand) {
    updateUI(true);
    if (Scorecalculation(player_hand) > 21) setTimeout(stand, 1000);
  } else {
    updateUI(false);
  }
}

function stand() {
  updateUI(false);
  
  // Reveal dealer cards with delay
  let delay = 1000;
  const revealCards = () => {
    if (Scorecalculation(dealer_hand) < 17) {
      hit(dealer_hand);
      setTimeout(revealCards, delay);
    } else {
      check_win();
    }
  };
  
  setTimeout(revealCards, delay);
}

// ===== UI FUNCTIONS =====
function updateUI(hideDealer = true) {
  document.getElementById("player-hand").innerHTML = player_hand.map(card => `<span>${card}</span>`).join(" ");
  document.getElementById("player-score").textContent = Scorecalculation(player_hand);

  if (hideDealer) {
    document.getElementById("dealer-hand").innerHTML = 
      `<span>${dealer_hand[0]}</span> <span class="card-back">🂠</span>`;
    document.getElementById("dealer-score").textContent = "?";
  } else {
    document.getElementById("dealer-hand").innerHTML = dealer_hand.map(card => `<span>${card}</span>`).join(" ");
    document.getElementById("dealer-score").textContent = Scorecalculation(dealer_hand);
  }
}

function check_win() {
  const playerScore = Scorecalculation(player_hand);
  const dealerScore = Scorecalculation(dealer_hand);
  const messageBox = document.getElementById('message-box');
  
  if (playerScore > 21) {
    total_dealer_wins++;
    messageBox.textContent = "Dealer wins!";
  } 
  else if (dealerScore > 21) {
    total_player_wins++;
    messageBox.textContent = "You win!";
  }
  else if (playerScore > dealerScore) {
    total_player_wins++;
    messageBox.textContent = "You win!";
  }
  else if (playerScore < dealerScore) {
    total_dealer_wins++;
    messageBox.textContent = "Dealer wins!";
  }
  else {
    messageBox.textContent = "Push!";
  }

  document.getElementById("player-wins").textContent = total_player_wins;
  document.getElementById("dealer-wins").textContent = total_dealer_wins;
  
  messageBox.style.display = 'block';
  
  setTimeout(() => {
    messageBox.style.display = 'none';
    dealer_hand = [];
    player_hand = [];
    shuffled_cards = new_pack;
    starting_poker();
  }, 2000);
}

// ===== EVENT LISTENERS =====
document.getElementById("hit").addEventListener("click", () => hit(player_hand));
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("reset").addEventListener("click", () => {
  dealer_hand = [];
  player_hand = [];
  shuffled_cards = new_pack;
  starting_poker();
});

// Start game
starting_poker();