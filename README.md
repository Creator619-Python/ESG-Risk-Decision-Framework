# ESG Risk Decision Dashboard

A **100% client-side** dashboard that translates ESG risk into capital allocation signals. No servers, no data transmission, runs entirely in your browser.

## 🚀 Quick Start

1. **Download** all files to a folder
2. **Open** `index.html` in Chrome/Firefox/Edge
3. **Upload** your CSV data or select a sector preset
4. **Analyze** risks and get capital allocation signals

## 📊 Features

- **Sector-Specific Analysis**: Pre-configured for Energy, Tech, Manufacturing, Finance, Healthcare
- **Adjustable Weighting**: Tune probability vs financial impact importance
- **Transparent Logic**: All decision rules are visible and auditable
- **Client-Side Only**: No data leaves your machine
- **Export Capabilities**: PDF reports, CSV exports, clipboard copy
- **Benchmarking**: Compare against sector averages

## 📝 Data Format

Create a CSV with these columns:
- `Risk_Name`: Name of the ESG risk
- `Probability_Score`: 1-5 (5 = high probability)
- `Financial_Impact`: 1-5 (5 = high impact)
- `Momentum_12_24M`: "Up", "Down", "Stable", or "Critical"
- `Momentum_3_5Y`: "Up", "Down", "Stable", or "Critical"

## 🏭 Sector Presets

Each sector includes:
- Industry-specific risk categories
- Default weighting based on sector characteristics
- Benchmark risk scores
- Relevant momentum indicators

## 🔒 Privacy & Security

- ✅ **100% client-side** - All processing happens in your browser
- ✅ **No data storage** - Nothing is saved or transmitted
- ✅ **No dependencies** - Works offline after download
- ✅ **Corporate safe** - Deploy on intranet without IT approval

## 🎯 Use Cases

- **ESG Teams**: Risk assessment and reporting
- **Finance**: Capital allocation decisions
- **Investment Committees**: Due diligence support
- **Risk Management**: Portfolio risk monitoring
- **Strategy**: Long-term risk positioning

## 🛠️ Customization

Edit `script.js` to:
- Adjust decision logic thresholds
- Add new sector presets
- Modify risk scoring formulas
- Customize export formats

## 📄 License

MIT License - free for personal and commercial use.

---

*"Sustainability becomes investable only when ESG risk is translated into decision-grade intelligence."*
