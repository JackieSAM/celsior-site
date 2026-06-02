/**
 * shared-v2.js - Celsior Site Navigation & Footer
 * Modern, modular, lightweight version
 * 
 * Features:
 * - Modular architecture with ES modules
 * - External configuration
 * - Separate CSS file for caching
 * - Pure template functions
 * - Component-based architecture
 * - Lazy loading
 * - Better performance & maintainability
 */

// Dynamic import for ES modules
(async function() {
  try {
    // Load CSS if not already loaded (check if we're in a test environment)
    if (!document.querySelector('link[href*="nav-styles"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './nav-styles.css';
      document.head.appendChild(link);
    }

    // Dynamically import modules
    const [{ CONFIG }, templates, components] = await Promise.all([
      import('./nav-config.js'),
      import('./nav-templates.js'),
      import('./nav-components.js')
    ]);

    // Initialize components
    await initializeSharedComponents(CONFIG, templates, components);
    
  } catch (error) {
    console.error('Failed to initialize navigation:', error);
    // Fallback to failure message on the page
    showInitializationError();
  }
})();

async function initializeSharedComponents(CONFIG, templates, components) {
  const {
    NavbarComponent,
    MegaMenuComponent,
    MobileDrawerComponent,
    FooterComponent
  } = components;

  // Create and initialize components
  const navbar = new NavbarComponent(CONFIG, templates);
  const megaMenu = new MegaMenuComponent(templates);
  const mobileDrawer = new MobileDrawerComponent(CONFIG, templates);
  const footer = new FooterComponent(CONFIG, templates);

  // Wire up mobile drawer
  const hamburger = navbar.getHamburger();
  mobileDrawer.init(hamburger);

  // Wait for DOM to be ready and initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performFinalSetup();
    });
  } else {
    performFinalSetup();
  }

  function performFinalSetup() {
    // Add performance marks for debugging
    if (window.performance && window.performance.mark) {
      performance.mark('nav-initialized');
    }

    // Dispatch custom event for other scripts
    document.dispatchEvent(new CustomEvent('navigationReady', {
      detail: { config: CONFIG, components: { navbar, megaMenu, mobileDrawer, footer } }
    }));
  }

  return { navbar, megaMenu, mobileDrawer, footer };
}

function showInitializationError() {
  console.error('Navigation initialization failed - check module paths and file structure');
}

// For older browsers or if ES modules aren't supported, log a helpful error
if (!('noModule' in HTMLScriptElement.prototype)) {
  console.error('ES modules not supported in this browser. Please use a modern browser.');
}

// Export init function for programmatic use
export async function initNavigation() {
  const [{ CONFIG }, templates, components] = await Promise.all([
    import('./nav-config.js'),
    import('./nav-templates.js'),
    import('./nav-components.js')
  ]);

  return initializeSharedComponents(CONFIG, templates, components);
}
