(function () {
  if (!localStorage.getItem("traitDraftingComplete")) {
  alert("❌ You must complete Trait Drafting before starting DNA Synthesis.");
  window.location.href = "/index.html"; 
}
  const MAX_ENERGY = 50;
  const MAX_SLOTS = 8;

  let availableTraits = [];
  let selectedTraits = [];
  let totalEnergyUsed = 0;
  let undoBuffer = null;
  let score = 0;

  const REQUIRED_ZONES = ["brain", "heart", "genome"];
  const TRAIT_CLASSES = {
    defense: ["Hypercoagulation", "Skeletal Density"],
    sensory: ["Neural Redundancy"],
    mobility: ["Thermal Balance"],
    metabolism: ["Alkaline Tolerance"],
    memory: ["Adaptogenic Memory"]
  };
function playSound(file) {
  const audio = new Audio(`./sounds/${file}`);
  audio.volume = 0.5;
  audio.play();
}

  function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .trait-card {
        border: 1px solid #ccc;
        padding: 10px;
        background: white;
        border-radius: 8px;
        width: 180px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s;
      }
      .trait-card:hover {
        transform: scale(1.03);
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      }
      .slot {
        border: 2px solid #999;
        width: 160px;
        min-height: 80px;
        margin: 10px;
        padding: 10px;
        background: #ffffff;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
      }
      .slot.filled {
        background-color: #d0ffd0;
      }
      .dna-strand-container {
        margin-top: 20px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .strand-node {
        padding: 10px;
        border-radius: 50%;
        font-size: 18px;
        color: white;
        animation: pulse 0.8s infinite alternate;
        display: inline-block;
      }
        #healthFill {
          transition: width 0.4s ease-in-out;
          animation: glowHealth 1.4s infinite alternate;
        }

        @keyframes glowHealth {
          0% { box-shadow: 0 0 4px lime; }
          100% { box-shadow: 0 0 12px lime; }
        }

      @keyframes pulse {
        from { transform: scale(1); opacity: 0.8; }
        to { transform: scale(1.1); opacity: 1; }
      }
        .strand-node {
  padding: 10px;
  border-radius: 50%;
  font-size: 18px;
  color: white;
  animation: twist 1s infinite alternate ease-in-out;
  display: inline-block;
}

@keyframes twist {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(5px) rotate(15deg); }
}
  /* 📦 Trait slot boxes */
.slot {
  border: 2px dashed #007BFF;
  background-color: #d8f0ff; /* sky blue */
  color: black;
  padding: 10px;
  border-radius: 6px;
  width: 140px;
  height: 100px;
  margin: 10px;
  text-align: center;
  transition: background 0.3s ease;
}

/* 🧾 DNA Summary Font */
#dnaSummaryScreen {
  font-size: 1.05rem;
  line-height: 1.6;
}

/* 🧬 DNA Popup */
#dnaPopup {
  font-size: 1.1rem;
  padding: 24px;
  max-width: 650px;
  min-width: 350px;
}

