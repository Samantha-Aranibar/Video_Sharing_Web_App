document.addEventListener('DOMContentLoaded', function() {
  // Handle like button clicks
  document.querySelectorAll('.like-btn').forEach(button => {
    button.addEventListener('click', async function() {
      const postId = this.dataset.postId;
      const likeCountEl = this.querySelector('.like-count');
      const icon = this.querySelector('i'); //ADDED

      try {
        const response = await fetch('/likes/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/js',
          },
          body: JSON.stringify({ postId }),
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update like count
          likeCountEl.textContent = result.likes;
          
          // Toggle heart icon (solid for liked, regular for unliked)
          if (result.action === 'liked') {
            icon.classList.replace('far', 'fas');
          } else {
            icon.classList.replace('fas', 'far');
          }
          
          // Show flash message (if you have a flash message display area)
          showFlashMessage(result.message, 'success');
        }
      } catch (error) {
        console.error('Error:', error);
        showFlashMessage('Failed to process like', 'error');
      }
    });
  });
});

function showFlashMessage(message, type) {
  // Implement this based on how you display flash messages
  // Example: Using a div with id "flash-messages"
  const flashDiv = document.getElementById('flash-messages');
  if (flashDiv) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    flashDiv.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => alert.remove(), 3000);
  }
}