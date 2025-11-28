// Admin Gallery Manager JavaScript
// Handles loading, editing, and saving computer gallery data

/**
 * HTML Sanitization to prevent XSS attacks
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// API Configuration - auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'  // Local development
    : 'https://computer-store-gallery-api.onrender.com'; // Production (update after deploying)

console.log('Using API URL:', API_URL);

// State management
let computers = [];
let selectedComputer = null;
let hasUnsavedChanges = false;
let currentFilter = 'all';
let blackFridayEnabled = false;

// Authentication check
function checkAuth() {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    const loginTime = parseInt(sessionStorage.getItem('admin_login_time') || '0');
    const currentTime = Date.now();

    // Session expires after 8 hours
    if (!isAuth || (currentTime - loginTime > 28800000)) {
        sessionStorage.removeItem('admin_authenticated');
        sessionStorage.removeItem('admin_login_time');
        window.location.href = 'https://computer-store-ks.onrender.com/admin/login';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
            return;
        }
    }
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    window.location.href = 'https://computer-store-ks.onrender.com/admin/login';
}

// Migration function is loaded from spec-migration.js

// Force reload from server (clears cache)
function forceReload() {
    if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to discard them and reload from the server?')) {
            return;
        }
    }
    console.log('🔄 Force reload: Clearing ALL sessionStorage...');
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared. Reloading page...');
    // Force a hard reload to bypass any caching
    location.reload(true);
}

// Load computers from index.html
async function loadComputers() {
    try {
        console.log('🚀 loadComputers() called');
        console.log('   SessionStorage keys:', Object.keys(sessionStorage));

        // Check if we have unsaved changes in sessionStorage (coming back from add/edit page)
        const hasUnsaved = sessionStorage.getItem('hasUnsavedChanges') === 'true';
        const storedComputers = sessionStorage.getItem('computers');

        console.log('   hasUnsavedChanges flag:', hasUnsaved);
        console.log('   Has stored computers:', !!storedComputers);

        if (hasUnsaved && storedComputers) {
            console.log('📦 ⚠️  Loading from sessionStorage with unsaved changes...');
            // Load from sessionStorage instead of index.html
            computers = JSON.parse(storedComputers);
            console.log('Before migration:', computers.map(c => ({ name: c.name, specCount: c.specs.length })));
            // Migrate specs to fix any old format issues
            console.log('🔧 Starting migration for sessionStorage computers...\n');
            computers = computers.map(computer => ({
                ...computer,
                specs: migrateSpecs(computer.specs, computer.name)
            }));
            console.log('✅ Migration complete for sessionStorage\n');
            console.log('After migration:', computers.map(c => ({ name: c.name, specCount: c.specs.length, specs: c.specs })));
            // Save migrated data back to sessionStorage
            sessionStorage.setItem('computers', JSON.stringify(computers));
            hasUnsavedChanges = true;
            document.getElementById('publish-btn').disabled = false;
            renderGallery();
            showToast('Loaded your unpublished changes (migrated spec format)', 'success');
            return;
        }

        console.log('📄 Loading computers from index.html...');
        const response = await fetch('index.html');
        const html = await response.text();
        console.log('✅ Fetched index.html, length:', html.length);

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Find all gallery cards
        const cards = doc.querySelectorAll('.gallery-card');
        computers = [];

        cards.forEach((card, index) => {
            const computer = {
                id: index,
                name: card.querySelector('.gallery-card-title')?.textContent.trim() || '',
                type: card.getAttribute('data-type') || '',
                price: card.querySelector('.gallery-card-price')?.textContent.trim() || '',
                image: card.querySelector('.gallery-card-image img')?.src || '',
                category: '', // Will be determined from badge or data-category
                specs: []
            };

            // Check for Black Friday pricing
            const originalPriceEl = card.querySelector('.original-price');
            const salePriceEl = card.querySelector('.sale-price');
            const savingsBadgeEl = card.querySelector('.savings-badge');

            if (originalPriceEl && salePriceEl && savingsBadgeEl) {
                // This is a Black Friday item
                const discountText = savingsBadgeEl.textContent.match(/(\d+)%/);
                const discount = discountText ? parseInt(discountText[1]) : 10;

                computer.blackFriday = {
                    enabled: true,
                    originalPrice: originalPriceEl.textContent.trim(),
                    salePrice: salePriceEl.textContent.trim(),
                    discount: discount
                };
                // Set price to original for editing purposes
                computer.price = originalPriceEl.textContent.trim();
            }

            // Get category from data-category attribute or badge
            const dataCategory = card.getAttribute('data-category');
            if (dataCategory) {
                computer.category = dataCategory;
            } else {
                const badge = card.querySelector('[class*="badge-"]');
                if (badge) {
                    if (badge.classList.contains('badge-custom')) {
                        computer.category = 'custom';
                    } else if (badge.classList.contains('badge-refurbished')) {
                        computer.category = 'refurbished';
                    } else if (badge.classList.contains('badge-new')) {
                        computer.category = 'new';
                    } else if (badge.classList.contains('badge-black-friday')) {
                        computer.category = 'refurbished'; // Black Friday items are refurbished
                    }
                }
            }

            // Get specs from gallery-card-specs section
            const warrantyLabels = ['Parts Warranty', 'Manufacturer Warranty', 'Free Diagnostics'];
            const specItems = card.querySelectorAll('.gallery-card-specs .spec-item');
            specItems.forEach(item => {
                const strongs = item.querySelectorAll('strong');

                // Check if this is a warranty spec (2 strong tags, no colon)
                if (strongs.length === 2) {
                    const value = strongs[0].textContent.trim();
                    const label = strongs[1].textContent.trim();
                    if (label && value) {
                        computer.specs.push({ label, value });
                    }
                }
                // Normal spec (1 strong tag with colon)
                else if (strongs.length === 1) {
                    const strong = strongs[0];
                    // Normalize the label by trimming and removing trailing colons
                    const label = strong.textContent.trim().replace(/::?$/, '');

                    // Extract value by getting all text content after the strong element
                    const fullText = item.textContent.trim();

                    // Remove the label and any following colons/whitespace to get the value
                    const value = fullText.replace(label, '').replace(/^::?\s*/, '').trim();
                    if (label && value) {
                        computer.specs.push({ label, value });
                    }
                }
            });

            computers.push(computer);
        });

        // Migrate loaded computers to fix any spec issues
        console.log('🔧 Starting migration for all loaded computers...\n');
        computers = computers.map(computer => ({
            ...computer,
            specs: migrateSpecs(computer.specs, computer.name)
        }));
        console.log('✅ Migration complete for all computers\n');

        // Save to sessionStorage for add/edit pages to use
        sessionStorage.setItem('computers', JSON.stringify(computers));

        renderGallery();
        showToast('Gallery loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading computers:', error);
        showToast('Error loading gallery. Please refresh the page.', 'error');
    }
}

