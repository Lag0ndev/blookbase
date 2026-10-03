/* Blookbase nav + sidebar fix only (Download + Thumbnail removed from site) */
(function () {
  'use strict';
  if (window.__bbNavFixV11) return;
  window.__bbNavFixV11 = 1;

  function forceCloseSidebar() {
    try {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) {
        sidebar.classList.remove('open');
        if (!document.body.classList.contains('sb-always')) sidebar.style.transform = '';
      }
      if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
      }
      document.body.classList.remove('no-scroll');
    } catch (e) {}
  }

  function forceOpenSidebar() {
    try {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.add('open');
      if (overlay) {
        overlay.classList.add('open');
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '700';
      }
    } catch (e) {}
  }

  function isSidebarOpen() {
    var sidebar = document.getElementById('sidebar');
    return !!(sidebar && sidebar.classList.contains('open'));
  }

  window.closeSidebar = function () { forceCloseSidebar(); };
  window.toggleSidebar = function () {
    var always = document.body.classList.contains('sb-always');
    if (always && window.innerWidth > 900) return;
    if (isSidebarOpen()) forceCloseSidebar();
    else forceOpenSidebar();
  };

  function ensureSwitchView() {
    if (typeof window.switchView === 'function' && window.switchView.__bbSafeV11) return;
    if (typeof window.switchView === 'function') {
      var orig = window.switchView;
      window.switchView = function (view, skipUrl) {
        try {
          forceCloseSidebar();
          if (view === 'download' || view === 'thumbnail' || view === 'thumbnails') view = 'home';
          if (view === 'leaks') view = 'whatsnew';
          if (view === 'packsim' && !skipUrl) {
            try { history.pushState({ view: 'packsim' }, '', '/calculator'); } catch (e) {}
            return orig.call(this, view, true);
          }
          return orig.call(this, view, skipUrl);
        } catch (err) {
          console.warn('[bb-nav] switchView', err);
        }
      };
      window.switchView.__bbSafeV11 = 1;
    }
  }

  function removeExtraNav() {
    document.querySelectorAll('[data-view="download"], [data-view="thumbnail"], [data-view="leaks"]').forEach(function (btn) {
      var li = btn.closest('li');
      if (li) li.remove();
      else btn.remove();
    });
    ['view-download', 'view-thumbnail', 'view-leaks'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function wireOverlay() {
    var overlay = document.getElementById('sidebar-overlay');
    if (!overlay || overlay.__bbCloseWired) return;
    overlay.__bbCloseWired = 1;
    overlay.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      forceCloseSidebar();
    }, true);
  }

  function wireMenuBtn() {
    document.querySelectorAll('.menu-btn').forEach(function (btn) {
      if (btn.__bbMenuWired) return;
      btn.__bbMenuWired = 1;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleSidebar();
      }, true);
    });
  }

  function wireEscape() {
    if (window.__bbEscWired) return;
    window.__bbEscWired = 1;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') forceCloseSidebar();
    });
  }

  function injectCss() {
    if (document.getElementById('bb-sidebar-fix-css')) return;
    var st = document.createElement('style');
    st.id = 'bb-sidebar-fix-css';
    st.textContent =
      '#sidebar-overlay.open{display:block!important;pointer-events:auto!important;opacity:1!important;z-index:700!important;}' +
      '#sidebar-overlay:not(.open){pointer-events:none!important;}' +
      'body:not(.sb-always) #sidebar:not(.open){transform:translateX(-100%)!important;}' +
      'body:not(.sb-always):not(.sb-right):not(.sb-top):not(.sb-bottom) #sidebar.open{transform:translateX(0)!important;}' +
      '@media(max-width:900px){body.sb-always #sidebar:not(.open){transform:translateX(-100%)!important;}body.sb-always #sidebar.open{transform:translateX(0)!important;}body.sb-always #sidebar-overlay.open{display:block!important;pointer-events:auto!important;}}' +
      '.online-counter{position:fixed!important;z-index:80!important;right:14px!important;left:auto!important;bottom:14px!important;}' +
      'body.sb-right .online-counter{left:14px!important;right:auto!important;}' +
      '.watermark{position:fixed!important;z-index:40!important;right:12px!important;left:auto!important;bottom:48px!important;' +
      'max-width:none!important;overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important;width:auto!important;min-width:max-content!important;}' +
      'body.sb-right .watermark{left:12px!important;right:auto!important;}';
    document.head.appendChild(st);
  }

  function loadScript(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.setAttribute(attr, '1');
    document.head.appendChild(s);
  }

  function loadFixes() {
    loadScript('/bb-calc-online-fix.js?v=4', 'data-bb-calc-online');
    loadScript('/bb-watermark-fix.js?v=1', 'data-bb-wm-fix');
  }

  function forceWatermark() {
    document.querySelectorAll('.watermark').forEach(function (el) {
      el.textContent = 'Lag0n';
    });
  }

  function injectPackSimNav() {
    try {
      if (document.querySelector('[data-bb-packsim-nav]')) return;

      var packsimBtn = document.querySelector('.sidebar-link[data-view="packsim"]');
      var marketBtn = document.querySelector('.sidebar-link[data-view="market"]');
      var anchorLi = (packsimBtn && packsimBtn.closest('li')) || (marketBtn && marketBtn.closest('li'));
      if (anchorLi && anchorLi.parentNode) {
        var li = document.createElement('li');
        li.innerHTML =
          '<button type="button" class="sidebar-link" data-bb-packsim-nav="1" onclick="window.location.href=\'/packsim\'">' +
          '<span class="sidebar-listIcon"><i class="fas fa-box-open"></i></span>' +
          '<span class="sidebar-text">Pack Sim</span>' +
          '</button>';
        if (packsimBtn && packsimBtn.closest('li')) {
          anchorLi.parentNode.insertBefore(li, packsimBtn.closest('li').nextSibling);
        } else {
          anchorLi.parentNode.insertBefore(li, anchorLi.nextSibling);
        }
      }

      var homeGrid = document.querySelector('#view-home .home-grid');
      if (homeGrid && !document.querySelector('[data-bb-packsim-card]')) {
        var card = document.createElement('div');
        card.className = 'home-card';
        card.setAttribute('data-bb-packsim-card', '1');
        card.innerHTML =
          '<div class="home-card-top">' +
            '<span class="home-card-label">Pack Sim</span>' +
            '<span class="home-card-badge">New</span>' +
          '</div>' +
          '<h3>Open packs for free</h3>' +
          '<p>Visual pack simulator with real drop rates — click a pack, open it, and see what you get.</p>' +
          '<button type="button" class="home-card-btn" onclick="window.location.href=\'/packsim\'">Open Pack Sim →</button>';
        if (homeGrid.firstElementChild && homeGrid.firstElementChild.nextSibling) {
          homeGrid.insertBefore(card, homeGrid.firstElementChild.nextSibling);
        } else {
          homeGrid.appendChild(card);
        }
      }
    } catch (e) {
      console.warn('[bb-nav] packsim inject', e);
    }
  }

  function fixCalculatorPath() {
    try {
      var view = null;
      try { view = sessionStorage.getItem('bb_view'); if (view) sessionStorage.removeItem('bb_view'); } catch (e) {}
      if (!view) {
        var seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0] || '';
        var map = { calculator: 'packsim', packsim: 'packsim', market: 'market', packs: 'market', countdown: 'countdown', whatsnew: 'whatsnew', videos: 'videos', gamemodes: 'gamemodes', banners: 'banners', about: 'about', updates: 'updates', settings: 'settings' };
        view = map[seg] || null;
      }
      if (view && typeof window.switchView === 'function') {
        window.switchView(view, true);
      }
    } catch (e) {}
  }

  function boot() {
    fixCalculatorPath();
    injectCss();
    ensureSwitchView();
    wireOverlay();
    wireMenuBtn();
    wireEscape();
    removeExtraNav();
    loadFixes();
    forceWatermark();
    injectPackSimNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(function () { boot(); forceWatermark(); injectPackSimNav(); }, 1200);
})();