/* 🧬 Base Pair Letter Animation */
#popupDNAstrand {
  font-size: 18px;
}

      #finalizeBtn, #undoBtn {
        margin: 10px 5px 20px 0;
        padding: 10px 16px;
        font-size: 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      #finalizeBtn { background-color: #4CAF50; color: white; }
      #undoBtn { background-color: #e0e0e0; color: black; }
      #undoBtn:hover { background-color: #d6d6d6; }
    `;
    document.head.appendChild(style);
  }

  function getZoneIcon(zone) {
    const icons = {
      brain: '🧠', heart: '❤️', muscle: '💪', genome: '🧬',
      lungs: '🫁', bone: '🦴', metabolism: '⚗️', immune: '🛡️',
      general: '🔹'
    };
    return icons[zone] || '🧬';
  }

  function getZoneColor(zone) {
    const colors = {
      brain: 'purple', heart: 'crimson', muscle: 'orange', genome: 'teal',
      lungs: 'skyblue', bone: 'brown', metabolism: 'green', immune: 'navy',
      general: 'gray'
    };
    return colors[zone] || 'black';
  }

  function getTraitClass(name) {
    for (const [key, list] of Object.entries(TRAIT_CLASSES)) {
      if (list.includes(name)) return key;
    }
    return "general";
  }
  function generateBasePairs(index) {
  const bases = ["A", "T", "G", "C"];
  const base = bases[index % bases.length];
  const pair = base === "A" ? "T" :
               base === "T" ? "A" :
               base === "G" ? "C" : "G";
  return [base, pair];
}

  function updateClassBalance() {
    const count = { defense: 0, sensory: 0, mobility: 0, metabolism: 0, memory: 0, general: 0 };
    selectedTraits.forEach(t => {
      const cls = getTraitClass(t.name);
      count[cls]++;
    });
    const summary = Object.entries(count).map(([k, v]) => `${k}: ${v}`).join(" | ");
    document.getElementById("classBalance").textContent = `Trait Classes → ${summary}`;
  }

  function checkZoneRequirements() {
    const presentZones = new Set(selectedTraits.flatMap(t => t.zones || []));
    const missing = REQUIRED_ZONES.filter(z => !presentZones.has(z));
    document.getElementById("zoneAlert").textContent = missing.length
      ? `⚠️ Missing key zones: ${missing.join(", ")}`
      : "";
  }

  function getAllTraitsFromStorage() {
    const draftTraits = JSON.parse(localStorage.getItem('selectedTraitsDraft') || '[]');
   const extraTraits = [
  { name: "Thermal Balance", cost: 5, importance: "Maintains internal temp.", zones: ["metabolism", "genome"] },
  { name: "Neural Redundancy", cost: 6, importance: "Backup brain processing.", zones: ["brain", "genome"] },
  { name: "Skeletal Density", cost: 3, importance: "Impact resistance.", zones: ["bone", "muscle"] },
  { name: "Hypercoagulation", cost: 4, importance: "Speeds wound healing.", zones: ["heart", "immune"] },
  { name: "Alkaline Tolerance", cost: 2, importance: "Survives toxic environments.", zones: ["immune", "metabolism"] },
  { name: "Adaptogenic Memory", cost: 7, importance: "Stores useful mutations.", zones: ["brain", "genome"] },
  { name: "DNA Repair Enzyme", cost: 4, importance: "Reduces mutation errors.", zones: ["genome", "immune"] },
  { name: "Oxygen Reservoir", cost: 3, importance: "Stores oxygen for low-air zones.", zones: ["lungs", "heart"] },
  { name: "Thermal Insulation", cost: 2, importance: "Minimizes energy loss in cold.", zones: ["muscle", "metabolism"] },
  { name: "Radiation Hardened Cells", cost: 5, importance: "Protects DNA from radiation.", zones: ["genome", "immune"] }
];
  
    return [...draftTraits, ...extraTraits];
  }


  function renderDNAUI(containerId) {
    injectStyles();
    const container = dnaGameContainer || document.getElementById(containerId);
    const canvasEl = document.getElementById(containerId);
    if (!container) return;
    container.style.backgroundColor = "#88E788";

    availableTraits = getAllTraitsFromStorage();
    selectedTraits = [];
    totalEnergyUsed = 0;

    container.innerHTML = `
      <h2>🧬 DNA Synthesis Lab</h2>
      <div id="zoneAlert" style="color:red;font-weight:bold;"></div>
      <p>Select up to ${MAX_SLOTS} traits. Max energy: ${MAX_ENERGY}</p>
      <div><strong>Energy Used:</strong> <span id="energyUsed">0</span> / ${MAX_ENERGY}</div>
      <div id="classBalance" style="margin:10px 0; font-size:14px;"></div>
      <div id="dnaSlots" style="display:flex; flex-wrap:wrap; gap:10px; margin:20px 0;"></div>
      <h3>Available Traits</h3>
      <div id="traitPool" style="display:flex; flex-wrap:wrap; gap:10px;"></div>
      <button id="finalizeBtn" onclick="finalizeDNA()">🧬 Finalize DNA</button>
      <button id="undoBtn" style="display:none;">↩️ Undo </button>
      <div id="resultMessage"></div>
      <div id="dnaStrand" class="dna-strand-container"></div>
      <div style="margin-top:10px;">
        <div style="width:100%;background:#eee;height:20px;border-radius:10px;">
          <div id="healthBar" style="height:100%;width:0%;background:limegreen;border-radius:10px;"></div>
        </div>
      </div>
    `;
    container.innerHTML += `
  <div id="dnaSummaryScreen" style="display:none; margin-top:20px;"></div>
