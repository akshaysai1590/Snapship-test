function showMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '🚀 Successfully deployed with Snapship!';
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
}
