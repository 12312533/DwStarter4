'use strict';
/* =========================================================
   motion.js — parallax 3D, kemiringan lembar saat gulir,
   muncul saat gulir, tilt kartu, coverflow, flip angka
   ========================================================= */

const Motion = (() => {
  let revealIO = null;

  /** Tandai elemen yang sedang terlihat (.vis) agar animasi berat bisa dijeda. */
  function visibility(){
    const els = $$('.deco,.frame,.tilt,.sec');
    if(!('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('vis')); return; }
    const io = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle('vis', e.isIntersecting)),
      { rootMargin:'200px' }
    );
    els.forEach(e => io.observe(e));
  }

  /** Bunga bergeser mengikuti kursor / kemiringan ponsel. */
  function parallax(){
    if(reduce) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      $$('.deco.vis').forEach(d => { d.style.setProperty('--mx', cx.toFixed(3)); d.style.setProperty('--my', cy.toFixed(3)); });
      raf = (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) ? requestAnimationFrame(step) : 0;
    };
    const kick = () => { if(!raf) raf = requestAnimationFrame(step); };
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; kick(); }, { passive:true });
    addEventListener('deviceorientation', e => {
      if(e.gamma == null || e.beta == null) return;
      tx = clamp(e.gamma / 25, -1, 1); ty = clamp((e.beta - 45) / 25, -1, 1); kick();
    }, { passive:true });
  }

  /** Kedalaman bunga & kemiringan lembar kertas menurut posisi gulir, plus garis timeline. */
  function scroll(){
    const tl = $('#timeline');
    let t = false;
    const run = () => {
      t = false;
      const vh = innerHeight;
      $$('.deco.vis').forEach(d => {
        const r = d.getBoundingClientRect();
        d.style.setProperty('--p', clamp((r.top + r.height / 2 - vh / 2) / vh, -1.5, 1.5).toFixed(3));
      });
      if(!reduce) $$('.sec.vis').forEach(s => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--sr', clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1).toFixed(3));
      });
      if(tl){
        const r = tl.getBoundingClientRect();
        tl.style.setProperty('--lp', clamp((vh * .75 - r.top) / Math.max(r.height, 1), 0, 1).toFixed(3));
      }
    };
    addEventListener('scroll', () => { if(!t){ t = true; requestAnimationFrame(run); } }, { passive:true });
    addEventListener('resize', run, { passive:true });
    run();
  }

  /** Efek muncul saat gulir. */
  function prepareReveal(){
    $$('[data-a]').forEach(el => {
      const sib = [...el.parentNode.children].filter(c => c.hasAttribute('data-a'));
      el.style.setProperty('--i', sib.indexOf(el));
    });
  }
  function startReveal(){
    const show = el => {
      el.classList.add('in');
      if(el.classList.contains('tilt')) setTimeout(() => el.classList.add('done'), 1400);
    };
    if(!('IntersectionObserver' in window)){ $$('[data-a]').forEach(show); return; }
    revealIO = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting){ show(e.target); revealIO.unobserve(e.target); }
    }), { threshold:.15, rootMargin:'0px 0px -6% 0px' });
    $$('[data-a]').forEach(el => revealIO.observe(el));
  }

  /** Kartu miring 3D mengikuti kursor (mouse). */
  function tilt(){
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        if(e.pointerType === 'touch' || !c.classList.contains('done')) return;
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(800px) rotateY(${(x * 16).toFixed(2)}deg) rotateX(${(-y * 16).toFixed(2)}deg) translateZ(12px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /** Galeri coverflow 3D. */
  function coverflow(root, prev, next){
    const its = [...root.children], n = its.length;
    if(!n) return;
    let cur = 0, timer = 0, sx = null;
    const draw = () => its.forEach((it, i) => {
      let o = i - cur;
      if(o > n / 2) o -= n;
      if(o < -n / 2) o += n;
      const a = Math.abs(o);
      it.style.transform = `translateX(${o * 58}%) translateZ(${-a * 150}px) rotateY(${-o * 40}deg) scale(${1 - a * .06})`;
      it.style.opacity = a > 2 ? 0 : 1;
      it.style.zIndex = 10 - a;
      it.style.filter = a ? `brightness(${1 - a * .15}) saturate(.85)` : 'none';
      it.style.pointerEvents = a > 2 ? 'none' : 'auto';
      it.setAttribute('aria-hidden', a ? 'true' : 'false');
    });
    const auto = () => { clearTimeout(timer); if(!reduce) timer = setTimeout(() => go(cur + 1), 4500); };
    const go = k => { cur = (k % n + n) % n; draw(); auto(); };
    its.forEach((it, i) => it.addEventListener('click', () => go(i)));
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    root.addEventListener('keydown', e => {
      if(e.key === 'ArrowLeft'){ e.preventDefault(); go(cur - 1); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); go(cur + 1); }
    });
    root.addEventListener('pointerdown', e => { sx = e.clientX; });
    root.addEventListener('pointerup', e => {
      if(sx != null && Math.abs(e.clientX - sx) > 40) go(cur + (e.clientX < sx ? 1 : -1));
      sx = null;
    });
    draw(); auto();
  }

  /** Ubah angka hitung mundur dengan animasi flip. */
  function num(el, v){
    if(el.textContent === v) return;
    el.textContent = v;
    el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
  }

  function init(){
    prepareReveal(); visibility(); parallax(); scroll(); tilt();
    coverflow($('#cf'), $('#cfPrev'), $('#cfNext'));
  }
  return { init, startReveal, num };
})();