`;
container.innerHTML += `
  <div id="dnaPopup" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);
    background:white; border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.4); padding:20px; z-index:9999; max-width:600px;">
    <h3 style="margin-top:0;">🧬 DNA Blueprint</h3>
    <div id="popupDNAstrand" class="dna-strand-container" style="margin:10px 0;"></div>
    <pre id="popupDNAtext" style="background:#f5f5f5; padding:10px; border:1px solid #ccc; border-radius:6px; overflow-x:auto;"></pre>
    <div id="dnaPopup" ...>
  <h3>🧬 DNA Blueprint</h3>
  <div id="popupDNAstrand" ...></div>
  <pre id="popupDNAtext" ...></pre>
  <button onclick="closeDNAModal()">Close</button>
</div>
    <button onclick="closeDNAModal()" style="margin-top:10px; padding:6px 12px;">Close</button>
  </div>
`;

    renderTraitPool();
    renderDNASlots();
    updateDNAStrand();
    checkZoneRequirements();
    updateClassBalance();

    document.getElementById("finalizeBtn").onclick = finalizeDNA;
    document.getElementById("undoBtn").onclick = () => {
      if (!undoBuffer) return;
      if (undoBuffer.type === "remove") {
        selectedTraits.splice(undoBuffer.index, 0, undoBuffer.trait);
        totalEnergyUsed += undoBuffer.trait.cost;
      } else if (undoBuffer.type === "add") {
        selectedTraits.pop();
        availableTraits.splice(undoBuffer.index, 0, undoBuffer.trait);
        totalEnergyUsed -= undoBuffer.trait.cost;
      }
      undoBuffer = null;
      updateUI();
      injectStrandAnimationStyles();
    };
  }

  function injectStrandAnimationStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .dna-strand-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 20px;
    }
    .strand-node {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 20px;
      font-weight: bold;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: floatDNA 1.6s infinite ease-in-out alternate;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
      transform-origin: center;
    }
    @keyframes floatDNA {
      0%   { transform: translateY(0px) rotate(0deg); }
      100% { transform: translateY(-8px) rotate(12deg); }
    }
  `;
  document.head.appendChild(style);
}

  function renderTraitPool() {
  const pool = document.getElementById("traitPool");
  pool.innerHTML = '';
  availableTraits.forEach((trait, index) => {
    const div = document.createElement("div");
    div.className = "trait-card";
    div.draggable = true;
    div.ondragstart = e => e.dataTransfer.setData("index", index);
    div.title = `${trait.name}: ${trait.importance}. Class: ${getTraitClass(trait.name)}`;
    const zones = trait.zones || ["general"];
    const zoneTags = zones.map(z => `<span style='padding:2px 6px; background:${getZoneColor(z)}; color:white; border-radius:6px;'>${getZoneIcon(z)} ${z}</span>`).join(' ');
    div.innerHTML = `
      <strong>${trait.name}</strong><br>
      <em>${trait.importance}</em><br>
      Cost: ${trait.cost}<br>
      ${zoneTags}`;
    pool.appendChild(div);
  });
}
function addTraitToSlot(i, trait) {
  if (selectedTraits.length >= MAX_SLOTS) return alert("All slots are filled.");
  if (totalEnergyUsed + trait.cost > MAX_ENERGY) return alert("Not enough energy.");
  undoBuffer = { type: "add", trait, index: i };
  selectedTraits[i] = trait;
  totalEnergyUsed += trait.cost;
  playSound('add.mp3');
  localStorage.setItem("dnaProgress", JSON.stringify({
  traits: selectedTraits,
  energy: totalEnergyUsed
}));

  updateUI();
}

  function renderDNASlots() {
  const slots = document.getElementById("dnaSlots");
  slots.innerHTML = '';
  for (let i = 0; i < MAX_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.id = `slot-${i}`;
    slot.textContent = selectedTraits[i] ? selectedTraits[i].name : `Slot ${i + 1}`;
    if (selectedTraits[i]) slot.classList.add("filled");
    slot.ondragover = e => e.preventDefault();
    slot.ondrop = e => {
      const traitIndex = +e.dataTransfer.getData("index");
      const trait = availableTraits.splice(traitIndex, 1)[0];
      addTraitToSlot(i, trait);
    };
    slot.onclick = () => {
      if (selectedTraits[i]) removeTraitFromSlot(i);
    };
    slots.appendChild(slot);
  }
}

  function removeTraitFromSlot(i) {
    undoBuffer = { type: "remove", trait: selectedTraits[i], index: i };
    const removed = selectedTraits.splice(i, 1)[0];
    availableTraits.push(removed);
    totalEnergyUsed -= removed.cost;
    localStorage.setItem("dnaProgress", JSON.stringify({
    traits: selectedTraits,
    energy: totalEnergyUsed
    }));
    updateUI();
  }

  function updateUI() {
    document.getElementById("energyUsed").textContent = totalEnergyUsed;
    renderTraitPool();
    renderDNASlots();
    updateDNAStrand();
    checkZoneRequirements();
    updateClassBalance();
    updateHealthBar();
    document.getElementById("undoBtn").style.display = undoBuffer ? "inline-block" : "none";
  }

