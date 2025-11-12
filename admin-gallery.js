// Admin Gallery Manager JavaScript
// Handles loading, editing, and saving computer gallery data

// State management
let computers = [];
let selectedComputer = null;
let hasUnsavedChanges = false;
let currentFilter = 'all';

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

// Load computers from index.html
async function loadComputers() {
    try {
        const response = await fetch('index.html');
        const html = await response.text();

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
                const fullText = item.textContent.trim();
                const strong = item.querySelector('strong');
                if (strong) {
                    const label = strong.textContent.replace(/::?$/, '').trim(); // Remove trailing : or ::
                    const value = fullText.replace(strong.textContent, '').trim();
                    if (label && value) {
                        computer.specs.push({ label, value });
                    }
                }
            });

            computers.push(computer);
        });

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
        const badgeClass = computer.category === 'custom' ? 'badge-custom' :
                          computer.category === 'new' ? 'badge-new' : 'badge-refurbished';
        const badgeText = computer.category === 'custom' ? 'Custom Build' :
                         computer.category === 'new' ? 'New' : 'Refurbished';

        const specsHTML = computer.specs.slice(0, 4).map(spec => `
            <div class="spec-item">
                <div class="spec-label">${spec.label}</div>
                <div class="spec-value">${spec.value}</div>
            </div>
        `).join('');

        return `
            <div class="computer-card" data-id="${computer.id}" onclick="selectCard(${computer.id})">
                <img src="${computer.image}" alt="${computer.name}" class="card-image" onerror="this.src='./assets/placeholder.jpg'">
                <div class="card-badge ${badgeClass}">${badgeText}</div>
                <div class="card-content">
                    <div class="card-type">${computer.type}</div>
                    <div class="card-name">${computer.name}</div>
                    <div class="card-price">${computer.price}</div>
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

        // Show edit/delete options (you can add buttons in top-actions if needed)
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
    document.getElementById('modal-title').textContent = 'Add New Computer';
    document.getElementById('computer-form').reset();
    document.getElementById('edit-index').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-prompt').style.display = 'block';
    document.getElementById('upload-area').classList.remove('has-image');
    document.getElementById('computer-modal').classList.add('show');
}

function openEditModal(computer) {
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

    document.getElementById('computer-modal').classList.add('show');
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
        // Generate updated HTML
        const updatedHTML = await generateHTML();

        // Get admin password from session
        const password = sessionStorage.getItem('admin_password');

        // Call API to update and commit
        const response = await fetch('http://localhost:3001/api/gallery/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${password}`
            },
            body: JSON.stringify({
                htmlContent: updatedHTML,
                commitMessage: 'Update gallery via Web Gallery Manager'
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showToast('Changes published successfully! Website will update in 2-3 minutes.', 'success');
            hasUnsavedChanges = false;
            publishBtn.disabled = true;
            publishBtn.innerHTML = 'Publish Changes';
        } else {
            throw new Error(result.error || 'Unknown error');
        }

    } catch (error) {
        console.error('Error publishing changes:', error);
        showToast(`Error publishing changes: ${error.message}`, 'error');
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
        const badgeClass = computer.category === 'custom' ? 'badge-custom' :
                          computer.category === 'new' ? 'badge-new' : 'badge-refurbished';
        const badgeText = computer.category === 'custom' ? 'Custom Build' :
                         computer.category === 'new' ? 'New' : 'Refurbished';

        const specsHTML = computer.specs.slice(0, 4).map(spec => `
          <div class="spec-item">
           <strong>
            ${spec.label}:
           </strong>
           ${spec.value}
          </div>`).join('\n         ');

        const cardHTML = `
      <div class="gallery-card" data-category="${computer.category}" data-computer-id="${index + 1}" data-type="${computer.type}">
       <div class="gallery-card-inner">
        <div class="gallery-card-front">
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
          ${computer.price}
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
        openEditModal(selectedComputer);
    }
});

// Initialize
checkAuth();
loadComputers();

// Prevent accidental navigation away
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});
