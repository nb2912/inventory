function renderSalesOrders() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Sales Orders</h2>';

    // Add sales order form
    const addSalesOrderForm = `
        <form id="add-sales-order-form">
            <h3>Create New Sales Order</h3>
            <div class="form-group">
                <label for="customer_name">Customer Name</label>
                <input type="text" id="customer_name" name="customer_name" required>
            </div>
            <div class="form-group">
                <label for="order_date">Order Date</label>
                <input type="date" id="order_date" name="order_date" required>
            </div>
            <div id="so-items"></div>
            <button type="button" id="add-so-item">Add Item</button>
            <button type="submit">Create Sales Order</button>
        </form>
    `;
    mainContent.innerHTML += addSalesOrderForm;

    // Sales order table
    const salesOrderTable = `
        <h3>All Sales Orders</h3>
        <table id="sales-orders-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Order Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += salesOrderTable;

    // Add item to sales order
    let soItemCount = 0;
    document.getElementById('add-so-item').addEventListener('click', () => {
        soItemCount++;
        const soItem = `
            <div class="so-item">
                <h4>Item ${soItemCount}</h4>
                <div class="form-group">
                    <label for="item_id_${soItemCount}">Item</label>
                    <select id="item_id_${soItemCount}" name="item_id_${soItemCount}" required></select>
                </div>
                <div class="form-group">
                    <label for="quantity_${soItemCount}">Quantity</label>
                    <input type="number" id="quantity_${soItemCount}" name="quantity_${soItemCount}" required>
                </div>
                <div class="form-group">
                    <label for="price_${soItemCount}">Price</label>
                    <input type="number" id="price_${soItemCount}" name="price_${soItemCount}" step="0.01" required>
                </div>
            </div>
        `;
        document.getElementById('so-items').innerHTML += soItem;

        // Fetch items for the dropdown
        fetch('/api/items')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const itemSelect = document.getElementById(`item_id_${soItemCount}`);
                    data.data.items.forEach(item => {
                        const option = `<option value="${item.id}">${item.name}</option>`;
                        itemSelect.innerHTML += option;
                    });
                }
            });
    });

    const addSalesOrderFormElement = document.getElementById('add-sales-order-form');
    addSalesOrderFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addSalesOrderFormElement);
        const soData = {
            customer_name: formData.get('customer_name'),
            order_date: formData.get('order_date'),
            items: []
        };

        for (let i = 1; i <= soItemCount; i++) {
            soData.items.push({
                item_id: formData.get(`item_id_${i}`),
                quantity: formData.get(`quantity_${i}`),
                price: formData.get(`price_${i}`)
            });
        }

        try {
            const res = await fetch('/api/sales-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(soData)
            });

            if (res.ok) {
                renderSalesOrders();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating sales order:', error);
            alert('An error occurred while creating the sales order.');
        }
    });

    // Fetch and display sales orders
    fetch('/api/sales-orders')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const salesOrders = data.data;
                const tableBody = document.querySelector('#sales-orders-table tbody');
                tableBody.innerHTML = '';
                salesOrders.forEach(so => {
                    const row = `
                        <tr>
                            <td>${so.id}</td>
                            <td>${so.customer_name}</td>
                            <td>${new Date(so.order_date).toLocaleDateString()}</td>
                            <td>${so.status}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                alert('Could not fetch sales orders.');
            }
        })
        .catch(error => {
            console.error('Error fetching sales orders:', error);
            alert('An error occurred while fetching sales orders.');
        });
}
