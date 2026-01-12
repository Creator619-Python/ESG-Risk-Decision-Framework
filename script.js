// Global Variables
let currentData = [];
let probWeight = 3;
let impactWeight = 3;
let currentSector = 'custom';
let currentInputMethod = 'none';

// Sector Presets (same as before)
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
      ["Workforce Transition", 3, 3, "Stable", "Up"]
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
      ["Rare Earth Minerals Exposure", 3, 4, "Stable", "Up"]
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
      ["Energy Price Volatility", 4, 4, "Up", "Up"]
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
      ["Just Transition Financing", 3, 2, "Stable", "Up"]
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
      ["Scope 3 - Patient Travel", 2, 2, "Stable", "Up"]
    ]
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Add first row to inline table
  addRow();
  
  // File upload handler
  document.getElementById("fileInput").addEventListener("change", handleFile);
  
  // Weight sliders
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
  
  // Sector selector
  document.getElementById("sectorSelect").addEventListener("change", function() {
    currentSector = this.value;
    updateSectorBadge();
    const sectorDesc = document.getElementById("sectorDescription");
    
    if (currentSector === "custom") {
      sectorDesc.innerHTML = `<strong>Custom Mode:</strong> Define your own risks and weights.`;
    } else {
      const preset = sectorPresets[currentSector];
      sectorDesc.innerHTML = `<strong>${preset.name}:</strong> ${preset.description}`;
    }
  });
  
  // Initialize with one example row
  document.querySelector("#tableBody input").value = "Example: Carbon Pricing Exposure";
  document.querySelector("#tableBody input[type='number']").value = 4;
  document.querySelectorAll("#tableBody input[type='number']")[1].value = 5;
  
  updateNavStatus();
});