// Render gallery grid
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const emptyState = document.getElementById('empty-state');

    // Filter computers
    let filtered = computers;
    if (currentFilter !== 'all') {
        filtered = computers.filter(c => {
            if (currentFilter === 'desktop' || currentFilter === 'laptop') {
                return c.type === currentFilter;
            } else {
                return c.category === currentFilter;
            }
        });
    }

    // Show empty state if no results
    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Render cards
    grid.innerHTML = filtered.map(computer => {
        // Determine badge based on Black Friday status
        let badgeClass, badgeText;
        if (computer.blackFriday && computer.blackFriday.enabled) {
            badgeClass = 'badge-black-friday';
            badgeText = 'Black Friday Sale';
        } else {
            badgeClass = computer.category === 'custom' ? 'badge-custom' :
                          computer.category === 'new' ? 'badge-new' : 'badge-refurbished';
            // Show "New" for laptops with custom category, otherwise use normal labels
            if (computer.category === 'custom' && computer.type === 'laptop') {
                badgeText = 'New';
            } else {
                badgeText = computer.category === 'custom' ? 'Custom Build' :
                             computer.category === 'new' ? 'New' : 'Refurbished';
            }
        }

        // Determine price display
        let priceHTML;
        if (computer.blackFriday && computer.blackFriday.enabled) {
            priceHTML = `
                <div class="card-price">
                    <span class="original-price">${computer.blackFriday.originalPrice}</span>
                    <span class="sale-price">${computer.blackFriday.salePrice}</span>
                    <span class="savings-badge">Save ${computer.blackFriday.discount}%</span>
                </div>
            `;
        } else {
            priceHTML = `<div class="card-price">${computer.price}</div>`;
        }

        // Show all specs (no limit)
        const warrantyLabels = ['Parts Warranty', 'Manufacturer Warranty', 'Free Diagnostics'];
        const specsHTML = computer.specs.map(spec => {
            const label = spec.label.replace(/::?$/, '').trim();

            // Check if this is a warranty spec - display in special format
            if (warrantyLabels.includes(label)) {
                // Check if Black Friday is active and we have original warranty values
                let warrantyHTML = '';
                if (computer.blackFriday && computer.blackFriday.enabled) {
                    const originalValue = label === 'Parts Warranty'
                        ? computer.blackFriday.originalPartsWarranty
                        : (label === 'Free Diagnostics' ? computer.blackFriday.originalFreeDiagnostics : null);

                    if (originalValue) {
                        // Show crossed-out original and new value
                        warrantyHTML = `
            <div class="spec-item">
                <strong style="text-decoration: line-through; opacity: 0.6;">${originalValue}</strong>
                <strong style="color: #f6ad55;">${spec.value}</strong>
                <strong>${label}</strong>
            </div>
        `;
                    } else {
                        // No original value, just show current
                        warrantyHTML = `
            <div class="spec-item">
                <strong>${spec.value}</strong> <strong>${label}</strong>
            </div>
        `;
                    }
                } else {
                    // Normal warranty display
                    warrantyHTML = `
            <div class="spec-item">
                <strong>${spec.value}</strong> <strong>${label}</strong>
            </div>
        `;
                }
                return warrantyHTML;
            } else {
                // Normal spec - label: value format
                return `
            <div class="spec-item">
                <strong>${label}:</strong> ${spec.value}
            </div>
        `;
            }
        }).join('');

        const ribbonHTML = (computer.blackFriday && computer.blackFriday.enabled) ?
            '<div class="bf-ribbon-corner"></div>' : '';

        return `
            <div class="computer-card" data-id="${computer.id}" onclick="selectCard(${computer.id})">
                <div class="card-image">
                    ${ribbonHTML}
                    <img src="${computer.image}" alt="${computer.name}" style="width: 100%; height: 220px; object-fit: cover; background: #f7fafc;" onerror="this.src='./assets/placeholder.jpg'">
                    <div class="card-badge ${badgeClass}">${badgeText}</div>
                </div>
                <div class="card-content">
                    <div class="card-type">${computer.type}</div>
                    <div class="card-name">${computer.name}</div>
                    ${priceHTML}
                    <div class="card-specs">
                        ${specsHTML}
                    </div>
                    <button class="btn-flyer" onclick="event.stopPropagation(); generateFlyer(${computer.id})" title="Generate sales flyer">
                        🖨️ Make Flyer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Select a card
function selectCard(id) {
    // Remove previous selection
    document.querySelectorAll('.computer-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.classList.add('selected');
        selectedComputer = computers.find(c => c.id === id);

        // Enable edit/delete buttons
        document.getElementById('edit-btn').disabled = false;
        document.getElementById('delete-btn').disabled = false;
    }
}

// Edit selected computer
function editSelected() {
    if (selectedComputer) {
        // Save current computers to sessionStorage for the edit page
        sessionStorage.setItem('computers', JSON.stringify(computers));
        // Redirect to edit page with computer ID
        window.location.href = `computer-form.html?id=${selectedComputer.id}`;
    }
}

// Delete selected computer
function deleteSelected() {
    if (selectedComputer) {
        deleteComputer(selectedComputer.id);
        document.getElementById('edit-btn').disabled = true;
        document.getElementById('delete-btn').disabled = true;
    }
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderGallery();
    });
});

// Delete computer
function deleteComputer(id) {
    if (!confirm('Are you sure you want to delete this computer?')) {
        return;
    }

    computers = computers.filter(c => c.id !== id);
    selectedComputer = null;
    hasUnsavedChanges = true;
    document.getElementById('publish-btn').disabled = false;

    renderGallery();
    showToast('Computer deleted successfully!', 'success');
}

// Publish changes to GitHub
async function publishChanges() {
    if (!hasUnsavedChanges) {
        showToast('No changes to publish', 'error');
        return;
    }

    if (!confirm('This will update the live website. Continue?')) {
        return;
    }

    const publishBtn = document.getElementById('publish-btn');
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span class="spinner"></span> Publishing...';

    try {
        console.log('🚀 Starting publish process...');

        // Generate updated HTML
        console.log('📝 Generating updated HTML...');
        const updatedHTML = await generateHTML();
        console.log('✅ HTML generated, length:', updatedHTML.length);

        // Get admin password from session
        const password = sessionStorage.getItem('admin_password');
        console.log('🔑 Using password:', password ? '***' + password.slice(-3) : 'NO PASSWORD');

        const requestBody = {
            htmlContent: updatedHTML,
            commitMessage: 'Update gallery via Web Gallery Manager'
        };
        console.log('📤 Request body size:', JSON.stringify(requestBody).length);

        // Call API to update and commit
        console.log('🌐 Calling API at:', `${API_URL}/api/gallery/update`);
        const response = await fetch(`${API_URL}/api/gallery/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${password}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 Publish response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API error response:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Publish result:', result);

        if (result.success) {
            showToast('Changes published successfully! Website will update in 2-3 minutes.', 'success');
            hasUnsavedChanges = false;
            // Clear sessionStorage flags since changes are now published
            sessionStorage.removeItem('hasUnsavedChanges');
            publishBtn.disabled = true;
            publishBtn.innerHTML = 'Publish Changes';
        } else {
            throw new Error(result.error || 'Unknown error');
        }

    } catch (error) {
        console.error('Error publishing changes:', error);

        // More detailed error message
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Cannot connect to API server. Is it running?';
        }

        showToast(`Error publishing changes: ${errorMsg}`, 'error');
        publishBtn.disabled = false;
        publishBtn.innerHTML = 'Publish Changes';
    }
}

