
let dealer_hand = [];
let player_hand = [];
let total_player_wins = 0;
let total_dealer_wins = 0;
let ace_count = 0;
let score = 0;

const new_pack = [
  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣",
  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠"
];
let shuffled_cards = [];


function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function reshuffleDeck() {
  shuffled_cards = [...new_pack];
  shuffleArray(shuffled_cards);
}

function deal() {
  if (shuffled_cards.length === 0) {
    reshuffleDeck();
  }
  const randomIndex = Math.floor(Math.random() * shuffled_cards.length);
  return shuffled_cards[randomIndex];
}


function starting_poker() {
  reshuffleDeck();
  dealer_hand = [];
  player_hand = [];
  
  for (let i = 0; i < 2; i++) {
    let temp_card = deal();
    dealer_hand.push(temp_card);
    const dealerCardIndex = shuffled_cards.indexOf(temp_card);
    if (dealerCardIndex >= 0) shuffled_cards.splice(dealerCardIndex, 1);
    
    temp_card = deal();
    player_hand.push(temp_card);
    const playerCardIndex = shuffled_cards.indexOf(temp_card);
    if (playerCardIndex >= 0) shuffled_cards.splice(playerCardIndex, 1);
  }
  updateUI(true);
}

function give_card_value(card) {
  const cardValue = card.charAt(0);
  if (["J", "Q", "K"].includes(cardValue)) score += 10;
  else if (cardValue == "A") { score += 11; ace_count += 1; }
  else if (cardValue == 1 && card.charAt(1)) {score += 10;}
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


function hit(hand) {
  const new_card = deal();
  if (new_card) {
    hand.push(new_card);
    const cardIndex = shuffled_cards.indexOf(new_card);
    if (cardIndex >= 0) {
      shuffled_cards.splice(cardIndex, 1);
    }
  }
  
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


function showcard(card) {
  const value = card.length > 2 ? card.slice(0,2) : card[0];
  const suit = card.slice(-1);
  const isRed = suit === '♥' || suit === '♦';
  
  return `
    <div class="card ${isRed ? 'card-red' : 'card-black'}">
      <div class="card-corner card-corner-top">${value}${suit}</div>
      <div class="card-suit">${suit}</div>
      <div class="card-corner card-corner-bottom">${value}${suit}</div>
    </div>
  `;
}

function updateUI(hideDealer = true) {
  document.getElementById("player-hand").innerHTML = player_hand.map(showcard).join("");
  document.getElementById("player-score").textContent = Scorecalculation(player_hand);

  if (hideDealer) {
    document.getElementById("dealer-hand").innerHTML = 
      `${showcard(dealer_hand[0])}<div class="card card-back">🂠</div>`;
    document.getElementById("dealer-score").textContent = "?";
  } else {
    document.getElementById("dealer-hand").innerHTML = dealer_hand.map(showcard).join("");
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
    shuffled_cards = [...new_pack];
    shuffleArray(shuffled_cards);
    starting_poker();
  }, 2000);
}


document.getElementById("hit").addEventListener("click", () => hit(player_hand));
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("reset").addEventListener("click", () => starting_poker());

// Start game
starting_poker();