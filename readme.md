# 🧮 AWS EC2 Pricing Calculator (AXA Themed)

A sleek, browser-based AWS EC2 pricing calculator designed with AXA branding. This tool helps you calculate instance and EBS costs in real-time, with clear breakdowns and export options — no backend required.

---

## ✅ Features Implemented

| Feature | Status |
|---------|--------|
| 🎨 AXA UI branding with colors + favicon | ✅ |
| 📥 Load EC2 pricing from CSV | ✅ |
| 🔽 Dropdowns for Instance Type, OS, Region | ✅ |
| 🖩 User input for: VM count, number of EBS disks, disk size per disk | ✅ |
| 💡 Dynamic disk boxes | ✅ |
| 📊 Real-time cost breakdown (hourly + monthly) | ✅ |
| 💼 MPI Support Cost (30%) calculation | ✅ |
| 📄 Cost breakdown table (instead of inline list) | ✅ |
| 📤 Export to PDF (html2pdf.js) | ✅ |
| 📤 Export to Excel (SheetJS) | ✅ |
| 🔁 Reset calculation (form reset) | ✅ |
| ⏳ Save Calculation (placeholder alert) | ✅ |
| 📬 Footer with contact info | ✅ |

---

## 🚀 How to Run Locally

### Option 1: Using Python HTTP Server

```bash
cd path/to/project
python -m http.server 8000
```

Then visit: `http://localhost:8000`

### Option 2: Using VS Code + Live Server

1. Open project in VS Code  
2. Install **Live Server** extension  
3. Right-click `index.html` → **Open with Live Server**

---

## 📄 File Structure

```
V7/
├── index.html
├── style.css
├── script.js
├── pricing.csv
├── README.md
└── img/
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── screenshot.png
```

---

## 📬 Contact

For any inquiry or suggestion for future development, please contact:  
📧 [email@axa.com](mailto:email@axa.com)