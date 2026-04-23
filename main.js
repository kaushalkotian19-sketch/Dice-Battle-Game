// =========================
// 💰 STATE & STORAGE
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;

// =========================
// 👤 LOGIN & NAVIGATION
// =========================
function handleSimpleLogin() {
    const nameInput = document.getElementById("username-input").value;
    if (!nameInput) {
        alert("Please enter a nickname!");
        return;
    }
    
    localStorage.setItem("username", nameInput);
    document.getElementById("display-username").textContent = nameInput;
    
    // Switch Screens
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

// =========================
// 🎲 BATTLE ENGINE
// =========================
function startBattle(type) {
    const betInput = document.getElementById("bet");
    const bet = Number(betInput.value);
    const resultText = document.querySelector(".result");

    // Validation
    if (bet <= 0 || bet > coins) {
        alert("Invalid bet or insufficient balance!");
        return;
    }

    // Determine Rolls
    let p1Roll;
    if (type === 'berserk') {
        // Berserk Mode: High risk, high reward (1-12 range)
        p1Roll = Math.floor(Math.random() * 12) + 1;
    } else {
        // Standard Mode: 1-6 range (Min 3 if "Loaded" power-up active)
        p1Roll = (activePowerUp === 'loaded') 
            ? Math.floor(Math.random() * 4) + 3 
            : Math.floor(Math.random() * 6) + 1;
    }

    const p2Roll = Math.floor(Math.random() * 6) + 1;

    // Update Visuals
    document.getElementById("dice1").src = `./assets/red-${p1Roll > 6 ? 6 : p1Roll}.png`;
    document.getElementById("dice2").src = `./assets/green-${p2Roll}.png`;
    document.getElementById("score1").textContent = p1Roll;
    document.getElementById("score2").textContent = p2Roll;

    // Handle Results
    if (type === 'berserk' && p1Roll <= 3) {
        // Critical Berserk Fail: Lose 2x the bet
        coins -= (bet * 2);
        resultText.textContent = "💀 BERSERK FAIL! (Lost 2x)";
        winStreak = 0;
    } 
    else if (p1Roll > p2Roll) {
        // Win Logic with Streak Bonus
        winStreak++;
        let multiplier = winStreak >= 3 ? 2 : 1;
        coins += (bet * multiplier);
        resultText.textContent = `VICTORY! +${bet * multiplier}`;
        
        // Level up every 5 wins
        if (winStreak % 5 === 0) {
            currentLevel++;
            alert(`🎉 Level Up! You are now Level ${currentLevel}`);
        }
    } 
    else if (p2Roll > p1Roll) {
        // Loss Logic with Shield Protection
        winStreak = 0;
        let loss = (activePowerUp === 'shield') ? Math.floor(bet / 2) : bet;
        coins -= loss;
        resultText.textContent = activePowerUp === 'shield' ? "🛡️ Shielded Loss!" : "DEFEAT!";
    } 
    else {
        resultText.textContent = "🤝 DRAW!";
    }

    activePowerUp = null; // Power-up used
    updateUI();
}

// =========================
// 🛒 POWER-UP SYSTEM
// =========================
function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) {
        alert("Not enough coins!");
        return;
    }
    coins -= cost;
    activePowerUp = type;
    alert(`🔥 ${type.toUpperCase()} activated for next roll!`);
    updateUI();
}

// =========================
// 🔄 DATA SYNC & UI
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
    // Update all dynamic text elements
    const elements = {
        "coins": coins,
        "coins-game": coins,
        "tokens": tokens,
        "win-streak": winStreak,
        "lvl-num": currentLevel,
        "multiplier": winStreak >= 3 ? "2x 🔥" : "1x"
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.textContent = elements[id];
    }

    // Save state
    localStorage.setItem("coins", coins);
    localStorage.setItem("tokens", tokens);
    localStorage.setItem("level", currentLevel);
}

function logout() {
    localStorage.removeItem("username");
    location.reload(); // Returns to home screen
}

// Initialize listeners
document.getElementById("roll")?.addEventListener("click", () => startBattle('standard'));
document.getElementById("berserk")?.addEventListener("click", () => startBattle('berserk'));

// Initial Load
updateUI();
