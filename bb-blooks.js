/* Blookbase Blooks browser + full Secret removal */
(function(){
'use strict';
if (window.__bbBlooks) return;
window.__bbBlooks = 1;

var RARITY_ORDER = ['Common','Uncommon','Rare','Epic','Legendary','Chroma','Mystical','Unique'];
var RARITY_COLOR = {Common:'#a4a4a4',Uncommon:'#4bc22e',Rare:'#0a14fa',Epic:'#be0000',Legendary:'#ff910f',Chroma:'#00c2a8',Mystical:'#a335ee',Unique:'#fe2db6'};
var DATA = null;
var state = { pack:'all', rarity:'all', q:'' };

var SUITCASE_SVG = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="suitcase" class="svg-inline--fa fa-suitcase fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:1em;height:1em;vertical-align:-0.125em;"><path fill="currentColor" d="M128 480h256V80c0-26.5-21.5-48-48-48H176c-26.5 0-48 21.5-48 48v400zm64-384h128v32H192V96zm320 80v256c0 26.5-21.5 48-48 48h-48V128h48c26.5 0 48 21.5 48 48zM96 480H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h48v352z"></path></svg>';

function el(id){ return document.getElementById(id); }

function killSecret(){
  // Remove secret sidebar buttons
  document.querySelectorAll('button[data-view="secret"]').forEach(function(btn){
    var li = btn.closest('li');
    if (li) li.remove(); else btn.remove();
  });
  // Settings Open Secret / Secret section
  document.querySelectorAll('.settings-section').forEach(function(sec){
    var h = sec.querySelector('h3');
    if (h && /secret/i.test(h.textContent||'')) sec.remove();
  });
  document.querySelectorAll('button').forEach(function(b){
    if (/open\s*secret/i.test(b.textContent||'')) {
      var sec = b.closest('.settings-section') || b.closest('div');
      if (sec) sec.remove(); else b.remove();
    }
  });
  // Hide + empty secret view and any secret sub-views (stats/blooks/market on secret)
  ['view-secret','view-secret-stats','view-secret-blooks','view-secret-market','bb-secret-stats','bb-secret-blooks','bb-secret-market'].forEach(function(id){
    var vs = el(id);
    if (vs) { vs.style.display = 'none'; vs.innerHTML = ''; vs.removeAttribute('id'); }
  });
  // Redirect /secret paths to home
  var seg = (location.pathname.replace(/\/+$/,'')||'/').split('/').filter(Boolean)[0]||'';
  if (seg === 'secret' || seg === 'secret!!!' || seg.indexOf('secret') === 0) {
    if (typeof switchView === 'function') switchView('home', true);
    try { history.replaceState(null,'','/'); } catch(e){}
  }
  // Neutralize any leftover secret render hooks
  window.__bbRenderSecret = function(){};
}

function ensureBlooksSidebar(){
  var list = document.querySelector('ul.sidebar-list');
  if (!list) return;
  var existing = list.querySelector('button[data-view="blooks"]');
  if (existing) {
    var icon = existing.querySelector('.sidebar-listIcon');
    if (icon) {
      // Always set exact suitcase SVG
      if (!icon.querySelector('svg[data-icon="suitcase"]')) {
        icon.innerHTML = SUITCASE_SVG;
      }
    }
    // Ensure click works
    if (!existing.__bbClick) {
      existing.__bbClick = 1;
      existing.addEventListener('click', function(e){
        e.preventDefault();
        if (typeof switchView === 'function') switchView('blooks');
      });
    }
    return;
  }
  // insert after market/Packs
  var marketBtn = list.querySelector('button[data-view="market"]');
  var li = document.createElement('li');
  li.innerHTML = '<button class="sidebar-link" data-view="blooks" type="button">'+
    '<span class="sidebar-listIcon">'+SUITCASE_SVG+'</span>'+
    '<span class="sidebar-text">Blooks</span></button>';
  var btn = li.querySelector('button');
  btn.onclick = function(e){ e.preventDefault(); if (typeof switchView==='function') switchView('blooks'); };
  if (marketBtn && marketBtn.closest('li')) {
    marketBtn.closest('li').after(li);
  } else {
    list.appendChild(li);
  }
}

function ensureShell(){
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
  if (el('bb-blooks-grid')) return root;
  root.innerHTML = '<h1 class="header-title">Blooks</h1>'+
    '<div class="leaks-wrap" style="width:100%;max-width:1100px;">'+
    '<div class="leaks-section" style="margin-bottom:14px;">'+
    '<p style="font-weight:800;opacity:.9;margin:0 0 12px;">Browse Blooket pack Blooks. Filter by pack, rarity, or search.</p>'+
    '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">'+
    '<input id="bb-blooks-q" type="search" placeholder="Search blooks..." style="flex:1;min-width:160px;padding:10px 14px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:700;font-size:15px;">'+
    '<select id="bb-blooks-pack" style="padding:10px 12px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:800;font-size:14px;"></select>'+
    '<select id="bb-blooks-rarity" style="padding:10px 12px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:800;font-size:14px;"></select>'+
    '<span id="bb-blooks-count" style="font-weight:800;opacity:.85;"></span>'+
    '</div></div>'+
    '<div id="bb-blooks-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;"></div></div>';
  return root;
}

function fillFilters(){
  var packs = {}, rarities = {};
  (DATA||[]).forEach(function(b){ packs[b.pack]=1; rarities[b.rarity]=1; });
  var packSel = el('bb-blooks-pack'), rarSel = el('bb-blooks-rarity');
  if (!packSel || !rarSel) return;
  packSel.innerHTML = '<option value="all">All packs</option>';
  Object.keys(packs).sort().forEach(function(p){ var o=document.createElement('option'); o.value=p; o.textContent=p; packSel.appendChild(o); });
  rarSel.innerHTML = '<option value="all">All rarities</option>';
  RARITY_ORDER.forEach(function(r){ if (!rarities[r]) return; var o=document.createElement('option'); o.value=r; o.textContent=r; rarSel.appendChild(o); });
  Object.keys(rarities).forEach(function(r){ if (RARITY_ORDER.indexOf(r)>=0) return; var o=document.createElement('option'); o.value=r; o.textContent=r; rarSel.appendChild(o); });
}

function filtered(){
  var q = (state.q||'').toLowerCase().trim();
  return (DATA||[]).filter(function(b){
    if (state.pack!=='all' && b.pack!==state.pack) return false;
    if (state.rarity!=='all' && b.rarity!==state.rarity) return false;
    if (q && b.name.toLowerCase().indexOf(q)<0 && (b.slug||'').indexOf(q)<0 && b.pack.toLowerCase().indexOf(q)<0) return false;
    return true;
  });
}

function render(){
  ensureShell();
  var grid = el('bb-blooks-grid'), count = el('bb-blooks-count');
  if (!grid) return;
  var list = filtered();
  if (count) count.textContent = list.length + ' blook' + (list.length===1?'':'s');
  grid.innerHTML = '';
  list.forEach(function(b){
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:12px;padding:10px 8px;text-align:center;box-shadow:3px 3px 0 rgba(0,0,0,.12);border:3px solid rgba(0,0,0,.06);';
    var col = RARITY_COLOR[b.rarity] || '#888';
    card.innerHTML = '<div style="height:72px;display:flex;align-items:center;justify-content:center;"><img src="'+b.img+'" alt="'+b.name+'" loading="lazy" style="max-width:64px;max-height:64px;object-fit:contain;"></div><div style="font-weight:900;font-size:13px;margin-top:6px;line-height:1.2;">'+b.name+'</div><div style="font-size:11px;font-weight:800;color:'+col+';margin-top:4px;">'+b.rarity+'</div><div style="font-size:10px;font-weight:700;opacity:.65;margin-top:2px;">'+b.pack.replace(/ Pack$/,'')+'</div>';
    grid.appendChild(card);
  });
}

function bind(){
  var q = el('bb-blooks-q'), pack = el('bb-blooks-pack'), rar = el('bb-blooks-rarity');
  if (q && !q.__bb) { q.__bb = 1; q.addEventListener('input', function(){ state.q = q.value; render(); }); }
  if (pack && !pack.__bb) { pack.__bb = 1; pack.addEventListener('change', function(){ state.pack = pack.value; render(); }); }
  if (rar && !rar.__bb) { rar.__bb = 1; rar.addEventListener('change', function(){ state.rarity = rar.value; render(); }); }
}

function load(cb){
  if (DATA && DATA.length) { cb(); return; }
  DATA = window.__BB_BLOOKS_DATA || [];
  if (DATA.length) { cb(); return; }
  var urls = ['data/blooks.json','/data/blooks.json','https://cdn.jsdelivr.net/gh/Lag0ndev/blookbase@main/data/blooks.json'];
  var i = 0;
  function next(){
    if (i >= urls.length) { DATA = DATA||[]; cb(); return; }
    fetch(urls[i++]).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){ DATA = j; cb(); }).catch(next);
  }
  next();
}

