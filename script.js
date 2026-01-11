// Global Variables
let currentData = [];
let probWeight = 3;
let impactWeight = 3;
let currentSector = 'custom';

// Sector Presets Data
const sectorPresets = {
  energy: {
    name: "Energy & Utilities",
    description: "Heavy asset exposure, regulatory transition risks, Scope 3 emissions intensive. High capital intensity with long asset lives.",
    defaultProbWeight: 4,
    defaultImpactWeight: 4,
    benchmarkScore: 18.2,
    defaultRisks: [
      ["Carbon Pricing Exposure", 5, 5, "Up", "Critical"],
      ["Stranded Asset Risk", 4, 5, "Up", "Critical"],
      ["Water Stress - Operations", 3, 4, "Stable", "Up"],
      ["Policy Uncertainty", 5, 4, "Up", "Critical"],
      ["Workforce Transition", 3, 3, "Stable", "Up"],
      ["Methane Emissions", 4, 4, "Up", "Critical"],
      ["Grid Reliability", 3, 5, "Stable", "Up"]
    ]
  },
  tech: {
    name: "Technology",
    description: "Data center energy, supply chain labor, rare earth minerals, e-waste. Rapid innovation with significant Scope 2 footprint.",
    defaultProbWeight: 3,
    defaultImpactWeight: 4,
    benchmarkScore: 14.5,
    defaultRisks: [
      ["Data Center Energy Use", 4, 3, "Up", "Up"],
      ["Supply Chain Labor Conditions", 3, 4, "Stable", "Up"],
      ["E-Waste & Circularity", 3, 3, "Up", "Up"],
      ["Water Usage - Chip Manufacturing", 4, 3, "Up", "Critical"],
      ["Rare Earth Minerals Exposure", 3, 4, "Stable", "Up"],
      ["AI Compute Energy Demand", 4, 4, "Up", "Critical"],
      ["Data Privacy & Security", 5, 5, "Up", "Critical"]
    ]
  },
  manufacturing: {
    name: "Manufacturing",
    description: "Supply chain depth, labor intensity, waste streams, energy clusters. Complex Scope 3 emissions with JIT vulnerability.",
    defaultProbWeight: 3,
    defaultImpactWeight: 5,
    benchmarkScore: 19.8,
    defaultRisks: [
      ["Scope 3 Supply Chain", 4, 5, "Up", "Critical"],
      ["Worker Safety - Operations", 3, 4, "Down", "Stable"],
      ["Water Stress - Manufacturing Clusters", 4, 4, "Up", "Critical"],
      ["Circular Economy Transition", 3, 3, "Up", "Up"],
      ["Energy Price Volatility", 4, 4, "Up", "Up"],
      ["Raw Material Scarcity", 3, 5, "Up", "Critical"],
      ["Just-in-Time Inventory Risk", 4, 4, "Up", "Up"]
    ]
  },
  finance: {
    name: "Financial Services",
    description: "Portfolio emissions, financed emissions, greenwashing liability. High regulatory scrutiny with indirect emissions exposure.",
    defaultProbWeight: 4,
    defaultImpactWeight: 3,
    benchmarkScore: 16.3,
    defaultRisks: [
      ["Portfolio Carbon Intensity", 4, 3, "Up", "Critical"],
      ["Greenwashing Regulatory Risk", 5, 4, "Up", "Critical"],
      ["Climate Stress Test Failures", 3, 5, "Up", "Critical"],
      ["Biodiversity Portfolio Risk", 2, 3, "Up", "Up"],
      ["Just Transition Financing", 3, 2, "Stable", "Up"],
      ["Physical Climate Risk - Assets", 4, 4, "Up", "Critical"],
      ["Transition Plan Disclosure", 5, 3, "Up", "Critical"]
    ]
  },
  healthcare: {
    name: "Healthcare",
    description: "Pharma supply chain, clinical waste, patient community impact. High regulatory compliance with complex waste streams.",
    defaultProbWeight: 3,
    defaultImpactWeight: 4,
    benchmarkScore: 13.7,
    defaultRisks: [
      ["Pharma Supply Chain Resilience", 4, 4, "Stable", "Up"],
      ["Clinical Waste Management", 3, 3, "Up", "Up"],
      ["Water Usage - Manufacturing", 4, 3, "Up", "Critical"],
      ["Patient Community Relations", 3, 4, "Stable", "Up"],
      ["Scope 3 - Patient Travel", 2, 2, "Stable", "Up"],
      ["Antibiotic Resistance", 3, 5, "Up", "Critical"],
      ["Medical Device Sterilization", 4, 3, "Up", "Up"]
    ]
  }
};

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // File Upload
  document.getElementById("fileInput").addEventListener("change", handleFile);
  
  // Weight Sliders
  const probSlider = document.getElementById("probWeight");
  const impactSlider = document.getElementById("impactWeight");
  
  probSlider.addEventListener("input", (e) => {
    probWeight = parseFloat(e.target.value);
    document.getElementById("probValue").innerText = probWeight;
    if (currentData.length > 0) renderDashboard(currentData);
  });
  
  impactSlider.addEventListener("input", (e) => {
    impactWeight = parseFloat(e.target.value);
    document.getElementById("impactValue").innerText = impactWeight;
    if (currentData.length > 0) renderDashboard(currentData);
  });
  
  // Sector Selector
  document.getElementById("sectorSelect").addEventListener("change", function() {
    currentSector = this.value;
    updateSectorBadge();
    const sectorDesc = document.getElementById("sectorDescription");
    
    if (currentSector === "custom") {
      sectorDesc.innerHTML = `<strong>Custom Mode:</strong> Define your own risks and weights. Upload CSV or manually add risks.`;
    } else {
      const preset = sectorPresets[currentSector];
      sectorDesc.innerHTML = `<strong>${preset.name}:</strong> ${preset.description}`;
    }
  });
  
  // Benchmark Toggle
  document.getElementById("showBenchmark").addEventListener("change", () => {
    if (currentData.length > 0) renderDashboard(currentData);
  });
});

