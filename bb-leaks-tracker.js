/* Blookbase Leaks + Tracker + route aliases */
(function () {
  'use strict';

  const STYLE = `
  .pack-blook.bb-click{cursor:pointer}
  .bb-ut-meta{font-size:13px;font-weight:700;opacity:.9;margin:0 0 8px}
  .bb-ut-title{font-family:'Titan One',sans-serif;font-weight:normal;font-size:20px;margin:0 0 8px;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,.15)}
  .bb-ut-body{font-size:15px;font-weight:700;line-height:1.5;margin:0 0 10px}
  .bb-ut-imgs{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
  .bb-ut-img{background:rgba(0,0,0,.18);border-radius:8px;padding:8px 6px 6px;text-align:center;min-width:72px}
  .bb-ut-img img{width:48px;height:48px;object-fit:contain;display:block;margin:0 auto 4px}
  .bb-ut-img span{display:block;font-size:10px;font-weight:800;line-height:1.2;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bb-ut-img.bb-click{cursor:pointer;transition:transform .12s ease,background .12s}
  .bb-ut-img.bb-click:hover{transform:translateY(-2px);background:rgba(0,0,0,.28)}
  .bb-ut-img.bb-kind-pack img,.bb-ut-img.bb-kind-gamemode img{width:56px;height:56px}
  .bb-ut-badge{display:inline-block;font-size:11px;font-weight:900;text-transform:uppercase;background:rgba(0,0,0,.2);padding:3px 8px;border-radius:6px;margin-right:6px}
  `;

  let pathHandled = false;
  let sidebarInjected = false;
  let bbCurrent = null;

  function injectStyle() {
    if (document.getElementById('bb-lt-style')) return;
    const s = document.createElement('style');
    s.id = 'bb-lt-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  const LEAKS_HTML = `
    <div class="main-content" id="view-leaks" style="display:none;flex-direction:column;align-items:center;">
      <h1 class="header-title">Leaks</h1>
      <div class="leaks-wrap">
        <div class="leaks-section">
          <h3>Unreleased / Secret Blooks</h3>
          <p style="font-weight:700;opacity:.95;margin:0 0 10px;">Click a Blook for details (same style as Packs).</p>
          <div class="pack-blooks-grid" id="bb-unreleased-grid"></div>
        </div>
        <div class="leaks-section">
          <h3>Uniques</h3>
          <div class="pack-blooks-grid" id="bb-uniques-grid"></div>
        </div>
        <div class="leaks-section">
          <h3>Mysticals</h3>
          <ul id="bb-mysticals-list"></ul>
        </div>
        <div class="leaks-section">
          <h3>Secret Pack — Color Pack</h3>
          <p style="font-weight:700;opacity:.95;margin:0 0 10px;">Only when all Commons are taken in a live game.</p>
          <div class="pack-blooks-grid" id="bb-color-grid"></div>
        </div>
        <div class="leaks-section">
          <h3>Gamemode status</h3>
          <ul id="bb-gm-list"></ul>
        </div>
      </div>
    </div>`;

  const TRACKER_HTML = `
    <div class="main-content" id="view-tracker" style="display:none;flex-direction:column;align-items:center;">
      <h1 class="header-title">Update Tracker</h1>
      <div class="leaks-wrap">
        <div id="bb-latest-slot"></div>
        <div id="bb-updates-feed"><div class="leaks-section"><p style="font-weight:700;margin:0">Loading…</p></div></div>
      </div>
    </div>`;

  const RARITY_GRADIENTS = {
    Common: 'radial-gradient(rgb(160,160,160) 40%, rgb(90,90,95))',
    Uncommon: 'radial-gradient(rgb(125,255,179) 40%, rgb(45,140,70))',
    Rare: 'radial-gradient(rgb(108,182,255) 40%, rgb(10,20,180))',
    Epic: 'radial-gradient(rgb(255,100,100) 40%, rgb(180,20,20))',
    Legendary: 'radial-gradient(rgb(255,179,71) 40%, rgb(200,100,20))',
    Chroma: 'radial-gradient(rgb(94,234,212) 40%, rgb(0,140,130))',
    Mystical: 'radial-gradient(rgb(232,121,249) 40%, rgb(120,30,160))',
    Unique: 'radial-gradient(rgb(45,212,191) 40%, rgb(0,120,110))'
  };

  const PATH_ALIAS = { packs: 'market', pack: 'market', calculator: 'packsim', calc: 'packsim' };
  const PATH_PRETTY = { market: 'packs', packsim: 'calculator' };

  function rarityTag(rarity) {
    if (typeof window.rarityTagHtml === 'function') {
      try { return window.rarityTagHtml(rarity); } catch (e) {}
    }
    return `<span class="bb-shop-tag">${rarity || '—'}</span>`;
  }

  function openBlookModal(b) {
    const name = b.name || 'Unknown';
    const rarity = b.rarity || 'Unique';
    const packName = b.pack || (b.pack === null ? 'Secret / Unique' : '');
    const chance =
      b.chance != null && b.chance !== ''
        ? Number(b.chance) + '%'
        : b.notes
          ? 'Event / Exclusive'
          : 'Unreleased';
    const img =
      b.url ||
      (typeof window.getBlookImg === 'function' ? window.getBlookImg(name) : '') ||
      'https://ac.blooket.com/marketassets/blooks/' +
        name.toLowerCase().replace(/[^a-z0-9]/g, '') +
        '.svg';
    const bg = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.Uncommon;
    const body = document.getElementById('blook-detail-body');
    const modal = document.getElementById('blook-detail-modal');
    if (body && modal) {
      body.innerHTML = `
        <div class="bb-shop-row">
          <div class="bb-shop-card" style="background:${bg};">
            <div class="bb-shop-shadow-letter">B</div>
            <div class="bb-shop-img-wrap">
              <img class="bb-shop-hero" src="${img}" alt="${name}" draggable="false" onerror="this.style.opacity=.3">
            </div>
            <div class="bb-shop-overlay"></div>
          </div>
          <div class="bb-shop-form">
            <div>
              <h2 class="bb-shop-title">${name}</h2>
              <div class="bb-shop-tags">
                ${rarityTag(rarity)}
                <span class="bb-shop-tag">${chance}</span>
                ${packName ? `<span class="bb-shop-tag">${packName}</span>` : ''}
              </div>
              ${b.notes ? `<p style="font-weight:700;margin:12px 0 0;opacity:.95;line-height:1.4;">${b.notes}</p>` : ''}
            </div>
            <button type="button" class="bb-shop-btn" onclick="closeBlookDetail()">
              <div class="bb-shop-btn-inner">Close</div>
            </button>
          </div>
        </div>`;
      modal.style.display = 'flex';
      return;
    }
    if (typeof window.openBlookDetail === 'function') {
      window.openBlookDetail(name, rarity, b.chance != null ? b.chance : null, packName);
    }
  }

  function cell(b) {
    const src = b.url || '';
    const img = src ? `<img src="${src}" alt="" loading="lazy" onerror="this.style.opacity=.3">` : '';
    const payload = encodeURIComponent(JSON.stringify(b));
    return `<div class="pack-blook bb-click" data-bb="${payload}">${img}<div class="bn">${b.name || ''}</div><div class="br">${b.rarity || ''}${b.pack ? ' · ' + b.pack : ''}</div></div>`;
  }

  function bindClicks(root) {
    if (!root) return;
    root.querySelectorAll('.bb-click').forEach((el) => {
      el.onclick = () => {
        try {
          openBlookModal(JSON.parse(decodeURIComponent(el.getAttribute('data-bb'))));
        } catch (e) {}
      };
    });
  }

  window.renderLeaksPage = async function () {
    try {
      const special = await fetch('/data/special-blooks.json').then((r) => r.json());
      const ug = document.getElementById('bb-unreleased-grid');
      const uq = document.getElementById('bb-uniques-grid');
      const ml = document.getElementById('bb-mysticals-list');
      if (ug) {
        ug.innerHTML = (special.unreleased || []).map(cell).join('');
        bindClicks(ug);
      }
      if (uq) {
        uq.innerHTML = (special.uniques || [])
          .map((u) => cell({ name: u.name, url: u.url, rarity: 'Unique', notes: u.notes || '', pack: null }))
          .join('');
        bindClicks(uq);
      }
      if (ml) {
        ml.innerHTML = (special.mysticals || [])
          .map((m) => `<li><span class="tag">mystical</span> <strong>${m.name}</strong> — ${m.event} (${m.copies} copies)</li>`)
          .join('');
      }
    } catch (e) {}
    try {
      const packs = await fetch('/data/packs.json').then((r) => r.json());
      const color = (packs.packs || []).find((p) => p.id === 'color');
      const cg = document.getElementById('bb-color-grid');
      if (cg && color) {
        cg.innerHTML = (color.blooks || [])
          .map((b) => cell({ ...b, pack: 'Color Pack', notes: 'Secret pack — only when all normal Commons are taken' }))
          .join('');
        bindClicks(cg);
      }
    } catch (e) {}
    try {
      const gm = await fetch('/data/gamemodes.json').then((r) => r.json());
      const gl = document.getElementById('bb-gm-list');
      if (gl) {
        gl.innerHTML = (gm.gamemodes || [])
          .map((g) => {
            const tag = g.status === 'Released' ? 'released' : 'upcoming';
            return `<li><span class="tag ${tag}">${g.status}</span> <strong>${g.name}</strong> — ${g.notes || ''}</li>`;
          })
          .join('');
      }
    } catch (e) {}
  };

  function formatEntryDate(e) {
    const date = e.date || '';
    const time = e.time;
    if (!date) return 'Unknown date';
    if (/^\d{4}-\d{2}$/.test(date)) return date + ' · Time: unknown';
    if (!time || time === 'unknown') return date + ' · Time: unknown';
    try {
      const iso = date + 'T' + String(time).replace(/Z$/, '') + 'Z';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return date + ' · Time: unknown';
      return d.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (err) {
      return date + ' · Time: unknown';
    }
  }

  window.renderTrackerPage = async function () {
    const feedEl = document.getElementById('bb-updates-feed');
    const latestSlot = document.getElementById('bb-latest-slot');
    try {
      const data = await fetch('/data/updates.json').then((r) => r.json());
      const entries = (data.entries || []).slice().sort(function (a, b) {
        const da = (a.date || '') + 'T' + (a.time && a.time !== 'unknown' ? String(a.time).replace(/Z$/, '') : '00:00:00') + 'Z';
        const db = (b.date || '') + 'T' + (b.time && b.time !== 'unknown' ? String(b.time).replace(/Z$/, '') : '00:00:00') + 'Z';
        const ta = Date.parse(da) || 0;
        const tb = Date.parse(db) || 0;
        return tb - ta;
      });

      function imgsHtml(images) {
        if (!images || !images.length) return '';
        return '<div class="bb-ut-imgs">' + images.map((im) => {
          const kind = im.kind || 'blook';
          const label = im.label || '';
          const clickable = kind === 'blook' && label;
          const rarity = im.rarity || '';
          const chance = im.chance != null ? im.chance : 'null';
          const pack = im.pack || '';
          const cls = 'bb-ut-img bb-kind-' + kind + (clickable ? ' bb-click' : '');
          const onclk = clickable
            ? ` onclick="typeof openBlookDetail==='function'&&openBlookDetail('${String(label).replace(/'/g, "\\'")}','${String(rarity || 'Uncommon').replace(/'/g, "\\'")}',${chance},'${String(pack).replace(/'/g, "\\'")}')"`
            : '';
          return `<div class="${cls}"${onclk}><img src="${im.src}" alt="${label}" loading="lazy" onerror="this.parentNode.style.display='none'"><span>${label}</span></div>`;
        }).join('') + '</div>';
      }

      function cardHtml(e, isLatest) {
        const when = formatEntryDate(e);
        const badge = isLatest ? '<span class="bb-ut-badge">Latest</span>' : '';
        const type = e.type ? `<span class="bb-ut-badge">${e.type}</span>` : '';
        return `<div class="leaks-section">
          <div class="bb-ut-meta">${badge}${type}${when}</div>
          <div class="bb-ut-title">${e.title}</div>
          <p class="bb-ut-body">${e.body || ''}</p>
          ${imgsHtml(e.images)}
        </div>`;
      }

      if (latestSlot && entries[0]) {
        latestSlot.innerHTML = cardHtml(entries[0], true);
      } else if (latestSlot) {
        latestSlot.innerHTML = '';
      }

      if (feedEl) {
        const rest = entries.slice(1);
        feedEl.innerHTML = rest.map((e) => cardHtml(e, false)).join('') || '';
      }
    } catch (e) {
      if (feedEl) feedEl.innerHTML = '<div class="leaks-section"><p style="font-weight:700;margin:0">Could not load updates.</p></div>';
    }
  };

  function setSidebarActive(view) {
    bbCurrent = view;
    try { window.currentView = view; } catch (e) {}
    document.querySelectorAll('.sidebar-link').forEach((btn) => {
      const v = btn.getAttribute('data-view');
      const on = v === view;
      btn.classList.toggle('active', on);
      if (on) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  }

  function injectSidebar() {
    if (sidebarInjected || document.querySelector('[data-view="leaks"]')) {
      sidebarInjected = true;
      return;
    }
    const list = document.querySelector('.sidebar-list');
    if (!list) return;
    const whats = list.querySelector('[data-view="whatsnew"]');
    const liParent = whats && whats.closest('li');
    if (!liParent) return;

    const leaksLi = document.createElement('li');
    leaksLi.innerHTML = `<button class="sidebar-link" data-view="leaks" type="button">
      <span class="sidebar-listIcon"><i class="fas fa-user-secret"></i></span>
      <span class="sidebar-text">Leaks</span>
    </button>`;
    const trackerLi = document.createElement('li');
    trackerLi.innerHTML = `<button class="sidebar-link" data-view="tracker" type="button">
      <span class="sidebar-listIcon"><i class="fas fa-rss"></i></span>
      <span class="sidebar-text">Tracker</span>
    </button>`;
    leaksLi.querySelector('button').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.switchView('leaks');
    };
    trackerLi.querySelector('button').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.switchView('tracker');
    };
    liParent.after(trackerLi);
    liParent.after(leaksLi);

    list.querySelectorAll('.sidebar-link').forEach((btn) => {
      const v = btn.getAttribute('data-view');
      const text = btn.querySelector('.sidebar-text');
      if (!text) return;
      if (v === 'market') text.textContent = 'Packs';
      if (v === 'packsim') text.textContent = 'Calculator';
    });
    sidebarInjected = true;
  }

  function ensureViews() {
    if (!document.getElementById('view-leaks')) {
      document.body.insertAdjacentHTML('beforeend', LEAKS_HTML);
    }
    if (!document.getElementById('view-tracker')) {
      document.body.insertAdjacentHTML('beforeend', TRACKER_HTML);
    }
  }

  const origSwitch = window.switchView;
  window.switchView = function (view, skipUrl) {
    injectStyle();
    ensureViews();
    injectSidebar();

    if (view === 'leaks' || view === 'tracker') {
      document.querySelectorAll('.main-content').forEach((el) => {
        el.style.display = 'none';
      });
      const target = document.getElementById('view-' + view);
      if (target) target.style.display = 'flex';
      setSidebarActive(view);
      if (view === 'leaks') window.renderLeaksPage();
      if (view === 'tracker') window.renderTrackerPage();
      if (!skipUrl) {
        try {
          history.pushState(null, '', '/' + view);
        } catch (e) {}
      }
      return;
    }

    if (typeof origSwitch === 'function') {
      return origSwitch.call(this, view, skipUrl);
    }
  };

  function handlePath() {
    if (pathHandled) return;
    const seg = (location.pathname || '/').replace(/^\/|\/$/g, '').toLowerCase() || 'home';
    const mapped = PATH_ALIAS[seg] || seg;
    if (mapped === 'leaks' || mapped === 'tracker') {
      pathHandled = true;
      window.switchView(mapped, true);
    }
  }

  function boot() {
    injectStyle();
    ensureViews();
    injectSidebar();
    handlePath();
    window.addEventListener('popstate', function () {
      pathHandled = false;
      handlePath();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
