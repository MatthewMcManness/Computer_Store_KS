/**
 * ================================================
 * COMPUTER STORE KANSAS - CONSOLIDATED JAVASCRIPT
 * ================================================
 * VERSION: 9
 * LAST UPDATED: 2025-09-23
 * CHANGES: Updated plan description text to include "comprehensive computer protection 
 *          and maintenance for peace of mind" in the populateProtectionPlan function
 * DESCRIPTION: Combines mobile navigation, page switching, modal handling, contact form,
 *              dynamic content management, and Google Analytics tracking
 * DEPENDENCIES: config.js (must be loaded first), Google Analytics gtag
 * 
 * Table of Contents:
 * 1. Initialization & DOM Ready Setup
 * 2. Configuration Data Management
 * 3. Google Analytics Integration
 * 4. Dynamic Content Population
 * 5. Mobile Navigation Toggle
 * 6. Single-Page App Navigation System
 * 7. Login Modal Functionality
 * 8. Contact Form Handling
 * 9. Browser History Management
 * 10. Utility Functions
 * 11. Event Listeners & Initialization
 * ================================================
 */

console.log('[site.js] loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[site.js] DOM ready');

  /* ================================================
     1. ELEMENT REFERENCES & INITIAL SETUP
     Get references to key DOM elements for later use
     ================================================ */
  const navLinks = document.querySelectorAll('.nav-link');      // All navigation links
  const pages = document.querySelectorAll('.page-section');    // All page sections
  const hamburger = document.getElementById('hamburger-button'); // Mobile menu button
  const navList = document.querySelector('header nav ul');     // Navigation menu list
  
  /* ================================================
     2. CONFIGURATION DATA MANAGEMENT
     Access and validate configuration data
     ================================================ */
  
  // Check if configuration data is available
  if (typeof window.siteConfig === 'undefined') {
    console.error('[site.js] Configuration data not found! Make sure config.js is loaded before this script.');
    return;
  }
  
  const config = window.siteConfig;                           // Reference to configuration data
  console.log('[site.js] Configuration loaded successfully');

  /* ================================================
     3. GOOGLE ANALYTICS INTEGRATION
     Track page views and user interactions for single-page application
     ================================================ */

  /**
   * Track a page view in Google Analytics
   * @param {string} pageId - The page identifier (home, about, services, etc.)
   * @param {string} pageTitle - The page title for analytics
   */
  function trackPageView(pageId, pageTitle) {
    // Check if Google Analytics is loaded
    if (typeof gtag === 'function') {
      console.log('[Analytics] Tracking page view:', pageId);
      
      // Send page view event to Google Analytics
      gtag('config', 'G-EQ3ML3VTCZ', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pageId === 'home' ? '/' : `/#${pageId}`
      });
      
      // Send custom event for page navigation
      gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pageId === 'home' ? '/' : `/#${pageId}`,
        custom_page_id: pageId
      });
    } else {
      console.warn('[Analytics] Google Analytics not loaded');
    }
  }

  /**
   * Track user interactions and events
   * @param {string} eventName - Name of the event
   * @param {string} category - Event category
   * @param {string} label - Event label (optional)
   * @param {number} value - Event value (optional)
   */
  function trackEvent(eventName, category, label = '', value = null) {
    if (typeof gtag === 'function') {
      console.log('[Analytics] Tracking event:', eventName, category, label);
      
      const eventData = {
        event_category: category,
        event_label: label
      };
      
      if (value !== null) {
        eventData.value = value;
      }
      
      gtag('event', eventName, eventData);
    }
  }

  /**
   * Track contact form interactions
   * @param {string} action - The action taken (form_start, form_submit, form_success, form_error)
   * @param {string} formType - Type of form (contact_modal, etc.)
   */
  function trackContactForm(action, formType = 'contact_modal') {
    trackEvent(action, 'contact_form', formType);
    
    // Special tracking for form completion
    if (action === 'form_success') {
      gtag('event', 'conversion', {
        send_to: 'G-EQ3ML3VTCZ',
        event_category: 'contact_form',
        event_label: 'lead_generated'
      });
    }
  }

  /* ================================================
   TESTIMONIALS CAROUSEL CLASS DEFINITION
   Add this entire section right after the trackContactForm function
   ================================================ */

