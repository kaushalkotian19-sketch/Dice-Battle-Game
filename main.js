// =========================
// 💰 INITIALIZE DATA
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;

// =========================
// 👤 SIMPLE LOGIN SYSTEM
// =========================
function handleSimpleLogin() {
    const nameInput = document.getElementById("username-input").value;
    if (!nameInput) {
        alert("Please enter a name to play!");
        return;
    }
    
    localStorage.setItem("username", nameInput);
    document.getElementById("display-username").textContent = nameInput;
    
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

// =========================
// 🎲 BATTLE LOGIC
// =========================
function startBattle(type) {
    const bet = Number(document.getElementById("bet").value);
    const resultText = document.querySelector(".result");

    if (bet <= 0 || bet > coins) {
        alert("Check your bet amount!");
        return;
    }

    // Roll Logic
    let p1Roll;
    if (type === 'berserk') {
        p1Roll = Math.floor(Math.random() * 12) + 1; // 1-12 range
    } else {
        p1Roll = (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
    }

    const p2Roll = Math.floor(Math.random() * 6) + 1;

    // Visual Update
    document.getElementById("dice1").src = `./assets/red-${p1Roll > 6 ? 6 : p1Roll}.png`;
    document.getElementById("dice2").src = `./assets/green-${p2Roll}.png`;
    document.getElementById("score1").textContent = p1Roll;
    document.getElementById("score2").textContent = p2Roll;

    // Process Result
    if (type === 'berserk' && p1Roll <= 3) {
        coins -= (bet * 2);
        resultText.textContent = "💀 BERSERK FAIL! Lost 2x Bet!";
        winStreak = 0;
    } 
    else if (p1Roll > p2Roll) {
        winStreak++;
        let multiplier = winStreak >= 3 ? 2 : 1;
        coins += (bet * multiplier);
        resultText.textContent = `VICTORY! +${bet * multiplier} coins`;
        if (winStreak % 5 === 0) currentLevel++;
    } 
    else if (p2Roll > p1Roll) {
        winStreak = 0;
        let loss = (activePowerUp === 'shield') ? Math.floor(bet / 2) : bet;
        coins -= loss;
        resultText.textContent = activePowerUp === 'shield' ? "🛡️ Shield Saved You!" : "DEFEAT!";
    } 
    else {
        resultText.textContent = "DRAW!";
    }

    activePowerUp = null;
    updateUI();
}

// =========================
// 🔄 WALLET & UI SYNC
// =========================
function convertToTokens() {
    if (coins < 10) return alert("Need 10 coins!");
    coins -= 10;
    tokens += 1;
    updateUI();
}

function convertToCoins() {
    if (tokens < 1) return alert("No tokens!");
    tokens -= 1;
    coins += 10;
    updateUI();
}

function updateUI() {
    // Sync all coin/token labels
    const ids = ["coins", "coins-game", "win-streak", "lvl-num", "tokens"];
    const values = [coins, coins, winStreak, currentLevel, tokens];
    
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = values[i];
    });

    localStorage.setItem("coins", coins);
    localStorage.setItem("tokens", tokens);
    localStorage.setItem("level", currentLevel);
}

// Attach Event Listeners
document.getElementById("roll")?.addEventListener("click", () => startBattle('standard'));
document.getElementById("berserk")?.addEventListener("click", () => startBattle('berserk'));

updateUI();