function updateDNAStrand() {
  const strand = document.getElementById("dnaStrand");
  if (!strand) return;

  const synergyActive = selectedTraits.some(t =>
  (t.zones || []).includes("brain") &&
  selectedTraits.find(x => x !== t && (x.zones || []).includes("genome"))
  );

  strand.innerHTML = selectedTraits.map((t, i) => {
    const zone = t.zones?.[0] || "general";
    const icon = getZoneIcon(zone);
    const bg = getZoneColor(zone);
    const highlight = synergyActive && (t.zones?.includes("brain") || t.zones?.includes("genome"));
    return `<span class="strand-node" style="background:${bg}; ${highlight ? 'box-shadow: 0 0 12px gold;' : ''}">${icon}</span>`;
  }).join('');
}

  function calculateScore() {
    const zonesCovered = new Set();
    let synergy = 0;
    let bonus = 0;
    let penalty = 0;
    selectedTraits.forEach(t => {
      if (t.zones?.length) zonesCovered.add(t.zones[0]);
      if (!t.hasOwnProperty("draftIndex")) bonus += 2;
      if (t.zones?.includes("genome") && selectedTraits.find(x => x !== t && x.zones?.includes("brain"))) synergy += 10;
      if (t.name.toLowerCase().includes("cold") && selectedTraits.find(x => x !== t && x.name.toLowerCase().includes("heat"))) penalty += 5;
    });
    const zoneScore = zonesCovered.size * 5;
    const energyScore = totalEnergyUsed <= MAX_ENERGY ? 5 : 0;
    const score = Math.min(100, zoneScore + synergy + bonus + energyScore - penalty);
    document.getElementById("healthBar").style.width = score + "%";
    return score;
  }

  function finalizeDNA() {
  if (selectedTraits.length < 4) {
    alert("You must select at least 4 traits.");
    return;
  }

  const score = calculateScore(); 
  
  localStorage.setItem('finalDNASequence', JSON.stringify(selectedTraits));
  localStorage.setItem('dnaSynthesisScore', score.toString());
  localStorage.setItem('dnaSynthesisComplete', "true");
  showModulePopup("DNA Synthesis Lab");
  updateProgressBar();
  localStorage.setItem("dashboardStatus", "DNA Synthesis Complete");

  playSound('finalize.mp3');

  const message =
    score >= 80 ? '🌟 Excellent organism blueprint!' :
    score >= 60 ? '🌿 Stable but improvable DNA' :
    '⚠️ May struggle in extreme environments';

  
  const classCounts = {};
    selectedTraits.forEach(trait => {
  const traitClass = trait.class || "Unknown";
    classCounts[traitClass] = (classCounts[traitClass] || 0) + 1;
    });


  const scoreBreakdown = [`🧬 Total Score: ${score}%`, message];
  if (Object.values(classCounts).some(count => count === 0)) {
    score -= 5;
    scoreBreakdown.push("⚠️ Class imbalance: -5");
  }

  const synergyList = [];
  const bonusCount = selectedTraits.filter(t => !t.hasOwnProperty("draftIndex")).length;
  const bonusBoost = bonusCount * 2;

  const zones = selectedTraits.flatMap(t => t.zones || []);
  const names = selectedTraits.map(t => t.name.toLowerCase());

  if (zones.includes("brain") && zones.includes("genome"))
    synergyList.push("🧠 Brain + 🧬 Genome → Neural Synergy Boost");
  if (zones.includes("immune") && zones.includes("metabolism"))
    synergyList.push("🛡️ Immune + ⚗️ Metabolism → Toxin Resistance Combo");

  const summary = document.getElementById("dnaSummaryScreen");
  summary.innerHTML = `
    <div style="background:#f9fdf9; border-radius:12px; padding:24px; box-shadow:0 0 12px rgba(0,0,0,0.2);">
      <h2 style="text-align:center;">🧬 <span style="color:green;">DNA Summary</span></h2>
      <p style="font-size:18px;"><strong>🧪 Survival Score:</strong> 
        <span style="color:${score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'};">${score}%</span></p>
      <p><strong>📊 Health Assessment:</strong> ${message}</p>
      <div style="background:#ddd; height:20px; border-radius:10px; margin:10px 0;">
        <div id="healthFill" style="width:${score}%; height:100%; background:limegreen; border-radius:10px; transition: width 0.6s;"></div>
      </div>

      <hr style="margin:20px 0;">

      <h3>🧬 DNA Codon Sequence</h3>
      <pre style="background:#fff;border:1px solid #ccc;padding:10px;border-radius:6px;max-width:600px;overflow-x:auto;">
${selectedTraits.map((t, i) => {
  const zones = (t.zones || ["General"]).join(" | ");
  return `[${zones}] ${t.name} (Cost: ${t.cost})`;
}).join("\n")}
      </pre>

      <div style="margin-top: 30px; font-weight: bold; font-size: 18px; text-align:center;">✅ DNA Synthesis Completed!</div>

      <div style="margin-top: 25px; text-align:center;">
        <button id="returnToLabBtn" class="back-button" style="margin-left:10px;">🏠 Return to Lab</button>
      </div>
    </div>
  `;

  document.getElementById("returnToLabBtn").onclick = () => {
  window.location.href = "/index.html"; 
};
  document.getElementById("zoneAlert").style.display = "none";
  document.getElementById("dnaSlots").style.display = "none";
  document.getElementById("traitPool").style.display = "none";
  document.getElementById("finalizeBtn").style.display = "none";
  document.getElementById("undoBtn").style.display = "none";
  document.getElementById("classBalance").style.display = "none";
  document.getElementById("dnaStrand").style.display = "none";
  
  if (!summary) {
  console.error("❌ dnaSummaryScreen element not found!");
  return;
  }

  summary.style.display = "block";

}
function updateHealthBar() {
  const fillEl = document.getElementById("healthFill");
  const barEl = document.getElementById("healthBar");
  const percentage = Math.min(100, (totalEnergyUsed / MAX_ENERGY) * 100);

  if (fillEl) fillEl.style.width = `${percentage}%`;
  if (barEl) barEl.style.width = `${percentage}%`;
}