/**
 * Testimonials Carousel Class - handles all carousel functionality
 */
class TestimonialsCarousel {
  /**
   * Initialize the testimonials carousel
   * @param {HTMLElement} container - The testimonials section container
   * @param {Array} testimonials - Array of testimonial objects from config
   */
  constructor(container, testimonials) {
    this.container = container;           // Main testimonials section
    this.testimonials = testimonials;     // Testimonials data from config
    this.currentIndex = 0;                // Currently displayed testimonial index
    this.isTransitioning = false;         // Prevent multiple transitions
    this.autoRotateInterval = null;       // Auto-rotation timer
    this.autoRotateDelay = 6000;          // 6 seconds between auto-rotations
    
    // Touch/swipe detection variables
    this.touchStartX = 0;                 // Starting X position for touch
    this.touchEndX = 0;                   // Ending X position for touch
    this.minSwipeDistance = 50;           // Minimum swipe distance to trigger navigation
    
    this.init();                          // Initialize the carousel
  }

  /**
   * Initialize the carousel - create structure and bind events
   */
  init() {
    console.log('[Carousel] Initializing testimonials carousel...');
    
    // Create the carousel HTML structure
    this.createCarouselStructure();
    
    // Set up navigation controls
    this.setupNavigation();
    
    // Add touch/swipe support
    this.setupTouchNavigation();
    
    // Add keyboard navigation
    this.setupKeyboardNavigation();
    
    // Start auto-rotation
    this.startAutoRotation();
    
    // Pause auto-rotation when user hovers over carousel
    this.setupHoverPause();
    
    console.log('[Carousel] Testimonials carousel initialized successfully');
  }

  /**
   * Create the complete carousel HTML structure
   */
  createCarouselStructure() {
    // Keep the existing heading
    const heading = this.container.querySelector('h2');
    
    // Clear the container but preserve the heading
    this.container.innerHTML = '';
    if (heading) {
      this.container.appendChild(heading);
    }

    // Create carousel wrapper
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'testimonials-carousel';
    
    // Create carousel track (holds all testimonials)
    const carouselTrack = document.createElement('div');
    carouselTrack.className = 'testimonials-track';
    
    // Create individual testimonial cards
    this.testimonials.forEach((testimonial, index) => {
      const testimonialCard = this.createTestimonialCard(testimonial, index);
      carouselTrack.appendChild(testimonialCard);
    });
    
    // Create navigation arrows
    const prevArrow = this.createArrowButton('prev', '←');
    const nextArrow = this.createArrowButton('next', '→');
    
    // Assemble the carousel structure
    carouselWrapper.appendChild(prevArrow);
    carouselWrapper.appendChild(carouselTrack);
    carouselWrapper.appendChild(nextArrow);
    
    // Add to main container
    this.container.appendChild(carouselWrapper);
    
    // Create indicators (dots)
    if (this.testimonials.length > 1) {
      const indicators = this.createIndicators();
      this.container.appendChild(indicators);
    }
    
    // Store references for later use
    this.carouselWrapper = carouselWrapper;
    this.carouselTrack = carouselTrack;
    this.prevArrow = prevArrow;
    this.nextArrow = nextArrow;
  }

  /**
   * Create a single testimonial card element
   */
  createTestimonialCard(testimonial, index) {
    const card = document.createElement('div');
    card.className = 'testimonial';
    card.setAttribute('data-index', index);
    
    card.innerHTML = `
      <p>${testimonial.text}</p>
      <h4>– ${testimonial.author}, ${testimonial.location}</h4>
    `;
    
    return card;
  }

  /**
   * Create arrow navigation button
   */
  createArrowButton(direction, symbol) {
    const button = document.createElement('button');
    button.className = `carousel-arrow ${direction}`;
    button.setAttribute('aria-label', `${direction === 'prev' ? 'Previous' : 'Next'} testimonial`);
    button.innerHTML = symbol;
    
    return button;
  }

