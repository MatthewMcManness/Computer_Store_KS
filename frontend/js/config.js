/**
 * ================================================
 * COMPUTER STORE KANSAS - WEBSITE CONFIGURATION
 * ================================================
 * VERSION: 5
 * LAST UPDATED: 2025-09-19
 * CHANGES: Initial configuration system for centralized content management
 * DESCRIPTION: Centralized configuration and content management
 *              This file contains all website content, business information,
 *              and configuration settings. Update this file to change
 *              website content without modifying HTML/CSS files.
 * DEPENDENCIES: None (standalone configuration file, loaded by script.js)
 * 
 * Table of Contents:
 * 1. Site Information & Branding
 * 2. Business Contact Information
 * 3. API Configuration
 * 4. Navigation Structure
 * 5. Service Offerings
 * 6. Protection Plans & Pricing
 * 7. Customer Testimonials
 * 8. Key Highlights & Selling Points
 * 9. Founder Information
 * 10. Meta Information & SEO
 * ================================================
 */

window.siteConfig = {

  /* ================================================
     1. SITE INFORMATION & BRANDING
     Basic site information and branding elements
     ================================================ */
  site: {
    name: "Computer Store Kansas",                    // Main business name
    tagline: "Your Go‑To Technology Center Since 2003", // Hero section tagline
    description: "Count on The Computer Store for all your computer service needs.", // Hero description
    founded: 2003,                                    // Year business was founded
    
    // Image asset paths - update these if you move/rename image files
    assets: {
      logo: "assets/logo.png",                        // Small logo for favicon and nav
      title_graphic: "assets/title.png",             // Large title graphic for hero
      founder_image: "assets/jim.png",               // Founder photo
      plan_image: "assets/silver_plan.png"           // Protection plan promotional image
    }
  },

  /* ================================================
     2. BUSINESS CONTACT INFORMATION
     All contact details and business hours
     Update this section when business information changes
     ================================================ */
  contact: {
    phone: "785‑267‑3223",                           // Main business phone number
    email: "contact@computerstoreks.com",            // Main business email
    address: "2008 SW Gage Blvd, Topeka, KS 66604", // Physical business address
    
    // Business operating hours
    hours: {
      weekdays: "Monday – Friday 10:00 am – 6:00 pm", // Monday through Friday hours
      saturday: "Saturday 10:00 am – 2:00 pm",        // Saturday hours
      sunday: "Closed"                                 // Sunday status
    },
    
    // Combined hours string for display
    hoursDisplay: "Monday&nbsp;–&nbsp;Friday 10:00&nbsp;am&nbsp;–&nbsp;6:00&nbsp;pm<br>Saturday 10:00&nbsp;am&nbsp;–&nbsp;2:00&nbsp;pm"
  },

  /* ================================================
     3. API CONFIGURATION
     External API endpoints and service URLs
     ================================================ */
  api: {
    contact_endpoint: "https://tcs-contact-api.onrender.com/api/contact", // Contact form submission endpoint
    health_endpoint: "https://tcs-contact-api.onrender.com/api/health"    // API health check endpoint
  },

  /* ================================================
     4. NAVIGATION STRUCTURE
     Website navigation configuration and page titles
     ================================================ */
  navigation: {
    pages: [
      {
        id: "home",                                   // Page identifier used in JavaScript
        title: "Home",                               // Display name in navigation
        display_title: "Computer Store Kansas – Home" // Browser tab title
      },
      {
        id: "about",
        title: "About",
        display_title: "Computer Repair – About Us"
      },
      {
        id: "services",
        title: "Services",
        display_title: "Computer Repair – Our Services"
      },
      {
        id: "contact",
        title: "Contact",
        display_title: "Computer Repair – Contact Us"
      }
    ]
  },

  /* ================================================
     5. SERVICE OFFERINGS
     All services offered by the business
     Add/remove/modify services here to update website content
     ================================================ */
  services: {
    // Main services displayed on home page
    main: [
      {
        name: "Computer Service",
        description: "Comprehensive diagnostics, repairs and upgrades for desktops and laptops."
      },
      {
        name: "Protection Plans",
        description: "Flexible plans to safeguard your system from viruses, malware and identity theft."
      },
      {
        name: "New Computer Sales",
        description: "Let our non‑commissioned team help you build or choose the perfect PC for your needs."
      }
    ],
    
    // Detailed services for services page
    detailed: [
      {
        name: "Diagnostics",
        description: "Thorough troubleshooting to identify issues quickly and accurately."
      },
      {
        name: "Virus & Malware Removal",
        description: "Deep cleaning and protection against viruses, spyware and other malware."
      },
      {
        name: "Hardware Repair",
        description: "Replacement of failing components such as hard drives, screens and power supplies."
      },
      {
        name: "Upgrades & Builds",
        description: "Performance upgrades and custom PC builds tailored to your needs and budget."
      }
    ],
    
    // About page - why choose us points
    differentiators: [
      {
        name: "Reliability",
        description: "count on us for dependable repairs and support"
      },
      {
        name: "Personalized approach",
        description: "solutions tailored to your unique needs"
      },
      {
        name: "Timely delivery",
        description: "quick turnaround so you're back up and running"
      },
      {
        name: "High Standards",
        description: "quality workmanship backed by decades of experience"
      }
    ]
  },

  /* ================================================
     6. PROTECTION PLANS & PRICING
     Service plan information and pricing details
     ================================================ */
  plans: {
    silver: {
      name: "Silver Plan",                           // Plan name
      price: 24.99,                                  // Monthly price
      currency: "USD",                               // Currency
      billing: "monthly",                            // Billing frequency
      commitment: "3 months",                        // Minimum commitment period
      
      // List of features included in the plan
      features: [
        "Anti‑virus software",
        "50% off virus removal services",
        "Preventive maintenance service",
        "Limited help desk/remote support",
        "Free in‑store diagnostics and estimates",
        "Performance monitoring and alert service",
        "5% discount on labour, hardware and software"
      ]
    }
  },

  /* ================================================
     7. CUSTOMER TESTIMONIALS
     Customer reviews and feedback
     Add new testimonials here to display on home page
     ================================================ */
  testimonials: [
    {
      text: "Signing up for a Computer Protection Plan from The Computer Store was the best decision I've made in years. My computer has never run better and no more worries about spyware stealing my identity while online!",
      author: "Kristina Jones",
      location: "Topeka"
    },
    {
      text: "When the Big Store told me they'd have to send my PC in and it would be 2–3 weeks, I decided to try a local store. Not only did The Computer Store fix my problem a lot faster, they did so at just under half the cost.",
      author: "Matt",
      location: "Topeka"
    },
    {
      text: "My hard drive stopped working all together and I had no backup. I thought all was lost but the technician managed to get my drive working long enough to get the data onto another drive saving me a lot of headache and money – thank you Computer Store!",
      author: "Andrew",
      location: "Topeka"
    }
  ],

  /* ================================================
     8. KEY HIGHLIGHTS & SELLING POINTS
     Main selling points displayed prominently on home page
     ================================================ */
  highlights: [
    "Friendly, Reliable Service",                    // Highlight 1
    "Locally Owned Since 2003",                     // Highlight 2
    "20+ Years in Business"                          // Highlight 3
  ],

  /* ================================================
     9. FOUNDER INFORMATION
     Information about the business founder
     ================================================ */
  founder: {
    name: "Jim Driggers",                            // Founder's name
    title: "Computer Store Founder",                 // Founder's title
    
    // Founder's story/quote for about section
    quote: "I had seen computer stores come and go and some not run very professionally; I wanted to make sure to build on the best practices learned from my consulting business to offer better and faster service while remaining local. With this business model in place, The Computer Store opened its doors to customers in 2003 and we are the oldest locally owned professional computer retail store in Topeka."
  },

  /* ================================================
     10. PAGE CONTENT
     Specific content for different pages
     ================================================ */
  pageContent: {
    // Home page hero section
    home: {
      hero: {
        title: "Your Go‑To Technology Center Since 2003",
        description: "Count on The Computer Store for all your computer service needs.",
        cta_text: "Get in Touch"
      }
    },
    
    // About page content
    about: {
      hero: {
        title: "About Us",
        description: "Who we are and why we love fixing computers."
      },
      story: "The Computer Store has been proudly serving the Topeka community since 2003. We're passionate about helping our customers get the most out of their technology with fast, friendly and honest service. Our technicians are certified and experienced in working with all major brands and systems. From virus removal and data recovery to upgrades and custom PC builds, we provide a full range of computer services for homes and small businesses. When you work with us, you're not just another ticket – you're part of our community."
    },
    
    // Services page content
    services: {
      hero: {
        title: "Our Services",
        description: "Comprehensive support for your computers and devices."
      }
    },
    
    // Contact page content
    contact: {
      hero: {
        title: "Inquire About Protection Plans",
        description: "Fill out the form below to enquire about our Computer Protection Plans. A three‑month agreement is required."
      }
    }
  },

  /* ================================================
     11. META INFORMATION & SEO
     Website metadata and search engine optimization
     ================================================ */
  meta: {
    copyright: "2025 Computer Store Kansas All rights reserved.", // Footer copyright text
    favicon: "assets/logo.png",                      // Browser tab icon
    theme_color: "#0d6efd"                          // Primary brand color for mobile browsers
  }
};