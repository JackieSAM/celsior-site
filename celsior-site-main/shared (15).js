/**
 * shared.js — Celsior site-wide nav + footer injector
 * Include this script on EVERY page (load with `defer`). Active nav item
 * is auto-detected from the URL filename; you can override with
 * <body data-page="how">.
 *
 * Pages: home | solve | how | deliver | ai | industries | partners | about
 *
 * Homepage safety: the script auto-skips injection if the page already
 * ships its own <nav id="navbar"> or <footer id="siteFooterLight">, OR
 * if <body data-shared="off"> is set. So you can drop
 *   <script src="shared.js" defer></script>
 * into index.html without producing duplicate headers/footers.
 */
(function () {
  if (window.__celsiorSharedLoaded) return;
  window.__celsiorSharedLoaded = true;

  /* ─── 0a. SITE-WIDE CONFIG (edit IDs once they exist) ───────────────
     Leave any value as '' to disable that integration. See SETUP.md.
  ─────────────────────────────────────────────────────────────────── */
  const SITE_CONFIG = (window.SITE_CONFIG = Object.assign({
    favicon: 'https://res.cloudinary.com/dden4hawr/image/upload/v1780826237/Favicon_l8iwo5.png',
    siteName: 'Pyramid Consulting',
    defaultDescription: 'AI-first digital engineering partner for regulated industries — modernizing critical systems, operationalizing AI, and building resilience at scale.',
    defaultOgImage: '',           // optional absolute URL
    twitterHandle: '',            // e.g. '@pyramidci'
    ga4MeasurementId: '',         // e.g. 'G-XXXXXXX'
    gtmContainerId: '',           // e.g. 'GTM-XXXXXXX'
    gscVerificationCode: '',      // Search Console meta-tag content
    recaptchaSiteKey: '',         // reCAPTCHA v3 site key
    policiesBase: 'policies/',    // folder where the 7 PDFs live, relative to site root
  }, window.SITE_CONFIG || {}));

  /* ─── 0b. FAVICON + SEO META + GTM/GA + GSC ─────────────────────── */
  (function injectHead(){
    const head = document.head;
    const link = (rel, href, extra) => { const l = document.createElement('link'); l.rel = rel; l.href = href; if (extra) Object.assign(l, extra); return l; };
    const meta = (attr, val, content) => { const m = document.createElement('meta'); m.setAttribute(attr, val); m.content = content; return m; };

    if (SITE_CONFIG.favicon) {
      head.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]').forEach(n => n.remove());
      head.appendChild(link('icon', SITE_CONFIG.favicon, { type: 'image/png' }));
      head.appendChild(link('apple-touch-icon', SITE_CONFIG.favicon));
      head.appendChild(link('shortcut icon', SITE_CONFIG.favicon));
    }

    if (!document.querySelector('meta[name="viewport"]')) head.appendChild(meta('name','viewport','width=device-width, initial-scale=1, viewport-fit=cover'));
    if (!document.querySelector('meta[name="description"]')) head.appendChild(meta('name','description', SITE_CONFIG.defaultDescription));
    if (!document.querySelector('meta[name="theme-color"]')) head.appendChild(meta('name','theme-color','#3B6FFF'));
    if (!document.querySelector('meta[name="robots"]')) head.appendChild(meta('name','robots','index, follow, max-image-preview:large'));

    const titleText = (document.title && document.title.trim()) || SITE_CONFIG.siteName;
    if (!document.title) document.title = titleText;
    const descEl = document.querySelector('meta[name="description"]');
    const descText = (descEl && descEl.content) || SITE_CONFIG.defaultDescription;
    const pageUrl = location.origin + location.pathname;

    const og = [
      ['og:title', titleText], ['og:description', descText],
      ['og:type', 'website'], ['og:url', pageUrl], ['og:site_name', SITE_CONFIG.siteName],
    ];
    if (SITE_CONFIG.defaultOgImage) og.push(['og:image', SITE_CONFIG.defaultOgImage]);
    og.forEach(([p, c]) => { if (!document.querySelector('meta[property="'+p+'"]')) head.appendChild(meta('property', p, c)); });

    const tw = [
      ['twitter:card', SITE_CONFIG.defaultOgImage ? 'summary_large_image' : 'summary'],
      ['twitter:title', titleText], ['twitter:description', descText],
    ];
    if (SITE_CONFIG.twitterHandle) tw.push(['twitter:site', SITE_CONFIG.twitterHandle]);
    if (SITE_CONFIG.defaultOgImage) tw.push(['twitter:image', SITE_CONFIG.defaultOgImage]);
    tw.forEach(([n, c]) => { if (!document.querySelector('meta[name="'+n+'"]')) head.appendChild(meta('name', n, c)); });

    if (!document.querySelector('link[rel="canonical"]')) head.appendChild(link('canonical', pageUrl));

    if (SITE_CONFIG.gscVerificationCode && !document.querySelector('meta[name="google-site-verification"]')) {
      head.appendChild(meta('name','google-site-verification', SITE_CONFIG.gscVerificationCode));
    }

    if (!document.querySelector('script[data-ld="org"]')) {
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.setAttribute('data-ld','org');
      s.textContent = JSON.stringify({
        '@context':'https://schema.org','@type':'Organization',
        name:'Pyramid Consulting, Inc.', url: location.origin, logo: SITE_CONFIG.favicon
      });
      head.appendChild(s);
    }

    // Consent-gated loader; cookie banner calls this on Accept
    window.__loadAnalytics = function loadAnalytics(){
      if (window.__analyticsLoaded) return;
      window.__analyticsLoaded = true;
      if (SITE_CONFIG.gtmContainerId) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        const gtm = document.createElement('script');
        gtm.async = true;
        gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + SITE_CONFIG.gtmContainerId;
        head.appendChild(gtm);
      }
      if (SITE_CONFIG.ga4MeasurementId) {
        const ga = document.createElement('script');
        ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + SITE_CONFIG.ga4MeasurementId;
        head.appendChild(ga);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        const ccpaOut = localStorage.getItem('ccpa_opt_out') === '1';
        window.gtag('config', SITE_CONFIG.ga4MeasurementId, {
          anonymize_ip: true,
          allow_ad_personalization_signals: !ccpaOut,
        });
      }
      if (SITE_CONFIG.recaptchaSiteKey && !window.grecaptcha) {
        const rc = document.createElement('script');
        rc.async = true; rc.defer = true;
        rc.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_CONFIG.recaptchaSiteKey;
        head.appendChild(rc);
      }
    };
  })();

  /* ─── 0c. SKIP-LINK for keyboard accessibility ─────────────────── */
  (function skipLink(){
    if (document.getElementById('skipToMain')) return;
    const a = document.createElement('a');
    a.id = 'skipToMain'; a.href = '#main'; a.textContent = 'Skip to main content';
    a.style.cssText = 'position:fixed;top:-100px;left:8px;z-index:99999;background:#0F172A;color:#fff;padding:10px 16px;border-radius:8px;font:600 14px/1 system-ui,sans-serif;transition:top .15s;';
    a.addEventListener('focus', () => { a.style.top = '8px'; });
    a.addEventListener('blur',  () => { a.style.top = '-100px'; });
    document.addEventListener('DOMContentLoaded', () => document.body.prepend(a), { once: true });
  })();



  /* ─── 0.  LEGACY LINK NORMALIZER ────────────────────────────────────
     Some existing pages, especially index.html, ship their own header and
     may still contain old URLs. Normalize those links before any guard can
     skip injection, and intercept clicks as a second safety net.
  ─────────────────────────────────────────────────────────────────── */
  const LEGACY_LINK_MAP = {
    'what-we-solve.html': 'Our_Focus.html',
    'how-we-do-it.html': 'Capabilities.html',
    'how-we-deliver.html': 'Solutions.html',
    'our_focus.html': 'Our_Focus.html',
    'capabilties.html': 'Capabilities.html',
    'capabilities.html': 'Capabilities.html',
    'solutions.html': 'Solutions.html',
  };

  function normalizeLegacyHref(rawHref) {
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return rawHref;
    try {
      const url = new URL(rawHref, window.location.href);
      if (url.origin !== window.location.origin && !/^(file:)$/.test(window.location.protocol)) return rawHref;
      const file = (url.pathname.split('/').pop() || '').toLowerCase();
      const replacement = LEGACY_LINK_MAP[file];
      if (!replacement) return rawHref;
      const folder = url.pathname.slice(0, Math.max(0, url.pathname.lastIndexOf('/') + 1));
      return `${folder}${replacement}${url.search}${url.hash}`;
    } catch (_) {
      const clean = rawHref.split('#')[0].split('?')[0].split('/').pop().toLowerCase();
      const replacement = LEGACY_LINK_MAP[clean];
      return replacement ? rawHref.replace(/[^/?#]+\.html/i, replacement) : rawHref;
    }
  }

  function rewriteLegacyLinks(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (link) {
      const fixedHref = normalizeLegacyHref(link.getAttribute('href'));
      if (fixedHref && fixedHref !== link.getAttribute('href')) link.setAttribute('href', fixedHref);
    });
  }

  function keepLegacyLinksNormalized() {
    rewriteLegacyLinks(document);
    document.addEventListener('DOMContentLoaded', function () { rewriteLegacyLinks(document); }, { once: true });
    window.addEventListener('load', function () { rewriteLegacyLinks(document); }, { once: true });
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.target && mutation.target.matches && mutation.target.matches('a[href]')) {
            rewriteLegacyLinks(mutation.target.parentNode || document);
          }
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) rewriteLegacyLinks(node);
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }
  }

  function installLegacyClickGuard() {
    document.addEventListener('click', function (event) {
      const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;
      const currentHref = link.getAttribute('href');
      const fixedHref = normalizeLegacyHref(currentHref);
      if (!fixedHref || fixedHref === currentHref) return;
      event.preventDefault();
      link.setAttribute('href', fixedHref);
      window.location.href = fixedHref;
    }, true);
  }

  /* ─── 1.  OPT-OUT / EXISTING ELEMENT DETECTION ─────────────────────
     Clean site-wide rule:
       • shared.js is the single source of truth for secondary-page nav/footer.
       • Existing complete homepage nav/footer are respected, so no duplicates.
       • Missing or empty placeholders are filled independently.
  ─────────────────────────────────────────────────────────────────── */
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', function () {
      keepLegacyLinksNormalized();
      installLegacyClickGuard();
      window.__celsiorSharedLoaded = false;
      const s = document.createElement('script');
      s.src = (document.currentScript && document.currentScript.src) || 'shared.js';
      s.defer = true;
      document.head.appendChild(s);
    }, { once: true });
    return;
  }
  keepLegacyLinksNormalized();
  installLegacyClickGuard();

  if (document.body.dataset.shared === 'off') {
    console.info('[shared.js] Skipped injection — body[data-shared="off"].');
    return;
  }

  function hasUsableNav() {
    const nav = document.getElementById('navbar');
    return !!(nav && nav.querySelector('a[href], button, .nav-link, .nav-logo'));
  }

  function hasUsableFooter() {
    const footer = document.getElementById('siteFooterLight') || document.querySelector('footer');
    return !!(footer && footer.querySelector('a[href], .fl-grid, .fl-brand, .fl-bottom'));
  }

  const shouldInjectNav = !hasUsableNav();
  const shouldInjectFooter = !hasUsableFooter();

  if (!shouldInjectNav && !shouldInjectFooter) {
    console.info('[shared.js] Existing complete nav and footer found — normalized links only.');
    return;
  }

  /* ─── 1.  INJECT CSS ──────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
/* ═══════════════════════ SHARED TOKENS ════════════════════════════ */
:root {
  --white:#ffffff; --bg:#f5f6fa; --ink:#0d1127; --ink-mid:#3a4060;
  --muted:#7b82a0; --border:rgba(15,20,50,0.09); --border-md:rgba(15,20,50,0.15);
  --accent:#2254f4; --accent-lt:rgba(34,84,244,0.09); --nav-h:68px;
  --font-head:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  --font-body:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  --ease-expo:cubic-bezier(0.16,1,0.3,1); --btn-gradient:#000000;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--white);color:var(--ink);font-family:var(--font-body);-webkit-font-smoothing:antialiased;overflow-x:hidden;}
body.menu-open{overflow:hidden;}
a{text-decoration:none;color:inherit;}ul{list-style:none;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#f0f0f5;}
::-webkit-scrollbar-thumb{background:var(--accent);border-radius:4px;}

/* ═══════════════════════ NAVBAR ════════════════════════════════════ */
#navbar{position:fixed;inset:0 0 auto 0;z-index:1000;height:var(--nav-h);display:flex;align-items:center;padding:0 52px;transition:background .45s ease,box-shadow .45s ease,border-color .45s ease;border-bottom:1px solid transparent;}
#navbar.scrolled{background:rgba(255,255,255,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);box-shadow:0 2px 28px rgba(15,20,80,.07);}
.nav-logo{display:flex;align-items:center;flex-shrink:0;margin-right:44px;}
.logo-img{height:28px;width:auto;display:block;filter:brightness(0) invert(1);transition:filter .4s ease;}
#navbar.scrolled .logo-img{filter:brightness(0);}
.nav-links{display:flex;align-items:center;gap:2px;flex:1;}
.nav-item{position:static;}
.nav-link{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;font-family:var(--font-body);font-size:.8rem;font-weight:600;letter-spacing:.01em;border-radius:6px;cursor:pointer;user-select:none;white-space:nowrap;color:rgba(255,255,255,.82);transition:color .2s,background .2s;}
.nav-link:hover{color:var(--white);background:rgba(255,255,255,.1);text-decoration:none;}
.nav-item.active>.nav-link{color:var(--white);background:rgba(255,255,255,.13);}
#navbar.scrolled .nav-link{color:var(--ink-mid);}
#navbar.scrolled .nav-link:hover{color:var(--accent);background:var(--accent-lt);}
#navbar.scrolled .nav-item.active>.nav-link{color:var(--accent);background:var(--accent-lt);}
.nav-item.nav-current>.nav-link{color:var(--white) !important;background:rgba(255,255,255,.15) !important;}
#navbar.scrolled .nav-item.nav-current>.nav-link{color:var(--accent) !important;background:var(--accent-lt) !important;}
a.nav-link{text-decoration:none;}
.chevron{width:11px;height:11px;opacity:.5;transition:transform .25s var(--ease-expo),opacity .2s;flex-shrink:0;}
.nav-item.active>.nav-link .chevron{transform:rotate(180deg);opacity:1;}
.nav-right{margin-left:auto;display:flex;align-items:center;gap:12px;flex-shrink:0;}
.btn-nav-solid{display:inline-flex;align-items:center;gap:8px;padding:9px 22px;font-family:var(--font-body);font-size:.8rem;font-weight:700;border-radius:6px;border:1.5px solid rgba(255,255,255,.5);cursor:pointer;background:transparent;color:var(--white);transition:background .2s,border-color .2s,color .2s,transform .22s var(--ease-expo),box-shadow .22s;}
.btn-nav-solid:hover{background:var(--white);color:var(--ink);border-color:var(--white);transform:translateY(-2px);}
#navbar.scrolled .btn-nav-solid{background:var(--btn-gradient);color:var(--white);border-color:transparent;}
#navbar.scrolled .btn-nav-solid:hover{background:#111;box-shadow:0 8px 28px rgba(0,0,0,.32);}
.nav-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;margin-left:auto;width:38px;height:38px;background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;transition:background .2s;}
.nav-hamburger:hover{background:rgba(255,255,255,.1);}
#navbar.scrolled .nav-hamburger:hover{background:var(--accent-lt);}
.ham-line{width:100%;height:2px;background:var(--white);border-radius:2px;transition:background .4s,transform .3s,opacity .3s;transform-origin:center;}
#navbar.scrolled .ham-line{background:var(--ink);}
.nav-hamburger.open .ham-line:nth-child(1){transform:translateY(7px) rotate(45deg);}
.nav-hamburger.open .ham-line:nth-child(2){opacity:0;transform:scaleX(0);}
.nav-hamburger.open .ham-line:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
@media(max-width:1280px){#navbar{padding:0 32px;}.nav-link{padding:7px 9px;font-size:.76rem;}.btn-nav-solid{padding:8px 16px;}.nav-logo{margin-right:28px;}}@media(max-width:1139px){.nav-links,.nav-right{display:none;}.nav-hamburger{display:flex;}#navbar{padding:0 24px;}}

/* ═══════════════════════ MOBILE DRAWER ════════════════════════════ */
.mobile-drawer{position:fixed;inset:0;z-index:999;display:flex;pointer-events:none;}
.drawer-backdrop{position:absolute;inset:0;background:rgba(7,9,20,.55);opacity:0;transition:opacity .35s ease;}
.drawer-panel{position:absolute;top:0;right:0;width:min(360px,88vw);height:100%;background:var(--white);box-shadow:-20px 0 60px rgba(15,20,80,.18);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .4s var(--ease-expo);overflow-y:auto;-webkit-overflow-scrolling:touch;}
.mobile-drawer.open{pointer-events:auto;}
.mobile-drawer.open .drawer-backdrop{opacity:1;}
.mobile-drawer.open .drawer-panel{transform:translateX(0);}
.drawer-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border);flex-shrink:0;}
.drawer-logo{height:24px;width:auto;filter:brightness(0);}
.drawer-close{width:34px;height:34px;background:var(--bg);border:1px solid var(--border);border-radius:8px;display:grid;place-items:center;cursor:pointer;color:var(--ink-mid);transition:background .2s,color .2s;}
.drawer-close:hover{background:var(--accent-lt);color:var(--accent);}
.drawer-nav{flex:1;padding:12px 0;}
.drawer-item{border-bottom:1px solid var(--border);}
.drawer-link{display:flex;align-items:center;justify-content:space-between;padding:15px 24px;font-family:var(--font-body);font-size:.9rem;font-weight:600;color:var(--ink);cursor:pointer;transition:color .15s,background .15s;user-select:none;}
.drawer-link:hover{color:var(--accent);background:var(--accent-lt);}
.drawer-link.active{color:var(--accent);}
.drawer-chevron{width:16px;height:16px;color:var(--muted);transition:transform .25s var(--ease-expo),color .2s;flex-shrink:0;}
.drawer-link.active .drawer-chevron{transform:rotate(180deg);color:var(--accent);}
.drawer-sub{display:none;background:var(--bg);padding:8px 0;}
.drawer-sub.open{display:block;}
.drawer-sub-group{padding:10px 24px 4px;}
.drawer-sub-head{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;padding-left:10px;border-left:2px solid var(--accent);}
.drawer-sub a{display:block;padding:6px 24px 6px 34px;font-size:.8rem;font-weight:500;color:var(--ink-mid);transition:color .15s;}
.drawer-sub a:hover{color:var(--accent);}
.drawer-cta{padding:20px 24px;border-top:1px solid var(--border);flex-shrink:0;}
.drawer-cta-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:var(--btn-gradient);color:var(--white);font-family:var(--font-body);font-size:.875rem;font-weight:700;border-radius:8px;border:none;cursor:pointer;text-align:center;transition:opacity .2s,transform .2s;}
.drawer-cta-btn:hover{opacity:.88;transform:translateY(-1px);}

