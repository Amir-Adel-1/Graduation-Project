// userProfile.js - Handles populating and managing the user profile page

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Get the current user email from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Current user from localStorage:', currentUser);
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
        console.log('No user logged in, redirecting to login');
        window.location.href = '/Front-End/Main/Home/index.html';
        return;
    }
    
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('All users from localStorage:', users);
    
    // Find the full user data by email
    const fullUserData = users.find(user => user.email === currentUser.email);
    console.log('Full user data:', fullUserData);
    
    // Use full user data if available, otherwise fall back to currentUser
    const userData = fullUserData || currentUser;

    // Function to set input values safely
    function setInputValue(id, value, isTextarea = false) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
            console.log(`Set ${id} to:`, value || '(empty)');
        } else {
            console.error(`Element with ID ${id} not found`);
        }
    }

    // Function to set text content safely
    function setTextContent(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value || '';
            console.log(`Set ${selector} text to:`, value || '(empty)');
        } else {
            console.error(`Element with selector ${selector} not found`);
        }
    }

    // Populate profile fields
    try {
        console.log('Populating profile fields with user data:', userData);
        console.log('Available fields:', Object.keys(userData));
        
        // Personal Information
        setInputValue('fullName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim());
        
        // Convert gender to Arabic
        const genderMap = {
            'male': 'ذكر',
            'female': 'أنثى',
            'Male': 'ذكر',
            'Female': 'أنثى',
            'M': 'ذكر',
            'F': 'أنثى',
            'm': 'ذكر',
            'f': 'أنثى'
        };
        
        // Set gender in Arabic, fallback to original if not in map
        const arabicGender = genderMap[userData.gender] || userData.gender || '';
        setInputValue('gender', arabicGender);
        
        // Format and set birth date if it exists
        if (userData.birthDate) {
            const birthDate = new Date(userData.birthDate);
            if (!isNaN(birthDate.getTime())) {
                // Format date as YYYY-MM-DD for the date input
                const formattedDate = birthDate.toISOString().split('T')[0];
                setInputValue('birthDate', formattedDate);
            } else {
                // If date is not valid, try to set it directly
                setInputValue('birthDate', userData.birthDate);
            }
        }
        
        // Contact Information
        setInputValue('email', userData.email || '');
        
        // Set password value directly to ensure it's set properly
        const passwordField = document.getElementById('password-field');
        if (passwordField && userData.password) {
            // Store the password in a data attribute instead of value
            passwordField.setAttribute('data-password', userData.password);
            // Set a placeholder or empty value
            passwordField.value = '••••••••';
            console.log('Password field initialized');
        }
        
        setInputValue('phone', userData.phone || '');
        setInputValue('address', userData.address || '');
        
        // Health Information
        setInputValue('weight', userData.weight || '');
        setInputValue('height', userData.height || '');
        setInputValue('bloodType', userData.bloodType || '');
        
        // Health status might be stored as healthStatus or health_status
        const healthStatus = userData.healthStatus || userData.health_status || '';
        setInputValue('healthStatus', healthStatus);
        
        // Medical Information
        setInputValue('chronicInput', userData.chronicDiseases || userData.chronic_diseases || 'لا يوجد', true);
        setInputValue('allergyInput', userData.allergies || 'لا يوجد', true);
        
        // Set username in navbar
        setTextContent('#userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email);
        
        console.log('Finished populating profile fields');
        
    } catch (error) {
        console.error('Error populating profile:', error);
        alert('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
    }

    // Toggle password visibility
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.getElementById('password-field');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');

    if (togglePassword && password && eyeOpen && eyeClosed) {
        // Initially hide the closed eye icon and set password type
        eyeClosed.classList.add('hidden');
        password.type = 'password';
        
        // Store the actual password in a variable
        let isPasswordVisible = false;
        const actualPassword = password.getAttribute('data-password') || '';
        
        // Function to update password visibility
        function updatePasswordVisibility() {
            if (isPasswordVisible) {
                password.type = 'text';
                password.value = actualPassword;
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                password.type = 'password';
                password.value = '••••••••';
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        }
        
        // Initial setup
        updatePasswordVisibility();
        
        // Toggle password visibility on click
        togglePassword.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle the state
            isPasswordVisible = !isPasswordVisible;
            
            // Update the display
            updatePasswordVisibility();
            
            console.log('Password visibility toggled. Showing password:', isPasswordVisible);
        });
        
        console.log('Password toggle initialized successfully');
    } else {
        console.error('Password toggle elements not found:', {
            togglePassword: !!togglePassword,
            password: !!password,
            eyeOpen: !!eyeOpen,
            eyeClosed: !!eyeClosed
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear current user from localStorage
            localStorage.removeItem('currentUser');
            // Redirect to home page
            window.location.href = '/Front-End/Main/Home/index.html';
        });
    } else {
        console.error('Logout button not found');
    }
});
