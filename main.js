// =========================
// 💰 STATE & AUDIO INITIALIZATION
// =========================
let coins = Number(localStorage.getItem("coins")) || 100;
let winStreak = 0;
let activePowerUp = null;

// Initialize sounds - Make sure files exist in /audio/ folder
const sounds = {
    roll: new Audio('./audio/roll.mp3'),
    win: new Audio('./audio/win.mp3'),
    lose: new Audio('./audio/lose.mp3'),
    fail: new Audio('./audio/fail.mp3') // New sound for Critical Fail
};

const resultText = document.querySelector(".result");

// =========================
// 🦊 WALLET LOGIC
// =========================
async function connectWallet() {
    if (!window.ethereum) return alert("Please use MetaMask browser!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

// =========================
// 🎲 BATTLE ENGINE
// =========================
document.getElementById("roll").addEventListener("click", () => startBattle('standard'));
document.getElementById("berserk").addEventListener("click", () => startBattle('berserk'));

function startBattle(type) {
    const bet = Number(document.getElementById("bet").value);
    if (bet <= 0 || bet > coins) return alert("Invalid Bet!");

    // Play roll sound immediately on click (User Gesture)
    sounds.roll.currentTime = 0;
    sounds.roll.play().catch(e => console.log("Audio waiting for interaction"));

    // UI Lock
    document.getElementById("roll").disabled = true;
    document.getElementById("berserk").disabled = true;
    resultText.textContent = type === 'berserk' ? "🔥 GOING BERSERK! 🔥" : "Rolling...";

    const d1 = document.getElementById("dice1");
    const d2 = document.getElementById("dice2");
    d1.classList.add("dice-rolling");
    d2.classList.add("dice-rolling");

    setTimeout(() => {
        d1.classList.remove("dice-rolling");
        d2.classList.remove("dice-rolling");

        // BERSERK LOGIC
        let roll1 = (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
        
        if (type === 'berserk') {
            roll1 = Math.floor(Math.random() * 12) + 1; // 1-12 range
        }

        const roll2 = Math.floor(Math.random() * 6) + 1;

        // Update UI
        d1.src = `./assets/red-${roll1 > 6 ? 6 : roll1}.png`; // Visual cap for 6-sided assets
        d2.src = `./assets/green-${roll2}.png`;
        document.getElementById("score1").textContent = roll1;
        document.getElementById("score2").textContent = roll2;

        processResult(roll1, roll2, bet, type);
        
        document.getElementById("roll").disabled = false;
        document.getElementById("berserk").disabled = false;
    }, 1000);
}

function processResult(p1, p2, bet, type) {
    // CRITICAL FAIL (Berserk only)
    if (type === 'berserk' && p1 <= 3) {
        coins -= (bet * 2);
        resultText.textContent = "💀 CRITICAL FAIL! Lost 2x Bet!";
        sounds.fail.play();
        document.getElementById("p2-card").classList.add("win-glow");
    } 
    else if (p1 > p2) {
        winStreak++;
        let mult = winStreak >= 3 ? 2 : 1;
        coins += (bet * mult);
        resultText.textContent = `VICTORY! +${bet * mult} coins`;
        sounds.win.play();
        document.getElementById("p1-card").classList.add("win-glow");
    } 
    else if (p2 > p1) {
        winStreak = 0;
        let loss = activePowerUp === 'shield' ? Math.floor(bet/2) : bet;
        coins -= loss;
        resultText.textContent = activePowerUp === 'shield' ? "🛡️ Shielded Loss!" : "DEFEAT!";
        sounds.lose.play();
        document.getElementById("p2-card").classList.add("win-glow");
    } 
    else {
        resultText.textContent = "DRAW!";
    }

    activePowerUp = null;
    updateUI();
}

function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) return alert("Not enough coins!");
    coins -= cost;
    activePowerUp = type;
    alert(`${type.toUpperCase()} Activated!`);
    updateUI();
}

function updateUI() {
    document.getElementById("coins-game").textContent = coins;
    document.getElementById("win-streak").textContent = winStreak;
    document.getElementById("multiplier").textContent = winStreak >= 3 ? "2x 🔥" : "1x";
    localStorage.setItem("coins", coins);
    
    // Clear glows after 2s
    setTimeout(() => {
        document.getElementById("p1-card").classList.remove("win-glow");
        document.getElementById("p2-card").classList.remove("win-glow");
    }, 2000);
}

function logout() { location.reload(); }

function claimDaily() {
    const lastClaim = localStorage.getItem("lastClaim");
    const now = new Date().getTime();
    
    if (lastClaim && now - lastClaim < 86400000) { // 24 hours
        alert("Come back tomorrow for more coins!");
        return;
    }

    const reward = Math.floor(Math.random() * 50) + 10;
    coins += reward;
    localStorage.setItem("lastClaim", now);
    alert(`🎁 Daily Chest Opened! You found ${reward} coins!`);
    updateUI();
}

