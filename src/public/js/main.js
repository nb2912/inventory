// Main JavaScript file for the Inventory Management System

// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const logoutBtn = document.getElementById('logout-btn');
const menuLinks = document.querySelectorAll('.sidebar-menu a[data-page]');
const pageTitle = document.querySelector('.page-title');
const pages = document.querySelectorAll('.page');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const addItemBtn = document.getElementById('add-item-btn');
const addItemModal = document.getElementById('add-item-modal');
const closeModalBtn = document.querySelector('.close-modal');
const addItemForm = document.getElementById('add-item-form');
const scanBarcodeBtn = document.getElementById('scan-barcode');
const barcodeInput = document.getElementById('barcode-input');
const barcodeResult = document.getElementById('barcode-result');

// State
let currentUser = null;
let token = localStorage.getItem('token');
let isAuthenticated = !!token;

// Initialize the application
function init() {
    // Check if user is authenticated
    if (isAuthenticated) {
        showAuthenticatedUI();
        loadDashboardData();
    } else {
        showPage('login-page');
    }

    // Set up event listeners
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Navigation
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(`${pageId}-page`);
            pageTitle.textContent = link.textContent.trim();
            
            // Update active menu item
            document.querySelector('.sidebar-menu li.active').classList.remove('active');
            link.parentElement.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
            
            // Load page-specific data
            if (pageId === 'dashboard') {
                loadDashboardData();
            } else if (pageId === 'inventory') {
                loadInventoryData();
            } else if (pageId === 'categories') {
                loadCategoriesData();
            } else if (pageId === 'alerts') {
                loadAlertsData();
            } else if (pageId === 'reports') {
                loadReportsData();
            }
        });
    });

    // Authentication
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup-page');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);

    // Inventory
    addItemBtn?.addEventListener('click', () => {
        addItemModal.classList.add('active');
        loadCategoriesForDropdown();
    });

    closeModalBtn?.addEventListener('click', () => {
        addItemModal.classList.remove('active');
    });

    addItemForm?.addEventListener('submit', handleAddItem);

    // Barcode
    scanBarcodeBtn?.addEventListener('click', handleBarcodeScan);
}

// Page Navigation
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Authentication Functions
function showAuthenticatedUI() {
    document.querySelector('.app-container').classList.add('authenticated');
    showPage('dashboard-page');
    
    // Fetch user profile
    fetchUserProfile();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            token = data.token;
            isAuthenticated = true;
            showAuthenticatedUI();
            showToast('Login successful', 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred during login', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account created successfully', 'success');
            showPage('login-page');
        } else {
            showToast(data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('An error occurred during signup', 'error');
    }
}

async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage and reset state
    localStorage.removeItem('token');
    token = null;
    isAuthenticated = false;
    currentUser = null;
    
    // Show login page
    showPage('login-page');
    document.querySelector('.app-container').classList.remove('authenticated');
    showToast('Logged out successfully', 'success');
}

async function fetchUserProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.data.user;
            
            // Update UI with user info
            document.getElementById('user-name').textContent = currentUser.name;
        } else {
            // If unauthorized, log out
            if (response.status === 401) {
                handleLogout(new Event('click'));
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data.data);
            loadRecentItems();
        } else {
            showToast('Failed to load dashboard data', 'error');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('An error occurred while loading dashboard', 'error');
    }
}

function updateDashboardStats(stats) {
    document.getElementById('total-items').textContent = stats.totalItems || 0;
    document.getElementById('inventory-value').textContent = `$${(stats.totalValue || 0).toFixed(2)}`;
    document.getElementById('low-stock-count').textContent = stats.lowStockItems || 0;
    document.getElementById('category-count').textContent = stats.categories?.length || 0;
}

async function loadRecentItems() {
    try {
        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const recentItems = data.data.items.slice(0, 5); // Get only 5 most recent items
            
            const tableBody = document.querySelector('#recent-items-table tbody');
            tableBody.innerHTML = '';
            
            recentItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.category || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading recent items:', error);
    }
}

