(() => {
  // header border on scroll
  const head = document.querySelector('.site-head');
  const onScroll = () => head && head.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (btn && nav) btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Close' : 'Menu';
  });

  // image viewer
  const dlg = document.getElementById('viewer');
  if (dlg) {
    const img = dlg.querySelector('img'), cap = dlg.querySelector('#viewer-cap');
    document.querySelectorAll('[data-full]').forEach(el => el.addEventListener('click', () => {
      img.src = el.dataset.full; img.alt = el.dataset.cap; cap.textContent = el.dataset.cap;
      if (dlg.showModal) dlg.showModal();
    }));
    dlg.querySelector('#viewer-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }

  // copy email
  const copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('yash.agrawal24@vit.edu'); copy.textContent = 'Email copied'; }
    catch (_) { copy.textContent = 'Select the address to copy it'; }
    setTimeout(() => { copy.textContent = 'Copy email'; }, 2500);
  });

  // color-vision plate that spells "YA"
  const cv = document.getElementById('plate');
  if (!cv) return;
  const start = () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  const S = 600; // logical size
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = S * dpr; cv.height = S * dpr; ctx.scale(dpr, dpr);

  // text mask
  const m = document.createElement('canvas'); m.width = S; m.height = S;
  const mx = m.getContext('2d');
  mx.fillStyle = '#000'; mx.textAlign = 'center'; mx.textBaseline = 'middle';
  mx.font = '800 300px "Schibsted Grotesk", Arial, sans-serif';
  mx.font = '800 310px "Schibsted Grotesk", Arial, sans-serif'; mx.lineJoin = 'round'; mx.lineWidth = 10; mx.strokeStyle = '#000'; mx.strokeText('Y A', S / 2, S / 2 + 16); mx.fillText('Y A', S / 2, S / 2 + 16);
  const mask = mx.getImageData(0, 0, S, S).data;
  const inText = (x, y) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return false; return mask[(y * S + x) * 4 + 3] > 120; };

  const fig = ['#E0582F', '#EE7A3B', '#D9442A', '#F29A4A', '#E86A3A', '#C9502C'];
  const bg = ['#8DB25A', '#A9C26A', '#6F9A49', '#B8C978', '#7FA653', '#9BB862', '#C3CF85'];
  const R = S / 2 - 6, cx = S / 2, cy = S / 2;
  const dots = [];
  const cell = 14, cols = Math.ceil(S / cell), grid = new Map();
  const key = (i, j) => i + ',' + j;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let t = 0; t < 90000 && dots.length < 3200; t++) {
    const r = 2.6 + Math.pow(rnd(), 1.6) * 10;
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (R - r);
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    const gi = Math.floor(x / cell), gj = Math.floor(y / cell);
    let ok = true;
    for (let i = gi - 2; i <= gi + 2 && ok; i++) for (let j = gj - 2; j <= gj + 2 && ok; j++) {
      const list = grid.get(key(i, j)); if (!list) continue;
      for (const o of list) { if (Math.hypot(o.x - x, o.y - y) < o.r + r + 1.4) { ok = false; break; } }
    }
    if (!ok) continue;
    const hit = inText(x, y) || inText(x + r * .5, y) || inText(x - r * .5, y);
    const pal = hit ? fig : bg;
    const dot = { x, y, ox: x, oy: y, vx: 0, vy: 0, r, c: pal[Math.floor(rnd() * pal.length)] };
    dots.push(dot);
    const k = key(gi, gj); (grid.get(k) || grid.set(k, []).get(k)).push(dot);
  }

  let px = -999, py = -999, active = false, raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = '#F6F3E8'; ctx.beginPath(); ctx.arc(cx, cy, S / 2, 0, Math.PI * 2); ctx.fill();
    for (const d of dots) { ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
  };
  const step = () => {
    let moving = false;
    for (const d of dots) {
      if (active) {
        const dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy);
        if (dist < 90 && dist > 0.1) { const f = (90 - dist) / 90 * 2.2; d.vx += dx / dist * f; d.vy += dy / dist * f; }
      }
      d.vx += (d.ox - d.x) * 0.06; d.vy += (d.oy - d.y) * 0.06;
      d.vx *= 0.78; d.vy *= 0.78; d.x += d.vx; d.y += d.vy;
      if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02 || Math.abs(d.x - d.ox) > 0.1) moving = true;
    }
    draw();
    raf = (moving || active) ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(step); };
  const pos = e => { const b = cv.getBoundingClientRect(); px = (e.clientX - b.left) / b.width * S; py = (e.clientY - b.top) / b.height * S; };
  cv.addEventListener('pointermove', e => { pos(e); active = true; kick(); });
  cv.addEventListener('pointerleave', () => { active = false; kick(); });
  cv.addEventListener('pointerdown', e => { pos(e); active = true; kick(); });
  cv.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { active = false; kick(); } });

  draw();
  };
  if (document.fonts && document.fonts.load) document.fonts.load('800 300px "Schibsted Grotesk"').then(start, start); else start();
})();
