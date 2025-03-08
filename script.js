let dealer_hand = [];
let player_hand = [];
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
        var temp_card = deal(shuffled_cards)
        dealer_hand.push(temp_card1);
        shuffled_cards.splice(shuffled_cards.indexof(temp_card), 1)
        var temp_card = deal(shuffled_cards)
        player_hand.push(temp_card1);
        shuffled_cards.splice(shuffled_cards.indexof(temp_card), 1)
};
};

function give_card_value(card) {
    var card = card.charAt(0);
    if (["J", "Q", "K"].includes(card)){
        score += 10;
    }else if (card == "A"){
        score += 11
        ace_count += 1
    }else {
        score += Number(card);
    }
    return score;
}


function ace_calculation(){
    while (ace_count != 0 && score > 21){
        score -= 10
        ace_count -= 1
    }
}




//document.getElementById("player_bank").innerText = "£" + bank_balance ;
