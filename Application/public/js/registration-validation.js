document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    if (!form) return;

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');

    // Real-time validation as user types
    username.addEventListener('input', validateUsername);
    email.addEventListener('input', validateEmail);
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);
    termsCheckbox.addEventListener('change', validateTerms);

    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });

    function validateForm() {
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();
        const isTermsValid = validateTerms();

        return isUsernameValid && isEmailValid && isPasswordValid && 
               isConfirmValid && isTermsValid;
    }

    function validateUsername() {
        const regex = /^[a-zA-Z][a-zA-Z0-9]{2,}$/;
        const isValid = regex.test(username.value);
        setValidationState(username, isValid, 
            'Username must start with a letter and be 3+ alphanumeric characters');
        return isValid;
    }

    function validateEmail() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = regex.test(email.value);
        setValidationState(email, isValid, 'Please enter a valid email address');
        return isValid;
    }

    function validatePassword() {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[/*+!@#$^&^[\]\\]).{8,}$/;
        const isValid = regex.test(password.value);
        setValidationState(password, isValid, 
            'Password must be 8+ chars with 1 uppercase, 1 number, and 1 special character');
        return isValid;
    }

    function validateConfirmPassword() {
        const isValid = password.value === confirmPassword.value;
        setValidationState(confirmPassword, isValid, 'Passwords do not match');
        return isValid;
    }

    function validateTerms() {
        const isValid = termsCheckbox.checked;
        setValidationState(termsCheckbox, isValid, 'You must accept the Terms of Service');
        return isValid;
    }

    function setValidationState(input, isValid, message) {
        const errorId = input.id + '-error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = isValid ? '' : message;
            if (input.style) {
                input.style.borderColor = isValid ? '' : 'red';
            }
        }
    }
});