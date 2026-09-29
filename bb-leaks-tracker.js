/* Blookbase Leaks + Tracker — full fix */
(function () {
  'use strict';

  const STYLE = `
  #bb-blook-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
  #bb-blook-modal.open{display:flex}
  .bb-modal-box{background:#9a49aa;color:#fff;border:6px solid rgba(255,255,255,.25);border-radius:14px;max-width:360px;width:90vw;padding:22px;text-align:center;box-shadow:6px 6px rgba(0,0,0,.3)}
  .bb-modal-box img{width:120px;height:120px;object-fit:contain;margin:0 auto 12px;display:block}
  .bb-modal-box h2{font-family:'Titan One',sans-serif;font-weight:normal;font-size:26px;margin:0 0 8px}
  .bb-modal-meta{font-weight:800;font-size:14px;opacity:.95;margin:6px 0}
  .bb-modal-url{font-size:11px;word-break:break-all;opacity:.8;margin-top:10px;background:rgba(0,0,0,.2);padding:8px;border-radius:8px;text-align:left}
  .bb-modal-close{margin-top:14px;font-family:'Nunito',sans-serif;font-weight:900;border:none;border-radius:10px;padding:10px 18px;background:#fff;color:#9a49aa;cursor:pointer}
  .pack-blook.bb-click{cursor:pointer;transition:transform .12s}
  .pack-blook.bb-click:hover{transform:translateY(-3px);filter:brightness(1.08)}
  .bb-tracker-time{font-size:13px;font-weight:800;opacity:.9}
  .bb-tracker-card{background:#9a49aa;border:6px solid rgba(255,255,255,.2);border-radius:10px;padding:16px 18px;margin-bottom:14px;box-shadow:4px 4px rgba(0,0,0,.2);color:#fff;text-align:left}
  .bb-tracker-card h3{font-family:'Titan One',sans-serif;font-weight:normal;font-size:20px;margin:0 0 8px}
  `;

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
          <p style="font-weight:700;opacity:.95;margin:0 0 10px;">Click a Blook for details. CDN assets not in normal market drops.</p>
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
          <p style="font-weight:700;opacity:.95;margin:0 0 10px;">Only when all Commons are taken in a live game. Not in Market.</p>
          <div class="pack-blooks-grid" id="bb-color-grid"></div>
        </div>
        <div class="leaks-section">
          <h3>Gamemode leaks</h3>
          <ul id="bb-gm-list"></ul>
        </div>
        <div class="leaks-section">
          <h3>Notes</h3>
          <ul>
            <li><span class="tag">info</span> Fan archive only — not affiliated with Blooket.</li>
            <li><span class="tag">info</span> Asset on CDN does not mean obtainable in-game.</li>
          </ul>
        </div>
      </div>
    </div>`;

  const TRACKER_HTML = `
    <div class="main-content" id="view-tracker" style="display:none;flex-direction:column;align-items:center;">
      <h1 class="header-title">Tracker</h1>
      <div class="leaks-wrap">
        <div class="bb-tracker-card">
          <h3>Live CDN check</h3>
          <p class="bb-tracker-time" style="margin:0 0 8px;">GitHub Action runs about every 5 minutes.</p>
          <div id="bb-last-check">Loading…</div>
        </div>
        <div class="bb-tracker-card">
          <h3>Update feed</h3>
          <p class="bb-tracker-time" style="margin:0 0 12px;">Newest first — dates, types, and links.</p>
          <div id="bb-updates-feed">Loading updates…</div>
        </div>
      </div>
    </div>`;

  const MODAL_HTML = `
    <div id="bb-blook-modal" role="dialog" aria-modal="true">
      <div class="bb-modal-box">
        <img id="bb-modal-img" alt="" />
        <h2 id="bb-modal-name"></h2>
        <div class="bb-modal-meta" id="bb-modal-rarity"></div>
        <div class="bb-modal-meta" id="bb-modal-pack"></div>
        <div class="bb-modal-meta" id="bb-modal-notes"></div>
        <div class="bb-modal-url" id="bb-modal-url"></div>
        <button type="button" class="bb-modal-close" id="bb-modal-close">Close</button>
      </div>
    </div>`;

  function ensureModal() {
    if (document.getElementById('bb-blook-modal')) return;
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
    const modal = document.getElementById('bb-blook-modal');
    document.getElementById('bb-modal-close').onclick = () => modal.classList.remove('open');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  function openBlookModal(b) {
    ensureModal();
    document.getElementById('bb-modal-img').src = b.url || '';
    document.getElementById('bb-modal-name').textContent = b.name || 'Unknown';
    document.getElementById('bb-modal-rarity').textContent = b.rarity ? 'Rarity: ' + b.rarity : '';
    document.getElementById('bb-modal-pack').textContent = b.pack ? 'Pack: ' + b.pack : b.pack === null ? 'Pack: none (secret/unique)' : '';
    document.getElementById('bb-modal-notes').textContent = b.notes || b.chance != null ? (b.notes || ('Drop: ' + b.chance + '%')) : '';
    document.getElementById('bb-modal-url').textContent = b.url || '';
    document.getElementById('bb-blook-modal').classList.add('open');
  }

  function cell(b) {
    const src = b.url || '';
    const img = src ? `<img src="${src}" alt="" loading="lazy" onerror="this.style.opacity=.3">` : '';
    const payload = encodeURIComponent(JSON.stringify(b));
    return `<div class="pack-blook bb-click" data-bb='${payload}'>${img}<div class="bn">${b.name || ''}</div><div class="br">${b.rarity || ''}${b.pack ? ' · ' + b.pack : ''}</div></div>`;
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
    ensureModal();
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
        uq.innerHTML = (special.uniques || []).map((u) =>
          cell({ name: u.name, url: u.url, rarity: 'Unique', notes: u.notes || '', pack: null })
        ).join('');
        bindClicks(uq);
      }
      if (ml) {
        ml.innerHTML = (special.mysticals || [])
          .map((m) => `<li><span class="tag">mystical</span> <strong>${m.name}</strong> — ${m.event} (${m.copies} copies)</li>`)
          .join('');
      }
    } catch (e) {
      console.warn('leaks special', e);
    }
    try {
      const packs = await fetch('/data/packs.json').then((r) => r.json());
      const color = (packs.packs || []).find((p) => p.id === 'color');
      const cg = document.getElementById('bb-color-grid');
      if (cg && color) {
        cg.innerHTML = (color.blooks || []).map((b) =>
          cell({ ...b, pack: 'Color Pack', notes: 'Secret pack — Commons only when all normal Commons are taken' })
        ).join('');
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
            return `<li><span class="tag ${tag}">${g.status}</span> <strong>${g.name}</strong> — ${g.notes || ''} ${g.type ? '(' + g.type + ')' : ''}</li>`;
          })
          .join('');
      }
    } catch (e) {}
  };

  function formatWhen(iso) {
    if (!iso) return 'Unknown time';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
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
      return iso;
    }
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
            `<span class="tag released">${check.status || 'ok'}</span>` +
            `<div class="bb-tracker-time" style="margin-top:8px;">Last check: <b>${formatWhen(check.checkedAt)}</b></div>` +
            `<div class="bb-tracker-time">Raw UTC: ${check.checkedAt || '?'}</div>` +
            (check.interval ? `<div class="bb-tracker-time">Interval: ${check.interval}</div>` : '');
        } else {
          checkEl.innerHTML =
            '<span class="tag">waiting</span> <div class="bb-tracker-time" style="margin-top:8px;">No last-check.json yet. Enable GitHub Actions → run <b>Blooket Tracker</b> once.</div>';
        }
      }
    } catch (e) {
      if (checkEl) checkEl.textContent = 'Could not load last-check.json';
    }
    try {
      const data = await fetch('/data/updates.json').then((r) => r.json());
      if (feedEl) {
        const entries = data.entries || [];
        feedEl.innerHTML =
          entries
            .map((e) => {
              const when = formatWhen(e.date) !== e.date ? formatWhen(e.date) : e.date;
              const links = (e.links || [])
                .map((u) => `<p style="margin:8px 0 0;"><a href="${u}" target="_blank" rel="noopener" style="color:#fff3b0;font-weight:800;">${u}</a></p>`)
                .join('');
              return `<div style="border-top:1px solid rgba(255,255,255,.2);padding:12px 0;">
                <div style="font-size:12px;font-weight:900;opacity:.9;margin-bottom:4px;"><span class="tag">${e.type || 'update'}</span> ${when}</div>
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
    const list = document.querySelector('.sidebar-list');
    if (!list || document.querySelector('[data-view="leaks"]')) return;
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
    leaksLi.querySelector('button').onclick = () => window.switchView('leaks');
    trackerLi.querySelector('button').onclick = () => window.switchView('tracker');
    liParent.after(trackerLi);
    liParent.after(leaksLi);
  }

  function injectViews() {
    if (!document.getElementById('view-leaks')) {
      const anchor =
        document.getElementById('view-videos') ||
        document.getElementById('view-whatsnew') ||
        document.querySelector('.main-content');
      if (anchor) anchor.insertAdjacentHTML('beforebegin', LEAKS_HTML + TRACKER_HTML);
    }
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
      if (location.protocol !== 'file:' && !location.pathname.endsWith('/' + view)) {
        history.pushState({ view }, '', '/' + view);
      }
    } catch (e) {}
    if (view === 'leaks') window.renderLeaksPage();
    if (view === 'tracker') window.renderTrackerPage();
    try {
      if (typeof closeSidebar === 'function') closeSidebar();
    } catch (e) {}
  }

  function patchSwitchView() {
    if (typeof window.switchView !== 'function') return false;
    if (window.switchView.__bbPatched) return true;
    const orig = window.switchView;
    window.switchView = function (view, skipUrl) {
      if (view === 'leaks' || view === 'tracker') {
        injectViews();
        showCustom(view);
        return;
      }
      // Leaving custom views: hide them, then run original
      const vLeaks = document.getElementById('view-leaks');
      const vTracker = document.getElementById('view-tracker');
      if (vLeaks) vLeaks.style.display = 'none';
      if (vTracker) vTracker.style.display = 'none';
      return orig.apply(this, arguments);
    };
    window.switchView.__bbPatched = true;
    return true;
  }

  function handlePath() {
    const seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0] || '';
    if (seg === 'leaks' || seg === 'tracker') {
      if (patchSwitchView()) {
        injectViews();
        showCustom(seg);
        return true;
      }
      return false;
    }
    return true;
  }

  function boot() {
    injectStyle();
    injectViews();
    injectSidebar();
    ensureModal();
    patchSwitchView();
    handlePath();

    window.addEventListener('popstate', () => {
      const seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0] || 'home';
      if (seg === 'leaks' || seg === 'tracker') showCustom(seg);
    });

    let tries = 0;
    const iv = setInterval(() => {
      injectSidebar();
      injectViews();
      patchSwitchView();
      const seg = (location.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean)[0];
      if (seg === 'leaks' || seg === 'tracker') handlePath();
      if (++tries > 60) clearInterval(iv);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
