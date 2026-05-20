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
.mega-panel{position:absolute;inset:0 auto auto 0;width:100%;background:#f0f6ff;border-bottom:1px solid rgba(34,84,244,.14);box-shadow:0 24px 80px rgba(15,20,80,.16);padding:36px 52px 44px;display:none;opacity:0;transform:translateY(-10px);pointer-events:none;overflow:hidden;}
.mega-panel::after{content:'';position:absolute;right:-8%;top:-80%;width:58%;height:320%;background:url('https://images.pexels.com/photos/34062752/pexels-photo-34062752.jpeg') center/cover no-repeat;transform:rotate(-18deg);opacity:.42;z-index:0;pointer-events:none;border-radius:32px;}
.mega-panel::before{content:'';position:absolute;inset:0;background:linear-gradient(to right,#f0f6ff 0%,#f0f6ff 38%,rgba(240,246,255,.82) 58%,rgba(240,246,255,.18) 78%,transparent 100%);z-index:1;pointer-events:none;}
.mega-panel.open{display:flex;pointer-events:auto;}
.mega-inner{position:relative;z-index:2;max-width:1320px;margin:0 auto;width:100%;display:flex;}
.mega-label{font-family:var(--font-head);font-size:.58rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:22px;display:flex;align-items:center;gap:10px;}
.mega-label::after{content:'';flex:1;height:1px;background:var(--border);}
.mega-col{flex:1;padding-right:28px;border-right:1px solid var(--border);margin-right:28px;}
.mega-col:last-child{border-right:none;margin-right:0;padding-right:0;}
.mega-col-head{font-family:var(--font-head);font-size:.63rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;}
.mega-group{margin-bottom:20px;}
.mega-group-title{font-family:var(--font-body);font-size:.78rem;font-weight:700;color:var(--ink);margin-bottom:8px;padding-left:10px;border-left:2px solid var(--accent);}
.mega-links{display:flex;flex-direction:column;gap:1px;}
.mega-links a{display:block;padding:5px 10px;font-size:.78rem;font-weight:500;color:var(--muted);border-radius:5px;transition:color .15s,background .15s,padding-left .18s;}
.mega-links a:hover{color:var(--accent);background:var(--accent-lt);padding-left:15px;}
.mega-featured{width:226px;flex-shrink:0;padding-left:28px;border-left:1px solid var(--border);}
.feat-tag{font-size:.58rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:12px;}
.feat-card{background:rgba(255,255,255,.78);border:1px solid rgba(34,84,244,.12);border-radius:10px;padding:18px;margin-bottom:12px;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:border-color .2s,transform .2s,box-shadow .2s;}
.feat-card:hover{border-color:var(--accent);background:rgba(255,255,255,.95);transform:translateY(-2px);box-shadow:0 6px 24px rgba(34,84,244,.12);}
.feat-card-title{font-family:var(--font-head);font-size:.82rem;font-weight:700;color:var(--ink);margin-bottom:6px;line-height:1.35;}
.feat-card-desc{font-size:.73rem;color:var(--muted);line-height:1.55;}
.partner-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:16px;}
.partner-pill{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:6px;border:1px solid var(--border);font-size:.75rem;font-weight:600;color:var(--ink-mid);background:rgba(255,255,255,.72);cursor:pointer;transition:border-color .15s,color .15s,box-shadow .15s;}
.partner-pill:hover{border-color:var(--accent);color:var(--accent);box-shadow:0 2px 12px rgba(34,84,244,.1);}
.p-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.about-links{display:flex;flex-direction:column;gap:4px;}
.about-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background .15s;}
.about-link:hover{background:rgba(255,255,255,.6);}
.about-icon{width:34px;height:34px;background:rgba(255,255,255,.72);border-radius:8px;display:grid;place-items:center;font-size:1rem;flex-shrink:0;border:1px solid var(--border);}
.about-link-text{font-size:.82rem;font-weight:600;color:var(--ink-mid);}
.about-link:hover .about-link-text{color:var(--accent);}
.about-logos-label{font-size:.58rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:16px;margin-bottom:8px;}
.about-logos-grid{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
.about-logo-img{height:22px;width:auto;filter:brightness(0) saturate(100%);opacity:.65;transition:opacity .2s;}
.about-logo-img:hover{opacity:1;}
@media(max-width:1024px){.mega-panel::after{display:none;}.mega-panel::before{background:#fff;}.mega-panel{background:#fff;padding:28px 32px 36px;}}

/* ═══════════════════════ FOOTER ════════════════════════════════════ */
.site-footer-light{
  --fl-bg:#ffffff;--fl-bg-top:#ffffff;--fl-bg-bot:#f8f9fc;
  --fl-ink:#1a1a1a;--fl-ink-mid:#3d3b36;--fl-ink-soft:#6b6760;
  --fl-muted:#9e9b94;--fl-ghost:#bab7b0;--fl-border:rgba(26,26,26,0.10);
  --fl-border-md:rgba(26,26,26,0.16);--fl-accent:#2254f4;
  --fl-accent-lt:rgba(34,84,244,0.08);--fl-hover:rgba(26,26,26,0.055);
  --fl-font:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  background:var(--fl-bg);color:var(--fl-ink);font-family:var(--fl-font);
  -webkit-font-smoothing:antialiased;position:relative;z-index:2;overflow:hidden;
}
.site-footer-light::after{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");opacity:.025;pointer-events:none;z-index:0;}
.site-footer-light::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:900px;height:400px;background:radial-gradient(ellipse,rgba(34,84,244,.04) 0%,transparent 70%);pointer-events:none;z-index:0;}
.fl-top{position:relative;z-index:1;background:var(--fl-bg-top);padding:72px 64px 60px;display:grid;grid-template-columns:1fr auto;align-items:start;gap:56px;border-bottom:1px solid var(--fl-border-md);}
.fl-brand{display:flex;flex-direction:column;gap:18px;max-width:560px;}
.fl-logo{height:28px;width:auto;filter:brightness(0);display:block;transition:opacity .25s ease;}
.fl-logo:hover{opacity:.6;}
.fl-tagline{font-size:clamp(.84rem,1vw,.92rem);font-weight:400;color:var(--fl-ink-soft);line-height:1.76;max-width:420px;letter-spacing:.01em;}
.fl-subscribe{display:flex;align-items:stretch;margin-top:4px;}
.fl-subscribe input{flex:1;max-width:256px;background:#f5f6fa;border:1.5px solid var(--fl-border-md);border-right:none;border-radius:7px 0 0 7px;padding:11px 16px;font-family:var(--fl-font);font-size:.8rem;color:var(--fl-ink);outline:none;transition:border-color .2s,background .2s;}
.fl-subscribe input::placeholder{color:var(--fl-muted);}
.fl-subscribe input:focus{border-color:var(--fl-accent);background:#fff;}
.fl-subscribe button{padding:0 22px;background:#000;border:none;border-radius:0 7px 7px 0;font-family:var(--fl-font);font-size:.78rem;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;transition:opacity .2s;}
.fl-subscribe button:hover{opacity:.85;}
.fl-social{display:flex;flex-direction:column;align-items:flex-end;gap:16px;padding-top:2px;}
.fl-social-label{font-size:.6rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--fl-muted);}
.fl-social-icons{display:flex;align-items:center;gap:7px;}
.fl-social-btn{width:40px;height:40px;border-radius:9px;border:1.5px solid var(--fl-border-md);background:#f5f6fa;display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--fl-ink-soft);transition:background .22s,border-color .22s,color .22s,transform .22s cubic-bezier(.16,1,.3,1),box-shadow .22s;}
.fl-social-btn:hover{background:#000;border-color:transparent;color:#fff;transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.22);}
.fl-social-btn svg{width:16px;height:16px;display:block;}
.fl-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,1fr);padding:0 64px;border-bottom:1px solid var(--fl-border);}
.fl-col{padding:48px 28px 48px 0;border-right:1px solid var(--fl-border);}
.fl-col:last-child{border-right:none;padding-right:0;}
.fl-col:first-child{padding-left:0;}
.fl-col-head{font-size:.6rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--fl-muted);margin-bottom:20px;display:flex;align-items:center;gap:8px;}
.fl-col-head::after{content:'';flex:1;height:1px;background:var(--fl-ghost);}
.fl-col-links{display:flex;flex-direction:column;gap:1px;}
.fl-col-link{display:inline-flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;font-size:.8rem;font-weight:500;color:var(--fl-ink-soft);text-decoration:none;transition:color .17s,background .17s,padding-left .2s cubic-bezier(.16,1,.3,1);position:relative;}
.fl-col-link::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:2px;height:0;border-radius:2px;background:var(--fl-accent);transition:height .22s cubic-bezier(.16,1,.3,1);}
.fl-col-link:hover{color:var(--fl-accent);background:var(--fl-accent-lt);padding-left:15px;}
.fl-col-link:hover::before{height:16px;}
.fl-badge{display:inline-block;padding:2px 7px;background:rgba(34,84,244,.1);border:1px solid rgba(34,84,244,.22);border-radius:20px;font-size:.57rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fl-accent);flex-shrink:0;line-height:1.4;}
.fl-locations{position:relative;z-index:1;display:flex;align-items:center;padding:0 64px;border-bottom:1px solid var(--fl-border);overflow-x:auto;scrollbar-width:none;background:#f8f9fc;}
.fl-locations::-webkit-scrollbar{display:none;}
.fl-loc{display:flex;align-items:center;gap:11px;padding:22px 48px 22px 0;border-right:1px solid var(--fl-border);margin-right:48px;white-space:nowrap;flex-shrink:0;}
.fl-loc:last-child{border-right:none;margin-right:0;}
.fl-loc-dot{width:8px;height:8px;border-radius:50%;background:var(--fl-accent);flex-shrink:0;box-shadow:0 0 0 3px rgba(34,84,244,.18);animation:flLocPulse 2.6s ease-in-out infinite;}
.fl-loc:nth-child(2) .fl-loc-dot{animation-delay:.65s;}
.fl-loc:nth-child(3) .fl-loc-dot{animation-delay:1.3s;}
.fl-loc:nth-child(4) .fl-loc-dot{animation-delay:1.95s;}
@keyframes flLocPulse{0%,100%{box-shadow:0 0 0 3px rgba(34,84,244,.18);}50%{box-shadow:0 0 0 7px rgba(34,84,244,.05);}}
.fl-loc-text{display:flex;flex-direction:column;gap:1px;}
.fl-loc-city{font-size:.8rem;font-weight:700;color:var(--fl-ink);letter-spacing:-.01em;}
.fl-loc-country{font-size:.68rem;font-weight:400;color:var(--fl-muted);}
.fl-bottom{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;padding:22px 64px;background:var(--fl-bg-bot);gap:20px;flex-wrap:wrap;}
.fl-copyright{font-size:.72rem;color:var(--fl-muted);line-height:1.5;}
.fl-copyright strong{color:var(--fl-ink-mid);}
.fl-legal{display:flex;align-items:center;gap:0;}
.fl-legal-link{font-size:.7rem;font-weight:500;color:var(--fl-muted);padding:4px 12px;border-right:1px solid var(--fl-ghost);transition:color .15s;}
.fl-legal-link:last-child{border-right:none;}
.fl-legal-link:first-child{padding-left:0;}
.fl-legal-link:hover{color:var(--fl-accent);}
.fl-trust{display:flex;align-items:center;gap:8px;}
.fl-trust-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border:1px solid var(--fl-border-md);border-radius:20px;font-size:.65rem;font-weight:600;color:var(--fl-ink-soft);letter-spacing:.04em;background:var(--fl-bg);transition:border-color .2s,color .2s;}
.fl-trust-pill:hover{border-color:var(--fl-accent);color:var(--fl-accent);}
.fl-trust-pill svg{width:11px;height:11px;flex-shrink:0;}
@media(max-width:1139px){.fl-top{padding:48px 32px 40px;gap:32px;}.fl-grid{padding:0 32px;}.fl-grid{grid-template-columns:repeat(3,1fr);}.fl-locations{padding:0 32px;}.fl-bottom{padding:18px 32px;flex-direction:column;align-items:flex-start;gap:12px;}.fl-trust{display:none;}}
@media(max-width:640px){.fl-top{grid-template-columns:1fr;}.fl-social{align-items:flex-start;}.fl-grid{grid-template-columns:1fr 1fr;padding:0 24px;}.fl-col{padding:32px 20px 32px 0;}.fl-locations{padding:0 24px;}.fl-bottom{padding:16px 24px;}.fl-legal{flex-wrap:wrap;gap:4px;}}
@media(max-width:480px){.fl-grid{grid-template-columns:1fr;}.fl-col,.fl-col:last-child{border-right:none !important;padding-right:0 !important;border-bottom:1px solid var(--fl-border);}.fl-col:last-child{border-bottom:none !important;}}
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
          <a href="ai-first-digital-engineering.html">AI-First Digital Engineering</a>   /* ← LINK */
          <a href="ai-adoption.html">AI Adoption</a>                    /* ← LINK */
          <a href="risk-compliance.html">Risk &amp; Compliance</a>          /* ← LINK */
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Outcomes</div>
          <a href="cost-efficiency.html">Cost &amp; Efficiency</a>          /* ← LINK */
          <a href="digital-experience.html">Digital Experience</a>             /* ← LINK */
        </div>

      </div>
    </div>

    <!-- ── CAPABILITIES ───────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-how">Capabilities<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-how">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Engineering</div>
          <a href="ai-led-engineering.html">AI Led Engineering</a>                       /* ← LINK */
          <a href="cloud-infrastructure-engineering.html">Cloud &amp; Infrastructure Engineering</a>  /* ← LINK */
          <a href="ai-and-data.html">AI &amp; Data</a>                           /* ← LINK */
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Operations</div>
          <a href="digital-operations.html">Digital Operations &amp; Security</a>       /* ← LINK */
          <a href="security-governance.html">Security &amp; Governance</a>               /* ← LINK */
        </div>



      </div>
    </div>

    <!-- ── SOLUTIONS ──────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-deliver">Solutions<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-deliver">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Programs</div>
          <a href="managed-programs.html">Managed Programs</a>                           /* ← LINK */
          <a href="technology-consulting.html">Technology Consulting</a>                      /* ← LINK */
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Global Delivery</div>
          <a href="gcc-nearshore.html">GCC &amp; Nearshore</a>                        /* ← LINK */
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Talent Models</div>
          <a href="teams-as-a-service.html">Teams-as-a-Service</a>                         /* ← LINK */
          <a href="hire-train-deploy.html">Hire-Train-Deploy</a>                          /* ← LINK */
        </div>

      </div>
    </div>

    <!-- ── AI & INNOVATION ────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-ai">AI &amp; Innovation<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-ai">

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Products</div>
          <a href="synthetix.html">Synthetix</a>                              /* ← LINK */
          <a href="celsior-ai-lab.html">Celsior AI Lab</a>                         /* ← LINK */
          <a href="design-lab.html">Design Lab</a>                             /* ← LINK */
        </div>

        <div class="drawer-sub-group">
          <div class="drawer-sub-head">Programs</div>
          <a href="centers-of-excellence.html">Centers of Excellence</a>                  /* ← LINK */
          <a href="frameworks-accelerators.html">Frameworks &amp; Accelerators</a>          /* ← LINK */
        </div>

      </div>
    </div>

    <!-- ── INDUSTRIES ─────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-ind">Industries<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-ind">

        <div class="drawer-sub-group">
          <a href="banking-financial-services.html">Banking &amp; Financial Services</a>          /* ← LINK */
          <a href="insurance.html">Insurance</a>                                 /* ← LINK */
          <a href="healthcare.html">Healthcare</a>                                /* ← LINK */
        </div>

      </div>
    </div>

    <!-- ── PARTNER ECOSYSTEM ──────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-part">Partner Ecosystem<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-part">

        <div class="drawer-sub-group">
          <a href="partners.html">Partners</a>                           /* ← LINK */
        </div>

      </div>
    </div>

    <!-- ── ABOUT ──────────────────────────────────────────────── -->
    <div class="drawer-item">
      <div class="drawer-link" data-drawer-toggle="d-about">About<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="drawer-sub" id="d-about">

        <div class="drawer-sub-group">
          <a href="about-leadership.html">Who we are + Our Leadership</a>                    /* ← LINK */
          <a href="ai-first-philosophy.html">AI-first Philosophy</a>                            /* ← LINK */
          <a href="success-stories.html">Success Stories</a>                                /* ← LINK */
          <a href="blogs.html">Blogs</a>                                          /* ← LINK */
          <a href="careers.html">Careers</a>                                        /* ← LINK */
          <a href="events-news.html">Events &amp; News</a>                              /* ← LINK */
        </div>

      </div>
    </div>

`;

  const megaPanelsHTML = `

  <!-- ═══════════════════════════════════════════════════════════════
       MEGA PANELS  —  one <a href="..."> per line for easy editing.
       Placeholder hrefs point to the parent page section.
       Search "/* ← LINK */" to jump to any individual URL.
       ═══════════════════════════════════════════════════════════════ -->

  <!-- ╔══════════════════════════════════════╗
       ║  OUR FOCUS                           ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-solve">
    <div class="mega-inner">

      <!-- Col 1 — Priorities -->
      <div class="mega-col">
        <div class="mega-label">Our Focus</div>
        <div class="mega-col-head">Priorities</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="ai-first-digital-engineering.html">AI-First Digital Engineering</a></li>  <!-- ← LINK -->
            <li><a href="ai-adoption.html">AI Adoption</a></li>                   <!-- ← LINK -->
            <li><a href="risk-compliance.html">Risk &amp; Compliance</a></li>         <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 — Outcomes -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">Outcomes</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="cost-efficiency.html">Cost &amp; Efficiency</a></li>         <!-- ← LINK -->
            <li><a href="digital-experience.html">Digital Experience</a></li>            <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 3 — empty spacer -->
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Free Assessment</div>
        <div class="feat-card">
          <div class="feat-card-title">Modernization Diagnostic</div>
          <div class="feat-card-desc">2-week assessment of your legacy landscape with a prioritized roadmap.</div>
        </div>
        <div class="feat-card">
          <div class="feat-card-title">AI Readiness Index</div>
          <div class="feat-card-desc">Benchmark your AI maturity against industry peers.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  CAPABILITIES                        ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-how">
    <div class="mega-inner">

      <!-- Col 1 — Engineering -->
      <div class="mega-col">
        <div class="mega-label">Capabilities</div>
        <div class="mega-col-head">Engineering</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="ai-led-engineering.html">AI Led Engineering</a></li>                      <!-- ← LINK -->
            <li><a href="cloud-infrastructure-engineering.html">Cloud &amp; Infrastructure Engineering</a></li>  <!-- ← LINK -->
            <li><a href="ai-and-data.html">AI &amp; Data</a></li>                           <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 — Operations -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">Operations</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="digital-operations.html">Digital Operations &amp; Security</a></li>       <!-- ← LINK -->
            <li><a href="security-governance.html">Security &amp; Governance</a></li>               <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 3 — empty spacer -->
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Spotlight</div>
        <div class="feat-card">
          <div class="feat-card-title">Platform Engineering at Scale</div>
          <div class="feat-card-desc">Golden paths for global banks with 200+ engineering teams.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  SOLUTIONS                           ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-deliver">
    <div class="mega-inner">

      <!-- Col 1 — Programs & Consulting -->
      <div class="mega-col">
        <div class="mega-label">Solutions</div>
        <div class="mega-col-head">Programs</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="managed-programs.html">Managed Programs</a></li>                           <!-- ← LINK -->
            <li><a href="technology-consulting.html">Technology Consulting</a></li>                      <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 — Global Delivery -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">Global Delivery</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="gcc-nearshore.html">GCC &amp; Nearshore</a></li>                        <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 3 — Talent Models -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">Talent Models</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="teams-as-a-service.html">Teams-as-a-Service</a></li>                         <!-- ← LINK -->
            <li><a href="hire-train-deploy.html">Hire-Train-Deploy
              <span style="display:inline-flex;align-items:center;padding:1px 7px;background:#0d1127;color:#fff;font-size:.58rem;font-weight:700;letter-spacing:.06em;border-radius:3px;text-transform:uppercase;margin-left:4px;">New</span>
            </a></li>                                                                        <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Compare Models</div>
        <div class="feat-card">
          <div class="feat-card-title">GCC vs. Teams-as-a-Service</div>
          <div class="feat-card-desc">Find the right operating model for your scale and goals.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  AI & INNOVATION                     ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-ai">
    <div class="mega-inner">

      <!-- Col 1 — Products -->
      <div class="mega-col">
        <div class="mega-label">AI &amp; Innovation</div>
        <div class="mega-col-head">Products</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="synthetix.html">Synthetix</a></li>                              <!-- ← LINK -->
            <li><a href="celsior-ai-lab.html">Celsior AI Lab</a></li>                         <!-- ← LINK -->
            <li><a href="design-lab.html">Design Lab</a></li>                             <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 — Programs -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">Programs</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="centers-of-excellence.html">Centers of Excellence</a></li>                  <!-- ← LINK -->
            <li><a href="frameworks-accelerators.html">Frameworks &amp; Accelerators</a></li>          <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 3 — empty spacer -->
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Live Demo</div>
        <div class="feat-card">
          <div class="feat-card-title">Synthetix in Action</div>
          <div class="feat-card-desc">See how our AI orchestration layer connects policy, claims, and risk in real time.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  INDUSTRIES                          ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-industries">
    <div class="mega-inner">

      <!-- Col 1 — Sectors -->
      <div class="mega-col">
        <div class="mega-label">Industries</div>
        <div class="mega-col-head">Sectors</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="banking-financial-services.html">Banking &amp; Financial Services</a></li>          <!-- ← LINK -->
            <li><a href="insurance.html">Insurance</a></li>                                 <!-- ← LINK -->
            <li><a href="healthcare.html">Healthcare</a></li>                                <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 & 3 — empty spacers -->
      <div class="mega-col"></div>
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Industry Brief</div>
        <div class="feat-card">
          <div class="feat-card-title">Regulated Industry Playbook</div>
          <div class="feat-card-desc">How leading banks, insurers, and health systems modernize without disruption.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  PARTNER ECOSYSTEM                   ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-partners">
    <div class="mega-inner">

      <!-- Col 1 — Alliances -->
      <div class="mega-col">
        <div class="mega-label">Partner Ecosystem</div>
        <div class="mega-col-head">Alliances</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="partners.html">Partners</a></li>                           <!-- ← LINK -->
          </ul>
        </div>
        <div class="partner-grid">
          <span class="partner-pill"><span class="p-dot"></span>ServiceNow</span>
          <span class="partner-pill"><span class="p-dot"></span>Guidewire</span>
          <span class="partner-pill"><span class="p-dot"></span>AWS</span>
          <span class="partner-pill"><span class="p-dot"></span>Azure</span>
          <span class="partner-pill"><span class="p-dot"></span>Google Cloud</span>
          <span class="partner-pill"><span class="p-dot"></span>Snowflake</span>
          <span class="partner-pill"><span class="p-dot"></span>Dynatrace</span>
          <span class="partner-pill"><span class="p-dot"></span>UiPath</span>
        </div>
      </div>

      <!-- Col 2 & 3 — empty spacers -->
      <div class="mega-col"></div>
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Partnerships</div>
        <div class="feat-card">
          <div class="feat-card-title">Become a Partner</div>
          <div class="feat-card-desc">Join Celsior's ecosystem of technology and implementation partners.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ╔══════════════════════════════════════╗
       ║  ABOUT                               ║
       ╚══════════════════════════════════════╝ -->
  <div class="mega-panel" id="menu-about">
    <div class="mega-inner">

      <!-- Col 1 — Company -->
      <div class="mega-col">
        <div class="mega-label">About</div>
        <div class="mega-col-head">Company</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="about-leadership.html">Who we are + Our Leadership</a></li>                    <!-- ← LINK -->
            <li><a href="ai-first-philosophy.html">AI-first Philosophy</a></li>                            <!-- ← LINK -->
            <li><a href="success-stories.html">Success Stories</a></li>                                <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 2 — News & Careers -->
      <div class="mega-col">
        <div class="mega-col-head" style="margin-top:26px">News &amp; Careers</div>
        <div class="mega-group">
          <ul class="mega-links">
            <li><a href="blogs.html">Blogs</a></li>                                          <!-- ← LINK -->
            <li><a href="careers.html">Careers</a></li>                                        <!-- ← LINK -->
            <li><a href="events-news.html">Events &amp; News</a></li>                              <!-- ← LINK -->
          </ul>
        </div>
      </div>

      <!-- Col 3 — empty spacer -->
      <div class="mega-col"></div>

      <!-- Featured card -->
      <div class="mega-featured">
        <div class="feat-tag">Join Us</div>
        <div class="feat-card">
          <div class="feat-card-title">Life at Celsior</div>
          <div class="feat-card-desc">Engineering-first culture, global teams, and a mission that matters.</div>
        </div>
      </div>

    </div>
  </div>

`;

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
  }

  /* ─── 4.  FOOTER HTML ─────────────────────────────────────────────── */
  const footerEl = document.createElement('footer');
  footerEl.className = 'site-footer-light';
  footerEl.id = 'siteFooterLight';
  footerEl.innerHTML = `
  <div class="fl-top">
    <div class="fl-brand">
      <a href="index.html"><img src="${LOGO}" alt="Celsior" class="fl-logo"/></a>
      <p class="fl-tagline">Engineering partner for regulated industries — modernizing critical systems, operationalizing AI, and building operational resilience at scale.</p>
      <div class="fl-subscribe">
        <input type="email" placeholder="Enter your work email" autocomplete="email"/>
        <button type="button">Subscribe</button>
      </div>
    </div>
    <div class="fl-social">
      <span class="fl-social-label">Follow Us</span>
      <div class="fl-social-icons">
        <a href="#" class="fl-social-btn" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="#" class="fl-social-btn" aria-label="X / Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25h6.988l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg></a>
        <a href="#" class="fl-social-btn" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
        <a href="#" class="fl-social-btn" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        <a href="#" class="fl-social-btn" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
      </div>
    </div>
  </div>

  <div class="fl-grid">
    <div class="fl-col"><p class="fl-col-head">Solutions</p><nav class="fl-col-links"><a href="Our_Focus.html" class="fl-col-link">Core Banking Modernization</a><a href="Our_Focus.html" class="fl-col-link">Cloud Transformation</a><a href="Our_Focus.html" class="fl-col-link">Technical Debt Reduction</a><a href="Our_Focus.html" class="fl-col-link">Regulatory Readiness</a><a href="Our_Focus.html" class="fl-col-link">Digital Experience</a><a href="Our_Focus.html" class="fl-col-link">Enterprise AI Enablement</a></nav></div>
    <div class="fl-col"><p class="fl-col-head">Services</p><nav class="fl-col-links"><a href="Capabilities.html" class="fl-col-link">Application Engineering</a><a href="Capabilities.html" class="fl-col-link">Platform Engineering</a><a href="Capabilities.html" class="fl-col-link">Cloud &amp; DevOps</a><a href="Capabilities.html" class="fl-col-link">Data &amp; AI Engineering</a><a href="Capabilities.html" class="fl-col-link">Security &amp; Governance</a><a href="Capabilities.html" class="fl-col-link">ITSM &amp; Operations</a></nav></div>
    <div class="fl-col"><p class="fl-col-head">Delivery</p><nav class="fl-col-links"><a href="Solutions.html" class="fl-col-link">GCC Build &amp; Operate</a><a href="Solutions.html" class="fl-col-link">BOT Model</a><a href="Solutions.html" class="fl-col-link">Mexico &amp; LATAM Nearshore</a><a href="Solutions.html" class="fl-col-link">Engineering Pods</a><a href="Solutions.html" class="fl-col-link">Hire-Train-Deploy <span class="fl-badge">New</span></a></nav></div>
    <div class="fl-col"><p class="fl-col-head">AI &amp; Innovation</p><nav class="fl-col-links"><a href="ai-innovation.html" class="fl-col-link">Celsior AI Lab</a><a href="ai-innovation.html" class="fl-col-link">Agentic Workflows</a><a href="ai-innovation.html" class="fl-col-link">AI Copilots</a><a href="ai-innovation.html" class="fl-col-link">CAFE Framework</a><a href="ai-innovation.html" class="fl-col-link">HALO Framework</a><a href="ai-innovation.html" class="fl-col-link">GenAI Accelerators</a></nav></div>
    <div class="fl-col"><p class="fl-col-head">Company</p><nav class="fl-col-links"><a href="about.html" class="fl-col-link">Who We Are</a><a href="about.html" class="fl-col-link">Our Leadership</a><a href="about.html" class="fl-col-link">AI-first Philosophy</a><a href="about.html" class="fl-col-link">Success Stories</a><a href="about.html" class="fl-col-link">Newsroom</a><a href="about.html" class="fl-col-link">Careers</a><a href="index.html#contact" class="fl-col-link">Contact Us</a></nav></div>
  </div>

  <div class="fl-locations">
    <div class="fl-loc"><div class="fl-loc-dot"></div><div class="fl-loc-text"><span class="fl-loc-city">New York</span><span class="fl-loc-country">United States</span></div></div>
    <div class="fl-loc"><div class="fl-loc-dot"></div><div class="fl-loc-text"><span class="fl-loc-city">London</span><span class="fl-loc-country">United Kingdom</span></div></div>
    <div class="fl-loc"><div class="fl-loc-dot"></div><div class="fl-loc-text"><span class="fl-loc-city">Hyderabad</span><span class="fl-loc-country">India</span></div></div>
    <div class="fl-loc"><div class="fl-loc-dot"></div><div class="fl-loc-text"><span class="fl-loc-city">Mexico City</span><span class="fl-loc-country">Mexico</span></div></div>
  </div>

  <div class="fl-bottom">
    <p class="fl-copyright">&copy; 2026 <strong>CelsiorTech, Inc.</strong> All rights reserved. Built for regulated enterprises that run on reliability.</p>
    <nav class="fl-legal" aria-label="Legal"><a href="#" class="fl-legal-link">Privacy Policy</a><a href="#" class="fl-legal-link">Cookie Policy</a><a href="#" class="fl-legal-link">Terms of Use</a><a href="#" class="fl-legal-link">Accessibility</a><a href="#" class="fl-legal-link">Sitemap</a></nav>
    <div class="fl-trust">
      <span class="fl-trust-pill"><svg viewBox="0 0 12 12" fill="none"><path d="M6 1.5L7.4 4.4l3.1.45-2.25 2.2.53 3.1L6 8.62l-2.78 1.53.53-3.1L1.5 4.85l3.1-.45L6 1.5z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>SOC 2 Type II</span>
      <span class="fl-trust-pill"><svg viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="8" height="10" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M4 5h4M4 7.5h2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>ISO 27001</span>
    </div>
  </div>`;

  if (shouldInjectFooter) {
    const oldFooter = document.getElementById('siteFooterLight');
    if (oldFooter) oldFooter.remove();
    document.body.appendChild(footerEl);
  }

  if (!shouldInjectNav) return;

  /* ─── 5.  NAV JAVASCRIPT ──────────────────────────────────────────── */
  // Scroll state
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  navEl.classList.toggle('scrolled', window.scrollY > 40);

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
      gsap.from(panel.querySelectorAll('.mega-links a,.partner-pill,.about-link,.feat-card'), { opacity: 0, y: 7, duration: 0.26, stagger: 0.018, ease: 'power2.out', delay: 0.06, clearProps: 'opacity,y' });
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
})();
