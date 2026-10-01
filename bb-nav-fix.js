/* Blookbase nav recovery — fixes dead clicks / stuck overlays / missing switchView */
(function () {
  'use strict';
  if (window.__bbNavFixV2) return;
  window.__bbNavFixV2 = 1;

  function showView(view) {
    view = view || 'home';
    try {
      document.querySelectorAll('.main-content').forEach(function (el) {
        el.style.display = 'none';
      });
      var t = document.getElementById('view-' + view) || document.getElementById('view-home');
      if (t) t.style.display = 'flex';
      try {
        window.currentView = view;
      } catch (e) {}
      try {
        var path = view === 'home' ? '/' : '/' + view;
        if (location.protocol !== 'file:' && location.pathname !== path) {
          history.pushState({ view: view }, '', path);
        }
      } catch (e) {}
      document.title = 'Blookbase | ' + (view === 'home' ? 'Home' : view.charAt(0).toUpperCase() + view.slice(1));
    } catch (e) {
      console.warn('[bb-nav] showView', e);
    }
  }

  // Always provide working globals even if main script crashed mid-way
  if (typeof window.switchView !== 'function') {
    window.switchView = function (view) {
      showView(view);
    };
  } else if (!window.switchView.__bbSafe) {
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      try {
        return orig.apply(this, arguments);
      } catch (err) {
        console.warn('[bb-nav] switchView failed, fallback', err);
        showView(view);
      }
    };
    window.switchView.__bbSafe = 1;
  }

  if (typeof window.toggleSidebar !== 'function') {
    window.toggleSidebar = function () {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (!sidebar) return;
      var open = sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open', open);
    };
  }
  if (typeof window.closeSidebar !== 'function') {
    window.closeSidebar = function () {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    };
  }

  // Clear stuck overlays that block all clicks
  function clearBlockers() {
    try {
      document.body.classList.remove('no-scroll', 'ps-opening', 'bb-page-editing');
      var ids = ['feedback-overlay', 'summary-overlay', 'squares-grid', 'pack-wrapper'];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('open', 'active');
        if (id === 'feedback-overlay' || id === 'summary-overlay') {
          el.style.display = '';
        }
      });
      var editBar = document.getElementById('bb-edit-bar');
      if (editBar) editBar.style.display = 'none';
    } catch (e) {}
  }

  function rewireClicks() {
    document.querySelectorAll('[onclick*="switchView"]').forEach(function (btn) {
      if (btn.__bbNav) return;
      var m = String(btn.getAttribute('onclick') || '').match(/switchView\(\s*['"]([^'"]+)['"]/);
      if (!m) return;
      var view = m[1];
      btn.__bbNav = 1;
      btn.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          clearBlockers();
          window.switchView(view);
        },
        true
      );
    });
    var menu = document.querySelector('.menu-btn');
    if (menu && !menu.__bbNav) {
      menu.__bbNav = 1;
      menu.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
        },
        true
      );
    }
  }

  function boot() {
    clearBlockers();
    rewireClicks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
})();
