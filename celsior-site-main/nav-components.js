/**
 * nav-components.js - Component logic for navigation
 * Modular, reusable components for navbar, mega menus, mobile drawer, and footer
 */

export class NavbarComponent {
  constructor(config, templates) {
    this.config = config;
    this.templates = templates;
    this.navbarEl = null;
    this.isScrolled = false;
    this.init();
  }

  init() {
    const activePage = (document.body.dataset.page || '').toLowerCase();
    const navLinksHTML = this.templates.generateNavLinks(activePage);
    
    this.navbarEl = document.createElement('nav');
    this.navbarEl.id = 'navbar';
    this.navbarEl.innerHTML = `
      <a href="index.html" class="nav-logo">
        <img src="${this.config.LOGO_URL}" alt="Celsior" class="logo-img"/>
      </a>
      <ul class="nav-links" id="navLinks">${navLinksHTML}</ul>
      <div class="nav-right">
        <a href="index.html#contact" class="btn-nav-solid">Contact us ${this.config.ICONS.arrow}</a>
      </div>
      <button class="nav-hamburger" id="hamburger" aria-label="Open menu">
        <span class="ham-line"></span><span class="ham-line"></span><span class="ham-line"></span>
      </button>
    `;

    this.setupScrollListener();
    document.body.insertBefore(this.navbarEl, document.body.firstChild);
  }

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== this.isScrolled) {
        this.isScrolled = scrolled;
        this.navbarEl.classList.toggle('scrolled', scrolled);
      }
    }, { passive: true });
  }

  getElement() {
    return this.navbarEl;
  }

  getHamburger() {
    return this.navbarEl.querySelector('#hamburger');
  }
}

export class MegaMenuComponent {
  constructor(templates) {
    this.templates = templates;
    this.backdropEl = null;
    this.megaRootEl = null;
    this.active = null;
    this.timer = null;
    this.init();
  }

  init() {
    // Create backdrop
    this.backdropEl = document.createElement('div');
    this.backdropEl.id = 'mega-backdrop';
    document.body.insertBefore(this.backdropEl, document.body.firstChild);

    // Create mega menu root
    this.megaRootEl = document.createElement('div');
    this.megaRootEl.className = 'mega-root';
    this.megaRootEl.id = 'megaRoot';
    this.megaRootEl.innerHTML = this.templates.generateAllMegaPanels();

    this.setupEventListeners();
    document.body.insertBefore(this.megaRootEl, this.backdropEl.nextSibling);
  }

  setupEventListeners() {
    const navItemEls = document.querySelectorAll('.nav-item[data-menu]');
    
    navItemEls.forEach(li => {
      li.addEventListener('mouseenter', () => this.openPanel(li.dataset.menu));
      li.addEventListener('mouseleave', () => this.scheduleClose());
    });

    this.megaRootEl.addEventListener('mouseenter', () => this.cancelClose());
    this.megaRootEl.addEventListener('mouseleave', () => this.scheduleClose());
    this.backdropEl.addEventListener('click', () => this.closePanel());
    
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.active) this.closePanel();
    });
  }

  openPanel(id) {
    this.cancelClose();
    if (this.active === id) return;
    
    if (this.active) this.closePanel(true);
    this.active = id;

    // Update active states
    document.querySelectorAll('.nav-item').forEach(li => {
      li.classList.toggle('active', li.dataset.menu === id);
    });

    const panel = document.getElementById(`menu-${id}`);
    if (!panel) return;

    panel.classList.add('open');
    this.backdropEl.classList.add('on');

    // Animation with GSAP if available
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 1, y: 0, duration: 0.36, ease: 'power3.out' });
      
      const animatedElements = panel.querySelectorAll('.mega-links a, .partner-pill, .about-link, .feat-card');
      gsap.from(animatedElements, {
        opacity: 0,
        y: 7,
        duration: 0.26,
        stagger: 0.018,
        ease: 'power2.out',
        delay: 0.06,
        clearProps: 'opacity,y'
      });
    } else {
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    }
  }

  closePanel(fast = false) {
    const panel = document.getElementById(`menu-${this.active}`);
    if (!panel) return;

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, {
        opacity: 0,
        y: -8,
        duration: fast ? 0.14 : 0.24,
        ease: 'power2.in',
        onComplete: () => panel.classList.remove('open')
      });
    } else {
      panel.classList.remove('open');
    }

    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
    this.backdropEl.classList.remove('on');
    this.active = null;
  }

  scheduleClose() {
    this.timer = setTimeout(() => {
      if (this.active) this.closePanel();
    }, 150);
  }

  cancelClose() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getElements() {
    return {
      backdrop: this.backdropEl,
      root: this.megaRootEl
    };
  }
}