// Input Method Selection
function showMethod(method) {
  // Hide all input sections
  document.getElementById('inlineEntry').classList.add('hidden');
  document.getElementById('csvUpload').classList.add('hidden');
  document.getElementById('sectorConfig').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('controlsSection').classList.add('hidden');
  
  // Remove active class from all method cards
  document.querySelectorAll('.method-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Show selected method
  currentInputMethod = method;
  
  if (method === 'inline') {
    document.getElementById('inlineEntry').classList.remove('hidden');
    document.getElementById('methodInline').classList.add('active');
    document.getElementById('controlsSection').classList.remove('hidden');
  } else if (method === 'csv') {
    document.getElementById('csvUpload').classList.remove('hidden');
    document.getElementById('methodCSV').classList.add('active');
  } else if (method === 'sample') {
    document.getElementById('sectorConfig').classList.remove('hidden');
    document.getElementById('methodSample').classList.add('active');
    document.getElementById('controlsSection').classList.remove('hidden');
  }
  
  updateNavStatus();
}

// Inline Table Functions
function addRow() {
  const tbody = document.getElementById('tableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" placeholder="e.g., Supply Chain Risk"></td>
    <td><input type="number" min="1" max="5" value="3"></td>
    <td><input type="number" min="1" max="5" value="3"></td>
    <td>
      <select>
        <option>Up</option>
        <option selected>Stable</option>
        <option>Down</option>
      </select>
    </td>
    <td>
      <select>
        <option>Critical</option>
        <option>Up</option>
        <option selected>Stable</option>
        <option>Down</option>
      </select>
    </td>
    <td>
      <button class="delete-btn" onclick="deleteRow(this)">✕</button>
    </td>
  `;
  tbody.appendChild(row);
}

function deleteRow(button) {
  const row = button.closest('tr');
  if (row) {
    row.remove();
  }
}

function clearTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  addRow(); // Add one empty row back
}

function useTableData() {
  const rows = document.querySelectorAll('#tableBody tr');
  const data = [];
  let hasErrors = false;
  
  rows.forEach((row, index) => {
    const inputs = row.querySelectorAll('input, select');
    const riskName = inputs[0].value.trim();
    const probability = parseInt(inputs[1].value);
    const impact = parseInt(inputs[2].value);
    const mShort = inputs[3].value;
    const mLong = inputs[4].value;
    
    // Validate
    if (!riskName) {
      alert(`Row ${index + 1}: Please enter a risk name`);
      inputs[0].focus();
      hasErrors = true;
      return;
    }
    
    if (isNaN(probability) || probability < 1 || probability > 5) {
      alert(`Row ${index + 1}: Probability must be a number between 1-5`);
      inputs[1].focus();
      hasErrors = true;
      return;
    }
    
    if (isNaN(impact) || impact < 1 || impact > 5) {
      alert(`Row ${index + 1}: Impact must be a number between 1-5`);
      inputs[2].focus();
      hasErrors = true;
      return;
    }
    
    data.push({
      name: riskName,
      probability: probability,
      impact: impact,
      mShort: mShort,
      mLong: mLong
    });
  });
  
  if (!hasErrors && data.length > 0) {
    currentData = data;
    renderDashboard(data);
  } else if (data.length === 0) {
    alert('Please add at least one risk factor to analyze.');
  }
}

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
        throw new Error(`Missing required column: ${header}. Required columns: ${requiredHeaders.join(", ")}`);
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
        throw new Error(`Row ${index + 2}: Probability_Score must be 1-5`);
      }
      if (isNaN(impact) || impact < 1 || impact > 5) {
        throw new Error(`Row ${index + 2}: Financial_Impact must be 1-5`);
      }
      
      const validMoments = ["Up", "Down", "Stable", "Critical"];
      if (!validMoments.includes(entry.Momentum_12_24M) || !validMoments.includes(entry.Momentum_3_5Y)) {
        throw new Error(`Row ${index + 2}: Momentum must be: ${validMoments.join(", ")}`);
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
    showMethod('inline'); // Switch to inline view with data loaded
    renderDashboard(data);
    
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error("CSV Parse Error:", error);
  }
}

// Sector Preset Loading
function loadSectorPreset() {
  const sector = document.getElementById("sectorSelect").value;
  currentSector = sector;
  
  if (sector === "custom") {
    alert("Please select an industry sector from the dropdown.");
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
  
  // Load into inline table
  clearTable();
  preset.defaultRisks.forEach((risk, index) => {
    if (index > 0) addRow();
    const rows = document.querySelectorAll('#tableBody tr');
    const currentRow = rows[rows.length - 1];
    const inputs = currentRow.querySelectorAll('input, select');
    
    inputs[0].value = risk[0];
    inputs[1].value = risk[1];
    inputs[2].value = risk[2];
    inputs[3].value = risk[3];
    inputs[4].value = risk[4];
  });
  
  // Show inline entry with loaded data
  showMethod('inline');
}

// Dashboard Rendering (same as before, with minor updates)
function renderDashboard(data) {
  currentData = data;
  
  // Hide input sections, show dashboard
  document.getElementById('inlineEntry').classList.add('hidden');
  document.getElementById('csvUpload').classList.add('hidden');
  document.getElementById('sectorConfig').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('controlsSection').classList.remove('hidden');
  
  updateSectorBadge();
  renderHeatmap(data);
  renderMomentum(data);
  renderDecisions(data);
  updateNavStatus();
}

function updateSectorBadge() {
  const badge = document.getElementById("sectorBadge");
  badge.textContent = currentSector === "custom" ? "Custom Portfolio" : sectorPresets[currentSector].name;
}

function updateNavStatus() {
  const status = document.getElementById("navStatus");
  if (currentData.length > 0) {
    status.textContent = `${currentData.length} risks loaded • Ready for analysis`;
  } else {
    status.textContent = "No data entered yet";
  }
}

// Navigation
function goBackToInput() {
  document.getElementById('dashboard').classList.add('hidden');
  if (currentInputMethod === 'inline') {
    document.getElementById('inlineEntry').classList.remove('hidden');
  } else if (currentInputMethod === 'csv') {
    document.getElementById('csvUpload').classList.remove('hidden');
  } else if (currentInputMethod === 'sample') {
    document.getElementById('sectorConfig').classList.remove('hidden');
  } else {
    // Show method selection
    document.getElementById('inlineEntry').classList.add('hidden');
    document.getElementById('csvUpload').classList.add('hidden');
    document.getElementById('sectorConfig').classList.add('hidden');
    document.querySelectorAll('.method-card').forEach(card => {
      card.classList.remove('active');
    });
  }
  updateNavStatus();
}

// Template Download
function downloadTemplate() {
  const template = `Risk_Name,Probability_Score,Financial_Impact,Momentum_12_24M,Momentum_3_5Y
Carbon Pricing Exposure,5,5,Up,Critical
Water Stress - Operations,4,4,Up,Critical
Supply Chain Labor Conditions,3,4,Stable,Up
Worker Safety,2,3,Down,Stable
Policy Uncertainty,5,4,Up,Critical

# Instructions:
# 1. Probability_Score: 1 (Low) to 5 (High)
# 2. Financial_Impact: 1 (Low) to 5 (High)
# 3. Momentum_12_24M: Up, Stable, Down, or Critical
# 4. Momentum_3_5Y: Up, Stable, Down, or Critical`;
  
  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'esg_risk_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Export Functions (same as before)
function exportPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setTextColor(59, 130, 246);
    pdf.text("ESG Risk Decision Snapshot", 20, 20);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()} • ${currentData.length} risks analyzed`, 20, 30);
    
    let y = 45;
    currentData.forEach((risk, i) => {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
      
      const signal = getSignal(risk);
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${i+1}. ${risk.name}`, 20, y);
      pdf.text(signal.text, 180, y);
      y += 6;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Score: ${((risk.probability * probWeight) + (risk.impact * impactWeight)).toFixed(1)} • P:${risk.probability} I:${risk.impact}`, 25, y);
      y += 5;
      pdf.text(`Rationale: ${signal.rationale}`, 25, y);
      y += 10;
    });
    
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Generated by ESG Risk Decision Dashboard • Client-Side Edition", 20, 280);
    
    pdf.save(`esg_risk_snapshot_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    alert("Error generating PDF. Please try again.");
    console.error("PDF Export Error:", error);
  }
}

