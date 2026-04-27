function renderDashboard() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Dashboard</h2>';

    fetch('/api/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const stats = data.data;
                const dashboardContent = `
                    <div class="dashboard-stats">
                        <div>
                            <h3>Total Items</h3>
                            <p>${stats.totalItems}</p>
                        </div>
                        <div>
                            <h3>Inventory Value</h3>
                            <p>$${stats.inventoryValue.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3>Low Stock Items</h3>
                            <p>${stats.lowStockItems}</p>
                        </div>
                    </div>
                `;
                mainContent.innerHTML += dashboardContent;
            } else {
                mainContent.innerHTML += '<p>Could not fetch dashboard stats.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
            mainContent.innerHTML += '<p>An error occurred while fetching dashboard stats.</p>';
        });
}
