// run `node index.js` in the terminal

const prompt = require('prompt-sync')();

// Get user input for card suit and rank
let rank = prompt("think of a rank of card... ");
let suit = prompt("now think of the suit for that card... ");

// Combine the inputs into a greeting
let cardpluck = "(draws card) your card is... the " + rank + " of " + suit + "! did i get it right?";

console.log(cardpluck);