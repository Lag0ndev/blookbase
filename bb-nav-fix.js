/* Blookbase nav + sidebar fix — loads Download + Thumbnail Maker */
(function () {
  'use strict';
  if (window.__bbNavFixV5) return;
  window.__bbNavFixV5 = 1;

  function loadScript(src) {
    if (document.querySelector('script[src*="' + src.split('?')[0].split('/').pop() + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }
  if (!window.__bbDownloadPage) loadScript('/bb-download.js?v=3');
  if (!window.__bbThumbMaker) loadScript('/bb-thumbnail.js?v=1');

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
    if (typeof window.switchView === 'function' && window.switchView.__bbSafeV5) return;
    if (typeof window.switchView === 'function') {
      var orig = window.switchView;
      window.switchView = function (view, skipUrl) {
        try {
          forceCloseSidebar();
          return orig.apply(this, arguments);
        } catch (err) {
          console.warn('[bb-nav] switchView', err);
        }
      };
      window.switchView.__bbSafeV5 = 1;
    }
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

  function wireSidebarLinks() {
    document.querySelectorAll('.sidebar-link[data-view], .sidebar-foot-btn[data-view]').forEach(function (btn) {
      if (btn.__bbLinkWired) return;
      btn.__bbLinkWired = 1;
      btn.addEventListener('click', function () { setTimeout(forceCloseSidebar, 0); }, false);
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
      '@media(max-width:900px){body.sb-always #sidebar:not(.open){transform:translateX(-100%)!important;}body.sb-always #sidebar.open{transform:translateX(0)!important;}body.sb-always #sidebar-overlay.open{display:block!important;pointer-events:auto!important;}}';
    document.head.appendChild(st);
  }

  function boot() {
    injectCss();
    ensureSwitchView();
    wireOverlay();
    wireMenuBtn();
    wireSidebarLinks();
    wireEscape();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
})();
