(function () {
  if (!localStorage.getItem("bioForgeComplete")) {
  alert("❌ You must complete BioForge before starting Trait Drafting.");
  window.location.href = "/index.html"; 
}

  const speciesData = [
    {
      name: "Camel",
      traits: [
        { name: "Water Storage", cost: 8, importance: "Stores water in hump for desert survival." },
        { name: "Nasal Heat Exchange", cost: 5, importance: "Reduces water loss through respiration." },
        { name: "Thick Eyelashes", cost: 3, importance: "Protects from desert sandstorms." }
      ]
    },
    {
      name: "Tardigrade",
      traits: [
        { name: "Cryptobiosis", cost: 10, importance: "Survives extreme radiation and vacuum." },
        { name: "UV Resistance Protein", cost: 7, importance: "Prevents DNA damage from UV rays." },
        { name: "Desiccation Survival", cost: 6, importance: "Endures complete dehydration." }
      ]
    },
    {
      name: "Cactus",
      traits: [
        { name: "Water Retention Tissue", cost: 6, importance: "Stores water efficiently in arid zones." },
        { name: "Spines", cost: 3, importance: "Protects from herbivores and reduces water loss." },
        { name: "Shallow Roots", cost: 4, importance: "Quickly absorbs surface rain." }
      ]
    },
    {
      name: "Polar Bear",
      traits: [
        { name: "Fat Insulation", cost: 6, importance: "Thick fat keeps body warm in arctic cold." },
        { name: "White Fur Camouflage", cost: 3, importance: "Helps in stealth during hunting." },
        { name: "Large Paws", cost: 4, importance: "Distributes weight on snow and aids swimming." }
      ]
    },
    {
      name: "Gecko",
      traits: [
        { name: "Sticky Toe Pads", cost: 5, importance: "Allows climbing on vertical surfaces." },
        { name: "Tail Autotomy", cost: 4, importance: "Detachable tail for predator distraction." },
        { name: "Nocturnal Vision", cost: 4, importance: "Enhanced vision in low light." }
      ]
    },
    {
      name: "Octopus",
      traits: [
        { name: "Camouflage Skin", cost: 7, importance: "Changes color/texture to blend in." },
        { name: "Jet Propulsion", cost: 5, importance: "Quick burst movement in water." },
        { name: "Flexible Body", cost: 4, importance: "Squeezes through tight spaces." }
      ]
    },
    {
      name: "Elephant",
      traits: [
        { name: "Tusks", cost: 6, importance: "Used for defense and digging." },
        { name: "Big Ears", cost: 3, importance: "Radiate heat for cooling." },
        { name: "Thick Skin", cost: 4, importance: "Protects from insects and sun." }
      ]
    },
    {
      name: "Dolphin",
      traits: [
        { name: "Echolocation", cost: 6, importance: "Detects objects via sound waves." },
        { name: "Social Intelligence", cost: 5, importance: "Highly cooperative group behavior." },
        { name: "Streamlined Body", cost: 4, importance: "Minimizes drag for efficient swimming." }
      ]
    },
    {
      name: "Penguin",
      traits: [
        { name: "Countershading", cost: 3, importance: "Dark/light pattern hides from predators." },
        { name: "Oil-Coated Feathers", cost: 4, importance: "Repels water, keeps them dry." },
        { name: "Huddling Behavior", cost: 3, importance: "Shares warmth in cold climates." }
      ]
    },
    {
      name: "Fennec Fox",
      traits: [
        { name: "Large Ears", cost: 3, importance: "Disperses heat and detects prey underground." },
        { name: "Burrowing Instinct", cost: 4, importance: "Creates cool shelters in desert heat." },
        { name: "Night Activity", cost: 3, importance: "Avoids daytime desert heat." }
      ]
    }
  ];

  let currentIndex = 0;
  let selectedTraits = [];
  let totalCost = 0;

  const traitSynergies = [
  ["Thick Skin", "Fat Insulation"],
  ["UV Resistance Protein", "Cryptobiosis"],
  ["Big Ears", "Night Activity"],
  ["Water Storage", "Water Retention Tissue"],
  ["Sticky Toe Pads", "Nocturnal Vision"]
 ];

 const traitConflicts = [
  ["Spines", "Flexible Body"],
  ["Slow Metabolism", "Adrenal Surge"],
  ["Desiccation Survival", "Fat Insulation"]
 ];
  const soundEffects = {
  error: new Audio("sounds/error.mp3"),
  skip: new Audio("sounds/skip.mp3"),
  complete: new Audio("sounds/complete.mp3")
};


  let timerInterval;
  let secondsLeft = 60;

  function getTraitIcon(name) {
    name = name.toLowerCase();
    if (name.includes("water") || name.includes("hydration")) return "💧";
    if (name.includes("fur") || name.includes("feathers") || name.includes("cold") || name.includes("insulation")) return "❄️";
    if (name.includes("uv") || name.includes("radiation") || name.includes("light")) return "☀️";
    if (name.includes("toe") || name.includes("escape") || name.includes("jet") || name.includes("vision")) return "⚡";
    if (name.includes("intelligence") || name.includes("brain")) return "🧠";
    if (name.includes("protein") || name.includes("dna")) return "🔬";
    if (name.includes("thick") || name.includes("fat") || name.includes("defense")) return "🛡️";
    return "🧬";
  }

function applyButtonAnimations() {
  document.querySelectorAll("button").forEach(btn => {
    btn.style.transition = "transform 0.2s ease, background-color 0.3s ease";
    btn.addEventListener("mouseover", () => {
      btn.style.transform = "scale(1.08)";
      btn.style.backgroundColor = "#dcecff";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.transform = "scale(1)";
      btn.style.backgroundColor = "";
    });
  });
}

  function renderStartScreen(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div style="text-align:center; max-width:600px; margin:auto;">
        <style>@keyframes flash { 0% {opacity: 1;} 50% {opacity: 0.3;} 100% {opacity: 1;} }</style>
        <h2>🧬 Trait Extraction Lab</h2>
        <p>Select 1 trait per species. You have 50 total points and 1 minute.</p>
        <button id="viewUnlockedBtn">🔍 View Unlocked Traits</button>
        <button id="startGameBtn">▶️ Start Game</button>
        <div id="traitListModal" style="display:none; margin-top:20px;"></div>
      </div>
    `;
    document.getElementById("viewUnlockedBtn").onclick = showUnlockedTraits;
    document.getElementById("startGameBtn").onclick = () => {
      startTimer(containerId);
      renderSpeciesCard(containerId);
      applyButtonAnimations()
    };
  }

  function showUnlockedTraits() {
    const data = JSON.parse(localStorage.getItem('geneBankData') || '[]');
    const modal = document.getElementById("traitListModal");
    if (data.length === 0) {
      modal.innerHTML = "<p>No traits unlocked yet from previous modules.</p>";
    } else {
      modal.innerHTML = `<h3>Unlocked Traits:</h3><ul>${data.map(tr => `<li>${tr}</li>`).join('')}</ul>`;
    }
    modal.style.display = "block";
  }

  function renderSpeciesCard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const species = speciesData[currentIndex];
    const budgetLeft = 50 - totalCost;

    container.innerHTML = `
      <div style="max-width:700px; margin:auto; text-align:center;">
        <h3>⏳ Time Left: <span id="timerDisplay">${secondsLeft}s</span></h3>
        <h2>🧬 ${species.name}</h2>
        <p><strong>Points Remaining:</strong> ${budgetLeft}</p>
        <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
          ${species.traits.map((trait, index) => {
  const icon = getTraitIcon(trait.name);
  const barWidth = Math.min(100, trait.cost * 10); 
  return `
    <div class="trait-card" data-index="${index}" style="border:1px solid #ccc; padding:10px; width:180px; background:#fff; box-shadow:0 2px 6px rgba(0,0,0,0.1); cursor:pointer; border-radius:8px;">
      <h4>${icon} ${trait.name}</h4>
      <p><em>${trait.importance}</em></p>
      <p>Cost: ${trait.cost}</p>
      <div style="height:8px; background:#eee; border-radius:4px; margin-top:6px;">
        <div style="width:${barWidth}%; height:100%; background:#4caf50; border-radius:4px;"></div>
      </div>
    </div>`;
}).join('')}
        </div>
        <button id="skipBtn" style="margin-top:20px;">⏭️ Skip Species</button>
      </div>
    `;

    document.querySelectorAll('.trait-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-index'));
        const chosenTrait = species.traits[index];
        if (totalCost + chosenTrait.cost <= 50) {
          selectedTraits.push(chosenTrait);
          totalCost += chosenTrait.cost;
          nextSpecies(containerId);
        } else {
          soundEffects.error.play();
          alert("Not enough points remaining.");
        }
      });
    });

    document.getElementById("skipBtn").onclick = () => nextSpecies(containerId);
    applyButtonAnimations()
  }

  function nextSpecies(containerId) {
    currentIndex++;
    if (currentIndex < speciesData.length) {
      renderSpeciesCard(containerId);
    } else {
      clearInterval(timerInterval);
      showSummary(containerId);
    }
  localStorage.setItem("traitDraftProgress", JSON.stringify({
  currentIndex,
  selectedTraits,
  totalCost,
  secondsLeft
}));

  }

  function showSummary(containerId) {
    soundEffects.complete.play();
    const container = document.getElementById(containerId);
    if (!container) return;
    localStorage.setItem('selectedTraitsDraft', JSON.stringify(selectedTraits));
    localStorage.setItem('selectedTraits', JSON.stringify(selectedTraits));
    localStorage.setItem('traitDraftingComplete', "true");
    showModulePopup("Trait Drafting COnsole"); 
    updateProgressBar();
    console.log("✅ Trait Drafting Complete:", selectedTraits);
    const draftScore = calculateTraitDraftScore(selectedTraits);

    localStorage.setItem("selectedTraits", JSON.stringify(selectedTraits.map(t => t.name)));
    localStorage.setItem("traitDraftingComplete", "true");
    localStorage.setItem("traitDraftSummary", JSON.stringify({
    traits: selectedTraits.map(t => t.name),
    synergy: draftScore.synergy,
    conflict: draftScore.conflict,
    score: draftScore.final
    })
  );

    container.innerHTML = `
      <div style="text-align:center; max-width:600px; margin:auto;">
        <h2>✅ Draft Complete</h2>
        <p>You selected ${selectedTraits.length} traits for a total cost of ${totalCost} / 50</p>
        <ul style="text-align:left;">
          ${selectedTraits.map(t => `<li><strong>${t.name}</strong>: ${t.importance} (Cost: ${t.cost})</li>`).join('')}
        </ul>
        <hr>
      <p><strong>Synergy Bonus:</strong> ${draftScore.synergy}</p>
      <p><strong>Conflict Penalty:</strong> -${draftScore.conflict}</p>
      <p><strong>Final Score:</strong> ${draftScore.final}</p>
        <p>Your final traits will affect the organism in the next stage.</p>
      </div>
    `;
    localStorage.setItem("traitDraftProgress", JSON.stringify({
    currentIndex,
    selectedTraits,
    totalCost,
    secondsLeft
  }));
    localStorage.removeItem("traitDraftProgress");

    applyButtonAnimations()
  }

  function calculateTraitDraftScore(traits) {
  const names = traits.map(t => t.name);
  let synergy = 0, conflict = 0;

  traitSynergies.forEach(pair => {
    if (names.includes(pair[0]) && names.includes(pair[1])) synergy += 10;
  });

  traitConflicts.forEach(pair => {
    if (names.includes(pair[0]) && names.includes(pair[1])) conflict += 8;
  });

  const base = traits.length * 5;
  const final = base + synergy - conflict;
  return { synergy, conflict, base, final };
 }

  function startTimer(containerId) {
    const timerDisplay = () => {
      const el = document.getElementById("timerDisplay");
      if (!el) return;
      el.textContent = `${secondsLeft}s`;
      if (secondsLeft <= 10) {
        el.style.color = 'red';
        el.style.fontWeight = 'bold';
        el.style.animation = 'flash 1s infinite';
      }
    };

    timerInterval = setInterval(() => {
      secondsLeft--;
      timerDisplay();
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        showSummary(containerId);
      }
    }, 1000);
  }

 window.loadTraitDraftingGame = function (containerId) {
    console.log("✅ Trait Drafting Game Loaded");

    const saved = localStorage.getItem("traitDraftProgress");

    if (saved) {
      const resumePrompt = confirm("🔄 Resume your previous Trait Drafting session?");
      if (resumePrompt) {
        const data = JSON.parse(saved);
        currentIndex = data.currentIndex || 0;
        selectedTraits = data.selectedTraits || [];
        totalCost = data.totalCost || 0;
        secondsLeft = data.secondsLeft || 60;
        startTimer(containerId);
        renderSpeciesCard(containerId);
        return;
      } else {
        localStorage.removeItem("traitDraftProgress");
      }
    }

    currentIndex = 0;
    selectedTraits = [];
    totalCost = 0;
    secondsLeft = 60;
    clearInterval(timerInterval);
    renderStartScreen(containerId);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const containerId = "canvas";
    const canvasEl = document.getElementById(containerId);
    if (canvasEl) {
      loadTraitDraftingGame(containerId);
    } else {
      console.error("Container element with ID 'canvas' not found.");
    }
  });
})();