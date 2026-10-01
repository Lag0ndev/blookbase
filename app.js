/* Blookbase app bootstrap \u2014 load enhancers */
(function () {
  'use strict';
  ['bb-settings-enhance.js', 'bb-leaks-tracker.js', 'bb-weekly-shop.js', 'bb-ui-fixes.js'].forEach(function (src) {
    if (document.querySelector('script[src="' + src + '"],script[src="/' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = '/' + src;
    s.defer = true;
    document.body.appendChild(s);
  });
})();
