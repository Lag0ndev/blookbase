(function(){
  'use strict';
  if (window.__bbPackSimBoot) return;
  window.__bbPackSimBoot = 1;

  /* Full-viewport opening grid + site chrome */
  var css = document.createElement('style');
  css.id = 'bb-packsim-boot-css';
  css.textContent = [
    'html,body{width:100%;min-height:100vh;margin:0;overflow-x:hidden;}',
    'body{background:linear-gradient(165deg,#0bc2cf,#349aef)!important;}',
    '.background{position:fixed;inset:0;width:100vw;height:100vh;z-index:-2;background:linear-gradient(165deg,#0bc2cf,#349aef);}',
    '.bgBlooks{position:fixed;width:300%;height:300%;top:50%;left:50%;transform:translate(-50%,-50%) rotate(15deg);',
    'background-image:url(https://ac.blooket.com/dashboard/65a43218fd1cabe52bdf1cda34613e9e.png);background-size:1200px 1200px;',
    'background-repeat:repeat;opacity:.1;pointer-events:none;animation:bbBgScroll 40s linear infinite;z-index:-1;}',
    '@keyframes bbBgScroll{from{background-position:0 0}to{background-position:1200px 1200px}}',
    '.menu-btn{position:fixed;top:18px;left:18px;width:48px;height:48px;border:none;border-radius:12px;',
    'background:rgba(255,255,255,.2);cursor:pointer;z-index:900;display:flex;align-items:center;justify-content:center;}',
    '.menu-btn:hover{background:rgb(154,73,170)}.menu-btn img{width:28px;height:28px}',
    '#sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:700;opacity:0}',
    '#sidebar-overlay.open{display:block;opacity:1;pointer-events:auto}',
    '#sidebar{position:fixed;top:0;left:0;width:220px;height:100%;background:rgb(154,73,170);color:#fff;z-index:800;',
    'transform:translateX(-100%);transition:transform .2s;display:flex;flex-direction:column;justify-content:space-between;',
    'padding:20px 10px 20px 0;box-shadow:inset -10px 0 rgba(0,0,0,.15)}',
    '#sidebar.open{transform:translateX(0)}',
    '.sidebar-logo{font-family:"Titan One",cursive;font-size:22px;padding:0 16px 16px;color:#fff;text-shadow:2px 2px rgba(0,0,0,.2)}',
    '.sidebar-list{list-style:none;margin:0;padding:0}',
    '.sidebar-link{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:none;background:transparent;',
    'color:#fff;font-family:Nunito,sans-serif;font-weight:800;font-size:15px;cursor:pointer;text-decoration:none;border-radius:0 10px 10px 0}',
    '.sidebar-link:hover,.sidebar-link.active{background:rgba(0,0,0,.2)}',
    '.sidebar-listIcon{width:24px;text-align:center;font-size:18px}',
    '.sidebar-footer{padding:12px 16px}.sidebar-footer-icons{list-style:none;display:flex;gap:8px;margin:0;padding:0}',
    '.sidebar-foot-btn{width:40px;height:40px;border:none;border-radius:10px;background:rgba(255,255,255,.15);color:#fff;',
    'cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;text-decoration:none}',
    '.sidebar-foot-btn:hover{background:rgba(255,255,255,.3)}',
    '.top-bar{padding-left:56px!important}',
    /* FULL SCREEN opening */
    '.opening-screen{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;',
    'min-width:100vw!important;min-height:100vh!important;z-index:2000!important;background:rgb(29,4,34)!important;overflow:hidden!important}',
    '.opening-squares{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;',
    'display:grid!important;grid-template-columns:repeat(7,1fr)!important;grid-template-rows:repeat(7,1fr)!important;',
    'flex-wrap:unset!important;transform:none!important;top:0!important;left:0!important;background-color:rgb(29,4,34)}',
    '.opening-square{width:100%!important;height:100%!important;transform:scale(.88)!important;flex-shrink:1!important;min-width:0!important;min-height:0!important}',
    '.opening-square-inner{border-radius:clamp(8px,1.2vw,20px)!important}',
    '.opening-square-content .counter-text{font-size:clamp(24px,4vw,52px)!important}',
    '.opening-square-content img{width:clamp(36px,5vw,72px)!important;height:clamp(36px,5vw,72px)!important}'
  ].join('');
  document.head.appendChild(css);

  function ensureChrome() {
    if (document.getElementById('sidebar')) return;
    if (!document.querySelector('.background')) {
      var bg = document.createElement('div');
      bg.className = 'background';
      bg.innerHTML = '<div class="bgBlooks"></div>';
      document.body.insertBefore(bg, document.body.firstChild);
    }
    var btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.id = 'menuBtn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<img src="https://hippowatermelon.github.io/blooket4free/assets/misc_images/borgor.svg" alt="Menu">';
    document.body.appendChild(btn);

    var ov = document.createElement('div');
    ov.id = 'sidebar-overlay';
    document.body.appendChild(ov);

    var nav = document.createElement('nav');
    nav.id = 'sidebar';
    nav.innerHTML =
      '<div><div class="sidebar-logo">Blookbase</div><ul class="sidebar-list">' +
      '<li><a class="sidebar-link" href="/"><span class="sidebar-listIcon"><i class="fas fa-home"></i></span><span class="sidebar-text">Home</span></a></li>' +
      '<li><a class="sidebar-link" href="/countdown"><span class="sidebar-listIcon"><i class="fas fa-hourglass-half"></i></span><span class="sidebar-text">Countdown</span></a></li>' +
      '<li><a class="sidebar-link" href="/whatsnew"><span class="sidebar-listIcon"><i class="fas fa-star"></i></span><span class="sidebar-text">What\'s New</span></a></li>' +
      '<li><a class="sidebar-link" href="/videos"><span class="sidebar-listIcon"><i class="fas fa-play"></i></span><span class="sidebar-text">Videos</span></a></li>' +
      '<li><a class="sidebar-link" href="/gamemodes"><span class="sidebar-listIcon"><i class="fas fa-gamepad"></i></span><span class="sidebar-text">Gamemodes</span></a></li>' +
      '<li><a class="sidebar-link" href="/banners"><span class="sidebar-listIcon"><i class="fas fa-image"></i></span><span class="sidebar-text">Banners</span></a></li>' +
      '<li><a class="sidebar-link" href="/market"><span class="sidebar-listIcon"><i class="fas fa-store"></i></span><span class="sidebar-text">Packs</span></a></li>' +
      '<li><a class="sidebar-link" href="/calculator"><span class="sidebar-listIcon"><i class="fas fa-calculator"></i></span><span class="sidebar-text">Calculator</span></a></li>' +
      '<li><a class="sidebar-link active" href="/packsim"><span class="sidebar-listIcon"><i class="fas fa-box-open"></i></span><span class="sidebar-text">Pack Sim</span></a></li>' +
      '</ul></div>' +
      '<div class="sidebar-footer"><ul class="sidebar-footer-icons">' +
      '<li><a class="sidebar-foot-btn" href="/updates" title="Updates"><i class="fas fa-newspaper"></i></a></li>' +
      '<li><a class="sidebar-foot-btn" href="/about" title="About"><i class="fas fa-circle-info"></i></a></li>' +
      '<li><a class="sidebar-foot-btn" href="/settings" title="Settings"><i class="fas fa-gear"></i></a></li>' +
      '</ul></div>';
    document.body.appendChild(nav);

    function openSb(){ nav.classList.add('open'); ov.classList.add('open'); ov.style.display='block'; }
    function closeSb(){ nav.classList.remove('open'); ov.classList.remove('open'); ov.style.display='none'; }
    btn.addEventListener('click', function(){ if(nav.classList.contains('open')) closeSb(); else openSb(); });
    ov.addEventListener('click', closeSb);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureChrome);
  else ensureChrome();
})();
