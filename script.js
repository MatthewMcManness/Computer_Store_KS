/**
 * ================================================
 * COMPUTER STORE KANSAS - MAIN JAVASCRIPT FILE
 * ================================================
 * VERSION: 33
 * LAST UPDATED: 2025-10-29
 * CHANGES: - Added modern scrolling header effects
 *          - Enhanced smooth transitions
 * DESCRIPTION: Handles all interactive functionality for the website
 * DEPENDENCIES: None (vanilla JavaScript)
 * 
 * Table of Contents:
 * 1. Page Navigation System
 * 2. Mobile Hamburger Menu
 * 3. Modern Scroll Effects (NEW)
 * 4. Testimonials Carousel
 * 5. Modal System (Login & Contact)
 * 6. Contact Form Submission
 * 7. Utility Functions
 * 8. Initialization
 * ================================================
 */

// ================================================
// 1. PAGE NAVIGATION SYSTEM
// Handles single-page app navigation between sections
// ================================================

/**
 * Navigate to a specific page section
 * @param {string} pageId - The ID of the page to navigate to
 */
function navigateToPage(pageId) {
  const allPages = document.querySelectorAll('.page-section');
  allPages.forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(pageId + '-page');
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  const allNavLinks = document.querySelectorAll('.nav-link');
  allNavLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileMenu();
}

/**
 * Initialize page navigation listeners
 */
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      navigateToPage(pageId);
    });
  });
  
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
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger-button');
  const nav = document.querySelector('header nav ul');
  
  if (!hamburger || !nav) return;
  
  hamburger.classList.toggle('active');
  nav.classList.toggle('show');
  
  const isExpanded = nav.classList.contains('show');
  hamburger.setAttribute('aria-expanded', isExpanded);
  hamburger.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
}

/**
 * Close mobile navigation menu
 */
function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger-button');
  const nav = document.querySelector('header nav ul');
  
  if (!hamburger || !nav) return;
  
  hamburger.classList.remove('active');
  nav.classList.remove('show');
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
// 3. MODERN SCROLL EFFECTS (NEW)
// Add visual effects when scrolling
// ================================================

/**
 * Add modern scrolling effects to header
 */
function initializeScrollEffects() {
  const header = document.querySelector('header');
  
  if (!header) return;
  
  // Add enhanced shadow to header on scroll
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

// ================================================
// 4. TESTIMONIALS CAROUSEL
// Modern carousel with auto-play and touch support
// ================================================

let currentTestimonialIndex = 0;
let testimonialAutoplayInterval = null;
let isTestimonialAnimating = false;

/**
 * Move carousel to a specific testimonial
 * @param {number} index - The index of the testimonial to show
 */
function showTestimonial(index) {
  if (isTestimonialAnimating) return;
  
  const track = document.querySelector('.testimonials-track');
  const testimonials = document.querySelectorAll('.testimonial');
  const indicators = document.querySelectorAll('.carousel-indicator');
  
  if (!track || testimonials.length === 0) return;
  
  if (index < 0) {
    index = testimonials.length - 1;
  } else if (index >= testimonials.length) {
    index = 0;
  }
  
  isTestimonialAnimating = true;
  currentTestimonialIndex = index;
  
  const offset = -index * 100;
  track.style.transform = `translateX(${offset}%)`;
  
  indicators.forEach((indicator, i) => {
    if (i === index) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
  
  setTimeout(() => {
    isTestimonialAnimating = false;
  }, 600);
}

/**
 * Move to the next testimonial
 */
function nextTestimonial() {
  showTestimonial(currentTestimonialIndex + 1);
  resetTestimonialAutoplay();
}

/**
 * Move to the previous testimonial
 */
function previousTestimonial() {
  showTestimonial(currentTestimonialIndex - 1);
  resetTestimonialAutoplay();
}

/**
 * Start automatic carousel rotation
 */
function startTestimonialAutoplay() {
  if (testimonialAutoplayInterval) {
    clearInterval(testimonialAutoplayInterval);
  }
  
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
 * Reset autoplay timer
 */
function resetTestimonialAutoplay() {
  stopTestimonialAutoplay();
  startTestimonialAutoplay();
}

/**
 * Initialize testimonials carousel
 */
function initializeTestimonialsCarousel() {
  const prevButton = document.querySelector('.carousel-arrow.prev');
  const nextButton = document.querySelector('.carousel-arrow.next');
  const indicators = document.querySelectorAll('.carousel-indicator');
  const carousel = document.querySelector('.testimonials-carousel');
  
  if (prevButton) {
    prevButton.addEventListener('click', previousTestimonial);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', nextTestimonial);
  }
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showTestimonial(index);
      resetTestimonialAutoplay();
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (!carousel || !isElementInViewport(carousel)) return;
    
    if (e.key === 'ArrowLeft') {
      previousTestimonial();
    } else if (e.key === 'ArrowRight') {
      nextTestimonial();
    }
  });
  
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
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;
    
    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        nextTestimonial();
      } else {
        previousTestimonial();
      }
    }
  }
  
  if (carousel) {
    carousel.addEventListener('mouseenter', stopTestimonialAutoplay);
    carousel.addEventListener('mouseleave', startTestimonialAutoplay);
  }
  
  startTestimonialAutoplay();
  showTestimonial(0);
}

