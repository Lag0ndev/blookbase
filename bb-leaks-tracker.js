/* Blookbase Leaks + Tracker injector */
(function () {
  const LEAKS_HTML = `
    <div class="main-content" id="view-leaks" style="display: none;">
      <h1 class="header-title">Leaks</h1>
      <div class="leaks-wrap">
        <div class="leaks-section">
          <h3>Unreleased / Secret Blooks</h3>
          <p style="font-weight:700;opacity:0.95;margin:0 0 10px;">CDN assets that exist but are not normal market drops.</p>
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
          <h3>Secret Pack \u2014 Color Pack</h3>
          <p style="font-weight:700;opacity:0.95;margin:0 0 10px;">Only when all Commons are taken in a live game. Not in Market.</p>
          <div class="pack-blooks-grid" id="bb-color-grid"></div>
        </div>
        <div class="leaks-section">
          <h3>Gamemode leaks</h3>
          <ul id="bb-gm-list"></ul>
        </div>
        <div class="leaks-section">
          <h3>Notes</h3>
          <ul>
            <li><span class="tag">info</span> Fan archive only \u2014 not affiliated with Blooket.</li>
            <li><span class="tag">info</span> Asset on CDN \u2260 obtainable in-game.</li>
            <li><span class="tag upcoming">tracker</span> Live checks: open <b>Tracker</b> in the sidebar.</li>
          </ul>
        </div>
      </div>
    </div>`;

  const TRACKER_HTML = `
    <div class="main-content" id="view-tracker" style="display: none;">
      <h1 class="header-title">Tracker</h1>
      <div class="leaks-wrap">
        <div class="leaks-section">
          <h3>Live asset check</h3>
          <p style="font-weight:700;opacity:0.95;margin:0 0 8px;">GitHub Action probes Blooket CDN about every 5 minutes.</p>
          <div id="bb-last-check">Loading data/last-check.json\u2026</div>
        </div>
        <div id="bb-updates-feed"><p style="font-weight:700;">Loading updates\u2026</p></div>
      </div>
    </div>`;

  function cell(b) {
    const src = b.url || '';
    const img = src ? `<img src="${src}" alt="" loading="lazy" onerror="this.style.opacity=0.3">` : '';
    return `<div class="pack-blook">${img}<div class="bn">${b.name || ''}</div><div class="br">${b.rarity || ''}${b.pack ? ' \u00b7 ' + b.pack : ''}</div></div>`;
  }

  window.renderLeaksPage = async function () {
    try {
      const special = await fetch('data/special-blooks.json').then((r) => r.json());
      const ug = document.getElementById('bb-unreleased-grid');
      const uq = document.getElementById('bb-uniques-grid');
      const ml = document.getElementById('bb-mysticals-list');
      if (ug) ug.innerHTML = (special.unreleased || []).map(cell).join('');
      if (uq) uq.innerHTML = (special.uniques || []).map(cell).join('');
      if (ml)
        ml.innerHTML = (special.mysticals || [])
          .map((m) => `<li><span class="tag">mystical</span> <strong>${m.name}</strong> \u2014 ${m.event} (${m.copies})</li>`)
          .join('');
    } catch (e) {}
    try {
      const packs = await fetch('data/packs.json').then((r) => r.json());
      const color = (packs.packs || []).find((p) => p.id === 'color');
      const cg = document.getElementById('bb-color-grid');
      if (cg) cg.innerHTML = color ? (color.blooks || []).map(cell).join('') : '';
    } catch (e) {}
    try {
      const gm = await fetch('data/gamemodes.json').then((r) => r.json());
      const gl = document.getElementById('bb-gm-list');
      if (gl)
        gl.innerHTML = (gm.gamemodes || [])
          .map((g) => {
            const tag = g.status === 'Released' ? 'released' : 'upcoming';
            return `<li><span class="tag ${tag}">${g.status}</span> <strong>${g.name}</strong> \u2014 ${g.notes || ''}</li>`;
          })
          .join('');
    } catch (e) {}
  };

  window.renderTrackerPage = async function () {
    const checkEl = document.getElementById('bb-last-check');
    const feedEl = document.getElementById('bb-updates-feed');
    try {
      const check = await fetch('data/last-check.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (checkEl) {
        if (check) {
          checkEl.innerHTML = `<span class="tag released">${check.status || 'ok'}</span> <span style="font-weight:800;">Last check: ${check.checkedAt || '?'}</span>`;
        } else {
          checkEl.innerHTML =
            '<span class="tag">waiting</span> No last-check.json yet \u2014 run the GitHub Action once.';
        }
      }
    } catch (e) {
      if (checkEl) checkEl.textContent = 'Could not load last-check.json';
    }
    try {
      const data = await fetch('data/updates.json').then((r) => r.json());
      if (feedEl) {
        feedEl.innerHTML =
          (data.entries || [])
            .map(
              (e) => `
          <div class="leaks-section">
            <h3>${e.title}</h3>
            <p style="font-size:12px;font-weight:800;opacity:0.85;margin:0 0 8px;"><span class="tag">${e.type}</span> ${e.date}</p>
            <p style="font-weight:700;margin:0;line-height:1.5;">${e.body}</p>
            ${(e.links || [])
              .map(
                (u) =>
                  `<p style="margin:8px 0 0;"><a href="${u}" target="_blank" rel="noopener" style="color:#fff3b0;font-weight:800;">Open link</a></p>`
              )
              .join('')}
          </div>`
            )
            .join('') || '<div class="leaks-section">No updates yet.</div>';
      }
    } catch (e) {
      if (feedEl) feedEl.innerHTML = '<div class="leaks-section">Could not load data/updates.json</div>';
    }
  };

  function injectSidebar() {
    const list = document.querySelector('.sidebar-list');
    if (!list || document.querySelector('[data-view="leaks"]')) return;
    const whats = list.querySelector('[data-view="whatsnew"]');
    const liParent = whats && whats.closest('li');
    if (!liParent) return;
    const leaksLi = document.createElement('li');
    leaksLi.innerHTML = `<button class="sidebar-link" data-view="leaks" onclick="switchView('leaks')">
      <span class="sidebar-listIcon"><i class="fas fa-user-secret"></i></span>
      <span class="sidebar-text">Leaks</span>
    </button>`;
    const trackerLi = document.createElement('li');
    trackerLi.innerHTML = `<button class="sidebar-link" data-view="tracker" onclick="switchView('tracker')">
      <span class="sidebar-listIcon"><i class="fas fa-satellite-dish"></i></span>
      <span class="sidebar-text">Tracker</span>
    </button>`;
    liParent.after(trackerLi);
    liParent.after(leaksLi);
  }

  function injectViews() {
    if (!document.getElementById('view-leaks')) {
      const videos = document.getElementById('view-videos');
      if (videos) {
        videos.insertAdjacentHTML('beforebegin', LEAKS_HTML + TRACKER_HTML);
      }
    }
  }

  function patchSwitchView() {
    if (typeof window.switchView !== 'function') return false;
    if (window.switchView.__bbPatched) return true;
    const orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      if (view === 'leaks' || view === 'tracker') {
        // ensure allowed by calling orig with a known view first pattern: monkeypatch display
      }
      const result = orig.apply(this, arguments);
      const vLeaks = document.getElementById('view-leaks');
      const vTracker = document.getElementById('view-tracker');
      if (vLeaks) vLeaks.style.display = view === 'leaks' ? 'flex' : 'none';
      if (vTracker) vTracker.style.display = view === 'tracker' ? 'flex' : 'none';
      if (view === 'leaks') window.renderLeaksPage();
      if (view === 'tracker') window.renderTrackerPage();
      if (view === 'leaks' || view === 'tracker') {
        document.title = 'Blookbase | ' + (view === 'leaks' ? 'Leaks' : 'Tracker');
        try {
          document.querySelectorAll('.sidebar-link').forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
          });
        } catch (e) {}
      }
      return result;
    };
    window.switchView.__bbPatched = true;
    return true;
  }

  function patchInitPath() {
    // Support direct /leaks and /tracker URLs
    const seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0];
    if (seg === 'leaks' || seg === 'tracker') {
      const trySwitch = () => {
        if (typeof window.switchView === 'function') {
          patchSwitchView();
          window.switchView(seg, true);
          return true;
        }
        return false;
      };
      if (!trySwitch()) {
        let n = 0;
        const t = setInterval(() => {
          if (trySwitch() || ++n > 40) clearInterval(t);
        }, 100);
      }
    }
  }

  function boot() {
    injectViews();
    injectSidebar();
    patchSwitchView();
    patchInitPath();
    // Retry patch — switchView may be defined later
    let tries = 0;
    const iv = setInterval(() => {
      injectSidebar();
      injectViews();
      if (patchSwitchView() || ++tries > 50) clearInterval(iv);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
