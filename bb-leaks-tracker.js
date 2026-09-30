/* Blookbase Leaks + Tracker + route aliases */
(function () {
  'use strict';

  const STYLE = `
  .pack-blook.bb-click{cursor:pointer}
  .bb-tracker-time{font-size:13px;font-weight:800;opacity:.9}
  .bb-tracker-card{background:#9a49aa;border:6px solid rgba(255,255,255,.2);border-radius:10px;padding:16px 18px;margin-bottom:14px;box-shadow:4px 4px rgba(0,0,0,.2);color:#fff;text-align:left}
  .bb-tracker-card h3{font-family:'Titan One',sans-serif;font-weight:normal;font-size:20px;margin:0 0 8px}
  .bb-chart-wrap{margin-top:12px;background:rgba(0,0,0,.2);border-radius:12px;padding:14px 12px 10px}
  .bb-chart-bars{display:flex;align-items:flex-end;gap:10px;height:140px;padding:0 4px;flex-wrap:wrap}
  .bb-chart-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:44px}
  .bb-chart-bar{width:100%;max-width:48px;border-radius:8px 8px 4px 4px;min-height:4px;transition:height .35s ease;box-shadow:0 2px 0 rgba(0,0,0,.2)}
  .bb-chart-val{font-size:11px;font-weight:900;margin-bottom:4px;opacity:.95}
  .bb-chart-label{font-size:10px;font-weight:800;margin-top:6px;text-align:center;text-transform:uppercase;opacity:.9;word-break:break-word;line-height:1.2}
  `;

  let pathHandled = false;
  let sidebarInjected = false;

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
          <p style="font-weight:700;opacity:.95;margin:0 0 10px;">Click a Blook — same popup as Packs.</p>
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
      <h1 class="header-title">Tracker</h1>
      <div class="leaks-wrap">
        <div class="bb-tracker-card">
          <h3>Official Blooket changelog</h3>
          <p class="bb-tracker-time" style="margin:0 0 8px;">Seasons, packs, modes, and UI — dated from public records. No leak posts here.</p>
          <div id="bb-last-check">Loading check status…</div>
        </div>
        <div class="bb-tracker-card">
          <h3>Updates by type</h3>
          <div class="bb-chart-wrap" id="bb-chart"></div>
        </div>
        <div class="bb-tracker-card">
          <h3>Full timeline</h3>
          <p class="bb-tracker-time" style="margin:0 0 12px;">Newest first · local time + UTC</p>
          <div id="bb-updates-feed">Loading…</div>
        </div>
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

  const CHART_COLORS = {
    season: '#a78bfa',
    gamemode: '#38bdf8',
    ui: '#34d399',
    event: '#fbbf24',
    blook: '#f472b6',
    pack: '#fb923c',
    update: '#94a3b8'
  };

  const PATH_ALIAS = {
    packs: 'market',
    pack: 'market',
    calculator: 'packsim',
    calc: 'packsim'
  };
  const PATH_PRETTY = {
    market: 'packs',
    packsim: 'calculator'
  };

  function rarityTag(rarity) {
    if (typeof window.rarityTagHtml === 'function') {
      try {
        return window.rarityTagHtml(rarity);
      } catch (e) {}
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
          .map((b) =>
            cell({
              ...b,
              pack: 'Color Pack',
              notes: 'Secret pack — only when all normal Commons are taken'
            })
          )
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

  function formatWhen(iso) {
    if (!iso) return 'Unknown time';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return String(iso);
    }
  }

  function renderChart(entries) {
    const el = document.getElementById('bb-chart');
    if (!el) return;
    const counts = {};
    (entries || []).forEach((e) => {
      const t = (e.type || 'update').toLowerCase();
      counts[t] = (counts[t] || 0) + 1;
    });
    const keys = Object.keys(counts);
    if (!keys.length) {
      el.innerHTML = '<p class="bb-tracker-time">No data yet</p>';
      return;
    }
    const max = Math.max(...keys.map((k) => counts[k]), 1);
    el.innerHTML =
      '<div class="bb-chart-bars">' +
      keys
        .map((k) => {
          const h = Math.max(8, Math.round((counts[k] / max) * 120));
          const color = CHART_COLORS[k] || '#c4b5fd';
          return `<div class="bb-chart-col">
            <div class="bb-chart-val">${counts[k]}</div>
            <div class="bb-chart-bar" style="height:${h}px;background:${color};"></div>
            <div class="bb-chart-label">${k}</div>
          </div>`;
        })
        .join('') +
      '</div>';
  }

  window.renderTrackerPage = async function () {
    const checkEl = document.getElementById('bb-last-check');
    const feedEl = document.getElementById('bb-updates-feed');
    try {
      const check = await fetch('/data/last-check.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (checkEl) {
        if (check) {
          checkEl.innerHTML =
            `<span class="tag released">CDN probe ${check.status || 'ok'}</span>` +
            `<div class="bb-tracker-time" style="margin-top:8px;">Last automated check: <b>${formatWhen(check.checkedAt)}</b></div>` +
            `<div class="bb-tracker-time">UTC: ${check.checkedAt || '?'}</div>`;
        } else {
          checkEl.innerHTML =
            '<span class="tag">info</span> <div class="bb-tracker-time" style="margin-top:8px;">Changelog below is manual history.</div>';
        }
      }
    } catch (e) {
      if (checkEl) checkEl.textContent = '';
    }
    try {
      const data = await fetch('/data/updates.json').then((r) => r.json());
      const entries = data.entries || [];
      renderChart(entries);
      if (feedEl) {
        feedEl.innerHTML =
          entries
            .map((e) => {
              const when = formatWhen(e.date);
              const links = (e.links || [])
                .map(
                  (u) =>
                    `<p style="margin:8px 0 0;"><a href="${u}" target="_blank" rel="noopener" style="color:#fff3b0;font-weight:800;">${u}</a></p>`
                )
                .join('');
              return `<div style="border-top:1px solid rgba(255,255,255,.2);padding:12px 0;">
                <div style="font-size:12px;font-weight:900;opacity:.9;margin-bottom:4px;"><span class="tag">${e.type || 'update'}</span> ${when}</div>
                <div class="bb-tracker-time" style="margin:0 0 6px;opacity:.75;">UTC ${e.date}</div>
                <div style="font-family:'Titan One',sans-serif;font-size:18px;margin-bottom:6px;">${e.title}</div>
                <div style="font-weight:700;line-height:1.45;">${e.body || ''}</div>
                ${links}
              </div>`;
            })
            .join('') || '<div>No updates yet.</div>';
      }
    } catch (e) {
      if (feedEl) feedEl.innerHTML = 'Could not load data/updates.json';
    }
  };

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
      <span class="sidebar-listIcon"><i class="fas fa-satellite-dish"></i></span>
      <span class="sidebar-text">Tracker</span>
    </button>`;
    leaksLi.querySelector('button').onclick = function (e) {
      e.preventDefault();
      window.switchView('leaks');
    };
    trackerLi.querySelector('button').onclick = function (e) {
      e.preventDefault();
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

  function injectViews() {
    if (document.getElementById('view-leaks')) return;
    const anchor =
      document.getElementById('view-videos') ||
      document.getElementById('view-whatsnew') ||
      document.querySelector('.main-content');
    if (anchor) anchor.insertAdjacentHTML('beforebegin', LEAKS_HTML + TRACKER_HTML);
  }

  function hideAllMainViews() {
    document.querySelectorAll('.main-content').forEach((el) => {
      el.style.display = 'none';
    });
    const v404 = document.getElementById('view-404');
    if (v404) v404.style.display = 'none';
  }

  function showCustom(view) {
    hideAllMainViews();
    const el = document.getElementById(view === 'leaks' ? 'view-leaks' : 'view-tracker');
    if (el) {
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
    }
    document.title = 'Blookbase | ' + (view === 'leaks' ? 'Leaks' : 'Tracker');
    document.querySelectorAll('.sidebar-link').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });
    try {
      if (location.protocol !== 'file:') {
        const want = '/' + view;
        if (location.pathname.replace(/\/+$/, '') !== want) {
          history.pushState({ view }, '', want);
        }
      }
    } catch (e) {}
    if (view === 'leaks') window.renderLeaksPage();
    if (view === 'tracker') window.renderTrackerPage();
    // Do NOT force-close sidebar here — let user / original switchView handle it
  }

  function prettyPath(view) {
    return PATH_PRETTY[view] || view;
  }

  function patchSwitchView() {
    if (typeof window.switchView !== 'function') return false;
    if (window.switchView.__bbPatched) return true;
    const orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      if (view === 'packs' || view === 'pack') view = 'market';
      if (view === 'calculator' || view === 'calc') view = 'packsim';

      if (view === 'leaks' || view === 'tracker') {
        injectViews();
        showCustom(view);
        try {
          if (typeof closeSidebar === 'function') closeSidebar();
        } catch (e) {}
        return;
      }

      const vLeaks = document.getElementById('view-leaks');
      const vTracker = document.getElementById('view-tracker');
      if (vLeaks) vLeaks.style.display = 'none';
      if (vTracker) vTracker.style.display = 'none';

      const result = orig.call(this, view, true);
      try {
        if (!skipUrl && location.protocol !== 'file:') {
          const path = view === 'home' ? '/' : '/' + prettyPath(view);
          if (location.pathname.replace(/\/+$/, '') !== path.replace(/\/+$/, '')) {
            history.pushState({ view }, '', path);
          }
        }
      } catch (e) {}
      return result;
    };
    window.switchView.__bbPatched = true;
    return true;
  }

  function handlePathOnce() {
    if (pathHandled) return true;
    let seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0] || '';

    if (PATH_ALIAS[seg]) {
      if (!patchSwitchView()) return false;
      const internal = PATH_ALIAS[seg];
      window.switchView(internal, true);
      try {
        history.replaceState({ view: internal }, '', '/' + seg);
      } catch (e) {}
      pathHandled = true;
      return true;
    }

    if (seg === 'leaks' || seg === 'tracker') {
      if (!patchSwitchView()) return false;
      injectViews();
      showCustom(seg);
      pathHandled = true;
      return true;
    }

    pathHandled = true;
    return true;
  }

  function boot() {
    injectStyle();
    injectViews();
    injectSidebar();
    patchSwitchView();
    handlePathOnce();

    window.addEventListener('popstate', () => {
      pathHandled = false;
      handlePathOnce();
    });

    // Only retry until switchView exists + sidebar injected — then stop
    let tries = 0;
    const iv = setInterval(() => {
      injectSidebar();
      injectViews();
      const ok = patchSwitchView();
      if (ok && !pathHandled) handlePathOnce();
      if ((ok && sidebarInjected && pathHandled) || ++tries > 40) {
        clearInterval(iv);
      }
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
