/**
 * Theme Management
 * Handles dark/light theme toggle with localStorage persistence
 * Dark theme is the default
 */

(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'clickit-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    // Check localStorage or default to light
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || LIGHT_THEME;
    setTheme(savedTheme);
  }

  /**
   * Set theme and update UI
   */
  function setTheme(theme) {
    const root = document.documentElement;
    
    if (theme === DARK_THEME) {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeToggle(theme);
  }

  /**
   * Toggle between dark and light theme
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark-theme') 
      ? DARK_THEME 
      : LIGHT_THEME;
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    setTheme(newTheme);
  }

  /**
   * Update theme toggle button appearance
   * Show moon emoji in light theme (to switch to dark)
   * Show sun emoji in dark theme (to switch to light)
   */
  function updateThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const sunEmoji = toggle.querySelector('.sun-emoji');
    const moonEmoji = toggle.querySelector('.moon-emoji');

    if (!sunEmoji || !moonEmoji) return;

    if (theme === LIGHT_THEME) {
      // In light theme, show moon emoji (clicking will switch to dark)
      sunEmoji.style.display = 'none';
      moonEmoji.style.display = 'block';
    } else {
      // In dark theme, show sun emoji (clicking will switch to light)
      sunEmoji.style.display = 'block';
      moonEmoji.style.display = 'none';
    }
  }

  /**
   * Initialize theme toggle button
   * This will be called after components are loaded
   */
  function initThemeToggle() {
    // Try to find the toggle button
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      // Remove existing listeners to avoid duplicates
      const newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);
      // Add click listener to new toggle
      newToggle.addEventListener('click', toggleTheme);
      // Update icon display based on current theme
      updateThemeToggle(getCurrentTheme());
      return true;
    }
    return false;
  }

  /**
   * Get current theme
   */
  function getCurrentTheme() {
    return document.documentElement.classList.contains('dark-theme') 
      ? DARK_THEME 
      : LIGHT_THEME;
  }

  // Initialize theme immediately
  initTheme();

  // Try to initialize toggle button immediately
  if (!initThemeToggle()) {
    // If button doesn't exist yet, wait for DOM or components to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for components.js to render
        setTimeout(initThemeToggle, 100);
      });
    } else {
      // DOM is ready, but components might not be, so wait a bit
      setTimeout(initThemeToggle, 100);
    }
  }

  // Also listen for when components are loaded (using a custom event or polling)
  let checkCount = 0;
  const maxChecks = 20; // Check for 2 seconds max
  const checkInterval = setInterval(() => {
    if (initThemeToggle() || checkCount >= maxChecks) {
      clearInterval(checkInterval);
    }
    checkCount++;
  }, 100);

  // Export for external use
  window.ThemeManager = {
    setTheme,
    toggleTheme,
    getCurrentTheme,
    initThemeToggle
  };

  // Make initThemeToggle available globally so components.js can call it
  window.initThemeToggle = initThemeToggle;
})();