window.toggleDNASequence = function () {
  const modal = document.getElementById("dnaPopup");
  const strand = document.getElementById("popupDNAstrand");
  const codons = document.getElementById("popupDNAtext");

  playSound('reveal.mp3');

  modal.style.display = "block";

  strand.innerHTML = selectedTraits.map((t, i) => {
    const zone = t.zones?.[0] || "general";
    const icon = getZoneIcon(zone);
    const color = getZoneColor(zone);
    const offset = i % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)';
    const [base, pair] = generateBasePairs(i);
return `
  <div style="display:inline-block; text-align:center; animation-delay:${i * 0.1}s;">
    <div style="color:${color}; font-weight:bold; font-size:16px;">${base}</div>
    <div style="height:10px; border-left: 2px solid ${color}; margin: 2px auto;"></div>
    <div style="color:${color}; font-weight:bold; font-size:16px;">${pair}</div>
  </div>
`;
 }).join('');

  codons.textContent = selectedTraits.map((t, i) => {
  const codon = generateCodon(i);
  return `Codon ${codon} → ${t.name}`;
}).join("\n");
};

window.closeDNAModal = function () {
  document.getElementById("dnaPopup").style.display = "none";
};

window.loadDNASynthesisLab = function (containerId) {
  const saved = JSON.parse(localStorage.getItem("dnaProgress") || "null");
  if (saved && confirm("Resume previous DNA synthesis session?")) {
    availableTraits = getAllTraitsFromStorage().filter(t =>
      !saved.traits.some(st => st.name === t.name)
    );
    selectedTraits = saved.traits;
    totalEnergyUsed = saved.energy || 0;
  }
  renderDNAUI(containerId);
};
})();