function exportCSV() {
  if (currentData.length === 0) {
    alert("No data to export.");
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
  
  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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
    alert("No data to copy.");
    return;
  }
  
  const summary = [
    "ESG RISK DECISION SUMMARY",
    `Generated: ${new Date().toLocaleString()}`,
    `Sector: ${currentSector === 'custom' ? 'Custom' : sectorPresets[currentSector].name}`,
    "",
    "SIGNAL DISTRIBUTION:"
  ];
  
  const signals = currentData.map(risk => getSignal(risk));
  const investCount = signals.filter(s => s.type === 'invest').length;
  const engageCount = signals.filter(s => s.type === 'engage').length;
  const exitCount = signals.filter(s => s.type === 'exit').length;
  
  summary.push(`INVEST / SCALE: ${investCount} risks`);
  summary.push(`ENGAGE / CONDITIONAL: ${engageCount} risks`);
  summary.push(`AVOID / EXIT: ${exitCount} risks`);
  
  navigator.clipboard.writeText(summary.join("\n")).then(() => {
    alert("Summary copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy:", err);
  });
}

// Decision Logic (same as before)
function getSignal(risk) {
  const score = (risk.probability * probWeight) + (risk.impact * impactWeight);
  const maxScore = 5 * probWeight + 5 * impactWeight;
  const normalizedScore = (score / maxScore) * 100;
  
  if (risk.probability >= 4 && risk.impact >= 4 && 
      (risk.mShort === "Up" || risk.mLong === "Critical")) {
    return {
      type: "exit",
      text: "AVOID / EXIT",
      rationale: "High & accelerating risk. Capital impairment likely."
    };
  }
  
  if (normalizedScore >= 60 || risk.probability >= 3) {
    return {
      type: "engage",
      text: "ENGAGE / CONDITIONAL",
      rationale: "Material risk exists. Requires monitoring."
    };
  }
  
  return {
    type: "invest",
    text: "INVEST / SCALE",
    rationale: "Low/improving risk profile."
  };
}

function renderHeatmap(data) {
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";
  
  data.forEach(risk => {
    const weightedScore = (risk.probability * probWeight) + (risk.impact * impactWeight);
    const maxScore = 5 * probWeight + 5 * impactWeight;
    const normalizedScore = (weightedScore / maxScore) * 25;
    
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
    
    tile.addEventListener("click", () => {
      document.querySelectorAll(".tile").forEach(t => t.style.opacity = "0.6");
      tile.style.opacity = "1";
      highlightRiskInTables(risk.name);
    });
    
    heatmap.appendChild(tile);
  });
}

function renderMomentum(data) {
  const tbody = document.querySelector("#momentumTable tbody");
  tbody.innerHTML = "";
  
  data.forEach(risk => {
    const row = tbody.insertRow();
    row.insertCell().textContent = risk.name;
    
    const shortCell = row.insertCell();
    shortCell.textContent = risk.mShort;
    shortCell.className = getTrendClass(risk.mShort);
    
    const longCell = row.insertCell();
    longCell.textContent = risk.mLong;
    longCell.className = getTrendClass(risk.mLong);
    
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
    row.insertCell().textContent = risk.name;
    
    const scoreCell = row.insertCell();
    const score = (risk.probability * probWeight) + (risk.impact * impactWeight);
    scoreCell.textContent = score.toFixed(1);
    scoreCell.style.fontWeight = "600";
    
    const signalCell = row.insertCell();
    const signal = getSignal(risk);
    signalCell.textContent = signal.text;
    signalCell.className = `signal-${signal.type}`;
    
    const rationaleCell = row.insertCell();
    rationaleCell.textContent = signal.rationale;
    rationaleCell.style.fontSize = "0.9rem";
    rationaleCell.style.color = "#94a3b8";
  });
}

// Helper functions (same as before)
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
  document.querySelectorAll("#momentumTable tbody tr").forEach(row => {
    if (row.cells[0].textContent === riskName) {
      row.style.background = "rgba(59, 130, 246, 0.2)";
    } else {
      row.style.background = "";
    }
  });
  
  document.querySelectorAll("#decisionTable tbody tr").forEach(row => {
    if (row.cells[0].textContent === riskName) {
      row.style.background = "rgba(59, 130, 246, 0.2)";
    } else {
      row.style.background = "";
    }
  });
}
