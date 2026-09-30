/* Blookbase Secret — daily tokens only; entry via Settings */
(function(){
'use strict';
if(window.__bbS)return;window.__bbS=1;

function td(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function gt(){try{return parseInt(localStorage.getItem('bb_tokens')||'0',10)||0;}catch(e){return 0;}}
function stok(n){try{localStorage.setItem('bb_tokens',String(n));}catch(e){}}
function can(){try{return localStorage.getItem('bb_last_claim')!==td();}catch(e){return 1;}}

window.__bbRenderSecret = function(){
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
};

function seg(){return decodeURIComponent((location.pathname.replace(/\/+$/,'')||'/').split('/').filter(Boolean)[0]||'').toLowerCase();}
function boot(){
  if(seg()==='secret'){
    var t=0,iv=setInterval(function(){
      if(typeof switchView==='function'){switchView('secret',true);try{window.__bbRenderSecret();}catch(e){}}
      if(++t>30)clearInterval(iv);
    },100);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
