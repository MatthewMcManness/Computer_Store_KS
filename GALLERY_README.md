# Gallery Page Documentation

## Overview
A new Gallery page has been added to the Computer Store Kansas website to showcase desktop computers and laptops that have been built and/or refurbished.

## Features Added

### 1. Navigation
- Added "Gallery" link to the main navigation menu (between Services and Silver Plan)
- Accessible from all pages on the website

### 2. Gallery Page Layout
The Gallery page includes:
- **Hero Section**: Eye-catching header introducing the gallery
- **Filter Buttons**: Interactive filters to view specific categories:
  - All Computers (default)
  - Desktops only
  - Laptops only
  - Refurbished computers
  - Custom Builds
- **Computer Grid**: Responsive grid layout displaying computer cards
- **Call-to-Action**: Section encouraging custom build requests

### 3. Computer Cards
Each computer card displays:
- Product image (4:3 aspect ratio)
- Status badge (Custom Build or Refurbished) with color coding
- Computer name/model
- Key specifications preview:
  - CPU
  - RAM
  - Storage
- Price
- "View Details" button

### 4. Computer Details Modal
Clicking "View Details" opens a modal showing:
- Large product image
- Full computer name
- Status badge
- Price
- Complete specifications list
- "Contact Us About This Computer" button (opens contact form)

### 5. Interactive Features
- **Hover Effects**: Cards lift and scale on hover
- **Filtering**: Instant filtering by category without page reload
- **Modal System**: Full-screen overlay with detailed specifications
- **Mobile Responsive**: Adapts to all screen sizes:
  - Desktop: 3-column grid
  - Tablet: 2-column grid
  - Mobile: 1-column grid

## Files Modified

### 1. index.html
- Added Gallery navigation link (line 214)
- Added Gallery page section (lines 619-785)
- Added Computer Details modal (lines 791-799)
- Includes 6 example computer listings (3 desktops, 3 laptops)

### 2. style.css
- Added Gallery page styles (lines 1595-1906)
- Includes styles for:
  - Filter buttons
  - Gallery grid layout
  - Computer cards
  - Status badges
  - Details modal
  - Mobile responsive styles

### 3. script.js
- Added Gallery functionality (lines 606-900)
- Includes:
  - Computer data object with full specifications
  - Filter button handlers
  - Card filtering logic
  - Details modal system
  - Gallery initialization

## How to Add More Computers

### Option 1: Add to HTML (Simple)
Add a new `.gallery-card` div in the `index.html` file within the `#gallery-grid` section:

```html
<div class="gallery-card" data-type="desktop|laptop" data-category="custom|refurbished">
  <div class="gallery-card-image">
    <img src="./assets/gallery/your-image.jpg" alt="Computer Name" onerror="this.src='./assets/logo.png'">
    <div class="gallery-card-badge badge-custom">Custom Build</div>
  </div>
  <div class="gallery-card-content">
    <h3 class="gallery-card-title">Computer Name</h3>
    <div class="gallery-card-specs-preview">
      <span class="spec-item"><strong>CPU:</strong> Processor Info</span>
      <span class="spec-item"><strong>RAM:</strong> Memory Info</span>
      <span class="spec-item"><strong>Storage:</strong> Storage Info</span>
    </div>
    <div class="gallery-card-footer">
      <span class="gallery-card-price">$XXX</span>
      <button class="btn btn-primary btn-small gallery-details-btn" data-computer-id="7">View Details</button>
    </div>
  </div>
</div>
```

### Option 2: Add to JavaScript Data (Complete)
Add a new entry to the `computerData` object in `script.js`:

```javascript
7: {
  id: 7,
  name: 'Your Computer Name',
  type: 'desktop', // or 'laptop'
  category: 'custom', // or 'refurbished'
  price: '$XXX',
  image: './assets/gallery/your-image.jpg',
  specs: {
    'Processor': 'CPU details',
    'Memory': 'RAM details',
    'Storage': 'Storage details',
    'Graphics': 'GPU details',
    // Add more specs as needed
  }
}
```

## Image Requirements

### Placeholder Images
Currently, the gallery uses placeholder paths. Images should be placed in:
```
./assets/gallery/
```

### Image Naming Convention
- Desktops: `desktop-1.jpg`, `desktop-2.jpg`, etc.
- Laptops: `laptop-1.jpg`, `laptop-2.jpg`, etc.

### Image Specifications
- **Aspect Ratio**: 4:3 recommended (e.g., 800x600px, 1200x900px)
- **Format**: JPG or PNG
- **Size**: Optimize for web (< 500KB per image)
- **Quality**: Clear product photos with good lighting
- **Fallback**: Logo image will display if image fails to load

## Design Consistency

The Gallery page maintains the website's existing design system:
- **Colors**: Primary blue (#2563eb) for buttons and prices
- **Typography**: Consistent with other pages
- **Spacing**: Matches existing section padding
- **Animations**: Smooth hover effects and transitions
- **Mobile**: Fully responsive with mobile-first approach

## Future Enhancements

Potential improvements:
1. Admin panel to add/edit computers
2. Database integration for dynamic content
3. Image gallery/carousel for multiple photos per computer
4. Availability status (In Stock, Sold, Coming Soon)
5. Search functionality
6. Sort options (Price, Name, Date Added)
7. Comparison feature
8. Customer reviews/ratings

## Testing Checklist

- [ ] Gallery page loads correctly
- [ ] All filter buttons work properly
- [ ] Computer cards display correctly
- [ ] "View Details" opens modal with correct information
- [ ] Modal closes correctly (X button, outside click, Escape key)
- [ ] Contact button in modal opens contact form
- [ ] Mobile responsive on all screen sizes
- [ ] Images load or show fallback logo
- [ ] Hover effects work on desktop
- [ ] No console errors

## Support

For questions or issues with the Gallery page, contact the development team or refer to the main website documentation.
