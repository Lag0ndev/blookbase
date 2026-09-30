/* Blookbase Secret !!! — must reclaim /secret from main 404 */
(function(){
'use strict';
if(window.__bbS)return;window.__bbS=1;

var st=document.createElement('style');
st.textContent='.bb-sc{background:#9a49aa;border:6px solid rgba(255,255,255,.2);border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:4px 4px rgba(0,0,0,.2);color:#fff;text-align:center;max-width:420px;width:100%}.bb-sc h3{font-family:Titan One,sans-serif;font-weight:400;font-size:22px;margin:0 0 12px}.bb-tb{display:inline-block;background:linear-gradient(180deg,#ffd76a,#f0a020);color:#4a2a00;font-weight:900;font-size:16px;padding:12px 28px;border-radius:12px;border:4px solid rgba(255,255,255,.4);cursor:pointer;font-family:Nunito,sans-serif}.bb-tb:disabled{opacity:.55;cursor:not-allowed}.bb-ts{font-size:14px;font-weight:800;margin-top:10px}.bb-bal{font-size:28px;font-weight:900;margin:8px 0 4px}.bb-sn{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:8px}.bb-sn button{color:#fff;font-weight:900;background:rgba(255,255,255,.18);padding:12px 20px;border-radius:12px;border:3px solid rgba(255,255,255,.35);cursor:pointer;font-family:Nunito,sans-serif;font-size:15px}.bb-ph{font-weight:800;opacity:.9}';
document.head.appendChild(st);

var HTML={
secret:'<div class="main-content" id="view-secret" style="display:none;flex-direction:column;align-items:center"><h1 class="header-title">Secret !!!</h1><div class="leaks-wrap" style="display:flex;flex-direction:column;align-items:center"><div class="bb-sc"><h3>Daily Tokens</h3><div class="bb-bal" id="bb-bal">0</div><div style="font-size:13px;font-weight:800;opacity:.85;margin-bottom:12px">tokens</div><button type="button" class="bb-tb" id="bb-claim">Claim 500 Tokens</button><div class="bb-ts" id="bb-ts"></div></div><div class="bb-sc"><h3>Secret Menu</h3><p style="font-weight:700;opacity:.9;margin:0 0 14px">Only linked here — not on the main sidebar.</p><div class="bb-sn"><button type="button" data-g="stats">Stats</button><button type="button" data-g="bbmarket">Market</button><button type="button" data-g="blooks">Blooks</button></div></div></div></div>',
stats:'<div class="main-content" id="view-stats" style="display:none;flex-direction:column;align-items:center"><h1 class="header-title">Stats</h1><div class="leaks-wrap"><div class="leaks-section"><p class="bb-ph">Stats coming soon. Nothing here yet.</p></div></div></div>',
bbmarket:'<div class="main-content" id="view-bbmarket" style="display:none;flex-direction:column;align-items:center"><h1 class="header-title">Market</h1><div class="leaks-wrap"><div class="leaks-section"><p class="bb-ph">Secret Market coming soon. Nothing here yet.</p></div></div></div>',
blooks:'<div class="main-content" id="view-blooks" style="display:none;flex-direction:column;align-items:center"><h1 class="header-title">Blooks</h1><div class="leaks-wrap"><div class="leaks-section"><p class="bb-ph">Blooks inventory coming soon. Nothing here yet.</p></div></div></div>'
};
var CV=['secret','stats','bbmarket','blooks'];
var PATH_MAP={secret:'secret','secret!!!':'secret',stats:'stats',blooks:'blooks','secret-market':'bbmarket',smarket:'bbmarket'};
var done=0, current=null;

function seg(){
  var s=(location.pathname.replace(/\/+$/,'')||'/').split('/').filter(Boolean)[0]||'';
  return decodeURIComponent(s).toLowerCase();
}
function isSecretPath(s){ s=s||seg(); return !!PATH_MAP[s]; }
function wantView(){ return PATH_MAP[seg()] || null; }

function inj(){
  if(done) return;
  var a=document.getElementById('view-videos')||document.getElementById('view-404')||document.querySelector('.main-content');
  if(!a) return;
  Object.keys(HTML).forEach(function(k){
    if(!document.getElementById('view-'+k)) a.insertAdjacentHTML('beforebegin', HTML[k]);
  });
  var list=document.querySelector('.sidebar-list');
  if(list && !list.querySelector('[data-view="secret"]')){
    var w=list.querySelector('[data-view="whatsnew"]');
    var li=document.createElement('li');
    li.innerHTML='<button class="sidebar-link" data-view="secret" type="button"><span class="sidebar-listIcon"><i class="fas fa-lock"></i></span><span class="sidebar-text">Secret !!!</span></button>';
    li.querySelector('button').onclick=function(e){e.preventDefault();e.stopPropagation();show('secret');};
    if(w&&w.closest('li')) w.closest('li').after(li); else list.appendChild(li);
  }
  done=1;
}

function td(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function gt(){try{return parseInt(localStorage.getItem('bb_tokens')||'0',10)||0;}catch(e){return 0;}}
function stok(n){try{localStorage.setItem('bb_tokens',String(n));}catch(e){}}
function can(){try{return localStorage.getItem('bb_last_claim')!==td();}catch(e){return 1;}}

function rs(){
  var bal=document.getElementById('bb-bal'),btn=document.getElementById('bb-claim'),ts=document.getElementById('bb-ts');
  if(bal) bal.textContent=String(gt());
  if(btn&&ts){
    if(can()){btn.disabled=0;btn.textContent='Claim 500 Tokens';ts.textContent='You can claim your daily tokens!';}
    else{btn.disabled=1;btn.textContent='Already claimed today';ts.textContent='Come back tomorrow for another 500 tokens.';}
    btn.onclick=function(){
      if(!can())return;stok(gt()+500);try{localStorage.setItem('bb_last_claim',td());}catch(e){}
      if(bal)bal.textContent=String(gt());btn.disabled=1;btn.textContent='Already claimed today';ts.textContent='Claimed +500! Come back tomorrow.';
    };
  }
  document.querySelectorAll('#view-secret [data-g]').forEach(function(el){
    el.onclick=function(e){e.preventDefault();show(el.getAttribute('data-g'));};
  });
}

function hideAll(){
  document.querySelectorAll('.main-content').forEach(function(el){el.style.display='none';});
  var v404=document.getElementById('view-404');
  if(v404) v404.style.display='none';
}

function show(v){
  inj();
  hideAll();
  current=v;
  var el=document.getElementById('view-'+v);
  if(el){el.style.display='flex';el.style.flexDirection='column';el.style.alignItems='center';}
  var T={secret:'Secret !!!',stats:'Stats',bbmarket:'Market',blooks:'Blooks'};
  document.title='Blookbase | '+(T[v]||v);
  document.querySelectorAll('.sidebar-link').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-view')==='secret');
  });
  try{
    var p = v==='bbmarket' ? '/secret-market' : '/'+v;
    if(location.protocol!=='file:' && location.pathname.replace(/\/+$/,'')!==p)
      history.replaceState({view:v},'',p);
  }catch(e){}
  if(v==='secret') rs();
  try{if(typeof closeSidebar==='function')closeSidebar();}catch(e){}
}

function patch(){
  if(typeof window.switchView==='function' && !window.switchView.__bbS){
    var o=window.switchView;
    window.switchView=function(v,skip){
      if(CV.indexOf(v)!==-1){show(v);return;}
      if(v==='404' && isSecretPath()){show(wantView());return;}
      CV.forEach(function(x){var e=document.getElementById('view-'+x);if(e)e.style.display='none';});
      current=null;
      return o.apply(this,arguments);
    };
    window.switchView.__bbS=1;
  }
  if(typeof window.initFromPath==='function' && !window.initFromPath.__bbS){
    var ip=window.initFromPath;
    window.initFromPath=function(){
      if(isSecretPath()){show(wantView());return;}
      return ip.apply(this,arguments);
    };
    window.initFromPath.__bbS=1;
  }
}

function reclaim(){
  inj();
  patch();
  var v=wantView();
  if(v){
    show(v);
    return true;
  }
  return false;
}

function boot(){
  if(isSecretPath()) reclaim();
  patch();
  window.addEventListener('popstate', function(){
    if(isSecretPath()) reclaim();
  });
  var t=0;
  var iv=setInterval(function(){
    inj(); patch();
    if(isSecretPath()){
      var el=document.getElementById('view-'+wantView());
      var v404=document.getElementById('view-404');
      if(!el || el.style.display==='none' || (v404 && v404.style.display!=='none')) reclaim();
    }
    if(++t>50) clearInterval(iv);
  },100);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
