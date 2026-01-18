/**
 * Main JavaScript
 * Site-wide functionality and interactions
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSmoothScroll();
    initScrollEffects();
  });

  /**
   * Initialize navigation functionality
   */
  function initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const navLinksContainer = document.querySelector('.nav-links');
    const navContainer = document.querySelector('.nav-container');
    if (!navLinksContainer || !navContainer) return;

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        nav.style.boxShadow = '0 2px 10px rgba(200, 16, 46, 0.1)';
      } else {
        nav.style.boxShadow = 'none';
      }
    });

    // Highlight active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      const linkParts = linkHref.split('#');
      const linkPage = linkParts[0];
      const linkHash = linkParts[1] || '';
      
      // Reset styles first
      link.style.color = '';
      link.style.fontWeight = '';
      link.classList.remove('active');
      
      // Check if this link should be highlighted
      let shouldHighlight = false;
      
      // Normalize current page
      const normalizedCurrentPage = (currentPage === '' || currentPage === 'index.html') ? 'index.html' : currentPage;
      const normalizedLinkPage = (linkPage === '' || linkPage === 'index.html') ? 'index.html' : linkPage;
      
      // Only highlight if it's an exact page match (not section links)
      // For index.html, only highlight the "Home" link (the one without hash)
      if (normalizedLinkPage === normalizedCurrentPage) {
        if (normalizedCurrentPage === 'index.html') {
          // On home page, only highlight "Home" link (no hash)
          shouldHighlight = !linkHash;
        } else {
          // On other pages, highlight the matching page link
          shouldHighlight = true;
        }
      }
      
      if (shouldHighlight) {
        link.style.color = '#C8102E';
        link.style.fontWeight = '600';
        link.classList.add('active');
      }
    });

    // Create mobile menu button (always create it, CSS will show/hide)
    let menuButton = document.querySelector('.mobile-menu-toggle');
    if (!menuButton) {
      menuButton = document.createElement('button');
      menuButton.className = 'mobile-menu-toggle';
      menuButton.innerHTML = '☰';
      menuButton.setAttribute('aria-label', 'Toggle menu');
      menuButton.setAttribute('aria-expanded', 'false');
      navContainer.appendChild(menuButton);
    }

    let isOpen = false;

    // Function to check if mobile menu should be visible
    function isMobile() {
      return window.innerWidth <= 768;
    }

    // Function to close mobile menu
    function closeMobileMenu() {
      if (isMobile()) {
        navLinksContainer.classList.remove('mobile-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.innerHTML = '☰';
        isOpen = false;
      }
    }

    // Function to toggle mobile menu
    function toggleMobileMenu() {
      if (!isMobile()) {
        closeMobileMenu();
        return;
      }

      isOpen = !isOpen;
      if (isOpen) {
        navLinksContainer.classList.add('mobile-open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.innerHTML = '✕';
      } else {
        navLinksContainer.classList.remove('mobile-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.innerHTML = '☰';
      }
    }

    // Toggle menu on button click
    menuButton.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking on a link
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (isMobile()) {
          setTimeout(closeMobileMenu, 100);
        }
      });
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (!isMobile()) {
          closeMobileMenu();
          navLinksContainer.classList.remove('mobile-open');
        }
      }, 250);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (isOpen && isMobile() && 
          !navContainer.contains(e.target) && 
          !navLinksContainer.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Initialize scroll-based effects
   */
  function initScrollEffects() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe sections for fade-in effect
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(section);
    });
  }

  // Export functions for potential external use
  window.ClickIT = {
    initNavigation: initNavigation,
    initSmoothScroll: initSmoothScroll,
    initScrollEffects: initScrollEffects
  };
})();

