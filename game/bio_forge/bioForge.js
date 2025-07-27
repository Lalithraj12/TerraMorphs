(function() {

 if (!localStorage.getItem("genomeComplete")) {
  alert("❌ You must complete the Genome Editor before accessing BioForge.");
  window.location.href = "/index.html"; 
  return;
}

  const conditions = [
  {
    condition: "UV radiation",
    icon: "☀️",
    options: ["Water retention", "Melanin production", "Camouflage"],
    correct: "Melanin production",
    reason: "Melanin absorbs harmful UV rays, preventing cellular damage."
  },
  {
    condition: "Freezing",
    icon: "❄️",
    options: ["Thin tail", "Transparent skin", "Thick fur"],
    correct: "Thick fur",
    reason: "Thick fur insulates the organism and retains heat."
  },
  {
    condition: "Low Oxygen",
    icon: "",
    options: ["Enhanced lung capacity", "Sharp claws", "Color change"],
    correct: "Enhanced lung capacity",
    reason: "Greater lung capacity increases oxygen intake."
  },
  {
    condition: "Acidic Environments",
    icon: "🧪",
    options: ["Small nostrils", "Dry skin", "Mucus layer"],
    correct: "Mucus layer",
    reason: "Mucus protects the skin from acid by neutralizing contact."
  },
  {
    condition: "Environmental Hazards",
    icon: "🌍",
    options: ["Fat storage", "Environmental Sensor", "Short limbs"],
    correct: "Environmental Sensor",
    reason: "Sensors detect changes in environment to alert the organism."
  }
];

  const iconMap = {
  "Water Overload": "💧",
  "Cold": "❄️",
  "Low Oxygen": "",
  "UV Exposure": "☀️",
  "High Salt": "🧂",
  "Dehydration": "🥵"
};

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
  let condition;
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

conditions.forEach((cond, index) => {
  if (!completedConditions.has(index)) {
    const block = document.createElement('div');
    block.className = 'condition-block';
    block.setAttribute('data-condition', index);
    block.addEventListener('click', () => openCondition(index));
    
    block.innerHTML = `
      <div style="font-size: 28px;">${cond.icon}</div>
      <div>${cond.condition}</div>
      <div style="margin-top: 6px; height: 10px; background: red; border-radius: 5px; overflow: hidden;">
        <div style="width: ${Math.random() * 100}%; height: 100%; background: lime;"></div>
      </div>
    `;

    container.appendChild(block);
  }
});

  container.style.display = "flex";
  document.getElementById("livesLeft").textContent = lives;
}

function openCondition(index) {
  const data = conditions[index];
  if (!data) {
    alert('Condition data not found.');
    return;
  }

  currentCondition = index; 
  document.getElementById("conditionContainer").style.display = "none";
  document.getElementById("introText").style.display = "none";
  document.getElementById("summaryScreen").style.display = "none";
  document.getElementById("geneBank").style.display = "none";

  const optionsHTML = data.options.map(opt =>
    `<button class='option-button' data-opt='${opt}' style="margin: 6px;">${opt}</button>`
  ).join('');

  document.getElementById("conditionDetail").innerHTML = `
    <h2>${data.condition}</h2>
    <div id="optionButtons">${optionsHTML}</div>
    <p id="statusMessage"></p>
    <button class="back-button" id="backButton">🔙 Back</button>
  `;

  document.getElementById("conditionDetail").style.display = "block";
  document.getElementById("backButton").addEventListener("click", goBack);

  document.querySelectorAll(".option-button").forEach(button => {
    button.addEventListener("click", () =>
      selectOption(button, button.getAttribute("data-opt"), currentCondition)
    );
  });
}

function selectOption(button, selected, conditionIndex) {
  const buttons = document.querySelectorAll('.option-button');
  buttons.forEach(btn => {
    if (!conditions[conditionIndex]) {
  console.error("Invalid conditionIndex:", conditionIndex);
  return;
    }
    btn.disabled = true;
    if (btn.getAttribute("data-opt") === conditions[conditionIndex].correct) {
      btn.style.backgroundColor = "#4CAF50";
    } else {
      btn.style.backgroundColor = "#f44336"; 
    }
  });

  const correct = conditions[conditionIndex].correct;
  const explanation = conditions[conditionIndex].reason;

  if (selected !== correct) {
    lives--;
    wrongSound.play();
    document.getElementById("statusMessage").innerHTML = `
      ❌ <strong>Incorrect!</strong> Lives remaining: ${lives}<br>
      <em>Reason:</em> ${explanation}
    `;
    document.getElementById("statusMessage").style.color = "red";

    if (lives <= 0) {
      alert("Game over. You have exhausted all lives.");
      location.reload();
    }
    return;
  }

  correctSound.play();
  document.getElementById("statusMessage").innerHTML = `
    ✅ <strong>Correct!</strong><br><em>Reason:</em> ${explanation}<br><br>
    Proceed to the next condition.
  `;
  document.getElementById("statusMessage").style.color = "green";

  userResponses[conditionIndex] = selected;
  completedConditions.add(conditionIndex);

  if (!geneBankData.includes(conditions[conditionIndex].condition)) {
    geneBankData.push(conditions[conditionIndex].condition);
  }

  saveProgress();
  updateCompletedUI();

  if (completedConditions.size === conditions.length) {
    document.getElementById("conditionDetail").style.display = "none";
    showSummary();
  }
}

  function showSummary() {
  const summary = document.getElementById("summaryScreen");
  localStorage.setItem("bioForgeComplete", "true");
  showModulePopup("Bio Forge");
  updateProgressBar();
  const updatedGenome = localStorage.getItem("playerGenome") || "Unknown";

  summary.innerHTML = `<h2>🧬 Adaptation Summary</h2>
    <ul style='text-align:left;max-width:500px;margin:0 auto;'>`;

  for (let idx of completedConditions) {
  const condition = conditions[idx];
  if (condition) {
    summary.innerHTML += `<li>✅ <strong>${condition.condition}</strong>: ${condition.reason}</li>`;
  }
}

  summary.innerHTML += `</ul>
    <p><strong>Note:</strong> These adaptations will increase the survival percentage in the upcoming tasks.</p>
    <button class="back-button" onclick="goBack()">🔁 Back to Conditions</button>
    <button class="option-button" style="margin-left: 10px;" onclick="window.location.href='/index.html'">🏠 Continue to Lab</button>`;

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
  container.style.backgroundColor = "#d8b370ff";
  container.style.color = "#000000";
  container.style.padding = "30px";
  container.style.minHeight = "100vh";

  let resumeHTML = "";
  if (resumeAvailable) {
    resumeHTML = `
      <div id="resumePrompt" style="margin-bottom: 20px;">
        <p> You have completed this module. Are you going to continue the Game or Try again this module</p>
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
    window.location.href = "/index.html"; 
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
