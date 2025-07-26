if (!localStorage.getItem("dnaSynthesisComplete")) {
  alert("❌ Please complete DNA Synthesis first.");
  window.location.href = "/index.html";
}

window.loadEvolutionTrials = function () {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Guess zone from trait name
  function guessZone(name) {
    name = name.toLowerCase();
    if (name.includes("lung")) return "Lungs";
    if (name.includes("skin") || name.includes("melanin")) return "Skin";
    if (name.includes("genome") || name.includes("dna")) return "Genome";
    if (name.includes("heart") || name.includes("adrenal")) return "Heart";
    if (name.includes("immune")) return "Immune";
    if (name.includes("brain")) return "Brain";
    if (name.includes("muscle")) return "Muscle";
    return "Skin";
  }

  // Zones (initialize cleanly)
  const zones = {
    Brain: 0, Heart: 0, Genome: 0, Skin: 0,
    Lungs: 0, Immune: 0, Muscle: 0
  };
  const smoothZones = JSON.parse(JSON.stringify(zones));
  const failedZones = new Set();

  // Load traits safely
  const traits = (JSON.parse(localStorage.getItem("finalDNASequence") || "[]") || []).map(trait => {
    const name = typeof trait === "string" ? trait : trait.name;
    const rawZone = typeof trait === "string" ? guessZone(trait) : trait.zone || guessZone(trait.name);
    const zone = String(rawZone);

    if (!(zone in zones)) zones[zone] = 0;

    return {
      name,
      zone,
      cooldown: 0,
      energyCost: 3
    };
  });

  const bonusTrait = localStorage.getItem("bonusTrait");
  if (bonusTrait === "Environmental Sensor") {
    traits.push({ name: bonusTrait, zone: "Immune", cooldown: 0, energyCost: 2 });
  }

  const traitStats = {};
  traits.forEach(t => traitStats[t.name] = { used: 0, effective: 0 });

  // DEBUG LOGS
  console.log("Zones initialized:", Object.keys(zones));
  console.log("Loaded Traits:", traits.map(t => `${t.name} → ${t.zone}`));

  const phases = [
    { name: "Radiation Surge", threats: ["Radiation", "Genome Instability"], zones: ["Genome", "Skin"] },
    { name: "Frozen Highlands", threats: ["Cold Shock", "Tissue Stiffening"], zones: ["Heart", "Muscle"] },
    { name: "Acidic Swamp", threats: ["Skin Corrosion", "Toxic Absorption"], zones: ["Skin", "Immune"] },
    { name: "Thin Atmosphere", threats: ["Hypoxia", "Oxygen Starvation"], zones: ["Heart", "Lungs"] },
    { name: "UV Flare Field", threats: ["UV Burn", "Cell Mutation"], zones: ["Skin", "Genome"] }
  ];

  let currentPhaseIndex = 0;
  let energy = 12;
  let timer = 15; // ⏳ Reduced timer
  let gameStarted = false;
  let gameOver = false;
  let gamePaused = false;
  let popupVisible = false;
  let popupZone = "";
  let statusMessage = "";
  let messageTimer = 0;
  let lastUpdate = Date.now();

  function useTrait(trait) {
    if (trait.cooldown > 0 || energy < trait.energyCost) return;

    const phase = phases[currentPhaseIndex];
    traitStats[trait.name].used++;

    if (phase.zones.includes(trait.zone) && zones[trait.zone] >= 30) {
      zones[trait.zone] = Math.max(0, zones[trait.zone] - 25);
      traitStats[trait.name].effective++;
      statusMessage = `✅ ${trait.name} worked`;
    } else {
      statusMessage = `❌ ${trait.name} failed`;
    }

    trait.cooldown = 8;
    energy -= trait.energyCost;
    messageTimer = 3;
  }

  function updateGame() {
    const now = Date.now();
    if (now - lastUpdate >= 1000) {
      timer--;
      traits.forEach(t => { if (t.cooldown > 0) t.cooldown--; });
      if (messageTimer > 0) messageTimer--;

      const phase = phases[currentPhaseIndex];
      phase.zones.forEach(z => {
        const increment = 1.2 + Math.random() * 0.8; // ⬅️ Slower stress increase
        zones[z] = Math.min(100, zones[z] + increment);
        if (zones[z] >= 100 && !failedZones.has(z)) {
          failedZones.add(z);
          popupVisible = true;
          popupZone = z;
          gamePaused = true;
        }
      });

      if (timer <= 0) {
        if (++currentPhaseIndex >= phases.length || failedZones.size >= 3) {
          gameOver = true;
        } else {
          timer = 15; // ⏳ reset for next phase
        }
      }

      lastUpdate = now;
    }
  }

  function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "36px monospace";
    ctx.fillText("🧬 Evolution Trials", canvas.width / 2 - 160, canvas.height / 2 - 40);
    ctx.font = "20px monospace";
    ctx.fillText("Click to Start the Trial", canvas.width / 2 - 110, canvas.height / 2 + 10);
  }

  function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.fillText("Trial Complete", canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = "18px monospace";
    ctx.fillText("Summary screen coming soon...", canvas.width / 2 - 120, canvas.height / 2 + 20);
  }

  function drawHeader() {
    const phase = phases[currentPhaseIndex];
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText(`🌍 Phase: ${phase.name}`, 40, 40);
    ctx.fillText(`⚡ Energy: ${energy}`, canvas.width - 220, 40);
    ctx.fillText(`⏳ Time: ${timer}s`, canvas.width - 220, 65);
  }

  function drawZones() {
    let i = 0;
    for (let zone in zones) {
      smoothZones[zone] += (zones[zone] - smoothZones[zone]) * 0.1;
      const stress = smoothZones[zone];
      const y = 100 + i * 50;

      ctx.fillStyle = stress < 40 ? "#4CAF50" : stress < 70 ? "#FF9800" : "#F44336";
      ctx.fillRect(40, y, 220, 30);
      ctx.strokeStyle = "#00ffcc";
      ctx.strokeRect(40, y, 220, 30);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${zone}: ${Math.round(stress)}%`, 50, y + 20);
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
      ctx.fillRect(x, y, 200, 60);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${trait.name}`, x + 10, y + 25);
      ctx.fillText(`Zone: ${trait.zone}`, x + 10, y + 45);
    });
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (!gameStarted) {
      gameStarted = true;
      return;
    }

    if (gameOver) return;

    const y = canvas.height - 100;
    traits.forEach((trait, i) => {
      const x = 40 + i * 220;
      if (mx >= x && mx <= x + 200 && my >= y && my <= y + 60) {
        useTrait(trait);
      }
    });
  });

  function gameLoop() {
    if (!gameStarted && !gameOver) drawStartScreen();
    else if (gameOver) drawGameOverScreen();
    else {
      if (!gamePaused && !popupVisible) updateGame();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawHeader();
      drawZones();
      drawTraits();

      if (messageTimer > 0) {
        ctx.fillStyle = "#00ffc8";
        ctx.font = "20px monospace";
        ctx.fillText(statusMessage, canvas.width / 2 - 100, 80);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
};
