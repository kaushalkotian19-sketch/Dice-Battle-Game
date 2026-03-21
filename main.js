localStorage.clear();
let level = 1;
const coinsEl = document.getElementById("coins");
const diceSound = new Audio("./assets/dice.mp3");

const diceBtn = document.getElementById("roll");
const dice1 = document.getElementById("dice1");
const dice2 = document.getElementById("dice2");

const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const total1El = document.getElementById("p1-total");
const total2El = document.getElementById("p2-total");

const resultText = document.querySelector(".result");
const coinContainer = document.getElementById("coin-animation");

let total1 = 0;
let total2 = 0;
let savedCoins = parseInt(localStorage.getItem("coins"));
let coins = isNaN(savedCoins) ? 100 : savedCoins;

// 💰 Coin animation
function showCoins() {
  for (let i = 0; i < 8; i++) {
    const coin = document.createElement("div");
    coin.classList.add("coin");
    coin.textContent = "💰";

    coin.style.setProperty("--x", Math.random());
    coin.style.setProperty("--y", Math.random());

    coinContainer.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  }
}

diceBtn.addEventListener("click", () => {

  const bet = parseInt(document.getElementById("bet").value);

  // ✅ VALIDATION (ONLY ONCE)
  if (!bet || bet <= 0) {
    alert("Enter valid coins");
    return;
  }

  if (bet > coins) {
    alert("Not enough coins");
    return;
  }

  // 🔊 sound
  diceSound.currentTime = 0;
diceSound.play().catch(() => {}); // prevent crash

// vibration (SAFE)
if (navigator.vibrate) {
  navigator.vibrate(200);
}
  // 🎲 roll
  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;

  // 🎬 animation
  dice1.classList.add("roll");
  dice2.classList.add("roll");
  document.body.classList.add("shake");

  setTimeout(() => {
    dice1.classList.remove("roll");
    dice2.classList.remove("roll");
    document.body.classList.remove("shake");
  }, 500);

  // 🎲 update images
  dice1.src = `./assets/red-${roll1}.png`;
  dice2.src = `./assets/green-${roll2}.png`;

  score1El.textContent = roll1;
  score2El.textContent = roll2;

  const player1 = document.querySelector(".player1");
  const player2 = document.querySelector(".player2");

  player1.classList.remove("winner");
  player2.classList.remove("winner");

  // 🏆 result logic
  if (roll1 > roll2) {
    player1.classList.add("winner");
    if (navigator.vibrate) {
  navigator.vibrate([100, 50, 200]);
    }
    resultText.textContent = "🔥 Player 1 Wins!";
    total1++;
    coins += bet;

    showCoins();

  } else if (roll2 > roll1) {
    player2.classList.add("winner");
    if (navigator.vibrate) {
  navigator.vibrate([100, 50, 200]);
    }
    resultText.textContent = "🔥 Player 2 Wins!";
    total2++;
    coins -= bet;

  } else {
    resultText.textContent = "🤝 Draw!";
  }

  // 🔁 result animation refresh
  resultText.classList.remove("result");
setTimeout(() => {
  resultText.classList.add("result");
}, 10);

  // 📊 update UI
  total1El.textContent = total1;
  total2El.textContent = total2;
  coinsEl.textContent = "💰 Coins: " + coins;

  // 💾 SAVE coins (ADD THIS LINE HERE)
localStorage.setItem("coins", coins);

  // 🏆 LEVEL SYSTEM (ADD HERE)
level = Math.floor(coins / 100) + 1;
document.title = "Level " + level + " | Dice Game";
});
