// Admin Gallery Manager JavaScript
// Handles loading, editing, and saving computer gallery data

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
        window.location.href = 'admin-login.html';
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
    window.location.href = 'admin-login.html';
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
            const specItems = card.querySelectorAll('.gallery-card-specs .spec-item');
            specItems.forEach(item => {
                const strong = item.querySelector('strong');
                if (strong) {
                    // Normalize the label by trimming and removing trailing colons
                    const label = strong.textContent.trim().replace(/::?$/, '');

                    // Extract value by getting all text content after the strong element
                    // First, get the full text and normalize whitespace
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
        const specsHTML = computer.specs.map(spec => {
            // Ensure label doesn't already end with a colon before adding one
            const label = spec.label.replace(/::?$/, '').trim();
            return `
            <div class="spec-item">
                <strong>${label}:</strong> ${spec.value}
            </div>
        `;
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
        window.location.href = `edit-computer.html?id=${selectedComputer.id}`;
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

// Modal functions
function openAddModal() {
    console.log('🔍 Opening add modal...');

    const modal = document.getElementById('computer-modal');
    console.log('🔍 Modal element found:', modal);
    console.log('🔍 Modal current display:', modal ? window.getComputedStyle(modal).display : 'MODAL NOT FOUND');
    console.log('🔍 Modal current classes:', modal ? modal.className : 'MODAL NOT FOUND');

    if (!modal) {
        alert('ERROR: Modal element not found in DOM!');
        return;
    }

    try {
        document.getElementById('modal-title').textContent = 'Add New Computer';
        document.getElementById('computer-form').reset();
        document.getElementById('edit-index').value = '';
        document.getElementById('image-preview').style.display = 'none';
        document.getElementById('upload-prompt').style.display = 'block';
        document.getElementById('upload-area').classList.remove('has-image');

        // Force display with inline style as well
        modal.style.display = 'flex';
        modal.classList.add('show');

        console.log('✅ After adding show class:');
        console.log('   - Classes:', modal.className);
        console.log('   - Computed display:', window.getComputedStyle(modal).display);
        console.log('   - Inline display:', modal.style.display);

        const computedStyle = window.getComputedStyle(modal);
        console.log('🔍 Full modal computed styles:');
        console.log('   - position:', computedStyle.position);
        console.log('   - top:', computedStyle.top);
        console.log('   - left:', computedStyle.left);
        console.log('   - width:', computedStyle.width);
        console.log('   - height:', computedStyle.height);
        console.log('   - z-index:', computedStyle.zIndex);
        console.log('   - visibility:', computedStyle.visibility);
        console.log('   - opacity:', computedStyle.opacity);
        console.log('   - background:', computedStyle.backgroundColor);
    } catch (error) {
        console.error('❌ Error opening modal:', error);
        alert('Error opening modal: ' + error.message);
    }
}

function openEditModal(computer) {
    console.log('Opening edit modal for:', computer);
    try {
        document.getElementById('modal-title').textContent = 'Edit Computer';
        document.getElementById('edit-index').value = computer.id;

        // Fill form
        document.getElementById('computer-name').value = computer.name;
        document.getElementById('computer-type').value = computer.type;
        document.getElementById('computer-category').value = computer.category;
        document.getElementById('computer-price').value = computer.price;

        // Update category options based on type
        updateCategoryOptions();

        // Set image preview
        if (computer.image) {
            const preview = document.getElementById('image-preview');
            preview.src = computer.image;
            preview.style.display = 'block';
            document.getElementById('upload-prompt').style.display = 'none';
            document.getElementById('upload-area').classList.add('has-image');
        }

        // Fill specs
        computer.specs.forEach((spec, index) => {
            if (index < 4) {
                document.getElementById(`spec${index + 1}-label`).value = spec.label;
                document.getElementById(`spec${index + 1}-value`).value = spec.value;
            }
        });

        const modal = document.getElementById('computer-modal');
        console.log('Modal element:', modal);
        modal.classList.add('show');
        console.log('Modal classes after adding show:', modal.className);
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Error opening edit modal: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('computer-modal').classList.remove('show');
}

// Update category options based on computer type
function updateCategoryOptions() {
    const typeSelect = document.getElementById('computer-type');
    const categorySelect = document.getElementById('computer-category');
    const currentCategory = categorySelect.value;

    if (typeSelect.value === 'desktop') {
        categorySelect.innerHTML = `
            <option value="custom">Custom Build</option>
            <option value="refurbished">Refurbished</option>
        `;
        // Set to custom if current was 'new'
        if (currentCategory === 'new') {
            categorySelect.value = 'custom';
        } else {
            categorySelect.value = currentCategory;
        }
    } else {
        categorySelect.innerHTML = `
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
        `;
        // Set to new if current was 'custom'
        if (currentCategory === 'custom') {
            categorySelect.value = 'new';
        } else {
            categorySelect.value = currentCategory;
        }
    }
}

// Listen for type changes
document.getElementById('computer-type').addEventListener('change', updateCategoryOptions);

// Image upload handling
const uploadArea = document.getElementById('upload-area');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');

uploadArea.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.match('image/(jpeg|jpg|png)')) {
            showToast('Please select a JPG or PNG image', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', 'error');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            document.getElementById('upload-prompt').style.display = 'none';
            uploadArea.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
});

// Save computer
function saveComputer() {
    const form = document.getElementById('computer-form');

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get form data
    const computerData = {
        name: document.getElementById('computer-name').value,
        type: document.getElementById('computer-type').value,
        category: document.getElementById('computer-category').value,
        price: document.getElementById('computer-price').value,
        image: imagePreview.src || '',
        specs: [
            {
                label: document.getElementById('spec1-label').value,
                value: document.getElementById('spec1-value').value
            },
            {
                label: document.getElementById('spec2-label').value,
                value: document.getElementById('spec2-value').value
            },
            {
                label: document.getElementById('spec3-label').value,
                value: document.getElementById('spec3-value').value
            },
            {
                label: document.getElementById('spec4-label').value,
                value: document.getElementById('spec4-value').value
            }
        ]
    };

    // Validate image
    if (!computerData.image) {
        showToast('Please select an image', 'error');
        return;
    }

    const editIndex = document.getElementById('edit-index').value;

    if (editIndex !== '') {
        // Edit existing
        const index = parseInt(editIndex);
        computers[computers.findIndex(c => c.id === index)] = {
            ...computerData,
            id: index
        };
        showToast('Computer updated successfully!', 'success');
    } else {
        // Add new
        computerData.id = computers.length > 0 ? Math.max(...computers.map(c => c.id)) + 1 : 0;
        computers.push(computerData);
        showToast('Computer added successfully!', 'success');
    }

    hasUnsavedChanges = true;
    document.getElementById('publish-btn').disabled = false;

    closeModal();
    renderGallery();
}

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
        const specsHTML = computer.specs.map(spec => {
            // Ensure label doesn't already end with a colon before adding one
            const label = spec.label.replace(/::?$/, '').trim();
            return `
          <div class="spec-item">
           <strong>
            ${label}:
           </strong>
           ${spec.value}
          </div>`;
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
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }

    // Ctrl+S to save (when modal is open)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('computer-modal').classList.contains('show')) {
            saveComputer();
        }
    }

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

// Black Friday Functions
function toggleBlackFriday() {
    const toggle = document.getElementById('bf-toggle');
    const options = document.getElementById('bf-options');

    blackFridayEnabled = toggle.checked;
    options.style.display = toggle.checked ? 'block' : 'none';

    if (!toggle.checked && selectedComputer) {
        // Remove Black Friday from selected computer
        if (selectedComputer.blackFriday) {
            removeBlackFriday(selectedComputer);
        }
    }
}

function applyBlackFriday() {
    if (!selectedComputer) {
        showToast('Please select a computer first', 'error');
        return;
    }

    const discountPercent = parseInt(document.getElementById('bf-discount').value);

    if (discountPercent < 1 || discountPercent > 50) {
        showToast('Discount must be between 1% and 50%', 'error');
        return;
    }

    // Extract numeric price from string like "$1,299" or "$1299.99"
    const priceString = selectedComputer.price.replace(/[$,]/g, '');
    const originalPrice = parseFloat(priceString);

    if (isNaN(originalPrice)) {
        showToast('Invalid price format', 'error');
        return;
    }

    const salePrice = originalPrice * (1 - discountPercent / 100);

    // Update computer with Black Friday data
    selectedComputer.blackFriday = {
        enabled: true,
        originalPrice: `$${originalPrice.toFixed(2)}`,
        salePrice: `$${salePrice.toFixed(2)}`,
        discount: discountPercent
    };

    hasUnsavedChanges = true;
    document.getElementById('publish-btn').disabled = false;

    renderGallery();
    showToast(`Applied ${discountPercent}% Black Friday discount!`, 'success');
}

function removeBlackFriday(computer) {
    if (computer.blackFriday) {
        delete computer.blackFriday;
        hasUnsavedChanges = true;
        document.getElementById('publish-btn').disabled = false;
        renderGallery();
        showToast('Black Friday discount removed', 'success');
    }
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
