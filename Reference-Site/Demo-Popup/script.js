// Popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopup = document.getElementById('closePopup');
    const triggerPopup = document.getElementById('triggerPopup');
    
    // Function to open popup
    function openPopup() {
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    // Function to close popup
    function closePopupFunc() {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Event listeners
    if (triggerPopup) {
        triggerPopup.addEventListener('click', openPopup);
    }
    
    if (closePopup) {
        closePopup.addEventListener('click', closePopupFunc);
    }
    
    // Close popup when clicking on overlay (outside the popup)
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closePopupFunc();
            }
        });
    }
    
    // Close popup on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
            closePopupFunc();
        }
    });
    
    // Button click handlers
    const bookDemoBtn = document.querySelector('.btn-primary');
    const callBackBtn = document.querySelector('.btn-secondary');
    
    if (bookDemoBtn) {
        bookDemoBtn.addEventListener('click', function() {
            // Add your booking logic here
            console.log('Book My Demo clicked');
            // Example: window.location.href = '/book-demo';
            // Or: openBookingForm();
        });
    }
    
    if (callBackBtn) {
        callBackBtn.addEventListener('click', function() {
            // Add your callback logic here
            console.log('Call Me Back clicked');
            // Example: window.location.href = '/callback';
            // Or: openCallbackForm();
        });
    }
    
    // Optional: Auto-open popup after page load (uncomment if needed)
    // setTimeout(function() {
    //     openPopup();
    // }, 2000);
});

// Export functions for external use
window.openDemoPopup = function() {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) {
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeDemoPopup = function() {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};





