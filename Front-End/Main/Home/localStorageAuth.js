// localStorageAuth.js - Temporary authentication using localStorage
// This is a temporary solution for demonstration purposes only

document.addEventListener('DOMContentLoaded', function() {
    // Initialize users and pharmacies arrays in localStorage if they don't exist
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('pharmacies')) {
        localStorage.setItem('pharmacies', JSON.stringify([]));
    }

    // User Signup Form
    const userSignupForm = document.querySelector('.form-signup');
    if (userSignupForm) {
        userSignupForm.addEventListener('submit', handleUserSignup);
    }

    // Pharmacy Signup Form
    const pharmacySignupForm = document.querySelector('.form-pharmacist');
    if (pharmacySignupForm) {
        console.log('Found pharmacy form');
        pharmacySignupForm.addEventListener('submit', handlePharmacySignup);
    } else {
        console.log('Pharmacy form not found');
    }

    // Login Form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Check if email exists in either users or pharmacies
function isEmailExists(email) {
    if (!email) return false;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pharmacies = JSON.parse(localStorage.getItem('pharmacies') || '[]');
    
    return users.some(user => user.email === email) || 
           pharmacies.some(pharmacy => pharmacy.email === email);
}

// Handle User Signup
function handleUserSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('Email');
    
    // Check if email already exists in either users or pharmacies
    if (isEmailExists(email)) {
        alert('هذا البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد إلكتروني آخر.');
        return;
    }
    
    const userData = {
        // Basic Info
        id: Date.now().toString(),
        type: 'user',
        // Personal Information
        firstName: formData.get('F_Name') || '',
        lastName: formData.get('L_Name') || '',
        gender: formData.get('gender') || document.querySelector('.form-signup select')?.value || '',
        birthDate: formData.get('birthDate') || '',
        
        // Contact Info
        email: email,
        phone: formData.get('Phone') || '',
        address: formData.get('Address') || '',
        
        // Account Security
        password: formData.get('Password'),
        
        // Health Information
        height: formData.get('Height') || '',
        weight: formData.get('weight') || '',  // Changed from 'Weight' to 'weight' to match input name
        bloodType: formData.get('blood_type') || '',
        healthStatus: formData.get('health_status') || '',
        chronicDiseases: formData.get('chronic_diseases') || '',
        allergies: formData.get('allergies') || '',
        
        // System Fields
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
    };

    // Get existing users and add new user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
    // Close the signup modal and open login
    document.querySelector('.close-popup-signup')?.click();
    document.querySelector('.open-login')?.click();
    
    // Reset form
    e.target.reset();
}

// Handle Pharmacy Signup
function handlePharmacySignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('Email');
    
    // Check if email already exists in either users or pharmacies
    if (isEmailExists(email)) {
        alert('هذا البريد الإلكتروني مسجل بالفعل. الرجاء استخدام بريد إلكتروني آخر.');
        return false;
    }
    
    const pharmacyData = {
        id: Date.now().toString(),
        type: 'pharmacy',
        pharmacyName: formData.get('PharmacyName') || formData.get('FullName'),
        ownerName: formData.get('FullName'),
        email: email,
        password: formData.get('Password'),
        phone: formData.get('Phone'),
        address: formData.get('Address') || '',
        licenseNumber: formData.get('License') || '',
        createdAt: new Date().toISOString()
    };

    // Get existing pharmacies and add new pharmacy
    const pharmacies = JSON.parse(localStorage.getItem('pharmacies') || '[]');
    pharmacies.push(pharmacyData);
    localStorage.setItem('pharmacies', JSON.stringify(pharmacies));
    
    alert('تم إنشاء حساب الصيدلية بنجاح! يمكنك الآن تسجيل الدخول.');
    // Close the pharmacy signup modal and open login
    document.querySelector('.close-pharmacy-signup')?.click();
    document.querySelector('.open-login')?.click();
    
    // Reset form
    e.target.reset();
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[name="Email"]')?.value;
    const password = e.target.querySelector('input[name="Password"]')?.value;
    
    if (!email || !password) {
        alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }
    
    // Check in users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    // If not found in users, check in pharmacies
    if (!user) {
        const pharmacies = JSON.parse(localStorage.getItem('pharmacies') || '[]');
        const pharmacy = pharmacies.find(p => p.email === email && p.password === password);
        
        if (pharmacy) {
            // Login successful - Pharmacy
            localStorage.setItem('currentUser', JSON.stringify({
                id: pharmacy.id,
                type: 'pharmacy',
                name: pharmacy.pharmacyName,
                email: pharmacy.email
            }));
            
            alert(`مرحباً ${pharmacy.pharmacyName || 'بالصيدلي'}!`);
            window.location.href = '/Front-End/Pharmacy/Home/Pharmacy.html';
            return;
        }
    } else {
        // Login successful - User
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            type: 'user',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'المستخدم',
            email: user.email
        }));
        
        alert(`مرحباً ${user.firstName || 'عزيزي المستخدم'}!`);
        window.location.href = '/Front-End/User/Home/User.html';
        return;
    }
    
    // If we get here, login failed
    alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Helper function to get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Helper function to logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Add logout functionality to all logout buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('logout-btn')) {
        e.preventDefault();
        logout();
    }
});
