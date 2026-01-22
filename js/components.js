/**
 * Reusable Components Module
 * All reusable UI components (header, footer, navigation) are defined here
 * Update once, changes apply everywhere
 */

// Initialize components when ready
function initializeComponents() {
  // Check if CONFIG is available
  if (typeof CONFIG === 'undefined') {
    // If CONFIG not ready, wait a bit and try again
    setTimeout(initializeComponents, 50);
    return;
  }
  
  // Initialize components
  initNavigation();
  initFooter();
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for it
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  // DOM is already loaded, initialize immediately
  initializeComponents();
}

/**
 * Navigation Component
 * Renders the header navigation with logo and menu
 */
function initNavigation() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navContainer.innerHTML = `
    <a href="index.html" class="nav-logo">
      <img src="${CONFIG.assets.fullLogo}" alt="${CONFIG.brand.name}" class="logo-img">
    </a>
    <ul class="nav-links">
      <li><a href="index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>Home</a></li>
      <li><a href="customers.html" ${currentPage === 'customers.html' ? 'class="active"' : ''}>For Customers</a></li>
      <li><a href="vendors.html" ${currentPage === 'vendors.html' ? 'class="active"' : ''}>For Vendors</a></li>
      <li><a href="about.html" ${currentPage === 'about.html' ? 'class="active"' : ''}>About Us</a></li>
      <li><a href="contact.html" ${currentPage === 'contact.html' ? 'class="active"' : ''}>Contact Us</a></li>
    </ul>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
      <span class="theme-icon-text moon-emoji">🌙</span>
      <span class="theme-icon-text sun-emoji" style="display: none;">☀️</span>
    </button>
  `;
  
  // Initialize theme toggle after button is created
  if (typeof window.initThemeToggle === 'function') {
    window.initThemeToggle();
  }
}

/**
 * Footer Component
 * Renders the footer with contact information
 */
function initFooter() {
  const footerContainer = document.querySelector('.footer-content');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <div class="footer-section footer-brand">
      <img src="${CONFIG.assets.fullLogo}" alt="${CONFIG.brand.name}" class="footer-logo-img">
      <p class="footer-tagline">${CONFIG.brand.tagline}</p>
      <p class="footer-description"><strong>${CONFIG.brand.name}</strong> — ${CONFIG.brand.description} across UK cities using a single trusted platform.</p>
    </div>
    
    <div class="footer-section footer-links">
      <h3 class="footer-heading">Quick Links</h3>
      <ul class="footer-nav">
        <li><a href="index.html">Home</a></li>
        <li><a href="customers.html">For Customers</a></li>
        <li><a href="vendors.html">For Vendors</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="contact.html">Contact Us</a></li>
      </ul>
    </div>
    
    <div class="footer-section footer-info">
      <h3 class="footer-heading">Get in Touch</h3>
      <ul class="footer-contact">
        <li>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>${CONFIG.contact.email}</span>
        </li>
        <li>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.16667H6.25L8.33333 8.33333L6.25 10C7.08333 12.5 9.16667 14.5833 11.6667 15.4167L13.3333 13.3333L17.5 15.4167V19.1667C17.5 19.625 17.125 20 16.6667 20C7.5 20 0 12.5 0 3.33333C0 2.875 0.375 2.5 0.833333 2.5H4.58333V6.25L2.5 8.33333L4.58333 10L6.25 8.33333L8.33333 10.4167L6.25 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>${CONFIG.contact.phone}</span>
        </li>
        <li>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5M17.5 10C17.5 5.85786 14.1421 2.5 10 2.5M17.5 10H2.5M10 17.5C11.3807 17.5 12.5 14.1421 12.5 10C12.5 5.85786 11.3807 2.5 10 2.5M10 17.5C8.61929 17.5 7.5 14.1421 7.5 10C7.5 5.85786 8.61929 2.5 10 2.5M2.5 10C2.5 5.85786 5.85786 2.5 10 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>${CONFIG.contact.location}</span>
        </li>
      </ul>
    </div>
  `;
}