/* ═══════════════════════ MEGA BACKDROP + PANELS ════════════════════ */
#mega-backdrop{position:fixed;inset:0;z-index:800;background:transparent;pointer-events:none;transition:background .3s;}
#mega-backdrop.on{background:rgba(7,9,20,.45);pointer-events:auto;}
.mega-root{position:fixed;top:var(--nav-h);left:0;right:0;z-index:850;pointer-events:none;}
.mega-panel{position:absolute;inset:0 auto auto 0;width:100%;background:linear-gradient(118deg,#fbfcff 0%,#f3f8ff 46%,#e9f1ff 100%);border-bottom:1px solid rgba(34,84,244,.12);box-shadow:0 30px 80px rgba(15,20,80,.16);padding:46px 52px 50px;display:none;opacity:0;transform:translateY(-10px);pointer-events:none;overflow:hidden;}
.mega-panel.open{display:block;pointer-events:auto;}
.mega-inner{position:relative;z-index:2;max-width:1320px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1.16fr .92fr;gap:0;}
.mega-zone{padding:0 42px;border-right:1px solid var(--border);min-width:0;}
.mega-zone:first-child{padding-left:0;}
.mega-zone:last-child{padding-right:0;border-right:none;}

/* — left intro zone — */
.mz-label{font-family:var(--font-head);font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;display:flex;align-items:center;gap:12px;}
.mz-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border-md),transparent);}
.mz-title{font-family:var(--font-head);font-size:1.34rem;font-weight:700;line-height:1.18;color:var(--ink);margin-bottom:12px;letter-spacing:-.02em;}
.mz-desc{font-size:.82rem;line-height:1.6;color:var(--muted);margin-bottom:22px;max-width:300px;}
.mz-list{display:flex;flex-direction:column;gap:8px;}
.mz-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fff;border:1px solid var(--border);border-radius:10px;font-size:.84rem;font-weight:600;color:var(--ink);box-shadow:0 1px 2px rgba(15,20,80,.03);transition:border-color .3s var(--ease-expo),transform .3s var(--ease-expo),box-shadow .3s,color .2s;}
.mz-item:hover{border-color:var(--accent);color:var(--accent);transform:translateX(5px);box-shadow:0 10px 26px rgba(34,84,244,.13);}
.mz-item svg{width:14px;height:14px;color:var(--muted);transition:transform .3s var(--ease-expo),color .2s;flex-shrink:0;}
.mz-item:hover svg{color:var(--accent);transform:translateX(3px);}
.mz-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px;}
.mz-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:8px;border:1px solid var(--border);font-size:.74rem;font-weight:600;color:var(--ink-mid);background:#fff;transition:border-color .2s,color .2s,transform .25s var(--ease-expo);}
.mz-pill:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px);}
.mz-pill .p-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}

