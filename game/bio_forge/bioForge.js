(function() {

 if (!localStorage.getItem("genomeComplete")) {
  alert("❌ You must complete the Genome Editor before accessing BioForge.");
  window.location.href = "/index.html"; 
}

  const conditionData = {
    "Water Overload": {
      description: "The body has excess water. It needs to reduce water retention to avoid cellular damage.",
      options: ["Activate aquaporins", "Increase sweat rate", "Store water in vacuole", "Suppress ADH"],
      correct: "Suppress ADH",
      effect: "Suppressing ADH reduces water reabsorption in kidneys, helping expel excess water."
    },
    "Cold": {
      description: "Low temperature environment. The organism needs to maintain core body temperature.",
      options: ["Increase metabolism", "Dilate blood vessels", "Sweat more", "Hibernate"],
      correct: "Increase metabolism",
      effect: "Higher metabolism generates internal heat, aiding survival in cold environments."
    },
    "Low Oxygen": {
      description: "Oxygen availability is reduced, especially at high altitudes.",
      options: ["Increase heart rate", "Increase hemoglobin", "Hyperventilate", "Hold breath"],
      correct: "Increase hemoglobin",
      effect: "Elevated hemoglobin improves oxygen transport under hypoxic conditions."
    },
    "UV Exposure": {
      description: "Excessive UV radiation exposure can damage cells and DNA.",
      options: ["Produce melanin", "Increase sweating", "Widen pupils", "Decrease blood flow"],
      correct: "Produce melanin",
      effect: "Melanin absorbs harmful UV rays, protecting underlying tissues."
    },
    "High Salt": {
      description: "The environment has high salt concentration, leading to cellular dehydration.",
      options: ["Drink more water", "Accumulate solutes", "Open salt channels", "Decrease urine output"],
      correct: "Accumulate solutes",
      effect: "Accumulating solutes balances internal osmolarity and prevents water loss."
    },
    "Dehydration": {
      description: "The body is losing water faster than it's being replenished.",
      options: ["Suppress ADH", "Drink seawater", "Increase ADH", "Sweat more"],
      correct: "Increase ADH",
      effect: "ADH helps conserve water by promoting reabsorption in the kidneys."
    }
  };
  const iconMap = {
  "Water Overload": "💧",
  "Cold": "❄️",
  "Low Oxygen": "🫁",
  "UV Exposure": "☀️",
  "High Salt": "🧂",
  "Dehydration": "🥵"
};

block.innerHTML = `${iconMap[condition] || "🧪"} ${condition}`;
const geneBtn = document.createElement("button");
geneBtn.textContent = "🧬 Gene Bank";
geneBtn.style = "position:fixed; bottom:20px; right:20px; padding:10px 15px; background:black; color:lime; font-family:monospace; border:1px solid lime; cursor:pointer;";
geneBtn.onclick = () => {
  document.getElementById("geneBank").innerHTML = `
    <h3>🧬 Adapted Conditions:</h3>
    <ul>${geneBankData.map(g => `<li>${g}</li>`).join("")}</ul>
    <button class="back-button" onclick="goBack()">🔙 Back</button>
  `;
  document.getElementById("geneBank").style.display = "block";
  document.getElementById("conditionContainer").style.display = "none";
  document.getElementById("introText").style.display = "none";
};
document.body.appendChild(geneBtn);

  const style = document.createElement("style");
style.innerHTML = `
  .option-button, .back-button {
    transition: transform 0.2s ease, background-color 0.3s ease;
  }

  .option-button:hover, .back-button:hover {
    transform: scale(1.05);
    background-color: #c4ffc4;
  }

  .condition-block {
    width: 140px;
    height: 120px;
    background: #f4f4f4;
    border: 2px solid #ccc;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .condition-block:hover {
    transform: scale(1.05);
    border-color: limegreen;
    background: #eaffea;
  }
`;
document.head.appendChild(style);
  let lives;
  let completedConditions;
  let userResponses;
  let geneBankData;
  let currentCondition = null;
  const correctSound = new Audio("sounds/correct.mp3");
  const wrongSound = new Audio("sounds/wrong.mp3");
  const resumeAvailable = localStorage.getItem("bioForgeComplete") !== null ||
  localStorage.getItem("completedConditions") !== null;

 
  function saveProgress() {
    localStorage.setItem('completedConditions', JSON.stringify([...completedConditions]));
    localStorage.setItem('userResponses', JSON.stringify(userResponses));
    localStorage.setItem('geneBankData', JSON.stringify(geneBankData));
  }

  function updateCompletedUI() {
  const container = document.getElementById("conditionContainer");
  container.innerHTML = '';

  for (const condition in conditionData) {
    if (!completedConditions.has(condition)) {
      const block = document.createElement('div');
      block.className = 'condition-block';
      block.setAttribute('data-condition', condition);

      const icons = {
        "Water Overload": "💧",
        "Cold": "❄️",
        "Low Oxygen": "🌫️",
        "UV Exposure": "☀️",
        "High Salt": "🧂",
        "Dehydration": "🥵"
      };

      block.innerHTML = `
        <div style="font-size: 28px;">${icons[condition]}</div>
        <div>${condition}</div>
        <div style="margin-top: 6px; height: 10px; background: red; border-radius: 5px; overflow: hidden;">
          <div style="width: ${Math.random() * 100}%; height: 100%; background: lime;"></div>
        </div>
      `;

      block.addEventListener('click', () => openCondition(condition));
      container.appendChild(block);
    }
  }

  container.style.display = "flex";
  document.getElementById("livesLeft").textContent = lives;
}

  function openCondition(condition) {
    if (!conditionData[condition]) {
      alert('Condition data not found.');
      return;
    }
    currentCondition = condition;
    document.getElementById("conditionContainer").style.display = "none";
    document.getElementById("introText").style.display = "none";
    document.getElementById("summaryScreen").style.display = "none";
    document.getElementById("geneBank").style.display = "none";

    const data = conditionData[condition];
    const optionsHTML = data.options.map(opt => 
      `<button class='option-button' data-opt='${opt}'>${opt}</button>`
    ).join('');

    document.getElementById("conditionDetail").innerHTML = `
      <h2>${condition}</h2>
      <p>${data.description}</p>
      <div id="optionButtons">${optionsHTML}</div>
      <p id="statusMessage"></p>
      <button class="back-button" id="backButton">🔙 Back</button>
    `;

    document.getElementById("conditionDetail").style.display = "block";
    document.getElementById("backButton").addEventListener("click", goBack);
    document.querySelectorAll(".option-button").forEach(button => {
      button.addEventListener("click", () => selectOption(button, button.getAttribute("data-opt"), currentCondition));
    });
  }

  function selectOption(button, selected, condition) {
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach(btn => btn.classList.remove('option-selected'));
    button.classList.add('option-selected');
    button.style.backgroundColor = '#ffffff';
    button.style.borderColor = '#000000';
    button.style.color = '#000000';

    const correct = conditionData[condition].correct;

    localStorage.setItem("dashboardStatus", "danger");

    if (selected !== correct) {
      lives--;
      wrongSound.play();
      if (lives <= 0) {
        alert("Game over. You have exhausted all lives.");
        location.reload();
        return;
      } else {
        correctSound.play();
        document.getElementById("statusMessage").textContent = `❌ Incorrect! Lives remaining: ${lives}`;
        document.getElementById("statusMessage").style.color = "red";
        updateCompletedUI();
        return;
      } 
    }

    document.getElementById("statusMessage").textContent = "✅ Response saved. Continue to the next condition.";
    document.getElementById("statusMessage").style.color = "blue";

    userResponses[condition] = selected;
    completedConditions.add(condition);

    if (!geneBankData.includes(condition)) {
      geneBankData.push(condition);
    }
    
    const mutIndex = Math.floor(Math.random() * genomeList.length);
    const chosenCodon = genomeList[mutIndex];
    genomeList.splice(mutIndex, 1, chosenCodon + "★");
    localStorage.setItem("playerGenome", genomeList.join(" - "));

    saveProgress();
    updateCompletedUI();

    if (completedConditions.size === Object.keys(conditionData).length) {
      document.getElementById("conditionDetail").style.display = "none";
      showSummary();
    }
  }

  function showSummary() {
    const summary = document.getElementById("summaryScreen");
    localStorage.setItem("bioForgeComplete", "true");
    const updatedGenome = localStorage.getItem("playerGenome") || "Unknown";
    summary.innerHTML = `
  <p><strong>Genome After Reinforcement:</strong><br>${updatedGenome}</p>
  `;
    summary.innerHTML = `<h2>🧬 Adaptation Summary</h2><ul style='text-align:left;max-width:500px;margin:0 auto;'>`;
    for (let condition of completedConditions) {
      summary.innerHTML += `<li>✅ <strong>${condition}</strong>: ${conditionData[condition].effect}</li>`;
    }
    summary.innerHTML += `</ul><p><strong>Note:</strong> These adaptations will increase the survival percentage in the upcoming tasks.</p>`;
    summary.innerHTML += `<button class="back-button" onclick="goBack()">🔁 Back to Conditions</button>`;
    summary.style.display = "block";
  }

  function goBack() {
    document.getElementById("conditionDetail").style.display = "none";
    document.getElementById("summaryScreen").style.display = "none";
    document.getElementById("geneBank").style.display = "none";
    document.getElementById("introText").style.display = "block";
    updateCompletedUI();
  }

  function renderBioForgeUI(containerId) {
  const container = document.getElementById(containerId);
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.padding = "30px";
  container.style.minHeight = "100vh";

  let resumeHTML = "";
  if (resumeAvailable) {
    resumeHTML = `
      <div id="resumePrompt" style="margin-bottom: 20px;">
        <p>🔄 Resume previous session?</p>
        <button id="resumeYes" class="option-button">✅ Yes</button>
        <button id="resumeNo" class="option-button">❌ No (Start New)</button>
      </div>`;
  }

  container.innerHTML = `
    <div style="max-width: 700px; margin: 0 auto; text-align: center; font-size: 18px;">
      <h2 style="font-size: 28px;">🌡️ Select a Physiological Condition</h2>
      <p id="introText">Click on a condition to learn more and begin the response simulation.</p>
      ${resumeHTML}
      <div id="livesDisplay" style="margin: 10px 0; font-size: 20px;">❤️ Lives Left: <span id="livesLeft">3</span></div>
      <div class="condition-container" id="conditionContainer" style="gap: 15px;"></div>
      <div id="conditionDetail" class="condition-detail"></div>
      <div id="summaryScreen" class="condition-detail"></div>
      <div id="geneBank" class="condition-detail"></div>
    </div>
  `;

  if (resumeAvailable) {
    document.getElementById("resumeYes").onclick = () => {
      document.getElementById("resumePrompt").style.display = "none";
      updateCompletedUI();
    };
    document.getElementById("resumeNo").onclick = () => {
      localStorage.removeItem("completedConditions");
      localStorage.removeItem("userResponses");
      localStorage.removeItem("geneBankData");
      localStorage.removeItem("bioForgeComplete");
      completedConditions = new Set();
      userResponses = {};
      geneBankData = [];
      lives = 3;
      document.getElementById("resumePrompt").style.display = "none";
      updateCompletedUI();
    };
    return;
  }
}


  window.loadBioForgeGame = function(containerId) {
    lives = 3;
    completedConditions = new Set(JSON.parse(localStorage.getItem('completedConditions') || '[]'));
    userResponses = JSON.parse(localStorage.getItem('userResponses') || '{}');
    geneBankData = JSON.parse(localStorage.getItem('geneBankData') || '[]');
    const genomeRaw = localStorage.getItem("playerGenome") || "";
    const genomeList = genomeRaw.split(" - ");
    console.log("Original Genome:", genomeList);
    renderBioForgeUI(containerId);
    updateCompletedUI();
  }
})();
