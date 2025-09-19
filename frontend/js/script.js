/**
 * ================================================
 * COMPUTER STORE KANSAS - CONSOLIDATED JAVASCRIPT
 * ================================================
 * Combines mobile navigation, page switching, modal handling, contact form,
 * and dynamic content management from configuration data
 * 
 * Table of Contents:
 * 1. Initialization & DOM Ready Setup
 * 2. Configuration Data Management
 * 3. Dynamic Content Population
 * 4. Mobile Navigation Toggle
 * 5. Single-Page App Navigation System
 * 6. Login Modal Functionality
 * 7. Contact Form Handling
 * 8. Browser History Management
 * 9. Utility Functions
 * 10. Event Listeners & Initialization
 * ================================================ */

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
     3. DYNAMIC CONTENT POPULATION
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
  function populateTestimonials() {
    const testimonialsContainer = document.querySelector('.testimonials .container');
    if (!testimonialsContainer) return;

    // Keep the heading, remove existing testimonials
    const heading = testimonialsContainer.querySelector('h2');
    testimonialsContainer.innerHTML = '';
    if (heading) {
      testimonialsContainer.appendChild(heading);
    }

    // Create testimonial elements from configuration data
    config.testimonials.forEach(testimonial => {
      const testimonialElement = document.createElement('div');
      testimonialElement.className = 'testimonial';
      testimonialElement.innerHTML = `
        <p>"${testimonial.text}"</p>
        <h4>– ${testimonial.author}, ${testimonial.location}</h4>
      `;
      testimonialsContainer.appendChild(testimonialElement);
    });
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
    const membershipText = document.querySelector('.membership-text');
    if (!membershipText) return;

    const silverPlan = config.plans.silver;
    
    // Update plan description
    const planDescription = membershipText.querySelector('p');
    if (planDescription) {
      planDescription.innerHTML = `Our ${silverPlan.name} provides comprehensive care for your computer. For only ${silverPlan.price} per month (with a ${silverPlan.commitment} commitment), you'll receive:`;
    }

    // Update features list
    const featuresList = membershipText.querySelector('.membership-features');
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
     4. MOBILE NAVIGATION TOGGLE
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
      } else {
        // Menu is now closed - change back to hamburger icon
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-label', 'Open menu');  // Accessibility
        hamburger.setAttribute('aria-expanded', 'false');   // Screen reader support
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
     5. SINGLE-PAGE APP NAVIGATION SYSTEM
     Core function to switch between different page sections
     ================================================ */
  
  /**
   * Show a specific page and update navigation states
   * @param {string} pageId - The ID of the page to show (home, about, services, contact)
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
    } else {
      document.title = config.site.name; // Fallback to site name
    }
    
    // STEP 6: Close mobile menu if it's open (using our helper function)
    closeMobileMenu();
    
    // STEP 7: Scroll to top for better user experience
    window.scrollTo(0, 0);
    
    // STEP 8: Update browser history for back/forward button support
    history.pushState({page: pageId}, '', window.location.pathname + (pageId !== 'home' ? '#' + pageId : ''));
  }

  /* ================================================
     NAVIGATION LINK EVENT LISTENERS
     Attach click handlers to all navigation links
     ================================================ */
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();                           // Prevent default link behavior
      const pageId = this.getAttribute('data-page'); // Get target page ID
      if (pageId) {
        showPage(pageId);                           // Switch to target page
      }
    });
  });

  /* ================================================
     6. LOGIN MODAL FUNCTIONALITY
     Handle employee login modal display and interaction
     ================================================ */
  
  // Get references to modal elements
  const loginBtn = document.getElementById('login-btn');        // Employee Login button
  const loginModal = document.getElementById('login-modal');    // Modal container
  const modalClose = document.getElementById('modal-close');    // Close button (X)
  const backToHome = document.getElementById('back-to-home');   // Back to Home button

  // Show modal when Employee Login is clicked
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();                       // Prevent default link behavior
      loginModal.classList.add('active');      // Show the modal
    });
  }

  /**
   * Close the login modal and remove from display
   */
  function closeModal() {
    if (loginModal) {
      loginModal.classList.remove('active');   // Hide the modal
    }
  }

  // Close modal when X button is clicked
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal and return to home when "Back to Home" is clicked
  if (backToHome) {
    backToHome.addEventListener('click', function(e) {
      e.preventDefault();                       // Prevent default link behavior
      closeModal();                             // Close the modal first
      showPage('home');                         // Navigate to home page
    });
  }

  // Close modal when clicking outside the modal content (on backdrop)
  if (loginModal) {
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) {            // Check if click was on backdrop
        closeModal();                           // Close the modal
      }
    });
  }

  /* ================================================
     7. CONTACT FORM HANDLING
     Handle contact form submission and API communication using config data
     ================================================ */
  
  // Get references to form elements
  const form = document.getElementById('contactForm');          // Contact form
  const statusEl = document.getElementById('formStatus');       // Status message display

  if (form && statusEl) {
    /**
     * Handle contact form submission using API endpoint from configuration
     * @param {Event} e - Form submit event
     */
    async function submitForm(e) {
      e.preventDefault();                       // Prevent default form submission
      console.log('[site.js] submit fired');

      // STEP 1: Extract form data
      const data = Object.fromEntries(new FormData(form).entries());
      
      // STEP 2: Show loading state
      statusEl.textContent = 'Sending...';
      statusEl.style.color = '#666';            // Grey color for loading state

      try {
        // STEP 3: Send data to API using endpoint from configuration
        const res = await fetch(config.api.contact_endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        // STEP 4: Handle API response
        // Read raw text first to surface non-JSON errors
        const text = await res.text();
        let payload;
        try {
          payload = JSON.parse(text);           // Try to parse as JSON
        } catch {
          payload = { errorText: text };        // Fallback for non-JSON responses
        }

        // STEP 5: Display result to user
        if (res.ok) {
          // SUCCESS: Show success message and reset form
          statusEl.textContent = 'Thanks! We\'ll be in touch soon.';
          statusEl.style.color = '#28a745';     // Green color for success
          form.reset();                         // Clear form fields
        } else {
          // ERROR: Show error message
          statusEl.textContent = payload?.error || payload?.errorText || 'Something went wrong. Please try again.';
          statusEl.style.color = '#dc3545';     // Red color for error
        }
      } catch (err) {
        // NETWORK ERROR: Handle fetch failures
        console.error('[site.js] fetch error', err);
        statusEl.textContent = 'Network error. Please try again.';
        statusEl.style.color = '#dc3545';       // Red color for error
      }

      return false;                             // Extra guard against navigation
    }

    // Attach form submission handler
    form.addEventListener('submit', submitForm);
  }

  /* ================================================
     8. BROWSER HISTORY MANAGEMENT
     Handle browser back/forward buttons and URL hash navigation
     ================================================ */
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(e) {
    // Get page ID from browser history state or URL hash, fallback to home
    const pageId = e.state?.page || getPageFromHash() || 'home';
    showPage(pageId);                           // Navigate to the appropriate page
  });

  /* ================================================
     9. UTILITY FUNCTIONS
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
     10. KEYBOARD EVENT HANDLERS & ADDITIONAL MOBILE MENU FEATURES
     Handle keyboard shortcuts, accessibility, and enhanced mobile menu behavior
     ================================================ */
  
  // Handle escape key to close modal AND mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close login modal if open
      if (loginModal && loginModal.classList.contains('active')) {
        closeModal();
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
     11. ADDITIONAL FEATURES & UTILITIES
     Optional features and compatibility functions
     ================================================ */
  
  // Footer year update (if you have a year element in your footer)
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear(); // Set current year
  }

  /* ================================================
     12. INITIALIZATION & STARTUP
     Initialize the page and complete setup
     ================================================ */
  
  // Populate all dynamic content from configuration
  populateAllContent();
  
  // Initialize the page based on current URL
  initializePage();

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