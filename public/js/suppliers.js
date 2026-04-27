function renderSuppliers() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Suppliers</h2>';

    // Add supplier form
    const addSupplierForm = `
        <form id="add-supplier-form">
            <h3>Add New Supplier</h3>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="contact_person">Contact Person</label>
                <input type="text" id="contact_person" name="contact_person">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" id="phone" name="phone">
            </div>
            <div class="form-group">
                <label for="address">Address</label>
                <textarea id="address" name="address"></textarea>
            </div>
            <button type="submit">Add Supplier</button>
        </form>
    `;
    mainContent.innerHTML += addSupplierForm;

    // Supplier table
    const supplierTable = `
        <h3>All Suppliers</h3>
        <table id="suppliers-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    mainContent.innerHTML += supplierTable;

    const addSupplierFormElement = document.getElementById('add-supplier-form');
    addSupplierFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addSupplierFormElement);
        const supplierData = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (res.ok) {
                renderSuppliers();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            alert('An error occurred while adding the supplier.');
        }
    });

    // Fetch and display suppliers
    fetch('/api/suppliers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const suppliers = data.data;
                const tableBody = document.querySelector('#suppliers-table tbody');
                tableBody.innerHTML = '';
                suppliers.forEach(supplier => {
                    const row = `
                        <tr>
                            <td>${supplier.name}</td>
                            <td>${supplier.contact_person}</td>
                            <td>${supplier.email}</td>
                            <td>${supplier.phone}</td>
                            <td>${supplier.address}</td>
                            <td>
                                <button class="edit-btn" data-id="${supplier.id}">Edit</button>
                                <button class="delete-btn" data-id="${supplier.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });

                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        // Implement edit functionality here
                        alert('Edit functionality not implemented yet.');
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const supplierId = e.target.dataset.id;
                        if (confirm('Are you sure you want to delete this supplier?')) {
                            try {
                                const res = await fetch(`/api/suppliers/${supplierId}`, {
                                    method: 'DELETE'
                                });

                                if (res.ok) {
                                    renderSuppliers();
                                } else {
                                    const data = await res.json();
                                    alert(data.message);
                                }
                            } catch (error) {
                                console.error('Error deleting supplier:', error);
                                alert('An error occurred while deleting the supplier.');
                            }
                        }
                    });
                });
            } else {
                alert('Could not fetch suppliers.');
            }
        })
        .catch(error => {
            console.error('Error fetching suppliers:', error);
            alert('An error occurred while fetching suppliers.');
        });
}
