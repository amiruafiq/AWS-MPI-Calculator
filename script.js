let pricingData = [];

async function loadCSV() {
    const response = await fetch('pricing.csv');
    if (!response.ok) {
        alert('Failed to load CSV file.');
        return;
    }

    const data = await response.text();
    const rows = data.trim().split(/\r?\n/);
    const headers = rows[0].split(',').map(h => h.trim());

    rows.slice(1).forEach(row => {
        const columns = row.split(',').map(c => c.trim());
        if (columns.length === headers.length) {
            let entry = {};
            headers.forEach((header, idx) => {
                entry[header] = columns[idx];
            });
            pricingData.push(entry);
        }
    });

    populateSelectors();
}

function populateSelectors() {
    const instanceTypes = [...new Set(pricingData.map(p => p["Instance Type"]))];
    const osTypes = [...new Set(pricingData.map(p => p["OS Type"]))];

    const instanceSelect = document.getElementById('instanceType');
    instanceTypes.forEach(type => {
        instanceSelect.add(new Option(type, type));
    });

    const osSelect = document.getElementById('osType');
    osTypes.forEach(os => {
        osSelect.add(new Option(os, os));
    });
}

function generateDisks() {
    const diskCount = parseInt(document.getElementById('diskCount').value, 10);
    const container = document.getElementById('diskInputsContainer');
    container.innerHTML = '';

    for (let i = 1; i <= diskCount; i++) {
        const div = document.createElement('div');
        div.className = 'disk-box';
        div.innerHTML = `
            <label>Disk ${i}</label>
            <input type="number" class="disk-size" placeholder="enter storage size (GiB)" min="0" value="0"/>
        `;
        container.appendChild(div);
    }
}

function calculatePrice() {
    const instanceType = document.getElementById('instanceType').value;
    const osType = document.getElementById('osType').value;
    const region = document.getElementById('region').value;
    const vmCount = parseInt(document.getElementById('vmCount').value, 10);

    if (!instanceType || !osType || !region || isNaN(vmCount) || vmCount < 1) {
        alert('Please fill in all fields with valid values!');
        return;
    }

    const selected = pricingData.find(p =>
        p["Instance Type"] === instanceType && p["OS Type"] === osType
    );

    if (!selected) {
        alert("Pricing data not found for selected combination.");
        return;
    }

    const pricePerHour = parseFloat(selected[region]);
    const totalVmCost = pricePerHour * vmCount;

    const ebsHourlyPerGiB = 0.000111;
    const diskInputs = document.querySelectorAll('.disk-size');
    let totalGiBPerVM = 0;
    diskInputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) totalGiBPerVM += val;
    });

    const diskCostPerVM = totalGiBPerVM * ebsHourlyPerGiB;
    const totalDiskCost = diskCostPerVM * vmCount;
    const grandTotalHourly = totalVmCost + totalDiskCost;
    const monthlyTotal = grandTotalHourly * 24 * 30;
    const supportCost = monthlyTotal * 0.3;
    const finalTotal = monthlyTotal + supportCost;
    const monthlyPerVm = pricePerHour * 24 * 30;

    // Fill Cost Breakdown Table
    document.getElementById("hourlyPerVm").innerText = `$${pricePerHour.toFixed(5)}`;
    document.getElementById("hourlyTotal").innerText = `$${totalVmCost.toFixed(5)}`;
    document.getElementById("monthlyPerVm").innerText = `$${monthlyPerVm.toFixed(4)}`;
    document.getElementById("monthlyTotal").innerText = `$${monthlyTotal.toFixed(4)}`;
    document.getElementById("supportCost").innerText = `$${supportCost.toFixed(4)}`;
    document.getElementById("monthlyWithSupport").innerText = `$${finalTotal.toFixed(4)}`;
    document.getElementById("costBreakdown").classList.remove("hidden");
}

function resetForm() {
    document.getElementById("instanceType").value = "";
    document.getElementById("osType").value = "";
    document.getElementById("region").value = "";
    document.getElementById("vmCount").value = 1;
    document.getElementById("diskCount").value = 0;
    document.getElementById("diskInputsContainer").innerHTML = "";
    document.getElementById("costBreakdown").classList.add("hidden");
}

function saveCalculation() {
    alert("Save Calculation: Feature not implemented yet.");
}

function exportToPDF() {
    const content = document.getElementById("pdfContent");

    if (!content.innerText.trim()) {
        alert("Please calculate pricing before exporting.");
        return;
    }

    const opt = {
        margin: 0.5,
        filename: 'aws-ec2-pricing-summary.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
}

function exportToExcel() {
    const table = document.getElementById("costBreakdown");
    if (table.classList.contains("hidden")) {
        alert("Please calculate pricing before exporting.");
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Pricing Summary");
    XLSX.writeFile(wb, "aws-ec2-pricing-summary.xlsx");
}

window.onload = loadCSV;
