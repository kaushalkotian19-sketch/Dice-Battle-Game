// =========================
// 💰 STATE MANAGEMENT
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null; // 'shield' or 'loaded'

// =========================
// 🎯 UI ELEMENTS
// =========================
const diceBtn = document.getElementById("roll");
const resultText = document.querySelector(".result");
const streakEl = document.getElementById("win-streak");
const multEl = document.getElementById("multiplier");
const levelEl = document.getElementById("lvl-num");

// =========================
// 🦊 WALLET & LOGIN
// =========================
let userAddress;

async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask!");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    document.getElementById("wallet-address").textContent = userAddress.slice(0,6)+"..."+userAddress.slice(-4);
    
    // Auto-enter game
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateWalletUI();
}

// =========================
// 🎲 CORE GAME LOGIC
// =========================
diceBtn.addEventListener("click", () => {
    const bet = Number(document.getElementById("bet").value);

    if (bet <= 0 || bet > coins) return alert("Invalid Bet!");

    // Start Suspense
    diceBtn.disabled = true;
    resultText.textContent = "Rolling...";
    document.getElementById("dice1").classList.add("dice-rolling");
    document.getElementById("dice2").classList.add("dice-rolling");
    document.getElementById("p1-card").classList.remove("win-glow");
    document.getElementById("p2-card").classList.remove("win-glow");

    // SUSPENSE DELAY (600ms)
    setTimeout(() => {
        const roll1 = getRoll();
        const roll2 = Math.floor(Math.random() * 6) + 1;

        // Update Images
        document.getElementById("dice1").src = `./assets/red-${roll1}.png`;
        document.getElementById("dice2").src = `./assets/green-${roll2}.png`;
        document.getElementById("dice1").classList.remove("dice-rolling");
        document.getElementById("dice2").classList.remove("dice-rolling");

        document.getElementById("score1").textContent = roll1;
        document.getElementById("score2").textContent = roll2;

        handleResult(roll1, roll2, bet);
        diceBtn.disabled = false;
    }, 800);
});

function getRoll() {
    if (activePowerUp === 'loaded') {
        activePowerUp = null; // Reset after use
        return Math.floor(Math.random() * 4) + 3; // Min roll 3
    }
    return Math.floor(Math.random() * 6) + 1;
}

function handleResult(p1, p2, bet) {
    if (p1 > p2) {
        winStreak++;
        let multiplier = winStreak >= 3 ? 2 : 1;
        let winAmt = bet * multiplier;
        
        coins += winAmt;
        resultText.textContent = `WINNER! +${winAmt} coins`;
        document.getElementById("p1-card").classList.add("win-glow");
        checkLevelUp();
    } 
    else if (p2 > p1) {
        winStreak = 0;
        let lossAmt = activePowerUp === 'shield' ? Math.floor(bet / 2) : bet;
        coins -= lossAmt;
        resultText.textContent = activePowerUp === 'shield' ? `Shielded! Lost only ${lossAmt}` : "Opponent Wins!";
        document.getElementById("p2-card").classList.add("win-glow");
        activePowerUp = null; 
    } 
    else {
        resultText.textContent = "It's a Draw!";
    }

    updateWalletUI();
}

// =========================
// 🛒 POWER-UPS & PROGRESSION
// =========================
function buyPowerUp(type) {
    const prices = { shield: 20, loaded: 30 };
    if (coins < prices[type]) return alert("Not enough coins!");
    
    coins -= prices[type];
    activePowerUp = type;
    alert(`${type.toUpperCase()} Activated for next roll!`);
    updateWalletUI();
}

function checkLevelUp() {
    // Every 500 coins total might increase level
    if (coins > currentLevel * 200) {
        currentLevel++;
        localStorage.setItem("level", currentLevel);
        alert(`🎉 LEVEL UP! You are now Level ${currentLevel}`);
    }
}

function updateWalletUI() {
    document.getElementById("coins").textContent = coins;
    document.getElementById("coins-game").textContent = coins;
    document.getElementById("tokens").textContent = tokens;
    streakEl.textContent = winStreak;
    multEl.textContent = winStreak >= 3 ? "2x 🔥" : "1x";
    levelEl.textContent = currentLevel;
    
    localStorage.setItem("coins", coins);
}

function logout() {
    location.reload();
}
