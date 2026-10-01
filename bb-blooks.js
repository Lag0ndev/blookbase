/* Blookbase Blooks - Blooket-style packs UI + detail popup */
(function () {
  'use strict';
  if (window.__bbBlooks) return;
  window.__bbBlooks = 1;

  var RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Chroma', 'Mystical', 'Unique'];
  var RARITY_COLOR = {
    Common: '#a4a4a4', Uncommon: '#4bc22e', Rare: '#0a14fa', Epic: '#be0000',
    Legendary: '#ff910f', Chroma: '#00c2a8', Mystical: '#a335ee', Unique: '#fe2db6'
  };
  var DATA = null;
  var state = { pack: 'all', rarity: 'all', q: '' };

  var SUITCASE_SVG = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="suitcase" class="svg-inline--fa fa-suitcase fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:1em;height:1em;vertical-align:-0.125em;"><path fill="currentColor" d="M128 480h256V80c0-26.5-21.5-48-48-48H176c-26.5 0-48 21.5-48 48v400zm64-384h128v32H192V96zm320 80v256c0 26.5-21.5 48-48 48h-48V128h48c26.5 0 48 21.5 48 48zM96 480H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h48v352z"></path></svg>';

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '\x26amp;').replace(/</g, '\x26lt;').replace(/>/g, '\x26gt;')
      .replace(/"/g, '\x26quot;').replace(/'/g, '\x26#39;');
  }

  function injectCss() {
    if (el('bb-blooks-css')) return;
    var s = document.createElement('style');
    s.id = 'bb-blooks-css';
    s.textContent = [
      '#view-blooks{align-items:center;}',
      '#view-blooks .bb-blooks-wrap{width:100%;max-width:720px;padding:0 12px 40px;}',
      '.bb-blooks-filters{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px;}',
      '.bb-blooks-filters input,.bb-blooks-filters select{',
      'padding:10px 12px;border-radius:10px;border:3px solid rgba(255,255,255,.25);',
      'background:rgba(0,0,0,.18);color:#fff;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;}',
      '.bb-blooks-filters input::placeholder{color:rgba(255,255,255,.55);}',
      '.bb-blooks-filters option{color:#222;background:#fff;}',
      '.bb-blooks-count{font-weight:800;opacity:.9;color:#fff;}',
      '.bb-packs-container{',
      'background:var(--accent,#9a49aa);color:#fff;padding:10px;width:100%;',
      'border:6px solid rgba(255,255,255,.2);border-radius:12px;',
      'box-shadow:4px 4px rgba(0,0,0,.2);font-family:Nunito,sans-serif;}',
      '.bb-packs-scrollbox{display:block;}',
      '.bb-pack{margin-bottom:18px;}',
      '.bb-pack:last-child{margin-bottom:4px;}',
      '.bb-pack-header{',
      'display:flex;align-items:center;gap:10px;margin:4px 0 10px;',
      'font-family:Titan One,cursive;font-size:20px;font-weight:normal;',
      'text-shadow:2px 2px 0 rgba(0,0,0,.15);}',
      '.bb-pack-blooks{display:flex;flex-wrap:wrap;gap:8px 6px;align-items:flex-start;}',
      '.bb-blook-btn{',
      'position:relative;display:inline-flex;flex-direction:column;align-items:center;',
      'width:64px;padding:4px 2px 6px;border:none;background:transparent;cursor:pointer;',
      'border-radius:8px;transition:transform .12s,background .12s;}',
      '.bb-blook-btn:hover{transform:translateY(-2px);background:rgba(0,0,0,.12);}',
      '.bb-blook-btn img{width:52px;height:52px;object-fit:contain;filter:drop-shadow(1px 2px 0 rgba(0,0,0,.15));pointer-events:none;}',
      '.bb-blook-name{font-size:10px;font-weight:800;line-height:1.15;text-align:center;margin-top:4px;max-width:60px;color:#fff;}',
      '.bb-blook-rar{font-size:9px;font-weight:800;margin-top:2px;opacity:.95;}',
      '.bb-blook-empty{font-weight:800;opacity:.85;padding:16px;text-align:center;}'
    ].join('');
    document.head.appendChild(s);
  }

  function killSecret() {
    document.querySelectorAll('button[data-view="secret"]').forEach(function (btn) {
      var li = btn.closest('li');
      if (li) li.remove(); else btn.remove();
    });
    document.querySelectorAll('.settings-section').forEach(function (sec) {
      var h = sec.querySelector('h3');
      if (h && /secret/i.test(h.textContent || '')) sec.remove();
    });
    ['view-secret', 'view-secret-stats', 'view-secret-blooks', 'view-secret-market'].forEach(function (id) {
      var vs = el(id);
      if (vs) { vs.style.display = 'none'; vs.innerHTML = ''; }
    });
    window.__bbRenderSecret = function () {};
  }

  function ensureBlooksSidebar() {
    var list = document.querySelector('ul.sidebar-list');
    if (!list) return;
    if (list.querySelector('button[data-view="blooks"]')) {
      var b = list.querySelector('button[data-view="blooks"]');
      var wrap = b.querySelector('.sidebar-listIcon');
      if (wrap && !b.innerHTML.includes('suitcase')) wrap.innerHTML = SUITCASE_SVG;
      return;
    }
    var marketBtn = list.querySelector('button[data-view="market"]');
    var li = document.createElement('li');
    li.innerHTML = '<button class="sidebar-link" data-view="blooks" type="button">' +
      '<span class="sidebar-listIcon">' + SUITCASE_SVG + '</span><span class="sidebar-text">Blooks</span></button>';
    var btn = li.querySelector('button');
    btn.onclick = function (e) { e.preventDefault(); if (typeof switchView === 'function') switchView('blooks'); };
    if (marketBtn && marketBtn.closest('li')) marketBtn.closest('li').after(li);
    else list.appendChild(li);
  }

  function ensureShell() {
    injectCss();
    var root = el('view-blooks');
    if (!root) {
      root = document.createElement('div');
      root.className = 'main-content';
      root.id = 'view-blooks';
      root.style.cssText = 'display:none;flex-direction:column;align-items:center;';
      var v404 = el('view-404');
      if (v404 && v404.parentNode) v404.parentNode.insertBefore(root, v404);
      else document.body.appendChild(root);
    }
    // Upgrade old white-card grid shell if still present
    if (el('bb-blooks-grid') && !el('bb-packs-container')) {
      root.innerHTML = '';
    }
    if (el('bb-packs-container')) return root;
    root.innerHTML =
      '<h1 class="header-title">Blooks</h1>' +
      '<div class="bb-blooks-wrap">' +
      '<div class="bb-blooks-filters">' +
      '<input id="bb-blooks-q" type="search" placeholder="Search blooks..." style="flex:1;min-width:140px;">' +
      '<select id="bb-blooks-pack"></select>' +
      '<select id="bb-blooks-rarity"></select>' +
      '<span class="bb-blooks-count" id="bb-blooks-count"></span>' +
      '</div>' +
      '<div class="bb-packs-container" id="bb-packs-container">' +
      '<div class="bb-packs-scrollbox" id="bb-packs-scrollbox">' +
      '<p class="bb-blook-empty">Loading blooks...</p>' +
      '</div></div></div>';
    return root;
  }

  function filtered() {
    var q = (state.q || '').trim().toLowerCase();
    return (DATA || []).filter(function (b) {
      if (state.pack !== 'all' && b.pack !== state.pack) return false;
      if (state.rarity !== 'all' && b.rarity !== state.rarity) return false;
      if (q && (b.name || '').toLowerCase().indexOf(q) < 0 && (b.pack || '').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function groupByPack(list) {
    var order = [];
    var map = {};
    list.forEach(function (b) {
      var p = b.pack || 'Other';
      if (!map[p]) { map[p] = []; order.push(p); }
      map[p].push(b);
    });
    order.sort(function (a, b) {
      if (a === 'Hidden Blooks') return 1;
      if (b === 'Hidden Blooks') return -1;
      return a.localeCompare(b);
    });
    order.forEach(function (p) {
      map[p].sort(function (a, b) {
        var ra = RARITY_ORDER.indexOf(a.rarity); if (ra < 0) ra = 99;
        var rb = RARITY_ORDER.indexOf(b.rarity); if (rb < 0) rb = 99;
        if (ra !== rb) return ra - rb;
        return String(a.name).localeCompare(String(b.name));
      });
    });
    return { order: order, map: map };
  }

  function openDetail(b) {
    if (typeof window.openBlookDetail === 'function') {
      try {
        if (b.img && typeof blookImageMap === 'object' && blookImageMap) blookImageMap[b.name] = b.img;
      } catch (e) {}
      window.openBlookDetail(b.name, b.rarity, null, b.pack);
      return;
    }
    var m = el('blook-detail-modal');
    var body = el('blook-detail-body');
    if (!m || !body) {
      alert(b.name + ' - ' + b.rarity + ' - ' + b.pack);
      return;
    }
    body.innerHTML = '<div style="text-align:center;padding:20px;color:#fff;">' +
      '<img src="' + esc(b.img) + '" alt="" style="width:120px;height:120px;object-fit:contain;">' +
      '<h2 style="margin:12px 0 6px;font-family:Titan One,cursive;">' + esc(b.name) + '</h2>' +
      '<p style="font-weight:800;">' + esc(b.rarity) + ' - ' + esc(b.pack) + '</p></div>';
    m.style.display = 'flex';
  }

  function render() {
    ensureShell();
    var box = el('bb-packs-scrollbox');
    var count = el('bb-blooks-count');
    if (!box) return;
    var list = filtered();
    if (count) count.textContent = list.length + ' blook' + (list.length === 1 ? '' : 's');
    if (!list.length) {
      box.innerHTML = '<p class="bb-blook-empty">No blooks match your filters.</p>';
      return;
    }
    var g = groupByPack(list);
    var html = '';
    g.order.forEach(function (packName) {
      var items = g.map[packName];
      html += '<div class="bb-pack">';
      html += '<div class="bb-pack-header">' + esc(packName) + '</div>';
      html += '<div class="bb-pack-blooks">';
      items.forEach(function (b) {
        var col = RARITY_COLOR[b.rarity] || '#fff';
        html += '<button type="button" class="bb-blook-btn" data-name="' + esc(b.name) + '">' +
          '<img src="' + esc(b.img) + '" alt="' + esc(b.name) + '" loading="lazy" draggable="false">' +
          '<span class="bb-blook-name">' + esc(b.name) + '</span>' +
          '<span class="bb-blook-rar" style="color:' + col + '">' + esc(b.rarity) + '</span>' +
          '</button>';
      });
      html += '</div></div>';
    });
    box.innerHTML = html;
    box.querySelectorAll('.bb-blook-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-name');
        var found = list.filter(function (x) { return x.name === name; })[0];
        if (found) openDetail(found);
      });
    });
  }

  function fillFilters() {
    var packs = {}, rarities = {};
    (DATA || []).forEach(function (b) { packs[b.pack] = 1; rarities[b.rarity] = 1; });
    var packSel = el('bb-blooks-pack'), rarSel = el('bb-blooks-rarity');
    if (!packSel || !rarSel) return;
    var curP = state.pack, curR = state.rarity;
    packSel.innerHTML = '<option value="all">All packs</option>';
    Object.keys(packs).sort().forEach(function (p) {
      var o = document.createElement('option'); o.value = p; o.textContent = p; packSel.appendChild(o);
    });
    rarSel.innerHTML = '<option value="all">All rarities</option>';
    RARITY_ORDER.forEach(function (r) {
      if (!rarities[r]) return;
      var o = document.createElement('option'); o.value = r; o.textContent = r; rarSel.appendChild(o);
    });
    packSel.value = curP; rarSel.value = curR;
  }

  function bind() {
    var q = el('bb-blooks-q'), pack = el('bb-blooks-pack'), rar = el('bb-blooks-rarity');
    if (q && !q.__bb) { q.__bb = 1; q.addEventListener('input', function () { state.q = q.value; render(); }); }
    if (pack && !pack.__bb) { pack.__bb = 1; pack.addEventListener('change', function () { state.pack = pack.value; render(); }); }
    if (rar && !rar.__bb) { rar.__bb = 1; rar.addEventListener('change', function () { state.rarity = rar.value; render(); }); }
  }

  function load(cb) {
    if (DATA && DATA.length) { cb(); return; }
    DATA = window.__BB_BLOOKS_DATA || [];
    if (DATA.length) { cb(); return; }
    var urls = ['data/blooks.json', '/data/blooks.json', 'https://cdn.jsdelivr.net/gh/Lag0ndev/blookbase@main/data/blooks.json'];
    var i = 0;
    function next() {
      if (i >= urls.length) { DATA = DATA || []; cb(); return; }
      fetch(urls[i++]).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { DATA = j; cb(); }).catch(next);
    }
    next();
  }

  window.__bbRenderBlooks = function () {
    ensureShell();
    load(function () { fillFilters(); bind(); render(); });
  };

  function patchSwitch() {
    if (typeof window.switchView !== 'function' || window.switchView.__bbB) return;
    var o = window.switchView;
    window.switchView = function (v) {
      if (v === 'secret' || v === 'secret-stats' || v === 'secret-blooks' || v === 'secret-market') {
        v = 'home'; arguments[0] = 'home';
      }
      var r = o.apply(this, arguments);
      if (arguments[0] === 'blooks' || v === 'blooks') {
        try { window.__bbRenderBlooks(); } catch (e) {}
      }
      if ((arguments[0] === 'countdown' || v === 'countdown') && typeof applyPage === 'function' && typeof currentPage !== 'undefined') {
        try { applyPage(currentPage); } catch (e) {}
      }
      killSecret();
      ensureBlooksSidebar();
      return r;
    };
    window.switchView.__bbB = 1;
  }

  function boot() {
    injectCss();
    killSecret();
    ensureBlooksSidebar();
    ensureShell();
    patchSwitch();
    if ((location.pathname.replace(/\/+$/, '') || '/') === '/blooks') {
      try { window.__bbRenderBlooks(); } catch (e) {}
    }
    var t = 0, iv = setInterval(function () {
      killSecret(); ensureBlooksSidebar(); patchSwitch();
      if (++t > 40) clearInterval(iv);
    }, 150);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
