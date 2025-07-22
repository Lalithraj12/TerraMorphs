(function () {
  if (!localStorage.getItem("evolutionTrialComplete") || !localStorage.getItem("terraformingUnlocked")) {
  alert("❌ You must complete Evolution Trials to access Terraforming.");
  window.location.href = "/index.html";
}
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "9999";
  canvas.style.background = "#001a1a";

  const successSound = new Audio("assets/sounds/success.mp3");  // 🎉 When terraforming hits 75%
  const clickSound = new Audio("assets/sounds/click.mp3");      // 🖱️ Button click sound

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  const planet = {
    temperature: 40, 
    water: 10,      
    oxygen: 3,     
    radiation: 70,   
    toxicity: 60     
  };

  const traitPanel = {
  x: canvas.width - 420,
  y: 140,
  width: 300,
  height: 340,
  cardHeight: 30
};

  let terraProgress = 0;
  let simulationStarted = false;
  let traitBank = [];
  let roundLogs = [];
  let roundCount = 0;
  let showFinalSummary = false;
  let finalResultShown = false;

function loadTraitBankFromStorage() {
  const traits = JSON.parse(localStorage.getItem("finalDNASequence") || "[]");
  traitBank = traits.map(t => typeof t === "string" ? t : t.name);
}

  function drawUI() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "32px monospace";
    ctx.fillText("🌍 Terraforming Console", 60, 60);

    if (traitBank.length === 0) {
  ctx.fillText("No traits found.", canvas.width - 410, 180);
} else {
  traitBank.forEach((trait, i) => {
    const x = canvas.width - 410;
    const y = 180 + i * 30;
    ctx.fillText(`🧬 ${trait}`, x, y);
  });
}
if (showFinalSummary) {
  drawFinalSummary();
  return;
}

    ctx.font = "20px monospace";
    ctx.fillStyle = "#00ccff";
    ctx.fillText("🧪 Planet Conditions:", 60, 120);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`🌡 Temperature: ${planet.temperature}°C`, 60, 160);
    ctx.fillText(`💧 Water Level: ${planet.water}%`, 60, 190);
    ctx.fillText(`💨 Oxygen Level: ${planet.oxygen}%`, 60, 220);
    ctx.fillText(`☢ Radiation: ${planet.radiation}`, 60, 250);
    ctx.fillText(`🧪 Toxicity: ${planet.toxicity}`, 60, 280);

    ctx.fillStyle = "#00ccff";
    ctx.fillText("🧬 Terraforming Progress:", 60, 340);

    ctx.fillStyle = "#444";
    ctx.fillRect(60, 360, 400, 30);
    ctx.fillStyle = "#00ff99";
    ctx.fillRect(60, 360, terraProgress * 4, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";
    ctx.fillText(`${terraProgress}%`, 480, 382);

ctx.fillStyle = "#002222";
ctx.fillRect(traitPanel.x, traitPanel.y, traitPanel.width, traitPanel.height);
ctx.strokeStyle = "#00ccff";
ctx.strokeRect(traitPanel.x, traitPanel.y, traitPanel.width, traitPanel.height);

ctx.font = "18px monospace";
ctx.fillStyle = "#00ccff";
ctx.fillText("🧬 Trait Bank", traitPanel.x + 10, traitPanel.y - 10);
ctx.font = "14px monospace";
ctx.fillStyle = "#ffffff";

const visibleCards = Math.floor(traitPanel.height / traitPanel.cardHeight);
const traitsToShow = traitBank.slice(0, visibleCards);

if (traitsToShow.length === 0) {
  ctx.fillText("No traits found.", traitPanel.x + 10, traitPanel.y + 30);
} else {
  traitsToShow.forEach((trait, i) => {
    const y = traitPanel.y + 10 + i * traitPanel.cardHeight;
    ctx.fillStyle = "#003333";
    ctx.fillRect(traitPanel.x + 10, y, traitPanel.width - 20, traitPanel.cardHeight - 5);
    ctx.strokeStyle = "#00ccff";
    ctx.strokeRect(traitPanel.x + 10, y, traitPanel.width - 20, traitPanel.cardHeight - 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`🧬 ${trait}`, traitPanel.x + 20, y + 20);
  });
  drawRoundLogs();

}

    ctx.fillStyle = simulationStarted ? "#555" : "#00ccff";
    ctx.fillRect(60, 430, 220, 50);
    ctx.fillStyle = "#000";
    ctx.font = "20px monospace";
    ctx.fillText("🚀 Start Simulation", 75, 463);
  }

  function drawFinalSummary() {
    const success = terraProgress >= 100;
    ctx.fillText(success
    ? "💫 YOUR SPECIES HAVE SUCCESSFULLY ESTABLISHED THEIR COLONY"
    : "⚠️ Your species failed to fully terraform. Retry or revise DNA."
    , 80, 490);
    const percentage = Math.floor((affectedTiles / totalTiles) * 100);
    if (percentage >= 75 && !finalResultShown) {
    finalResultShown = true;
    successSound.play();
    setTimeout(showFinalResultScreen, 1000); // Small delay for dramatic effect
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ffcc";
    ctx.font = "28px monospace";
    ctx.fillText("🌍 Terraforming Complete", 80, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";

    ctx.fillText(`✅ Final Planet Conditions:`, 80, 130);
    ctx.fillText(`🌡 Temperature: ${planet.temperature}°C`, 100, 160);
    ctx.fillText(`💧 Water: ${planet.water}%`, 100, 190);
    ctx.fillText(`💨 Oxygen: ${planet.oxygen}%`, 100, 220);
    ctx.fillText(`☢ Radiation: ${planet.radiation}`, 100, 250);
    ctx.fillText(`🧪 Toxicity: ${planet.toxicity}`, 100, 280);

    ctx.fillText(`🧬 Traits Used:`, 80, 330);
    traitBank.forEach((trait, i) => {
    ctx.fillText(`- ${trait}`, 100, 360 + i * 25);

    ctx.fillStyle = "#2196F3";
    ctx.fillRect(80, canvas.height - 100, 160, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("🔁 Retry", 110, canvas.height - 75);

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(260, canvas.height - 100, 200, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("🏠 Continue", 290, canvas.height - 75);
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (showFinalSummary) {
        if (mx >= 80 && mx <= 220 && my >= canvas.height - 100 && my <= canvas.height - 50) {
          location.reload(); // Retry
        }

        if (mx >= 240 && mx <= 460 && my >= canvas.height - 100 && my <= canvas.height - 50) {
          window.location.href = "/index.html"; // Back to lab
        }
      }
    });
  });

  ctx.fillStyle = "#00ccff";
  ctx.fillText(`📦 Rounds Taken: ${roundCount}`, 80, 450);
  ctx.fillText(`💫 YOUR SPECIES HAVE SUCCESSFULLY ESTABLISHED THEIR COLONY`, 80, 490);
  const result = {
  finalConditions: { ...planet },
  traitsUsed: [...traitBank],
  rounds: roundCount,
  success: terraProgress >= 100
  };
  localStorage.setItem("terraformingSummary", JSON.stringify(result));
  localStorage.setItem("gameComplete", "true");

  ctx.font = "16px monospace";
  ctx.fillStyle = "#999";
  ctx.fillText("Press R to Restart or S to Save Result", 80, canvas.height - 60);
}

  function drawRoundLogs() {
  const x = 60;
  const y = canvas.height - 230;
  ctx.fillStyle = "#111";
  ctx.fillRect(x, y, 500, 160);
  ctx.strokeStyle = "#00ccff";
  ctx.strokeRect(x, y, 500, 160);

  ctx.fillStyle = "#00ccff";
  ctx.font = "16px monospace";
  ctx.fillText("📋 Terraforming Activity Log", x + 10, y + 20);

  ctx.fillStyle = "#ffffff";
  ctx.font = "14px monospace";
  let logY = y + 40;

  roundLogs.forEach(log => {
    const lines = log.split("\n");
    lines.forEach(line => {
      ctx.fillText(line, x + 10, logY);
      logY += 18;
    });
  });
}

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
      if (mx >= 60 && mx <= 280 && my >= 430 && my <= 480 && !simulationStarted) {
      simulationStarted = true;
      startSimulation();
    }
  });

  function startSimulation() {
  const interval = setInterval(() => {
   if (terraProgress >= 100) {
  clearInterval(interval);
  showFinalSummary = true;

  localStorage.setItem("terraformingSummary", JSON.stringify({
    finalConditions: planet,
    traitsUsed: traitBank,
    rounds: roundCount,
    success: true
  }));
  localStorage.setItem("gameComplete", "true");
  localStorage.setItem("dashboardStatus", "danger");

  setTimeout(() => {
    window.location.href = "../finalResult/finalResult.html";
  }, 2000);

  drawUI();
} else {
  applyTraitsAndSimulateRound();
  drawUI();
}

  }, 1000);
}

 function applyTraitsAndSimulateRound() {
  roundCount++;
  let log = `📘 Round ${roundCount}:\n`;

  traitBank.forEach(trait => {
    switch (trait) {
      case "Photosynthesis":
        planet.oxygen = Math.min(21, planet.oxygen + 1);
        log += `+ Oxygen from ${trait}\n`;
        break;
      case "Melanin":
        planet.radiation = Math.max(0, planet.radiation - 2);
        log += `- Radiation from ${trait}\n`;
        break;
      case "DNA Repair":
        planet.toxicity = Math.max(0, planet.toxicity - 1);
        log += `- Toxicity from ${trait}\n`;
        break;
      case "Salt Tolerance":
      case "Water Retention":
        planet.water = Math.min(100, planet.water + 1);
        log += `+ Water from ${trait}\n`;
        break;
      case "ADH Control":
        planet.water = Math.min(100, planet.water + 0.5);
        log += `+ Water (slow) from ${trait}\n`;
        break;
      case "Hemoglobin Boost":
        if (planet.oxygen < 10) {
          planet.oxygen = Math.min(21, planet.oxygen + 1);
          log += `+ Oxygen (low) from ${trait}\n`;
        }
        break;
    }
  });

  const oldTemp = planet.temperature;
  planet.temperature += Math.random() < 0.5 ? -1 : 1;
  planet.radiation += Math.random() < 0.3 ? 1 : 0;
  planet.toxicity += Math.random() < 0.2 ? 1 : 0;

  log += `~ Temp changed to ${planet.temperature}°C\n`;
  log += `🧬 ${trait} activated\n`;
  const ideal = (
    planet.oxygen >= 15 &&
    planet.water >= 30 &&
    planet.radiation <= 40 &&
    planet.toxicity <= 30 &&
    planet.temperature >= 10 && planet.temperature <= 40
  );

  if (ideal) {
    terraProgress = Math.min(100, terraProgress + 2);
    log += `🌱 Progress +2%\n`;
  } else {
    terraProgress = Math.min(100, terraProgress + 0.5);
    log += `🌱 Progress +0.5%\n`;
  }

  roundLogs.push(log);
  if (roundLogs.length > 7) roundLogs.shift();  
}

const cheerSound = new Audio("/sounds/success.mp3");
if (terraProgress >= 100 && !localStorage.getItem("terraSoundPlayed")) {
  cheerSound.play();
  localStorage.setItem("terraSoundPlayed", "true");
}

function showFinalResultScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px monospace";
  ctx.fillStyle = "#00FF99";
  ctx.fillText("🌎 Terraforming Successful!", canvas.width / 2 - 200, 100);

  ctx.font = "20px monospace";
  ctx.fillStyle = "#ccc";
  ctx.fillText("Your engineered traits enabled planetary colonization.", canvas.width / 2 - 250, 150);

  // Retry Button
  ctx.fillStyle = "#222";
  ctx.fillRect(canvas.width / 2 - 140, 250, 120, 50);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(canvas.width / 2 - 140, 250, 120, 50);
  ctx.fillStyle = "#fff";
  ctx.fillText("🔁 Retry", canvas.width / 2 - 120, 280);

  // Continue Button
  ctx.fillStyle = "#222";
  ctx.fillRect(canvas.width / 2 + 20, 250, 120, 50);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(canvas.width / 2 + 20, 250, 120, 50);
  ctx.fillStyle = "#fff";
  ctx.fillText("🏠 Continue", canvas.width / 2 + 30, 280);

  canvas.addEventListener("click", handleFinalScreenButtons);
}

function handleFinalScreenButtons(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (x >= canvas.width / 2 - 140 && x <= canvas.width / 2 - 20 &&
      y >= 250 && y <= 300) {
    clickSound.play();  // 🔁 Retry
    location.reload();
  }

  if (x >= canvas.width / 2 + 20 && x <= canvas.width / 2 + 140 &&
      y >= 250 && y <= 300) {
    clickSound.play();  // ⬅ Back to lab
    window.location.href = "/index.html";
  }
}

window.addEventListener("keydown", (e) => {
  if (showFinalSummary) {
    if (e.key === "r") {
      location.reload();
    }
    if (e.key === "s") {
      const result = {
        finalConditions: planet,
        traitsUsed: traitBank,
        rounds: roundCount,
        message: "Colony successfully established."
      };
      localStorage.setItem("terraformSummary", JSON.stringify(result));
      alert("✅ Terraforming outcome saved!");
    }
  }
});

  window.loadTerraformingGame = function () {
  loadTraitBankFromStorage();   
  drawUI();                     
};

})();
