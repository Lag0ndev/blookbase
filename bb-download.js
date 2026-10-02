/* Blookbase Download page — download blooks, packs, gamemode assets as SVG/PNG */
(function () {
  'use strict';
  if (window.__bbDownloadPage) return;
  window.__bbDownloadPage = 1;

  var STYLE =
    '#view-download{max-width:900px;margin:0 auto;padding:16px;}' +
    '#view-download .bb-dl-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 16px;width:100%;}' +
    '#view-download .bb-dl-toolbar select,#view-download .bb-dl-toolbar input{padding:10px 12px;border-radius:10px;border:none;font-weight:800;font-family:Nunito,sans-serif;}' +
    '#view-download .bb-dl-note{font-weight:700;opacity:.9;margin:0 0 14px;line-height:1.4;width:100%;}' +
    '#view-download .bb-dl-grid{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;}' +
    '#view-download .bb-dl-card{width:120px;background:rgba(0,0,0,.18);border-radius:14px;padding:10px 8px;text-align:center;}' +
    '#view-download .bb-dl-card img{width:64px;height:64px;object-fit:contain;display:block;margin:0 auto 6px;}' +
    '#view-download .bb-dl-card .n{font-size:12px;font-weight:800;line-height:1.2;margin:0 0 2px;}' +
    '#view-download .bb-dl-card .m{font-size:10px;font-weight:700;opacity:.85;margin:0 0 8px;}' +
    '#view-download .bb-dl-card .acts{display:flex;flex-direction:column;gap:4px;}' +
    '#view-download .bb-dl-card button{border:none;border-radius:8px;padding:6px 8px;font-weight:800;font-size:11px;cursor:pointer;background:rgba(255,255,255,.28);color:#fff;font-family:Nunito,sans-serif;}' +
    '#view-download .bb-dl-card button:hover{background:rgba(255,255,255,.45);}' +
    '#view-download .bb-dl-card button:disabled{opacity:.5;cursor:wait;}' +
    '#view-download .bb-dl-status{font-weight:800;margin:8px 0;min-height:1.2em;}' +
    '#view-download .bb-dl-section{width:100%;margin:18px 0 8px;font-family:Titan One,cursive;font-size:20px;text-align:center;}';

  var HTML =
    '<div class="main-content" id="view-download" style="display:none;flex-direction:column;align-items:center;">' +
    '<h1 class="header-title">Download</h1>' +
    '<p class="bb-dl-note">Download Blooket art for personal / fan use. SVG preferred for blooks. PNG available via conversion. Not affiliated with Blooket.</p>' +
    '<div class="bb-dl-toolbar">' +
    '<select id="bb-dl-cat">' +
    '<option value="blooks">All Blooks</option>' +
    '<option value="packs">By Pack</option>' +
    '<option value="pack-art">Pack covers &amp; art</option>' +
    '<option value="special">Leaks / Uniques</option>' +
    '<option value="gamemodes">Gamemode logos</option>' +
    '</select>' +
    '<select id="bb-dl-pack" style="display:none;"></select>' +
    '<input id="bb-dl-search" type="search" placeholder="Search…" style="flex:1;min-width:140px;">' +
    '<button type="button" id="bb-dl-zip" style="padding:10px 14px;border:none;border-radius:10px;font-weight:800;cursor:pointer;background:rgba(255,255,255,.3);color:#fff;font-family:Nunito,sans-serif;">Download visible (ZIP)</button>' +
    '</div>' +
    '<div class="bb-dl-status" id="bb-dl-status"></div>' +
    '<div class="bb-dl-grid" id="bb-dl-grid"></div>' +
    '</div>';

  var cache = { blooks: null, packs: null, special: null, gamemodes: null };
  var visibleItems = [];
  var sidebarDone = false;
  var pathDone = false;

  function injectStyle() {
    if (document.getElementById('bb-dl-style')) return;
    var s = document.createElement('style');
    s.id = 'bb-dl-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function ensureView() {
    if (!document.getElementById('view-download')) {
      document.body.insertAdjacentHTML('beforeend', HTML);
      var cat = document.getElementById('bb-dl-cat');
      var pack = document.getElementById('bb-dl-pack');
      var search = document.getElementById('bb-dl-search');
      var zip = document.getElementById('bb-dl-zip');
      if (cat) cat.addEventListener('change', onFilterChange);
      if (pack) pack.addEventListener('change', renderGrid);
      if (search) search.addEventListener('input', debounce(renderGrid, 150));
      if (zip) zip.addEventListener('click', downloadZipVisible);
    }
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
    return String(s || 'asset')
      .replace(/[^\w\-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 80) || 'asset';
  }

  function isSvgUrl(url) {
    return /\.svg(\?|$)/i.test(url || '');
  }

  function isPngUrl(url) {
    return /\.png(\?|$)/i.test(url || '');
  }

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
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 2000);
  }

  async function svgBlobToPngBlob(svgBlob, size) {
    size = size || 512;
    var text = await svgBlob.text();
    if (text.indexOf('xmlns') === -1) {
      text = text.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    var svgUrl = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }));
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, size, size);
          var scale = Math.min(size / (img.width || size), size / (img.height || size));
          var w = (img.width || size) * scale;
          var h = (img.height || size) * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          canvas.toBlob(
            function (b) {
              URL.revokeObjectURL(svgUrl);
              if (b) resolve(b);
              else reject(new Error('PNG encode failed'));
            },
            'image/png'
          );
        } catch (e) {
          URL.revokeObjectURL(svgUrl);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('SVG draw failed'));
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
        if (isSvgUrl(item.url) || (blob.type && blob.type.indexOf('svg') !== -1)) {
          triggerDownload(blob, base + '.svg');
        } else {
          triggerDownload(blob, base + (isPngUrl(item.url) ? '.png' : '.bin'));
          setStatus(item.name + ': source is not SVG — saved original');
        }
      } else {
        if (isSvgUrl(item.url) || (blob.type && blob.type.indexOf('svg') !== -1)) {
          var png = await svgBlobToPngBlob(blob, 512);
          triggerDownload(png, base + '.png');
        } else {
          triggerDownload(blob, base + '.png');
        }
      }
    } catch (e) {
      console.warn('[bb-dl]', e);
      setStatus('Failed: ' + (item.name || '') + ' — ' + (e.message || 'error') + '. Opening image in new tab.');
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
    if (!visibleItems.length) {
      setStatus('Nothing to download.');
      return;
    }
    var btn = document.getElementById('bb-dl-zip');
    if (btn) btn.disabled = true;
    setStatus('Preparing ZIP…');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      var zip = new JSZip();
      var folder = zip.folder('blookbase-assets');
      var ok = 0;
      for (var i = 0; i < visibleItems.length; i++) {
        var item = visibleItems[i];
        setStatus('Fetching ' + (i + 1) + '/' + visibleItems.length + ': ' + item.name);
        try {
          var blob = await fetchBlob(item.url);
          var ext = isSvgUrl(item.url) ? 'svg' : isPngUrl(item.url) ? 'png' : 'bin';
          var name = safeName(item.category + '_' + item.name) + '.' + ext;
          folder.file(name, blob);
          ok++;
        } catch (e) {
          console.warn('zip skip', item.name, e);
        }
      }
      setStatus('Building ZIP (' + ok + ' files)…');
      var out = await zip.generateAsync({ type: 'blob' });
      triggerDownload(out, 'blookbase-assets.zip');
      setStatus('Downloaded ZIP with ' + ok + ' files.');
    } catch (e) {
      console.warn(e);
      setStatus('ZIP failed: ' + (e.message || e));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function ensureData() {
    if (!cache.blooks) {
      try {
        cache.blooks = await fetch('/data/blooks.json?t=' + Date.now()).then(function (r) { return r.json(); });
      } catch (e) {
        cache.blooks = [];
      }
    }
    if (!cache.packs) {
      try {
        cache.packs = await fetch('/data/packs.json?t=' + Date.now()).then(function (r) { return r.json(); });
      } catch (e) {
        cache.packs = { packs: [] };
      }
    }
    if (!cache.special) {
      try {
        cache.special = await fetch('/data/special-blooks.json?t=' + Date.now()).then(function (r) { return r.json(); });
      } catch (e) {
        cache.special = {};
      }
    }
    if (!cache.gamemodes) {
      try {
        cache.gamemodes = await fetch('/data/gamemodes.json?t=' + Date.now()).then(function (r) { return r.json(); });
      } catch (e) {
        cache.gamemodes = { gamemodes: [] };
      }
    }
  }

  function collectItems() {
    var cat = (document.getElementById('bb-dl-cat') || {}).value || 'blooks';
    var packSel = (document.getElementById('bb-dl-pack') || {}).value || '';
    var q = ((document.getElementById('bb-dl-search') || {}).value || '').trim().toLowerCase();
    var items = [];

    function add(name, url, meta, category) {
      if (!url) return;
      items.push({ name: name, url: url, meta: meta || '', category: category || 'asset' });
    }

    if (cat === 'blooks') {
      (cache.blooks || []).forEach(function (b) {
        add(b.name, b.img || b.url, (b.rarity || '') + (b.pack ? ' · ' + b.pack : ''), 'blook');
      });
      ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
        (p.blooks || []).forEach(function (b) {
          add(b.name, b.url || b.img, (b.rarity || '') + ' · ' + (p.name || p.id), 'blook');
        });
      });
    } else if (cat === 'packs') {
      var packs = (cache.packs && cache.packs.packs) || [];
      packs.forEach(function (p) {
        if (packSel && p.id !== packSel) return;
        (p.blooks || []).forEach(function (b) {
          add(b.name, b.url || b.img, (b.rarity || '') + ' · ' + (p.name || p.id), p.id || 'pack');
        });
      });
    } else if (cat === 'pack-art') {
      ((cache.packs && cache.packs.packs) || []).forEach(function (p) {
        var label = p.name || p.id;
        if (p.png) add(label + ' cover', p.png, 'pack cover', 'pack-art');
        if (p.packBottom) add(label + ' bottom', p.packBottom, 'pack bottom', 'pack-art');
        if (p.cornerIcon) add(label + ' icon', p.cornerIcon, 'corner icon', 'pack-art');
        if (p.blookBackground) add(label + ' bg', p.blookBackground, 'background', 'pack-art');
      });
    } else if (cat === 'special') {
      (cache.special.unreleased || []).forEach(function (b) {
        add(b.name, b.url, (b.rarity || '') + (b.pack ? ' · ' + b.pack : ''), 'unreleased');
      });
      (cache.special.uniques || []).forEach(function (b) {
        add(b.name, b.url, b.notes || 'Unique', 'unique');
      });
    } else if (cat === 'gamemodes') {
      ((cache.gamemodes && cache.gamemodes.gamemodes) || []).forEach(function (g) {
        if (g.image) add(g.name, g.image, g.status || 'gamemode', 'gamemode');
      });
    }

    var seen = {};
    items = items.filter(function (it) {
      if (seen[it.url]) return false;
      seen[it.url] = 1;
      return true;
    });

    if (q) {
      items = items.filter(function (it) {
        return (it.name + ' ' + it.meta + ' ' + it.category).toLowerCase().indexOf(q) !== -1;
      });
    }

    items.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    return items;
  }

  function fillPackSelect() {
    var sel = document.getElementById('bb-dl-pack');
    if (!sel) return;
    var packs = (cache.packs && cache.packs.packs) || [];
    sel.innerHTML = '<option value="">All packs</option>';
    packs.forEach(function (p) {
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
    if (!items.length) {
      grid.innerHTML = '<p style="font-weight:800;opacity:.9;">No assets match.</p>';
      return;
    }
    items.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'bb-dl-card';
      card.innerHTML =
        '<img alt="" loading="lazy" onerror="this.style.opacity=.3">' +
        '<div class="n"></div><div class="m"></div>' +
        '<div class="acts">' +
        '<button type="button" data-fmt="svg">SVG</button>' +
        '<button type="button" data-fmt="png">PNG</button>' +
        '</div>';
      card.querySelector('img').src = item.url;
      card.querySelector('.n').textContent = item.name;
      card.querySelector('.m').textContent = item.meta;
      card.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          downloadOne(item, btn.getAttribute('data-fmt'), btn);
        });
      });
      if (!isSvgUrl(item.url)) {
        var svgBtn = card.querySelector('[data-fmt="svg"]');
        if (svgBtn) svgBtn.textContent = 'Original';
      }
      grid.appendChild(card);
    });
  }

  window.renderDownloadPage = async function () {
    injectStyle();
    ensureView();
    setStatus('Loading asset lists…');
    await ensureData();
    fillPackSelect();
    renderGrid();
  };

  function setSidebarActive(view) {
    try { window.currentView = view; } catch (e) {}
    document.querySelectorAll('.sidebar-link').forEach(function (btn) {
      var v = btn.getAttribute('data-view');
      btn.classList.toggle('active', v === view);
    });
  }

  function injectSidebar() {
    if (document.querySelector('[data-view="download"]')) {
      sidebarDone = true;
      return;
    }
    var list = document.querySelector('.sidebar-list') || document.getElementById('sidebar');
    if (!list) return;
    var about = list.querySelector('[data-view="about"]');
    var li = document.createElement(about && about.closest('li') ? 'li' : 'div');
    li.innerHTML =
      '<button class="sidebar-link" data-view="download" type="button">' +
      '<span class="sidebar-listIcon"><i class="fas fa-download"></i></span>' +
      '<span class="sidebar-text">Download</span></button>';
    var btn = li.querySelector('button');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.switchView === 'function') window.switchView('download');
    });
    if (about && about.closest('li')) about.closest('li').before(li);
    else if (about) about.before(btn);
    else list.appendChild(li);
    sidebarDone = true;
  }

  function patchSwitch() {
    if (typeof window.switchView !== 'function') return;
    if (window.switchView.__bbDownload) return;
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      injectStyle();
      ensureView();
      injectSidebar();
      if (view === 'download') {
        document.querySelectorAll('.main-content').forEach(function (el) {
          el.style.display = 'none';
        });
        var target = document.getElementById('view-download');
        if (target) target.style.display = 'flex';
        setSidebarActive('download');
        window.renderDownloadPage();
        if (!skipUrl) {
          try { history.pushState(null, '', '/download'); } catch (e) {}
        }
        try {
          if (typeof closeSidebar === 'function') closeSidebar();
        } catch (e) {}
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
    injectStyle();
    ensureView();
    injectSidebar();
    patchSwitch();
    handlePath();
    var n = 0;
    var iv = setInterval(function () {
      injectSidebar();
      patchSwitch();
      if (++n > 40) clearInterval(iv);
    }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
