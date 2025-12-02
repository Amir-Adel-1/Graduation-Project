// userDashboard.js - Handles user dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuth();
    
    // Set up logout functionality
    setupLogout();
    
    // Add click handler for the user info dropdown
    setupUserMenu();
});

// Check if user is authenticated
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If user is not logged in, redirect to login page
    if (!currentUser) {
        window.location.replace('/Front-End/Main/Home/index.html');
        return;
    }
    
    // Display the user's name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'المستخدم';
    }
}

// Set up the user menu dropdown
function setupUserMenu() {
    const userInfo = document.getElementById('userInfo');
    const userMenu = document.getElementById('userMenu');
    
    if (userInfo && userMenu) {
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userMenu.classList.remove('show');
        });
    }
}

// Set up logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear all authentication-related data from localStorage
            localStorage.removeItem('currentUser');
            
            // Clear any session-related data
            sessionStorage.clear();
            
            // Clear all cookies
            document.cookie.split(';').forEach(function(c) {
                document.cookie = c.trim().split('=')[0] + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
            });
            
            // Force a hard redirect to clear any cached data
            window.location.href = '/Front-End/Main/Home/index.html';
            
            // Prevent going back to the dashboard using browser back button
            window.onpopstate = function() {
                // Clear any remaining data and redirect again
                localStorage.removeItem('currentUser');
                window.history.go(1);
                window.location.replace('/Front-End/Main/Home/index.html');
            };
        });
    }
}

