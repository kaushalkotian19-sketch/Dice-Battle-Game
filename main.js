// =========================
// 💰 STATE & STORAGE INIT
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;
let userAddress = null;

// =========================
// 🔊 AUDIO SYSTEM
// =========================
const sounds = {
    roll: new Audio('./audio/roll.mp3'),
    win: new Audio('./audio/win.mp3'),
    lose: new Audio('./audio/lose.mp3'),
    fail: new Audio('./audio/fail.mp3')
};

// =========================
// 🦊 METAMASK CONNECT
// =========================
async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert("Please open in MetaMask / Trust Wallet browser");
            return;
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];

        document.getElementById("wallet-address").textContent = 
            "Connected: " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

        // Hide home, show game
        document.getElementById("home-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        
        updateUI();
    } catch (err) {
        console.error("Wallet Error:", err);
    }
}

// =========================
// 🎲 BATTLE ENGINE
// =========================
const diceBtnStandard = document.getElementById("roll");
const diceBtnBerserk = document.getElementById("berserk");
const resultText = document.querySelector(".result");

if(diceBtnStandard) diceBtnStandard.addEventListener("click", () => startBattle('standard'));
if(diceBtnBerserk) diceBtnBerserk.addEventListener("click", () => startBattle('berserk'));

async function startBattle(type) {
    const betInput = document.getElementById("bet");
    const bet = Number(betInput.value);

    if (bet <= 0 || bet > coins) {
        alert("Check your bet amount or balance!");
        return;
    }

    // Play roll sound
    sounds.roll.currentTime = 0;
    sounds.roll.play().catch(() => {});

    // Lock UI
    toggleButtons(true);
    resultText.textContent = type === 'berserk' ? "🔥 BERSERK MODE! 🔥" : "Rolling...";

    const d1 = document.getElementById("dice1");
    const d2 = document.getElementById("dice2");
    d1.classList.add("dice-rolling");
    d2.classList.add("dice-rolling");

    setTimeout(() => {
        d1.classList.remove("dice-rolling");
        d2.classList.remove("dice-rolling");

        // Logic for Player Roll
        let roll1;
        if (type === 'berserk') {
            roll1 = Math.floor(Math.random() * 12) + 1; 
        } else {
            roll1 = (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
        }

        const roll2 = Math.floor(Math.random() * 6) + 1;

        // Update Images (Capped at 6 for visual assets)
        d1.src = `./assets/red-${roll1 > 6 ? 6 : roll1}.png`;
        d2.src = `./assets/green-${roll2}.png`;

        document.getElementById("score1").textContent = roll1;
        document.getElementById("score2").textContent = roll2;

        handleResult(roll1, roll2, bet, type);
        toggleButtons(false);
    }, 1000);
}

// =========================
// 🏆 RESULT PROCESSING
// =========================
function handleResult(p1, p2, bet, type) {
    const p1Card = document.getElementById("p1-card");
    const p2Card = document.getElementById("p2-card");

    if (type === 'berserk' && p1 <= 3) {
        coins -= (bet * 2);
        resultText.textContent = "💀 CRITICAL FAIL! (Lost 2x)";
        sounds.fail.play();
        winStreak = 0;
    } 
    else if (p1 > p2) {
        winStreak++;
        let bonus = winStreak >= 3 ? 2 : 1; 
        coins += (bet * bonus);
        resultText.textContent = `VICTORY! +${bet * bonus}`;
        sounds.win.play();
        p1Card.classList.add("win-glow");
        if (winStreak % 5 === 0) currentLevel++;
    } 
    else if (p2 > p1) {
        winStreak = 0;
        let loss = (activePowerUp === 'shield') ? Math.floor(bet / 2) : bet;
        coins -= loss;
        resultText.textContent = (activePowerUp === 'shield') ? "🛡️ Shielded Loss!" : "DEFEATED!";
        sounds.lose.play();
        p2Card.classList.add("win-glow");
    } 
    else {
        resultText.textContent = "🤝 DRAW!";
    }

    activePowerUp = null;
    updateUI();

    setTimeout(() => {
        p1Card.classList.remove("win-glow");
        p2Card.classList.remove("win-glow");
    }, 2000);
}

// =========================
// 🛒 POWER-UP SHOP
// =========================
function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) {
        alert("Not enough coins!");
        return;
    }
    coins -= cost;
    activePowerUp = type;
    alert(`${type.toUpperCase()} activated!`);
    updateUI();
}

// =========================
// 🔄 UI SYNC
// =========================
function updateUI() {
    const coinEls = [document.getElementById("coins"), document.getElementById("coins-game")];
    coinEls.forEach(el => { if(el) el.textContent = coins; });
    
    document.getElementById("win-streak").textContent = winStreak;
    document.getElementById("multiplier").textContent = winStreak >= 3 ? "2x 🔥" : "1x";
    document.getElementById("lvl-num").textContent = currentLevel;

    localStorage.setItem("coins", coins);
    localStorage.setItem("level", currentLevel);
}

function toggleButtons(disabled) {
    if(diceBtnStandard) diceBtnStandard.disabled = disabled;
    if(diceBtnBerserk) diceBtnBerserk.disabled = disabled;
}

function logout() {
    location.reload();
}

// Initial UI Sync
updateUI();
