let coins = Number(localStorage.getItem("coins")) || 100;
let winStreak = 0;
let currentLevel = Number(localStorage.getItem("level")) || 1;
let activePowerUp = null; 

const diceBtn = document.getElementById("roll");
const resultText = document.querySelector(".result");

async function connectWallet() {
    if (!window.ethereum) return alert("Please use MetaMask browser!");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateUI();
}

diceBtn.addEventListener("click", () => {
    const bet = Number(document.getElementById("bet").value);
    if (bet <= 0 || bet > coins) return alert("Not enough coins!");

    diceBtn.disabled = true;
    resultText.textContent = "Rolling...";

    const d1 = document.getElementById("dice1");
    const d2 = document.getElementById("dice2");

    d1.classList.add("dice-rolling");
    d2.classList.add("dice-rolling");

    setTimeout(() => {
        d1.classList.remove("dice-rolling");
        d2.classList.remove("dice-rolling");

        const roll1 = activePowerUp === 'loaded' ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;

        d1.src = `./assets/red-${roll1}.png`;
        d2.src = `./assets/green-${roll2}.png`;

        document.getElementById("score1").textContent = roll1;
        document.getElementById("score2").textContent = roll2;

        if (roll1 > roll2) {
            winStreak++;
            let bonus = winStreak >= 3 ? 2 : 1;
            coins += (bet * bonus);
            resultText.textContent = `YOU WIN! (x${bonus})`;
            document.getElementById("p1-card").classList.add("win-glow");
        } else if (roll2 > roll1) {
            winStreak = 0;
            coins -= (activePowerUp === 'shield' ? Math.floor(bet/2) : bet);
            resultText.textContent = activePowerUp === 'shield' ? "Shielded Loss!" : "YOU LOST!";
            document.getElementById("p2-card").classList.add("win-glow");
        } else {
            resultText.textContent = "DRAW!";
        }

        activePowerUp = null;
        diceBtn.disabled = false;
        updateUI();
    }, 800);
});

function buyPowerUp(type) {
    const cost = type === 'shield' ? 20 : 30;
    if (coins < cost) return alert("Low balance!");
    coins -= cost;
    activePowerUp = type;
    alert(type.toUpperCase() + " Active!");
    updateUI();
}

function updateUI() {
    document.getElementById("coins-game").textContent = coins;
    document.getElementById("win-streak").textContent = winStreak;
    document.getElementById("multiplier").textContent = (winStreak >= 3 ? "2x 🔥" : "1x");
    localStorage.setItem("coins", coins);
}

function logout() { location.reload(); }
