function renderPurchaseOrders() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Purchase Orders</h2>';

    // Add purchase order form
    const addPurchaseOrderForm = `
        <form id="add-purchase-order-form">
            <h3>Create New Purchase Order</h3>
            <div class="form-group">
                <label for="supplier_id">Supplier</label>
                <select id="supplier_id" name="supplier_id" required></select>
            </div>
            <div class="form-group">
                <label for="order_date">Order Date</label>
                <input type="date" id="order_date" name="order_date" required>
            </div>
            <div class="form-group">
                <label for="expected_delivery_date">Expected Delivery Date</label>
                <input type="date" id="expected_delivery_date" name="expected_delivery_date">
            </div>
            <div id="po-items"></div>
            <button type="button" id="add-po-item">Add Item</button>
            <button type="submit">Create Purchase Order</button>
        </form>
    `;
    mainContent.innerHTML += addPurchaseOrderForm;

    // Purchase order table
    const purchaseOrderTable = `
        <h3>All Purchase Orders</h3>
        <table id="purchase-orders-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Supplier</th>
                    <th>Order Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += purchaseOrderTable;

    // Fetch suppliers for the dropdown
    fetch('/api/suppliers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const supplierSelect = document.getElementById('supplier_id');
                data.data.forEach(supplier => {
                    const option = `<option value="${supplier.id}">${supplier.name}</option>`;
                    supplierSelect.innerHTML += option;
                });
            }
        });

    // Add item to purchase order
    let poItemCount = 0;
    document.getElementById('add-po-item').addEventListener('click', () => {
        poItemCount++;
        const poItem = `
            <div class="po-item">
                <h4>Item ${poItemCount}</h4>
                <div class="form-group">
                    <label for="item_id_${poItemCount}">Item</label>
                    <select id="item_id_${poItemCount}" name="item_id_${poItemCount}" required></select>
                </div>
                <div class="form-group">
                    <label for="quantity_${poItemCount}">Quantity</label>
                    <input type="number" id="quantity_${poItemCount}" name="quantity_${poItemCount}" required>
                </div>
                <div class="form-group">
                    <label for="price_${poItemCount}">Price</label>
                    <input type="number" id="price_${poItemCount}" name="price_${poItemCount}" step="0.01" required>
                </div>
            </div>
        `;
        document.getElementById('po-items').innerHTML += poItem;

        // Fetch items for the dropdown
        fetch('/api/items')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const itemSelect = document.getElementById(`item_id_${poItemCount}`);
                    data.data.items.forEach(item => {
                        const option = `<option value="${item.id}">${item.name}</option>`;
                        itemSelect.innerHTML += option;
                    });
                }
            });
    });

    const addPurchaseOrderFormElement = document.getElementById('add-purchase-order-form');
    addPurchaseOrderFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addPurchaseOrderFormElement);
        const poData = {
            supplier_id: formData.get('supplier_id'),
            order_date: formData.get('order_date'),
            expected_delivery_date: formData.get('expected_delivery_date'),
            items: []
        };

        for (let i = 1; i <= poItemCount; i++) {
            poData.items.push({
                item_id: formData.get(`item_id_${i}`),
                quantity: formData.get(`quantity_${i}`),
                price: formData.get(`price_${i}`)
            });
        }

        try {
            const res = await fetch('/api/purchase-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(poData)
            });

            if (res.ok) {
                renderPurchaseOrders();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating purchase order:', error);
            alert('An error occurred while creating the purchase order.');
        }
    });

    // Fetch and display purchase orders
    fetch('/api/purchase-orders')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const purchaseOrders = data.data;
                const tableBody = document.querySelector('#purchase-orders-table tbody');
                tableBody.innerHTML = '';
                purchaseOrders.forEach(po => {
                    const row = `
                        <tr>
                            <td>${po.id}</td>
                            <td>${po.supplier_name}</td>
                            <td>${new Date(po.order_date).toLocaleDateString()}</td>
                            <td>${po.status}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                alert('Could not fetch purchase orders.');
            }
        })
        .catch(error => {
            console.error('Error fetching purchase orders:', error);
            alert('An error occurred while fetching purchase orders.');
        });
}
