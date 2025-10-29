/**
 * Page Fit JavaScript
 * Simplified version that relies on CSS for print optimization
 * Standard letter size: 8.5" x 11" = 816px x 1056px at 96 DPI
 */

// Configuration for page dimensions
const PAGE_CONFIG = {
    width: 816,  // 8.5 inches at 96 DPI
    height: 1056, // 11 inches at 96 DPI
    margin: 48,   // 0.5 inch margins
    printWidth: 7.5, // Printable width in inches
    printHeight: 10, // Printable height in inches
};

/**
 * Initialize page fitting on DOM load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Apply print-optimized class immediately
    const container = document.querySelector('.checklist-container');
    if (container) {
        container.classList.add('print-optimized');
        container.style.maxWidth = '7.5in';
    }
    
    // Add print listener to ensure optimization
    window.addEventListener('beforeprint', function() {
        applyPrintOptimization();
    });
});

/**
 * Apply specific optimizations for printing
 */
function applyPrintOptimization() {
    const container = document.querySelector('.checklist-container');
    if (container) {
        container.classList.add('print-optimized');
    }
}

/**
 * Utility function to debounce resize events
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

// Export minimal functions
window.pagefit = {
    config: PAGE_CONFIG
};