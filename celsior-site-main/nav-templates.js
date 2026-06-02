/**
 * nav-templates.js - HTML template generators
 * Pure functions that generate HTML from config data
 */

import { CONFIG } from './nav-config.js';

// Helper function for safe HTML escaping
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Generate navigation links HTML
export function generateNavLinks(activePage) {
  return CONFIG.NAV_ITEMS.map(item => `
    <li class="nav-item${activePage === item.key ? ' nav-current' : ''}" data-menu="${item.key}">
      <a class="nav-link" href="${item.href}">${item.label} ${CONFIG.ICONS.chevron}</a>
    </li>
  `).join('');
}

// Generate single drawer menu
function generateDrawerMenu(id, config) {
  const groupsHtml = config.groups.map(group => {
    const headingHtml = group.heading ? 
      `<div class="drawer-sub-head">${group.heading}</div>` : 
      '';
    
    const linksHtml = group.links.map(link => 
      `<a href="${link.href}">${link.label}</a>`
    ).join('');
    
    return `
      <div class="drawer-sub-group">
        ${headingHtml}
        ${linksHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="${id}">
        ${config.title}${CONFIG.ICONS.drawerChevron}
      </div>
      <div class="drawer-sub" id="${id}">
        ${groupsHtml}
      </div>
    </div>
  `;
}

// Generate complete drawer HTML
export function generateDrawer() {
  const menusHtml = Object.entries(CONFIG.DRAWER_MENUS)
    .map(([id, menuConfig]) => generateDrawerMenu(id, menuConfig))
    .join('');

  return menusHtml;
}

// Generate mega menu link group
function generateMegaLinkGroup(group) {
  if (!group.title && !group.links) return '';
  
  const titleHtml = group.title ? 
    `<div class="mega-group-title">${group.title}</div>` : 
    '';
  
  const linksHtml = group.links ? 
    group.links.map(link => `<li><a href="${link.href}">${link.label}</a></li>`).join('') :
    '';
  
  return `
    <div class="mega-group">
      ${titleHtml}
      <ul class="mega-links">${linksHtml}</ul>
    </div>
  `;
}

// Generate mega menu column
function generateMegaColumn(column, index) {
  const groupsHtml = column.groups.map(generateMegaLinkGroup).join('');
  
  return `
    <div class="mega-col">
      ${index === 0 ? `<div class="mega-label">${column.heading || ''}</div>` : ''}
      ${index > 0 ? `<div class="mega-col-head" style="margin-top:26px">${column.heading || ''}</div>` : ''}
      ${groupsHtml}
    </div>
  `;
}

// Generate featured cards
function generateFeaturedCards(featured) {
  return featured.map(section => `
    <div class="mega-featured">
      <div class="feat-tag">${section.tag}</div>
      ${section.cards.map(card => `
        <div class="feat-card">
          <div class="feat-card-title">${card.title}</div>
          <div class="feat-card-desc">${card.desc}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// Generate partner grid
function generatePartnerGrid(partners) {
  const partnersHtml = partners.map(partner => `
    <a href="${partner.href}" class="partner-pill">
      <span class="p-dot" style="background:${partner.color}"></span>
      ${partner.label}
    </a>
  `).join('');
  
  return `<div class="partner-grid">${partnersHtml}</div>`;
}

// Generate about links
function generateAboutLinks(aboutLinks) {
  return aboutLinks.map(link => `
    <a href="${link.href}" class="about-link">
      <div class="about-icon">${link.icon}</div>
      <span class="about-link-text">${link.label}</span>
    </a>
  `).join('');
}

// Generate mega menu panel
export function generateMegaPanel(id, panelConfig) {
  const columnsHtml = panelConfig.columns.map((column, index) => {
    if (column.partners) {
      return `
        <div class="mega-col">
          ${index === 0 ? `<div class="mega-label">${panelConfig.label}</div>` : ''}
          ${index > 0 ? `<div class="mega-col-head" style="margin-top:26px">${column.heading || ''}</div>` : ''}
          ${generatePartnerGrid(column.partners)}
        </div>
      `;
    } else if (column.aboutLinks) {
      return `
        <div class="mega-col" style="flex:1.2">
          ${index === 0 ? `<div class="mega-label">${panelConfig.label}</div>` : `<div class="mega-col-head" style="margin-top:26px">${column.heading || ''}</div>`}
          <div class="about-links">
            ${generateAboutLinks(column.aboutLinks)}
          </div>
        </div>
      `;
    } else {
      return generateMegaColumn(column, index);
    }
  }).join('');

  const featuredHtml = panelConfig.featured ? generateFeaturedCards(panelConfig.featured) : '';
  
  // Handle different layouts (e.g., About page has special max-width)
  const isAbout = id === 'about';
  
  return `
    <div class="mega-panel" id="menu-${id}">
      <div class="mega-inner" ${isAbout ? 'style="max-width:900px"' : ''}>
        ${columnsHtml}
        ${featuredHtml}
      </div>
    </div>
  `;
}

// Generate all mega panels
export function generateAllMegaPanels() {
  return Object.entries(CONFIG.MEGA_PANELS)
    .map(([id, config]) => generateMegaPanel(id, config))
    .join('');
}

// Footer templates
export function generateFooter() {
  const columnsHtml = CONFIG.FOOTER.columns.map(col => `
    <div class="fl-col">
      <p class="fl-col-head">${col.heading}</p>
      <nav class="fl-col-links">
        ${col.links.map(link => `
          <a href="${link.href}" class="fl-col-link">
            ${link.label}
            ${link.badge ? `<span class="fl-badge">${link.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
    </div>
  `).join('');

  const socialIconsHtml = CONFIG.FOOTER.socials.map(social => `
    <a href="#" class="fl-social-btn" aria-label="${social.label}">
      <svg viewBox="0 0 24 24" fill="currentColor">
        ${getSocialSvgPath(social.platform)}
      </svg>
    </a>
  `).join('');

  const locationsHtml = CONFIG.FOOTER.locations.map(loc => `
    <div class="fl-loc">
      <div class="fl-loc-dot"></div>
      <div class="fl-loc-text">
        <span class="fl-loc-city">${loc.city}</span>
        <span class="fl-loc-country">${loc.country}</span>
      </div>
    </div>
  `).join('');

  const legalHtml = CONFIG.FOOTER.legal.map(link => `
    <a href="${link.href}" class="fl-legal-link">${link.label}</a>
  `).join('');

  const trustHtml = CONFIG.FOOTER.trust.map(item => `
    <span class="fl-trust-pill">
      ${getTrustSvg(item.icon)}
      ${item.label}
    </span>
  `).join('');

  return `
    <footer class="site-footer-light" id="siteFooterLight">
      <div class="fl-top">
        <div class="fl-brand">
          <a href="index.html">
            <img src="${CONFIG.LOGO_URL}" alt="Celsior" class="fl-logo"/>
          </a>
          <p class="fl-tagline">${CONFIG.FOOTER.tagline}</p>
          <div class="fl-subscribe">
            <input type="email" placeholder="${CONFIG.FOOTER.subscribe.placeholder}" autocomplete="email"/>
            <button type="button">${CONFIG.FOOTER.subscribe.buttonText}</button>
          </div>
        </div>
        <div class="fl-social">
          <span class="fl-social-label">Follow Us</span>
          <div class="fl-social-icons">${socialIconsHtml}</div>
        </div>
      </div>

      <div class="fl-grid">${columnsHtml}</div>

      <div class="fl-locations">${locationsHtml}</div>

      <div class="fl-bottom">
        <p class="fl-copyright">
          &copy; 2026 <strong>CelsiorTech, Inc.</strong> All rights reserved. 
          Built for regulated enterprises that run on reliability.
        </p>
        <nav class="fl-legal" aria-label="Legal">${legalHtml}</nav>
        <div class="fl-trust">${trustHtml}</div>
      </div>
    </footer>
  `;
}

// SVG path helpers for social icons
function getSocialSvgPath(platform) {
  const paths = {
    linkedin: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
    twitter: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25h6.988l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>',
    github: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
    youtube: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
    instagram: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>'
  };
  return paths[platform] || '';
}

function getTrustSvg(iconType) {
  if (iconType === 'star') {
    return `<svg viewBox="0 0 12 12" fill="none"><path d="M6 1.5L7.4 4.4l3.1.45-2.25 2.2.53 3.1L6 8.62l-2.78 1.53.53-3.1L1.5 4.85l3.1-.45L6 1.5z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>`;
  } else if (iconType === 'card') {
    return `<svg viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="8" height="10" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M4 5h4M4 7.5h2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`;
  }
  return '';
}
