/* Weekly Shop panel for Update Tracker */
(function () {
  'use strict';
  if (window.__bbWeeklyShop) return;
  window.__bbWeeklyShop = 1;

  function el(id) { return document.getElementById(id); }

  function ensureSlot() {
    var root = el('view-tracker');
    if (!root) return null;
    var slot = el('bb-weekly-shop-slot');
    if (slot) return slot;
    slot = document.createElement('div');
    slot.id = 'bb-weekly-shop-slot';
    var wrap = root.querySelector('.leaks-wrap');
    if (wrap) {
      var latest = el('bb-latest-slot');
      if (latest) wrap.insertBefore(slot, latest);
      else wrap.insertBefore(slot, wrap.firstChild);
    } else {
      root.appendChild(slot);
    }
    return slot;
  }

  function card(ws) {
    var cur = (ws && ws.current) || {};
    var items = cur.items || [];
    var imgs = items.slice(0, 8).map(function (it) {
      return '<div class="bb-ut-img"><img src="' + (it.url || '') + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'"><span>' + (it.name || '') + '</span></div>';
    }).join('');
    var changed = ws.lastChanged ? ('Last change detected: <b>' + ws.lastChanged + '</b>') : 'No rotation detected yet since tracking started.';
    var week = cur.weekOf ? ('Week of <b>' + cur.weekOf + '</b> \u00b7 ') : '';
    return (
      '<div class="leaks-section" id="bb-weekly-shop-card">' +
      '<div class="bb-ut-meta"><span class="bb-ut-badge">Weekly Shop</span></div>' +
      '<div class="bb-ut-title">Weekly Shop tracker</div>' +
      '<p class="bb-ut-body">' +
      'Resets <b>Monday or Tuesday ~6:00 PM Central</b>. Watches limited/weekly market assets every ~5 minutes. ' +
      'When the signature changes, Tracker logs a <b>Weekly Shop assets changed</b> update automatically.' +
      '</p>' +
      '<p class="bb-ut-body" style="margin-top:8px;opacity:.95;">' + week + changed +
      (cur.availableCount != null ? (' \u00b7 <b>' + cur.availableCount + '</b> related assets online') : '') +
      '</p>' +
      (imgs ? ('<div class="bb-ut-imgs">' + imgs + '</div>') : '') +
      '<p class="bb-ut-body" style="margin-top:8px;font-size:13px;opacity:.85;">Open Blooket \u2192 Market \u2192 scroll to Weekly Shop for live banners, titles, and parts.</p>' +
      '</div>'
    );
  }

  window.__bbRenderWeeklyShop = async function () {
    var slot = ensureSlot();
    if (!slot) return;
    try {
      var ws = await fetch('/data/weekly-shop.json?t=' + Date.now()).then(function (r) {
        if (!r.ok) throw 0;
        return r.json();
      });
      slot.innerHTML = card(ws);
    } catch (e) {
      slot.innerHTML = card({
        lastChanged: null,
        current: { items: [], availableCount: null },
        resetHint: 'Mon/Tue ~6:00 PM Central'
      });
    }
  };

  function patch() {
    if (typeof window.renderTrackerPage === 'function' && !window.renderTrackerPage.__ws) {
      var orig = window.renderTrackerPage;
      window.renderTrackerPage = async function () {
        var r = await orig.apply(this, arguments);
        try { await window.__bbRenderWeeklyShop(); } catch (e) {}
        return r;
      };
      window.renderTrackerPage.__ws = 1;
    }
    if (typeof window.switchView === 'function' && !window.switchView.__ws) {
      var sv = window.switchView;
      window.switchView = function (v) {
        var r = sv.apply(this, arguments);
        if (v === 'tracker') setTimeout(function () { window.__bbRenderWeeklyShop && window.__bbRenderWeeklyShop(); }, 80);
        return r;
      };
      window.switchView.__ws = 1;
    }
  }

  function boot() {
    patch();
    var t = 0, iv = setInterval(function () {
      patch();
      if (++t > 40) clearInterval(iv);
    }, 200);
    if ((location.pathname || '').replace(/\/+$/, '') === '/tracker') {
      setTimeout(function () { window.__bbRenderWeeklyShop && window.__bbRenderWeeklyShop(); }, 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
