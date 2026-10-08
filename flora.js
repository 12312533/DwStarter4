'use strict';
/* =========================================================
   flora.js — bunga 3D berlapis, kertas sobek, bingkai foto,
   kelopak jatuh. Tidak berisi logika aplikasi.
   ========================================================= */

const Flora = (() => {
  // Palet lembut [gelap, sedang, terang, pucat]
  const PAL = [
    ['#9c4a5a','#c98592','#e8bcc3','#f8e4e4'],   // dusty rose
    ['#a9693f','#d09a72','#ecc9a8','#faeddc'],   // peach
    ['#a89873','#d2c4a0','#ece3cc','#fbf7ea'],   // ivory
    ['#9a7424','#c9a24a','#e8d18e','#f7edc8']    // champagne
  ];
  const TONES = [[1,2,3],[0,1,2],[0,1,2],[0,0,1]];   // warna tiap lingkar kelopak
  const COUNT = [7,7,6,5], SCALE = [1,.8,.6,.4];
  const PETAL = 'M50 52C22 46 14 18 34 6C42 1 47 4 50 8C53 4 58 1 66 6C86 18 78 46 50 52Z';
  const VEINS = 'M50 50C50 36 50 22 50 11M50 48C40 40 32 30 30 20M50 48C60 40 68 30 70 20M50 50C42 46 36 40 34 33M50 50C58 46 64 40 66 33';

  /* ---------- definisi gradien & kelopak ---------- */
  function defs(){
    let g = '<linearGradient id="fs-bs" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a0f10" stop-opacity=".55"/><stop offset=".6" stop-color="#2a0f10" stop-opacity="0"/></linearGradient>'
      + '<radialGradient id="fs-sh" cx=".35" cy=".3" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
      + '<radialGradient id="fs-cg"><stop offset="0" stop-color="#4a2c00"/><stop offset="1" stop-color="#b98a2c"/></radialGradient>'
      + '<linearGradient id="fs-la" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3b6a49"/><stop offset="1" stop-color="#a3c48a"/></linearGradient>'
      + '<linearGradient id="fs-lb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#25503a"/><stop offset="1" stop-color="#6f9a62"/></linearGradient>';
    PAL.forEach((c, p) => TONES.forEach((t, r) => {
      g += `<linearGradient id="fg${p}${r}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c[t[0]]}"/><stop offset=".55" stop-color="${c[t[1]]}"/><stop offset="1" stop-color="${c[t[2]]}"/></linearGradient>`
         + `<g id="fp${p}${r}"><path d="${PETAL}" fill="url(#fg${p}${r})"/><path d="${PETAL}" fill="url(#fs-bs)"/><path d="${PETAL}" fill="url(#fs-sh)"/>`
         + `<path d="${VEINS}" fill="none" stroke="${c[0]}" stroke-opacity=".3" stroke-width=".5"/><path d="${PETAL}" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".6"/></g>`;
    }));
    document.body.insertAdjacentHTML('afterbegin',
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${g}</defs></svg>`);
  }

  /* ---------- bagian bunga ---------- */
  function ring(p, r){
    const n = COUNT[r], s = SCALE[r], off = r * (180 / n) + rnd(0, 20);
    let o = '';
    for(let i = 0; i < n; i++){
      const a = off + i * 360 / n + rnd(-6, 6), k = s * rnd(.93, 1.07), kx = k * rnd(.92, 1.05);
      o += `<use href="#fp${p}${r}" transform="rotate(${a.toFixed(1)} 50 50) translate(50 50) scale(${kx.toFixed(2)} ${k.toFixed(2)}) translate(-50 -50)"/>`;
    }
    return o;
  }
  function center(n = 26){
    let s = '<circle cx="50" cy="50" r="9" fill="url(#fs-cg)"/>';
    for(let i = 0; i < n; i++){
      const a = rnd(0, 6.283), l = rnd(5, 15), x = 50 + Math.cos(a) * l, y = 50 + Math.sin(a) * l;
      s += `<path d="M50 50L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#c9a24a" stroke-width=".5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1" fill="${i % 3 ? '#e0b43c' : '#8a5b10'}"/>`;
    }
    return s + '<circle cx="50" cy="50" r="3.2" fill="#9db06a"/>';
  }
  const layer = (z, c) => `<svg class="ly" viewBox="0 0 100 100" style="--l:${z}" aria-hidden="true">${c}</svg>`;

  /** Bunga bertingkat: tiap lingkar kelopak berada di kedalaman Z berbeda. */
  const body = (p, hi) => '<div class="fb">' + (hi
    ? layer(0, ring(p,0)) + layer(8, ring(p,1)) + layer(16, ring(p,2)) + layer(24, ring(p,3)) + layer(34, center(26))
    : layer(0, ring(p,0)) + layer(7, ring(p,1)) + layer(15, ring(p,2) + ring(p,3)) + layer(24, center(14))) + '</div>';

  const leaf = () => layer(0,
    '<path d="M50 98C10 74 6 26 50 2Z" fill="url(#fs-la)"/><path d="M50 98C90 74 94 26 50 2Z" fill="url(#fs-lb)"/>'
    + '<path d="M50 60L26 44M50 44L30 28M50 76L22 62M50 60L74 44M50 44L70 28M50 76L78 62" stroke="#fff" stroke-opacity=".28" stroke-width="1" fill="none"/>'
    + '<path d="M50 96V6" stroke="#fff" stroke-opacity=".5" stroke-width="1.3"/>');

  /** Bunga datar (untuk placeholder foto galeri). */
  const flat = p => ring(p,0) + ring(p,1) + ring(p,2) + ring(p,3) + center(20);

  /* ---------- rumpun di sudut ---------- */
  // [tipe, x, y, ukuran, rotasi, z, delay, palet]
  const HI = [['l',-10,40,150,35,-30],['l',70,-20,140,80,-20],['l',-30,-10,130,0,-40],['l',120,60,110,50,10],['l',20,150,120,160,-20],
    ['f',5,5,150,0,40,0,0],['f',135,-5,105,20,60,.6,1],['f',-8,140,110,-15,50,1.2,2],['f',110,115,95,30,70,.3,3],['f',190,50,62,0,85,.9,0],['f',58,205,62,10,85,1.5,1]];
  const LO = [['l',-10,40,130,35,-30],['l',80,-10,120,80,-20],['l',20,130,100,150,-25],
    ['f',8,8,150,0,40,0,0],['f',135,0,100,20,60,.6,1],['f',-5,140,100,-15,50,1.2,2],['f',105,112,70,30,70,.4,3]];

  function cluster(pos, sc, k, hi){
    const d = document.createElement('div');
    d.className = 'cl ' + pos;
    d.style.setProperty('--sc', sc.toFixed(3));
    d.style.setProperty('--k', k);
    d.innerHTML = (hi ? HI : LO).map(([t, x, y, s, r, z, dl, p]) =>
      `<i class="${t === 'l' ? 'lf' : 'fl'}" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;--u:${s/100};--r:${r}deg;--z:${z}px;--tx:${t === 'l' ? 20 : Math.round(rnd(30,52))}deg;--d:${dl || 0}s">`
      + (t === 'l' ? '<div class="fb">' + leaf() + '</div>' : body(p, hi)) + '</i>').join('');
    return d;
  }

  function decorate(){
    const w = innerWidth;
    $$('.sec[data-deco]').forEach(s => {
      const d = document.createElement('div');
      d.className = 'deco'; d.dataset.deco = s.dataset.deco;
      s.removeAttribute('data-deco'); s.prepend(d);
    });
    $$('.deco[data-deco]').forEach(d => {
      const hi = d.hasAttribute('data-hi');
      const sc = hi ? clamp(w / 700, .8, 1.4) : clamp(w / 700, .8, 1.05);
      d.dataset.deco.split(',').forEach(pos => d.appendChild(cluster(pos, sc, hi ? 24 : 12, hi)));
    });
  }

  /* ---------- kertas sobek ---------- */
  const torn = (top, bot) => {
    const a = [], b = [];
    let x = 0;
    while(x < 100){ a.push(`${x.toFixed(1)}% ${(Math.random() * top).toFixed(1)}px`); x += 1.6 + Math.random() * 2.4; }
    a.push(`100% ${(Math.random() * top).toFixed(1)}px`);
    x = 100;
    while(x > 0){ b.push(`${x.toFixed(1)}% calc(100% - ${(Math.random() * bot).toFixed(1)}px)`); x -= 1.6 + Math.random() * 2.4; }
    b.push(`0% calc(100% - ${(Math.random() * bot).toFixed(1)}px)`);
    return `polygon(${a.join(',')},${b.join(',')})`;
  };
  const TONE = ['#fbf4e2','#f8eed7','#faf1de'];
  function paper(){
    $$('.sec').forEach((s, i) => {
      const w = document.createElement('div');
      w.className = 'sheet'; w.setAttribute('aria-hidden', 'true');
      w.innerHTML = '<i class="edge"></i><i class="paper"></i>';
      const [e, p] = w.children;
      e.style.clipPath = torn(12, 12);
      p.style.clipPath = torn(9, 9);
      p.style.setProperty('--tone', TONE[i % 3]);
      s.prepend(w);
    });
  }

  /* ---------- bunga di bingkai foto ---------- */
  // [tipe, x, y, ukuran, palet atau rotasi]
  const FRAME = [['f',58,-34,74,0],['f',-30,150,62,1],['f',156,178,62,3],['l',-30,205,58,-25],['l',156,-8,54,40]];
  function frames(){
    $$('[data-frame]').forEach((f, k) => {
      f.classList.add('frame');
      FRAME.forEach(([t, x, y, s, v], i) => {
        const d = document.createElement('i');
        d.className = 'fo';
        d.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;--u:${s/100};--tx:38deg;--d:${(k * .7 + i * .4).toFixed(1)}s;transform:rotate(${t === 'l' ? v : 0}deg)`;
        d.innerHTML = t === 'l' ? '<div class="fb">' + leaf() + '</div>' : body((v + k) % 4, false);
        f.appendChild(d);
      });
    });
  }

  /* ---------- kelopak jatuh ---------- */
  function petals(box, n){
    if(reduce) return;
    n = innerWidth < 600 ? Math.round(n * .6) : n;
    for(let i = 0; i < n; i++){
      const el = document.createElement('div'), s = 22 + Math.random() * 28;
      el.className = 'pt';
      el.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;animation-duration:${(11 + Math.random() * 10).toFixed(1)}s;animation-delay:${(-Math.random() * 18).toFixed(1)}s;--dx:${((Math.random() - .5) * 220).toFixed(0)}px;--dz:${(Math.random() * 280 - 100).toFixed(0)}px`;
      el.innerHTML = `<svg viewBox="10 0 80 56" aria-hidden="true"><use href="#fp${i % 4}1"/></svg>`;
      el.firstChild.style.animationDuration = (2 + Math.random() * 3).toFixed(1) + 's';
      box.appendChild(el);
    }
  }

  function init(){ defs(); decorate(); paper(); frames(); petals($('#petals'), 18); }
  return { init, flat };
})();