// Generate updated HTML with current computer data
async function generateHTML() {
    // Fetch current HTML
    const response = await fetch('index.html');
    const html = await response.text();

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find gallery grid
    const galleryGrid = doc.querySelector('#gallery-grid');
    if (!galleryGrid) {
        throw new Error('Gallery grid not found in HTML');
    }

    // Clear existing cards
    galleryGrid.innerHTML = '';

    // Generate new cards with proper flip-card structure
    computers.forEach((computer, index) => {
        // Determine badge based on Black Friday status
        let badgeClass, badgeText, ribbonHTML = '';
        if (computer.blackFriday && computer.blackFriday.enabled) {
            badgeClass = 'badge-black-friday';
            badgeText = 'Black Friday Sale';
            ribbonHTML = `
         <div class="bf-ribbon-corner">
         </div>`;
        } else {
            badgeClass = computer.category === 'custom' ? 'badge-custom' :
                          computer.category === 'new' ? 'badge-new' : 'badge-refurbished';
            // Show "New" for laptops with custom category, otherwise use normal labels
            if (computer.category === 'custom' && computer.type === 'laptop') {
                badgeText = 'New';
            } else {
                badgeText = computer.category === 'custom' ? 'Custom Build' :
                             computer.category === 'new' ? 'New' : 'Refurbished';
            }
        }

        // Determine price HTML
        let priceHTML;
        if (computer.blackFriday && computer.blackFriday.enabled) {
            priceHTML = `
          <span class="original-price">
           ${computer.blackFriday.originalPrice}
          </span>
          <span class="sale-price">
           ${computer.blackFriday.salePrice}
          </span>
          <span class="savings-badge">
           Save ${computer.blackFriday.discount}%
          </span>`;
        } else {
            priceHTML = computer.price;
        }

        // Show all specs (no limit) - includes warranty info
        const warrantyLabels = ['Parts Warranty', 'Manufacturer Warranty', 'Free Diagnostics'];
        const specsHTML = computer.specs.map(spec => {
            const label = spec.label.replace(/::?$/, '').trim();

            // Check if this is a warranty spec - display in special format
            if (warrantyLabels.includes(label)) {
                // Check if Black Friday is active and we have original warranty values
                let warrantyHTML = '';
                if (computer.blackFriday && computer.blackFriday.enabled) {
                    const originalValue = label === 'Parts Warranty'
                        ? computer.blackFriday.originalPartsWarranty
                        : (label === 'Free Diagnostics' ? computer.blackFriday.originalFreeDiagnostics : null);

                    if (originalValue) {
                        // Show crossed-out original and new value
                        warrantyHTML = `
          <div class="spec-item">
           <strong style="text-decoration: line-through; opacity: 0.6;">
            ${originalValue}
           </strong>
           <strong style="color: #f6ad55;">
            ${spec.value}
           </strong>
           <strong>
            ${label}
           </strong>
          </div>`;
                    } else {
                        // No original value, just show current
                        warrantyHTML = `
          <div class="spec-item">
           <strong>
            ${spec.value}
           </strong>
           <strong>
            ${label}
           </strong>
          </div>`;
                    }
                } else {
                    // Normal warranty display
                    warrantyHTML = `
          <div class="spec-item">
           <strong>
            ${spec.value}
           </strong>
           <strong>
            ${label}
           </strong>
          </div>`;
                }
                return warrantyHTML;
            } else {
                // Normal spec - label: value format
                return `
          <div class="spec-item">
           <strong>
            ${label}:
           </strong>
           ${spec.value}
          </div>`;
            }
        }).join('\n         ');

        const cardHTML = `
      <div class="gallery-card" data-category="${computer.category}" data-computer-id="${index + 1}" data-type="${computer.type}">
       <div class="gallery-card-inner">
        <div class="gallery-card-front">${ribbonHTML}
         <div class="gallery-card-badge ${badgeClass}">
          ${badgeText}
         </div>
         <div class="gallery-card-image">
          <img alt="${computer.name}" onerror="this.src='./assets/logo.png'" src="${computer.image}"/>
         </div>
        </div>
        <div class="gallery-card-back">
         <h3 class="gallery-card-title">
          ${computer.name}
         </h3>
         <div class="gallery-card-price">
          ${priceHTML}
         </div>
         <div class="gallery-card-specs">
         ${specsHTML}
         </div>
        </div>
       </div>
      </div>`;

        galleryGrid.innerHTML += cardHTML;
    });

    // Return serialized HTML
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Delete key to delete selected
    if (e.key === 'Delete' && selectedComputer) {
        deleteComputer(selectedComputer.id);
    }
});

