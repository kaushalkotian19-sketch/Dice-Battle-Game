// =========================
// 💰 STATE MANAGEMENT
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let tokens = Number(localStorage.getItem("tokens")) || 0;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null;
let p1HP = 100;
let p2HP = 100;

// =========================
// 🎁 DAILY REWARD
// =========================
function claimDailyReward() {
    const lastClaim = localStorage.getItem("lastClaim");
    const now = new Date().getTime();
    
    if (lastClaim && now - lastClaim < 86400000) {
        const hoursLeft = Math.ceil((86400000 - (now - lastClaim)) / 3600000);
        alert(`Chest is empty! Come back in ${hoursLeft}h.`);
        return;
    }

    const prize = Math.floor(Math.random() * 50) + 20;
    coins += prize;
    localStorage.setItem("lastClaim", now);
    alert(`🎁 You found ${prize} coins!`);
    updateUI();
}

// =========================
// 👤 NAVIGATION
// =========================
function handleSimpleLogin() {
    const nameInput = document.getElementById("username-input").value;
    if (!nameInput) return alert("Enter a name!");
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
    const body = document.body;

    if (bet <= 0 || bet > coins) return alert("Check your bet!");

    // Roll Logic
    let p1 = (type === 'berserk') ? Math.floor(Math.random() * 12) + 1 : 
             (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
    let p2 = Math.floor(Math.random() * 6) + 1;

    // Visuals
    document.getElementById("dice1").src = `./assets/red-${p1 > 6 ? 6 : p1}.png`;
    document.getElementById("dice2").src = `./assets/green-${p2}.png`;
    document.getElementById("score1").textContent = p1;
    document.getElementById("score2").textContent = p2;

    // Calculate Damage & Results
    if (type === 'berserk' && p1 <= 3) {
        coins -= (bet * 2);
        p1HP -= 30; // Berserk fail hurts the player
        resultText.textContent = "💀 BERSERK FAIL!";
        winStreak = 0;
    } else if (p1 > p2) {
        winStreak++;
        p2HP -= (p1 - p2) * 10;
        coins += (winStreak >= 3 ? bet * 2 : bet);
        resultText.textContent = "VICTORY!";
        document.getElementById("p1-card").classList.add("winner-glow");
    } else if (p2 > p1) {
        winStreak = 0;
        p1HP -= (p2 - p1) * 15;
        coins -= (activePowerUp === 'shield' ? Math.floor(bet/2) : bet);
        resultText.textContent = "DEFEAT!";
        document.getElementById("p2-card").classList.add("winner-glow");
    }

    // Dynamic Backgrounds
    body.classList.toggle("bg-hot-streak", winStreak >= 3);
    body.classList.toggle("bg-losing-streak", p1HP < 40);

    activePowerUp = null;
    checkHP();
    updateUI();
}

function checkHP() {
    if (p2HP <= 0) {
        p2HP = 100; p1HP = 100;
        triggerLevelUp();
    } else if (p1HP <= 0) {
        alert("You fainted! Level Reset.");
        p1HP = 100; p2HP = 100;
        winStreak = 0;
    }
    document.getElementById("p1-hp").style.width = p1HP + "%";
    document.getElementById("p2-hp").style.width = p2HP + "%";
}

function triggerLevelUp() {
    currentLevel++;
    document.getElementById("new-lvl").textContent = currentLevel;
    document.getElementById("celebration-overlay").style.display = "flex";
}

function closeOverlay() {
    document.getElementById("celebration-overlay").style.display = "none";
    updateUI();
}

function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) return alert("Need more coins!");
    coins -= cost; activePowerUp = type;
    alert(type.toUpperCase() + " ACTIVE!");
    updateUI();
}

function updateUI() {
    document.getElementById("coins").textContent = coins;
    document.getElementById("coins-game").textContent = coins;
    document.getElementById("win-streak").textContent = winStreak;
    document.getElementById("lvl-num").textContent = currentLevel;
    document.getElementById("multiplier").textContent = winStreak >= 3 ? "2x 🔥" : "1x";
    localStorage.setItem("coins", coins);
    localStorage.setItem("level", currentLevel);
}

function logout() { location.reload(); }

document.getElementById("roll")?.addEventListener("click", () => startBattle('standard'));
document.getElementById("berserk")?.addEventListener("click", () => startBattle('berserk'));
updateUI();
