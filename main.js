// =========================
// 💰 STORAGE INIT
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;

let level = 1;

// =========================
// 🎯 ELEMENTS
// =========================
const coinsEl = document.getElementById("coins");
const coinsGameEl = document.getElementById("coins-game");

const diceBtn = document.getElementById("roll");
const dice1 = document.getElementById("dice1");
const dice2 = document.getElementById("dice2");

const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");

const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const total1El = document.getElementById("p1-total");
const total2El = document.getElementById("p2-total");

const resultText = document.querySelector(".result");
const coinContainer = document.getElementById("coin-animation");

// =========================
// 🎮 GAME STATE
// =========================
let total1 = 0;
let total2 = 0;

// =========================
// 🦊 WALLET STATE
// =========================
let provider;
let signer;
let userAddress;

// =========================
// 🚀 START BUTTON (DISABLED)
// =========================
startBtn.addEventListener("click", () => {
  alert("⚠️ Please connect wallet first");
});

// =========================
// 🧠 USERNAME SYSTEM (WALLET BASED)
// =========================
function checkUsernameFlow() {
  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[userAddress]) {
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

// =========================
// 🦊 METAMASK CONNECT
// =========================
async function connectWallet() {
  if (!window.ethereum) {
    alert("📱 Open inside MetaMask browser or install MetaMask");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // 🔥 IMPORTANT FIX
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    userAddress = accounts[0];

    document.getElementById("wallet-address").textContent =
      "Connected: " +
      userAddress.slice(0, 6) +
      "..." +
      userAddress.slice(-4);

    await loadTokenBalance();

    checkUsernameFlow();

  } catch (err) {
    console.log(err);
    alert("Wallet connection failed");
  }
}

// =========================
// 🪙 TOKEN SYSTEM (SAFE)
// =========================
const tokenAddress = "0xYourTestTokenAddress";

const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

let tokenContract;

async function loadTokenBalance() {
  if (!signer) return;
  if (!tokenAddress || tokenAddress === "0xYourTestTokenAddress") return;

  tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

  const balance = await tokenContract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, 18);

  document.getElementById("tokens").textContent = Math.floor(formatted);
}

async function sendTokens() {
  if (!tokenContract) {
    alert("Token not ready yet");
    return;
  }

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
// 💰 WALLET (LOCAL)
// =========================
function convertToTokens() {
  if (coins < 10) {
    alert("Need at least 10 coins");
    return;
  }

  coins -= 10;
  tokens += 1;

  updateWallet();
  addHistory("🔄 10 coins → 1 token");
}

function convertToCoins() {
  if (tokens < 1) {
    alert("No tokens");
    return;
  }

  tokens -= 1;
  coins += 10;

  updateWallet();
  addHistory("🔄 1 token → 10 coins");
}

function updateWallet() {
  coinsEl.textContent = coins;

  if (coinsGameEl) coinsGameEl.textContent = coins;

  document.getElementById("tokens").textContent = tokens;

  localStorage.setItem("coins", coins);
  localStorage.setItem("tokens", tokens);
}

// =========================
// 🎲 GAME LOGIC
// =========================
diceBtn.addEventListener("click", () => {

  const bet = Number(document.getElementById("bet").value);

  if (!bet || bet <= 0) {
    alert("Enter valid coins");
    return;
  }

  if (bet > coins) {
    alert("Not enough coins");
    return;
  }

  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;

  dice1.src = `./assets/red-${roll1}.png`;
  dice2.src = `./assets/green-${roll2}.png`;

  score1El.textContent = roll1;
  score2El.textContent = roll2;

  if (roll1 > roll2) {
    resultText.textContent = "🔥 Player 1 Wins!";
    total1++;
    coins += bet;
    showCoins();
  } else if (roll2 > roll1) {
    resultText.textContent = "🔥 Player 2 Wins!";
    total2++;
    coins -= bet;
  } else {
    resultText.textContent = "🤝 Draw!";
  }

  total1El.textContent = total1;
  total2El.textContent = total2;

  updateWallet();
});

// =========================
// 💸 DEPOSIT / WITHDRAW (SAFE)
// =========================
function deposit() {
  alert("Coming soon: real blockchain deposit 🚀");
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

// =========================
// 📜 HISTORY
// =========================
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

// =========================
// ✨ COIN ANIMATION
// =========================
function showCoins() {
  for (let i = 0; i < 6; i++) {
    const coin = document.createElement("div");
    coin.classList.add("coin");
    coin.textContent = "💰";

    coin.style.setProperty("--x", Math.random());
    coin.style.setProperty("--y", Math.random());

    coinContainer.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  }
}

// =========================
// 🚪 LOGOUT
// =========================
function logout() {
  localStorage.removeItem("username");

  homeScreen.style.display = "block";
  gameScreen.style.display = "none";
}
