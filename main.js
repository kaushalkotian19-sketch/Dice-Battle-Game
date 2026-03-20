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
  // random dice (1–6)
  let roll1 = Math.floor(Math.random() * 6) + 1;
  let roll2 = Math.floor(Math.random() * 6) + 1;

  // update dice images
  dice1.src = `./assets/red-dice.png`;
  dice2.src = `./assets/green-dice.png`;

  // show numbers (temporary text)
  score1El.textContent = roll1;
  score2El.textContent = roll2;

dice1.classList.add("roll");
dice2.classList.add("roll");

setTimeout(() => {
  dice1.classList.remove("roll");
  dice2.classList.remove("roll");
}, 500);
  
  // winner logic
  if (roll1 > roll2) {
    total1++;
    resultText.textContent = "🔥 Player 1 Wins!";
  } else if (roll2 > roll1) {
    total2++;
    resultText.textContent = "🔥 Player 2 Wins!";
  } else {
    resultText.textContent = "🤝 Draw!";
  }

  // update totals
  total1El.textContent = total1;
  total2El.textContent = total2;
});