  /**
   * Create indicator dots container
   */
  createIndicators() {
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    
    this.testimonials.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.setAttribute('data-index', index);
      indicator.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      indicatorsContainer.appendChild(indicator);
    });
    
    return indicatorsContainer;
  }

  /**
   * Set up all navigation event listeners
   */
  setupNavigation() {
    // Arrow navigation
    this.prevArrow.addEventListener('click', () => {
      this.goToPrevious();
      this.resetAutoRotation();
    });
    
    this.nextArrow.addEventListener('click', () => {
      this.goToNext();
      this.resetAutoRotation();
    });
    
    // Indicator navigation
    const indicators = this.container.querySelectorAll('.carousel-indicator');
    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.goToSlide(index);
        this.resetAutoRotation();
      });
    });
  }

  /**
   * Navigate to the previous testimonial
   */
  goToPrevious() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 
      ? this.testimonials.length - 1 
      : this.currentIndex - 1;
    
    this.goToSlide(newIndex);
    
    // Track user interaction for analytics
    if (typeof trackEvent === 'function') {
      trackEvent('testimonial_navigate', 'engagement', 'previous_button');
    }
  }

  /**
   * Navigate to the next testimonial
   */
  goToNext() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.testimonials.length - 1 
      ? 0 
      : this.currentIndex + 1;
    
    this.goToSlide(newIndex);
    
    // Track user interaction for analytics
    if (typeof trackEvent === 'function') {
      trackEvent('testimonial_navigate', 'engagement', 'next_button');
    }
  }

  /**
   * Navigate to a specific testimonial by index
   */
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    
    // Calculate the transform value to show the correct testimonial
    const translateX = -index * 100;
    this.carouselTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update indicators
    this.updateIndicators();
    
    // Reset transition lock after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
    
    // Track slide change for analytics
    if (typeof trackEvent === 'function') {
      trackEvent('testimonial_view', 'engagement', `slide_${index + 1}`);
    }
  }

  /**
   * Update the active state of indicator dots
   */
  updateIndicators() {
    const indicators = this.container.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  /**
   * Start automatic rotation through testimonials
   */
  startAutoRotation() {
    if (this.testimonials.length <= 1) return;
    
    this.autoRotateInterval = setInterval(() => {
      this.goToNext();
    }, this.autoRotateDelay);
  }

  /**
   * Stop automatic rotation
   */
  stopAutoRotation() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  /**
   * Reset the auto-rotation timer
   */
  resetAutoRotation() {
    this.stopAutoRotation();
    this.startAutoRotation();
  }

  /**
   * Set up hover pause functionality
   */
  setupHoverPause() {
    this.carouselWrapper.addEventListener('mouseenter', () => {
      this.stopAutoRotation();
    });
    
    this.carouselWrapper.addEventListener('mouseleave', () => {
      this.startAutoRotation();
    });
  }

  /**
   * Set up touch event listeners for swipe navigation
   */
  setupTouchNavigation() {
    this.carouselWrapper.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    this.carouselWrapper.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });
  }

  /**
   * Process swipe gesture and navigate accordingly
   */
  handleSwipe() {
    const swipeDistance = this.touchStartX - this.touchEndX;
    const absSwipeDistance = Math.abs(swipeDistance);
    
    if (absSwipeDistance < this.minSwipeDistance) return;
    
    if (swipeDistance > 0) {
      this.goToNext();
    } else {
      this.goToPrevious();
    }
    
    this.resetAutoRotation();
    
    // Track swipe interaction for analytics
    if (typeof trackEvent === 'function') {
      trackEvent('testimonial_swipe', 'engagement', swipeDistance > 0 ? 'left' : 'right');
    }
  }

  /**
   * Set up keyboard event listeners
   */
  setupKeyboardNavigation() {
    this.carouselWrapper.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
    
    this.carouselWrapper.setAttribute('tabindex', '0');
    this.carouselWrapper.setAttribute('role', 'region');
    this.carouselWrapper.setAttribute('aria-label', 'Customer testimonials carousel');
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyPress(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.goToPrevious();
        this.resetAutoRotation();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.goToNext();
        this.resetAutoRotation();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        this.resetAutoRotation();
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.testimonials.length - 1);
        this.resetAutoRotation();
        break;
    }
    
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      if (typeof trackEvent === 'function') {
        trackEvent('testimonial_keyboard', 'accessibility', e.key);
      }
    }
  }

  /**
   * Destroy the carousel and clean up
   */
  destroy() {
    this.stopAutoRotation();
    console.log('[Carousel] Testimonials carousel destroyed');
  }
}


  /* ================================================
     4. DYNAMIC CONTENT POPULATION
     Functions to populate website content from configuration data
     ================================================ */

  /**
   * Populate services section with data from configuration
   * @param {string} containerSelector - CSS selector for the services container
   * @param {Array} servicesData - Array of service objects
   */
  function populateServices(containerSelector, servicesData) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cardsContainer = container.querySelector('.cards');
    if (!cardsContainer) return;

    // Clear existing content
    cardsContainer.innerHTML = '';

    // Create service cards from configuration data
    servicesData.forEach(service => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.innerHTML = `
        <h3>${service.name}</h3>
        <p>${service.description}</p>
      `;
      cardsContainer.appendChild(cardElement);
    });
  }

  /**
   * Populate testimonials section with data from configuration
   */
