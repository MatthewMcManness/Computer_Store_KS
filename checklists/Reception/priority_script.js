/**
 * Priority List JavaScript
 * Simplified version for print - relies on CSS for page fitting
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
 * Initialize page on DOM load
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
    
    // Initialize checkbox interactions (for digital use if needed)
    initializeCheckboxes();
});

/**
 * Initialize checkbox click handlers
 */
function initializeCheckboxes() {
    // Main checkboxes (only for items that have them)
    const mainCheckboxes = document.querySelectorAll('.checklist-item:not(.no-checkbox) .checkbox');
    mainCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            toggleCheckbox(this);
            checkCompletionStatus();
        });
    });
    
    // Sub-checkboxes
    const subCheckboxes = document.querySelectorAll('.sub-checkbox');
    subCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            toggleCheckbox(this);
            checkSubTaskCompletion(this);
        });
    });
}

/**
 * Toggle checkbox state
 */
function toggleCheckbox(checkbox) {
    checkbox.classList.toggle('checked');
    
    // Save state to localStorage
    saveChecklistState();
}

/**
 * Check if all sub-tasks are complete
 */
function checkSubTaskCompletion(subCheckbox) {
    const parentItem = subCheckbox.closest('.checklist-item');
    
    // Skip if this item doesn't have a main checkbox (ongoing tasks)
    if (parentItem.classList.contains('no-checkbox')) {
        return;
    }
    
    const subChecks = parentItem.querySelectorAll('.sub-checkbox');
    const mainCheckbox = parentItem.querySelector('.checkbox');
    
    if (!mainCheckbox) return;
    
    // Check if all sub-tasks are checked
    const allChecked = Array.from(subChecks).every(cb => cb.classList.contains('checked'));
    
    if (allChecked && !mainCheckbox.classList.contains('checked')) {
        // Auto-check main task if all sub-tasks complete
        mainCheckbox.classList.add('checked');
        checkCompletionStatus();
    }
}

/**
 * Check overall completion status
 */
function checkCompletionStatus() {
    // Only count checkboxes from items that aren't "no-checkbox"
    const checkableItems = document.querySelectorAll('.checklist-item:not(.no-checkbox)');
    const allCheckboxes = document.querySelectorAll('.checklist-item:not(.no-checkbox) .checkbox');
    const checkedBoxes = document.querySelectorAll('.checklist-item:not(.no-checkbox) .checkbox.checked');
    
    // Update visual state of completed items
    allCheckboxes.forEach(checkbox => {
        const parentItem = checkbox.closest('.checklist-item');
        if (checkbox.classList.contains('checked')) {
            parentItem.classList.add('completed');
        } else {
            parentItem.classList.remove('completed');
        }
    });
    
    // Check if all checkable tasks complete (priorities 3-6)
    if (allCheckboxes.length > 0 && checkedBoxes.length === allCheckboxes.length) {
        showCompletionMessage();
    }
}

/**
 * Show completion message
 */
function showCompletionMessage() {
    // For print version, this is optional but kept for digital use
    // Since current-block was removed, append to content area instead
    const content = document.querySelector('.content');
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.style.cssText = `
        background: #10b981;
        color: white;
        padding: 10px;
        border-radius: 5px;
        margin: 20px 0;
        text-align: center;
        font-weight: 600;
    `;
    message.textContent = '✓ All checkable priorities (3-6) complete!';
    
    // Remove any existing message
    const existing = content.querySelector('.completion-message');
    if (existing) existing.remove();
    
    // Add at top of content
    content.insertBefore(message, content.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

/**
 * Save checklist state to localStorage (optional for digital use)
 */
function saveChecklistState() {
    const state = {
        timestamp: new Date().toISOString(),
        checkboxes: []
    };
    
    // Save all checkbox states
    const allCheckboxes = document.querySelectorAll('.checkbox, .sub-checkbox');
    allCheckboxes.forEach((checkbox, index) => {
        state.checkboxes.push({
            index: index,
            checked: checkbox.classList.contains('checked')
        });
    });
    
    localStorage.setItem('checklistState', JSON.stringify(state));
}

/**
 * Apply specific optimizations for printing
 */
function applyPrintOptimization() {
    const container = document.querySelector('.checklist-container');
    if (container) {
        container.classList.add('print-optimized');
    }
}

// Export minimal functions
window.pagefit = {
    config: PAGE_CONFIG
};