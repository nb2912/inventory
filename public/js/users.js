function renderUsers() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Users</h2>';

    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user && user.role === 'admin') {
        // User table
        const userTable = `
            <h3>All Users</h3>
            <table id="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `;
        mainContent.innerHTML += userTable;

        // Fetch and display users
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const users = data.data.users;
                    const tableBody = document.querySelector('#users-table tbody');
                    tableBody.innerHTML = '';
                    users.forEach(user => {
                        const row = `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        `;
                        tableBody.innerHTML += row;
                    });
                } else {
                    alert('Could not fetch users.');
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                alert('An error occurred while fetching users.');
            });
    } else {
        mainContent.innerHTML += '<p>You do not have permission to view this page.</p>';
    }
}
