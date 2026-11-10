/* 200Block — immersive city block edition */
(() => {
  const yt = id => `https://www.youtube.com/watch?v=${id}`;

  const topFilms = [
    { id: '_dNWN_3M0EE', title: 'Half A Tune | The 200block Batman Halloween Special', views: '662 views', meta: 'Films' },
    { id: 'Bm9wEoHVad8', title: 'Cleaning House (2024)', views: '633 views', meta: 'Films' },
    { id: 'd7dLE78wxBE', title: 'Detention (2024)', views: '512 views', meta: 'Films · Sep 15, 2024' },
    { id: 'DJR1C9In5cw', title: 'FLIP (2026)', views: '416 views', meta: 'Films · Jan 20, 2026' },
    { id: 'czn6bo9s8gA', title: 'Stairs (2024)', views: '246 views', meta: 'Films · Sep 24, 2024' },
    { id: 'BLOXBfl8DqQ', title: 'Again? (2025)', views: '235 views', meta: 'Films · Sep 20, 2025' },
    { id: '8BiW-2un5Xc', title: 'Fateful Shade (2024)', views: '159 views', meta: 'Films · Jan 20, 2025' }
  ];
  const archive = [
    { id: '193TXI7meKE', title: 'The Last Collection | A Short Film', views: '8.2K views', meta: 'Short film · 19:09' },
    { id: 'tLvidUu4VGI', title: 'The Last Collection — Trailer', views: '', meta: 'Trailer' },
    ...topFilms
  ];
  const clips = [
    { id: '193TXI7meKE', title: 'The Last Collection', label: 'Opening scene', clip: 'CLIP 0:00–1:00', start: 0, end: 60 },
    { id: '193TXI7meKE', title: 'The Last Collection', label: 'The turn', clip: 'CLIP 10:00–11:00', start: 600, end: 660 },
    { id: '193TXI7meKE', title: 'The Last Collection', label: 'Final scene', clip: 'CLIP 18:00–19:09', start: 1080, end: 1149 },
    { id: '_dNWN_3M0EE', title: 'Half A Tune', label: 'Opening scene', clip: 'CLIP 0:00–1:00', start: 0, end: 60 },
    { id: 'Bm9wEoHVad8', title: 'Cleaning House', label: 'Opening scene', clip: 'CLIP 0:00–1:00', start: 0, end: 60 },
    { id: 'd7dLE78wxBE', title: 'Detention', label: 'Opening scene', clip: 'CLIP 0:00–1:00', start: 0, end: 60 }
  ];

  const brick = (f, i) => `
    <a class="brick gif" data-id="${f.id}" href="${yt(f.id)}" target="_blank" rel="noopener"
       aria-label="${f.title}${f.views ? ' — ' + f.views : ''}">
      <span class="tag"><img loading="lazy" src="https://i.ytimg.com/vi/${f.id}/hqdefault.jpg" alt=""></span>
      <span class="frame">FRAME ${String(i + 1).padStart(2, '0')}</span>
      <span class="meta">${[f.views, f.meta].filter(Boolean).join(' · ')}</span>
      <span class="spray">${f.title}</span><span class="drip"></span>
    </a>`;
  document.getElementById('topWall').innerHTML = topFilms.map(brick).join('');
  document.getElementById('archiveWall').innerHTML = archive.map(brick).join('');

  document.getElementById('clips').innerHTML = clips.map((c, i) => `
    <article class="screen">
      <div class="tube gif" data-id="${c.id}" data-i="${i}">
        <span class="badge">${c.clip}</span>
        <img loading="lazy" src="https://i.ytimg.com/vi/${c.id}/hqdefault.jpg" alt="${c.title} — ${c.label}">
        <button aria-label="Play ${c.title} ${c.label}">▶</button>
      </div>
      <h3>${c.title}</h3>
      <p>${c.label} · <a href="${yt(c.id)}" target="_blank" rel="noopener">Full film ↗</a></p>
    </article>`).join('');
  document.querySelectorAll('.tube').forEach(t => t.querySelector('button').addEventListener('click', () => {
    const c = clips[t.dataset.i];
    t.classList.remove('gif'); stopGif(t);
    t.insertAdjacentHTML('beforeend', `<iframe src="https://www.youtube-nocookie.com/embed/${c.id}?start=${c.start}&end=${c.end}&autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${c.title} — ${c.label}"></iframe>`);
  }));

  /* Hover = GIF: flipbook through YouTube's auto-generated frames */
  const timers = new WeakMap();
  function startGif(el) {
    const img = el.querySelector('img'); if (!img || timers.has(el)) return;
    const id = el.dataset.id, list = ['hq1', 'hq2', 'hq3'].map(f => `https://i.ytimg.com/vi/${id}/${f}.jpg`);
    list.forEach(s => { const p = new Image(); p.src = s; });
    img.dataset.orig = img.dataset.orig || img.src;
    let n = 0;
    timers.set(el, setInterval(() => { img.src = list[n++ % list.length]; }, 260));
    el.classList.add('playing');
  }
  function stopGif(el) {
    const img = el.querySelector('img'); clearInterval(timers.get(el)); timers.delete(el);
    if (img && img.dataset.orig) img.src = img.dataset.orig; el.classList.remove('playing');
  }
  document.addEventListener('pointerover', e => { const g = e.target.closest('.gif'); if (g) startGif(g); });
  document.addEventListener('pointerout', e => { const g = e.target.closest('.gif'); if (g && !g.contains(e.relatedTarget)) stopGif(g); });
  document.addEventListener('focusin', e => { const g = e.target.closest('.gif'); if (g) startGif(g); });
  document.addEventListener('focusout', e => { const g = e.target.closest('.gif'); if (g) stopGif(g); });

  /* Camera */
  const tower = document.getElementById('tower'), cam = document.getElementById('camera');
  const floors = [...document.querySelectorAll('.floor')];
  const order = ['home', 'featured', 'top-films', 'highlights', 'upcoming', 'archive', 'consultations', 'contact'];
  const navLinks = [...document.querySelectorAll('#nav nav a')];
  const floorNum = document.getElementById('floorNum');
  const st = { x: 0, tx: 0, z: -1700, tz: -1700, rx: 12, trx: 12, ry: -12, try: -12, mx: 0, my: 0 };
  const maxX = () => tower.scrollWidth - innerWidth;
  const leftOf = id => { const el = document.getElementById(id); return el.offsetLeft + Math.max(0, (el.offsetWidth - innerWidth) / 2); };
  let tiltT;

  function goto(id, push = true) {
    if (!document.getElementById(id)) return;
    st.tx = Math.max(0, Math.min(maxX(), leftOf(id)));
    st.tz = -850; st.trx = 10; st.try = -18;
    clearTimeout(goto.t);
    goto.t = setTimeout(() => { st.tz = -350; st.trx = 7; st.try = -12; }, 650);
    flash('ACTION');
    if (push) history.replaceState(null, '', '#' + id);
  }
  function flash(word) { const c = document.getElementById('cut'); c.querySelector('span').textContent = word; c.classList.remove('go'); void c.offsetWidth; c.classList.add('go'); }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-floor]'); if (!a) return;
    e.preventDefault();
    if (a.dataset.interest) document.querySelector('select[name=interest]').value = a.dataset.interest;
    goto(a.dataset.floor);
    document.getElementById('nav').classList.remove('open');
  });
  document.querySelector('.burger').addEventListener('click', e => {
    const n = document.getElementById('nav'); n.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', n.classList.contains('open'));
  });

  addEventListener('wheel', e => {
    if (e.target.closest('.reel') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target.closest('textarea,select')) return;
    e.preventDefault();
    st.tx = Math.max(0, Math.min(maxX(), st.tx + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 1.15));
    st.trx = 9 + Math.max(-3, Math.min(5, e.deltaY * .025));
    clearTimeout(tiltT); tiltT = setTimeout(() => st.trx = 7, 180);
  }, { passive: false });
  let tx0 = null;
  addEventListener('touchstart', e => tx0 = e.touches[0].clientX, { passive: true });
  addEventListener('touchmove', e => {
    if (tx0 == null || e.target.closest('.reel')) return;
    const d = tx0 - e.touches[0].clientX; tx0 = e.touches[0].clientX;
    st.tx = Math.max(0, Math.min(maxX(), st.tx + d * 1.5));
  }, { passive: true });
  addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select')) return;
    const i = order.indexOf(current());
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); goto(order[Math.min(order.length - 1, i + 1)]); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goto(order[Math.max(0, i - 1)]); }
  });
  addEventListener('pointermove', e => { st.mx = e.clientX / innerWidth - .5; st.my = e.clientY / innerHeight - .5; window.__pointerX = e.clientX; });
  document.addEventListener('focusin', e => { const f = e.target.closest('.floor'); if (f && f.id !== current()) st.tx = Math.max(0, Math.min(maxX(), leftOf(f.id))); });

  function current() {
    const mid = st.x + innerWidth / 2;
    let best = floors[0];
    for (const f of floors) if (mid >= f.offsetLeft && mid < f.offsetLeft + f.offsetWidth) best = f;
    return best.id;
  }

  addEventListener('load', () => {
    st.x = st.tx = 0;
    const h = location.hash.slice(1);
    setTimeout(() => { st.tz = 0; st.trx = 18; st.try = -30; if (h && h !== 'home') goto(h, false); document.body.classList.remove('intro'); }, 700);
  });
  addEventListener('resize', () => st.tx = Math.min(st.tx, maxX()));

  let last = '';
  (function loop() {
    st.x += (st.tx - st.x) * .075; st.z += (st.tz - st.z) * .045;
    window.__200blockProgress = maxX() > 0 ? st.x / maxX() : 0;
    st.rx += (st.trx - st.rx) * .06; st.ry += (st.try - st.ry) * .04;
    const ry = st.ry + st.mx * 3, rx = st.rx - st.my * 2;
    cam.style.transform = `translate3d(${(-st.x).toFixed(1)}px,0,${st.z.toFixed(1)}px)`;
    tower.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    tower.style.transformOrigin = `${(st.x + innerWidth * .52).toFixed(0)}px 55%`;
    const c = current();
    if (c !== last) {
      last = c;
      navLinks.forEach(a => a.classList.toggle('on', a.dataset.floor === c));
      floorNum.textContent = document.getElementById(c).dataset.label;
      document.body.classList.toggle('away', c !== 'home' && c !== 'featured');
    }
    requestAnimationFrame(loop);
  })();

  /* Night city backdrop */
  const cc = document.getElementById('city'), cx = cc.getContext('2d');
  const cityPhoto = new Image();
  cityPhoto.crossOrigin = 'anonymous';
  cityPhoto.src = 'https://photos.zillowstatic.com/fp/db06a43d1154c51931c3df18aaeda74d-full.webp';
  cityPhoto.onload = city;
  function city() {
    const dpr = devicePixelRatio || 1;
    cc.width = innerWidth * dpr; cc.height = innerHeight * dpr;
    const W = cc.width, H = cc.height;
    if (cityPhoto.complete && cityPhoto.naturalWidth) {
      const scale = Math.max(W / cityPhoto.width, H / cityPhoto.height);
      const iw = cityPhoto.width * scale, ih = cityPhoto.height * scale;
      cx.drawImage(cityPhoto, (W - iw) / 2, (H - ih) / 2, iw, ih);
      const shade = cx.createLinearGradient(0, 0, 0, H);
      shade.addColorStop(0, 'rgba(2,4,8,.5)'); shade.addColorStop(.6, 'rgba(5,4,5,.18)'); shade.addColorStop(1, 'rgba(5,2,2,.5)');
      cx.fillStyle = shade; cx.fillRect(0, 0, W, H);
    } else {
      const g = cx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#04050c'); g.addColorStop(.55, '#0c1022'); g.addColorStop(1, '#2a1424');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 220; i++) { cx.fillStyle = `rgba(255,255,255,${Math.random() * .5})`; cx.fillRect(Math.random() * W, Math.random() * H * .5, 1.2, 1.2); }
    const signs = [];
    [[.45, '#080a12', .35], [.62, '#05060c', .6], [.8, '#020307', 1]].forEach(([base, col, lit], layer) => {
      let x = 0;
      while (x < W) {
        const w = (40 + Math.random() * 120) * dpr * (1 + layer * .4);
        const h = H * (base * .4 + Math.random() * base * .6), y = H - h;
        cx.fillStyle = col; cx.fillRect(x, y, w, h);
        if (Math.random() < .2) cx.fillRect(x + w / 2 - 2, y - 40 * dpr, 4, 40 * dpr);
        for (let wy = y + 10; wy < H; wy += 14 * dpr) for (let wx = x + 6; wx < x + w - 8; wx += 10 * dpr)
          if (Math.random() < .18 * lit) { cx.fillStyle = Math.random() < .8 ? `rgba(255,${190 + Math.random() * 50 | 0},120,${.3 + Math.random() * .6})` : 'rgba(120,220,255,.7)'; cx.fillRect(wx, wy, 4 * dpr, 6 * dpr); }
        if (layer === 2 && Math.random() < .25) signs.push({ x: x + w * .2, y: y + 30, c: Math.random() < .5 ? '#ff3b6b' : '#3ff2ff', t: ['HOTEL', 'BAR', '24H', 'NOODLE', 'CINEMA', 'ラーメン'][Math.random() * 6 | 0] });
        x += w + 2;
      }
    });
    signs.forEach(b => { cx.font = `${16 * dpr}px Monoton`; cx.fillStyle = b.c; cx.shadowColor = b.c; cx.shadowBlur = 20; cx.fillText(b.t, b.x, b.y); cx.shadowBlur = 0; });
  }
  city(); addEventListener('resize', city);

  /* Rain */
  const rc = document.getElementById('rain'), rx2 = rc.getContext('2d');
  let drops = [];
  function sizeRain() { rc.width = innerWidth; rc.height = innerHeight; drops = Array.from({ length: Math.min(420, innerWidth / 3 | 0) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, l: 8 + Math.random() * 18, v: 9 + Math.random() * 10 })); }
  sizeRain(); addEventListener('resize', sizeRain);
  (function rain() {
    rx2.clearRect(0, 0, rc.width, rc.height); rx2.strokeStyle = 'rgba(180,200,230,.35)'; rx2.lineWidth = 1; rx2.beginPath();
    for (const d of drops) { rx2.moveTo(d.x, d.y); rx2.lineTo(d.x - 2, d.y + d.l); d.y += d.v; d.x -= .6; if (d.y > rc.height) { d.y = -20; d.x = Math.random() * rc.width; } }
    rx2.stroke(); requestAnimationFrame(rain);
  })();

  /* Contact form */
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form), msg = form.querySelector('.formMsg');
    if (!d.get('name').trim() || !/^\S+@\S+\.\S+$/.test(d.get('email'))) { msg.textContent = 'Name and a valid email are required.'; return; }
    if (d.getAll('via').includes('Text blasts') && !d.get('phone').trim()) { msg.textContent = 'Text blasts require a phone number.'; return; }
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone')}\nInterested in: ${d.get('interest')}\nSign me up for: ${d.getAll('signup').join(', ')}\nSend updates by: ${d.getAll('via').join(', ')}\n\n${d.get('message')}`;
    const to = form.dataset.to || '';
    location.href = `mailto:${to}?subject=${encodeURIComponent('200Block — ' + d.get('interest'))}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Opening your email app… thanks for reaching out.';
  });
})();
