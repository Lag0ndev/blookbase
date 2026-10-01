/* Blookbase nav recovery — safe, no loops */
(function () {
  'use strict';
  if (window.__bbNavFixV3) return;
  window.__bbNavFixV3 = 1;

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
    } catch (e) {
      console.warn('[bb-nav] showView', e);
    }
  }

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
      if (overlay) {
        overlay.classList.toggle('open', open);
        overlay.style.display = open ? 'block' : 'none';
      }
    };
  }
  if (typeof window.closeSidebar !== 'function') {
    window.closeSidebar = function () {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      }
    };
  }

  function clearBlockers() {
    try {
      document.body.classList.remove('no-scroll', 'ps-opening', 'bb-page-editing');
      ['feedback-overlay', 'summary-overlay', 'pack-wrapper'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      var ov = document.getElementById('sidebar-overlay');
      if (ov && !ov.classList.contains('open')) ov.style.display = 'none';
    } catch (e) {}
  }

  function rewireClicks() {
    document.querySelectorAll('.sidebar-link[data-view]').forEach(function (btn) {
      if (btn.__bbNav) return;
      btn.__bbNav = 1;
      var view = btn.getAttribute('data-view');
      btn.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          clearBlockers();
          if (typeof window.switchView === 'function') window.switchView(view);
          else showView(view);
          if (typeof window.closeSidebar === 'function') window.closeSidebar();
        },
        true
      );
    });
  }

  function boot() {
    clearBlockers();
    rewireClicks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();
