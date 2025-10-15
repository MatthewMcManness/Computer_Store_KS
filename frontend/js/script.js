/**
 * ================================================
 * COMPUTER STORE KANSAS - MAIN JAVASCRIPT FILE
 * ================================================
 * VERSION: 31
 * LAST UPDATED: 2025-10-15
 * CHANGES: - Modernized testimonials carousel with smooth animations
 *          - Added auto-play functionality for carousel
 *          - Enhanced mobile touch support
 *          - Improved modal interactions
 * DESCRIPTION: Handles all interactive functionality for the website
 * DEPENDENCIES: None (vanilla JavaScript)
 * 
 * Table of Contents:
 * 1. Page Navigation System
 * 2. Mobile Hamburger Menu
 * 3. Testimonials Carousel
 * 4. Modal System (Login & Contact)
 * 5. Contact Form Submission
 * 6. Utility Functions
 * 7. Initialization
 * ================================================
 */

// ================================================
// 1. PAGE NAVIGATION SYSTEM
// Handles single-page app navigation between sections
// ================================================

/**
 * Navigate to a specific page section
 * @param {string} pageId - The ID of the page to navigate to (e.g., 'home', 'about')
 */
function navigateToPage(pageId) {
  // Hide all page sections
  const allPages = document.querySelectorAll('.page-section');
  allPages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the target page section
  const targetPage = document.getElementById(pageId + '-page');
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update navigation link active states
  const allNavLinks = document.querySelectorAll('.nav-link');
  allNavLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the clicked navigation link
  const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Scroll to top of page for better UX
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Close mobile menu if open
  closeMobileMenu();
}

/**
 * Initialize page navigation listeners
 * Sets up click handlers for all navigation links
 */
function initializeNavigation() {
  // Get all navigation links with data-page attribute
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  
  // Add click event listener to each navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default link behavior
      const pageId = this.getAttribute('data-page');
      navigateToPage(pageId);
    });
  });
  
  // Handle back-to-home link in login modal
  const backToHomeLink = document.getElementById('back-to-home');
  if (backToHomeLink) {
    backToHomeLink.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage('home');
      closeLoginModal();
    });
  }
}

// ================================================
// 2. MOBILE HAMBURGER MENU
// Handles mobile navigation menu toggle
// ================================================

/**
 * Toggle mobile navigation menu open/closed
 */
function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger-button');
  const nav = document.querySelector('header nav ul');
  
  if (!hamburger || !nav) return;
  
  // Toggle active class on hamburger icon
  hamburger.classList.toggle('active');
  
  // Toggle show class on navigation menu
  nav.classList.toggle('show');
  
  // Update aria-expanded attribute for accessibility
  const isExpanded = nav.classList.contains('show');
  hamburger.setAttribute('aria-expanded', isExpanded);
  
  // Update aria-label for accessibility
  hamburger.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
}

/**
 * Close mobile navigation menu
 */
function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger-button');
  const nav = document.querySelector('header nav ul');
  
  if (!hamburger || !nav) return;
  
  // Remove active and show classes
  hamburger.classList.remove('active');
  nav.classList.remove('show');
  
  // Update accessibility attributes
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
}

/**
 * Initialize hamburger menu listeners
 */
