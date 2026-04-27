function renderAlerts() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Alerts</h2>';

    // Low stock alerts
    const lowStockAlerts = `
        <h3>Low Stock Alerts</h3>
        <table id="low-stock-alerts-table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += lowStockAlerts;

    // Custom alerts
    const customAlerts = `
        <h3>Custom Alerts</h3>
        <table id="custom-alerts-table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Threshold</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += customAlerts;

    // Fetch and display low stock alerts
    fetch('/api/alerts/low-stock')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const alerts = data.data.alerts;
                const tableBody = document.querySelector('#low-stock-alerts-table tbody');
                tableBody.innerHTML = '';
                alerts.forEach(alert => {
                    const row = `
                        <tr>
                            <td>${alert.name}</td>
                            <td>${alert.quantity}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                alert('Could not fetch low stock alerts.');
            }
        })
        .catch(error => {
            console.error('Error fetching low stock alerts:', error);
            alert('An error occurred while fetching low stock alerts.');
        });

    // Fetch and display custom alerts
    fetch('/api/alerts/custom')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const alerts = data.data.alerts;
                const tableBody = document.querySelector('#custom-alerts-table tbody');
                tableBody.innerHTML = '';
                alerts.forEach(alert => {
                    const row = `
                        <tr>
                            <td>${alert.name}</td>
                            <td>${alert.quantity}</td>
                            <td>${alert.alert_threshold}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                alert('Could not fetch custom alerts.');
            }
        })
        .catch(error => {
            console.error('Error fetching custom alerts:', error);
            alert('An error occurred while fetching custom alerts.');
        });
}
