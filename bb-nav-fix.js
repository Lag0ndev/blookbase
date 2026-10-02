/* Blookbase nav + sidebar close fix + load Download page */
(function () {
  'use strict';
  if (window.__bbNavFixV4) return;
  window.__bbNavFixV4 = 1;

  if (!document.querySelector('script[src*="bb-download"]')) {
    var s = document.createElement('script');
    s.src = '/bb-download.js?v=2';
    s.defer = true;
    document.head.appendChild(s);
  }

  function forceCloseSidebar() {
    try {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
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
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '900';
      }
    } catch (e) {}
  }

  window.closeSidebar = forceCloseSidebar;
  window.toggleSidebar = function () {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (sidebar.classList.contains('open')) forceCloseSidebar();
    else forceOpenSidebar();
  };

  function showView(view) {
    view = view || 'home';
    try {
      document.querySelectorAll('.main-content').forEach(function (el) {
        el.style.display = 'none';
      });
      var t = document.getElementById('view-' + view) || document.getElementById('view-home');
      if (t) t.style.display = 'flex';
      try { window.currentView = view; } catch (e) {}
    } catch (e) {}
  }

  if (typeof window.switchView !== 'function') {
    window.switchView = function (view) { showView(view); };
  } else if (!window.switchView.__bbSafe) {
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      try {
        return orig.apply(this, arguments);
      } catch (err) {
        console.warn('[bb-nav] switchView failed', err);
        showView(view);
      }
    };
    window.switchView.__bbSafe = 1;
  }

  function wireOverlay() {
    var overlay = document.getElementById('sidebar-overlay');
    if (!overlay || overlay.__bbClose) return;
    overlay.__bbClose = 1;
    overlay.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        forceCloseSidebar();
      },
      true
    );
  }

  function wireMenuBtn() {
    var menu = document.querySelector('.menu-btn');
    if (!menu || menu.__bbMenu) return;
    menu.__bbMenu = 1;
    menu.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleSidebar();
      },
      true
    );
  }

  function wireLinks() {
    document.querySelectorAll('.sidebar-link[data-view]').forEach(function (btn) {
      if (btn.__bbNavV4) return;
      btn.__bbNavV4 = 1;
      var view = btn.getAttribute('data-view');
      btn.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          forceCloseSidebar();
          if (typeof window.switchView === 'function') window.switchView(view);
          else showView(view);
        },
        true
      );
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') forceCloseSidebar();
  });

  function boot() {
    wireOverlay();
    wireMenuBtn();
    wireLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
})();