/* — center feature zone — */
.mz-feature-card{display:block;border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:0 14px 38px rgba(15,20,80,.12);background:#0b1020;position:relative;aspect-ratio:16/8;}
.mz-feature-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);transition:transform .9s var(--ease-expo);}
.mz-feature-card:hover .mz-feature-img{transform:scale(1.12);}
.mz-feature-card::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(7,11,26,.82),rgba(7,11,26,.12) 62%,transparent);}
.mz-feature-cap{position:absolute;left:18px;right:18px;bottom:16px;z-index:2;color:#fff;font-family:var(--font-head);font-size:.94rem;font-weight:700;line-height:1.3;}
.mz-feature-cap em{color:#3ddc97;font-style:normal;}
.mz-feature-body{margin-top:18px;}
.mz-feature-title{font-family:var(--font-head);font-size:1.06rem;font-weight:700;color:var(--ink);margin-bottom:8px;}
.mz-feature-desc{font-size:.82rem;line-height:1.62;color:var(--muted);margin-bottom:18px;}
.mz-explore{display:inline-flex;align-items:center;gap:9px;padding:11px 22px;background:var(--accent);color:#fff;font-size:.8rem;font-weight:700;border-radius:8px;transition:transform .3s var(--ease-expo),box-shadow .3s,background .2s;}
.mz-explore svg{transition:transform .3s var(--ease-expo);}
.mz-explore:hover{background:#1b46d8;transform:translateY(-2px);box-shadow:0 12px 28px rgba(34,84,244,.34);}
.mz-explore:hover svg{transform:translateX(4px);}

/* — right assessment zone — */
.mz-assess-label{font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;}
.mz-assess-cards{display:flex;flex-direction:column;gap:14px;}
.mz-assess-card{display:flex;gap:14px;padding:18px;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 2px rgba(15,20,80,.03);cursor:pointer;transition:border-color .3s var(--ease-expo),transform .3s var(--ease-expo),box-shadow .3s;}
.mz-assess-card:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 16px 36px rgba(34,84,244,.15);}
.mz-assess-icon{width:42px;height:42px;flex-shrink:0;border-radius:10px;background:var(--accent-lt);display:grid;place-items:center;color:var(--accent);transition:background .25s,color .25s;}
.mz-assess-card:hover .mz-assess-icon{background:var(--accent);color:#fff;}
.mz-assess-icon svg{width:20px;height:20px;}
.mz-assess-title{font-family:var(--font-head);font-size:.92rem;font-weight:700;color:var(--ink);margin-bottom:5px;line-height:1.25;}
.mz-assess-desc{font-size:.78rem;line-height:1.55;color:var(--muted);}

@media(max-width:1180px){.mega-inner{grid-template-columns:1fr 1fr;}.mega-zone{padding:0 30px;}.mega-zone:last-child{grid-column:1/-1;border-top:1px solid var(--border);border-right:none;margin-top:30px;padding:30px 0 0;}.mz-assess-cards{flex-direction:row;}.mz-assess-card{flex:1;}}
@media(max-width:1024px){.mega-panel{padding:32px;}}


/* ═══════════════════════ FOOTER ════════════════════════════════════ */
.site-footer-light{
  --cf-bg:#080b18;--cf-bg2:#0b0f20;--cf-ink:#e9edf6;--cf-mid:#aab3c9;
  --cf-soft:#828ca6;--cf-muted:#5c6580;--cf-border:rgba(255,255,255,0.08);
  --cf-border2:rgba(255,255,255,0.15);--cf-accent:#3b6fff;
  --cf-font:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  background:var(--cf-bg);color:var(--cf-ink);font-family:var(--cf-font);
  -webkit-font-smoothing:antialiased;position:relative;z-index:2;overflow:hidden;border-top:1px solid var(--cf-border);
}
.site-footer-light::before{content:'';position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:1100px;height:500px;background:radial-gradient(ellipse,rgba(59,111,255,.10) 0%,transparent 70%);pointer-events:none;z-index:0;}
.cf-wrap{position:relative;z-index:1;max-width:1340px;margin:0 auto;padding:0 56px;}
.cf-top{display:grid;grid-template-columns:1.5fr repeat(5,1fr);gap:44px 28px;padding:66px 0 52px;}
.cf-brand{display:flex;flex-direction:column;}
.cf-logo{height:26px;width:auto;filter:brightness(0) invert(1);display:block;transition:opacity .25s;}
.cf-logo:hover{opacity:.7;}
.cf-tagline{font-size:.85rem;line-height:1.72;color:var(--cf-mid);margin-top:22px;max-width:300px;}
.cf-sub-head{font-size:.98rem;font-weight:700;color:var(--cf-ink);margin-top:30px;}
.cf-sub-desc{font-size:.78rem;line-height:1.6;color:var(--cf-soft);margin-top:9px;max-width:280px;}
.cf-subscribe{display:flex;margin-top:15px;max-width:300px;}
.cf-subscribe input{flex:1;min-width:0;background:rgba(255,255,255,.04);border:1px solid var(--cf-border2);border-right:none;border-radius:8px 0 0 8px;padding:11px 14px;font-family:inherit;font-size:.8rem;color:var(--cf-ink);outline:none;transition:border-color .2s,background .2s;}
.cf-subscribe input::placeholder{color:var(--cf-muted);}
.cf-subscribe input:focus{border-color:var(--cf-accent);background:rgba(255,255,255,.07);}
.cf-subscribe button{padding:0 20px;background:var(--cf-accent);border:none;border-radius:0 8px 8px 0;font-family:inherit;font-size:.8rem;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;transition:background .2s;}
.cf-subscribe button:hover{background:#2a5cf0;}
.cf-connect{font-size:.98rem;font-weight:700;color:var(--cf-ink);margin-top:32px;}
.cf-social{display:flex;gap:10px;margin-top:15px;}
.cf-social a{width:38px;height:38px;border-radius:9px;border:1px solid var(--cf-border2);background:rgba(255,255,255,.03);display:grid;place-items:center;color:var(--cf-mid);transition:background .22s,color .22s,transform .22s cubic-bezier(.16,1,.3,1),border-color .22s;}
.cf-social a:hover{background:var(--cf-accent);border-color:transparent;color:#fff;transform:translateY(-3px);}
.cf-social svg{width:16px;height:16px;}
.cf-col-head{font-size:.92rem;font-weight:700;color:var(--cf-ink);margin-bottom:18px;}
.cf-col-links{display:flex;flex-direction:column;gap:1px;}
.cf-col-link{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;font-size:.8rem;color:var(--cf-soft);transition:color .18s,padding-left .24s cubic-bezier(.16,1,.3,1);}
.cf-col-link span{flex:1;}
.cf-col-link svg{width:11px;height:11px;opacity:.35;transform:translateX(0);transition:opacity .2s,transform .24s cubic-bezier(.16,1,.3,1),color .2s;flex-shrink:0;color:var(--cf-soft);}
.cf-col-link:hover{color:var(--cf-ink);padding-left:6px;}
.cf-col-link:hover svg{opacity:1;transform:translateX(3px);color:var(--cf-accent);}
.cf-divider{position:relative;z-index:1;height:1px;background:var(--cf-border);max-width:1340px;margin:0 auto;}
.cf-mid{display:grid;grid-template-columns:repeat(4,1fr) 1.6fr;gap:36px 28px;padding:50px 0;align-items:start;}
.cf-contact-line{display:flex;gap:9px;font-size:.8rem;line-height:1.55;color:var(--cf-soft);margin-bottom:15px;align-items:flex-start;}
.cf-contact-line svg{width:14px;height:14px;flex-shrink:0;margin-top:2px;color:var(--cf-accent);}
.cf-contact-line a:hover{color:var(--cf-ink);}
.cf-cta{background:linear-gradient(135deg,rgba(59,111,255,.14),rgba(59,111,255,.02));border:1px solid var(--cf-border2);border-radius:16px;padding:30px;display:flex;align-items:center;gap:24px;}
.cf-cta-circle{width:64px;height:64px;flex-shrink:0;border-radius:50%;border:1px solid var(--cf-accent);display:grid;place-items:center;color:var(--cf-accent);transition:background .3s,color .3s,transform .35s cubic-bezier(.16,1,.3,1);}
.cf-cta:hover .cf-cta-circle{background:var(--cf-accent);color:#fff;transform:rotate(-12deg) scale(1.05);}
.cf-cta-circle svg{width:24px;height:24px;}
.cf-cta-title{font-size:1.14rem;font-weight:700;color:var(--cf-ink);line-height:1.25;}
.cf-cta-desc{font-size:.8rem;color:var(--cf-soft);margin:9px 0 13px;}
.cf-cta-link{display:inline-flex;align-items:center;gap:7px;font-size:.85rem;font-weight:700;color:var(--cf-accent);}
.cf-cta-link svg{width:14px;height:14px;transition:transform .24s cubic-bezier(.16,1,.3,1);}
.cf-cta-link:hover svg{transform:translateX(4px);}
.cf-bottom{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;max-width:1340px;margin:0 auto;padding:24px 56px 36px;border-top:1px solid var(--cf-border);}
.cf-copyright{font-size:.74rem;color:var(--cf-muted);line-height:1.5;}
.cf-legal{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;flex:1;justify-content:center;}
.cf-legal a{font-size:.74rem;color:var(--cf-soft);transition:color .15s;}
.cf-legal a:hover{color:var(--cf-ink);}
.cf-lang{display:flex;align-items:center;gap:8px;padding:9px 14px;border:1px solid var(--cf-border2);border-radius:8px;font-size:.78rem;color:var(--cf-mid);cursor:pointer;transition:border-color .2s,background .2s;}
.cf-lang:hover{border-color:var(--cf-accent);background:rgba(255,255,255,.03);}
.cf-lang svg{width:13px;height:13px;}
.cf-lang .cf-globe{color:var(--cf-accent);}
@media(max-width:1100px){.cf-top{grid-template-columns:repeat(3,1fr);}.cf-brand{grid-column:1/-1;}.cf-mid{grid-template-columns:repeat(2,1fr);}.cf-cta{grid-column:1/-1;}}
@media(max-width:680px){.cf-wrap{padding:0 24px;}.cf-top{grid-template-columns:1fr 1fr;padding:48px 0 40px;}.cf-mid{grid-template-columns:1fr;}.cf-cta{flex-direction:column;text-align:left;align-items:flex-start;}.cf-bottom{flex-direction:column;align-items:flex-start;padding:22px 24px 32px;}.cf-legal{justify-content:flex-start;}}

/* ═══════════════════════ MOBILE DRAWER — MEGA CARDS ════════════════
   Rich content (feature card + assessment cards) injected into each
   drawer-sub from MEGA_DATA so mobile users see the same depth as the
   desktop mega menu. Fully responsive across phones and tablets.
─────────────────────────────────────────────────────────────────── */
.drawer-mega{padding:14px 20px 18px;display:flex;flex-direction:column;gap:14px;}
.drawer-mega-feature{position:relative;display:block;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:#0b1020;aspect-ratio:16/9;box-shadow:0 10px 28px rgba(15,20,80,.14);}
.drawer-mega-feature img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.drawer-mega-feature::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(7,11,26,.85),rgba(7,11,26,.15) 60%,transparent);}
.drawer-mega-cap{position:absolute;left:14px;right:14px;bottom:12px;z-index:2;color:#fff;font-family:var(--font-head);font-size:.82rem;font-weight:700;line-height:1.3;}
.drawer-mega-cap em{color:#3ddc97;font-style:normal;}
.drawer-mega-explore{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;background:var(--accent);color:#fff;font-size:.78rem;font-weight:700;border-radius:8px;transition:background .2s,transform .2s;}
.drawer-mega-explore:hover{background:#1b46d8;transform:translateY(-1px);}
.drawer-mega-explore svg{width:12px;height:12px;}
.drawer-mega-assess-label{font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-top:4px;}
.drawer-mega-assess{display:flex;flex-direction:column;gap:10px;}
.drawer-mega-card{display:flex;gap:12px;padding:12px 14px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:0 1px 2px rgba(15,20,80,.04);transition:border-color .2s,transform .2s,box-shadow .2s;}
.drawer-mega-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 10px 22px rgba(34,84,244,.14);}
.drawer-mega-card .ic{width:34px;height:34px;flex-shrink:0;border-radius:8px;background:var(--accent-lt);display:grid;place-items:center;color:var(--accent);}
.drawer-mega-card .ic svg{width:16px;height:16px;}
.drawer-mega-card .bd{min-width:0;}
.drawer-mega-card .t{font-family:var(--font-head);font-size:.82rem;font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:3px;}
.drawer-mega-card .d{font-size:.72rem;line-height:1.5;color:var(--muted);}
.drawer-mega-pills{display:flex;flex-wrap:wrap;gap:6px;}
.drawer-mega-pills a{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:.7rem;font-weight:600;color:var(--ink-mid);background:#fff;}
.drawer-mega-pills a .p-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);}

/* Drawer link list tightening on narrow screens */
@media(max-width:480px){
  .drawer-panel{width:min(420px,100vw);}
  .drawer-header{padding:16px 18px;}
  .drawer-link{padding:14px 18px;font-size:.88rem;}
  .drawer-sub-group{padding:10px 18px 4px;}
  .drawer-sub a{padding:6px 18px 6px 30px;font-size:.78rem;}
  .drawer-cta{padding:16px 18px;}
  .drawer-mega{padding:12px 16px 16px;}
}
@media(max-width:360px){
  .drawer-panel{width:100vw;}
  .drawer-mega-feature{aspect-ratio:16/10;}
}

/* Make the rest of the page more bulletproof on small screens */
@media(max-width:1139px){
  body.menu-open{position:fixed;width:100%;}
}

`;
  document.head.appendChild(style);

  /* ─── 2.  DETERMINE ACTIVE PAGE ───────────────────────────────────── */
  // Priority: explicit body[data-page] override → auto-detect from URL filename.
  const PAGE_MAP = {
    'index.html':        'home',
    '':                  'home',
    'our_focus.html':    'solve',
    'what-we-solve.html':'solve',
    'capabilities.html': 'how',
    'how-we-do-it.html': 'how',
    'solutions.html':    'deliver',
    'how-we-deliver.html':'deliver',
    'ai-innovation.html':'ai',
    'industries.html':   'industries',
    'partner-ecosystem.html':'partners',
    'about.html':        'about',
    'blogs.html':        'blog',
    'blog.html':         'blog',
  };
  let activePage = (document.body.dataset.page || '').toLowerCase();
  if (!activePage) {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    activePage = PAGE_MAP[file] || '';
  }

  /* ─── 3.  NAV HTML ───────────────────────────────────────────────── */
  const LOGO = 'https://cdn.fastpixel.io/fp/ret_img+v_80dc+q_lossy+to_webp/celsiortech.com%2Fwp-content%2Fuploads%2F2024%2F11%2FCelsior.svg';
  const CHEVRON_SVG = `<svg class="chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ARROW_SVG = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const navItems = [
    { key: 'solve',      label: 'Our Focus',           href: 'Our_Focus.html'          },
    { key: 'how',        label: 'Capabilities',         href: 'Capabilities.html'       },
    { key: 'deliver',    label: 'Solutions',            href: 'Solutions.html'          },
    { key: 'ai',         label: 'AI &amp; Innovation',  href: 'ai-innovation.html'      },
    { key: 'industries', label: 'Industries',           href: 'industries.html'         },
    { key: 'partners',   label: 'Partner Ecosystem',    href: 'partner-ecosystem.html'  },
    { key: 'about',      label: 'About',                href: 'about.html'              },
  ];

  const navLinksHTML = navItems.map(it => `
    <li class="nav-item${activePage === it.key ? ' nav-current' : ''}" data-menu="${it.key}">
      <a class="nav-link" href="${it.href}">${it.label} ${CHEVRON_SVG}</a>
    </li>`).join('');

  const drawerDivHTML = `

    <!-- ═══════════════════════════════════════════════════════════
         MOBILE DRAWER  —  one <a href="..."> per line for easy editing
         Placeholder links point to the parent page.
         Search for "/* ← LINK */" to jump to any individual URL.
         ═══════════════════════════════════════════════════════════ -->

    <!-- ── OUR FOCUS ──────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-solve">Our Focus<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-solve">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Priorities</div>
          <a href="ai-first-digital-engineering.html">AI-First Digital Engineering</a>
          <a href="ai-adoption.html">AI Adoption</a>
          <a href="risk-compliance.html">Risk &amp; Compliance</a>
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Outcomes</div>
          <a href="cost-efficiency.html">Cost &amp; Efficiency</a>
          <a href="digital-experience.html">Digital Experience</a>
        </div>

      </div>
    </div>

    <!-- ── CAPABILITIES ───────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-how">Capabilities<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-how">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Engineering</div>
          <a href="ai-led-engineering.html">AI Led Engineering</a>
          <a href="cloud-infrastructure-engineering.html">Cloud &amp; Infrastructure Engineering</a>
          <a href="ai-and-data.html">AI &amp; Data</a>
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Operations</div>
          <a href="digital-operations.html">Digital Operations &amp; Security</a>
          <a href="security-governance.html">Security &amp; Governance</a>
        </div>



      </div>
    </div>

    <!-- ── SOLUTIONS ──────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-deliver">Solutions<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-deliver">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Programs</div>
          <a href="managed-programs.html">Managed Programs</a>
          <a href="technology-consulting.html">Technology Consulting</a>
          <a href="ai-upskilling.html">AI Upskilling</a>
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Global Delivery</div>
          <a href="gcc-nearshore.html">GCC &amp; Nearshore</a>
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Talent Models</div>
          <a href="teams-as-a-service.html">Teams-as-a-Service</a>
          <a href="hire-train-deploy.html">Hire-Train-Deploy</a>
        </div>

      </div>
    </div>

    <!-- ── AI & INNOVATION ────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-ai">AI &amp; Innovation<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-ai">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Products</div>
          <a href="synthetix.html">Synthetix</a>
          <a href="celsior-ai-lab.html">Celsior AI Lab</a>
          <a href="design-lab.html">Design Lab</a>
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Programs</div>
          <a href="centers-of-excellence.html">Centers of Excellence</a>
          <a href="frameworks-accelerators.html">Frameworks &amp; Accelerators</a>
        </div>

      </div>
    </div>

    <!-- ── INDUSTRIES ─────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-ind">Industries<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-ind">

        <div class="drawer-sub-group">
          <a href="banking-financial-services.html">Banking &amp; Financial Services</a>
          <a href="insurance.html">Insurance</a>
          <a href="healthcare.html">Healthcare</a>
        </div>

      </div>
    </div>

    <!-- ── PARTNER ECOSYSTEM ──────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-part">Partner Ecosystem<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-part">

        <div class="drawer-sub-group">
          <a href="partners.html">Partners</a>
        </div>

      </div>
    </div>

    <!-- ── ABOUT ──────────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-about">About<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-about">

        <div class="drawer-sub-group">
          <a href="about-leadership.html">Who we are + Our Leadership</a>
          <a href="ai-first-philosophy.html">AI-first Philosophy</a>
          <a href="success-stories.html">Success Stories</a>
          <a href="blogs.html">Blogs</a>
          <a href="careers.html">Careers</a>
          <a href="events-news.html">Events &amp; News</a>
        </div>

      </div>
    </div>

`;

  const FEATURE_IMG = 'https://res.cloudinary.com/dden4hawr/image/upload/v1780833974/fd85d9f6b205b835d020b87cf50dfc5490c63510_ntepey.png';
  const ITEM_CHEV = `<svg viewBox="0 0 12 12" fill="none"><path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const IC_DOC = `<svg viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 16.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const IC_CHART = `<svg viewBox="0 0 24 24" fill="none"><path d="M5 4v15a1 1 0 0 0 1 1h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9 14l3-3 2.5 2.5L19 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ASSESS_ICONS = [IC_DOC, IC_CHART];

  /* Data-driven mega panels. Links preserved from the original menus. */
  const MEGA_DATA = [
    {
      id:'solve', label:'Our Focus', title:'AI-First Digital Engineering',
      desc:'We build intelligent digital products and platforms that unlock efficiency, resilience, and growth.',
      explore:{label:'Explore Solutions', href:'Our_Focus.html'},
      items:[
        {label:'AI Adoption', href:'ai-adoption.html'},
        {label:'Risk &amp; Compliance', href:'risk-compliance.html'},
        {label:'Cost &amp; Efficiency', href:'cost-efficiency.html'},
        {label:'Digital Experience', href:'digital-experience.html'},
        {label:'AI-First Digital Engineering', href:'ai-first-digital-engineering.html'},
      ],
      feature:{cap:'<em>AI-First</em> digital engineering that evolves at the speed of your business.', title:'AI-First Digital Engineering', desc:'Build intelligent products, automate workflows, and modernize technology platforms with AI-driven engineering solutions.'},
      assessTag:'Free Assessment',
      assess:[
        {title:'Modernization Diagnostic', desc:'2-week assessment of your legacy landscape with a prioritized roadmap.'},
        {title:'AI Readiness Index', desc:'Benchmark your AI maturity against industry peers.'},
      ],
    },
    {
      id:'how', label:'Capabilities', title:'Engineering &amp; Operations',
      desc:'Modern engineering capabilities that move regulated enterprises faster, safer, and smarter.',
      explore:{label:'Explore Capabilities', href:'Capabilities.html'},
      items:[
        {label:'AI Led Engineering', href:'ai-led-engineering.html'},
        {label:'Cloud &amp; Infrastructure Engineering', href:'cloud-infrastructure-engineering.html'},
        {label:'AI &amp; Data', href:'ai-and-data.html'},
        {label:'Digital Operations &amp; Security', href:'digital-operations.html'},
        {label:'Security &amp; Governance', href:'security-governance.html'},
      ],
      feature:{cap:'<em>Platform engineering</em> built for scale and resilience.', title:'Platform Engineering at Scale', desc:'Golden paths for global banks with 200+ engineering teams, delivered with governance built in from day one.'},
      assessTag:'Spotlight',
      assess:[
        {title:'Cloud Acceleration', desc:'Migrate and modernize critical workloads with zero-downtime patterns.'},
        {title:'Engineering Health Check', desc:'Assess delivery velocity, quality, and platform maturity.'},
      ],
    },
    {
      id:'deliver', label:'Solutions', title:'Global Delivery Models',
      desc:'Flexible operating models that match your scale, speed, and talent strategy.',
      explore:{label:'Explore Solutions', href:'Solutions.html'},
      items:[
        {label:'Managed Programs', href:'managed-programs.html'},
        {label:'Technology Consulting', href:'technology-consulting.html'},
        {label:'AI Upskilling', href:'ai-upskilling.html'},
        {label:'GCC &amp; Nearshore', href:'gcc-nearshore.html'},
        {label:'Teams-as-a-Service', href:'teams-as-a-service.html'},
        {label:'Hire-Train-Deploy', href:'hire-train-deploy.html'},
      ],
      feature:{cap:'<em>The right model</em> for your scale and goals.', title:'GCC vs. Teams-as-a-Service', desc:'Compare cost, control, and speed side by side to find the right operating model for your enterprise.'},
      assessTag:'Compare Models',
      assess:[
        {title:'Operating Model Fit', desc:'Map your goals to the ideal delivery and talent model.'},
        {title:'Nearshore ROI', desc:'Model savings and velocity gains across LATAM and offshore.'},
      ],
    },
    {
      id:'ai', label:'AI &amp; Innovation', title:'AI &amp; Innovation',
      desc:'Products, labs, and frameworks that turn AI ambition into production reality.',
      explore:{label:'Explore AI &amp; Innovation', href:'ai-innovation.html'},
      items:[
        {label:'Synthetix', href:'synthetix.html'},
        {label:'Celsior AI Lab', href:'celsior-ai-lab.html'},
        {label:'Design Lab', href:'design-lab.html'},
        {label:'Centers of Excellence', href:'centers-of-excellence.html'},
        {label:'Frameworks &amp; Accelerators', href:'frameworks-accelerators.html'},
      ],
      feature:{cap:'<em>Synthetix</em> orchestrates policy, claims, and risk in real time.', title:'Synthetix in Action', desc:'See how our AI orchestration layer connects critical systems with enterprise-grade governance.'},
      assessTag:'Live Demo',
      assess:[
        {title:'AI Readiness Index', desc:'Benchmark your AI maturity against industry peers.'},
        {title:'GenAI Accelerators', desc:'Ship copilots and agentic workflows in weeks, not quarters.'},
      ],
    },
    {
      id:'industries', label:'Industries', title:'Industries We Serve',
      desc:'Deep domain expertise across the most regulated and complex sectors.',
      explore:{label:'Explore Industries', href:'industries.html'},
      items:[
        {label:'Banking &amp; Financial Services', href:'banking-financial-services.html'},
        {label:'Insurance', href:'insurance.html'},
        {label:'Healthcare', href:'healthcare.html'},
      ],
      feature:{cap:'<em>Modernize</em> without disruption.', title:'Regulated Industry Playbook', desc:'How leading banks, insurers, and health systems modernize critical systems with confidence.'},
      assessTag:'Industry Brief',
      assess:[
        {title:'Compliance Diagnostic', desc:'Assess regulatory readiness across your technology estate.'},
        {title:'Risk &amp; Resilience Index', desc:'Benchmark operational resilience against sector peers.'},
      ],
    },
    {
      id:'partners', label:'Partner Ecosystem', title:'Partner Ecosystem',
      desc:'A curated network of technology and implementation partners that amplify outcomes.',
      explore:{label:'Explore Partners', href:'partner-ecosystem.html'},
      items:[
        {label:'Partners', href:'partners.html'},
      ],
      pills:['ServiceNow','Guidewire','AWS','Azure','Google Cloud','Snowflake','Dynatrace','UiPath'],
      feature:{cap:'<em>Join</em> the Celsior ecosystem.', title:'Become a Partner', desc:'Partner with Celsior to deliver AI-first transformation for regulated enterprises worldwide.'},
      assessTag:'Partnerships',
      assess:[
        {title:'Alliance Programs', desc:'Co-build and co-sell with our technology partners.'},
        {title:'Integration Library', desc:'Pre-built accelerators across leading platforms.'},
      ],
    },
    {
      id:'about', label:'About', title:'About Celsior',
      desc:'Engineering-first culture, global teams, and a mission built for regulated enterprises.',
      explore:{label:'Explore About', href:'about.html'},
      items:[
        {label:'Who we are + Our Leadership', href:'about-leadership.html'},
        {label:'AI-first Philosophy', href:'ai-first-philosophy.html'},
        {label:'Success Stories', href:'success-stories.html'},
        {label:'Blogs', href:'blogs.html'},
        {label:'Careers', href:'careers.html'},
        {label:'Events &amp; News', href:'events-news.html'},
      ],
      feature:{cap:'<em>Engineering-first</em> culture, global impact.', title:'Life at Celsior', desc:'Join a team building the future of AI-first digital engineering across the globe.'},
      assessTag:'Join Us',
      assess:[
        {title:'Open Roles', desc:'Explore engineering and consulting opportunities worldwide.'},
        {title:'Our Leadership', desc:'Meet the team driving Celsior\'s mission and vision.'},
      ],
    },
  ];

  function buildMegaPanel(d) {
    const items = d.items.map(it => `<a class="mz-item" href="${it.href}">${it.label} ${ITEM_CHEV}</a>`).join('');
    const pills = d.pills ? `<div class="mz-pills">${d.pills.map(p => `<a class="mz-pill" href="${d.items[0].href}"><span class="p-dot"></span>${p}</a>`).join('')}</div>` : '';
    const assess = d.assess.map((a,i) => `
        <a class="mz-assess-card" href="${d.explore.href}">
          <div class="mz-assess-icon">${ASSESS_ICONS[i % ASSESS_ICONS.length]}</div>
          <div><div class="mz-assess-title">${a.title}</div><div class="mz-assess-desc">${a.desc}</div></div>
        </a>`).join('');
    return `
  <div class="mega-panel" id="menu-${d.id}">
    <div class="mega-inner">
      <div class="mega-zone">
        <div class="mz-label">${d.label}</div>
        <h3 class="mz-title">${d.title}</h3>
        <p class="mz-desc">${d.desc}</p>
        <div class="mz-list">${items}</div>
        ${pills}
      </div>
      <div class="mega-zone">
        <a class="mz-feature-card" href="${d.explore.href}">
          <img class="mz-feature-img" src="${FEATURE_IMG}" alt="${d.feature.title}" loading="lazy"/>
          <div class="mz-feature-cap">${d.feature.cap}</div>
        </a>
        <div class="mz-feature-body">
          <div class="mz-feature-title">${d.feature.title}</div>
          <p class="mz-feature-desc">${d.feature.desc}</p>
          <a class="mz-explore" href="${d.explore.href}">${d.explore.label} ${ARROW_SVG}</a>
        </div>
      </div>
      <div class="mega-zone">
        <div class="mz-assess-label">${d.assessTag}</div>
        <div class="mz-assess-cards">${assess}</div>
      </div>
    </div>
  </div>`;
  }

  const megaPanelsHTML = MEGA_DATA.map(buildMegaPanel).join('\n');


  let backdropEl = document.getElementById('mega-backdrop');
  let navEl = document.getElementById('navbar');
  let drawerEl = document.getElementById('mobileDrawer');
  let megaRoot = document.getElementById('megaRoot');

  if (shouldInjectNav) {
    const oldNav = document.getElementById('navbar');
    if (oldNav) oldNav.remove();
    const oldBackdrop = document.getElementById('mega-backdrop');
    if (oldBackdrop) oldBackdrop.remove();
    const oldDrawer = document.getElementById('mobileDrawer');
    if (oldDrawer) oldDrawer.remove();
    const oldMegaRoot = document.getElementById('megaRoot');
    if (oldMegaRoot) oldMegaRoot.remove();

    // Inject backdrop + nav root
    backdropEl = document.createElement('div');
    backdropEl.id = 'mega-backdrop';
    document.body.insertBefore(backdropEl, document.body.firstChild);

    navEl = document.createElement('nav');
    navEl.id = 'navbar';
    navEl.innerHTML = `
      <a href="index.html" class="nav-logo">
        <img src="${LOGO}" alt="Celsior" class="logo-img"/>
      </a>
      <ul class="nav-links" id="navLinks">${navLinksHTML}</ul>
      <div class="nav-right">
        <a href="index.html#contact" class="btn-nav-solid">Contact us ${ARROW_SVG}</a>
      </div>
      <button class="nav-hamburger" id="hamburger" aria-label="Open menu">
        <span class="ham-line"></span><span class="ham-line"></span><span class="ham-line"></span>
      </button>`;
    document.body.insertBefore(navEl, document.body.firstChild);

    // Drawer
    drawerEl = document.createElement('div');
    drawerEl.className = 'mobile-drawer';
    drawerEl.id = 'mobileDrawer';
    drawerEl.innerHTML = `
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <div class="drawer-panel">
        <div class="drawer-header">
          <img src="${LOGO}" alt="Celsior" class="drawer-logo"/>
          <button class="drawer-close" id="drawerClose" aria-label="Close menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
        <nav class="drawer-nav">${drawerDivHTML}</nav>
        <div class="drawer-cta">
          <a href="index.html#contact" class="drawer-cta-btn">Contact us ${ARROW_SVG}</a>
        </div>
      </div>`;
    document.body.insertBefore(drawerEl, navEl.nextSibling);

    // Mega root
    megaRoot = document.createElement('div');
    megaRoot.className = 'mega-root';
    megaRoot.id = 'megaRoot';
    megaRoot.innerHTML = megaPanelsHTML;
    document.body.insertBefore(megaRoot, drawerEl.nextSibling);

    /* ─── 3b.  AUGMENT MOBILE DRAWER WITH MEGA CARDS ────────────────
       Inject the rich content (feature card + assessment cards + pills)
       from MEGA_DATA into each .drawer-sub so the mobile experience
       mirrors the desktop mega menu. Original drawer link groups are
       preserved untouched. */
    const DRAWER_MEGA_MAP = {
      'd-solve':'solve','d-how':'how','d-deliver':'deliver','d-ai':'ai',
      'd-ind':'industries','d-part':'partners','d-about':'about'
    };
    Object.keys(DRAWER_MEGA_MAP).forEach(function(subId){
      const sub = drawerEl.querySelector('#' + subId);
      if (!sub) return;
      const data = MEGA_DATA.find(function(m){ return m.id === DRAWER_MEGA_MAP[subId]; });
      if (!data) return;
      const pillsHTML = data.pills
        ? `<div class="drawer-mega-pills">${data.pills.map(function(p){ return `<a href="${data.items[0].href}"><span class="p-dot"></span>${p}</a>`; }).join('')}</div>`
        : '';
      const assessHTML = (data.assess || []).map(function(a,i){
        return `<a class="drawer-mega-card" href="${data.explore.href}">
          <div class="ic">${ASSESS_ICONS[i % ASSESS_ICONS.length]}</div>
          <div class="bd"><div class="t">${a.title}</div><div class="d">${a.desc}</div></div>
        </a>`;
      }).join('');
      const mega = document.createElement('div');
      mega.className = 'drawer-mega';
      mega.innerHTML = `
        <a class="drawer-mega-feature" href="${data.explore.href}" aria-label="${data.feature.title}">
          <img src="${FEATURE_IMG}" alt="${data.feature.title}" loading="lazy"/>
          <div class="drawer-mega-cap">${data.feature.cap}</div>
        </a>
        <a class="drawer-mega-explore" href="${data.explore.href}">${data.explore.label} ${ARROW_SVG}</a>
        ${pillsHTML}
        ${data.assessTag ? `<div class="drawer-mega-assess-label">${data.assessTag}</div>` : ''}
        <div class="drawer-mega-assess">${assessHTML}</div>
      `;
      sub.appendChild(mega);
    });
  }


  /* ─── 4.  FOOTER HTML ─────────────────────────────────────────────── */
  const footerEl = document.createElement('footer');
  footerEl.className = 'site-footer-light';
  footerEl.id = 'siteFooterLight';
  const CF_CHEV = `<svg viewBox="0 0 12 12" fill="none"><path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function cfCol(head, links){
    return `<div class="cf-col"><p class="cf-col-head">${head}</p><nav class="cf-col-links">${
      links.map(l => `<a href="${l.href}" class="cf-col-link"><span>${l.label}</span>${CF_CHEV}</a>`).join('')
    }</nav></div>`;
  }

  footerEl.innerHTML = `
  <div class="cf-wrap">
    <div class="cf-top">
      <div class="cf-brand">
        <a href="index.html"><img src="${LOGO}" alt="Celsior" class="cf-logo"/></a>
        <p class="cf-tagline">AI-first digital engineering partner for regulated industries modernizing critical systems, operationalizing AI, and building resilience at scale.</p>
        <p class="cf-sub-head">Stay informed</p>
        <p class="cf-sub-desc">Insights on AI, compliance, and operational resilience delivered to your inbox.</p>
        <div class="cf-subscribe">
          <input type="email" placeholder="Enter your work email" autocomplete="email"/>
          <button type="button">Subscribe</button>
        </div>
        <p class="cf-connect">Connect with us</p>
        <div class="cf-social">
          <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="#" aria-label="X / Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25h6.988l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg></a>
          <a href="#" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
          <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
          <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
        </div>
      </div>
      ${cfCol('Our Focus',[
        {label:'AI-First Digital Engineering', href:'ai-first-digital-engineering.html'},
        {label:'AI Adoption', href:'ai-adoption.html'},
        {label:'Risk &amp; Compliance', href:'risk-compliance.html'},
        {label:'Cost &amp; Efficiency', href:'cost-efficiency.html'},
        {label:'Digital Experience', href:'digital-experience.html'},
      ])}
      ${cfCol('Capabilities',[
        {label:'AI-Led Engineering', href:'ai-led-engineering.html'},
        {label:'Cloud &amp; Infrastructure', href:'cloud-infrastructure-engineering.html'},
        {label:'AI &amp; Data', href:'ai-and-data.html'},
        {label:'Digital Operations &amp; Sec.', href:'digital-operations.html'},
        {label:'Security &amp; Governance', href:'security-governance.html'},
      ])}
      ${cfCol('Solutions',[
        {label:'Managed Programs', href:'managed-programs.html'},
        {label:'Technology Consulting', href:'technology-consulting.html'},
        {label:'GCC &amp; Nearshore', href:'gcc-nearshore.html'},
        {label:'Teams-as-a-Service', href:'teams-as-a-service.html'},
        {label:'AI Upskilling', href:'ai-upskilling.html'},
      ])}
      ${cfCol('AI &amp; Innovation',[
        {label:'Synthetix', href:'synthetix.html'},
        {label:'Celsior AI Lab', href:'celsior-ai-lab.html'},
        {label:'Design Lab', href:'design-lab.html'},
        {label:'Frameworks &amp; Acc.', href:'frameworks-accelerators.html'},
      ])}
      ${cfCol('Industries',[
        {label:'Banking &amp; Financial', href:'banking-financial-services.html'},
        {label:'Insurance', href:'insurance.html'},
        {label:'Healthcare', href:'healthcare.html'},
      ])}
    </div>
  </div>

  <div class="cf-divider"></div>

  <div class="cf-wrap">
    <div class="cf-mid">
      ${cfCol('About',[
        {label:'Our Focus', href:'Our_Focus.html'},
        {label:'Capabilities', href:'Capabilities.html'},
        {label:'Solutions', href:'Solutions.html'},
        {label:'AI &amp; Innovation', href:'ai-innovation.html'},
        {label:'Industries', href:'industries.html'},
      ])}
      ${cfCol('Company',[
        {label:'About', href:'about.html'},
        {label:'Partners', href:'partner-ecosystem.html'},
        {label:'Careers', href:'careers.html'},
      ])}
      ${cfCol('Resources',[
        {label:'Insights', href:'blogs.html'},
        {label:'Whitepapers', href:'blogs.html'},
        {label:'Webinars', href:'events-news.html'},
        {label:'Newsroom', href:'events-news.html'},
        {label:'Events', href:'events-news.html'},
      ])}
      <div class="cf-col">
        <p class="cf-col-head">Contact</p>
        <div class="cf-contact-line">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg>
          <span>Celsior Technologies, Inc.<br/>1000 Parkwood Circle, Suite 100<br/>Atlanta, GA 30339, USA</span>
        </div>
        <div class="cf-contact-line">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 16l1 4v0a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <a href="tel:+14045550198">+1 (404) 555-0198</a>
        </div>
        <div class="cf-contact-line">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <a href="mailto:info@pyramidconsulting.com">info@pyramidconsulting.com</a>
        </div>
      </div>
      <div class="cf-cta">
        <div class="cf-cta-circle">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div class="cf-cta-title">Ready to transform your enterprise with AI?</div>
          <p class="cf-cta-desc">Let's build what's next, together.</p>
          <a href="index.html#contact" class="cf-cta-link">Contact Us <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        </div>
      </div>
    </div>
  </div>

  <div class="cf-bottom">
    <p class="cf-copyright">&copy; 2026 Pyramid Consulting, Inc. All rights reserved.</p>
    <nav class="cf-legal" aria-label="Legal">
      <a href="${SITE_CONFIG.policiesBase}gdpr.pdf" download>GDPR</a>
      <a href="${SITE_CONFIG.policiesBase}ccpa-cpra.pdf" download>CCPA/CPRA</a>
      <a href="${SITE_CONFIG.policiesBase}privacy.pdf" download>Privacy</a>
      <a href="${SITE_CONFIG.policiesBase}reasonable-accommodation.pdf" download>Reasonable Accommodation Policy</a>
      <a href="${SITE_CONFIG.policiesBase}microsoft-privacy-statement.pdf" download>Microsoft privacy statement</a>
      <a href="${SITE_CONFIG.policiesBase}web-accessibility.pdf" download>Web accessibility</a>
      <a href="${SITE_CONFIG.policiesBase}privacy-introduction.pdf" download>Privacy introduction</a>
      <a href="#" data-action="ccpa-opt-out">Do Not Sell or Share My Info</a>
      <a href="#" data-action="cookie-prefs">Cookie preferences</a>
    </nav>

    <div class="cf-lang">
      <svg class="cf-globe" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" stroke="currentColor" stroke-width="1.6"/></svg>
      <span>English</span>
      <svg viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </div>`;


  if (shouldInjectFooter) {
    const oldFooter = document.getElementById('siteFooterLight');
    if (oldFooter) oldFooter.remove();
    document.body.appendChild(footerEl);
    // Footer entrance micro-interactions (GSAP if present, IntersectionObserver-triggered)
    (function animateFooter(){
      if (typeof IntersectionObserver === 'undefined') return;
      const targets = footerEl.querySelectorAll('.cf-brand,.cf-top .cf-col,.cf-mid .cf-col,.cf-cta');
      if (typeof gsap === 'undefined') return;
      gsap.set(targets, { opacity: 0, y: 26 });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            gsap.to(en.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' });
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      targets.forEach(t => io.observe(t));
    })();
  }

  if (!shouldInjectNav) return;

  /* ─── 5.  NAV JAVASCRIPT ──────────────────────────────────────────── */
  // Scroll state
  // Blog page: always show the "scrolled" (light) nav styling because the
  // page background is white from the top.
  const forceScrolled = activePage === 'blog';
  if (forceScrolled) {
    navEl.classList.add('scrolled', 'force-scrolled');
  }
  window.addEventListener('scroll', () => {
    if (forceScrolled) { navEl.classList.add('scrolled'); return; }
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  if (!forceScrolled) navEl.classList.toggle('scrolled', window.scrollY > 40);


  // Desktop mega menu
  const navItemEls = navEl.querySelectorAll('.nav-item[data-menu]');
  const bdEl = backdropEl;
  let active = null, timer = null;

  function openPanel(id) {
    clearTimeout(timer);
    if (active === id) return;
    if (active) killPanel(active, true);
    active = id;
    navItemEls.forEach(li => li.classList.toggle('active', li.dataset.menu === id));
    const panel = document.getElementById('menu-' + id);
    if (!panel) return;
    panel.classList.add('open');
    bdEl.classList.add('on');
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 1, y: 0, duration: 0.36, ease: 'power3.out' });
      gsap.from(panel.querySelectorAll('.mega-zone'), { opacity: 0, y: 10, duration: 0.34, stagger: 0.05, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.from(panel.querySelectorAll('.mz-item,.mz-assess-card,.mz-pill'), { opacity: 0, y: 8, duration: 0.3, stagger: 0.025, ease: 'power2.out', delay: 0.08, clearProps: 'opacity,transform' });
    } else {
      panel.style.opacity = '1'; panel.style.transform = 'translateY(0)';
    }
  }

  function killPanel(id, fast) {
    const panel = document.getElementById('menu-' + id);
    if (!panel) return;
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 0, y: -8, duration: fast ? 0.14 : 0.24, ease: 'power2.in', onComplete: () => panel.classList.remove('open') });
    } else {
      panel.classList.remove('open');
    }
    navItemEls.forEach(li => li.classList.remove('active'));
    bdEl.classList.remove('on');
    active = null;
  }

  const sched = () => { timer = setTimeout(() => { if (active) killPanel(active); }, 150); };
  const cancel = () => clearTimeout(timer);

  navItemEls.forEach(li => {
    li.addEventListener('mouseenter', () => openPanel(li.dataset.menu));
    li.addEventListener('mouseleave', sched);
  });
  megaRoot.addEventListener('mouseenter', cancel);
  megaRoot.addEventListener('mouseleave', sched);
  bdEl.addEventListener('click', () => { if (active) killPanel(active); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) killPanel(active); });

  // Mobile drawer
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBack = document.getElementById('drawerBackdrop');

  function openDrawer() { mobileDrawer.classList.add('open'); hamburger.classList.add('open'); document.body.classList.add('menu-open'); }
  function closeDrawer() { mobileDrawer.classList.remove('open'); hamburger.classList.remove('open'); document.body.classList.remove('menu-open'); }

  hamburger.addEventListener('click', () => mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
  drawerClose.addEventListener('click', closeDrawer);
  drawerBack.addEventListener('click', closeDrawer);

  mobileDrawer.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.dataset.drawerToggle);
      const isOpen = sub.classList.contains('open');
      mobileDrawer.querySelectorAll('.drawer-sub.open').forEach(el => el.classList.remove('open'));
      mobileDrawer.querySelectorAll('.drawer-link.active').forEach(el => el.classList.remove('active'));
      if (!isOpen) { sub.classList.add('open'); btn.classList.add('active'); }
    });
  });
  mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ─── 6.  READY SIGNAL ───────────────────────────────────────────────
     Lets pages defer work (e.g. footer entrance animations) until after
     the nav + footer are safely in the DOM.
  ─────────────────────────────────────────────────────────────────── */
  window.__celsiorSharedDone = true;
  document.dispatchEvent(new CustomEvent('celsior:shared-ready'));

  /* ─── 7. COOKIE CONSENT + CCPA OPT-OUT ────────────────────────────
     Banner shows once per visitor (localStorage). Footer "Cookie
     preferences" and "Do Not Sell or Share My Info" links reopen the
     modals. Analytics scripts only load after Accept.
  ─────────────────────────────────────────────────────────────────── */
  (function consent(){
    const CONSENT_KEY = 'cookie_consent_v1';
    const CCPA_KEY = 'ccpa_opt_out';
    const stored = localStorage.getItem(CONSENT_KEY);

    const css = document.createElement('style');
    css.textContent = `
      .ck-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:880px;margin:0 auto;background:#fff;color:#0F172A;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 18px 50px -16px rgba(15,23,42,.25);padding:18px 20px;z-index:99998;display:flex;gap:16px;align-items:center;flex-wrap:wrap;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;}
      .ck-banner p{margin:0;flex:1;min-width:240px;color:#334155;}
      .ck-banner strong{color:#0F172A;}
      .ck-banner a{color:#3B6FFF;text-decoration:underline;}
      .ck-btns{display:flex;gap:8px;flex-wrap:wrap;}
      .ck-btn{appearance:none;border:1px solid #CBD5E1;background:#fff;color:#0F172A;padding:9px 16px;border-radius:8px;font:600 13px/1 inherit;cursor:pointer;transition:.15s;}
      .ck-btn:hover{border-color:#3B6FFF;color:#3B6FFF;}
      .ck-btn.primary{background:#3B6FFF;border-color:#3B6FFF;color:#fff;}
      .ck-btn.primary:hover{background:#2952d6;border-color:#2952d6;color:#fff;}
      .ck-modal{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999;}
      .ck-modal-card{background:#fff;border-radius:16px;max-width:520px;width:100%;padding:28px;font:14px/1.55 system-ui,sans-serif;color:#0F172A;}
      .ck-modal-card h3{margin:0 0 8px;font-size:1.15rem;}
      .ck-modal-card p{margin:0 0 16px;color:#475569;}
      .ck-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid #E2E8F0;}
      .ck-row:first-of-type{border-top:none;}
      .ck-row label{font-weight:600;}
      .ck-row small{display:block;font-weight:400;color:#64748B;margin-top:2px;}
      @media(max-width:520px){.ck-banner{padding:16px;border-radius:12px;}}
    `;
    document.head.appendChild(css);

    function buildBanner(){
      const b = document.createElement('div');
      b.className = 'ck-banner'; b.setAttribute('role','dialog'); b.setAttribute('aria-label','Cookie consent');
      b.innerHTML = `
        <p><strong>We value your privacy.</strong> We use cookies to enhance your experience, analyze traffic, and personalize content. See our <a href="${SITE_CONFIG.policiesBase}privacy.pdf" download>Privacy Policy</a>.</p>
        <div class="ck-btns">
          <button class="ck-btn" data-act="reject">Reject all</button>
          <button class="ck-btn" data-act="prefs">Preferences</button>
          <button class="ck-btn primary" data-act="accept">Accept all</button>
        </div>`;
      b.addEventListener('click', e => {
        const act = e.target.dataset && e.target.dataset.act;
        if (!act) return;
        if (act === 'accept') { setConsent('all'); b.remove(); }
        else if (act === 'reject') { setConsent('essential'); b.remove(); }
        else if (act === 'prefs') { b.remove(); openPrefs(); }
      });
      return b;
    }

    function setConsent(level){
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ level, ts: Date.now() }));
      if (level === 'all' || level === 'analytics') {
        if (typeof window.__loadAnalytics === 'function') window.__loadAnalytics();
      }
    }

    function openPrefs(){
      const cur = (() => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)) || {}; } catch(_) { return {}; } })().level || 'essential';
      const m = document.createElement('div'); m.className = 'ck-modal';
      m.innerHTML = `
        <div class="ck-modal-card" role="dialog" aria-modal="true" aria-label="Cookie preferences">
          <h3>Cookie preferences</h3>
          <p>Choose which categories of cookies we may use. You can change this at any time from the footer.</p>
          <div class="ck-row"><label>Essential <small>Required for the site to function.</small></label><span>Always on</span></div>
          <div class="ck-row"><label for="ck-an">Analytics <small>Helps us understand site usage.</small></label><input id="ck-an" type="checkbox" ${cur==='all'||cur==='analytics'?'checked':''}></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
            <button class="ck-btn" data-act="cancel">Cancel</button>
            <button class="ck-btn primary" data-act="save">Save preferences</button>
          </div>
        </div>`;
      m.addEventListener('click', e => {
        if (e.target === m || (e.target.dataset && e.target.dataset.act === 'cancel')) m.remove();
        if (e.target.dataset && e.target.dataset.act === 'save') {
          const on = m.querySelector('#ck-an').checked;
          setConsent(on ? 'analytics' : 'essential');
          m.remove();
        }
      });
      document.body.appendChild(m);
    }

    function openCcpa(){
      const out = localStorage.getItem(CCPA_KEY) === '1';
      const m = document.createElement('div'); m.className = 'ck-modal';
      m.innerHTML = `
        <div class="ck-modal-card" role="dialog" aria-modal="true" aria-label="CCPA opt-out">
          <h3>Do Not Sell or Share My Personal Information</h3>
          <p>Under the California Consumer Privacy Act (CCPA/CPRA), you may opt out of the "sharing" of your personal information for cross-context behavioral advertising.</p>
          <div class="ck-row"><label for="ck-ccpa">Opt me out of sharing <small>Applies to this browser. Disables ad personalization signals.</small></label><input id="ck-ccpa" type="checkbox" ${out?'checked':''}></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
            <button class="ck-btn" data-act="cancel">Cancel</button>
            <button class="ck-btn primary" data-act="save">Save choice</button>
          </div>
        </div>`;
      m.addEventListener('click', e => {
        if (e.target === m || (e.target.dataset && e.target.dataset.act === 'cancel')) m.remove();
        if (e.target.dataset && e.target.dataset.act === 'save') {
          const on = m.querySelector('#ck-ccpa').checked;
          if (on) localStorage.setItem(CCPA_KEY, '1'); else localStorage.removeItem(CCPA_KEY);
          if (window.gtag && SITE_CONFIG.ga4MeasurementId) {
            window.gtag('config', SITE_CONFIG.ga4MeasurementId, { allow_ad_personalization_signals: !on });
          }
          m.remove();
        }
      });
      document.body.appendChild(m);
    }

    // Show banner if no prior choice
    if (!stored) {
      document.body.appendChild(buildBanner());
    } else {
      try {
        const { level } = JSON.parse(stored);
        if (level === 'all' || level === 'analytics') {
          if (typeof window.__loadAnalytics === 'function') window.__loadAnalytics();
        }
      } catch (_) {}
    }

    // Wire footer "Cookie preferences" and "Do Not Sell" links
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-action]');
      if (!t) return;
      if (t.dataset.action === 'cookie-prefs') { e.preventDefault(); openPrefs(); }
      if (t.dataset.action === 'ccpa-opt-out') { e.preventDefault(); openCcpa(); }
    });
  })();
})();