// ================================================
// 5. MODAL SYSTEM (LOGIN & CONTACT)
// Handles opening and closing of modal dialogs
// ================================================

/**
 * Open the login modal
 */
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('active');
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
    document.body.style.overflow = 'hidden';
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
    document.body.style.overflow = '';
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
  const loginBtn = document.getElementById('login-btn');
  const loginModalClose = document.getElementById('modal-close');
  const loginModal = document.getElementById('login-modal');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }
  
  if (loginModalClose) {
    loginModalClose.addEventListener('click', closeLoginModal);
  }
  
  if (loginModal) {
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }
  
  const contactModalBtns = document.querySelectorAll('.contact-modal-btn');
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactModal = document.getElementById('contact-modal');
  
  contactModalBtns.forEach(btn => {
    btn.addEventListener('click', openContactModal);
  });
  
  if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
  }
  
  if (contactModal) {
    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) {
        closeContactModal();
      }
    });
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLoginModal();
      closeContactModal();
    }
  });
}

// ================================================
// 6. CONTACT FORM SUBMISSION - FORMSPREE
// Handles contact form submission via Formspree API
// ================================================

/**
 * Handle contact form submission
 * @param {Event} e - The form submit event
 */
function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const formStatus = document.getElementById('formStatus');
  
  const formData = {
    name: document.getElementById('modal-name').value,
    email: document.getElementById('modal-email').value,
    phone: document.getElementById('modal-phone').value,
    message: document.getElementById('modal-message').value
  };
  
  if (!formData.name || !formData.email || !formData.message) {
    showFormStatus('Please fill in all fields', 'error');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showFormStatus('Please enter a valid email address', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  
  fetch('https://formspree.io/f/xjkpgovk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok');
  })
  .then(data => {
    showFormStatus('Message sent successfully! We\'ll get back to you soon.', 'success');
    form.reset();
    
    setTimeout(() => {
      closeContactModal();
    }, 2000);
  })
  .catch(error => {
    console.error('Form submission error:', error);
    showFormStatus('Oops! Something went wrong. Please try again or call us at 785-267-3223.', 'error');
  })
  .finally(() => {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  });
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
    formStatus.style.color = '#10b981';
    formStatus.style.backgroundColor = '#d1fae5';
  } else if (type === 'error') {
    formStatus.style.color = '#ef4444';
    formStatus.style.backgroundColor = '#fee2e2';
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
// 7. UTILITY FUNCTIONS
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
// 8. INITIALIZATION
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
  initializeScrollEffects();
  
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
    navigateToPage('home');
  });
  
  // Handle window resize
  const handleResize = debounce(() => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  }, 250);
  
  window.addEventListener('resize', handleResize);
  
  console.log('Website initialized successfully!');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
  initializeWebsite();
}
