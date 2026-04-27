function renderItems() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Items</h2>';

    // Add item form
    const addItemForm = `
        <form id="add-item-form">
            <h3>Add New Item</h3>
            <div class="form-group">
                <label for="serial_no">Serial No</label>
                <input type="text" id="serial_no" name="serial_no" required>
            </div>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="number" id="quantity" name="quantity" required>
            </div>
            <div class="form-group">
                <label for="price">Price</label>
                <input type="number" id="price" name="price" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="category">Category</label>
                <input type="text" id="category" name="category">
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <button type="submit">Add Item</button>
        </form>
    `;
    mainContent.innerHTML += addItemForm;

    // Item table
    const itemTable = `
        <h3>All Items</h3>
        <table id="items-table">
            <thead>
                <tr>
                    <th>Serial No</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += itemTable;

    const addItemFormElement = document.getElementById('add-item-form');
    addItemFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addItemFormElement);
        const itemData = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            if (res.ok) {
                renderItems();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('An error occurred while adding the item.');
        }
    });

    // Fetch and display items
    fetch('/api/items')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const items = data.data.items;
                const tableBody = document.querySelector('#items-table tbody');
                tableBody.innerHTML = '';
                items.forEach(item => {
                    const row = `
                        <tr>
                            <td>${item.serial_no}</td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                            <td>${item.category}</td>
                            <td>${item.description}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                alert('Could not fetch items.');
            }
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            alert('An error occurred while fetching items.');
        });
}