// Add double-click to edit
document.addEventListener('dblclick', (e) => {
    const card = e.target.closest('.computer-card');
    if (card && selectedComputer) {
        editSelected();
    }
});

// Black Friday Functions - Global Toggle for All Refurbished Computers
function toggleBlackFriday() {
    const toggle = document.getElementById('bf-toggle');
    blackFridayEnabled = toggle.checked;

    console.log(`🎃 Black Friday Mode ${blackFridayEnabled ? 'ENABLED' : 'DISABLED'}`);

    if (blackFridayEnabled) {
        // Apply Black Friday to ALL refurbished computers
        applyBlackFridayToAll();
    } else {
        // Remove Black Friday from ALL computers
        removeBlackFridayFromAll();
    }
}

function applyBlackFridayToAll() {
    let count = 0;

    computers.forEach(computer => {
        // Only apply to refurbished computers
        if (computer.category === 'refurbished') {
            // Apply 10% discount
            const priceString = computer.price.replace(/[$,]/g, '');
            const originalPrice = parseFloat(priceString);

            if (!isNaN(originalPrice)) {
                const salePrice = originalPrice * 0.90; // 10% off

                computer.blackFriday = {
                    enabled: true,
                    originalPrice: `$${originalPrice.toFixed(2)}`,
                    salePrice: `$${salePrice.toFixed(2)}`,
                    discount: 10
                };

                // Update warranty specs
                const partsWarrantyIndex = computer.specs.findIndex(s => s.label.replace(/::?$/, '').trim() === 'Parts Warranty');
                const freeDiagnosticsIndex = computer.specs.findIndex(s => s.label.replace(/::?$/, '').trim() === 'Free Diagnostics');

                if (partsWarrantyIndex !== -1) {
                    // Store original warranty before changing
                    if (!computer.blackFriday.originalPartsWarranty) {
                        computer.blackFriday.originalPartsWarranty = computer.specs[partsWarrantyIndex].value;
                    }
                    computer.specs[partsWarrantyIndex].value = '6 Months';
                }

                if (freeDiagnosticsIndex !== -1) {
                    // Store original warranty before changing
                    if (!computer.blackFriday.originalFreeDiagnostics) {
                        computer.blackFriday.originalFreeDiagnostics = computer.specs[freeDiagnosticsIndex].value;
                    }
                    computer.specs[freeDiagnosticsIndex].value = '1 Year';
                }

                count++;
            }
        }
    });

    hasUnsavedChanges = true;
    document.getElementById('publish-btn').disabled = false;
    renderGallery();
    showToast(`🎃 Black Friday Sale applied to ${count} refurbished computer(s)!`, 'success');
}

