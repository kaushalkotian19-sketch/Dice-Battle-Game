const diceSound = new Audio("./assets/dice.mp3");
const diceBtn = document.querySelector("button");
const dice1 = document.getElementById("dice1");
const dice2 = document.getElementById("dice2");

const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const total1El = document.getElementById("p1-total");
const total2El = document.getElementById("p2-total");

const resultText = document.querySelector(".result");

let total1 = 0;
let total2 = 0;

diceBtn.addEventListener("click", () => {
  diceSound.currentTime = 0;
diceSound.play();
  // random dice (1–6)
  let roll1 = Math.floor(Math.random() * 6) + 1;
  let roll2 = Math.floor(Math.random() * 6) + 1;

  // dice animation
dice1.classList.add("roll");
dice2.classList.add("roll");

// ⚡ SHAKE AFTER animation starts
document.body.classList.add("shake");

setTimeout(() => {
  dice1.classList.remove("roll");
  dice2.classList.remove("roll");

  document.body.classList.remove("shake");
}, 600);
  
  // update dice images based on number
dice1.src = `./assets/red-${roll1}.png`;
dice2.src = `./assets/green-${roll2}.png`;

  // show numbers (temporary text)
  score1El.textContent = roll1;
  score2El.textContent = roll2;

dice1.classList.add("roll");
dice2.classList.add("roll");

setTimeout(() => {
  dice1.classList.remove("roll");
  dice2.classList.remove("roll");
}, 600);
  
  // winner logic
  const player1 = document.querySelector(".player1");
const player2 = document.querySelector(".player2");

// remove old highlight
player1.classList.remove("winner");
player2.classList.remove("winner");

if (roll1 > roll2) {
  player1.classList.add("winner");
} else if (roll2 > roll1) {
  player2.classList.add("winner");
}
  // update totals
  total1El.textContent = total1;
  total2El.textContent = total2;
});
