/**
 * Blookbase fixes: online presence + pack calculator results UI
 * Loaded after main page scripts; overrides broken/messy bits.
 */
(function () {
  'use strict';

  /* ========== 1) ONLINE COUNTER FIX ==========
   * Public MQTT brokers drop connections and leave stale retained msgs.
   * Rebuild presence with proper failover, short TTL, and clean prune.
   */
  function fixOnlineCounter() {
    var TOPIC_PREFIX = 'blookbase/v2/online/';
    var BROKERS = [
      'wss://broker.emqx.io:8084/mqtt',
      'wss://test.mosquitto.org:8081/mqtt',
      'wss://broker.hivemq.com:8884/mqtt'
    ];
    var STALE_MS = 45000;
    var HEARTBEAT_MS = 15000;

    var sessionId;
    try {
      sessionId = sessionStorage.getItem('blookbase_sid');
      if (!sessionId) {
        sessionId = 's' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('blookbase_sid', sessionId);
      }
    } catch (e) {
      sessionId = 's' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    var onlineMap = new Map();
    var countEl = document.getElementById('online-count');
    var client = null;
    var brokerIndex = 0;
    var heartbeatTimer = null;
    var pruneTimer = null;
    var connecting = false;

    function myName() {
      try {
        if (typeof getDisplayName === 'function') {
          var n = getDisplayName();
          return n == null ? '' : String(n).slice(0, 24);
        }
      } catch (e) {}
      return '';
    }

    function renderCount() {
      var now = Date.now();
      onlineMap.forEach(function (info, id) {
        var t = info && typeof info === 'object' ? info.t : Number(info);
        if (!t || now - t > STALE_MS) onlineMap.delete(id);
      });
      onlineMap.set(sessionId, { t: now, name: myName() });
      var n = onlineMap.size;
      if (countEl) countEl.textContent = String(n);
      if (typeof renderAdminVisitors === 'function') {
        try { renderAdminVisitors(onlineMap); } catch (e) {}
      }
    }

    function onPresenceMessage(topic, payload) {
      if (!topic || topic.indexOf(TOPIC_PREFIX) !== 0) return;
      var id = topic.slice(TOPIC_PREFIX.length);
      if (!id || id === sessionId) return;
      var text = payload ? payload.toString() : '';
      if (!text) {
        onlineMap.delete(id);
      } else {
        var t = Date.now();
        var name = '';
        var parts = text.split('|');
        if (parts.length >= 2) {
          t = Number(parts[0]) || Date.now();
          name = parts.slice(1).join('|').slice(0, 24);
        } else {
          t = Number(text) || Date.now();
        }
        // Ignore ancient retained messages
        if (Date.now() - t > STALE_MS) {
          onlineMap.delete(id);
        } else {
          onlineMap.set(id, { t: t, name: name });
        }
      }
      renderCount();
    }

    function myTopic() {
      return TOPIC_PREFIX + sessionId;
    }

    function publishHere() {
      if (!client || !client.connected) return;
      var name = myName();
      var payload = String(Date.now()) + '|' + name;
      try {
        client.publish(myTopic(), payload, { qos: 0, retain: true });
      } catch (e) {}
      onlineMap.set(sessionId, { t: Date.now(), name: name });
      renderCount();
    }
    window.__bbPublishPresence = publishHere;

    function tryNextBroker(reason) {
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
      if (client) {
        try { client.removeAllListeners(); client.end(true); } catch (e) {}
        client = null;
      }
      brokerIndex += 1;
      if (brokerIndex < BROKERS.length) {
        setTimeout(connectBroker, 600);
      } else {
        // All brokers failed — still show local self as 1
        renderCount();
      }
    }

    function connectBroker() {
      if (typeof mqtt === 'undefined') {
        renderCount();
        return;
      }
      if (brokerIndex >= BROKERS.length) {
        renderCount();
        return;
      }
      if (connecting) return;
      connecting = true;
      var url = BROKERS[brokerIndex];
      try {
        client = mqtt.connect(url, {
          clientId: 'bb_' + sessionId.slice(0, 16) + '_' + Math.random().toString(36).slice(2, 6),
          clean: true,
          reconnectPeriod: 0, // we handle failover ourselves
          connectTimeout: 10000,
          will: {
            topic: myTopic(),
            payload: '',
            retain: true,
            qos: 0
          }
        });
        client.on('connect', function () {
          connecting = false;
          try {
            client.subscribe(TOPIC_PREFIX + '#', { qos: 0 });
          } catch (e) {}
          publishHere();
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(publishHere, HEARTBEAT_MS);
          if (pruneTimer) clearInterval(pruneTimer);
          pruneTimer = setInterval(renderCount, 10000);
        });
        client.on('message', function (topic, payload) {
          onPresenceMessage(topic, payload);
        });
        client.on('error', function () {
          connecting = false;
          tryNextBroker('error');
        });
        client.on('close', function () {
          // only failover if we expected to stay connected
          if (heartbeatTimer) {
            connecting = false;
            tryNextBroker('close');
          }
        });
        client.on('offline', function () {});
      } catch (e) {
        connecting = false;
        tryNextBroker('exception');
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) publishHere();
    });
    window.addEventListener('beforeunload', function () {
      try {
        if (client && client.connected) {
          client.publish(myTopic(), '', { qos: 0, retain: true });
        }
      } catch (e) {}
    });

    renderCount();
    // Delay slightly so mqtt script is definitely ready
    setTimeout(connectBroker, 400);
  }

  /* ========== 2) CALCULATOR RESULTS UI ==========
   * Clearer expected averages + cleaner cards/table.
   */
  function fmtExp(n) {
    if (n >= 100) return n.toFixed(0);
    if (n >= 10) return n.toFixed(1);
    if (n >= 1) return n.toFixed(2);
    if (n >= 0.01) return n.toFixed(3);
    return n.toFixed(4);
  }

  function injectCalcStyles() {
    if (document.getElementById('bb-calc-fix-css')) return;
    var style = document.createElement('style');
    style.id = 'bb-calc-fix-css';
    style.textContent = [
      '#view-packsim .calc-results { margin-top: 8px; }',
      '#view-packsim .calc-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 18px; }',
      '#view-packsim .calc-stat { background: rgba(0,0,0,0.28); border-radius: 14px; padding: 16px 12px; text-align: center; border: 3px solid rgba(255,255,255,0.18); box-shadow: 3px 3px rgba(0,0,0,0.15); }',
      '#view-packsim .calc-stat b { display: block; font-family: "Titan One", cursive; font-size: 28px; font-weight: normal; line-height: 1.1; margin-bottom: 4px; }',
      '#view-packsim .calc-stat span { font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; opacity: 0.9; }',
      '#view-packsim .calc-avg-title { font-family: "Titan One", cursive; font-size: 20px; font-weight: normal; margin: 0 0 10px; text-align: center; }',
      '#view-packsim .calc-avg-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 16px; border-radius: 14px; border: 3px solid rgba(255,255,255,0.16); background: rgba(0,0,0,0.22); }',
      '#view-packsim .calc-avg-table { width: 100%; border-collapse: collapse; min-width: 320px; }',
      '#view-packsim .calc-avg-table th, #view-packsim .calc-avg-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 13px; font-weight: 700; color: #fff; }',
      '#view-packsim .calc-avg-table th { background: rgba(0,0,0,0.25); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.95; }',
      '#view-packsim .calc-avg-table tr:last-child td { border-bottom: none; }',
      '#view-packsim .calc-avg-table .num { text-align: right; font-variant-numeric: tabular-nums; font-family: "Nunito", sans-serif; font-weight: 900; }',
      '#view-packsim .calc-avg-table .blook-cell { display: flex; align-items: center; gap: 8px; }',
      '#view-packsim .calc-avg-table .blook-cell img { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }',
      '#view-packsim .calc-avg-table .delta-pos { color: #7dffa0; }',
      '#view-packsim .calc-avg-table .delta-neg { color: #ffb4b4; }',
      '#view-packsim .calc-got-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }',
      '#view-packsim .calc-got-card { background: rgba(0,0,0,0.28); border-radius: 14px; padding: 14px 8px 12px; text-align: center; border: 3px solid rgba(255,255,255,0.16); box-shadow: 2px 2px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 140px; }',
      '#view-packsim .calc-got-card img { width: 56px; height: 56px; object-fit: contain; margin-bottom: 4px; }',
      '#view-packsim .calc-got-name { font-weight: 800; font-size: 12px; line-height: 1.2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '#view-packsim .calc-got-pct { font-size: 11px; opacity: 0.75; font-weight: 700; }',
      '#view-packsim .calc-got-exp { font-size: 12px; font-weight: 800; opacity: 0.95; margin-top: 4px; color: #ffe08a; }',
      '#view-packsim .calc-got-qty { font-family: "Titan One", cursive; font-size: 22px; font-weight: normal; margin-top: 2px; line-height: 1; }',
      '#view-packsim .calc-note { margin-top: 14px; font-size: 12px; font-weight: 700; opacity: 0.85; text-align: center; line-height: 1.4; padding: 10px 12px; background: rgba(0,0,0,0.18); border-radius: 10px; }',
      '#view-packsim .calc-section-label { font-family: "Titan One", cursive; font-size: 18px; margin: 18px 0 10px; text-align: center; font-weight: normal; }',
      '@media (max-width: 520px) {',
      '  #view-packsim .calc-got-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }',
      '  #view-packsim .calc-got-card { min-height: 128px; padding: 10px 4px; }',
      '  #view-packsim .calc-got-qty { font-size: 18px; }',
      '  #view-packsim .calc-stat b { font-size: 22px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Override runPackCalculator with cleaner output
  window.runPackCalculator = function runPackCalculatorFixed() {
    injectCalcStyles();
    var name = (typeof calcSelectedPack !== 'undefined' && calcSelectedPack) ||
      ((document.getElementById('calc-pack') || {}).value) || '';
    var tokensIn = Math.max(0, Math.floor(Number((document.getElementById('calc-tokens') || {}).value) || 0));
    var resell = !!(document.getElementById('calc-resell') || {}).checked;
    var out = document.getElementById('calc-results');
    if (!out) return;

    var pack = (marketPacks || []).find(function (p) { return p && p.name === name; });
    if (!pack) {
      out.innerHTML = '<p class="calc-empty">Pick a pack first.</p>';
      return;
    }
    var price = Number(pack.price);
    var pool = (pack.blooks || []).filter(function (b) {
      return b && b.chance != null && Number(b.chance) > 0;
    });
    if (!pool.length || !(price > 0)) {
      out.innerHTML = '<p class="calc-empty">This pack has no drop rates.</p>';
      return;
    }

    var baseOpens = Math.floor(tokensIn / price);
    var expected = {};
    pool.forEach(function (b) {
      expected[b.name] = baseOpens * (Number(b.chance) / 100);
    });

    var totalPulled = {};
    var kept = {};
    var tokens = tokensIn;
    var packsOpened = 0;
    var tokensFromSales = 0;
    var tokensSpentOnPacks = 0;
    var maxRounds = 500000;

    function addBlook(b) {
      if (!totalPulled[b.name]) totalPulled[b.name] = { blook: b, count: 0 };
      totalPulled[b.name].count++;
      if (!kept[b.name]) kept[b.name] = { blook: b, count: 0 };
      kept[b.name].count++;
    }

    if (!resell) {
      packsOpened = baseOpens;
      tokensSpentOnPacks = baseOpens * price;
      tokens = tokensIn - tokensSpentOnPacks;
      for (var i = 0; i < baseOpens; i++) addBlook(calcRollBlook(pool));
    } else {
      var rounds = 0;
      while (tokens >= price && rounds < maxRounds) {
        rounds++;
        tokens -= price;
        tokensSpentOnPacks += price;
        packsOpened++;
        addBlook(calcRollBlook(pool));
        var sold = 0;
        Object.keys(kept).forEach(function (n) {
          var row = kept[n];
          if (row.count > 1) {
            var extra = row.count - 1;
            sold += extra * calcSellPrice(row.blook);
            row.count = 1;
          }
        });
        tokens += sold;
        tokensFromSales += sold;
      }
    }

    // For resell mode, still show theoretical one-spend expected as reference
    var expectedForDisplay = expected;
    if (resell && packsOpened > 0) {
      expectedForDisplay = {};
      pool.forEach(function (b) {
        expectedForDisplay[b.name] = packsOpened * (Number(b.chance) / 100);
      });
    }

    var rows = pool.map(function (b) {
      var got = totalPulled[b.name] ? totalPulled[b.name].count : 0;
      var exp = expectedForDisplay[b.name] || 0;
      return { b: b, got: got, exp: exp, pct: Number(b.chance) };
    }).filter(function (r) {
      return r.got > 0 || r.exp >= 0.005;
    }).sort(function (a, b) {
      return b.exp - a.exp || b.got - a.got || a.pct - b.pct;
    });

    var summaryHtml =
      '<div class="calc-summary">' +
      '<div class="calc-stat"><b>' + packsOpened.toLocaleString() + '</b><span>Packs opened' +
      (resell ? ' (w/ resell)' : '') + '</span></div>' +
      '<div class="calc-stat"><b>' + tokensSpentOnPacks.toLocaleString() + '</b><span>Tokens spent</span></div>' +
      (resell ? '<div class="calc-stat"><b>' + tokensFromSales.toLocaleString() + '</b><span>From selling</span></div>' : '') +
      '<div class="calc-stat"><b>' + tokens.toLocaleString() + '</b><span>Tokens left</span></div>' +
      '</div>';

    // Average expected table (the main thing user asked for)
    var tableRows = rows.map(function (r) {
      var img = (typeof getBlookImg === 'function') ? getBlookImg(r.b.name) : '';
      var delta = r.got - r.exp;
      var deltaCls = delta >= 0 ? 'delta-pos' : 'delta-neg';
      var deltaStr = (delta >= 0 ? '+' : '') + fmtExp(delta);
      return '<tr>' +
        '<td><div class="blook-cell"><img src="' + img + '" alt=""><span>' + r.b.name + '</span></div></td>' +
        '<td class="num">' + r.pct + '%</td>' +
        '<td class="num">' + fmtExp(r.exp) + '</td>' +
        '<td class="num">' + r.got.toLocaleString() + '</td>' +
        '<td class="num ' + deltaCls + '">' + deltaStr + '</td>' +
        '</tr>';
    }).join('');

    var tableHtml =
      '<div class="calc-section-label">On average (expected vs this run)</div>' +
      '<div class="calc-avg-table-wrap"><table class="calc-avg-table">' +
      '<thead><tr><th>Blook</th><th class="num">Rate</th><th class="num">Avg</th><th class="num">Got</th><th class="num">Δ</th></tr></thead>' +
      '<tbody>' + tableRows + '</tbody></table></div>';

    var cardsHtml = rows.length
      ? '<div class="calc-section-label">Pull results</div><div class="calc-got-grid">' +
        rows.map(function (r) {
          var img = (typeof getBlookImg === 'function') ? getBlookImg(r.b.name) : '';
          return '<div class="calc-got-card">' +
            '<img src="' + img + '" alt="">' +
            '<div class="calc-got-name">' + r.b.name + '</div>' +
            '<div class="calc-got-pct">' + r.pct + '%</div>' +
            '<div class="calc-got-exp">avg ' + fmtExp(r.exp) + '</div>' +
            '<div class="calc-got-qty">×' + r.got.toLocaleString() + '</div>' +
            '</div>';
        }).join('') + '</div>'
      : '<p class="calc-empty">No packs opened — need more tokens.</p>';

    var note =
      '<p class="calc-note">' +
      (resell
        ? 'Resell on: duplicates sold (keep 1 of each), tokens reused. <b>Avg</b> = packs opened × drop%. <b>Got</b> = this random run.'
        : 'Resell off: exactly <b>' + baseOpens.toLocaleString() + '</b> packs (tokens ÷ price). <b>Avg</b> = packs × drop%. <b>Got</b> = this random run.') +
      '</p>';

    out.innerHTML = summaryHtml + tableHtml + cardsHtml + note;
    try { out.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  };

  // Boot
  function boot() {
    injectCalcStyles();
    fixOnlineCounter();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 0);
  }
})();
