document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const mainContent = document.getElementById('main-content');
    const loginPage = document.getElementById('login-page');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const navLinks = document.querySelectorAll('nav a');

    const pages = {
        dashboard: renderDashboard,
        items: renderItems,
        suppliers: renderSuppliers,
        'purchase-orders': renderPurchaseOrders,
        'sales-orders': renderSalesOrders,
        alerts: renderAlerts,
        reports: renderReports,
        users: renderUsers
    };

    function router(page) {
        const pageContent = pages[page];
        if (typeof pageContent === 'function') {
            pageContent();
        } else {
            mainContent.innerHTML = pageContent;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                router(page);
            }
        });
    });

    // Check if user is logged in
    if (sessionStorage.getItem('user')) {
        loginPage.style.display = 'none';
        app.style.display = 'block';
        router('dashboard');
    } else {
        app.style.display = 'none';
        loginPage.style.display = 'block';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('user', JSON.stringify(data.user));
                loginPage.style.display = 'none';
                app.style.display = 'block';
                router('dashboard');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (res.ok) {
                sessionStorage.removeItem('user');
                app.style.display = 'none';
                loginPage.style.display = 'block';
            } else {
                alert('Logout failed.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout.');
        }
    });
});