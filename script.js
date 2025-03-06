let dealer_hand = [];
let player_hand
let bank_balance = 1000;
const new_pack = [

  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",

  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",

  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣",

  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠"

];

let shuffeled_cards = new_pack;

function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

function deal(deck){
    return deck[Math.floor(Math.random()*deck.length)] //this deas and chooses cards from the deck of cards
};





function starting_poker(){
    let shuffeled_cards = new_pack;
    shuffleArray(shuffeled_cards);
    for (let i = 0; i<2; i++){
        dealer_hand.push(deal(shuffeled_cards));
        shuffele_cards()
        player_hand.push(deal(shuffeled_cards));
};
};





//document.getElementById("player_bank").innerText = "£" + bank_balance ;
