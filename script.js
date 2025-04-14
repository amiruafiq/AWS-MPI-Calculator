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
        document.getElementById('result').innerText = 'Pricing data not found for selected combination.';
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

    document.getElementById('result').innerHTML = `
        <div>1) VM Cost per Hour (exclude disk): <strong>$${pricePerHour.toFixed(3)}</strong></div>
        <div>2) Total VM Cost for ${vmCount} VM(s): <strong>$${totalVmCost.toFixed(3)}</strong></div>
        <div>3) Total Disk Cost per VM: <strong>$${diskCostPerVM.toFixed(3)}</strong></div>
        <div>4) Total Cost (VM + EBS): <strong>$${grandTotalHourly.toFixed(3)}</strong> per hour</div>
        <div>5) Monthly Estimated Cost (30 days): <strong>$${monthlyTotal.toFixed(3)}</strong></div>
    `;
}

function exportToPDF() {
    const pdfContent = document.getElementById('pdfContent');

    if (!pdfContent.innerText.trim()) {
        alert('Please calculate pricing before exporting.');
        return;
    }

    const opt = {
        margin:       0.5,
        filename:     'aws-ec2-pricing-summary.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
}


window.onload = loadCSV;