/**
 * Enhanced testimonials population function - now creates a carousel
 */
  function populateTestimonials() {
    const testimonialsContainer = document.querySelector('.testimonials .container');
    if (!testimonialsContainer) {
      console.warn('[Carousel] Testimonials container not found');
      return;
    }

    // Check if we have testimonials data
    if (!config.testimonials || config.testimonials.length === 0) {
      console.warn('[Carousel] No testimonials data found');
      return;
    }

    console.log('[Carousel] Creating testimonials carousel with', config.testimonials.length, 'testimonials');

    // Create and initialize the carousel
    window.testimonialsCarousel = new TestimonialsCarousel(testimonialsContainer, config.testimonials);
    
    // Track carousel initialization for analytics
    if (typeof trackEvent === 'function') {
      trackEvent('testimonials_carousel_init', 'engagement', `${config.testimonials.length}_testimonials`);
    }
  }


  /**
   * Populate highlights section with data from configuration
   */
  function populateHighlights() {
    const highlightsContainer = document.querySelector('.highlights-container');
    if (!highlightsContainer) return;

    // Clear existing content
    highlightsContainer.innerHTML = '';

    // Create highlight elements from configuration data
    config.highlights.forEach(highlight => {
      const highlightElement = document.createElement('div');
      highlightElement.className = 'highlight';
      highlightElement.innerHTML = `<h3>${highlight}</h3>`;
      highlightsContainer.appendChild(highlightElement);
    });
  }

  /**
   * Populate contact information throughout the site
   */
  function populateContactInfo() {
    // Update contact information in contact page
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
      contactInfo.innerHTML = `
        <p><strong>Phone:</strong> ${config.contact.phone}</p>
        <p><strong>Email:</strong> ${config.contact.email}</p>
        <p><strong>Address:</strong> ${config.contact.address}</p>
        <p><strong>Hours:</strong> ${config.contact.hoursDisplay}</p>
        <p class="note">*Three‑month agreement required</p>
      `;
    }

    // Update email links throughout the site
    document.querySelectorAll('a[href*="mailto"]').forEach(emailLink => {
      emailLink.href = `mailto:${config.contact.email}`;
      if (emailLink.textContent.includes('@')) {
        emailLink.textContent = config.contact.email;
      }
    });
  }

  /**
   * Populate protection plan information
   */
  function populateProtectionPlan() {
    const membershipText = document.querySelector('.membership-text-centered');
    if (!membershipText) return;

    const silverPlan = config.plans.silver;
    
    // Update plan description
    const planDescription = membershipText.querySelector('.plan-description');
    if (planDescription) {
      planDescription.innerHTML = `Our ${silverPlan.name} provides comprehensive care for your computer. Only ${silverPlan.price} per month (with a ${silverPlan.commitment} commitment)`;
    }

    // Update features list
    const featuresList = membershipText.querySelector('.membership-features-enhanced');
    if (featuresList) {
      featuresList.innerHTML = '';
      silverPlan.features.forEach(feature => {
        const listItem = document.createElement('li');
        listItem.textContent = feature;
        featuresList.appendChild(listItem);
      });
    }

    // Update contact note
    const membershipNote = membershipText.querySelector('.membership-note');
    if (membershipNote) {
      membershipNote.innerHTML = `<strong>Ready to get protected?</strong> Contact us at <a href="mailto:${config.contact.email}">${config.contact.email}</a> or call ${config.contact.phone} to sign up today!`;
    }
  }

  /**
   * Populate founder information
   */
  function populateFounderInfo() {
    const founderText = document.querySelector('.founder-text');
    if (!founderText) return;

    // Update founder quote
    const founderQuote = founderText.querySelector('p:not(.founder-name)');
    if (founderQuote) {
      founderQuote.textContent = config.founder.quote;
    }

    // Update founder attribution
    const founderName = founderText.querySelector('.founder-name');
    if (founderName) {
      founderName.textContent = `– ${config.founder.name}, ${config.founder.title}`;
    }
  }

  /**
   * Update page titles and meta information
   */
  function updatePageTitles() {
    // Update navigation page titles based on current page
    const currentPage = document.querySelector('.page-section.active')?.id.replace('-page', '') || 'home';
    const pageConfig = config.navigation.pages.find(page => page.id === currentPage);
    
    if (pageConfig) {
      document.title = pageConfig.display_title;
    }

    // Update footer copyright
    const footer = document.querySelector('footer p');
    if (footer) {
      footer.textContent = `© ${config.meta.copyright}`;
    }
  }

  /**
   * Master function to populate all dynamic content
   */
  function populateAllContent() {
    console.log('[site.js] Populating dynamic content...');
    
    // Populate different sections with appropriate data
    populateServices('#home-page .services', config.services.main);           // Home page services
    populateServices('#services-page .services', config.services.detailed);   // Services page detailed services
    populateServices('#about-page .services', config.services.differentiators); // About page differentiators
    
    populateTestimonials();          // Customer testimonials
    populateHighlights();            // Key selling points
    populateContactInfo();           // Contact information
    populateProtectionPlan();        // Protection plan details
    populateFounderInfo();           // Founder information
    updatePageTitles();              // Page titles and meta info
    
    console.log('[site.js] Dynamic content population complete');
  }
  
  /* ================================================
     5. MOBILE NAVIGATION TOGGLE
     Handle hamburger menu for mobile devices with icon switching
     ================================================ */
  if (hamburger && navList) {
    hamburger.addEventListener('click', function() {
      // STEP 1: Toggle the mobile navigation menu visibility
      const isMenuOpen = navList.classList.toggle('show');
      
      // STEP 2: Toggle hamburger icon between ☰ (hamburger) and ✕ (close)
      if (isMenuOpen) {
        // Menu is now open - change hamburger to close (X) icon
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-label', 'Close menu'); // Accessibility
        hamburger.setAttribute('aria-expanded', 'true');    // Screen reader support
        
        // Track mobile menu open event
        trackEvent('mobile_menu_open', 'navigation', 'hamburger_menu');
      } else {
        // Menu is now closed - change back to hamburger icon
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-label', 'Open menu');  // Accessibility
        hamburger.setAttribute('aria-expanded', 'false');   // Screen reader support
        
        // Track mobile menu close event
        trackEvent('mobile_menu_close', 'navigation', 'hamburger_menu');
      }
    });
  }

  /**
   * Close mobile menu and reset hamburger icon
   * Called when navigation links are clicked or when needed to programmatically close menu
   */
  function closeMobileMenu() {
    if (navList && hamburger) {
      // STEP 1: Hide the mobile navigation menu
      navList.classList.remove('show');
      
      // STEP 2: Reset hamburger icon back to hamburger (☰) state
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-label', 'Open menu');    // Reset accessibility label
      hamburger.setAttribute('aria-expanded', 'false');     // Reset screen reader state
    }
  }

  /* ================================================
     6. SINGLE-PAGE APP NAVIGATION SYSTEM
     Core function to switch between different page sections
     ================================================ */
  
  /**
   * Show a specific page and update navigation states
   * @param {string} pageId - The ID of the page to show (silver-plan, home, about, services, contact)
   */
  function showPage(pageId) {
    // STEP 1: Hide all page sections
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // STEP 2: Show the target page section
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // STEP 3: Update navigation active states
    navLinks.forEach(link => {
      link.classList.remove('active');  // Remove active from all links
    });
    
    // STEP 4: Set active state on current navigation link
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // STEP 5: Update browser tab title using configuration data
    const pageConfig = config.navigation.pages.find(page => page.id === pageId);
    if (pageConfig) {
      document.title = pageConfig.display_title;
      
      // STEP 6: Track page view in Google Analytics
      trackPageView(pageId, pageConfig.display_title);
    } else {
      document.title = config.site.name; // Fallback to site name
      trackPageView(pageId, config.site.name);
    }
    
    // STEP 7: Close mobile menu if it's open (using our helper function)
    closeMobileMenu();
    
    // STEP 8: Scroll to top for better user experience
    window.scrollTo(0, 0);
    
    // STEP 9: Update browser history for back/forward button support
    history.pushState({page: pageId}, '', window.location.pathname + (pageId !== 'home' ? '#' + pageId : ''));
    
    // STEP 10: Track navigation event
    trackEvent('page_navigation', 'navigation', pageId);
  }

  /* ================================================
     NAVIGATION LINK EVENT LISTENERS
     Attach click handlers to all navigation links with special contact handling
     ================================================ */
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();                           // Prevent default link behavior
      const pageId = this.getAttribute('data-page'); // Get target page ID
      
      // Special handling for contact link - open modal instead of page navigation
      if (pageId === 'contact') {
        contactModal.classList.add('active');       // Open contact modal
        trackEvent('contact_modal_open', 'contact_form', 'navigation_link');
        return;                                     // Don't navigate to contact page
      }
      
      if (pageId) {
        showPage(pageId);                           // Switch to target page
      }
    });
  });

  /* ================================================
     7. MODAL FUNCTIONALITY (LOGIN & CONTACT)
     Handle login modal and contact form modal display and interaction
     ================================================ */
  
  // Get references to modal elements
  const loginBtn = document.getElementById('login-btn');        // Administrator Login button (now in footer)
  const loginModal = document.getElementById('login-modal');    // Login modal container
  const modalClose = document.getElementById('modal-close');    // Login modal close button
  const backToHome = document.getElementById('back-to-home');   // Back to Home button

  // Contact modal elements
  const contactModal = document.getElementById('contact-modal'); // Contact modal container
  const contactModalClose = document.getElementById('contact-modal-close'); // Contact modal close button
  const contactModalBtns = document.querySelectorAll('.contact-modal-btn'); // All contact modal trigger buttons

  // Show login modal when Administrator Login is clicked (button now in footer)
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();                       // Prevent default link behavior
      loginModal.classList.add('active');      // Show the login modal
      trackEvent('admin_login_modal_open', 'administration', 'footer_button');
    });
  }

  // Show contact modal when any contact button is clicked
  contactModalBtns.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();                       // Prevent default behavior
      contactModal.classList.add('active');    // Show the contact modal
      
      // Track which button was clicked
      const buttonText = this.textContent.trim();
      trackEvent('contact_modal_open', 'contact_form', buttonText);
    });
  });

  /**
   * Close the login modal and remove from display
   */
  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove('active');   // Hide the login modal
      trackEvent('admin_login_modal_close', 'administration', 'modal_close');
    }
  }

  /**
   * Close the contact modal and remove from display
   */
  function closeContactModal() {
    if (contactModal) {
      contactModal.classList.remove('active'); // Hide the contact modal
      trackEvent('contact_modal_close', 'contact_form', 'modal_close');
      
      // Reset form if it exists
      const form = document.getElementById('contactForm');
      const statusEl = document.getElementById('formStatus');
      if (form) {
        form.reset();                          // Clear form fields
      }
      if (statusEl) {
        statusEl.textContent = '';             // Clear status message
        statusEl.className = 'form-status';    // Reset status styling
      }
    }
  }

  // Close login modal when X button is clicked
  if (modalClose) {
    modalClose.addEventListener('click', closeLoginModal);
  }

  // Close contact modal when X button is clicked
  if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
  }

  // Close login modal and return to home when "Back to Home" is clicked
  if (backToHome) {
    backToHome.addEventListener('click', function(e) {
      e.preventDefault();                       // Prevent default link behavior
      closeLoginModal();                        // Close the login modal first
      showPage('home');                         // Navigate to home page
    });
  }

  // Close modals when clicking outside the modal content (on backdrop)
  if (loginModal) {
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) {            // Check if click was on backdrop
        closeLoginModal();                      // Close the login modal
      }
    });
  }

  if (contactModal) {
    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) {          // Check if click was on backdrop
        closeContactModal();                    // Close the contact modal
      }
    });
  }

  /* ================================================
     8. CONTACT FORM HANDLING
     Handle contact form submission and API communication using config data
     Form is now in a modal for better UX
     ================================================ */
  
  // Get references to form elements
  const form = document.getElementById('contactForm');          // Contact form (in modal)
  const statusEl = document.getElementById('formStatus');       // Status message display

  if (form && statusEl) {
    /**
     * Handle contact form submission using API endpoint from configuration
     * @param {Event} e - Form submit event
     */
    async function submitForm(e) {
      e.preventDefault();                       // Prevent default form submission
      console.log('[site.js] submit fired');
      
      // Track form start
      trackContactForm('form_start');

      // STEP 1: Get form elements with modal-specific IDs
      const nameField = document.getElementById('modal-name');
      const emailField = document.getElementById('modal-email');
      const messageField = document.getElementById('modal-message');
      const submitBtn = form.querySelector('.btn-primary');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');

      // STEP 2: Extract form data
      const data = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        message: messageField.value.trim()
      };

      // STEP 3: Basic validation
      if (!data.name || !data.email || !data.message) {
        statusEl.textContent = 'Please fill in all fields.';
        statusEl.style.color = '#dc3545';       // Red color for error
        statusEl.style.backgroundColor = '#f8d7da'; // Light red background
        statusEl.style.padding = '0.5rem';
        statusEl.style.borderRadius = '6px';
        trackContactForm('form_error', 'validation_error');
        return;
      }
      
      // STEP 4: Show loading state
      statusEl.textContent = '';                // Clear previous status
      statusEl.style.backgroundColor = '';      // Clear previous styling
      submitBtn.disabled = true;                // Disable submit button
      btnText.style.display = 'none';           // Hide submit text
      btnLoading.style.display = 'inline';     // Show loading text
      
      // Track form submission attempt
      trackContactForm('form_submit');

      try {
        // STEP 5: Send data to API using endpoint from configuration
        const res = await fetch(config.api.contact_endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // STEP 6: Handle API response
        // Read raw text first to surface non-JSON errors
        const text = await res.text();
        let payload;
        try {
          payload = JSON.parse(text);           // Try to parse as JSON
        } catch {
          payload = { errorText: text };        // Fallback for non-JSON responses
        }

        // STEP 7: Display result to user
        if (res.ok) {
          // SUCCESS: Show success message and reset form
          statusEl.textContent = '✅ Thanks! We\'ll be in touch soon.';
          statusEl.style.color = '#155724';     // Green color for success
          statusEl.style.backgroundColor = '#d4edda'; // Light green background
          statusEl.style.padding = '0.5rem';
          statusEl.style.borderRadius = '6px';
          form.reset();                         // Clear form fields
          
          // Track successful form submission
          trackContactForm('form_success');
          
          // Auto-close modal after 3 seconds
          setTimeout(() => {
            closeContactModal();
          }, 3000);
        } else {
          // ERROR: Show error message
          statusEl.textContent = '❌ ' + (payload?.error || payload?.errorText || 'Something went wrong. Please try again.');
          statusEl.style.color = '#721c24';     // Red color for error
          statusEl.style.backgroundColor = '#f8d7da'; // Light red background
          statusEl.style.padding = '0.5rem';
          statusEl.style.borderRadius = '6px';
          trackContactForm('form_error', 'api_error');
        }
      } catch (err) {
        // NETWORK ERROR: Handle fetch failures
        console.error('[site.js] fetch error', err);
        statusEl.textContent = '❌ Network error. Please check your connection and try again.';
        statusEl.style.color = '#721c24';       // Red color for error
        statusEl.style.backgroundColor = '#f8d7da'; // Light red background
        statusEl.style.padding = '0.5rem';
        statusEl.style.borderRadius = '6px';
        trackContactForm('form_error', 'network_error');
      } finally {
        // STEP 8: Reset button state
        submitBtn.disabled = false;             // Re-enable submit button
        btnText.style.display = 'inline';       // Show submit text
        btnLoading.style.display = 'none';     // Hide loading text
      }

      return false;                             // Extra guard against navigation
    }

    // Attach form submission handler
    form.addEventListener('submit', submitForm);
  }

  /* ================================================
     9. BROWSER HISTORY MANAGEMENT
     Handle browser back/forward buttons and URL hash navigation
     ================================================ */
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(e) {
    // Get page ID from browser history state or URL hash, fallback to home
    const pageId = e.state?.page || getPageFromHash() || 'home';
    showPage(pageId);                           // Navigate to the appropriate page
  });

  /* ================================================
     10. UTILITY FUNCTIONS
     Helper functions for URL parsing and page initialization
     ================================================ */
  
  /**
   * Extract page ID from URL hash fragment
   * @returns {string|null} Page ID if valid, null otherwise
   */
  function getPageFromHash() {
    const hash = window.location.hash.slice(1);  // Remove # from hash
    const validPages = config.navigation.pages.map(page => page.id); // Get valid pages from config
    return validPages.includes(hash) ? hash : null; // Return only if valid
  }

  /**
   * Initialize the page based on URL hash or default to home
   * Sets up initial browser history state
   */
  function initializePage() {
    const pageId = getPageFromHash() || 'home';   // Get page from URL or default to home
    showPage(pageId);                             // Display the appropriate page
    // Set initial browser history state without triggering navigation
    history.replaceState({page: pageId}, '', window.location.pathname + (pageId !== 'home' ? '#' + pageId : ''));
  }

  /* ================================================
     11. KEYBOARD EVENT HANDLERS & ADDITIONAL MOBILE MENU FEATURES
     Handle keyboard shortcuts, accessibility, and enhanced mobile menu behavior
     ================================================ */
  
  // Handle escape key to close modals AND mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close login modal if open
      if (loginModal && loginModal.classList.contains('active')) {
        closeLoginModal();
      }
      // Close contact modal if open
      if (contactModal && contactModal.classList.contains('active')) {
        closeContactModal();
      }
      // Close mobile menu if open
      if (navList && navList.classList.contains('show')) {
        closeMobileMenu();
      }
    }
  });

  // Close mobile menu when clicking outside of it (improved user experience)
  document.addEventListener('click', function(e) {
    // Check if mobile menu is open
    if (navList && navList.classList.contains('show')) {
      // Check if click was outside the navigation and hamburger button
      if (!navList.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileMenu();
      }
    }
  });

  // Close mobile menu when screen is resized to desktop size (prevents menu staying open)
  window.addEventListener('resize', function() {
    // If screen becomes wider than mobile breakpoint, close mobile menu
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  /* ================================================
     12. ADDITIONAL FEATURES & UTILITIES
     Optional features and compatibility functions
     ================================================ */
  
  // Footer year update (if you have a year element in your footer)
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear(); // Set current year
  }
  
  // Track scroll depth for user engagement
  let maxScrollDepth = 0;
  window.addEventListener('scroll', function() {
    const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
      maxScrollDepth = scrollDepth;
      trackEvent('scroll_depth', 'engagement', `${scrollDepth}%`, scrollDepth);
    }
  });

  /* ================================================
     13. INITIALIZATION & STARTUP
     Initialize the page and complete setup
     ================================================ */
  
  // Populate all dynamic content from configuration
  populateAllContent();
  
  // Initialize the page based on current URL
  initializePage();
  
  // Track initial page load
  trackEvent('site_loaded', 'engagement', 'initial_load');

  console.log('[site.js] initialization complete');
});

/* ================================================
   LEGACY COMPATIBILITY
   Support for older theme.css navigation patterns
   ================================================ */

// Mobile nav drawer toggle for theme.css compatibility
// This provides fallback support if using the older theme.css file
const toggle = document.getElementById('navToggle');      // Alternative toggle button ID
const nav = document.getElementById('siteNav');           // Alternative nav container ID

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');            // Toggle open class
    toggle.setAttribute('aria-expanded', String(open));   // Update ARIA attribute
    nav.setAttribute('aria-hidden', String(!open));       // Update ARIA attribute
  });
}


/**
 * Global carousel controls that can be called from outside
 */
window.nextTestimonial = function() {
  if (window.testimonialsCarousel) {
    window.testimonialsCarousel.goToNext();
  }
};

window.previousTestimonial = function() {
  if (window.testimonialsCarousel) {
    window.testimonialsCarousel.goToPrevious();
  }
};

window.goToTestimonial = function(index) {
  if (window.testimonialsCarousel) {
    window.testimonialsCarousel.goToSlide(index);
  }
};