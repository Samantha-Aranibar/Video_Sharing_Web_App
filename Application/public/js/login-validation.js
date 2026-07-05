document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    // Real-time validation
    username.addEventListener('input', validateUsername);
    password.addEventListener('input', validatePassword);

    // Form submission handler
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });

    function validateForm() {
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        
        return isUsernameValid && isPasswordValid;
    }

    function validateUsername() {
        const minLength = 3;
        const startsWithLetter = /^[a-zA-Z]/;
        const isAlphanumeric = /^[a-zA-Z0-9]+$/;
        
        let isValid = true;
        let errorMessage = '';
        
        if (username.value.length < minLength) {
            errorMessage = `Username must be at least ${minLength} characters`;
            isValid = false;
        } else if (!startsWithLetter.test(username.value)) {
            errorMessage = 'Username must start with a letter';
            isValid = false;
        } else if (!isAlphanumeric.test(username.value)) {
            errorMessage = 'Username can only contain letters and numbers';
            isValid = false;
        }
        
        setValidationState(username, isValid, errorMessage);
        return isValid;
    }

    function validatePassword() {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/;
        const hasNumber = /[0-9]/;
        const hasSpecialChar = /[/*+!@#$^&^[\]\\]/;
        
        let isValid = true;
        let errorMessage = '';
        
        if (password.value.length < minLength) {
            errorMessage = `Password must be at least ${minLength} characters`;
            isValid = false;
        } else if (!hasUpperCase.test(password.value)) {
            errorMessage = 'Missing at least one uppercase letter';
            isValid = false;
        } else if (!hasNumber.test(password.value)) {
            errorMessage = 'Missing at least one number';
            isValid = false;
        } else if (!hasSpecialChar.test(password.value)) {
            errorMessage = 'Missing at least one special character (/*+!@#$^&^[]\\)';
            isValid = false;
        }
        
        setValidationState(password, isValid, errorMessage);
        return isValid;
    }

    function setValidationState(input, isValid, message) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = isValid ? '' : message;
            input.style.borderColor = isValid ? '' : 'red';
        }
    }
});