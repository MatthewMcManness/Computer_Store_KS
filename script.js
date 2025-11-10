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
// 7. GALLERY FUNCTIONALITY
// Handles gallery filtering and computer details modal
// ================================================

// Computer data - in a real application, this would come from a database
const computerData = {
  1: {
    id: 1,
    name: 'Gaming Pro Desktop',
    type: 'desktop',
    category: 'custom',
    price: '$1,299',
    image: './assets/gallery/desktop-1.jpg',
    specs: {
      'Processor': 'Intel Core i7-12700K (12-Core, 3.6GHz base, 5.0GHz turbo)',
      'Memory': '32GB DDR4 3200MHz (2x16GB)',
      'Storage': '1TB NVMe M.2 SSD',
      'Graphics': 'NVIDIA GeForce RTX 3070 (8GB GDDR6)',
      'Motherboard': 'ASUS ROG Strix Z690-A',
      'Power Supply': '750W 80+ Gold Certified',
      'Cooling': 'Liquid CPU Cooler with RGB',
      'Case': 'NZXT H510 Elite with Tempered Glass',
      'Operating System': 'Windows 11 Pro',
      'Warranty': '1 Year Parts & Labor'
    }
  },
  2: {
    id: 2,
    name: 'Business Pro Laptop',
    type: 'laptop',
    category: 'refurbished',
    price: '$599',
    image: './assets/gallery/laptop-1.jpg',
    specs: {
      'Processor': 'Intel Core i5-11300H (4-Core, 3.1GHz base)',
      'Memory': '16GB DDR4 3200MHz',
      'Storage': '512GB NVMe SSD',
      'Display': '15.6" FHD (1920x1080) IPS Display',
      'Graphics': 'Intel Iris Xe Graphics',
      'Battery': 'Up to 8 hours',
      'Connectivity': 'Wi-Fi 6, Bluetooth 5.0',
      'Ports': '2x USB-C, 2x USB-A, HDMI, Audio Jack',
      'Operating System': 'Windows 11 Pro',
      'Warranty': '90 Days Parts & Labor'
    }
  },
  3: {
    id: 3,
    name: 'Office Essential Desktop',
    type: 'desktop',
    category: 'refurbished',
    price: '$449',
    image: './assets/gallery/desktop-2.jpg',
    specs: {
      'Processor': 'Intel Core i5-10400 (6-Core, 2.9GHz base)',
      'Memory': '16GB DDR4 2666MHz',
      'Storage': '500GB SATA SSD',
      'Graphics': 'Intel UHD Graphics 630',
      'Motherboard': 'Dell Optiplex Motherboard',
      'Power Supply': '260W Power Supply',
      'Case': 'Dell Optiplex Small Form Factor',
      'Ports': '6x USB, DisplayPort, VGA',
      'Operating System': 'Windows 11 Pro',
      'Warranty': '90 Days Parts & Labor'
    }
  },
  4: {
    id: 4,
    name: 'Creator Pro Laptop',
    type: 'laptop',
    category: 'custom',
    price: '$1,599',
    image: './assets/gallery/laptop-2.jpg',
    specs: {
      'Processor': 'AMD Ryzen 9 5900HX (8-Core, 3.3GHz base, 4.6GHz boost)',
      'Memory': '32GB DDR4 3200MHz',
      'Storage': '1TB NVMe M.2 SSD',
      'Display': '15.6" QHD (2560x1440) 165Hz IPS',
      'Graphics': 'NVIDIA GeForce RTX 3070 (8GB GDDR6)',
      'Battery': 'Up to 6 hours (90Wh)',
      'Cooling': 'Advanced Thermal System with Dual Fans',
      'Ports': '3x USB-C, 2x USB-A, HDMI 2.1, SD Card Reader',
      'Operating System': 'Windows 11 Pro',
      'Warranty': '1 Year Parts & Labor'
    }
  },
  5: {
    id: 5,
    name: 'Professional Workstation',
    type: 'desktop',
    category: 'custom',
    price: '$2,199',
    image: './assets/gallery/desktop-3.jpg',
    specs: {
      'Processor': 'Intel Core i9-12900K (16-Core, 3.2GHz base, 5.2GHz turbo)',
      'Memory': '64GB DDR5 4800MHz (4x16GB)',
      'Storage': '2TB NVMe M.2 SSD + 4TB HDD',
      'Graphics': 'NVIDIA RTX A4000 (16GB GDDR6)',
      'Motherboard': 'ASUS ProArt Z690-Creator',
      'Power Supply': '850W 80+ Platinum Certified',
      'Cooling': 'Custom Water Cooling Loop',
      'Case': 'Fractal Design Define 7 XL',
      'Operating System': 'Windows 11 Pro for Workstations',
      'Warranty': '2 Year Parts & Labor'
    }
  },
  6: {
    id: 6,
    name: 'Student Essential Laptop',
    type: 'laptop',
    category: 'refurbished',
    price: '$349',
    image: './assets/gallery/laptop-3.jpg',
    specs: {
      'Processor': 'Intel Core i3-10110U (2-Core, 2.1GHz base)',
      'Memory': '8GB DDR4 2666MHz',
      'Storage': '256GB NVMe SSD',
      'Display': '14" HD (1366x768) Display',
      'Graphics': 'Intel UHD Graphics',
      'Battery': 'Up to 7 hours',
      'Connectivity': 'Wi-Fi 5, Bluetooth 4.2',
      'Ports': '2x USB-A, 1x USB-C, HDMI, Audio Jack',
      'Operating System': 'Windows 11 Home',
      'Warranty': '90 Days Parts & Labor'
    }
  }
};

/**
 * Initialize gallery filters
 */
function initializeGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Get filter value
      const filter = this.getAttribute('data-filter');

      // Filter gallery cards
      filterGalleryCards(filter);
    });
  });
}

/**
 * Filter gallery cards based on selected filter
 * @param {string} filter - The filter to apply
 */
function filterGalleryCards(filter) {
  const cards = document.querySelectorAll('.gallery-card');

  cards.forEach(card => {
    const cardType = card.getAttribute('data-type');
    const cardCategory = card.getAttribute('data-category');

    if (filter === 'all') {
      card.classList.remove('hidden');
    } else if (filter === cardType || filter === cardCategory) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

/**
 * Initialize flip card interactions
 * Adds click handlers for opening contact modal from cards
 */
function initializeFlipCards() {
  const galleryCards = document.querySelectorAll('.gallery-card');

  galleryCards.forEach(card => {
    // Optional: Add click handler to open contact modal when clicking on the back of the card
    card.addEventListener('click', function(e) {
      // You can add additional click functionality here if needed
      // For example, opening a contact modal when clicking the flipped card
    });
  });
}

/**
 * Initialize gallery functionality
 */
function initializeGallery() {
  // Only initialize if gallery page exists
  const galleryPage = document.getElementById('gallery-page');
  if (!galleryPage) return;

  initializeGalleryFilters();
  initializeFlipCards();

  console.log('Gallery initialized successfully!');
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
  initializeGallery();
  
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