function removeBlackFridayFromAll() {
    let count = 0;

    computers.forEach(computer => {
        if (computer.blackFriday && computer.blackFriday.enabled) {
            // Restore original warranty values
            const partsWarrantyIndex = computer.specs.findIndex(s => s.label.replace(/::?$/, '').trim() === 'Parts Warranty');
            const freeDiagnosticsIndex = computer.specs.findIndex(s => s.label.replace(/::?$/, '').trim() === 'Free Diagnostics');

            if (partsWarrantyIndex !== -1 && computer.blackFriday.originalPartsWarranty) {
                computer.specs[partsWarrantyIndex].value = computer.blackFriday.originalPartsWarranty;
            }

            if (freeDiagnosticsIndex !== -1 && computer.blackFriday.originalFreeDiagnostics) {
                computer.specs[freeDiagnosticsIndex].value = computer.blackFriday.originalFreeDiagnostics;
            }

            // Remove Black Friday data
            delete computer.blackFriday;
            count++;
        }
    });

    hasUnsavedChanges = true;
    document.getElementById('publish-btn').disabled = false;
    renderGallery();
    showToast(`Black Friday Sale removed from ${count} computer(s)`, 'success');
}

// Check API health on startup
async function checkAPIHealth() {
    try {
        console.log('Checking API health at:', `${API_URL}/api/health`);
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        console.log('API Health:', data);

        if (!data.githubConnected) {
            console.warn('⚠️ GitHub is not connected to the API. Publishing will not work!');
            showToast('Warning: GitHub integration not configured. Contact admin.', 'error');
        }
    } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        console.error('API URL:', API_URL);
        showToast('Warning: Cannot connect to API server. Publishing may not work.', 'error');
    }
}

// Initialize
console.log('Initializing Gallery Manager...');
console.log('Checking authentication...');
checkAuth();
console.log('Checking API health...');
checkAPIHealth();
console.log('Loading computers...');
loadComputers().catch(err => {
    console.error('Failed to load computers:', err);
    showToast('Failed to load gallery. Please check console for errors.', 'error');
});

