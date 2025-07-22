(function () {
  if (!localStorage.getItem("dnaSynthesisComplete")) {
  alert("❌ Please complete DNA Synthesis first.");
  window.location.href = "/index.html";
}
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "9999";
  canvas.style.background = "#111";
  const ctx = canvas.getContext("2d");

  function playSound(name) {
  const audio = new Audio(`./sounds/fail`);
  audio.volume = 0.6;
  audio.play();
}

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let currentPhaseIndex = 0;
  let gameStarted = false;
  let gameOver = false;
  let timer = 30;
  let energy = 12;
  let statusMessage = "";
  let messageTimer = 0;
  let lastUpdate = Date.now();
  let failedZones = new Set();
  let popupVisible = false;
  let popupZone = "";
  let phaseSnapshot = {};
  let gamePaused = false;
  let showFinalSummary = false;

  const saved = JSON.parse(localStorage.getItem("evoTrialSave") || "null");
if (saved) {
  if (confirm("🔁 Resume previous Evolution Trial?")) {
    currentPhaseIndex = saved.currentPhaseIndex;
    energy = saved.energy;
    Object.assign(zones, saved.zones);
    timer = saved.timer;
    saved.failedZones.forEach(z => failedZones.add(z));
    traits.forEach((t, i) => {
      Object.assign(t, saved.traits[i] || {});
    });
    gameStarted = true;
  }
}

  const phases = [
    { name: "Radiation Surge", threats: ["Radiation", "Genome Instability"], zones: ["Genome", "Skin"] },
    { name: "Frozen Highlands", threats: ["Cold Shock", "Tissue Stiffening"], zones: ["Heart", "Muscle"] },
    { name: "Acidic Swamp", threats: ["Skin Corrosion", "Toxic Absorption"], zones: ["Skin", "Immune"] },
    { name: "Thin Atmosphere", threats: ["Hypoxia", "Oxygen Starvation"], zones: ["Heart", "Lungs"] },
    { name: "UV Flare Field", threats: ["UV Burn", "Cell Mutation"], zones: ["Skin", "Genome"] }
  ];
  const smoothZones = {};
  for (let z in zones) smoothZones[z] = 0;
  const zones = {
    "Brain": 0,
    "Heart": 0,
    "Genome": 0,
    "Skin": 0,
    "Lungs": 0,
    "Immune": 0,
    "Muscle": 0
  };

  const storedTraits = JSON.parse(localStorage.getItem("finalDNASequence") || "[]");

  const traits = storedTraits.map(trait => ({
    name: trait.name || trait,
    zone: trait.zone || guessZone(trait.name || trait),
    cooldown: 0,
    energyCost: 3 
  }));
  function guessZone(name) {
    if (name.toLowerCase().includes("lung")) return "Lungs";
    if (name.toLowerCase().includes("skin") || name.toLowerCase().includes("melanin")) return "Skin";
    if (name.toLowerCase().includes("genome") || name.toLowerCase().includes("dna")) return "Genome";
    if (name.toLowerCase().includes("heart") || name.toLowerCase().includes("adrenal")) return "Heart";
    if (name.toLowerCase().includes("immune")) return "Immune";
    if (name.toLowerCase().includes("brain")) return "Brain";
    if (name.toLowerCase().includes("muscle")) return "Muscle";
    return "Skin";
  }


  const bonusTrait = localStorage.getItem("bonusTrait");
  if (bonusTrait === "Environmental Sensor") {
    traits.push({ name: "Environmental Sensor", zone: "Immune", cooldown: 0, energyCost: 2 });
  }


    const traitStats = {};
  traits.forEach(t => {
    traitStats[t.name] = { used: 0, effective: 0 };
  });

  function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "36px monospace";
    ctx.fillText("🧬 Evolution Trials", canvas.width / 2 - 160, canvas.height / 2 - 40);
    ctx.font = "20px monospace";
    ctx.fillText("Click to Start the Trial", canvas.width / 2 - 110, canvas.height / 2 + 10);
    ctx.strokeStyle = "#00ffcc";
    ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 + 30, 200, 50);
    ctx.font = "18px monospace";
    ctx.fillText("▶ Start Trial", canvas.width / 2 - 45, canvas.height / 2 + 60);
  }

  function drawTraitEfficiency() {
  ctx.font = "18px monospace";
  ctx.fillText("Trait Efficiency:", canvas.width / 2 - 140, canvas.height / 2 + 80);
  let y = canvas.height / 2 + 110;

  for (let name in traitStats) {
    const { used, effective } = traitStats[name];
    const percent = used > 0 ? Math.round((effective / used) * 100) : 0;
    ctx.fillText(`🔹 ${name}: ${effective}/${used} (${percent}%)`, canvas.width / 2 - 140, y);
    y += 30;
  }
}

  function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    const survived = 7 - failedZones.size;
    const percent = Math.floor((survived / 7) * 100);
    ctx.fillText(`🧬 Survival Report`, canvas.width / 2 - 140, canvas.height / 2 - 80);
    ctx.fillText(`Zones Survived: ${survived}/7`, canvas.width / 2 - 140, canvas.height / 2 - 40);
    ctx.fillText(`❌ Failed Zones: ${[...failedZones].join(", ") || "None"}`, canvas.width / 2 - 140, canvas.height / 2);
    ctx.fillText(`🧪 Survival Percentage: ${percent}%`, canvas.width / 2 - 140, canvas.height / 2 + 40);
    drawTraitEfficiency();
    ctx.font = "20px monospace";
    ctx.fillText("🔎 Click to view full evolution report", canvas.width / 2 - 140, canvas.height / 2 + 80);
    localStorage.setItem("dashboardStatus", "danger");
  }

