/* Blookbase UI fixes: home Spooky LIVE + What's New clickable blooks */
(function () {
  'use strict';
  if (window.__bbUiFixes) return;
  window.__bbUiFixes = 1;

  function fixHomeBanner() {
    var banner = document.querySelector('.home-banner');
    if (!banner) return;
    var h2 = banner.querySelector('h2');
    var p = banner.querySelector('p');
    var label = banner.querySelector('.home-banner-label');
    var logo = banner.querySelector('.home-banner-logo');
    if (h2 && /coming/i.test(h2.textContent || '')) {
      h2.textContent = 'Spooky Pack is LIVE!';
    }
    if (label) label.textContent = 'Spooktober \u00b7 LIVE';
    if (p && /countdown is live|days until Spooktober/i.test(p.textContent || '')) {
      p.textContent =
        'Halloween is here \u2014 Spooky Pack is in the Market with 14 blooks. Open Countdown for event timers and Season updates.';
    }
    if (logo) {
      logo.src = 'https://ac.blooket.com/marketassets/blooks/spookymoth.svg';
      logo.alt = 'Spooky Pack';
    }
  }

  function fixWhatsNewBlooks() {
    var view = document.getElementById('view-whatsnew');
    if (!view) return;
    view.querySelectorAll('.pack-blook').forEach(function (el) {
      if (el.getAttribute('data-bb-click')) return;
      var nameEl = el.querySelector('.bn');
      var rarEl = el.querySelector('.br');
      var chEl = el.querySelector('.chance');
      if (!nameEl) return;
      var name = (nameEl.textContent || '').trim();
      if (!name) return;
      var rarity = rarEl ? (rarEl.textContent || 'Uncommon').trim() : 'Uncommon';
      var chance = null;
      if (chEl) {
        var n = parseFloat(String(chEl.textContent || '').replace('%', ''));
        if (!isNaN(n)) chance = n;
      }
      el.setAttribute('data-bb-click', '1');
      el.classList.add('bb-click');
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openBlookDetail === 'function') {
          window.openBlookDetail(name, rarity, chance, 'Spooky Pack');
        }
      });
    });
  }

  function run() {
    fixHomeBanner();
    fixWhatsNewBlooks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  // Re-run when SPA switches views
  var obs = new MutationObserver(function () {
    fixHomeBanner();
    fixWhatsNewBlooks();
  });
  try {
    obs.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  setTimeout(run, 800);
  setTimeout(run, 2000);
})();
