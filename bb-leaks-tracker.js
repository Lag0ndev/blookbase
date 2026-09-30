/* bb-leaks-tracker sequential loader */
(function(){
  var n=4, code='', i=0;
  function next(){
    if(i>=n){ var s=document.createElement('script'); s.textContent=code; document.body.appendChild(s); return; }
    fetch('/bb_part_'+i+'.js').then(r=>r.text()).then(t=>{ code+=t; i++; next(); });
  }
  next();
})();
