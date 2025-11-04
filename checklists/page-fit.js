/**
 * Page Fit JavaScript - Enhanced with Dynamic Auto-Resizing
 * Automatically scales content to fill one page while remaining readable
 * Standard letter size: 8.5" x 11" = 816px x 1056px at 96 DPI
 */

// Configuration for page dimensions
const PAGE_CONFIG = {
    width: 816,  // 8.5 inches at 96 DPI
    height: 1056, // 11 inches at 96 DPI
    margin: 48,   // 0.5 inch margins (48px = 0.5" at 96 DPI)
    printWidth: 7.5, // Printable width in inches
    printHeight: 10, // Printable height in inches
    maxPrintHeight: 960, // 10 inches in pixels at 96 DPI
    minFontSize: 9,  // Minimum font size in px
    maxFontSize: 24, // Maximum font size in px (reduced from 26 to be safer)
    baseFontSize: 16, // Starting font size
    tolerance: 0, // No tolerance - strict one-page fitting
    printSafetyMargin: 30 // Extra margin for print vs screen differences
};

/**
 * Initialize page fitting on DOM load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Fit: Initializing...');
    
    // Apply initial optimization
    const container = document.querySelector('.checklist-container');
    if (container) {
        container.classList.add('print-optimized');
        
        // Wait for fonts and layout to load, then resize
        setTimeout(() => {
            resizeToFitPage(container);
        }, 300); // Increased from 100ms to ensure full layout
    }
    
    // Add print listener to ensure optimization before printing
    window.addEventListener('beforeprint', function() {
        console.log('Page Fit: Preparing for print...');
        applyPrintOptimization();
    });
    
    // Optional: Re-calculate on window resize (debounced)
    window.addEventListener('resize', debounce(() => {
        if (container) {
            resizeToFitPage(container);
        }
    }, 250));
});

/**
 * Main function: Dynamically resize content to fit one page
 */
function resizeToFitPage(container) {
    if (!container) return;
    
    console.log('Page Fit: Starting dynamic resize...');
    
    // Get the available height with print safety margin
    // 10" minus safety margin for print vs screen differences
    const maxHeight = PAGE_CONFIG.maxPrintHeight - PAGE_CONFIG.printSafetyMargin + PAGE_CONFIG.tolerance;
    
    // Binary search for optimal font size
    let low = PAGE_CONFIG.minFontSize;
    let high = PAGE_CONFIG.maxFontSize;
    let optimalSize = PAGE_CONFIG.minFontSize;
    let iterations = 0;
    const maxIterations = 20;
    
    while (low <= high && iterations < maxIterations) {
        const mid = Math.floor((low + high) / 2);
        setBaseFontSize(container, mid);
        
        const contentHeight = container.scrollHeight;
        
        console.log(`  Iteration ${iterations + 1}: Testing ${mid}px -> Height: ${contentHeight}px (Max: ${maxHeight}px)`);
        
        if (contentHeight <= maxHeight) {
            // Fits! Try larger
            optimalSize = mid;
            low = mid + 1;
        } else {
            // Too big, try smaller
            high = mid - 1;
        }
        
        iterations++;
    }
    
    // Verify: Try one size larger to ensure we're at the maximum (conservative)
    console.log(`\n  Verifying optimal size ${optimalSize}px...`);
    setBaseFontSize(container, optimalSize);
    const optimalHeight = container.scrollHeight;
    console.log(`  At ${optimalSize}px: Height = ${optimalHeight}px (${maxHeight - optimalHeight}px under limit)`);
    
    // Test just ONE size larger (conservative approach to prevent overflow)
    let foundLarger = false;
    const testSize = optimalSize + 1;
    if (testSize <= PAGE_CONFIG.maxFontSize) {
        setBaseFontSize(container, testSize);
        const testHeight = container.scrollHeight;
        const overflow = testHeight - maxHeight;
        console.log(`  At ${testSize}px: Height = ${testHeight}px (${overflow > 0 ? 'over by ' + overflow : 'under by ' + Math.abs(overflow)}px)`);
        
        if (testHeight <= maxHeight) {
            console.log(`  ✓ ${testSize}px FITS! Upgrading to this size.`);
            optimalSize = testSize;
            foundLarger = true;
        } else {
            console.log(`  ✗ ${testSize}px overflows. Keeping ${optimalSize}px for safety.`);
        }
    }
    
    // Set final optimal size
    if (!foundLarger) {
        setBaseFontSize(container, optimalSize);
    }
    
    // Final report
    const finalHeight = container.scrollHeight;
    const unusedSpace = maxHeight - finalHeight;
    const actualPrintLimit = PAGE_CONFIG.maxPrintHeight;
    const safetyMargin = PAGE_CONFIG.printSafetyMargin;
    
    console.log(`\n✓ Page Fit: Final font size is ${optimalSize}px (${iterations} iterations)`);
    console.log(`  Final height: ${finalHeight}px / ${maxHeight}px (target with safety)`);
    console.log(`  Actual print limit: ${actualPrintLimit}px (10 inches)`);
    console.log(`  Print safety margin: ${safetyMargin}px (screen vs print buffer)`);
    console.log(`  Space from target: ${unusedSpace}px`);
    console.log(`  Space from absolute limit: ${actualPrintLimit - finalHeight}px`);
    
    if (finalHeight > actualPrintLimit) {
        console.error(`  ⚠️ WARNING: Content exceeds print limit by ${finalHeight - actualPrintLimit}px! Will overflow to 2 pages.`);
    } else if (unusedSpace > 50) {
        console.warn(`  ℹ️ Note: ${unusedSpace}px unused space. Could potentially fit larger text.`);
    } else {
        console.log(`  ✓ Perfect fit! Content safely within one page.`);
    }
    
    // Store the optimal size for print
    container.setAttribute('data-optimal-font-size', optimalSize);
    
    // Add visual indicator (hidden on print)
    addSizeIndicator(container, optimalSize);
}