// Prevent accidental navigation away
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// ===== FLYER GENERATOR =====

// Helper to find a spec by label (supports multiple label variants)
function getSpec(specs, ...labels) {
    for (const label of labels) {
        const spec = specs.find(s => s.label.toLowerCase().replace(/::?$/, '').trim() === label.toLowerCase());
        if (spec) return spec.value;
    }
    return '';
}

// Capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Base CSS for flyers
const FLYER_BASE_CSS = `
@page {
    size: 8.5in 11in;
    margin: 0;
}

* {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0.5in;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
}

@media print {
    body {
        padding: 0.5in;
    }

    .flyer {
        box-shadow: none;
        page-break-inside: avoid;
    }

    /* Tighter spacing for Black Friday flyers to fit on one page */
    .black-friday .content {
        padding: 12px 18px;
    }

    .black-friday .product-title {
        margin-bottom: 12px;
    }

    .black-friday .black-friday-badge {
        margin-bottom: 8px;
        padding: 6px 20px;
    }

    .black-friday .specs-grid {
        margin-bottom: 10px;
        gap: 10px;
    }

    .black-friday .spec-card {
        padding: 12px 10px;
    }

    .black-friday .software-badge {
        margin: 10px 0;
        padding: 10px 18px;
    }

    .black-friday .price-section {
        padding: 12px;
        margin: 10px 0;
    }

    .black-friday .sale-price {
        font-size: 44px;
    }

    .black-friday .discount-badge {
        margin-top: 4px;
        padding: 3px 10px;
    }

    .black-friday .peace-of-mind {
        padding: 8px 12px;
        margin: 8px 0 0 0;
    }

    .black-friday .peace-title {
        margin: 0 0 6px 0;
        font-size: 20px;
    }

    .black-friday .warranty-grid {
        gap: 6px;
        margin-top: 6px;
    }

    .black-friday .warranty-item {
        padding: 8px 6px;
    }

    .black-friday .warranty-duration {
        font-size: 20px;
    }

    .black-friday .warranty-type {
        font-size: 11px;
    }

    .black-friday .warranty-upgraded {
        font-size: 9px;
        margin-top: 2px;
    }

    .black-friday .warranty-original {
        font-size: 13px;
        margin-bottom: 1px;
    }
}

.flyer {
    max-width: 7.5in;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.header {
    background: linear-gradient(135deg, #081e5b 0%, #06277a 100%);
    color: white;
    padding: 20px;
    text-align: center;
}

.header img {
    max-width: 100%;
    height: 60px;
    object-fit: contain;
    margin-bottom: 10px;
}

.header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
}

.content {
    padding: 20px 18px;
}

.product-title {
    text-align: center;
    margin-bottom: 20px;
}

.product-title h2 {
    font-size: 28px;
    margin: 0;
    color: #081e5b;
    font-weight: 800;
}

.specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
}

.spec-card {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 16px 12px;
    text-align: center;
    border-left: 4px solid #081e5b;
}

.spec-icon {
    font-size: 32px;
    margin-bottom: 10px;
    display: block;
}

.spec-icon img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}

.spec-icon-emoji {
    font-size: 32px;
}

.spec-title {
    font-weight: 700;
    color: #081e5b;
    margin-bottom: 5px;
    font-size: 16px;
}

.spec-detail {
    color: #343a40;
    font-size: 14px;
    font-weight: 600;
}

.software-badge {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    color: #081e5b;
    padding: 12px 20px;
    border-radius: 25px;
    text-align: center;
    margin: 18px 0;
    font-weight: 700;
    font-size: 16px;
    text-shadow: 0 1px 1px rgba(255,255,255,0.5);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3);
}

.price-section {
    background: linear-gradient(135deg, #081e5b 0%, #06277a 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    margin: 18px 0;
}

.price {
    font-size: 48px;
    font-weight: 900;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.price-note {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 14px;
}

.peace-of-mind {
    background: linear-gradient(135deg, #c0c0c0 0%, #d4d4d4 100%);
    padding: 16px;
    border-radius: 15px;
    margin: 18px 0 0 0;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.peace-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 15px 0;
    color: #081e5b;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.warranty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 15px;
}

.warranty-item {
    background: rgba(255,255,255,0.9);
    padding: 15px 10px;
    border-radius: 10px;
    text-align: center;
    border: 1px solid rgba(8, 30, 91, 0.1);
}

.warranty-duration {
    font-size: 24px;
    font-weight: 800;
    color: #081e5b;
    margin: 0;
}

.warranty-type {
    font-size: 12px;
    color: #343a40;
    font-weight: 600;
    margin: 5px 0 0 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
`;

