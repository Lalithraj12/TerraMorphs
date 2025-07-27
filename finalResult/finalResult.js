window.onload = () => {
  const trial = JSON.parse(localStorage.getItem("evolutionTrialSummary") || "{}");
  const terraform = JSON.parse(localStorage.getItem("terraformingSummary") || "{}");
  const planetName = localStorage.getItem("planetName") || "Unnamed Planet";

  const container = document.createElement("div");
  container.style.fontFamily = "monospace";
  container.style.padding = "40px";
  container.style.color = "#fff";
  container.style.background = "#001a1a";
  container.style.minHeight = "100vh";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.innerHTML = `
    <h1 style="font-size: 42px;">🌍 TerraMorphs: Final Report</h1>
    <h2 style="font-size: 32px;">🪐 Planet Name: ${planetName}</h2>

    <div style="width: 80%; max-width: 800px; margin-top: 30px;">
      <h2>⚔️ Summary of the Colony</h2>
      <p><strong>Score:</strong> ${trial.survivalScore ?? "N/A"}</p>
      <p><strong>Failed Zones:</strong> ${trial.failedZones?.join(", ") || "None"}</p>

      <h2>🌡 Final Planet Status</h2>
      <ul style="line-height: 1.8;">
        <li><strong>Oxygen:</strong> ${terraform.finalConditions?.oxygen ?? "?"}%</li>
        <li><strong>Water:</strong> ${terraform.finalConditions?.water ?? "?"}%</li>
        <li><strong>Radiation:</strong> ${terraform.finalConditions?.radiation ?? "?"}</li>
        <li><strong>Toxicity:</strong> ${terraform.finalConditions?.toxicity ?? "?"}</li>
        <li><strong>Temperature:</strong> ${terraform.finalConditions?.temperature ?? "?"}°C</li>
      </ul>

      <h2>💫 Mission Outcome</h2>
      <p style="font-size: 20px; color: ${terraform.success ? '#00ff99' : '#ff6666'};">
        ${
          terraform.success
            ? `✅ Your species has successfully colonized ${planetName}.`
            : `❌ Terraforming incomplete. Retry to colonize ${planetName}.`
        }
      </p>
    </div>

    <div style="margin-top: 40px;">
      <button onclick="captureScreenshot()" style="padding: 10px 20px; font-size: 18px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">
        📸 Capture the Memory
      </button>
      <button onclick="startNewGame()" style="padding: 10px 20px; font-size: 18px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 15px;">
        🔄 New Game
      </button>
    </div>
  `;
  document.body.innerHTML = ""; 
  document.body.appendChild(container);
};

function captureScreenshot() {
  const element = document.body;

  html2canvas(element).then(canvas => {
    const link = document.createElement("a");
    link.download = "planet_summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function startNewGame() {
  localStorage.clear();
  window.location.href = "/index.html"; 
}
