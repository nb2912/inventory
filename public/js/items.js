function renderItems() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>My Pantry</h2>';

    // Add item form
    const addItemForm = `
        <form id="add-item-form">
            <h3>Add New Item</h3>
            <div class="form-group">
                <label for="name">Name (e.g., Milk, Soap)</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <input type="number" id="quantity" name="quantity" required>
            </div>
            <div class="form-group">
                <label for="price">Estimated Price ($)</label>
                <input type="number" id="price" name="price" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="category">Category (e.g., Fridge, Bathroom)</label>
                <input type="text" id="category" name="category">
            </div>
            <div class="form-group">
                <label for="description">Notes / Description</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <button type="submit">Add to Pantry</button>
        </form>
    `;
    mainContent.innerHTML += addItemForm;

    // Item table
    const itemTable = `
        <h3>All Stuff</h3>
        <table id="items-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Notes</th>
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
        // Auto-generate missing fields for business logic
        itemData.serial_no = 'H-' + Date.now().toString();

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
                            <td>${item.name}</td>
                            <td>${item.category || ''}</td>
                            <td>$${item.price}</td>
                            <td>
                                <button class="btn-sm" onclick="window.updateHouseholdQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 0 ? 'disabled' : ''}>-</button>
                                <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                                <button class="btn-sm" onclick="window.updateHouseholdQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </td>
                            <td>${item.description || ''}</td>
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

// Global function so onclick works
window.updateHouseholdQuantity = async function(id, newQuantity) {
    try {
        const res = await fetch(`/api/items/${id}/quantity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        if (res.ok) {
            renderItems(); // re-render to show updated quantities
        } else {
            alert('Could not update quantity');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred.');
    }
};
