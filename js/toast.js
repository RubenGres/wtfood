function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show'); // Make visible and start transition
    setTimeout(() => {
        toast.classList.remove('show'); // Start fade out after 3 seconds
    }, 3000);
}
