window.onload = () => {
  const trial = JSON.parse(localStorage.getItem("evolutionTrialSummary") || "{}");
  const terraform = JSON.parse(localStorage.getItem("terraformingSummary") || "{}");
  const planetName = localStorage.getItem("planetName") || "Unnamed Planet";

  const container = document.createElement("div");
  container.style.fontFamily = "monospace";
  container.style.padding = "40px";
  container.style.color = "#fff";
  container.style.background = "#001a1a";

  container.innerHTML = `
    <h1>🌍 Genesis: Final Report</h1>
    <h2>🪐 Planet Name: ${planetName}</h2>

    <h2>⚔️ Evolution Trial Summary</h2>
    <p>Score: ${trial.survivalScore || "N/A"}</p>
    <p>Failed Zones: ${trial.failedZones?.join(", ") || "None"}</p>

    <h2>🌡 Final Planet Status</h2>
    <ul>
      <li>Oxygen: ${terraform.finalConditions?.oxygen || "?"}%</li>
      <li>Water: ${terraform.finalConditions?.water || "?"}%</li>
      <li>Radiation: ${terraform.finalConditions?.radiation || "?"}</li>
      <li>Toxicity: ${terraform.finalConditions?.toxicity || "?"}</li>
      <li>Temperature: ${terraform.finalConditions?.temperature || "?"}°C</li>
    </ul>

    <h2>💫 Mission Outcome</h2>
    <p>${
      terraform.success
        ? `✅ Your species has successfully colonized ${planetName}.`
        : `❌ Terraforming incomplete. Retry to colonize ${planetName}.`
    }</p>

    <button onclick="captureMemory()">📸 Capture the Memory</button>
  `;

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