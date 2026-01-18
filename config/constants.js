/**
 * Global Configuration and Constants
 * Critical values that can be easily modified for site-wide changes
 */

const CONFIG = {
  // Brand Information
  brand: {
    name: "Click IT",
    tagline: "Urban life, simplified. On tap.",
    description: "Essentials delivery and small-item movement across the city"
  },

  // Weight Limit
  weightLimit: "16 kg",

  // Section IDs (for navigation and scrolling)
  sections: {
    hero: "hero",
    problem: "problem",
    approach: "approach",
    customerValue: "customer-value",
    vendorValue: "vendor-value",
    dataFlywheel: "data-flywheel",
    trust: "trust",
    whyExists: "why-exists"
  },

  // Color Palette (to be customized later)
  colors: {
    primary: "#1a1a1a",
    secondary: "#4a4a4a",
    accent: "#0066cc",
    background: "#ffffff",
    text: "#2a2a2a",
    textLight: "#666666"
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    },
    fontSize: {
      hero: "3.5rem",
      h1: "2.5rem",
      h2: "2rem",
      h3: "1.5rem",
      body: "1.125rem",
      small: "0.875rem"
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.6",
      relaxed: "1.8"
    }
  },

  // Spacing
  spacing: {
    section: "6rem",
    sectionMobile: "4rem",
    container: "1200px",
    containerPadding: "2rem"
  },

  // Breakpoints
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1200px"
  },

  // Animation
  animation: {
    duration: "0.3s",
    easing: "ease-in-out"
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