// Black Friday CSS
const FLYER_BLACK_FRIDAY_CSS = `
.flyer.black-friday {
    border: 4px solid #fbbf24;
    box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3);
    position: relative;
}

.flyer.black-friday::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    z-index: 10;
}

.flyer.black-friday::after {
    content: '🎀';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 32px;
    z-index: 11;
}

.black-friday-badge {
    background: linear-gradient(145deg, #dc2626 0%, #991b1b 100%);
    border: 3px solid #fbbf24;
    border-radius: 50px;
    padding: 8px 24px;
    margin-bottom: 15px;
    display: inline-block;
}

.black-friday-badge span {
    font-size: 18px;
    font-weight: 900;
    color: #fbbf24;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.black-friday .header {
    background: linear-gradient(135deg, #0f0f0f 0%, #991b1b 50%, #0f0f0f 100%);
}

.black-friday .product-title h2 {
    color: #991b1b;
}

.black-friday .spec-card {
    border-left-color: #dc2626;
}

.black-friday .spec-title {
    color: #991b1b;
}

.black-friday .price-section {
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    border: 3px solid #fbbf24;
}

.black-friday .original-price {
    font-size: 24px;
    color: #888;
    text-decoration: line-through;
    margin-bottom: 5px;
}

.black-friday .sale-price {
    font-size: 52px;
    font-weight: 900;
    color: #fbbf24;
}

.black-friday .discount-badge {
    display: inline-block;
    background: #dc2626;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    margin-top: 8px;
}

.black-friday .peace-of-mind {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: 2px solid #dc2626;
}

.black-friday .peace-title {
    color: #0f0f0f;
}

.black-friday .warranty-item {
    background: rgba(255,255,255,0.95);
    border: 2px solid #fbbf24;
}

.black-friday .warranty-duration {
    color: #dc2626;
}

.black-friday .warranty-upgraded {
    font-size: 10px;
    color: #dc2626;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 4px;
}

.black-friday .warranty-original {
    font-size: 14px;
    color: #888;
    text-decoration: line-through;
    margin-bottom: 2px;
}
`;

// Base64 encoded title.png placeholder (Computer Store Kansas logo)
const LOGO_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMzAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+Q29tcHV0ZXIgU3RvcmUgS2Fuc2FzPC90ZXh0Pjwvc3ZnPg==';