// File Handling
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = e => parseCSV(e.target.result);
  reader.readAsText(file);
}

function parseCSV(text) {
  try {
    const rows = text.trim().split("\n");
    if (rows.length < 2) throw new Error("CSV file is empty or invalid");
    
    const headers = rows[0].split(",").map(h => h.trim());
    const requiredHeaders = ["Risk_Name", "Probability_Score", "Financial_Impact", "Momentum_12_24M", "Momentum_3_5Y"];
    
    // Validate headers
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`Missing required column: ${header}. Required columns are: ${requiredHeaders.join(", ")}`);
      }
    }
    
    const data = rows.slice(1).map((row, index) => {
      const values = row.split(",").map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
      }
      
      const entry = {};
      headers.forEach((header, i) => {
        entry[header] = values[i];
      });
      
      // Validate data types
      const prob = parseFloat(entry.Probability_Score);
      const impact = parseFloat(entry.Financial_Impact);
      
      if (isNaN(prob) || prob < 1 || prob > 5) {
        throw new Error(`Row ${index + 2}: Probability_Score must be a number between 1-5`);
      }
      if (isNaN(impact) || impact < 1 || impact > 5) {
        throw new Error(`Row ${index + 2}: Financial_Impact must be a number between 1-5`);
      }
      
      const validMoments = ["Up", "Down", "Stable", "Critical"];
      if (!validMoments.includes(entry.Momentum_12_24M) || !validMoments.includes(entry.Momentum_3_5Y)) {
        throw new Error(`Row ${index + 2}: Momentum values must be one of: ${validMoments.join(", ")}`);
      }
      
      return {
        name: entry.Risk_Name,
        probability: prob,
        impact: impact,
        mShort: entry.Momentum_12_24M,
        mLong: entry.Momentum_3_5Y
      };
    });
    
    currentData = data;
    renderDashboard(data);
    
  } catch (error) {
    alert(`Error parsing CSV: ${error.message}`);
    console.error("CSV Parse Error:", error);
  }
}

// Dashboard Rendering
function renderDashboard(data) {
  currentData = data;
  document.getElementById("dashboard").classList.remove("hidden");
  updateSectorBadge();
  renderHeatmap(data);
  renderMomentum(data);
  renderDecisions(data);
}

function updateSectorBadge() {
  const badge = document.getElementById("sectorBadge");
  badge.textContent = currentSector === "custom" ? "Custom Portfolio" : sectorPresets[currentSector].name;
}

