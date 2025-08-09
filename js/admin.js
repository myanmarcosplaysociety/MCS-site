// MCS Admin Panel JavaScript
// Handles admin authentication and login data display

let loginData = [];
let filteredData = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // Show loading
    document.getElementById('access-check').style.display = 'block';
    
    setTimeout(() => {
        checkAdminAccess();
    }, 1000);
}

function checkAdminAccess() {
    // Hide loading
    document.getElementById('access-check').style.display = 'none';
    
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    
    if (!currentUser || !isAdminUser(currentUser)) {
        document.getElementById('access-denied').style.display = 'block';
        return;
    }
    
    // Show admin panel
    document.getElementById('admin-panel').style.display = 'block';
    
    // Initialize admin interface
    loadAdminData(currentUser);
    loadLoginData();
    loadRegistrationData();
    setupEventListeners();
}

function isAdminUser(user) {
    // Check if user has admin privileges
    // For demo purposes, we'll check against specific emails or admin flag
    const adminEmails = [
        'admin@mcs.org',
        'admin@gmail.com', 
        'kylros2018@gmail.com'
    ];
    
    // Special case: check for specific admin credentials
    if (user.email === 'kylros2018@gmail.com' || user.email === 'kylros2018') {
        return true;
    }
    
    return adminEmails.includes(user.email) || user.isAdmin === true;
}

function loadAdminData(user) {
    // Set admin name
    document.getElementById('admin-name').textContent = user.name || 'Administrator';
    
    // Load statistics
    loadStatistics();
}

function loadStatistics() {
    const users = JSON.parse(localStorage.getItem('mcs_users') || '[]');
    const logins = JSON.parse(localStorage.getItem('mcs_login_data') || '[]');
    const registrations = JSON.parse(localStorage.getItem('mcs_event_registrations') || '[]');
    
    // Calculate statistics
    const totalUsers = users.length;
    const totalLogins = logins.length;
    const totalRegistrations = registrations.length;
    
    // Calculate today's logins
    const today = new Date().toDateString();
    const todayLogins = logins.filter(login => {
        const loginDate = new Date(login.loginTime).toDateString();
        return loginDate === today;
    }).length;
    
    // Update UI
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-logins').textContent = totalLogins;
    document.getElementById('total-registrations').textContent = totalRegistrations;
    document.getElementById('today-logins').textContent = todayLogins;
}

function loadLoginData() {
    loginData = JSON.parse(localStorage.getItem('mcs_login_data') || '[]');
    
    // Sort by most recent first
    loginData.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    
    filteredData = [...loginData];
    displayLoginData();
}

function displayLoginData() {
    const tbody = document.getElementById('login-data-tbody');
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    No login data available
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(login => {
        const row = document.createElement('tr');
        
        // Format login time
        const loginTime = new Date(login.loginTime);
        const timeString = loginTime.toLocaleString();
        
        // Determine method badge class
        const methodClass = login.loginMethod === 'gmail' ? 'method-gmail' : 'method-traditional';
        
        // Truncate user agent for display
        const userAgent = login.userAgent ? 
            (login.userAgent.length > 50 ? login.userAgent.substring(0, 50) + '...' : login.userAgent) :
            'Unknown';
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div>
                        <strong>${escapeHtml(login.name || 'Unknown')}</strong>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(login.email || 'Unknown')}</td>
            <td>
                <span class="method-badge ${methodClass}">
                    ${login.loginMethod === 'gmail' ? '📧 Gmail' : '🔑 Traditional'}
                </span>
            </td>
            <td>${timeString}</td>
            <td title="${escapeHtml(login.userAgent || '')}">${escapeHtml(userAgent)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function setupEventListeners() {
    // Search functionality for login data
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        filterData();
    });
    
    // Method filter for login data
    const methodFilter = document.getElementById('method-filter');
    methodFilter.addEventListener('change', function() {
        filterData();
    });
    
    // Search functionality for registrations
    const regSearchInput = document.getElementById('reg-search-input');
    regSearchInput.addEventListener('input', function() {
        filterRegistrations();
    });
}

function filterRegistrations() {
    const searchTerm = document.getElementById('reg-search-input').value.toLowerCase();
    
    filteredRegistrations = registrationData.filter(reg => {
        return !searchTerm || 
            (reg.eventTitle && reg.eventTitle.toLowerCase().includes(searchTerm)) ||
            (reg.userName && reg.userName.toLowerCase().includes(searchTerm)) ||
            (reg.userEmail && reg.userEmail.toLowerCase().includes(searchTerm)) ||
            (reg.contactNumber && reg.contactNumber.toLowerCase().includes(searchTerm));
    });
    
    displayRegistrationData();
}

function filterData() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const methodFilter = document.getElementById('method-filter').value;
    
    filteredData = loginData.filter(login => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (login.name && login.name.toLowerCase().includes(searchTerm)) ||
            (login.email && login.email.toLowerCase().includes(searchTerm));
        
        // Method filter
        const matchesMethod = !methodFilter || login.loginMethod === methodFilter;
        
        return matchesSearch && matchesMethod;
    });
    
    displayLoginData();
}

