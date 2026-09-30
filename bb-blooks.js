/* Blookbase Blooks browser — all pack blooks, filter by pack/rarity/search */
(function(){
'use strict';
if (window.__bbBlooks) return;
window.__bbBlooks = 1;

var RARITY_ORDER = ['Common','Uncommon','Rare','Epic','Legendary','Chroma','Mystical','Unique','Unique / Special'];
var RARITY_COLOR = {
  Common:'#a4a4a4', Uncommon:'#4bc22e', Rare:'#0a14fa', Epic:'#be0000',
  Legendary:'#ff910f', Chroma:'#00c2a8', Mystical:'#a335ee', Unique:'#fe2db6', 'Unique / Special':'#fe2db6'
};

var DATA = null;
var state = { pack:'all', rarity:'all', q:'' };

function el(id){ return document.getElementById(id); }

function ensureShell(){
  var root = el('view-blooks');
  if (!root) return null;
  if (el('bb-blooks-grid')) return root;
  root.innerHTML =
    '<h1 class="header-title">Blooks</h1>'+
    '<div class="leaks-wrap" style="width:100%;max-width:1100px;">'+
      '<div class="leaks-section" style="margin-bottom:14px;">'+
        '<p style="font-weight:800;opacity:.9;margin:0 0 12px;">Browse Blooket pack Blooks. Filter by pack, rarity, or search.</p>'+
        '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">'+
          '<input id="bb-blooks-q" type="search" placeholder="Search blooks…" style="flex:1;min-width:160px;padding:10px 14px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:700;font-size:15px;">'+
          '<select id="bb-blooks-pack" style="padding:10px 12px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:800;font-size:14px;"></select>'+
          '<select id="bb-blooks-rarity" style="padding:10px 12px;border-radius:10px;border:3px solid rgba(0,0,0,.12);font-family:Nunito,sans-serif;font-weight:800;font-size:14px;"></select>'+
          '<span id="bb-blooks-count" style="font-weight:800;opacity:.85;"></span>'+
        '</div>'+
      </div>'+
      <div id="bb-blooks-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;"></div>'+
    '</div>';
  return root;
}

function fillFilters(){
  var packs = {};
  var rarities = {};
  (DATA||[]).forEach(function(b){
    packs[b.pack]=1;
    rarities[b.rarity]=1;
  });
  var packSel = el('bb-blooks-pack');
  var rarSel = el('bb-blooks-rarity');
  if (!packSel || !rarSel) return;
  packSel.innerHTML = '<option value="all">All packs</option>';
  Object.keys(packs).sort().forEach(function(p){
    var o = document.createElement('option'); o.value=p; o.textContent=p; packSel.appendChild(o);
  });
  rarSel.innerHTML = '<option value="all">All rarities</option>';
  RARITY_ORDER.forEach(function(r){
    if (!rarities[r]) return;
    var o=document.createElement('option'); o.value=r; o.textContent=r; rarSel.appendChild(o);
  });
  Object.keys(rarities).forEach(function(r){
    if (RARITY_ORDER.indexOf(r)>=0) return;
    var o=document.createElement('option'); o.value=r; o.textContent=r; rarSel.appendChild(o);
  });
}

function filtered(){
  var q = (state.q||'').toLowerCase().trim();
  return (DATA||[]).filter(function(b){
    if (state.pack!=='all' && b.pack!==state.pack) return false;
    if (state.rarity!=='all' && b.rarity!==state.rarity) return false;
    if (q && b.name.toLowerCase().indexOf(q)<0 && b.slug.indexOf(q)<0 && b.pack.toLowerCase().indexOf(q)<0) return false;
    return true;
  });
}

function render(){
  ensureShell();
  var grid = el('bb-blooks-grid');
  var count = el('bb-blooks-count');
  if (!grid) return;
  var list = filtered();
  if (count) count.textContent = list.length + ' blook' + (list.length===1?'':'s');
  grid.innerHTML = '';
  list.forEach(function(b){
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:12px;padding:10px 8px;text-align:center;box-shadow:3px 3px 0 rgba(0,0,0,.12);border:3px solid rgba(0,0,0,.06);';
    var col = RARITY_COLOR[b.rarity] || '#888';
    card.innerHTML =
      '<div style="height:72px;display:flex;align-items:center;justify-content:center;">'+
        '<img src="'+b.img+'" alt="'+b.name+'" loading="lazy" style="max-width:64px;max-height:64px;object-fit:contain;">'+
      '</div>'+
      '<div style="font-weight:900;font-size:13px;margin-top:6px;line-height:1.2;">'+b.name+'</div>'+
      '<div style="font-size:11px;font-weight:800;color:'+col+';margin-top:4px;">'+b.rarity+'</div>'+
      '<div style="font-size:10px;font-weight:700;opacity:.65;margin-top:2px;">'+b.pack.replace(/ Pack$/,'')+'</div>';
    grid.appendChild(card);
  });
}

function bind(){
  var q = el('bb-blooks-q');
  var pack = el('bb-blooks-pack');
  var rar = el('bb-blooks-rarity');
  if (q && !q.__bb) {
    q.__bb = 1;
    q.addEventListener('input', function(){ state.q = q.value; render(); });
  }
  if (pack && !pack.__bb) {
    pack.__bb = 1;
    pack.addEventListener('change', function(){ state.pack = pack.value; render(); });
  }
  if (rar && !rar.__bb) {
    rar.__bb = 1;
    rar.addEventListener('change', function(){ state.rarity = rar.value; render(); });
  }
}

function load(cb){
  if (DATA && DATA.length) { cb(); return; }
  DATA = window.__BB_BLOOKS_DATA || [];
  if (DATA.length) { cb(); return; }
  // fallback fetch
  var urls = ['data/blooks.json','/data/blooks.json'];
  var i = 0;
  function next(){
    if (i >= urls.length) { DATA = DATA||[]; cb(); return; }
    fetch(urls[i++]).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(j){ DATA = j; cb(); })
      .catch(next);
  }
  next();
}

window.__bbRenderBlooks = function(){
  ensureShell();
  load(function(){
    fillFilters();
    bind();
    render();
  });
};

function patchSwitch(){
  if (typeof window.switchView !== 'function' || window.switchView.__bbB) return;
  var o = window.switchView;
  window.switchView = function(v, skip){
    var r = o.apply(this, arguments);
    if (v === 'blooks') {
      try { window.__bbRenderBlooks(); } catch(e){}
    }
    return r;
  };
  window.switchView.__bbB = 1;
}

function boot(){
  ensureShell();
  patchSwitch();
  if (location.pathname.replace(/\/+$/,'') === '/blooks') {
    try { window.__bbRenderBlooks(); } catch(e){}
  }
  var t=0, iv=setInterval(function(){
    patchSwitch();
    ensureShell();
    if (++t > 40) clearInterval(iv);
  }, 150);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