function initializeHamburgerMenu() {
  const hamburger = document.getElementById('hamburger-button');
  
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    const nav = document.querySelector('header nav ul');
    const hamburger = document.getElementById('hamburger-button');
    
    if (nav && hamburger && 
        nav.classList.contains('show') && 
        !nav.contains(e.target) && 
        !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

// ================================================
// 3. TESTIMONIALS CAROUSEL
// Modern carousel with auto-play and touch support
// ================================================

// Carousel state management
let currentTestimonialIndex = 0;
let testimonialAutoplayInterval = null;
let isTestimonialAnimating = false;

/**
 * Move carousel to a specific testimonial
 * @param {number} index - The index of the testimonial to show
 */
function showTestimonial(index) {
  // Prevent multiple animations at once
  if (isTestimonialAnimating) return;
  
  const track = document.querySelector('.testimonials-track');
  const testimonials = document.querySelectorAll('.testimonial');
  const indicators = document.querySelectorAll('.carousel-indicator');
  
  if (!track || testimonials.length === 0) return;
  
  // Wrap around if index is out of bounds
  if (index < 0) {
    index = testimonials.length - 1;
  } else if (index >= testimonials.length) {
    index = 0;
  }
  
  // Set animating flag
  isTestimonialAnimating = true;
  
  // Update current index
  currentTestimonialIndex = index;
  
  // Calculate the transform offset
  const offset = -index * 100;
  track.style.transform = `translateX(${offset}%)`;
  
  // Update indicator active states
  indicators.forEach((indicator, i) => {
    if (i === index) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
  
  // Reset animating flag after animation completes
  setTimeout(() => {
    isTestimonialAnimating = false;
  }, 600); // Match CSS transition duration
}

/**
 * Move to the next testimonial
 */
function nextTestimonial() {
  showTestimonial(currentTestimonialIndex + 1);
  resetTestimonialAutoplay(); // Reset autoplay timer when manually navigating
}

/**
 * Move to the previous testimonial
 */
function previousTestimonial() {
  showTestimonial(currentTestimonialIndex - 1);
  resetTestimonialAutoplay(); // Reset autoplay timer when manually navigating
}

/**
 * Start automatic carousel rotation
 */
function startTestimonialAutoplay() {
  // Clear any existing interval
  if (testimonialAutoplayInterval) {
    clearInterval(testimonialAutoplayInterval);
  }
  
  // Set up new interval (change slide every 5 seconds)
  testimonialAutoplayInterval = setInterval(() => {
    nextTestimonial();
  }, 5000);
}

/**
 * Stop automatic carousel rotation
 */
function stopTestimonialAutoplay() {
  if (testimonialAutoplayInterval) {
    clearInterval(testimonialAutoplayInterval);
    testimonialAutoplayInterval = null;
  }
}

/**
 * Reset autoplay timer (restart from beginning)
 */
function resetTestimonialAutoplay() {
  stopTestimonialAutoplay();
  startTestimonialAutoplay();
}

/**
 * Initialize testimonials carousel
 */
function initializeTestimonialsCarousel() {
  // Get carousel elements
  const prevButton = document.querySelector('.carousel-arrow.prev');
  const nextButton = document.querySelector('.carousel-arrow.next');
  const indicators = document.querySelectorAll('.carousel-indicator');
  const carousel = document.querySelector('.testimonials-carousel');
  
  // Add click listeners to navigation arrows
  if (prevButton) {
    prevButton.addEventListener('click', previousTestimonial);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', nextTestimonial);
  }
  
  // Add click listeners to indicators (dots)
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showTestimonial(index);
      resetTestimonialAutoplay();
    });
  });
  
  // Add keyboard navigation support
  document.addEventListener('keydown', (e) => {
    // Only handle keyboard navigation if carousel is visible
    if (!carousel || !isElementInViewport(carousel)) return;
    
    if (e.key === 'ArrowLeft') {
      previousTestimonial();
    } else if (e.key === 'ArrowRight') {
      nextTestimonial();
    }
  });
  
  // Add touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
  /**
   * Handle swipe gesture
   */
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    const difference = touchStartX - touchEndX;
    
    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // Swiped left - show next
        nextTestimonial();
      } else {
        // Swiped right - show previous
        previousTestimonial();
      }
    }
  }
  
  // Pause autoplay when user hovers over carousel (desktop)
  if (carousel) {
    carousel.addEventListener('mouseenter', stopTestimonialAutoplay);
    carousel.addEventListener('mouseleave', startTestimonialAutoplay);
  }
  
  // Start autoplay
  startTestimonialAutoplay();
  
  // Show first testimonial
  showTestimonial(0);
}

// ================================================
// 4. MODAL SYSTEM (LOGIN & CONTACT)
// Handles opening and closing of modal dialogs
// ================================================

/**
 * Open the login modal
 */
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('active');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close the login modal
 */
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

/**
 * Open the contact modal
 */
function openContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.classList.add('active');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    // Focus on first input field for better UX
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

/**
 * Close the contact modal
 */
function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.classList.remove('active');
    // Restore body scroll
    document.body.style.overflow = '';
    // Clear form status message
    const formStatus = document.getElementById('formStatus');
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.style.color = '';
    }
  }
}

/**
 * Initialize modal system
 */