function exportData() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Login Method', 'Login Time', 'User Agent'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(login => [
            `"${(login.name || '').replace(/"/g, '""')}"`,
            `"${(login.email || '').replace(/"/g, '""')}"`,
            `"${login.loginMethod || ''}"`,
            `"${login.loginTime || ''}"`,
            `"${(login.userAgent || '').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mcs_login_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Grant admin access function (for demo purposes)
function grantAdminAccess() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        currentUser.isAdmin = true;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also update in stored users if exists
        const users = JSON.parse(localStorage.getItem('mcs_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].isAdmin = true;
            localStorage.setItem('mcs_users', JSON.stringify(users));
        }
        
        location.reload();
    }
}

// Add some demo data if none exists (for testing)
function addDemoData() {
    const existingData = JSON.parse(localStorage.getItem('mcs_login_data') || '[]');
    
    if (existingData.length === 0) {
        const demoData = [
            {
                userId: 'demo1',
                name: 'John Cosplayer',
                email: 'john@example.com',
                loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                loginMethod: 'gmail',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                userId: 'demo2',
                name: 'Sarah Animator',
                email: 'sarah@example.com',
                loginTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                loginMethod: 'traditional',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                userId: 'demo3',
                name: 'Mike Otaku',
                email: 'mike@gmail.com',
                loginTime: new Date().toISOString(),
                loginMethod: 'gmail',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
                timestamp: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('mcs_login_data', JSON.stringify(demoData));
    }
}

// Initialize demo data on page load
document.addEventListener('DOMContentLoaded', function() {
    addDemoData();
    addDemoRegistrations(); // Add demo registration data
});

// Add registration data loading and display functions
let registrationData = [];
let filteredRegistrations = [];

function loadRegistrationData() {
    registrationData = JSON.parse(localStorage.getItem('mcs_event_registrations') || '[]');
    
    // Sort by most recent first
    registrationData.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime));
    
    filteredRegistrations = [...registrationData];
    displayRegistrationData();
}

function displayRegistrationData() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = '';
    
    if (filteredRegistrations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    No event registrations yet
                </td>
            </tr>
        `;
        return;
    }
    
    filteredRegistrations.forEach(registration => {
        const row = document.createElement('tr');
        
        // Format registration time
        const regTime = new Date(registration.registrationTime);
        const timeString = regTime.toLocaleString();
        
        row.innerHTML = `
            <td><strong>${escapeHtml(registration.eventTitle || 'Unknown Event')}</strong></td>
            <td>${escapeHtml(registration.userName || 'Unknown')}</td>
            <td>${escapeHtml(registration.userEmail || 'Unknown')}</td>
            <td>${escapeHtml(registration.contactNumber || 'Not provided')}</td>
            <td>${timeString}</td>
            <td>
                <span class="method-badge method-traditional">
                    ✅ ${registration.status || 'Registered'}
                </span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function exportRegistrations() {
    if (filteredRegistrations.length === 0) {
        alert('No registration data to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Event', 'Name', 'Email', 'Contact Number', 'Registration Time', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredRegistrations.map(reg => [
            `"${(reg.eventTitle || '').replace(/"/g, '""')}"`,
            `"${(reg.userName || '').replace(/"/g, '""')}"`,
            `"${(reg.userEmail || '').replace(/"/g, '""')}"`,
            `"${(reg.contactNumber || '').replace(/"/g, '""')}"`,
            `"${reg.registrationTime || ''}"`,
            `"${reg.status || 'Registered'}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mcs_registrations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Add some demo registration data if none exists (for testing)
function addDemoRegistrations() {
    const existingData = JSON.parse(localStorage.getItem('mcs_event_registrations') || '[]');
    
    if (existingData.length === 0) {
        const demoRegistrations = [
            {
                id: 'reg_demo1',
                eventTitle: 'Yangon Cosplay Mega Fest',
                userName: 'Aung Kyaw',
                userEmail: 'aungkyaw@gmail.com',
                contactNumber: '+95 9 123 456 789',
                registrationTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                status: 'registered'
            },
            {
                id: 'reg_demo2',
                eventTitle: 'Mandalay Cosplay Parade',
                userName: 'Thant Zin',
                userEmail: 'thantzin@yahoo.com',
                contactNumber: '+95 9 987 654 321',
                registrationTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                status: 'registered'
            },
            {
                id: 'reg_demo3',
                eventTitle: 'Anime & Game Expo',
                userName: 'May Phyo',
                userEmail: 'mayphyo@hotmail.com',
                contactNumber: '+95 9 555 666 777',
                registrationTime: new Date().toISOString(),
                status: 'registered'
            }
        ];
        
        localStorage.setItem('mcs_event_registrations', JSON.stringify(demoRegistrations));
    }
}