// Inventory Functions
async function loadInventoryData() {
    try {
        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayInventoryItems(data.data.items);
            loadCategoriesForFilter();
        } else {
            showToast('Failed to load inventory data', 'error');
        }
    } catch (error) {
        console.error('Inventory error:', error);
        showToast('An error occurred while loading inventory', 'error');
    }
}

function displayInventoryItems(items) {
    const tableBody = document.querySelector('#inventory-table tbody');
    tableBody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.serial_no}</td>
            <td>${item.category || 'N/A'}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <button class="btn-edit" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => handleEditItem(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteItem(btn.getAttribute('data-id')));
    });
}

async function loadCategoriesForFilter() {
    try {
        const response = await fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const categoryFilter = document.getElementById('category-filter');
            
            // Clear existing options except the first one
            while (categoryFilter.options.length > 1) {
                categoryFilter.remove(1);
            }
            
            // Add categories to dropdown
            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
            
            // Add event listener for filtering
            categoryFilter.addEventListener('change', filterInventoryByCategory);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadCategoriesForDropdown() {
    try {
        const response = await fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const categoryDropdown = document.getElementById('item-category');
            
            // Clear existing options
            categoryDropdown.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select a category';
            categoryDropdown.appendChild(emptyOption);
            
            // Add categories to dropdown
            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
}

async function filterInventoryByCategory() {
    const category = document.getElementById('category-filter').value;
    
    try {
        let url = '/api/items';
        if (category) {
            url = `/api/categories/${category}/items`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayInventoryItems(data.data.items);
        }
    } catch (error) {
        console.error('Error filtering inventory:', error);
    }
}

async function handleAddItem(e) {
    e.preventDefault();
    
    const itemData = {
        name: document.getElementById('item-name').value,
        serial_no: document.getElementById('item-serial').value,
        category: document.getElementById('item-category').value,
        quantity: parseInt(document.getElementById('item-quantity').value),
        price: parseFloat(document.getElementById('item-price').value),
        description: document.getElementById('item-description').value
    };
    
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Item added successfully', 'success');
            addItemModal.classList.remove('active');
            addItemForm.reset();
            loadInventoryData();
        } else {
            showToast(data.message || 'Failed to add item', 'error');
        }
    } catch (error) {
        console.error('Add item error:', error);
        showToast('An error occurred while adding the item', 'error');
    }
}

// Barcode Functions
async function handleBarcodeScan() {
    const barcode = barcodeInput.value.trim();
    
    if (!barcode) {
        showToast('Please enter a barcode or serial number', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/barcodes/${barcode}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayBarcodeResult(data.data.item);
        } else {
            showToast(data.message || 'Barcode not found', 'error');
            barcodeResult.style.display = 'none';
        }
    } catch (error) {
        console.error('Barcode scan error:', error);
        showToast('An error occurred while scanning the barcode', 'error');
    }
}

function displayBarcodeResult(item) {
    barcodeResult.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>Serial Number:</strong> ${item.serial_no}</p>
        <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
        
        <div class="quantity-update">
            <h4>Update Quantity</h4>
            <div class="form-group">
                <input type="number" id="quantity-update" min="1" value="1">
                <button class="btn btn-primary" id="add-quantity">Add</button>
                <button class="btn btn-primary" id="subtract-quantity">Subtract</button>
            </div>
        </div>
    `;
    
    barcodeResult.style.display = 'block';
    
    // Add event listeners for quantity update buttons
    document.getElementById('add-quantity').addEventListener('click', () => 
        updateItemQuantity(item.serial_no, 'add'));
    
    document.getElementById('subtract-quantity').addEventListener('click', () => 
        updateItemQuantity(item.serial_no, 'subtract'));
}

async function updateItemQuantity(barcode, operation) {
    const quantity = parseInt(document.getElementById('quantity-update').value);
    
    if (isNaN(quantity) || quantity < 1) {
        showToast('Please enter a valid quantity', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/barcodes/${barcode}/quantity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity, operation })
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Quantity ${operation}ed successfully`, 'success');
            // Update the displayed item with new quantity
            handleBarcodeScan();
        } else {
            showToast(data.message || 'Failed to update quantity', 'error');
        }
    } catch (error) {
        console.error('Quantity update error:', error);
        showToast('An error occurred while updating quantity', 'error');
    }
}

// Utility Functions
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);