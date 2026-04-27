function renderReports() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Reports</h2>';

    const reportButtons = `
        <div class="report-buttons">
            <button id="inventory-value-report">Inventory Value Report</button>
            <button id="category-distribution-report">Category Distribution Report</button>
            <button id="export-inventory">Export Inventory (CSV)</button>
        </div>
        <div id="report-content"></div>
    `;
    mainContent.innerHTML += reportButtons;

    document.getElementById('inventory-value-report').addEventListener('click', async () => {
        try {
            const res = await fetch('/api/reports/value');
            const data = await res.json();
            if (data.status === 'success') {
                const reportContent = document.getElementById('report-content');
                reportContent.innerHTML = `
                    <h3>Inventory Value Report</h3>
                    <p>Total Inventory Value: $${data.data.total_value.toFixed(2)}</p>
                    <p>Total Items: ${data.data.total_items}</p>
                    <p>Average Price: $${data.data.average_price.toFixed(2)}</p>
                `;
            } else {
                alert('Could not generate inventory value report.');
            }
        } catch (error) {
            console.error('Error generating inventory value report:', error);
            alert('An error occurred while generating the report.');
        }
    });

    document.getElementById('category-distribution-report').addEventListener('click', async () => {
        try {
            const res = await fetch('/api/reports/categories');
            const data = await res.json();
            if (data.status === 'success') {
                const reportContent = document.getElementById('report-content');
                let table = '<h3>Category Distribution Report</h3><table><thead><tr><th>Category</th><th>Item Count</th><th>Total Quantity</th><th>Category Value</th></tr></thead><tbody>';
                data.data.forEach(row => {
                    table += `<tr><td>${row.category}</td><td>${row.item_count}</td><td>${row.total_quantity}</td><td>$${row.category_value.toFixed(2)}</td></tr>`;
                });
                table += '</tbody></table>';
                reportContent.innerHTML = table;
            } else {
                alert('Could not generate category distribution report.');
            }
        } catch (error) {
            console.error('Error generating category distribution report:', error);
            alert('An error occurred while generating the report.');
        }
    });

    document.getElementById('export-inventory').addEventListener('click', () => {
        window.open('/api/reports/export');
    });
}