export class MobileDrawerComponent {
  constructor(config, templates) {
    this.config = config;
    this.templates = templates;
    this.drawerEl = null;
    this.hamburger = null;
    this.initDeferred = null;
  }

  init(hamburger) {
    if (!hamburger) {
      // Defer initialization until hamburger is available
      this.initDeferred = () => this.init(hamburger);
      return;
    }

    this.hamburger = hamburger;
    
    this.drawerEl = document.createElement('div');
    this.drawerEl.className = 'mobile-drawer';
    this.drawerEl.id = 'mobileDrawer';
    this.drawerEl.innerHTML = `
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <div class="drawer-panel">
        <div class="drawer-header">
          <img src="${this.config.LOGO_URL}" alt="Celsior" class="drawer-logo"/>
          <button class="drawer-close" id="drawerClose" aria-label="Close menu">
            ${this.config.ICONS.close}
          </button>
        </div>
        <nav class="drawer-nav">${this.templates.generateDrawer()}</nav>
        <div class="drawer-cta">
          <a href="index.html#contact" class="drawer-cta-btn">Contact us ${this.config.ICONS.arrow}</a>
        </div>
      </div>
    `;

    this.setupEventListeners();
    
    // Insert after navbar
    const navbar = document.getElementById('navbar');
    if (navbar && navbar.nextSibling) {
      document.body.insertBefore(this.drawerEl, navbar.nextSibling);
    } else {
      document.body.appendChild(this.drawerEl);
    }
  }

  setupEventListeners() {
    const drawerClose = this.drawerEl.querySelector('#drawerClose');
    const drawerBack = this.drawerEl.querySelector('#drawerBackdrop');

    this.hamburger.addEventListener('click', () => {
      const isOpen = this.drawerEl.classList.contains('open');
      isOpen ? this.close() : this.open();
    });

    drawerClose.addEventListener('click', () => this.close());
    drawerBack.addEventListener('click', () => this.close());

    // Drawer sub-menu toggles
    this.drawerEl.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sub = document.getElementById(btn.dataset.drawerToggle);
        const isOpen = sub.classList.contains('open');

        // Close all other submenus
        this.drawerEl.querySelectorAll('.drawer-sub.open').forEach(el => {
          el.classList.remove('open');
        });
        this.drawerEl.querySelectorAll('.drawer-link.active').forEach(el => {
          el.classList.remove('active');
        });

        // Toggle current submenu
        if (!isOpen) {
          sub.classList.add('open');
          btn.classList.add('active');
        }
      });
    });

    // Close drawer when clicking a link
    this.drawerEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => this.close());
    });
  }

  open() {
    this.drawerEl.classList.add('open');
    this.hamburger.classList.add('open');
    document.body.classList.add('menu-open');
  }

  close() {
    this.drawerEl.classList.remove('open');
    this.hamburger.classList.remove('open');
    document.body.classList.remove('menu-open');
    
    // Close all submenus
    this.drawerEl.querySelectorAll('.drawer-sub.open').forEach(el => {
      el.classList.remove('open');
    });
    this.drawerEl.querySelectorAll('.drawer-link.active').forEach(el => {
      el.classList.remove('active');
    });
  }

  getElement() {
    return this.drawerEl;
  }
}

export class FooterComponent {
  constructor(config, templates) {
    this.config = config;
    this.templates = templates;
    this.footerEl = null;
    this.init();
  }

  init() {
    this.footerEl = document.createElement('footer');
    this.footerEl.className = 'site-footer-light';
    this.footerEl.id = 'siteFooterLight';
    this.footerEl.innerHTML = this.templates.generateFooter();
    document.body.appendChild(this.footerEl);
  }

  getElement() {
    return this.footerEl;
  }
}

// Utility function to load CSS
export function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Main initialization function
export async function initializeNavigation() {
  const { CONFIG } = await import('./nav-config.js');
  const templates = await import('./nav-templates.js');
  
  // Load CSS
  await loadCSS('./nav-styles.css');
  
  // Initialize components
  const navbar = new NavbarComponent(CONFIG, templates);
  const megaMenu = new MegaMenuComponent(templates);
  const mobileDrawer = new MobileDrawerComponent(CONFIG, templates);
  const footer = new FooterComponent(CONFIG, templates);
  
  // Wire up mobile drawer with hamburger
  const hamburger = navbar.getHamburger();
  mobileDrawer.init(hamburger);
  
  return {
    navbar,
    megaMenu,
    mobileDrawer,
    footer
  };
}
