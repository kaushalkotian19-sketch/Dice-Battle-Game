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
// 🔊 AUDIO MANAGER
// =========================
const sounds = {
    bgm: new Audio('./audio/ambient_synth.mp3'),
    roll: new Audio('./audio/dice_roll.mp3'),
    win: new Audio('./audio/win_ding.mp3'),
    lose: new Audio('./audio/lose_thud.mp3'),
    berserkHype: new Audio('./audio/heartbeat.mp3'),
    levelUp: new Audio('./audio/level_up.mp3')
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.3;

function playWinSound(streak) {
    const sound = sounds.win.cloneNode();
    const pitch = Math.min(1 + (streak * 0.1), 2.0); // Pitch goes up with streak
    sound.preservesPitch = false;
    sound.playbackRate = pitch;
    sound.play();
}

// =========================
// 🎁 DAILY REWARD
// =========================
function claimDailyReward() {
    const lastClaim = localStorage.getItem("lastClaim");
    const now = Date.now();
    
    if (lastClaim && now - lastClaim < 86400000) {
        const hoursLeft = Math.ceil((86400000 - (now - lastClaim)) / 3600000);
        alert(`Chest is empty! Back in ${hoursLeft}h.`);
        return;
    }

    const prize = Math.floor(Math.random() * 50) + 20;
    coins += prize;
    localStorage.setItem("lastClaim", now);
    alert(`🎁 You found ${prize} coins!`);
    updateUI();
}

// =========================
// 👤 NAVIGATION & HYPE
// =========================
function handleSimpleLogin() {
    sounds.bgm.play().catch(() => console.log("Audio requires interaction"));
    const nameInput = document.getElementById("username-input").value;
    if (!nameInput) return alert("Enter a name!");
    localStorage.setItem("username", nameInput);
    document.getElementById("display-username").textContent = nameInput;
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

const berserkBtn = document.getElementById("berserk");
berserkBtn.addEventListener("mouseenter", () => {
    sounds.berserkHype.loop = true;
    sounds.berserkHype.play();
    document.body.classList.add("shake-screen");
});
berserkBtn.addEventListener("mouseleave", () => {
    sounds.berserkHype.pause();
    sounds.berserkHype.currentTime = 0;
    document.body.classList.remove("shake-screen");
});

// =========================
// 🎲 BATTLE LOGIC
// =========================
function startBattle(type) {
    const bet = Number(document.getElementById("bet").value);
    const resultText = document.querySelector(".result");
    if (bet <= 0 || bet > coins) return alert("Check your bet!");

    sounds.roll.play();
    document.getElementById("dice1").classList.add("dice-rolling");
    document.getElementById("dice2").classList.add("dice-rolling");

    setTimeout(() => {
        document.getElementById("dice1").classList.remove("dice-rolling");
        document.getElementById("dice2").classList.remove("dice-rolling");

        let p1 = (type === 'berserk') ? Math.floor(Math.random() * 12) + 1 : 
                 (activePowerUp === 'loaded') ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
        let p2 = Math.floor(Math.random() * 6) + 1;

        document.getElementById("dice1").src = `./assets/red-${p1 > 6 ? 6 : p1}.png`;
        document.getElementById("dice2").src = `./assets/green-${p2}.png`;
        document.getElementById("score1").textContent = p1;
        document.getElementById("score2").textContent = p2;

        document.getElementById("p1-card").classList.remove("winner-glow");
        document.getElementById("p2-card").classList.remove("winner-glow");

        if (type === 'berserk' && p1 <= 3) {
            coins -= (bet * 2); p1HP -= 30; winStreak = 0;
            resultText.textContent = "💀 BERSERK FAIL!";
            sounds.lose.play();
        } else if (p1 > p2) {
            winStreak++;
            p2HP -= (p1 - p2) * 10;
            coins += (winStreak >= 3 ? bet * 2 : bet);
            resultText.textContent = "VICTORY!";
            document.getElementById("p1-card").classList.add("winner-glow");
            playWinSound(winStreak);
        } else if (p2 > p1) {
            winStreak = 0;
            p1HP -= (p2 - p1) * 15;
            coins -= (activePowerUp === 'shield' ? Math.floor(bet/2) : bet);
            resultText.textContent = "DEFEAT!";
            document.getElementById("p2-card").classList.add("winner-glow");
            sounds.lose.play();
        }

        document.body.classList.toggle("bg-hot-streak", winStreak >= 3);
        document.body.classList.toggle("bg-losing-streak", p1HP < 40);

        activePowerUp = null;
        checkHP();
        updateUI();
    }, 800);
}

function checkHP() {
    if (p2HP <= 0) {
        p2HP = 100; p1HP = 100;
        triggerLevelUp();
    } else if (p1HP <= 0) {
        alert("Defeated! Restarting match...");
        p1HP = 100; p2HP = 100; winStreak = 0;
    }
    document.getElementById("p1-hp").style.width = p1HP + "%";
    document.getElementById("p2-hp").style.width = p2HP + "%";
}

function triggerLevelUp() {
    currentLevel++;
    sounds.levelUp.play();
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