/**
 * Set the base font size and scale all related elements proportionally
 */
function setBaseFontSize(container, fontSize) {
    // Set the base font size on the container
    container.style.fontSize = fontSize + 'px';
    
    // Scale specific elements proportionally
    const header = container.querySelector('.header h1');
    const subheader = container.querySelector('.header p');
    const taskNumbers = container.querySelectorAll('.task-number');
    const checkboxes = container.querySelectorAll('.checkbox');
    const subCheckboxes = container.querySelectorAll('.sub-checkbox');
    
    if (header) {
        // Reduce title multiplier: was 1.8x, now 1.5x for better balance
        header.style.fontSize = (fontSize * 1.5) + 'px';
        header.style.marginBottom = Math.max(4, fontSize * 0.25) + 'px';
    }
    
    if (subheader) {
        // Keep subtitle at 0.85x for better readability
        subheader.style.fontSize = (fontSize * 0.85) + 'px';
    }
    
    taskNumbers.forEach(num => {
        num.style.fontSize = (fontSize * 0.75) + 'px';
        num.style.padding = `${Math.max(2, fontSize * 0.15)}px ${Math.max(6, fontSize * 0.4)}px`;
    });
    
    // Scale checkbox sizes
    const checkboxSize = Math.max(14, fontSize * 1.1);
    checkboxes.forEach(cb => {
        cb.style.width = checkboxSize + 'px';
        cb.style.height = checkboxSize + 'px';
        cb.style.minWidth = checkboxSize + 'px';
        // Tighter right margin
        cb.style.marginRight = Math.max(8, fontSize * 0.5) + 'px';
        cb.style.marginTop = Math.max(2, fontSize * 0.15) + 'px';
    });
    
    const subCheckboxSize = Math.max(10, fontSize * 0.85);
    subCheckboxes.forEach(cb => {
        cb.style.width = subCheckboxSize + 'px';
        cb.style.height = subCheckboxSize + 'px';
        cb.style.minWidth = subCheckboxSize + 'px';
        // Tighter right margin
        cb.style.marginRight = Math.max(6, fontSize * 0.4) + 'px';
    });
    
    // Adjust line height for tighter text
    container.style.lineHeight = '1.4';
    
    // Adjust task text line height
    const taskTexts = container.querySelectorAll('.task-text');
    taskTexts.forEach(tt => {
        tt.style.lineHeight = '1.3';
    });
    
    const subTexts = container.querySelectorAll('.sub-text');
    subTexts.forEach(st => {
        st.style.lineHeight = '1.3';
    });
    
    // Adjust spacing proportionally - AGGRESSIVE scaling for larger text
    const content = container.querySelector('.content');
    if (content) {
        // Much tighter padding: was fontSize * 2, now fontSize * 1.2
        const contentPadding = Math.max(12, fontSize * 1.2);
        content.style.padding = `${contentPadding}px ${contentPadding * 1.2}px`;
    }
    
    const items = container.querySelectorAll('.checklist-item');
    items.forEach(item => {
        // Tighter margins: was fontSize * 1.3, now fontSize * 0.7
        item.style.marginBottom = Math.max(8, fontSize * 0.7) + 'px';
        // Tighter padding: was fontSize * 1.2, now fontSize * 0.8
        item.style.padding = Math.max(8, fontSize * 0.8) + 'px';
    });
    
    const subTasks = container.querySelectorAll('.sub-tasks');
    subTasks.forEach(st => {
        // Tighter top margin: was fontSize * 0.6, now fontSize * 0.4
        st.style.marginTop = Math.max(4, fontSize * 0.4) + 'px';
        // Reduce left padding
        st.style.paddingLeft = Math.max(8, fontSize * 0.6) + 'px';
    });
    
    const mainTasks = container.querySelectorAll('.main-task');
    mainTasks.forEach(mt => {
        // Tighter bottom margin
        mt.style.marginBottom = Math.max(4, fontSize * 0.4) + 'px';
    });
    
    const subTaskItems = container.querySelectorAll('.sub-task');
    subTaskItems.forEach(st => {
        // Tighter spacing between sub-tasks
        st.style.marginBottom = Math.max(4, fontSize * 0.35) + 'px';
        st.style.padding = `${Math.max(2, fontSize * 0.2)}px 0`;
    });
    
    // Tighten header padding
    const headerContainer = container.querySelector('.header');
    if (headerContainer) {
        headerContainer.style.padding = Math.max(10, fontSize * 0.8) + 'px';
    }
    
    // Tighten footer padding
    const footer = container.querySelector('.footer');
    if (footer) {
        footer.style.padding = `${Math.max(8, fontSize * 0.6)}px ${Math.max(12, fontSize * 1.2)}px`;
    }
}

