// pharmacyDashboard.js - Handles pharmacy dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuth();
    
    // Set up logout functionality
    setupLogout();
    
    // Add click handler for the user info dropdown
    setupUserMenu();
});

// Check if pharmacy is authenticated
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If not logged in or not a pharmacy, redirect to login page
    if (!currentUser || currentUser.type !== 'pharmacy') {
        window.location.replace('/Front-End/Main/Home/index.html');
        return;
    }
    
    // Display the pharmacy's name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name || 'الصيدلية';
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
    const logoutBtn = document.getElementById('exit');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Debug: Log current localStorage before clearing
            console.log('Before logout - currentUser:', localStorage.getItem('currentUser'));
            
            // Clear all authentication-related data from localStorage
            localStorage.removeItem('currentUser');
            
            // Force synchronous storage update
            localStorage.setItem('logout', Date.now().toString());
            localStorage.removeItem('logout');
            
            // Clear any session-related data
            sessionStorage.clear();
            
            // Clear all cookies
            document.cookie.split(';').forEach(function(c) {
                document.cookie = c.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            });
            
            // Debug: Log after clearing
            console.log('After logout - currentUser:', localStorage.getItem('currentUser'));
            
            // Force a hard redirect with cache busting
            const timestamp = new Date().getTime();
            window.location.href = `/Front-End/Main/Home/index.html?t=${timestamp}`;
        });
        
        // Add a check for the back button
        window.addEventListener('popstate', function() {
            if (localStorage.getItem('currentUser')) {
                localStorage.removeItem('currentUser');
                window.location.replace('/Front-End/Main/Home/index.html');
            }
        });
    }
}
