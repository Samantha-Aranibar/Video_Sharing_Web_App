document.addEventListener('DOMContentLoaded', function() {
  // Handle comment submission
  document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const postId = this.closest('.post').dataset.postId;
      const commentText = this.querySelector('textarea').value;
      const commentsList = this.nextElementSibling; // Assuming .comments-list is next sibling
      
      try {
        const response = await fetch('/comments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId, commentText }),
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Clear the textarea
          this.querySelector('textarea').value = '';
          
          // Add the new comment to the list
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comment';
          commentDiv.dataset.commentId = result.comment.comment_id;
          commentDiv.innerHTML = `
            <strong>${result.comment.username}</strong>
            <p>${result.comment.text}</p>
            <small>Just now</small>
            <button class="delete-comment">Delete</button>
          `;
          commentsList.prepend(commentDiv);
          
          // Add event listener to the new delete button
          commentDiv.querySelector('.delete-comment').addEventListener('click', deleteCommentHandler);
          
          showFlashMessage(result.message, 'success');
        }
      } catch (error) {
        console.error('Error:', error);
        showFlashMessage('Failed to post comment', 'error');
      }
    });
  });
  
  // Handle comment deletion
  document.querySelectorAll('.delete-comment').forEach(button => {
    button.addEventListener('click', deleteCommentHandler);
  });
});

async function deleteCommentHandler() {
  const commentDiv = this.closest('.comment');
  const commentId = commentDiv.dataset.commentId;
  
  try {
    const response = await fetch(`/comments/delete/${commentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      commentDiv.remove();
      showFlashMessage(result.message, 'success');
    }
  } catch (error) {
    console.error('Error:', error);
    showFlashMessage('Failed to delete comment', 'error');
  }
}