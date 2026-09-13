(async function() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const r = await fetch('app_part' + i + '.js');
    parts.push(await r.text());
  }
  const s = document.createElement('script');
  s.textContent = parts.join('');
  document.body.appendChild(s);
})();
