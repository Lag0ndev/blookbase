/* Load leaks/tracker implementation */
(function(){
  if (window.__bbTrackerLoaded) return;
  window.__bbTrackerLoaded = 1;
  var urls = [
    'https://cdn.jsdelivr.net/gh/Lag0ndev/blookbase@172160576d07/bb-leaks-tracker.js',
    'https://raw.githubusercontent.com/Lag0ndev/blookbase/172160576d07/bb-leaks-tracker.js'
  ];
  var i = 0;
  function next(){
    if (i >= urls.length) return;
    var s = document.createElement('script');
    s.src = urls[i++] + '?v=2';
    s.onerror = next;
    document.head.appendChild(s);
  }
  next();
})();