function initializeModals() {
  // Login modal triggers
  const loginBtn = document.getElementById('login-btn');
  const loginModalClose = document.getElementById('modal-close');
  const loginModal = document.getElementById('login-modal');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }
  
  if (loginModalClose) {
    loginModalClose.addEventListener('click', closeLoginModal);
  }
  
  // Close login modal when clicking outside content
  if (loginModal) {
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }
  
  // Contact modal triggers
  const contactModalBtns = document.querySelectorAll('.contact-modal-btn');
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactModal = document.getElementById('contact-modal');
  
  contactModalBtns.forEach(btn => {
    btn.addEventListener('click', openContactModal);
  });
  
  if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
  }
  
  // Close contact modal when clicking outside content
  if (contactModal) {
    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) {
        closeContactModal();
      }
    });
  }
  
  // Close modals with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLoginModal();
      closeContactModal();
    }
  });
}

// ================================================
// 5. CONTACT FORM SUBMISSION
// Handles contact form submission and validation
// ================================================

/**
 * Handle contact form submission
 * @param {Event} e - The form submit event
 */
function handleContactFormSubmit(e) {
  e.preventDefault(); // Prevent default form submission
  
  // Get form elements
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const formStatus = document.getElementById('formStatus');
  
  // Get form data
  const formData = {
    name: document.getElementById('modal-name').value,
    email: document.getElementById('modal-email').value,
    message: document.getElementById('modal-message').value
  };
  
  // Basic validation
  if (!formData.name || !formData.email || !formData.message) {
    showFormStatus('Please fill in all fields', 'error');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showFormStatus('Please enter a valid email address', 'error');
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  
  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    // Success case
    showFormStatus('Message sent successfully! We\'ll get back to you soon.', 'success');
    
    // Reset form
    form.reset();
    
    // Reset button state
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    
    // Close modal after 2 seconds
    setTimeout(() => {
      closeContactModal();
    }, 2000);
    
    // In a real implementation, you would send the data to your backend:
    /*
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      showFormStatus('Message sent successfully!', 'success');
      form.reset();
      setTimeout(() => closeContactModal(), 2000);
    })
    .catch(error => {
      showFormStatus('Error sending message. Please try again.', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    });
    */
  }, 1500);
}

/**
 * Show form status message
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 */
function showFormStatus(message, type) {
  const formStatus = document.getElementById('formStatus');
  if (!formStatus) return;
  
  formStatus.textContent = message;
  
  if (type === 'success') {
    formStatus.style.color = '#10b981'; // Green color
    formStatus.style.backgroundColor = '#d1fae5'; // Light green background
  } else if (type === 'error') {
    formStatus.style.color = '#ef4444'; // Red color
    formStatus.style.backgroundColor = '#fee2e2'; // Light red background
  }
  
  formStatus.style.padding = '0.75rem';
  formStatus.style.borderRadius = '6px';
  formStatus.style.marginTop = '1rem';
}

/**
 * Initialize contact form
 */
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

// ================================================
// 6. UTILITY FUNCTIONS
// Helper functions used throughout the application
// ================================================

/**
 * Check if an element is in the viewport
 * @param {Element} element - The element to check
 * @returns {boolean} - True if element is in viewport
 */
function isElementInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The wait time in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Smooth scroll to an element
 * @param {string} selector - CSS selector for the target element
 */
function smoothScrollTo(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// ================================================
// 7. INITIALIZATION
// Initialize all components when DOM is ready
// ================================================

/**
 * Initialize all website functionality
 */
function initializeWebsite() {
  console.log('Initializing Computer Store Kansas website...');
  
  // Initialize core functionality
  initializeNavigation();
  initializeHamburgerMenu();
  initializeModals();
  initializeContactForm();
  initializeTestimonialsCarousel();
  
  // Add smooth scroll behavior to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && !this.hasAttribute('data-page')) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    // You can add URL-based navigation here if needed
    // For now, always return to home page
    navigateToPage('home');
  });
  
  // Handle window resize (debounced for performance)
  const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  }, 250);
  
  window.addEventListener('resize', handleResize);
  
  // Log success message
  console.log('Website initialized successfully!');
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
  // DOM is already loaded
  initializeWebsite();
}

// ================================================
// EXPORT FUNCTIONS (if using modules)
// Uncomment if you want to use ES6 modules
// ================================================

/*
export {
  navigateToPage,
  toggleMobileMenu,
  showTestimonial,
  nextTestimonial,
  previousTestimonial,
  openContactModal,
  closeContactModal,
  openLoginModal,
  closeLoginModal
};
*/