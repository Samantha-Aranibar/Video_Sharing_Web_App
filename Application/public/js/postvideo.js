console.log('JS file loaded!');

document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('upload-form');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const videoInput = document.getElementById('video');
    const aupCheckbox = document.getElementById('aup');

    form.addEventListener('submit', function(e) {
        let isValid = true;
        const errors = [];

        // Validate Title 
        if (titleInput.value.trim().length < 5) {
            errors.push('Title must be at least 5 characters');
            titleInput.classList.add('error');
            isValid = false;
        } else {
            titleInput.classList.remove('error');
        }

        // Validate Description 
        if (descriptionInput.value.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
            descriptionInput.classList.add('error');
            isValid = false;
        } else {
            descriptionInput.classList.remove('error');
        }

        // Validate Video File is selected
        if (!videoInput.files || videoInput.files.length === 0) {
            errors.push('Please select a video file');
            videoInput.classList.add('error');
            isValid = false;
        } else {
            videoInput.classList.remove('error');
        }

        // Validate AUP checkbox
        if (!aupCheckbox.checked) {
            errors.push('You must accept the Acceptable Use Policy');
            aupCheckbox.classList.add('error');
            isValid = false;
        } else {
            aupCheckbox.classList.remove('error');
        }

        // Prevent submission if validation fails
        if (!isValid) {
            e.preventDefault(); // Error handling
            
            alert('Please fix these errors:\n\n' + errors.join('\n'));
        } else {
            console.log('Form is valid, submitting...');
        }
    });

    titleInput.addEventListener('input', function() {
        if (this.value.trim().length >= 5) {
            this.classList.remove('error');
        }
    });

    descriptionInput.addEventListener('input', function() {
        if (this.value.trim().length >= 10) {
            this.classList.remove('error');
        }
    });

    videoInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            this.classList.remove('error');
        }
    });

    aupCheckbox.addEventListener('change', function() {
        if (this.checked) {
            this.classList.remove('error');
        }
    });
});