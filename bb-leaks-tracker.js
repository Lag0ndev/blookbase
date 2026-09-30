/* Load known-good bb-leaks-tracker from commit 172160576d07 */
(function(){
  var u='https://cdn.jsdelivr.net/gh/Lag0ndev/blookbase@172160576d07/bb-leaks-tracker.js';
  var s=document.createElement('script');
  s.src=u;
  s.onerror=function(){
    var x=new XMLHttpRequest();
    x.open('GET','https://raw.githubusercontent.com/Lag0ndev/blookbase/172160576d07/bb-leaks-tracker.js',true);
    x.onload=function(){try{(0,eval)(x.responseText);}catch(e){console.error(e);}};
    x.send();
  };
  document.head.appendChild(s);
})();