canvas.addEventListener("click", (e) => {
  if (popupVisible) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const bx = canvas.width / 2 - 60;
    const by = canvas.height / 2 + 60;
    if (mx >= bx && mx <= bx + 120 && my >= by && my <= by + 40) {
      location.reload();
    }
    return;
  }

    canvas.addEventListener("click", (e) => {
    if (!popupVisible) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const bx = canvas.width / 2 - 60;
    const by = canvas.height / 2 + 60;

    if (mx >= bx && mx <= bx + 120 && my >= by && my <= by + 40) {
    
    for (let z in phaseSnapshot) zones[z] = phaseSnapshot[z];
    traits.forEach(t => t.cooldown = 0);
    energy = 12;
    timer = 30;
    popupVisible = false;
    gamePaused = false;
    failedZones.delete(popupZone);
    popupZone = "";
  }
});
canvas.addEventListener("click", (e) => {
  if (gameOver && !showFinalSummary) {
    showFinalSummary = true;
    if (showFinalSummary) {
  const mx = e.clientX;
  const my = e.clientY;

  const retryBtn = { x: canvas.width - 300, y: canvas.height - 80, w: 120, h: 40 };
  const contBtn  = { x: canvas.width - 160, y: canvas.height - 80, w: 120, h: 40 };

  if (mx >= retryBtn.x && mx <= retryBtn.x + retryBtn.w && my >= retryBtn.y && my <= retryBtn.y + retryBtn.h) {
    localStorage.removeItem("evolutionTrialComplete");
    localStorage.removeItem("evolutionTrialSummary");
    localStorage.removeItem("bonusTrait");
    location.reload(); // Retry game
  }

  if (mx >= contBtn.x && mx <= contBtn.x + contBtn.w && my >= contBtn.y && my <= contBtn.y + contBtn.h) {
    window.location.href = "/#lab"; // Or your home lab screen
  }
}
  }
});
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const y = canvas.height - 100;
  traits.forEach((trait, i) => {
    const x = 40 + i * 220;
    if (mx >= x && mx <= x + 200 && my >= y && my <= y + 60) {
      useTrait(trait);
    }
  });
});

  function useTrait(trait) {
  const currentPhase = phases[currentPhaseIndex];
  traitStats[trait.name].used++;

  if (trait.cooldown > 0 || energy < trait.energyCost) return;

  if (currentPhase.zones.includes(trait.zone) && zones[trait.zone] >= 30) {
    zones[trait.zone] = Math.max(0, zones[trait.zone] - 25);
    traitStats[trait.name].effective++;
    trait.cooldown = 8;
    energy -= trait.energyCost;
    statusMessage = `✅ ${trait.name} activated on ${trait.zone}`;
    playSound('success.mp3'); // ✅ Trait worked
  } else {
    statusMessage = `❌ ${trait.name} was ineffective`;
    playSound('fail.mp3'); // ❌ Trait failed
  }

  messageTimer = 3;
};

  function updatePhase() {
    currentPhaseIndex++;
    if (currentPhaseIndex >= phases.length) {
      gameOver = true;
    } else {
      timer = 30;
      phaseSnapshot = {};
for (let z in zones) phaseSnapshot[z] = zones[z];
    }
  }

  function updateGame() {
    const now = Date.now();
    if (now - lastUpdate >= 1000) {
      timer--;
      traits.forEach(t => { if (t.cooldown > 0) t.cooldown--; });
    if (messageTimer > 0) messageTimer--;

      const currentPhase = phases[currentPhaseIndex];
      currentPhase.zones.forEach(z => {
        zones[z] = Math.min(100, zones[z] + 5);
        if (zones[z] >= 100 && !failedZones.has(z)) {
        failedZones.add(z);
        playSound('zone_fail.mp3');
        popupVisible = true;
        popupZone = z;
        gamePaused = true;
      }
      });

      if (failedZones.size >= 3) {
        gameOver = true;
      }

      if (timer <= 0) {
        updatePhase();
      }

      lastUpdate = now;
      localStorage.setItem("evoTrialSave", JSON.stringify({
        currentPhaseIndex,
        zones,
        energy,
        traits,
        timer,
        failedZones: [...failedZones]
      }));
    }
  }

  function drawHeader() {
    const phase = phases[currentPhaseIndex];
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText(`🌍 Phase: ${phase.name}`, 40, 40);
    ctx.fillText(`Threats: ${phase.threats.join(", ")}`, 40, 65);
    ctx.fillText(`⚡ Energy: ${energy}`, canvas.width - 220, 40);
    ctx.fillText(`⏳ Time: ${timer}s`, canvas.width - 220, 65);
  }

  function drawZones() {
  ctx.font = "16px monospace";
  let i = 0;

  for (let zone in zones) {
    smoothZones[zone] += (zones[zone] - smoothZones[zone]) * 0.1;
    const stress = smoothZones[zone];
    const y = 100 + i * 50;
    const underThreat = phases[currentPhaseIndex].zones.includes(zone);

    const glowPulse = Math.sin(Date.now() / 200) * 5 + 5;
    const isCritical = stress >= 85;
        if (isCritical) {
        ctx.shadowBlur = glowPulse;
        ctx.shadowColor = "#ff0000";
        } else {
        ctx.shadowBlur = 0;
        }

    const baseColor = stress < 40 ? "#4CAF50" : stress < 70 ? "#FF9800" : "#F44336";
    const color = flash ? "#FF0000" : baseColor;
    ctx.fillStyle = color;
    ctx.fillRect(40, y, 220, 30);
    ctx.strokeStyle = stress < 40 ? "#00ffcc" :
        stress < 70 ? "#ffaa00" :
        "#ff2222";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, y, 220, 30);

    if (underThreat) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(38, y - 2, 224, 34);
    }

    ctx.fillStyle = "#fff";
    ctx.fillText(`${zone}: ${stress}%`, 50, y + 20);
    i++;
  }
}

  function drawTraits() {
    ctx.fillStyle = "#fff";
    ctx.font = "16px monospace";
    ctx.fillText("Traits:", 40, canvas.height - 130);
    traits.forEach((trait, i) => {
      const x = 40 + i * 220;
      const y = canvas.height - 100;
      ctx.fillStyle = trait.cooldown > 0 ? "#666" : "#2196F3";
      if (localStorage.getItem("synergyTraits")?.includes(trait.name)) {
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 200, 60);
      }

      ctx.fillRect(x, y, 200, 60);
      if (trait.cooldown > 0) {
        const cdPercent = trait.cooldown / 8;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(x, y, 200 * cdPercent, 60);
      }

      ctx.fillStyle = "#fff";
      ctx.fillText(`${trait.name}`, x + 10, y + 25);
      ctx.fillText(`Zone: ${trait.zone}`, x + 10, y + 45);
    });
  }

  function drawGameScreen() {
    updateGame();
    if (gamePaused || popupVisible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHeader();
    drawZones();
    drawTraits();
    if (popupVisible) drawFailurePopup();
    if (messageTimer > 0) {
  ctx.fillStyle = "#00ffc8ff";
  ctx.font = "20px monospace";
  ctx.fillText(statusMessage, canvas.width / 2 - 100, 80);
}
  }

  function drawFailurePopup() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);

  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);

  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`❌ Zone Failure: ${popupZone}`, canvas.width / 2 - 150, canvas.height / 2 - 40);
  ctx.font = "16px monospace";
  ctx.fillText("This zone has failed during this phase.", canvas.width / 2 - 150, canvas.height / 2);
  ctx.fillText("Click below to retry the same phase.", canvas.width / 2 - 150, canvas.height / 2 + 30);

  ctx.fillStyle = "#2196F3";
  ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 60, 120, 40);
  ctx.fillStyle = "#fff";
  ctx.fillText("🔁 Retry Phase", canvas.width / 2 - 50, canvas.height / 2 + 88);
}
function drawPhase4Summary() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "26px monospace";
  ctx.fillText("🧬 Final Evolution Report", canvas.width / 2 - 180, 60);

  const zoneKeys = Object.keys(zones);
  let healthyCount = 0;
  let mutationCount = 0;
  let y = 110;

  zoneKeys.forEach(zone => {
    const stress = zones[zone];
    let result = "";
    if (stress < 50) {
      result = "🟢 Stable";
      healthyCount++;
    } else if (stress < 85) {
      result = "🟡 Mild Mutation Risk";
    } else {
      result = "🔴 High Mutation Risk";
      mutationCount++;
    }
    ctx.fillText(`${zone}: ${stress}% - ${result}`, 60, y);
    y += 30;
  });
  const genomeStr = localStorage.getItem("playerGenome") || "Unknown";
  ctx.fillStyle = "#ccc";
  ctx.font = "16px monospace";
  ctx.fillText(`🧬 Final Genome: ${genomeStr}`, 60, y - 40);

  const survivalScore = Math.floor((healthyCount / zoneKeys.length) * 100);
    ctx.fillStyle = "#00FF99";
    ctx.font = "24px monospace";
    ctx.fillText(`🎉 Survival Score: ${survivalScore}% 🎉`, 60, y + 20);


  if (survivalScore >= 80) {
  ctx.fillStyle = "#00bfff";
  ctx.fillText("🔓 Bonus Trait Unlocked: Environmental Sensor", 60, y + 50);
  localStorage.setItem("bonusTrait", "Environmental Sensor");
}
localStorage.setItem("evolutionTrialComplete", "true");
localStorage.setItem("evolutionTrialSummary", JSON.stringify({
  survivalScore,
  failedZones: [...failedZones],
  traitStats
}));

  ctx.fillStyle = "#fff";
  ctx.fillText("📊 Trait Efficiency:", 60, y + 90);
  let ty = y + 120;
  for (let t in traitStats) {
    const used = traitStats[t].used;
    const eff = traitStats[t].effective;
    const effP = used ? Math.floor((eff / used) * 100) : 0;
    ctx.fillText(`🔹 ${t}: ${eff}/${used} (${effP}%)`, 60, ty);
    ty += 25;
  }

    ctx.fillStyle = "#00ffff";
    ctx.fillText("🔁 Click to return to start.", 60, ty + 30);
    localStorage.setItem("evolutionTrialsComplete", "true");
    if (survivalScore >= 70) {
    ctx.fillStyle = "#00ff99";
    ctx.fillText("🌍 Terraforming Unlocked!", 60, ty + 60);
    localStorage.setItem("terraformingUnlocked", "true");
    ctx.font = "18px monospace";
    ctx.fillStyle = `hsl(${Date.now() / 50 % 360}, 100%, 70%)`;
    ctx.fillText("🌱 Planetary Engine Activated", 60, ty + 90);
    }
    // Draw "Retry" Button
    ctx.fillStyle = "#f44336"; // red
    ctx.fillRect(canvas.width - 300, canvas.height - 80, 120, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "18px monospace";
    ctx.fillText("🔁 Retry", canvas.width - 280, canvas.height - 50);

    // Draw "Continue" Button
    ctx.fillStyle = "#4CAF50"; // green
    ctx.fillRect(canvas.width - 160, canvas.height - 80, 120, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("✅ Continue", canvas.width - 140, canvas.height - 50);

   }

  function gameLoop() {
    if (!gameStarted && !gameOver) {
      drawStartScreen();
    } else if (gameOver) {
  if (showFinalSummary) {
    drawPhase4Summary();
  } else {
    drawGameOver();
  }
}
 else {
      drawGameScreen();
    }
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
})();
