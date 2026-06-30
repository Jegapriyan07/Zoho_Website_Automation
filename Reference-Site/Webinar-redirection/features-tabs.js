document.addEventListener("DOMContentLoaded", function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const slides = document.querySelectorAll('.slide');
    const prevNav = document.querySelector('.prev-nav');
    const nextNav = document.querySelector('.next-nav');
    
    let currentSlideIndex = 0;
    const slideData = ['low-cost', 'extensibility', 'flexibility', 'security', 'infrastructure', 'ease-of-use'];
    
    // Initialize - show first slide (Low Cost)
    currentSlideIndex = 0; // Low Cost is at index 0
    updateActiveSlide();
    
    // Tab click functionality
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Update current slide index
            currentSlideIndex = index;
            updateActiveSlide();
        });
    });
    
    // Navigation arrows functionality
    prevNav.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
        updateActiveSlide();
        updateActiveTab();
    });
    
    nextNav.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
        updateActiveSlide();
        updateActiveTab();
    });
    
    // Function to update active slide
    function updateActiveSlide() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlideIndex) {
                slide.classList.add('active');
            }
        });
    }
    
    // Function to update active tab
    function updateActiveTab() {
        tabButtons.forEach((btn, index) => {
            btn.classList.remove('active');
            if (index === currentSlideIndex) {
                btn.classList.add('active');
            }
        });
    }
    
    // Auto-play functionality (optional)
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Start auto-play
    startAutoPlay();
    
    // Stop auto-play on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
    
    // Touch/swipe support for mobile
    let startX = 0;
    let startY = 0;
    
    sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    sliderContainer.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swipe left - next slide
                    currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
                } else {
                    // Swipe right - previous slide
                    currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
                }
                updateActiveSlide();
                updateActiveTab();
            }
        }
        
        startX = 0;
        startY = 0;
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        } else if (e.key === 'ArrowRight') {
            currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        }
    });
});
