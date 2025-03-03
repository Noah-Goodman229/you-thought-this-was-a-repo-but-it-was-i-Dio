// run `node madlibs.js` in the terminal

const prompt = require("prompt-sync")(); // Ask for user inputs

let name = prompt("pick a name... ");
let food = prompt("pick a food... ");
let store = prompt("pick a store... ");
let object = prompt("pick an object... ");
let adjective = prompt("pick an adjective... ");
let adverb = prompt("pick an adverb... ");
let famousPerson = prompt("pick a famous person... ");
let bluntObject = prompt("pick a *blunt* object different from the last... ");
let fullstory = name + " was an exsentric fool who loved " + food + " so much, he protested the consumption of it! One day " + name + " went to a " + store + " to do the usual daily protest and met a sentient " + object + " who told him of a great power only found on the roof of the " + store + ". " +name+ " was understandably shaken by the sight of such a " + adjective + " " + object + " so "+name+" beat it unconscious with his protest sign. Afterward he thought about what the "+object+" said and took it apon himself to find the 'great power' the "+object+"spoke of. running into the " + store + " " + adverb + " " + name + " tripped fell and died on a missplaced " +bluntObject+ " and promptly died. He awoke in " + food + " heaven where he met " + famousPerson + " and they played uno for eternity. Fin..."

console.log(fullstory);
