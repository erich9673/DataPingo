// Bulk Report Generator Documentation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for anchor links
    initSmoothScrolling();
    
    // FAQ accordion functionality
    initFAQAccordion();
    
    // Scroll progress indicator
    initScrollProgress();
    
    // Navigation highlighting
    initNavigationHighlighting();
    
    // Copy code functionality
    initCodeCopyButtons();
    
    // Mobile menu (if needed in future)
    initMobileMenu();
    
    // Analytics tracking
    initAnalytics();
    
    // Performance optimizations
    initPerformanceOptimizations();
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, `#${targetId}`);
                
                // Track scroll to section
                trackEvent('Navigation', 'Scroll to Section', targetId);
            }
        });
    });
}

/**
 * Initialize FAQ accordion functionality
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Track FAQ interaction
            if (!isActive) {
                trackEvent('FAQ', 'Question Opened', question.textContent.trim());
            }
        });
    });
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = (scrollTop / documentHeight) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

/**
 * Initialize navigation highlighting based on scroll position
 */
function initNavigationHighlighting() {
    const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    const sections = document.querySelectorAll('.section[id]');
    
    if (sections.length === 0 || tocLinks.length === 0) return;
    
    function updateActiveNavigation() {
        const scrollPosition = window.pageYOffset + 100; // Offset for header
        
        let activeSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section.id;
            }
        });
        
        // Update TOC links
        tocLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === activeSection);
        });
    }
    
    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveNavigation();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial call
    updateActiveNavigation();
}

/**
 * Initialize copy code functionality
 */
function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentNode;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            Copy
        `;
        copyButton.title = 'Copy code to clipboard';
        
        // Style the pre element to be relative for absolute positioning of button
        pre.style.position = 'relative';
        
        // Style the copy button
        Object.assign(copyButton.style, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'background-color 0.2s ease'
        });
        
        // Add hover effect
        copyButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Copy functionality
        copyButton.addEventListener('click', async function() {
            const code = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(code);
                
                // Visual feedback
                this.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    Copied!
                `;
                
                setTimeout(() => {
                    this.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                        Copy
                    `;
                }, 2000);
                
                // Track copy action
                trackEvent('Code', 'Copy', 'Code Block');
                
            } catch (err) {
                console.error('Failed to copy code:', err);
                
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Visual feedback
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy';
                }, 2000);
            }
        });
        
        pre.appendChild(copyButton);
    });
}

/**
 * Initialize mobile menu (placeholder for future enhancement)
 */
function initMobileMenu() {
    // Mobile menu functionality can be added here if needed
    // Currently the design is simple enough for mobile without a hamburger menu
}

/**
 * Initialize analytics tracking
 */
function initAnalytics() {
    // Track page view
    trackEvent('Documentation', 'Page View', 'Bulk Report Generator');
    
    // Track external link clicks
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const url = this.href;
            trackEvent('External Link', 'Click', url);
        });
    });
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.textContent.trim();
            trackEvent('CTA', 'Click', text);
        });
    });
    
    // Track time spent on page
    let startTime = Date.now();
    let maxScroll = 0;
    
    window.addEventListener('scroll', function() {
        const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        maxScroll = Math.max(maxScroll, scrollPercent);
    });
    
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEvent('Engagement', 'Time on Page', timeSpent);
        trackEvent('Engagement', 'Max Scroll', Math.round(maxScroll));
    });
}

/**
 * Track events (works with Google Analytics if available)
 */
function trackEvent(category, action, label, value) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Google Tag Manager
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            event: 'custom_event',
            event_category: category,
            event_action: action,
            event_label: label,
            event_value: value
        });
    }
    
    // Console log for debugging
    console.log('Analytics Event:', { category, action, label, value });
}

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Lazy load images (if any are added in the future)
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window && images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Preload critical resources
    const criticalLinks = [
        '../../assets/img/big logo.png',
        '../../assets/img/DataPingo logo_LOGO A3.png'
    ];
    
    criticalLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'image';
        document.head.appendChild(link);
    });
    
    // Service Worker registration (if service-worker.js exists)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed');
                });
        });
    }
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * Utility function to throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Initialize keyboard navigation
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Press 'f' to focus search (if implemented)
        if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
        
        // Press 'Escape' to close any open modals/dropdowns
        if (e.key === 'Escape') {
            // Close FAQ items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
        
        // Arrow keys for FAQ navigation
        if (e.target.classList.contains('faq-question')) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextQuestion = e.target.closest('.faq-item').nextElementSibling?.querySelector('.faq-question');
                if (nextQuestion) nextQuestion.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevQuestion = e.target.closest('.faq-item').previousElementSibling?.querySelector('.faq-question');
                if (prevQuestion) prevQuestion.focus();
            }
        }
    });
}

// Initialize keyboard navigation
document.addEventListener('DOMContentLoaded', initKeyboardNavigation);

/**
 * Initialize search functionality (placeholder for future enhancement)
 */
function initSearch() {
    // Search functionality can be implemented here
    // Could include fuzzy search through all content
    // Or integration with a search service
}

/**
 * Initialize theme toggle (if dark mode is added in future)
 */
function initThemeToggle() {
    // Theme switching functionality can be added here
    // For now, we use the light theme that matches DataPingo branding
}

// Export functions for potential external use
window.BulkReportDocs = {
    trackEvent,
    debounce,
    throttle
};