// Generate flyer for a computer
function generateFlyer(computerId) {
    const computer = computers.find(c => c.id === computerId);
    if (!computer) {
        showToast('Computer not found', 'error');
        return;
    }

    const isLaptop = computer.type === 'laptop';
    const isBlackFriday = computer.blackFriday && computer.blackFriday.enabled;
    const typeLabel = capitalizeWords(`${computer.category} ${computer.type}`);

    // Graphics card SVG icon for desktop flyers
    const GRAPHICS_ICON_SVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#081e5b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/><path d="M6 18v2M18 18v2"/></svg>`;

    // Generate specs HTML
    let specsHtml;
    if (isLaptop) {
        const display = getSpec(computer.specs, 'Display', 'Screen', 'Screen Size');
        const processor = getSpec(computer.specs, 'Processor', 'CPU');
        const memory = getSpec(computer.specs, 'Memory', 'RAM');
        const storage = getSpec(computer.specs, 'Storage', 'SSD', 'HDD', 'Hard Drive');

        specsHtml = `
            <div class="specs-grid">
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">💻</span></div>
                    <div class="spec-title">Display</div>
                    <div class="spec-detail">${display || 'N/A'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">🧠</span></div>
                    <div class="spec-title">Processor</div>
                    <div class="spec-detail">${processor || 'N/A'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">⚡</span></div>
                    <div class="spec-title">Memory</div>
                    <div class="spec-detail">${memory || 'N/A'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">💾</span></div>
                    <div class="spec-title">Storage</div>
                    <div class="spec-detail">${storage || 'N/A'}</div>
                </div>
            </div>
        `;
    } else {
        const graphics = getSpec(computer.specs, 'Graphics', 'Graphics Card', 'GPU', 'Video Card');
        const processor = getSpec(computer.specs, 'Processor', 'CPU');
        const memory = getSpec(computer.specs, 'Memory', 'RAM');
        const storage = getSpec(computer.specs, 'Storage', 'SSD', 'HDD', 'Hard Drive');

        specsHtml = `
            <div class="specs-grid">
                <div class="spec-card">
                    <div class="spec-icon">${GRAPHICS_ICON_SVG}</div>
                    <div class="spec-title">Graphics</div>
                    <div class="spec-detail">${graphics || 'Integrated'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">🧠</span></div>
                    <div class="spec-title">Processor</div>
                    <div class="spec-detail">${processor || 'N/A'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">⚡</span></div>
                    <div class="spec-title">Memory</div>
                    <div class="spec-detail">${memory || 'N/A'}</div>
                </div>
                <div class="spec-card">
                    <div class="spec-icon"><span class="spec-icon-emoji">💾</span></div>
                    <div class="spec-title">Storage</div>
                    <div class="spec-detail">${storage || 'N/A'}</div>
                </div>
            </div>
        `;
    }

    // Generate price HTML
    let priceHtml;
    if (isBlackFriday) {
        priceHtml = `
            <div class="price-section">
                <div class="original-price">${computer.blackFriday.originalPrice}</div>
                <div class="sale-price">${computer.blackFriday.salePrice}</div>
                <div class="discount-badge">${computer.blackFriday.discount}% OFF</div>
                <div class="price-note">Plus applicable tax</div>
            </div>
        `;
    } else {
        priceHtml = `
            <div class="price-section">
                <div class="price">${computer.price}</div>
                <div class="price-note">Plus applicable tax</div>
            </div>
        `;
    }

    // Generate warranty HTML
    const partsWarranty = getSpec(computer.specs, 'Parts Warranty', 'Manufacturer Warranty', 'Warranty');
    const freeDiagnostics = getSpec(computer.specs, 'Free Diagnostics', 'Diagnostics');

    // For Black Friday, show the upgraded values with original crossed out
    let warrantyDuration, diagnosticsDuration, warrantyHtml;

    if (isBlackFriday && computer.blackFriday) {
        // Black Friday: show original crossed out, upgraded value highlighted
        const originalPartsWarranty = computer.blackFriday.originalPartsWarranty || '3 Months';
        const originalDiagnostics = computer.blackFriday.originalFreeDiagnostics || '6 Months';

        // The upgraded values (already set in specs by applyBlackFridayToAll)
        warrantyDuration = partsWarranty || '6 Months';
        diagnosticsDuration = freeDiagnostics || '1 Year';

        const warrantyType = 'Parts Warranty';

        warrantyHtml = `
            <div class="peace-of-mind">
                <div class="peace-title">🛡️ Peace of Mind Included</div>
                <div class="warranty-grid">
                    <div class="warranty-item">
                        <div class="warranty-original">${originalPartsWarranty}</div>
                        <div class="warranty-duration">${warrantyDuration}</div>
                        <div class="warranty-type">${warrantyType}</div>
                        <div class="warranty-upgraded">Upgraded!</div>
                    </div>
                    <div class="warranty-item">
                        <div class="warranty-original">${originalDiagnostics}</div>
                        <div class="warranty-duration">${diagnosticsDuration}</div>
                        <div class="warranty-type">Free Diagnostics</div>
                        <div class="warranty-upgraded">Upgraded!</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Standard warranty display
        warrantyDuration = partsWarranty || (isLaptop ? '1 Year' : '3 Months');
        const warrantyType = partsWarranty && partsWarranty.toLowerCase().includes('manufacturer')
            ? 'Manufacturer Warranty'
            : 'Parts Warranty';
        diagnosticsDuration = freeDiagnostics || (isLaptop ? 'Lifetime' : '6 Months');

        warrantyHtml = `
            <div class="peace-of-mind">
                <div class="peace-title">🛡️ Peace of Mind Included</div>
                <div class="warranty-grid">
                    <div class="warranty-item">
                        <div class="warranty-duration">${warrantyDuration}</div>
                        <div class="warranty-type">${warrantyType}</div>
                    </div>
                    <div class="warranty-item">
                        <div class="warranty-duration">${diagnosticsDuration}</div>
                        <div class="warranty-type">Free Diagnostics</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Build full CSS
    const css = isBlackFriday ? FLYER_BASE_CSS + FLYER_BLACK_FRIDAY_CSS : FLYER_BASE_CSS;
    const flyerClass = isBlackFriday ? 'flyer black-friday' : 'flyer';
    const blackFridayBadge = isBlackFriday
        ? '<div class="black-friday-badge"><span>Black Friday Sale</span></div>'
        : '';

    // Build full HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${computer.name} - Sales Flyer</title>
    <style>${css}</style>
</head>
<body>
    <div class="${flyerClass}">
        <div class="header">
            <img src="${LOGO_DATA_URL}" alt="Computer Store Kansas">
            <h1>${typeLabel}</h1>
        </div>

        <div class="content">
            ${blackFridayBadge}
            <div class="product-title">
                <h2>${computer.name}</h2>
            </div>

            ${specsHtml}

            <div class="software-badge">
                🖥️ Windows 11 Pre-Installed${isLaptop ? '!' : ''}
            </div>

            ${priceHtml}

            ${warrantyHtml}
        </div>
    </div>
</body>
</html>`;

    // Create blob and open in new tab
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Clean up URL after delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast('Flyer generated! Check the new tab.', 'success');
}
