(function(){'use strict';if(window.__bbSE)return;window.__bbSE=1;
var XT=[
{k:'ocean',n:'Ocean',t:'#00c6ff',m:'#0072ff',b:'#003a8c',a:'#00e5c0',d:'#009e84'},
{k:'candy',n:'Candy',t:'#ff9a9e',m:'#fad0c4',b:'#fbc2eb',a:'#ff6b9d',d:'#c93d6e'},
{k:'lava',n:'Lava',t:'#f12711',m:'#f5af19',b:'#7b2d00',a:'#ff6a00',d:'#b34500'},
{k:'aurora',n:'Aurora',t:'#00f5a0',m:'#00d9f5',b:'#6a11cb',a:'#7cffcb',d:'#2a9d7a'},
{k:'grape',n:'Grape',t:'#834d9b',m:'#d04ed6',b:'#4a148c',a:'#e040fb',d:'#9c27b0'},
{k:'mint',n:'Mint',t:'#d4fc79',m:'#96e6a1',b:'#0ba360',a:'#2ecc71',d:'#1b8a4a'},
{k:'rose',n:'Rose',t:'#ffecd2',m:'#fcb69f',b:'#ee9ca7',a:'#e91e63',d:'#ad1457'},
{k:'steel',n:'Steel',t:'#bdc3c7',m:'#2c3e50',b:'#000000',a:'#3498db',d:'#1a5276'},
{k:'honey',n:'Honey',t:'#f6d365',m:'#fda085',b:'#c97b2a',a:'#f39c12',d:'#b9770e'},
{k:'neon',n:'Neon',t:'#0f0c29',m:'#302b63',b:'#24243e',a:'#39ff14',d:'#1fa008'},
{k:'sky',n:'Sky',t:'#a1c4fd',m:'#c2e9fb',b:'#89f7fe',a:'#5dade2',d:'#2874a6'},
{k:'ember',n:'Ember',t:'#eb3349',m:'#f45c43',b:'#4a0e0e',a:'#ff5252',d:'#c62828'},
{k:'lilac',n:'Lilac',t:'#e0c3fc',m:'#8ec5fc',b:'#667eea',a:'#9b59b6',d:'#6c3483'},
{k:'moss',n:'Moss',t:'#56ab2f',m:'#a8e063',b:'#1b5e20',a:'#8bc34a',d:'#558b2f'},
{k:'ink',n:'Ink',t:'#232526',m:'#414345',b:'#000',a:'#00bcd4',d:'#00838f'},
{k:'peach',n:'Peach',t:'#ffecd2',m:'#fcb69f',b:'#ff9a9e',a:'#ff8a65',d:'#e64a19'},
{k:'ice',n:'Ice',t:'#e0eafc',m:'#cfdef3',b:'#a8c0ff',a:'#5c6bc0',d:'#3949ab'},
{k:'royal',n:'Royal',t:'#141e30',m:'#243b55',b:'#0f2027',a:'#f1c40f',d:'#b7950b'},
{k:'cotton',n:'Cotton',t:'#fbc2eb',m:'#a6c1ee',b:'#fad0c4',a:'#ec407a',d:'#ad1457'},
{k:'volcano',n:'Volcano',t:'#ff512f',m:'#dd2476',b:'#3a0ca3',a:'#ff6b6b',d:'#c0392b'},
{k:'sage',n:'Sage',t:'#d5ecc2',m:'#98ddc4',b:'#6bb3a8',a:'#4db6ac',d:'#2e7d6f'},
{k:'berry',n:'Berry',t:'#8e2de2',m:'#4a00e0',b:'#1a0033',a:'#ce93d8',d:'#8e24aa'}
];
var FH=[
{k:'titan',n:'Titan One',c:"'Titan One',cursive"},
{k:'nunito',n:'Nunito',c:"'Nunito',sans-serif"},
{k:'fredoka',n:'Fredoka',c:"'Fredoka',sans-serif"},
{k:'rubik',n:'Rubik',c:"'Rubik',sans-serif"},
{k:'baloo',n:'Baloo 2',c:"'Baloo 2',cursive"},
{k:'poppins',n:'Poppins',c:"'Poppins',sans-serif"},
{k:'comic',n:'Comic Neue',c:"'Comic Neue',cursive"},
{k:'bangers',n:'Bangers',c:"'Bangers',cursive"}
];
var FB=[
{k:'nunito',n:'Nunito',c:"'Nunito',sans-serif"},
{k:'rubik',n:'Rubik',c:"'Rubik',sans-serif"},
{k:'poppins',n:'Poppins',c:"'Poppins',sans-serif"},
{k:'inter',n:'Inter',c:"'Inter',sans-serif"},
{k:'fredoka',n:'Fredoka',c:"'Fredoka',sans-serif"},
{k:'comic',n:'Comic Neue',c:"'Comic Neue',cursive"}
];
var hFont=localStorage.getItem('bb_font_h')||'titan';
var bFont=localStorage.getItem('bb_font_b')||'nunito';
var gradOn=localStorage.getItem('bb_grad')!=='0';

function css(){
  if(document.getElementById('bb-se-css'))return;
  var s=document.createElement('style');s.id='bb-se-css';
  s.textContent=[
    '#bb-theme-pop{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:16px;}',
    '#bb-theme-pop.open{display:flex;}',
    '#bb-theme-pop .bb-tp-box{background:var(--accent,#9a49aa);color:#fff;border:6px solid rgba(255,255,255,.22);border-radius:14px;box-shadow:6px 6px 0 rgba(0,0,0,.25);max-width:720px;width:100%;max-height:90vh;overflow:auto;padding:18px 16px;}',
    '#bb-theme-pop .bb-tp-title{font-family:Titan One,cursive;font-size:24px;margin:0 0 8px;text-shadow:2px 2px 0 rgba(0,0,0,.15);}',
    '#bb-theme-pop .bb-tp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin:12px 0;}',
    '#bb-theme-pop .bb-tp-card{background:rgba(0,0,0,.2);border:3px solid rgba(255,255,255,.25);border-radius:10px;padding:8px;cursor:pointer;text-align:center;}',
    '#bb-theme-pop .bb-tp-card:hover{background:rgba(0,0,0,.3);}',
    '#bb-theme-pop .bb-tp-card.active{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.35);}',
    '#bb-theme-pop .bb-tp-sw{height:36px;border-radius:8px;margin-bottom:6px;border:2px solid rgba(255,255,255,.2);}',
    '#bb-theme-pop .bb-tp-name{font-weight:800;font-size:12px;}',
    '#bb-theme-pop .bb-tp-preview{margin-top:12px;border:3px solid rgba(255,255,255,.25);border-radius:12px;overflow:hidden;background:rgba(0,0,0,.15);}',
    '#bb-theme-pop .bb-tp-row{display:flex;min-height:120px;}',
    '#bb-theme-pop .bb-tp-side{width:72px;padding:8px;background:rgba(0,0,0,.25);}',
    '#bb-theme-pop .bb-tp-side div{background:rgba(255,255,255,.12);border-radius:6px;padding:5px;margin-bottom:6px;font-size:10px;font-weight:800;}',
    '#bb-theme-pop .bb-tp-main{flex:1;padding:10px;}',
    '#bb-theme-pop .bb-tp-main .ttl{font-size:18px;text-shadow:2px 2px 0 rgba(0,0,0,.2);}',
    '#bb-theme-pop .bb-tp-main .card{background:rgba(0,0,0,.22);border:3px solid rgba(255,255,255,.2);border-radius:10px;padding:10px;margin-top:8px;font-weight:800;box-shadow:3px 3px 0 rgba(0,0,0,.15);}',
    '#bb-theme-pop .bb-tp-main .btn{display:inline-block;margin-top:8px;padding:8px 14px;border-radius:10px;font-weight:900;border:3px solid rgba(255,255,255,.35);color:#fff;}',
    '#bb-theme-pop label{font-weight:800;font-size:13px;display:flex;align-items:center;gap:8px;margin:8px 0;}',
    '#bb-theme-pop select{padding:8px 10px;border-radius:8px;border:3px solid rgba(255,255,255,.25);background:rgba(0,0,0,.2);color:#fff;font-weight:800;}',
    '#bb-theme-pop select option{color:#222;background:#fff;}',
    '#bb-theme-pop .bb-tp-close{float:right;background:rgba(0,0,0,.25);border:3px solid rgba(255,255,255,.3);color:#fff;border-radius:10px;padding:6px 12px;font-weight:900;cursor:pointer;}',
    '#bb-font-panel{background:rgba(0,0,0,.18);border:3px solid rgba(255,255,255,.2);border-radius:10px;padding:12px;margin-top:12px;}'
  ].join('');
  document.head.appendChild(s);
}

function fontCss(k,list){for(var i=0;i<list.length;i++)if(list[i].k===k)return list[i].c;return list[0].c;}
function applyFonts(){
  var hf=fontCss(hFont,FH),bf=fontCss(bFont,FB);
  var st=document.getElementById('bb-font-style');
  if(!st){st=document.createElement('style');st.id='bb-font-style';document.head.appendChild(st);}
  st.textContent='.header-title,h1.header-title,.settings-section h3,.leaks-section h3{font-family:'+hf+'!important;}body,.main-content,p,button,input,select{font-family:'+bf+',Nunito,sans-serif;}';
}
function applyGrad(){
  if(typeof currentView!=='undefined'&&currentView==='countdown')return;
  var st=document.getElementById('bb-grad-style');
  if(!st){st=document.createElement('style');st.id='bb-grad-style';document.head.appendChild(st);}
  if(gradOn){st.textContent='';}
  else{st.textContent='body{background-image:none!important;background-color:var(--bg-bottom,#349aef)!important;}';}
}
function addThemes(){
  if(typeof siteThemes==='undefined')return;
  XT.forEach(function(x){
    if(siteThemes.some(function(t){return t.key===x.k;}))return;
    siteThemes.push({key:x.k,name:x.n,bgTop:x.t,bgMid:x.m,bgBottom:x.b,accent:x.a,accentDark:x.d,angle:135});
  });
}
function themeObj(k){
  if(typeof siteThemes==='undefined')return null;
  for(var i=0;i<siteThemes.length;i++)if(siteThemes[i].key===k)return siteThemes[i];
  return null;
}
function preview(k){
  var t=themeObj(k)||{bgTop:'#0bc2cf',bgBottom:'#349aef',accent:'#9a49aa'};
  var bg='linear-gradient(135deg,'+(t.bgTop||'#0bc2cf')+','+(t.bgBottom||'#349aef')+')';
  var hf=fontCss(hFont,FH);
  var box=document.getElementById('bb-tp-preview');
  if(!box)return;
  box.style.background=gradOn?bg:(t.bgBottom||'#349aef');
  box.innerHTML='<div class="bb-tp-row"><div class="bb-tp-side" style="background:'+(t.accent||'#9a49aa')+'"><div>Home</div><div>Packs</div><div>Blooks</div></div><div class="bb-tp-main"><div class="ttl" style="font-family:'+hf+'">Blookbase</div><div class="card">Sample card (same purple UI style)</div><span class="btn" style="background:'+(t.accent||'#9a49aa')+'">Button</span></div></div>';
}
function open(){
  css();
  var pop=document.getElementById('bb-theme-pop');
  if(!pop){
    pop=document.createElement('div');pop.id='bb-theme-pop';
    pop.innerHTML='<div class="bb-tp-box" onclick="event.stopPropagation()"><button type="button" class="bb-tp-close" id="bb-tp-x">Close</button><div class="bb-tp-title">Theme picker</div><p style="font-weight:700;opacity:.9;margin:0 0 8px;font-size:13px;">Countdown always keeps its own event theme \u2014 site themes never change it.</p><div class="bb-tp-grid" id="bb-tp-grid"></div><label><input type="checkbox" id="bb-tp-grad"> Gradient backgrounds</label><label>Header font <select id="bb-tp-fh"></select></label><label>Body font <select id="bb-tp-fb"></select></label><div class="bb-tp-preview" id="bb-tp-preview"></div></div>';
    document.body.appendChild(pop);
    pop.addEventListener('click',function(e){if(e.target===pop)pop.classList.remove('open');});
    document.getElementById('bb-tp-x').onclick=function(){pop.classList.remove('open');};
    document.getElementById('bb-tp-grad').onchange=function(){gradOn=this.checked;localStorage.setItem('bb_grad',gradOn?'1':'0');applyGrad();preview(typeof currentThemeKey!=='undefined'?currentThemeKey:'classic');hint();};
    var fh=document.getElementById('bb-tp-fh'),fb=document.getElementById('bb-tp-fb');
    FH.forEach(function(f){var o=document.createElement('option');o.value=f.k;o.textContent=f.n;fh.appendChild(o);});
    FB.forEach(function(f){var o=document.createElement('option');o.value=f.k;o.textContent=f.n;fb.appendChild(o);});
    fh.value=hFont;fb.value=bFont;
    fh.onchange=function(){hFont=this.value;localStorage.setItem('bb_font_h',hFont);applyFonts();preview(typeof currentThemeKey!=='undefined'?currentThemeKey:'classic');hint();};
    fb.onchange=function(){bFont=this.value;localStorage.setItem('bb_font_b',bFont);applyFonts();preview(typeof currentThemeKey!=='undefined'?currentThemeKey:'classic');hint();};
  }
  var g=document.getElementById('bb-tp-grid');g.innerHTML='';
  addThemes();
  (siteThemes||[]).forEach(function(t){
    var c=document.createElement('div');
    c.className='bb-tp-card'+(typeof currentThemeKey!=='undefined'&&currentThemeKey===t.key?' active':'');
    var sw=document.createElement('div');sw.className='bb-tp-sw';
    sw.style.background='linear-gradient(135deg,'+(t.bgTop||'#0bc2cf')+','+(t.bgBottom||'#349aef')+')';
    var n=document.createElement('div');n.className='bb-tp-name';n.textContent=t.name;
    c.appendChild(sw);c.appendChild(n);
    c.onclick=function(){
      if(typeof setSiteTheme==='function')setSiteTheme(t.key);
      document.querySelectorAll('#bb-tp-grid .bb-tp-card').forEach(function(x){x.classList.remove('active');});
      c.classList.add('active');
      preview(t.key);hint();
    };
    g.appendChild(c);
  });
  document.getElementById('bb-tp-grad').checked=gradOn;
  preview(typeof currentThemeKey!=='undefined'?currentThemeKey:'classic');
  pop.classList.add('open');
}
function hint(){
  var h=document.getElementById('bb-th');
  if(h)h.textContent='Current: '+(typeof currentThemeKey!=='undefined'?currentThemeKey:'classic')+(gradOn?' \u00b7 gradient':' \u00b7 solid')+' \u00b7 '+hFont+' / '+bFont;
}
function ui(){
  var g=document.getElementById('theme-grid');
  if(!g)return;
  if(!document.getElementById('bb-open-theme')){
    g.style.display='none';
    var btn=document.createElement('button');btn.id='bb-open-theme';btn.type='button';btn.className='settings-reset-btn';btn.textContent='Open theme picker\u2026';btn.onclick=open;
    g.parentNode.insertBefore(btn,g);
    var h=document.createElement('p');h.className='settings-hint';h.id='bb-th';h.style.marginTop='10px';
    btn.parentNode.insertBefore(h,btn.nextSibling);
  }
  hint();
}
function resetFontsAndGrad(){
  hFont='titan';bFont='nunito';gradOn=true;
  try{
    localStorage.setItem('bb_font_h','titan');
    localStorage.setItem('bb_font_b','nunito');
    localStorage.setItem('bb_grad','1');
  }catch(e){}
  applyFonts();applyGrad();hint();
}
function boot(){
  if(!document.getElementById('bb-fonts')){
    var l=document.createElement('link');l.id='bb-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Bangers&family=Comic+Neue:wght@700&family=Fredoka:wght@600;700&family=Inter:wght@600;700&family=Poppins:wght@600;800&family=Rubik:wght@600;800&display=swap';
    document.head.appendChild(l);
  }
  css();addThemes();applyFonts();applyGrad();ui();
  if(typeof setSiteTheme==='function'&&!setSiteTheme.__se){
    var o=setSiteTheme;
    window.setSiteTheme=function(k){
      var r=o.apply(this,arguments);
      if(typeof currentView==='undefined'||currentView!=='countdown')applyGrad();
      else if(typeof applyPage==='function'&&typeof currentPage!=='undefined'){try{applyPage(currentPage);}catch(e){}}
      hint();return r;
    };
    setSiteTheme.__se=1;
  }
  if(typeof applySiteTheme==='function'&&!applySiteTheme.__se){
    var a=applySiteTheme;
    window.applySiteTheme=function(){
      if(typeof currentView!=='undefined'&&currentView==='countdown')return;
      var r=a.apply(this,arguments);applyGrad();applyFonts();return r;
    };
    applySiteTheme.__se=1;
  }
  if(typeof resetSettings==='function'&&!resetSettings.__se){
    var rs=resetSettings;
    window.resetSettings=function(){
      var r=rs.apply(this,arguments);
      resetFontsAndGrad();
      return r;
    };
    resetSettings.__se=1;
  }
  if(typeof switchView==='function'&&!switchView.__se){
    var sv=switchView;
    window.switchView=function(v){
      var r=sv.apply(this,arguments);
      if(v==='settings')setTimeout(ui,40);
      if(v==='countdown'&&typeof applyPage==='function'&&typeof currentPage!=='undefined'){
        try{applyPage(currentPage);}catch(e){}
      }
      return r;
    };
    switchView.__se=1;
  }
  var t=0,iv=setInterval(function(){addThemes();ui();if(++t>30)clearInterval(iv);},200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
