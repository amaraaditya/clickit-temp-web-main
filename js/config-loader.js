/**
 * Configuration Loader
 * Loads global configuration into the page
 */

(function() {
  'use strict';
  
  // Load config from constants.js
  const script = document.createElement('script');
  script.src = './config/constants.js';
  script.onload = function() {
    // Config is now available as window.CONFIG
    if (window.CONFIG) {
      console.log('Configuration loaded:', window.CONFIG.brand.name);
    }
  };
  document.head.appendChild(script);
})();

