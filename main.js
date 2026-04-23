// =========================
// 💰 INITIALIZE DATA
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;

// =========================
// 👤 LOGIN SYSTEM
// =========================
function handleSimpleLogin() {
    const nameInput = document.getElementById("username-input").value;
    if (!nameInput) return alert("Please enter a nickname!");
    
    localStorage.setItem("username", nameInput);
    document.getElementById("display-username").textContent = nameInput;
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

// =========================
// 🎲 BATTLE ENGINE
// =========================
function startBattle(type) {
    const bet = Number(document.getElementById("bet").value);
    const resultText = document.querySelector(".result");
    const p1Card = document.getElementById("p1-card");
    const p2Card = document.getElementById("p2-card");

    if (bet <= 0 || bet > coins) return alert("Check your bet amount!");

    // Clear previous Winning Glows
    p1Card.classList.remove("winner-glow");
    p2Card.classList.remove("winner-glow");

    // Logic for Rolls
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
        resultText.textContent = "💀 BERSERK FAIL! Lost 2x!";
        winStreak = 0;
        p2Card.classList.add("winner-glow");
    } 
    else if (p1Roll > p2Roll) {
        winStreak++;
        let multiplier = winStreak >= 3 ? 2 : 1;
        coins += (bet * multiplier);
        resultText.textContent = `VICTORY! +${bet * multiplier}`;
        p1Card.classList.add("winner-glow");
        if (winStreak % 5 === 0) currentLevel++;
    } 
    else if (p2Roll > p1Roll) {
        winStreak = 0;
        let loss = (activePowerUp === 'shield') ? Math.floor(bet / 2) : bet;
        coins -= loss;
        resultText.textContent = activePowerUp === 'shield' ? "🛡️ Shield Saved You!" : "DEFEAT!";
        p2Card.classList.add("winner-glow");
    } 
    else {
        resultText.textContent = "🤝 DRAW!";
    }

    activePowerUp = null;
    updateUI();
}

// =========================
// 🛒 SHOP & UI SYNC
// =========================
function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) return alert("Not enough coins!");
    coins -= cost;
    activePowerUp = type;
    alert(`${type.toUpperCase()} activated!`);
    updateUI();
}

function updateUI() {
    const ids = ["coins", "coins-game", "win-streak", "lvl-num", "tokens", "multiplier"];
    const values = [coins, coins, winStreak, currentLevel, tokens, (winStreak >= 3 ? "2x 🔥" : "1x")];
    
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = values[i];
    });

    localStorage.setItem("coins", coins);
    localStorage.setItem("tokens", tokens);
    localStorage.setItem("level", currentLevel);
}

function logout() { location.reload(); }

document.getElementById("roll")?.addEventListener("click", () => startBattle('standard'));
document.getElementById("berserk")?.addEventListener("click", () => startBattle('berserk'));

updateUI();
