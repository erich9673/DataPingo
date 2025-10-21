// Enhanced Mobile Detection - Clean URL Approach
(function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  
  if (isMobile || isSmallScreen) {
    // Add mobile class to body instead of redirecting
    document.body.classList.add('mobile-device');
    
    // Load mobile-specific CSS
    const mobileCSS = document.createElement('link');
    mobileCSS.rel = 'stylesheet';
    mobileCSS.href = '/assets/css/mobile.css';
    document.head.appendChild(mobileCSS);
    
    // Optionally load mobile-specific content via AJAX
    loadMobileContent();
  }
  
  function loadMobileContent() {
    // You can load mobile-specific HTML content here if needed
    // This keeps the URL clean while serving mobile content
    console.log('Mobile content loaded');
  }
})();