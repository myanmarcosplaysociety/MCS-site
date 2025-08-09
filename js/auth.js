// MCS Authentication System
// Handles Gmail OAuth and traditional login/signup

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with actual client ID
let currentUser = null;

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadUserData();
});

// Switch between login and signup tabs
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.querySelector('[onclick="switchTab(\'login\')"]');
    const signupTab = document.querySelector('[onclick="switchTab(\'signup\')"]');
    const switchText = document.getElementById('auth-switch-text');

    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        switchText.innerHTML = 'Not a member? <a href="#" onclick="switchTab(\'signup\'); return false;">Register here</a>';
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="switchTab(\'login\'); return false;">Login here</a>';
    }
}

// Handle Google OAuth response
function handleCredentialResponse(response) {
    try {
        // Decode the JWT token
        const payload = parseJwt(response.credential);
        
        const userData = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            loginTime: new Date().toISOString(),
            loginMethod: 'gmail'
        };

        // Store user session
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Store login data for admin (persistent)
        storeLoginData(userData);
        
        // Redirect or update UI
        showSuccessMessage('Successfully logged in with Gmail!');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error handling Google login:', error);
        showErrorMessage('Login failed. Please try again.');
    }
}

// Handle Google signup
function handleGoogleSignup() {
    // Initialize Google Sign-In for signup
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: function(response) {
            try {
                const payload = parseJwt(response.credential);
                
                // Check if user already exists
                const existingUsers = JSON.parse(localStorage.getItem('mcs_users') || '[]');
                const existingUser = existingUsers.find(user => user.email === payload.email);
                
                if (existingUser) {
                    showErrorMessage('Account already exists. Please login instead.');
                    switchTab('login');
                    return;
                }
                
                const userData = {
                    id: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    signupTime: new Date().toISOString(),
                    loginTime: new Date().toISOString(),
                    loginMethod: 'gmail'
                };

                // Store user data
                existingUsers.push(userData);
                localStorage.setItem('mcs_users', JSON.stringify(existingUsers));
                
                // Store session
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Store login data for admin
                storeLoginData(userData);
                
                showSuccessMessage('Account created successfully with Gmail!');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
                
            } catch (error) {
                console.error('Error handling Google signup:', error);
                showErrorMessage('Signup failed. Please try again.');
            }
        }
    });
    
    google.accounts.id.prompt();
}

// Handle traditional login
function handleTraditionalLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // Check for specific admin credentials first
    if ((username === 'kylros2018' || username === 'kylros2018@gmail.com') && password === 'ZxcV4321') {
        const adminUserData = {
            id: 'admin_kylros2018',
            name: 'Admin - Cardinals',
            email: 'kylros2018@gmail.com',
            username: 'kylros2018',
            loginTime: new Date().toISOString(),
            loginMethod: 'traditional',
            isAdmin: true
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(adminUserData));
        storeLoginData(adminUserData);
        
        showSuccessMessage('Admin login successful!');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
        return;
    }
    
    // In a real app, this would verify against a database
    // For demo purposes, we'll check against stored users
    const users = JSON.parse(localStorage.getItem('mcs_users') || '[]');
    const user = users.find(u => 
        (u.email === username || u.username === username) && u.password === password
    );
    
    if (user) {
        const userData = {
            ...user,
            loginTime: new Date().toISOString(),
            loginMethod: 'traditional'
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        storeLoginData(userData);
        
        showSuccessMessage('Login successful!');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    } else {
        showErrorMessage('Invalid username or password.');
    }
}

// Handle traditional signup
function handleTraditionalSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[placeholder="Email Address"]').value;
    const password = form.querySelector('input[placeholder="Create Password"]').value;
    const confirmPassword = form.querySelector('input[placeholder="Confirm Password"]').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showErrorMessage('Passwords do not match.');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('mcs_users') || '[]');
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        showErrorMessage('Account with this email already exists.');
        return;
    }
    
    const userData = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password, // In real app, this should be hashed
        signupTime: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        loginMethod: 'traditional'
    };
    
    // Store user
    users.push(userData);
    localStorage.setItem('mcs_users', JSON.stringify(users));
    
    // Create session
    const sessionData = { ...userData };
    delete sessionData.password; // Don't store password in session
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    
    // Store login data for admin
    storeLoginData(sessionData);
    
    showSuccessMessage('Account created successfully!');
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 2000);
}

// Store login data for admin viewing
function storeLoginData(userData) {
    const loginData = JSON.parse(localStorage.getItem('mcs_login_data') || '[]');
    
    const logEntry = {
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        loginTime: userData.loginTime,
        loginMethod: userData.loginMethod,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
    
    loginData.push(logEntry);
    
    // Keep only last 100 login records
    if (loginData.length > 100) {
        loginData.splice(0, loginData.length - 100);
    }
    
    localStorage.setItem('mcs_login_data', JSON.stringify(loginData));
}

// Check authentication status
function checkAuthStatus() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
    }
}

// Load user data if available
function loadUserData() {
    if (currentUser && window.location.pathname.includes('profile.html')) {
        // Already handled by profile page script
        return;
    }
}

// Utility function to parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show message utility
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        ${type === 'success' ? 'background: #10B981;' : 'background: #EF4444;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    showSuccessMessage('Logged out successfully!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Check if user is admin (simple check - in real app this would be more secure)
function isAdmin() {
    return currentUser && (
        currentUser.email === 'admin@mcs.org' || 
        currentUser.email === 'admin@gmail.com' ||
        currentUser.isAdmin === true
    );
}