/* Blookbase nav fix — stop broken clicks / accidental full reloads */
(function () {
  'use strict';
  if (window.__bbNavFix) return;
  window.__bbNavFix = 1;

  function ensureSwitchView() {
    if (typeof window.switchView === 'function') return;
    window.switchView = function (view) {
      try {
        document.querySelectorAll('.main-content').forEach(function (el) {
          el.style.display = 'none';
        });
        var target = document.getElementById('view-' + view) || document.getElementById('view-home');
        if (target) target.style.display = 'flex';
        try {
          var path = view === 'home' ? '/' : '/' + view;
          if (location.protocol !== 'file:' && location.pathname !== path) {
            history.pushState({ view: view }, '', path);
          }
        } catch (e) {}
      } catch (e) {}
    };
  }
  ensureSwitchView();

  if (typeof window.switchView === 'function' && !window.switchView.__bbNavSafe) {
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      try {
        return orig.apply(this, arguments);
      } catch (err) {
        console.warn('[bb-nav-fix] switchView error', err);
        try {
          document.querySelectorAll('.main-content').forEach(function (el) {
            el.style.display = 'none';
          });
          var t = document.getElementById('view-' + view) || document.getElementById('view-home');
          if (t) t.style.display = 'flex';
        } catch (e2) {}
      }
    };
    window.switchView.__bbNavSafe = 1;
  }

  document.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!form || form.id === 'feedback-form') return;
      if (form.closest && form.closest('#admin-panel, #view-settings, .ps-buy-modal, .summary-modal')) {
        e.preventDefault();
      }
    },
    true
  );

  function rewireHome() {
    document.querySelectorAll('[onclick*="switchView"]').forEach(function (btn) {
      if (btn.__bbRewire) return;
      var m = String(btn.getAttribute('onclick') || '').match(/switchView\(\s*['"]([^'"]+)['"]/);
      if (!m) return;
      var view = m[1];
      btn.__bbRewire = 1;
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof window.switchView === 'function') window.switchView(view);
      });
    });
  }

  var menu = document.querySelector('.menu-btn');
  if (menu && !menu.__bbMenu) {
    menu.__bbMenu = 1;
    menu.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
    });
  }

  function boot() {
    ensureSwitchView();
    rewireHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