function renderHeatmap(data) {
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";
  
  data.forEach(risk => {
    const weightedScore = (risk.probability * probWeight) + (risk.impact * impactWeight);
    const maxScore = 5 * probWeight + 5 * impactWeight;
    const normalizedScore = (weightedScore / maxScore) * 25; // Scale to 0-25
    
    let level = "low";
    if (normalizedScore >= 16) level = "high";
    else if (normalizedScore >= 9) level = "medium";
    
    const tile = document.createElement("div");
    tile.className = `tile ${level}`;
    tile.innerHTML = `
      <strong>${risk.name}</strong>
      <span class="score">${normalizedScore.toFixed(1)}</span>
      <div style="margin-top: 8px; font-size: 0.85rem;">
        P: ${risk.probability} × ${probWeight}<br>
        I: ${risk.impact} × ${impactWeight}
      </div>
    `;
    
    // Add click to highlight
    tile.addEventListener("click", () => {
      document.querySelectorAll(".tile").forEach(t => t.style.opacity = "0.6");
      tile.style.opacity = "1";
      highlightRiskInTables(risk.name);
    });
    
    heatmap.appendChild(tile);
  });
  
  // Add benchmark if enabled
  const showBenchmark = document.getElementById("showBenchmark").checked;
  if (showBenchmark && currentSector !== "custom" && sectorPresets[currentSector]) {
    const benchmark = sectorPresets[currentSector].benchmarkScore;
    const benchmarkLine = document.createElement("div");
    benchmarkLine.style.gridColumn = "1 / -1";
    benchmarkLine.style.textAlign = "center";
    benchmarkLine.style.marginTop = "15px";
    benchmarkLine.style.padding = "10px";
    benchmarkLine.style.background = "rgba(59, 130, 246, 0.1)";
    benchmarkLine.style.borderRadius = "8px";
    benchmarkLine.innerHTML = `
      <div style="display: inline-flex; align-items: center; gap: 10px;">
        <div style="width: 20px; height: 2px; background: #3b82f6;"></div>
        <small style="color: #94a3b8;">
          Sector Average Risk Score: <strong style="color: #3b82f6;">${benchmark}</strong>
          (Your portfolio: ${calculateAverageScore(data).toFixed(1)})
        </small>
        <div style="width: 20px; height: 2px; background: #3b82f6;"></div>
      </div>
    `;
    heatmap.appendChild(benchmarkLine);
  }
}

function calculateAverageScore(data) {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, risk) => {
    return sum + (risk.probability * probWeight) + (risk.impact * impactWeight);
  }, 0);
  const maxScore = (5 * probWeight + 5 * impactWeight) * data.length;
  return (total / maxScore) * 25;
}

function renderMomentum(data) {
  const tbody = document.querySelector("#momentumTable tbody");
  tbody.innerHTML = "";
  
  data.forEach(risk => {
    const row = tbody.insertRow();
    
    // Risk Name
    const nameCell = row.insertCell();
    nameCell.textContent = risk.name;
    
    // Short-term Momentum
    const shortCell = row.insertCell();
    shortCell.textContent = risk.mShort;
    shortCell.className = getTrendClass(risk.mShort);
    
    // Long-term Momentum
    const longCell = row.insertCell();
    longCell.textContent = risk.mLong;
    longCell.className = getTrendClass(risk.mLong);
    
    // Trend Arrow
    const trendCell = row.insertCell();
    const trend = getOverallTrend(risk.mShort, risk.mLong);
    trendCell.innerHTML = `<span class="${getTrendClass(trend)}">${getTrendSymbol(trend)}</span>`;
  });
}

function renderDecisions(data) {
  const tbody = document.querySelector("#decisionTable tbody");
  tbody.innerHTML = "";
  
  data.forEach(risk => {
    const row = tbody.insertRow();
    
    // Risk Name
    row.insertCell().textContent = risk.name;
    
    // Risk Score
    const scoreCell = row.insertCell();
    const score = (risk.probability * probWeight) + (risk.impact * impactWeight);
    scoreCell.textContent = score.toFixed(1);
    scoreCell.style.fontWeight = "600";
    
    // Allocation Signal
    const signalCell = row.insertCell();
    const signal = getSignal(risk);
    signalCell.textContent = signal.text;
    signalCell.className = `signal-${signal.type}`;
    
    // Rationale
    const rationaleCell = row.insertCell();
    rationaleCell.textContent = signal.rationale;
    rationaleCell.style.fontSize = "0.9rem";
    rationaleCell.style.color = "#94a3b8";
  });
}

