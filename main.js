// =========================
// 💰 STATE & STORAGE INIT
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;

// =========================
// 🔊 AUDIO SYSTEM
// =========================
// Ensure these files exist in your /audio/ folder
const sounds = {
    roll: new Audio('./audio/roll.mp3'),
    win: new Audio('./audio/win.mp3'),
    lose: new Audio('./audio/lose.mp3'),
    fail: new Audio('./audio/fail.mp3') // Sound for Berserk Critical Fail
};

// =========================
// 🎯 UI ELEMENTS
// =========================
const coinsGameEl = document.getElementById("coins-game");
const resultText = document.querySelector(".result");
const diceBtnStandard = document.getElementById("roll");
const diceBtnBerserk = document.getElementById("berserk");

// =========================
// 🎲 BATTLE ENGINE
// =========================
diceBtnStandard.addEventListener("click", () => startBattle('standard'));
diceBtnBerserk.addEventListener("click", () => startBattle('berserk'));

async function startBattle(type) {
    const betInput = document.getElementById("bet");
    const bet = Number(betInput.value);

    // Validation
    if (bet <= 0 || bet > coins) {
        alert("Check your bet amount or balance!");
        return;
    }

    // Play roll sound immediately (Browser interaction requirement)
    sounds.roll.currentTime = 0;
    sounds.roll.play().catch(() => console.log("Audio waiting for user click"));

    // Lock UI during animation
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
            roll1 = Math.floor(Math.random() * 12) + 1; // 1-12 range
        } else {
            // Apply 'Loaded' power-up logic: 1-6 range, but minimum 3
            roll1 = (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
        }

        const roll2 = Math.floor(Math.random() * 6) + 1; // Opponent always 1-6

        // Update Dice Images (Note: assets only go up to 6, so we cap visual for 7-12)
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

    // 1. Critical Fail (Berserk Only)
    if (type === 'berserk' && p1 <= 3) {
        coins -= (bet * 2);
        resultText.textContent = "💀 CRITICAL FAIL! (Lost 2x)";
        sounds.fail.play();
        p2Card.classList.add("win-glow");
        winStreak = 0;
    } 
    // 2. Player Victory
    else if (p1 > p2) {
        winStreak++;
        let bonus = winStreak >= 3 ? 2 : 1; // 2x payout on 3+ streak
        coins += (bet * bonus);
        resultText.textContent = `VICTORY! +${bet * bonus}`;
        sounds.win.play();
        p1Card.classList.add("win-glow");
        checkLevelUp();
    } 
    // 3. Player Defeat
    else if (p2 > p1) {
        winStreak = 0;
        // Shield power-up reduces loss by 50%
        let loss = (activePowerUp === 'shield') ? Math.floor(bet / 2) : bet;
        coins -= loss;
        resultText.textContent = (activePowerUp === 'shield') ? "🛡️ Shielded! Small loss." : "DEFEATED!";
        sounds.lose.play();
        p2Card.classList.add("win-glow");
    } 
    // 4. Draw
    else {
        resultText.textContent = "🤝 DRAW! Coins returned.";
    }

    activePowerUp = null; // Power-up used
    updateUI();

    // Remove glows after 2 seconds
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
    alert(`${type.toUpperCase()} activated for next roll!`);
    updateUI();
}

// =========================
// 📈 LEVEL SYSTEM
// =========================
function checkLevelUp() {
    if (winStreak > 0 && winStreak % 5 === 0) {
        currentLevel++;
        alert(`🎉 LEVEL UP! You are now Level ${currentLevel}`);
    }
}

// =========================
// 🔄 UTILITIES & UI SYNC
// =========================
function updateUI() {
    // Sync coins across all elements
    if (coinsGameEl) coinsGameEl.textContent = coins;
    document.getElementById("win-streak").textContent = winStreak;
    document.getElementById("multiplier").textContent = winStreak >= 3 ? "2x 🔥" : "1x";
    document.getElementById("lvl-num").textContent = currentLevel;

    // Save to LocalStorage
    localStorage.setItem("coins", coins);
    localStorage.setItem("level", currentLevel);
}

function toggleButtons(disabled) {
    diceBtnStandard.disabled = disabled;
    diceBtnBerserk.disabled = disabled;
}

// Logout function
function logout() {
    localStorage.removeItem("username");
    location.reload(); 
}

// Initial Sync
updateUI();