/**
 * Add a visual indicator showing the current font size (hidden on print)
 */
function addSizeIndicator(container, fontSize) {
    // Remove existing indicator if present
    const existing = document.getElementById('fontSizeIndicator');
    if (existing) {
        existing.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'fontSizeIndicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(255, 243, 205, 0.95);
        border: 2px solid #f59e0b;
        padding: 8px 15px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #92400e;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: 'Segoe UI', sans-serif;
    `;
    indicator.textContent = `✓ Auto-sized: ${fontSize}px`;
    document.body.appendChild(indicator);
}

/**
 * Apply specific optimizations for printing
 */
function applyPrintOptimization() {
    const container = document.querySelector('.checklist-container');
    if (container) {
        container.classList.add('print-optimized');
        
        // Re-apply the optimal font size for print
        const optimalSize = container.getAttribute('data-optimal-font-size');
        if (optimalSize) {
            setBaseFontSize(container, parseInt(optimalSize));
        }
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

/**
 * Manual trigger for resizing (can be called from console or button)
 */
function triggerResize() {
    const container = document.querySelector('.checklist-container');
    if (container) {
        resizeToFitPage(container);
    }
}

// Export functions for external use
window.pagefit = {
    config: PAGE_CONFIG,
    resize: triggerResize,
    setFontSize: (size) => {
        const container = document.querySelector('.checklist-container');
        if (container) {
            setBaseFontSize(container, size);
        }
    }
};

console.log('Page Fit: Script loaded. Auto-resize will trigger on page load.');
