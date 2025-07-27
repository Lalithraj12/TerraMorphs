export function run(container) {
  console.log("✅ Genome Editor game module loaded");

  const codonToProtein = {
    "ATG": "MitoSynthase",
    "CGT": "OxyBalancer",
    "TGC": "RadShield",
    "GGA": "MetaboPump"
  };

  const proteinToTrait = {
    "MitoSynthase": "Energy Regulation",
    "OxyBalancer": "Low Oxygen Tolerance",
    "RadShield": "Radiation Resistance",
    "MetaboPump": "High Metabolism"
  };

  const sequenceInput = [];
  const proteinChain = [];
  const errorSound = new Audio("sounds/error.mp3");
  const finalizeSound = new Audio("sounds/success.mp3");

  const unlockedTraits = {
    "Radiation Resistance": localStorage.getItem("trait_Radiation Resistance") === "true",
    "Low Oxygen Tolerance": localStorage.getItem("trait_Low Oxygen Tolerance") === "true",
    "High Metabolism": localStorage.getItem("trait_High Metabolism") === "true"
  };

  const introSeen = localStorage.getItem("genomeIntroSeen") === "true";

if (introSeen) {
  container.innerHTML = "";  
  launchEditor(container);
  return;
}

container.innerHTML = `
  <div id="introScreen" style="font-family: monospace; color: black; text-align: center; padding: 30px;">
    <h2>🧬 Welcome to the Genome Editor</h2>
    <p>Your mission is to create a genome that will allow a new species to survive in a hostile environment.</p>
    <p>Enter 3-letter DNA codons (like ATG, CGT) to form a protein chain.</p>
    <p>Each protein maps to a specific trait. Select codons wisely based on your knowledge of the world’s conditions.</p>
    <p>Unlocked traits from other equipment will affect the viability of your species.</p>
    <button id="continueBtn" style="margin-top: 20px; padding: 10px 20px; background: #0f0; color: black; font-weight: bold; border: none; cursor: pointer;">Continue</button>
  </div>
  <div id="editorScreen" style="display: none; text-align: center;"></div>
`;

  const continueBtn = container.querySelector('#continueBtn');
  const editorScreen = container.querySelector('#editorScreen');

    continueBtn.onclick = () => {
    localStorage.setItem("genomeIntroSeen", "true");
    showModulePopup("Genome Editor");
    updateProgressBar();
    editorScreen.style.display = 'block';
    document.getElementById('introScreen').remove();

    const nameInput = document.createElement("input");
    nameInput.id = "speciesNameInput";
    nameInput.placeholder = "Enter species name (e.g. Homo sapiens)";
    nameInput.style.cssText = "font-size: 18px; padding: 6px; margin: 25px auto; display: block; width: 65%; text-align: center;";

    window.disableCharacterMovement = true;

    const startButton = document.createElement("button");
    startButton.textContent = "Start Genome Edit";
    startButton.style.cssText = "padding: 10px 20px; font-weight: bold; background: #0f0; color: black; border: none; cursor: pointer; margin-top: 10px;";
    editorScreen.appendChild(nameInput);
    editorScreen.appendChild(startButton);

    startButton.onclick = () => {
      const name = nameInput.value.trim();
      localStorage.setItem("speciesName", name);
      if (!/^[A-Z][a-z]+ [a-z]+$/.test(name)) {
        errorSound.play();
        alert("❌ Please enter a valid binomial name (e.g., Homo sapiens)");
        return;
      }

      editorScreen.innerHTML = "";
      const title = document.createElement("h1");
      title.textContent = `🧬 ${name}`;
      title.style = "text-align:center; color:blue;";
      editorScreen.appendChild(title);

      const continueToEditorBtn = document.createElement("button");
      continueToEditorBtn.textContent = "Continue to Genome Editor";
      continueToEditorBtn.style.cssText = "display: block; margin: 20px auto; padding: 10px 20px; font-weight: bold; background: #0f0; color: black; border: none; cursor: pointer;";
      editorScreen.appendChild(continueToEditorBtn);

      continueToEditorBtn.onclick = () => {
        window.disableCharacterMovement = true;
        launchEditor(editorScreen);
      };
    };
  };

  function typeWriterEffect(element, text, speed = 20) {
  element.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

  function launchEditor(container) {
    container.innerHTML = `
      <div style="font-family: monospace; color: black; display: flex; flex-direction: column; align-items: center; gap: 30px">
        <div style="width: 100%; max-width: 500px;">
          <h2>🧬 Choose DNA Codons</h2>
          <p>Hint: ATG = Energy, CGT = Oxygen, TGC = Radiation, GGA = Metabolism</p>
          <input type="text" id="codonInput" placeholder="e.g. ATG" maxlength="3" style="font-size: 16px; padding: 4px; width: 60px;">
          <button id="addCodon">Add</button>
          <div id="codonChain" style="margin-top: 10px;"></div>
          <div id="proteinChain" style="margin-top: 20px;"></div>
          <div id="traitList" style="margin-top: 20px;"></div>
          <div id="envCompatibility" style="margin-top: 20px; font-size: 16px;">
            🌡 Heat Resistance: <span id="heatVal">0%</span><br>
            🪐 Radiation Tolerance: <span id="radVal">0%</span><br>
            🫁 Oxygen Efficiency: <span id="oxyVal">0%</span>
          </div>
          <div style="margin-top: 10px;">
            🧬 Genome Stability:
            <div style="background: #222; width: 100%; height: 20px;">
              <div id="genomeBar" style="background: lime; width: 0%; height: 100%;"></div>
            </div>
          </div>
          <button id="finalizeGenome" style="margin-top: 20px; padding: 10px 20px; font-weight: bold; background: #0f0; color: black; border: none; cursor: pointer;">Assemble Genome</button>
          <div id="finalResult" style="margin-top: 10px; font-size: 18px;"></div>
        </div>
        <div style="width: 100%; max-width: 500px;">
          <h2>🌍 Environment Requirements for Survival</h2>
          <ul>
            <li>🌡 Heat Resistance: ≥ 15%</li>
            <li>🪐 Radiation Tolerance: ≥ 6%</li>
            <li>🫁 Oxygen Efficiency: ≥ 8%</li>
          </ul>
        </div>
      </div>
    `;

    const codonInput = container.querySelector('#codonInput');
    const addBtn = container.querySelector('#addCodon');
    const codonChainEl = container.querySelector('#codonChain');
    const codonHistory = document.createElement("div");
    codonHistory.id = "codonHistory";
    codonHistory.style = "margin-top:20px; font-size:14px;";
    container.appendChild(codonHistory);
    const proteinChainEl = container.querySelector('#proteinChain');
    const traitListEl = container.querySelector('#traitList');
    const finalizeBtn = container.querySelector('#finalizeGenome');
    const finalResult = container.querySelector('#finalResult');
    const genomeBar = container.querySelector('#genomeBar');
    const heat = container.querySelector('#heatVal');
    const rad = container.querySelector('#radVal');
    const oxy = container.querySelector('#oxyVal');

    addBtn.onclick = () => {
      const codon = codonInput.value.toUpperCase();
      if (!/^[ATGC]{3}$/.test(codon)) {
        alert("❌ Invalid codon. Use 3 letters A/T/G/C.");
        errorSound.play();
        return;
      }

      if (sequenceInput.length >= 10) {
        alert("⚠️ Maximum of 10 codons allowed.");
        return;
      }

      sequenceInput.push(codon);
      const lastCodon = sequenceInput[sequenceInput.length - 1];
      let effect = "+5% Unknown Stability";
      if (lastCodon === "ATG") effect = "+5% Energy";
      else if (lastCodon === "CGT") effect = "+4% Oxygen Efficiency";
      else if (lastCodon === "TGC") effect = "+3% Radiation Shielding";
      else if (lastCodon === "GGA") effect = "+5% Metabolic Rate";

      codonChainEl.innerHTML = `<div style="font-size: 36px; text-align: center; margin: 10px;"><strong>${lastCodon}</strong><div style="font-size: 16px; margin-top: 4px;">${effect}</div></div>`;
      document.getElementById("codonHistory").innerHTML = `
  <strong>Genome Sequence:</strong><br>${sequenceInput.map(c => `<span style="padding:4px 8px; background:#222; margin:2px; display:inline-block; border-radius:4px;">${c}</span>`).join("")}
`;
      if (codonToProtein[codon]) {
        const protein = codonToProtein[codon];
        proteinChain.push(protein);
        proteinChainEl.innerHTML = `Protein Generated: ${protein}`;
        const traits = proteinChain.map(p => proteinToTrait[p]).filter(Boolean);
        traitListEl.innerHTML = `
  <strong>Traits Unlocked:</strong>
  <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:8px;">
    ${[...new Set(traits)].map(t => `
      <span style="padding:6px 12px; background:#111; color:#0f0; border:1px solid #0f0; border-radius:8px; font-size: 14px;">
        ${t}
      </span>`).join("")}
  </div>
`;
      } else {
        proteinChainEl.innerHTML = `⚠️ Codon '${codon}' does not map to a known protein.`;
      }

      codonInput.value = "";

      let heatRepeats = 0, radRepeats = 0, oxyRepeats = 0;
      for (let i = 1; i < sequenceInput.length; i++) {
        if (sequenceInput[i] === "GGA" && sequenceInput[i] === sequenceInput[i - 1]) heatRepeats++;
        if (sequenceInput[i] === "TGC" && sequenceInput[i] === sequenceInput[i - 1]) radRepeats++;
        if (sequenceInput[i] === "CGT" && sequenceInput[i] === sequenceInput[i - 1]) oxyRepeats++;
      }

      const heatVal = Math.max(0, sequenceInput.filter(c => c === "GGA").length * 8 - heatRepeats * 5);
      const radVal = Math.max(0, sequenceInput.filter(c => c === "TGC").length * 5 - radRepeats * 3);
      const oxyVal = Math.max(0, sequenceInput.filter(c => c === "CGT").length * 6 - oxyRepeats * 4);

      heat.textContent = `${heatVal}%`;
      rad.textContent = `${radVal}%`;
      oxy.textContent = `${oxyVal}%`;
      genomeBar.style.transition = "width 0.4s ease";
      genomeBar.style.width = `${sequenceInput.length * 10}%`;
      genomeBar.style.background = sequenceInput.length >= 8 ? "lime" :
                                    sequenceInput.length >= 5 ? "orange" : "red";

    };

    finalizeBtn.onclick = () => {
      finalizeSound.play(); 
      finalResult.innerHTML = '<div style="color: lime; font-size: 16px;">🧬 Synthesizing...</div>';
      setTimeout(() => {
        let heatScore = sequenceInput.filter(c => c === "ATG").length * 12;
        let radScore = sequenceInput.filter(c => c === "TGC").length * 10;
        let oxyScore = sequenceInput.filter(c => c === "CGT").length * 9;
        let success = heatScore >= 15 && radScore >= 6 && oxyScore >= 8;

        const uniqueCodons = [...new Set(sequenceInput)];
        const uniqueTraits = [...new Set(proteinChain.map(p => proteinToTrait[p]).filter(Boolean))];

        finalResult.innerHTML = "";
if (success) {
  const summaryText = `🧬 Genome Created\n\nGenome Sequence: ${sequenceInput.join(" - ")}\nTraits Generated: ${uniqueTraits.join(", ")}\n✔ Survival Possible\n\nPress Continue to continue the game`;

  finalResult.style.color = "lime";
  finalResult.style.fontFamily = "monospace";
  finalResult.style.whiteSpace = "pre-line";
  finalResult.style.marginTop = "20px";
  finalResult.style.border = "2px solid lime";
  finalResult.style.background = "#111";
  finalResult.style.padding = "20px";
  finalResult.style.borderRadius = "12px";
  finalResult.style.maxWidth = "600px";
  finalResult.style.marginLeft = "auto";
  finalResult.style.marginRight = "auto";

  typeWriterEffect(finalResult, summaryText, 25);

  setTimeout(() => {
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue";
    continueBtn.id = "continueBtnFinal";
    continueBtn.style = "margin-top: 20px; padding: 10px 20px; background: lime; color: black; font-weight: bold; border: none; cursor: pointer; display: block;";
    finalResult.appendChild(continueBtn);

    continueBtn.onclick = () => {
  localStorage.setItem("assembledGenome", sequenceInput.join(" - "));
  localStorage.setItem("playerGenome", sequenceInput.join(" - "));
  localStorage.setItem("playerHealth", "100");
  localStorage.setItem("playerPos", JSON.stringify({ x: 0, y: 0 }));
  localStorage.setItem("genomeComplete", "true");

  window.disableCharacterMovement = false;

  const finalSound = new Audio('sounds/genome_saved.mp3');
  finalSound.play().catch(() => {});

  container.innerHTML = `
    <div style='text-align:center; color:lime; font-family:monospace; padding: 30px;'>
      <h2>✅ Genome Saved</h2>
      <p>Walk to the <strong>Bioforge Console</strong> in the lab to begin the next challenge.</p>
    </div>`;
};
  }, summaryText.length * 25 + 500);  
      }
    }, 1000); 
  }; 
} 
}
