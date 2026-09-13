fetch('app_part0.js').then(r=>r.text()).then(a=>fetch('app_part1.js').then(r=>r.text()).then(b=>{const s=document.createElement('script');s.textContent=a+b;document.body.appendChild(s);}));