// Helper Functions
function getSignal(risk) {
  const score = (risk.probability * probWeight) + (risk.impact * impactWeight);
  const maxScore = 5 * probWeight + 5 * impactWeight;
  const normalizedScore = (score / maxScore) * 100;
  
  // Avoid/Exit: High probability + high impact + worsening momentum
  if (risk.probability >= 4 && risk.impact >= 4 && 
      (risk.mShort === "Up" || risk.mLong === "Critical")) {
    return {
      type: "exit",
      text: "AVOID / EXIT",
      rationale: "High & accelerating risk. Capital impairment likely (>20% downside)."
    };
  }
  
  // Engage/Conditional: Material risk present
  if (normalizedScore >= 60 || risk.probability >= 3) {
    return {
      type: "engage",
      text: "ENGAGE / CONDITIONAL",
      rationale: "Material risk exists. Requires milestones & monitoring (10-15% EBITDA impact)."
    };
  }
  
  // Invest/Scale: Low or improving risk
  return {
    type: "invest",
    text: "INVEST / SCALE",
    rationale: "Low/improving risk profile. Clean capital deployment opportunity."
  };
}

function getTrendClass(trend) {
  switch(trend) {
    case "Up":
    case "Critical":
      return "trend-up";
    case "Down":
      return "trend-down";
    default:
      return "trend-stable";
  }
}

function getTrendSymbol(trend) {
  switch(trend) {
    case "Up": return "↗";
    case "Down": return "↘";
    case "Critical": return "⚠";
    default: return "→";
  }
}

function getOverallTrend(short, long) {
  if (long === "Critical") return "Critical";
  if (short === "Up" && long === "Up") return "Up";
  if (short === "Down" && long === "Down") return "Down";
  return "Stable";
}

function highlightRiskInTables(riskName) {
  // Highlight in momentum table
  document.querySelectorAll("#momentumTable tbody tr").forEach(row => {
    if (row.cells[0].textContent === riskName) {
      row.style.background = "rgba(59, 130, 246, 0.2)";
      row.style.borderLeft = "3px solid #3b82f6";
    } else {
      row.style.background = "";
      row.style.borderLeft = "";
    }
  });
  
  // Highlight in decision table
  document.querySelectorAll("#decisionTable tbody tr").forEach(row => {
    if (row.cells[0].textContent === riskName) {
      row.style.background = "rgba(59, 130, 246, 0.2)";
      row.style.borderLeft = "3px solid #3b82f6";
    } else {
      row.style.background = "";
      row.style.borderLeft = "";
    }
  });
}

// Sector Preset Loading
function loadSectorPreset() {
  const sector = document.getElementById("sectorSelect").value;
  currentSector = sector;
  
  if (sector === "custom") {
    alert("Please upload a CSV file or select a different sector.");
    return;
  }
  
  const preset = sectorPresets[sector];
  
  // Update weights
  document.getElementById("probWeight").value = preset.defaultProbWeight;
  document.getElementById("impactWeight").value = preset.defaultImpactWeight;
  document.getElementById("probValue").innerText = preset.defaultProbWeight;
  document.getElementById("impactValue").innerText = preset.defaultImpactWeight;
  probWeight = preset.defaultProbWeight;
  impactWeight = preset.defaultImpactWeight;
  
  // Update description
  document.getElementById("sectorDescription").innerHTML = 
    `<strong>${preset.name}:</strong> ${preset.description}`;
  
  // Convert preset risks to CSV format and load
  const csvHeader = "Risk_Name,Probability_Score,Financial_Impact,Momentum_12_24M,Momentum_3_5Y\n";
  const csvRows = preset.defaultRisks.map(risk => risk.join(",")).join("\n");
  const csvContent = csvHeader + csvRows;
  
  parseCSV(csvContent);
}

