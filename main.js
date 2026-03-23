let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;

let level = 1;
const coinsEl = document.getElementById("coins");
const coinsGameEl = document.getElementById("coins-game");
const diceSound = new Audio("./assets/dice.mp3");

const diceBtn = document.getElementById("roll");
const dice1 = document.getElementById("dice1");
const dice2 = document.getElementById("dice2");

const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");

let savedUser = localStorage.getItem("username");

if (savedUser) {
  homeScreen.style.display = "none";
  gameScreen.style.display = "block";
}

startBtn.addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();

if (!name) {
  alert("Enter username");
  return;
}

// check existing users
function checkUsernameFlow() {
  

  if (users[userAddress]) {
    // already registered
    localStorage.setItem("username", users[userAddress]);

    homeScreen.style.display = "none";
    gameScreen.style.display = "block";
  } else {
    const name = prompt("Enter unique username:");

    if (!name) return;

    if (Object.values(users).includes(name)) {
      alert("Username already taken");
      return;
    }

    users[userAddress] = name;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("username", name);

    homeScreen.style.display = "none";
    gameScreen.style.display = "block";
  }
}


const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const total1El = document.getElementById("p1-total");
const total2El = document.getElementById("p2-total");

const resultText = document.querySelector(".result");
const coinContainer = document.getElementById("coin-animation");

let total1 = 0;
let total2 = 0;


if (!coins || isNaN(coins)) {
  coins = 100;
  localStorage.setItem("coins", coins);
}

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

  const bet = Number(document.getElementById("bet").value.trim());
console.log("BET:", bet, "COINS:", coins);
  
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

function logout() {
  localStorage.removeItem("username");

  document.getElementById("home-screen").style.display = "block";
  document.getElementById("game-screen").style.display = "none";
}

function createParticles() {
  const container = document.getElementById("particles");

  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");

    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = (5 + Math.random() * 5) + "s";

    container.appendChild(p);
  }
}

createParticles();

// =========================
// 💼 WALLET SYSTEM
// =========================

async function convertToTokens() {
  if (coins < 10) {
    alert("Need at least 10 coins");
    return;
  }

  coins -= 10;

  // simulate mint (for now)
  tokens += 1;

  updateWallet();

  // optional future: real mint
  addHistory("🔄 Converted 10 coins → 1 token");
}
function convertToCoins() {
  if (tokens < 1) {
    alert("No tokens");
    return;
  }

  tokens -= 1;
  coins += 10;

  updateWallet();
  addHistory("🔄 Converted 1 tokens → 10 coins");
}


function updateWallet() {
  document.getElementById("coins").textContent = coins;

  const cg = document.getElementById("coins-game");
  if (cg) cg.textContent = coins;

  document.getElementById("tokens").textContent = tokens;

  localStorage.setItem("coins", coins);
  localStorage.setItem("tokens", tokens);
}

// =========================
// 🦊 METAMASK CONNECT
// =========================

let provider;
let signer;
let userAddress;

async function connectWallet() {
  if (!window.ethereum) {
    alert("Open inside MetaMask browser");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    userAddress = accounts[0];

    document.getElementById("wallet-address").textContent =
      "Connected: " +
      userAddress.slice(0, 6) +
      "..." +
      userAddress.slice(-4);

    await loadTokenBalance(); // ✅ IMPORTANT

    checkUsernameFlow(); // ✅ new logic (explained below)
  } catch (err) {
    console.log(err);
  }
}
const tokenAddress = "0xYourTestTokenAddress"; // 👈 I will help you get this

const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

let tokenContract;

async function loadTokenBalance() {
  if (!signer) return;

  tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

  const balance = await tokenContract.balanceOf(userAddress);

  const formatted = ethers.utils.formatUnits(balance, 18);

  document.getElementById("tokens").textContent = Math.floor(formatted);
}

async function sendTokens() {
  const to = prompt("Enter receiver address:");
  const amount = prompt("Enter amount:");

  if (!to || !amount) return;

  const tx = await tokenContract.transfer(
    to,
    ethers.utils.parseUnits(amount, 18)
  );

  await tx.wait();

  alert("Transaction Successful 🚀");

  loadTokenBalance();
}
// =========================
// 💸 DEPOSIT / WITHDRAW
// =========================

function deposit() {
  alert("Coming soon: real blockchain deposit 🚀");
}
  coins += amt;
  updateWallet();
  addHistory("💸 Deposited " + amt);
}

function withdraw() {
  const amt = Number(document.getElementById("amount").value);

  if (!amt || amt <= 0) {
    alert("Enter valid amount");
    return;
  }

  if (amt > coins) {
    alert("Not enough balance");
    return;
  }

  coins -= amt;
  updateWallet();
  addHistory("🏧 Withdrawn " + amt);
}

function addHistory(text) {
  const list = document.getElementById("history-list");

  const li = document.createElement("li");
  li.textContent = text;

  list.prepend(li);

  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(text);

  localStorage.setItem("history", JSON.stringify(history));
}

function loadHistory() {
  const list = document.getElementById("history-list");
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

loadHistory();
