/* Blookbase Thumbnail Maker — canvas editor with Blooket assets */
(function () {
  'use strict';
  if (window.__bbThumbMaker) return;
  window.__bbThumbMaker = 1;

  var W = 1280, H = 720;
  var layers = [];
  var selected = -1;
  var dragging = false;
  var dragOff = { x: 0, y: 0 };
  var assetCache = { blooks: [], packs: [], special: {}, gamemodes: [] };
  var pathDone = false;
  var imgCache = {};

  var BG_PRESETS = [
    { name: 'Purple', c: '#9a49aa' }, { name: 'Blue', c: '#349aef' }, { name: 'Cyan', c: '#0bc2cf' },
    { name: 'Spooky', c: '#1a0a2e' }, { name: 'Gold', c: '#f59e0b' }, { name: 'Red', c: '#dc2626' },
    { name: 'Green', c: '#16a34a' }, { name: 'Pink', c: '#ec4899' }, { name: 'Black', c: '#0f0f12' },
    { name: 'White', c: '#f8fafc' }, { name: 'Chroma', c: '#0d9488' }, { name: 'Epic', c: '#7f1d1d' }
  ];

  var STYLE =
    '#view-thumbnail{width:100%;max-width:1100px;margin:0 auto;padding:8px 10px 48px;box-sizing:border-box;}' +
    '#view-thumbnail .tm-wrap{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-start;}' +
    '#view-thumbnail .tm-panel{background:var(--accent,#9a49aa);border-radius:16px;padding:14px;box-shadow:4px 4px 0 rgba(0,0,0,.15);border:3px solid rgba(255,255,255,.12);width:100%;max-width:320px;}' +
    '#view-thumbnail .tm-canvas-panel{background:var(--accent,#9a49aa);border-radius:16px;padding:14px;box-shadow:4px 4px 0 rgba(0,0,0,.15);border:3px solid rgba(255,255,255,.12);flex:1;min-width:280px;max-width:700px;}' +
    '#view-thumbnail h2.tm-h{font-family:Titan One,cursive;font-weight:normal;font-size:18px;margin:0 0 10px;text-align:center;}' +
    '#view-thumbnail .tm-row{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px;align-items:center;}' +
    '#view-thumbnail label.tm-l{font-weight:800;font-size:12px;opacity:.95;display:block;margin:0 0 4px;}' +
    '#view-thumbnail select,#view-thumbnail input[type=text],#view-thumbnail input[type=number],#view-thumbnail input[type=search],#view-thumbnail input[type=color],#view-thumbnail textarea{' +
    'width:100%;padding:8px 10px;border-radius:8px;border:none;font-weight:700;font-family:Nunito,sans-serif;font-size:13px;box-sizing:border-box;}' +
    '#view-thumbnail .tm-btn{padding:8px 12px;border:none;border-radius:8px;font-weight:800;font-family:Nunito,sans-serif;cursor:pointer;background:rgba(255,255,255,.28);color:#fff;font-size:13px;}' +
    '#view-thumbnail .tm-btn:hover{background:rgba(255,255,255,.45);}' +
    '#view-thumbnail .tm-btn.primary{background:#fff;color:var(--accent,#9a49aa);}' +
    '#view-thumbnail .tm-btn.danger{background:rgba(127,29,29,.85);}' +
    '#view-thumbnail #tm-canvas{width:100%;max-width:100%;height:auto;display:block;border-radius:10px;background:#111;cursor:crosshair;touch-action:none;}' +
    '#view-thumbnail .tm-asset-grid{display:flex;flex-wrap:wrap;gap:6px;max-height:160px;overflow-y:auto;margin:6px 0;}' +
    '#view-thumbnail .tm-asset{width:48px;height:48px;background:rgba(0,0,0,.25);border-radius:8px;padding:4px;cursor:pointer;border:2px solid transparent;}' +
    '#view-thumbnail .tm-asset:hover{border-color:#fff;}' +
    '#view-thumbnail .tm-asset img{width:100%;height:100%;object-fit:contain;}' +
    '#view-thumbnail .tm-layers{max-height:140px;overflow-y:auto;font-weight:700;font-size:12px;}' +
    '#view-thumbnail .tm-layer{padding:6px 8px;margin:3px 0;background:rgba(0,0,0,.2);border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;}' +
    '#view-thumbnail .tm-layer.on{background:rgba(255,255,255,.35);color:#1a0a2e;}' +
    '#view-thumbnail .tm-note{font-weight:700;font-size:12px;opacity:.9;margin:0 0 8px;line-height:1.35;}' +
    '#view-thumbnail .tm-swatches{display:flex;flex-wrap:wrap;gap:6px;}' +
    '#view-thumbnail .tm-swatch{width:28px;height:28px;border-radius:6px;border:2px solid rgba(255,255,255,.5);cursor:pointer;}' +
    '@media(max-width:700px){#view-thumbnail .tm-panel{max-width:100%;}}';

  var HTML =
    '<div class="main-content" id="view-thumbnail" style="display:none;flex-direction:column;align-items:center;">' +
    '<h1 class="header-title">Thumbnail Maker</h1>' +
    '<div class="tm-wrap">' +
    '<div class="tm-canvas-panel">' +
    '<h2 class="tm-h">Canvas</h2>' +
    '<div class="tm-row">' +
    '<button type="button" class="tm-btn" data-size="1280x720">1280×720</button>' +
    '<button type="button" class="tm-btn" data-size="1920x1080">1920×1080</button>' +
    '<button type="button" class="tm-btn" data-size="1080x1080">1080×1080</button>' +
    '</div>' +
    '<canvas id="tm-canvas" width="1280" height="720"></canvas>' +
    '<div class="tm-row" style="margin-top:10px;justify-content:center;">' +
    '<button type="button" class="tm-btn primary" id="tm-export">Download PNG</button>' +
    '<button type="button" class="tm-btn" id="tm-clear">Clear all</button>' +
    '</div></div>' +
    '<div class="tm-panel">' +
    '<h2 class="tm-h">Background</h2>' +
    '<div class="tm-swatches" id="tm-bg-swatches"></div>' +
    '<div class="tm-row" style="margin-top:8px;">' +
    '<input type="color" id="tm-bg-color" value="#9a49aa" title="Custom color">' +
    '<button type="button" class="tm-btn" id="tm-bg-solid">Solid</button>' +
    '<button type="button" class="tm-btn" id="tm-bg-checker">Checker</button>' +
    '<button type="button" class="tm-btn" id="tm-bg-gradient">Gradient</button>' +
    '</div>' +
    '<h2 class="tm-h" style="margin-top:14px;">Text</h2>' +
    '<label class="tm-l">Text</label><input type="text" id="tm-text" value="BLOOKET" placeholder="Your title…">' +
    '<div class="tm-row">' +
    '<div style="flex:1"><label class="tm-l">Font</label>' +
    '<select id="tm-font"><option value="Titan One">Titan One</option><option value="Nunito">Nunito</option></select></div>' +
    '<div style="width:90px"><label class="tm-l">Size</label><input type="number" id="tm-font-size" value="96" min="12" max="300"></div>' +
    '</div>' +
    '<div class="tm-row">' +
    '<div style="flex:1"><label class="tm-l">Color</label><input type="color" id="tm-text-color" value="#ffffff"></div>' +
    '<div style="flex:1"><label class="tm-l">Stroke</label><input type="color" id="tm-text-stroke" value="#000000"></div>' +
    '</div>' +
    '<button type="button" class="tm-btn primary" id="tm-add-text" style="width:100%;margin-top:6px;">Add text</button>' +
    '<h2 class="tm-h" style="margin-top:14px;">Assets</h2>' +
    '<select id="tm-asset-cat"><option value="blooks">Blooks</option><option value="packs">Pack covers</option><option value="gamemodes">Gamemodes</option><option value="special">Leaks / Uniques</option></select>' +
    '<input type="search" id="tm-asset-search" placeholder="Search assets…" style="margin-top:6px;">' +
    '<div class="tm-asset-grid" id="tm-asset-grid"></div>' +
    '<p class="tm-note">Tap an asset to add it. Drag to move. Tools apply to the selected layer.</p>' +
    '<h2 class="tm-h">Layers</h2>' +
    '<div class="tm-layers" id="tm-layers"></div>' +
    '<div class="tm-row">' +
    '<button type="button" class="tm-btn" id="tm-up">↑</button>' +
    '<button type="button" class="tm-btn" id="tm-down">↓</button>' +
    '<button type="button" class="tm-btn danger" id="tm-del">Delete</button>' +
    '</div>' +
    '<h2 class="tm-h" style="margin-top:12px;">Tools</h2>' +
    '<div class="tm-row">' +
    '<button type="button" class="tm-btn" id="tm-arrow">Arrow →</button>' +
    '<button type="button" class="tm-btn" id="tm-speed">Speed lines</button>' +
    '</div>' +
    '<div class="tm-row">' +
    '<button type="button" class="tm-btn" id="tm-pixel">Pixelate</button>' +
    '<button type="button" class="tm-btn" id="tm-blur">Blur</button>' +
    '<button type="button" class="tm-btn" id="tm-nobg">Remove BG</button>' +
    '</div>' +
    '<div class="tm-row">' +
    '<div style="flex:1"><label class="tm-l">Scale %</label><input type="number" id="tm-scale" value="100" min="10" max="400"></div>' +
    '<button type="button" class="tm-btn" id="tm-apply-scale">Apply scale</button>' +
    '</div></div></div></div>';

  function $(id) { return document.getElementById(id); }

  function injectStyle() {
    if ($('bb-tm-style')) return;
    var s = document.createElement('style');
    s.id = 'bb-tm-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function ensureView() {
    if ($('view-thumbnail')) return;
    document.body.insertAdjacentHTML('beforeend', HTML);
    wireUI();
  }

  function canvas() { return $('tm-canvas'); }

  function loadImage(url) {
    if (imgCache[url]) return imgCache[url];
    var p = new Promise(function (resolve, reject) {
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error('img')); };
      im.src = url;
    });
    imgCache[url] = p;
    return p;
  }

  function defaultBg() {
    return { type: 'bg', mode: 'solid', color: '#9a49aa', color2: '#349aef' };
  }

  function redraw() {
    var c = canvas();
    if (!c) return;
    var g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    var bg = layers.find(function (l) { return l.type === 'bg'; }) || defaultBg();
    drawLayer(g, bg, c.width, c.height);
    layers.forEach(function (l, i) {
      if (l.type === 'bg') return;
      drawLayer(g, l, c.width, c.height);
      if (i === selected) {
        g.save();
        g.strokeStyle = 'rgba(255,255,255,0.9)';
        g.lineWidth = 2;
        g.setLineDash([6, 4]);
        var b = layerBounds(l);
        g.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
        g.restore();
      }
    });
  }

  function drawLayer(g, l, cw, ch) {
    if (l.type === 'bg') {
      if (l.mode === 'checker') {
        var sz = 40;
        for (var y = 0; y < ch; y += sz) {
          for (var x = 0; x < cw; x += sz) {
            g.fillStyle = ((x / sz + y / sz) % 2 === 0) ? l.color : (l.color2 || '#2d1250');
            g.fillRect(x, y, sz, sz);
          }
        }
      } else if (l.mode === 'gradient') {
        var grd = g.createLinearGradient(0, 0, cw, ch);
        grd.addColorStop(0, l.color);
        grd.addColorStop(1, l.color2 || '#349aef');
        g.fillStyle = grd;
        g.fillRect(0, 0, cw, ch);
      } else {
        g.fillStyle = l.color || '#9a49aa';
        g.fillRect(0, 0, cw, ch);
      }
      return;
    }
    if (l.type === 'text') {
      g.save();
      g.translate(l.x, l.y);
      g.rotate((l.rot || 0) * Math.PI / 180);
      g.font = 'bold ' + (l.size || 64) + 'px "' + (l.font || 'Titan One') + '", Nunito, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (l.stroke) {
        g.lineWidth = Math.max(4, (l.size || 64) / 12);
        g.strokeStyle = l.stroke;
        g.strokeText(l.text || '', 0, 0);
      }
      g.fillStyle = l.color || '#fff';
      g.fillText(l.text || '', 0, 0);
      g.restore();
      return;
    }
    if (l.type === 'image' && l._img) {
      g.save();
      var sc = l.scale || 1;
      var w = l._img.width * sc;
      var h = l._img.height * sc;
      g.translate(l.x, l.y);
      g.rotate((l.rot || 0) * Math.PI / 180);
      if (l.blur) g.filter = 'blur(' + l.blur + 'px)';
      if (l.pixel) {
        var pw = Math.max(4, Math.floor(w / (l.pixel || 8)));
        var ph = Math.max(4, Math.floor(h / (l.pixel || 8)));
        var tmp = document.createElement('canvas');
        tmp.width = pw; tmp.height = ph;
        var tg = tmp.getContext('2d');
        tg.imageSmoothingEnabled = false;
        tg.drawImage(l._img, 0, 0, pw, ph);
        g.imageSmoothingEnabled = false;
        g.drawImage(tmp, -w / 2, -h / 2, w, h);
      } else {
        g.drawImage(l._img, -w / 2, -h / 2, w, h);
      }
      g.filter = 'none';
      g.restore();
      return;
    }
    if (l.type === 'arrow') {
      g.save();
      g.strokeStyle = l.color || '#fff';
      g.fillStyle = l.color || '#fff';
      g.lineWidth = l.width || 12;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(l.x1, l.y1);
      g.lineTo(l.x2, l.y2);
      g.stroke();
      var ang = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
      var ah = 28;
      g.beginPath();
      g.moveTo(l.x2, l.y2);
      g.lineTo(l.x2 - ah * Math.cos(ang - 0.4), l.y2 - ah * Math.sin(ang - 0.4));
      g.lineTo(l.x2 - ah * Math.cos(ang + 0.4), l.y2 - ah * Math.sin(ang + 0.4));
      g.closePath();
      g.fill();
      g.restore();
      return;
    }
    if (l.type === 'speed') {
      g.save();
      g.strokeStyle = l.color || 'rgba(255,255,255,0.55)';
      g.lineWidth = 3;
      var n = l.count || 40;
      for (var i = 0; i < n; i++) {
        var yy = (i / n) * ch;
        var len = 80 + (i * 17) % 200;
        var xx = (i * 97) % cw;
        g.beginPath();
        g.moveTo(xx, yy);
        g.lineTo(xx + len, yy);
        g.stroke();
      }
      g.restore();
    }
  }

  function layerBounds(l) {
    if (l.type === 'text') {
      var s = l.size || 64;
      var w = (l.text || '').length * s * 0.55;
      return { x: l.x - w / 2, y: l.y - s / 2, w: w, h: s };
    }
    if (l.type === 'image' && l._img) {
      var sc = l.scale || 1;
      var w2 = l._img.width * sc;
      var h2 = l._img.height * sc;
      return { x: l.x - w2 / 2, y: l.y - h2 / 2, w: w2, h: h2 };
    }
    if (l.type === 'arrow') {
      return { x: Math.min(l.x1, l.x2) - 10, y: Math.min(l.y1, l.y2) - 10, w: Math.abs(l.x2 - l.x1) + 20, h: Math.abs(l.y2 - l.y1) + 20 };
    }
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  function hitTest(mx, my) {
    for (var i = layers.length - 1; i >= 0; i--) {
      var l = layers[i];
      if (l.type === 'bg' || l.type === 'speed') continue;
      var b = layerBounds(l);
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return i;
    }
    return -1;
  }

  function canvasCoords(e) {
    var c = canvas();
    var r = c.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - r.left) * (c.width / r.width),
      y: (clientY - r.top) * (c.height / r.height)
    };
  }

  function ensureBg() {
    if (!layers.some(function (l) { return l.type === 'bg'; })) layers.unshift(defaultBg());
  }

  function setBg(mode, color, color2) {
    ensureBg();
    var bg = layers.find(function (l) { return l.type === 'bg'; });
    bg.mode = mode || 'solid';
    if (color) bg.color = color;
    if (color2) bg.color2 = color2;
    else if (mode === 'checker') bg.color2 = '#2d1250';
    redraw();
  }

  function renderLayersList() {
    var box = $('tm-layers');
    if (!box) return;
    box.innerHTML = '';
    layers.forEach(function (l, i) {
      if (l.type === 'bg') return;
      var row = document.createElement('div');
      row.className = 'tm-layer' + (i === selected ? ' on' : '');
      var label = l.type === 'text' ? 'Text: ' + (l.text || '').slice(0, 18) :
        l.type === 'image' ? 'Img: ' + (l.name || 'asset') :
        l.type === 'arrow' ? 'Arrow' :
        l.type === 'speed' ? 'Speed lines' : l.type;
      row.innerHTML = '<span></span><span style="opacity:.7">☰</span>';
      row.querySelector('span').textContent = label;
      row.addEventListener('click', function () { selected = i; renderLayersList(); redraw(); });
      box.appendChild(row);
    });
  }

  async function addImageLayer(url, name) {
    try {
      var im = await loadImage(url);
      var sc = Math.min(280 / im.width, 280 / im.height, 1.2);
      layers.push({ type: 'image', url: url, name: name || 'asset', _img: im, x: W / 2, y: H / 2, scale: sc, rot: 0, blur: 0, pixel: 0 });
      selected = layers.length - 1;
      renderLayersList();
      redraw();
    } catch (e) {
      alert('Could not load image (CORS or missing). Try another asset.');
    }
  }

  function addTextLayer() {
    layers.push({
      type: 'text',
      text: ($('tm-text') || {}).value || 'BLOOKET',
      font: ($('tm-font') || {}).value || 'Titan One',
      size: parseInt(($('tm-font-size') || {}).value, 10) || 96,
      color: ($('tm-text-color') || {}).value || '#fff',
      stroke: ($('tm-text-stroke') || {}).value || '#000',
      x: W / 2, y: H / 2, rot: 0
    });
    selected = layers.length - 1;
    renderLayersList();
    redraw();
  }

  async function loadAssets() {
    try { assetCache.blooks = await fetch('/data/blooks.json?t=' + Date.now()).then(function (r) { return r.json(); }); } catch (e) { assetCache.blooks = []; }
    try { assetCache.packs = (await fetch('/data/packs.json?t=' + Date.now()).then(function (r) { return r.json(); })).packs || []; } catch (e) { assetCache.packs = []; }
    try { assetCache.special = await fetch('/data/special-blooks.json?t=' + Date.now()).then(function (r) { return r.json(); }); } catch (e) { assetCache.special = {}; }
    try { assetCache.gamemodes = (await fetch('/data/gamemodes.json?t=' + Date.now()).then(function (r) { return r.json(); })).gamemodes || []; } catch (e) { assetCache.gamemodes = []; }
    fillAssetGrid();
  }

  function fillAssetGrid() {
    var grid = $('tm-asset-grid');
    if (!grid) return;
    var cat = ($('tm-asset-cat') || {}).value || 'blooks';
    var q = (($('tm-asset-search') || {}).value || '').toLowerCase();
    var items = [];
    if (cat === 'blooks') {
      (assetCache.blooks || []).forEach(function (b) { items.push({ name: b.name, url: b.img || b.url }); });
      assetCache.packs.forEach(function (p) {
        (p.blooks || []).forEach(function (b) { items.push({ name: b.name, url: b.url || b.img }); });
      });
    } else if (cat === 'packs') {
      ['aquatic','autumn','blizzard','bot','breakfast','bug','dino','dog','iceMonster','lunch','medieval','outback','pirate','safari','space','spooky','wonderland'].forEach(function (id) {
        items.push({ name: id, url: 'https://ac.blooket.com/blookassets/packs/' + id + '.png' });
      });
      assetCache.packs.forEach(function (p) { if (p.png) items.push({ name: p.name || p.id, url: p.png }); });
    } else if (cat === 'gamemodes') {
      assetCache.gamemodes.forEach(function (g) { if (g.image) items.push({ name: g.name, url: g.image }); });
      ['snake','fish','bubble','brawl','bricks','candy','classic','claw','factory','gold'].forEach(function (id) {
        items.push({ name: id, url: 'https://ac.blooket.com/gamemodes/logos/' + id + '.png' });
      });
    } else if (cat === 'special') {
      (assetCache.special.unreleased || []).forEach(function (b) { items.push({ name: b.name, url: b.url }); });
      (assetCache.special.uniques || []).forEach(function (b) { items.push({ name: b.name, url: b.url }); });
    }
    var seen = {};
    items = items.filter(function (it) {
      if (!it.url || seen[it.url]) return false;
      seen[it.url] = 1;
      if (q && (it.name || '').toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).slice(0, 80);
    grid.innerHTML = '';
    items.forEach(function (it) {
      var d = document.createElement('div');
      d.className = 'tm-asset';
      d.title = it.name;
      d.innerHTML = '<img loading="lazy" alt="">';
      d.querySelector('img').src = it.url;
      d.addEventListener('click', function () { addImageLayer(it.url, it.name); });
      grid.appendChild(d);
    });
  }

  function removeBgSelected() {
    if (selected < 0 || layers[selected].type !== 'image' || !layers[selected]._img) return;
    var l = layers[selected];
    var im = l._img;
    var tmp = document.createElement('canvas');
    tmp.width = im.width; tmp.height = im.height;
    var tg = tmp.getContext('2d');
    tg.drawImage(im, 0, 0);
    var data = tg.getImageData(0, 0, tmp.width, tmp.height);
    var d = data.data;
    var r0 = d[0], g0 = d[1], b0 = d[2];
    var thr = 42;
    for (var i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) < thr * 3) d[i + 3] = 0;
    }
    tg.putImageData(data, 0, 0);
    var out = new Image();
    out.onload = function () { l._img = out; l.name = (l.name || 'img') + ' (no bg)'; redraw(); renderLayersList(); };
    out.src = tmp.toDataURL('image/png');
  }

  function wireUI() {
    var c = canvas();
    if (!c || c.__tmWired) return;
    c.__tmWired = 1;
    ensureBg();
    redraw();

    document.querySelectorAll('#view-thumbnail [data-size]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.getAttribute('data-size').split('x');
        W = parseInt(parts[0], 10); H = parseInt(parts[1], 10);
        c.width = W; c.height = H; redraw();
      });
    });

    var sw = $('tm-bg-swatches');
    if (sw) {
      BG_PRESETS.forEach(function (p) {
        var el = document.createElement('button');
        el.type = 'button'; el.className = 'tm-swatch'; el.style.background = p.c; el.title = p.name;
        el.addEventListener('click', function () { $('tm-bg-color').value = p.c; setBg('solid', p.c); });
        sw.appendChild(el);
      });
    }
    $('tm-bg-solid').addEventListener('click', function () { setBg('solid', $('tm-bg-color').value); });
    $('tm-bg-checker').addEventListener('click', function () { setBg('checker', $('tm-bg-color').value, '#1a0a2e'); });
    $('tm-bg-gradient').addEventListener('click', function () { setBg('gradient', $('tm-bg-color').value, '#0bc2cf'); });
    $('tm-add-text').addEventListener('click', addTextLayer);
    $('tm-export').addEventListener('click', function () {
      selected = -1; redraw();
      var a = document.createElement('a');
      a.download = 'blookbase-thumbnail.png';
      a.href = c.toDataURL('image/png');
      a.click();
    });
    $('tm-clear').addEventListener('click', function () {
      if (!confirm('Clear all layers?')) return;
      layers = [defaultBg()]; selected = -1; renderLayersList(); redraw();
    });
    $('tm-asset-cat').addEventListener('change', fillAssetGrid);
    $('tm-asset-search').addEventListener('input', fillAssetGrid);
    $('tm-del').addEventListener('click', function () {
      if (selected < 0 || layers[selected].type === 'bg') return;
      layers.splice(selected, 1); selected = -1; renderLayersList(); redraw();
    });
    $('tm-up').addEventListener('click', function () {
      if (selected < 0 || selected >= layers.length - 1) return;
      var t = layers[selected]; layers[selected] = layers[selected + 1]; layers[selected + 1] = t; selected++; renderLayersList(); redraw();
    });
    $('tm-down').addEventListener('click', function () {
      if (selected <= 0 || (layers[selected - 1] && layers[selected - 1].type === 'bg')) return;
      var t = layers[selected]; layers[selected] = layers[selected - 1]; layers[selected - 1] = t; selected--; renderLayersList(); redraw();
    });
    $('tm-arrow').addEventListener('click', function () {
      layers.push({ type: 'arrow', x1: W * 0.2, y1: H * 0.5, x2: W * 0.8, y2: H * 0.5, color: '#ffffff', width: 14 });
      selected = layers.length - 1; renderLayersList(); redraw();
    });
    $('tm-speed').addEventListener('click', function () {
      layers.push({ type: 'speed', color: 'rgba(255,255,255,0.5)', count: 48 });
      selected = layers.length - 1; renderLayersList(); redraw();
    });
    $('tm-pixel').addEventListener('click', function () {
      if (selected < 0 || layers[selected].type !== 'image') return;
      layers[selected].pixel = layers[selected].pixel ? 0 : 10; redraw();
    });
    $('tm-blur').addEventListener('click', function () {
      if (selected < 0 || layers[selected].type !== 'image') return;
      layers[selected].blur = layers[selected].blur ? 0 : 6; redraw();
    });
    $('tm-nobg').addEventListener('click', removeBgSelected);
    $('tm-apply-scale').addEventListener('click', function () {
      if (selected < 0 || layers[selected].type !== 'image') return;
      layers[selected].scale = (parseInt($('tm-scale').value, 10) || 100) / 100; redraw();
    });

    function onDown(e) {
      e.preventDefault();
      var p = canvasCoords(e);
      selected = hitTest(p.x, p.y);
      renderLayersList();
      if (selected >= 0 && layers[selected].type !== 'bg') {
        dragging = true;
        var l = layers[selected];
        if (l.type === 'image' || l.type === 'text') { dragOff.x = p.x - l.x; dragOff.y = p.y - l.y; }
        else if (l.type === 'arrow') { dragOff.x = p.x - l.x2; dragOff.y = p.y - l.y2; }
      }
      redraw();
    }
    function onMove(e) {
      if (!dragging || selected < 0) return;
      e.preventDefault();
      var p = canvasCoords(e);
      var l = layers[selected];
      if (l.type === 'image' || l.type === 'text') { l.x = p.x - dragOff.x; l.y = p.y - dragOff.y; }
      else if (l.type === 'arrow') { l.x2 = p.x - dragOff.x; l.y2 = p.y - dragOff.y; }
      redraw();
    }
    function onUp() { dragging = false; }
    c.addEventListener('mousedown', onDown);
    c.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    c.addEventListener('touchstart', onDown, { passive: false });
    c.addEventListener('touchmove', onMove, { passive: false });
    c.addEventListener('touchend', onUp);
  }

  window.renderThumbnailPage = async function () {
    injectStyle(); ensureView(); ensureBg();
    await loadAssets();
    try {
      if (document.fonts && document.fonts.load) {
        await document.fonts.load('96px "Titan One"');
        await document.fonts.load('700 48px Nunito');
      }
    } catch (e) {}
    redraw(); renderLayersList();
  };

  function injectSidebar() {
    if (document.querySelector('[data-view="thumbnail"]')) return;
    var list = document.querySelector('.sidebar-list') || document.getElementById('sidebar');
    if (!list) return;
    var about = list.querySelector('[data-view="about"]');
    var holder = document.createElement(about && about.closest('li') ? 'li' : 'div');
    holder.innerHTML = '<button class="sidebar-link" data-view="thumbnail" type="button"><span class="sidebar-listIcon"><i class="fas fa-image"></i></span><span class="sidebar-text">Thumbnail Maker</span></button>';
    var btn = holder.querySelector('button');
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (typeof window.switchView === 'function') window.switchView('thumbnail');
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
    });
    if (about && about.closest('li')) about.closest('li').before(holder);
    else if (about) about.before(btn);
    else list.appendChild(holder);
  }

  function setSidebarActive(view) {
    try { window.currentView = view; } catch (e) {}
    document.querySelectorAll('.sidebar-link, .sidebar-foot-btn').forEach(function (btn) {
      var v = btn.getAttribute('data-view');
      if (v) btn.classList.toggle('active', v === view);
    });
  }

  function patchSwitch() {
    if (typeof window.switchView !== 'function') return;
    if (window.switchView.__bbThumb) return;
    var orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      injectStyle(); ensureView(); injectSidebar();
      if (view === 'thumbnail') {
        document.querySelectorAll('.main-content').forEach(function (el) { el.style.display = 'none'; });
        var t = $('view-thumbnail');
        if (t) t.style.display = 'flex';
        setSidebarActive('thumbnail');
        window.renderThumbnailPage();
        if (!skipUrl) { try { history.pushState(null, '', '/thumbnail'); } catch (e) {} }
        if (typeof window.closeSidebar === 'function') window.closeSidebar();
        return;
      }
      var vd = $('view-thumbnail');
      if (vd) vd.style.display = 'none';
      return orig.call(this, view, skipUrl);
    };
    window.switchView.__bbThumb = 1;
  }

  function handlePath() {
    if (pathDone) return;
    var seg = (location.pathname || '/').replace(/^\/|\/$/g, '').toLowerCase();
    if (seg === 'thumbnail' || seg === 'thumbnails') {
      pathDone = true;
      if (typeof window.switchView === 'function') window.switchView('thumbnail', true);
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