// Export Functions
function exportPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(16);
    pdf.setTextColor(59, 130, 246);
    pdf.text("ESG Risk Decision Snapshot", 20, 20);
    
    // Metadata
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()} • Sector: ${currentSector === 'custom' ? 'Custom' : sectorPresets[currentSector].name}`, 20, 30);
    
    // Summary
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    let y = 45;
    
    if (currentData.length > 0) {
      pdf.text("Risk Summary:", 20, y);
      y += 8;
      
      const signals = currentData.map(risk => getSignal(risk));
      const investCount = signals.filter(s => s.type === 'invest').length;
      const engageCount = signals.filter(s => s.type === 'engage').length;
      const exitCount = signals.filter(s => s.type === 'exit').length;
      
      pdf.text(`• INVEST / SCALE: ${investCount} risks`, 25, y);
      y += 6;
      pdf.text(`• ENGAGE / CONDITIONAL: ${engageCount} risks`, 25, y);
      y += 6;
      pdf.text(`• AVOID / EXIT: ${exitCount} risks`, 25, y);
      y += 10;
    }
    
    // Detailed Table
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Detailed Risk Assessment:", 20, y);
    y += 8;
    
    let startY = y;
    currentData.forEach((risk, i) => {
      if (y > 250) { // New page if needed
        pdf.addPage();
        y = 20;
        startY = 20;
      }
      
      const signal = getSignal(risk);
      pdf.setFontSize(9);
      pdf.text(`${i+1}. ${risk.name}`, 25, y);
      pdf.text(`Score: ${((risk.probability * probWeight) + (risk.impact * impactWeight)).toFixed(1)}`, 150, y);
      pdf.text(signal.text, 180, y);
      y += 5;
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`P:${risk.probability}×${probWeight} I:${risk.impact}×${impactWeight} | Short: ${risk.mShort} | Long: ${risk.mLong}`, 30, y);
      y += 5;
      
      pdf.text(`Rationale: ${signal.rationale}`, 30, y);
      y += 8;
      
      pdf.setTextColor(0, 0, 0);
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Generated by ESG Risk Decision Dashboard • Client-Side Edition • All data processed locally", 20, 280);
    
    // Save
    const sectorLabel = currentSector === 'custom' ? 'custom' : sectorPresets[currentSector].name.toLowerCase().replace(/\s+/g, '_');
    pdf.save(`esg_risk_snapshot_${sectorLabel}_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    alert("Error generating PDF. Please try again.");
    console.error("PDF Export Error:", error);
  }
}

function exportCSV() {
  if (currentData.length === 0) {
    alert("No data to export. Please upload a CSV or select a sector preset.");
    return;
  }
  
  const headers = ["Risk_Name", "Probability_Score", "Financial_Impact", "Momentum_12_24M", "Momentum_3_5Y", "Weighted_Score", "Allocation_Signal"];
  const rows = currentData.map(risk => {
    const score = (risk.probability * probWeight) + (risk.impact * impactWeight);
    const signal = getSignal(risk);
    return [
      risk.name,
      risk.probability,
      risk.impact,
      risk.mShort,
      risk.mLong,
      score.toFixed(2),
      signal.text
    ];
  });
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `esg_risk_data_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function copyToClipboard() {
  if (currentData.length === 0) {
    alert("No data to copy. Please upload a CSV or select a sector preset.");
    return;
  }
  
  const summary = [];
  summary.push("ESG RISK DECISION SUMMARY");
  summary.push("Generated: " + new Date().toLocaleString());
  summary.push("Sector: " + (currentSector === 'custom' ? 'Custom' : sectorPresets[currentSector].name));
  summary.push("");
  
  const signals = currentData.map(risk => getSignal(risk));
  const investCount = signals.filter(s => s.type === 'invest').length;
  const engageCount = signals.filter(s => s.type === 'engage').length;
  const exitCount = signals.filter(s => s.type === 'exit').length;
  
  summary.push("SIGNAL DISTRIBUTION:");
  summary.push(`• INVEST / SCALE: ${investCount} risks`);
  summary.push(`• ENGAGE / CONDITIONAL: ${engageCount} risks`);
  summary.push(`• AVOID / EXIT: ${exitCount} risks`);
  summary.push("");
  
  summary.push("HIGH-PRIORITY RISKS:");
  currentData.forEach((risk, i) => {
    const signal = getSignal(risk);
    if (signal.type === 'exit') {
      summary.push(`${i+1}. ${risk.name} - ${signal.text}`);
    }
  });
  
  const text = summary.join("\n");
  
  navigator.clipboard.writeText(text).then(() => {
    alert("Summary copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy:", err);
    alert("Failed to copy to clipboard. Please try again.");
  });
}

// Initialize with sample data on first load
window.addEventListener('load', () => {
  // Auto-load tech sector as example on first visit
  if (!localStorage.getItem('esgDashboardVisited')) {
    setTimeout(() => {
      document.getElementById('sectorSelect').value = 'tech';
      loadSectorPreset();
    }, 500);
    localStorage.setItem('esgDashboardVisited', 'true');
  }
});
