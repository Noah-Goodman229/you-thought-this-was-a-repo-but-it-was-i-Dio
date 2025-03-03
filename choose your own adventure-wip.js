// run `node choose your own adventure-wip.js` in the terminal

const prompt = require("prompt-sync")(); // ask for user inputs

// game state variables
let playerName = "-placeHolder-";
let keyFound = false;
let inventory = [];
let location = "house"; // starting location
let gameOver = false;

//very start of opening
function startGame() {
    playerName = prompt("Welcome to the Lost Rabbit Adventure! What's your name?");
    console.log(`Hello, ${playerName}! Your pet rabbit, Flopsy, has gone missing! It's time to find them.`);
    gameLoop();
    }