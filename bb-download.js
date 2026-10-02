/* Blookbase Download page — full assets, matches site UI */
(function () {
  'use strict';
  if (window.__bbDownloadPage) return;
  window.__bbDownloadPage = 1;

  var PACK_COVERS = [
    'aquatic','autumn','blizzard','bot','breakfast','bug','dino','dog','iceMonster',
    'lunch','medieval','outback','pirate','safari','space','spooky','wonderland'
  ];
  var GM_LOGOS = [
    'bees','royale','study','racing','rush','hack2','carrom','dinos','factory','defense',
    'claw','snake','coco','brawl','bricks','kingdom','gold','fish','planets','mining',
    'candy','classic','defense2','cafe','laser','bubble'
  ];

  var STYLE =
    '#view-download{width:100%;max-width:900px;margin:0 auto;padding:8px 12px 40px;box-sizing:border-box;}' +
    '#view-download .bb-dl-card-wrap{width:100%;background:var(--accent,#9a49aa);border-radius:16px;padding:18px 16px;margin:0 0 16px;box-shadow:4px 4px 0 rgba(0,0,0,.15);border:3px solid rgba(255,255,255,.12);}' +
    '#view-download .bb-dl-card-wrap h2{font-family:Titan One,cursive;font-weight:normal;font-size:22px;margin:0 0 8px;text-align:center;}' +
    '#view-download .bb-dl-note{font-weight:700;opacity:.95;line-height:1.45;margin:0 0 14px;text-align:center;}' +
    '#view-download .bb-dl-toolbar{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0 0 12px;}' +
    '#view-download .bb-dl-toolbar select,#view-download .bb-dl-toolbar input{padding:10px 12px;border-radius:10px;border:none;font-weight:800;font-family:Nunito,sans-serif;font-size:14px;background:#fff;color:#333;}' +
    '#view-download .bb-dl-btn{padding:10px 14px;border-radius:10px;border:none;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;background:rgba(255,255,255,.28);color:#fff;font-size:14px;}' +
    '#view-download .bb-dl-btn:hover{background:rgba(255,255,255,.45);}' +
    '#view-download .bb-dl-btn:disabled{opacity:.55;cursor:wait;}' +
    '#view-download .bb-dl-status{font-weight:800;text-align:center;margin:8px 0 12px;min-height:1.2em;}' +
    '#view-download .bb-dl-grid{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;}' +
    '#view-download .bb-dl-item{width:110px;background:rgba(0,0,0,.2);border-radius:14px;padding:10px 6px 12px;text-align:center;}' +
    '#view-download .bb-dl-item img{width:64px;height:64px;object-fit:contain;display:block;margin:0 auto 6px;}' +
    '#view-download .bb-dl-item .n{font-size:12px;font-weight:800;line-height:1.2;margin:0 0 2px;word-break:break-word;}' +
    '#view-download .bb-dl-item .m{font-size:10px;font-weight:700;opacity:.85;margin:0 0 8px;}' +
    '#view-download .bb-dl-item .acts{display:flex;flex-direction:column;gap:5px;}' +
    '#view-download .bb-dl-item button{border:none;border-radius:8px;padding:6px 8px;font-weight:800;font-size:11px;cursor:pointer;background:rgba(255,255,255,.3);color:#fff;font-family:Nunito,sans-serif;}' +
    '#view-download .bb-dl-item button:hover{background:rgba(255,255,255,.5);}' +
    '#view-download .bb-dl-item button:disabled{opacity:.5;cursor:wait;}' +
    '#view-download .header-title{text-align:center;}';

  var HTML =
    '<div class="main-content" id="view-download" style="display:none;flex-direction:column;align-items:center;">' +
    '<h1 class="header-title">Download</h1>' +
    '<div class="bb-dl-card-wrap">' +
    '<h2>Blooket assets</h2>' +
    '<p class="bb-dl-note">Download blooks, pack art, and gamemode logos as SVG or PNG. Fan / personal use only — not affiliated with Blooket.</p>' +
    '<div class="bb-dl-toolbar">' +
    '<select id="bb-dl-cat" aria-label="Category">' +
    '<option value="all">Everything</option>' +
    '<option value="blooks">All Blooks</option>' +
    '<option value="packs">Blooks by Pack</option>' +
    '<option value="pack-art">Pack covers</option>' +
    '<option value="special">Leaks &amp; Uniques</option>' +
    '<option value="gamemodes">Gamemode logos</option>' +
    '</select>' +
    '<select id="bb-dl-pack" style="display:none;" aria-label="Pack"></select>' +
    '<input id="bb-dl-search" type="search" placeholder="Search name…" aria-label="Search">' +
    '<button type="button" class="bb-dl-btn" id="bb-dl-zip">Download visible (ZIP)</button>' +
    '</div>' +
    '<div class="bb-dl-status" id="bb-dl-status">Loading…</div>' +
    '<div class="bb-dl-grid" id="bb-dl-grid"></div>' +
    '</div></div>';

  var cache = { blooks: null, packs: null, special: null, gamemodes: null };
  var visibleItems = [];
  var pathDone = false;

  function injectStyle() {
    if (document.getElementById('bb-dl-style')) return;
    var s = document.createElement('style');
    s.id = 'bb-dl-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function ensureView() {
    if (document.getElementById('view-download')) return;
    document.body.insertAdjacentHTML('beforeend', HTML);
    var cat = document.getElementById('bb-dl-cat');
    var pack = document.getElementById('bb-dl-pack');
    var search = document.getElementById('bb-dl-search');
    var zip = document.getElementById('bb-dl-zip');
    if (cat) cat.addEventListener('change', onFilterChange);
    if (pack) pack.addEventListener('change', renderGrid);
    if (search) search.addEventListener('input', debounce(renderGrid, 120));
    if (zip) zip.addEventListener('click', downloadZipVisible);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var a = arguments;
      t = setTimeout(function () { fn.apply(null, a); }, ms);
    };
  }

  function setStatus(msg) {
    var el = document.getElementById('bb-dl-status');
    if (el) el.textContent = msg || '';
  }

  function safeName(s) {
    return String(s || 'asset').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 80) || 'asset';
  }

  function isSvgUrl(url) { return /\.svg(\?|$)/i.test(url || ''); }
  function isPngUrl(url) { return /\.png(\?|$)/i.test(url || ''); }

  async function fetchBlob(url) {
    var res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.blob();
  }

  function triggerDownload(blob, filename) {
    var a = document.createElement('a');
    var u = URL.createObjectURL(blob);
    a.href = u;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 2500);
  }

  async function svgBlobToPngBlob(svgBlob, size) {
    size = size || 512;
    var text = await svgBlob.text();
    if (text.indexOf('xmlns') === -1) text = text.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    var svgUrl = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }));
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          var scale = Math.min(size / (img.width || size), size / (img.height || size));
          var w = (img.width || size) * scale;
          var h = (img.height || size) * scale;
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          canvas.toBlob(function (b) {
            URL.revokeObjectURL(svgUrl);
            if (b) resolve(b); else reject(new Error('PNG failed'));
          }, 'image/png');
        } catch (e) {
          URL.revokeObjectURL(svgUrl);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('SVG load failed'));
      };
      img.src = svgUrl;
    });
  }

  async function downloadOne(item, format, btn) {
    if (!item || !item.url) return;
    if (btn) btn.disabled = true;
    try {
      var blob = await fetchBlob(item.url);
      var base = safeName(item.name);
      if (format === 'svg') {
        if (isSvgUrl(item.url) || (blob.type && blob.type.indexOf('svg') !== -1)) triggerDownload(blob, base + '.svg');
        else triggerDownload(blob, base + (isPngUrl(item.url) ? '.png' : '.bin'));
      } else {
        if (isSvgUrl(item.url) || (blob.type && blob.type.indexOf('svg') !== -1)) triggerDownload(await svgBlobToPngBlob(blob, 512), base + '.png');
        else triggerDownload(blob, base + '.png');
      }
    } catch (e) {
      setStatus('Could not download ' + item.name + ' — opened in new tab');
      try { window.open(item.url, '_blank', 'noopener'); } catch (e2) {}
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.JSZip) return resolve();
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function downloadZipVisible() {
    if (!visibleItems.length) { setStatus('Nothing to zip.'); return; }
    var btn = document.getElementById('bb-dl-zip');
    if (btn) btn.disabled = true;
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      var zip = new JSZip();
      var folder = zip.folder('blookbase-assets');
      var ok = 0;
      for (var i = 0; i < visibleItems.length; i++) {
        var item = visibleItems[i];
        setStatus('ZIP ' + (i + 1) + '/' + visibleItems.length + ' — ' + item.name);
        try {
          var blob = await fetchBlob(item.url);
          var ext = isSvgUrl(item.url) ? 'svg' : isPngUrl(item.url) ? 'png' : 'bin';
          folder.file(safeName(item.category + '_' + item.name) + '.' + ext, blob);
          ok++;
        } catch (e) {}
      }
      setStatus('Building ZIP (' + ok + ' files)…');
      triggerDownload(await zip.generateAsync({ type: 'blob' }), 'blookbase-assets.zip');
      setStatus('Downloaded ZIP · ' + ok + ' files');
    } catch (e) {
      setStatus('ZIP failed: ' + (e.message || e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function ensureData() {
    var jobs = [];
    if (!cache.blooks) jobs.push(fetch('/data/blooks.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { cache.blooks = d; }).catch(function () { cache.blooks = []; }));
    if (!cache.packs) jobs.push(fetch('/data/packs.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { cache.packs = d; }).catch(function () { cache.packs = { packs: [] }; }));
    if (!cache.special) jobs.push(fetch('/data/special-blooks.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { cache.special = d; }).catch(function () { cache.special = {}; }));
    if (!cache.gamemodes) jobs.push(fetch('/data/gamemodes.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { cache.gamemodes = d; }).catch(function () { cache.gamemodes = { gamemodes: [] }; }));
    await Promise.all(jobs);
  }

  function collectItems() {
    var cat = (document.getElementById('bb-dl-cat') || {}).value || 'all';
    var packSel = (document.getElementById('bb-dl-pack') || {}).value || '';
    var q = ((document.getElementById('bb-dl-search') || {}).value || '').trim().toLowerCase();
    var items = [];
    var seen = {};
    function add(name, url, meta, category) {
      if (!url || seen[url]) return;
      seen[url] = 1;
      items.push({ name: name, url: url, meta: meta || '', category: category || 'asset' });
    }
    function addBlooks() {
      (cache.blooks || []).forEach(function (b) { add(b.name, b.img || b.url, [b.rarity, b.pack].filter(Boolean).join(' · '), 'blook'); });
      ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
        (p.blooks || []).forEach(function (b) { add(b.name, b.url || b.img, [b.rarity, p.name || p.id].filter(Boolean).join(' · '), 'blook'); });
      });
    }
    function addPackBlooks() {
      ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
        if (packSel && p.id !== packSel) return;
        (p.blooks || []).forEach(function (b) { add(b.name, b.url || b.img, [b.rarity, p.name || p.id].filter(Boolean).join(' · '), p.id || 'pack'); });
      });
    }
    function addPackArt() {
      ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
        var label = p.name || p.id;
        if (p.png) add(label + ' cover', p.png, 'pack cover', 'pack-art');
        if (p.packBottom) add(label + ' bottom', p.packBottom, 'pack bottom', 'pack-art');
        if (p.cornerIcon) add(label + ' icon', p.cornerIcon, 'corner icon', 'pack-art');
        if (p.blookBackground) add(label + ' bg', p.blookBackground, 'blook bg', 'pack-art');
      });
      PACK_COVERS.forEach(function (id) {
        var url = 'https://ac.blooket.com/blookassets/packs/' + id + '.png';
        var nice = id.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
        add(nice + ' Pack', url, 'pack cover', 'pack-art');
      });
    }
    function addSpecial() {
      (cache.special.unreleased || []).forEach(function (b) { add(b.name, b.url, [b.rarity, b.pack].filter(Boolean).join(' · ') || 'Unreleased', 'unreleased'); });
      (cache.special.uniques || []).forEach(function (b) { add(b.name, b.url, b.notes || 'Unique', 'unique'); });
      (cache.special.mysticals || []).forEach(function (m) {
        if (m.url) add(m.name, m.url, m.event || 'Mystical', 'mystical');
        else {
          var slug = String(m.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (slug) add(m.name, 'https://ac.blooket.com/marketassets/blooks/' + slug + '.svg', m.event || 'Mystical', 'mystical');
        }
      });
    }
    function addGamemodes() {
      ((cache.gamemodes && cache.gamemodes.gamemodes) || []).forEach(function (g) { if (g.image) add(g.name, g.image, g.status || 'gamemode', 'gamemode'); });
      GM_LOGOS.forEach(function (id) {
        add(id.charAt(0).toUpperCase() + id.slice(1) + ' logo', 'https://ac.blooket.com/gamemodes/logos/' + id + '.png', 'gamemode logo', 'gamemode');
      });
    }
    if (cat === 'all') { addBlooks(); addPackArt(); addSpecial(); addGamemodes(); }
    else if (cat === 'blooks') addBlooks();
    else if (cat === 'packs') addPackBlooks();
    else if (cat === 'pack-art') addPackArt();
    else if (cat === 'special') addSpecial();
    else if (cat === 'gamemodes') addGamemodes();
    if (q) items = items.filter(function (it) { return (it.name + ' ' + it.meta + ' ' + it.category).toLowerCase().indexOf(q) !== -1; });
    items.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return items;
  }

  function fillPackSelect() {
    var sel = document.getElementById('bb-dl-pack');
    if (!sel) return;
    sel.innerHTML = '<option value="">All packs</option>';
    ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name || p.id;
      sel.appendChild(o);
    });
  }

  function onFilterChange() {
    var cat = (document.getElementById('bb-dl-cat') || {}).value;
    var pack = document.getElementById('bb-dl-pack');
    if (pack) pack.style.display = cat === 'packs' ? '' : 'none';
    renderGrid();
  }

  function renderGrid() {
    var grid = document.getElementById('bb-dl-grid');
    if (!grid) return;
    var items = collectItems();
    visibleItems = items;
    setStatus(items.length + ' asset' + (items.length === 1 ? '' : 's'));
    grid.innerHTML = '';
    if (!items.length) { grid.innerHTML = '<p style="font-weight:800;text-align:center;width:100%;">No assets match.</p>'; return; }
    items.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'bb-dl-item';
      card.innerHTML = '<img alt="" loading="lazy" onerror="this.style.opacity=.25"><div class="n"></div><div class="m"></div><div class="acts"><button type="button" data-fmt="svg">' + (isSvgUrl(item.url) ? 'SVG' : 'Original') + '</button><button type="button" data-fmt="png">PNG</button></div>';
      card.querySelector('img').src = item.url;
      card.querySelector('.n').textContent = item.name;
      card.querySelector('.m').textContent = item.meta;
      card.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () { downloadOne(item, btn.getAttribute('data-fmt'), btn); });
      });
      grid.appendChild(card);
    });
  }

  window.renderDownloadPage = async function () {
    injectStyle(); ensureView(); setStatus('Loading asset lists…');
    await ensureData(); fillPackSelect(); renderGrid();
  };

  function setSidebarActive(view) {
    try { window.currentView = view; } catch (e) {}
    document.querySelectorAll('.sidebar-link, .sidebar-foot-btn').forEach(function (btn) {
      var v = btn.getAttribute('data-view');
      if (v) btn.classList.toggle('active', v === view);
    });
  }

  function injectSidebar() {
    if (document.querySelector('[data-view="download"]')) return;
    var list = document.querySelector('.sidebar-list') || document.getElementById('sidebar');
    if (!list) return;
    var about = list.querySelector('[data-view="about"]');
    var holder = document.createElement(about && about.closest('li') ? 'li' : 'div');
    holder.innerHTML = '<button class="sidebar-link" data-view="download" type="button"><span class="sidebar-listIcon"><i class="fas fa-download"></i></span><span class="sidebar-text">Download</span></button>';
    var btn = holder.querySelector('button');
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (typeof window.switchView === 'function') window.switchView('download');
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
    });
    if (about && about.closest('li')) about.closest('li').before(holder);
    else if (about) about.before(btn);
    else list.appendChild(holder);
  }

  function patchSwitch() {
    if (typeof window.switchView !== 'function') return;
    if (window.switchView.__bbDownload) return;
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      injectStyle(); ensureView(); injectSidebar();
      if (view === 'download') {
        document.querySelectorAll('.main-content').forEach(function (el) { el.style.display = 'none'; });
        var target = document.getElementById('view-download');
        if (target) target.style.display = 'flex';
        setSidebarActive('download');
        window.renderDownloadPage();
        if (!skipUrl) { try { history.pushState(null, '', '/download'); } catch (e) {} }
        if (typeof window.closeSidebar === 'function') window.closeSidebar();
        return;
      }
      var vd = document.getElementById('view-download');
      if (vd) vd.style.display = 'none';
      return orig.call(this, view, skipUrl);
    };
    window.switchView.__bbDownload = 1;
  }

  function handlePath() {
    if (pathDone) return;
    var seg = (location.pathname || '/').replace(/^\/|\/$/g, '').toLowerCase();
    if (seg === 'download') {
      pathDone = true;
      if (typeof window.switchView === 'function') window.switchView('download', true);
    }
  }

  function boot() {
    injectStyle(); ensureView(); injectSidebar(); patchSwitch(); handlePath();
    var n = 0;
    var iv = setInterval(function () { injectSidebar(); patchSwitch(); if (++n > 40) clearInterval(iv); }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