function showBlooksView(){
  document.querySelectorAll('.main-content').forEach(function(v){
    if (v.id === 'view-blooks') v.style.display = 'flex';
    else if (v.id && v.id.indexOf('view-')===0) v.style.display = 'none';
  });
  document.querySelectorAll('button.sidebar-link').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-view')==='blooks');
  });
}

window.__bbRenderBlooks = function(){
  ensureShell();
  showBlooksView();
  load(function(){ fillFilters(); bind(); render(); });
};

function patchSwitch(){
  if (typeof window.switchView !== 'function' || window.switchView.__bbB) return;
  var o = window.switchView;
  window.switchView = function(v, skip){
    // Fully block secret and any secret-only subpages (stats/blooks/market on secret)
    if (v === 'secret' || v === 'stats' || v === 'bbmarket' || v === 'secret-stats' || v === 'secret-blooks' || v === 'secret-market') {
      v = 'home';
      arguments[0] = 'home';
    }
    var r = o.apply(this, arguments);
    if (v === 'blooks') {
      try { window.__bbRenderBlooks(); } catch(e){}
    }
    killSecret();
    ensureBlooksSidebar();
    return r;
  };
  window.switchView.__bbB = 1;
}

function boot(){
  killSecret();
  ensureBlooksSidebar();
  ensureShell();
  patchSwitch();
  if (location.pathname.replace(/\/+$/,'') === '/blooks') {
    try { window.__bbRenderBlooks(); } catch(e){}
  }
  var t=0, iv=setInterval(function(){
    killSecret();
    ensureBlooksSidebar();
    patchSwitch();
    ensureShell();
    if (++t > 50) clearInterval(iv);
  }, 150);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
