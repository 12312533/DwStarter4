'use strict';
/* =========================================================
   app.js — konten dinamis, buka undangan, musik, hitung mundur,
   kalender, peta, salin, RSVP, buku tamu
   ========================================================= */

const App = (() => {
  const pad = n => String(n).padStart(2, '0');
  const START = new Date(CONFIG.start), END = new Date(CONFIG.end);
  let opened = false, audio = null;

  /** Gambar placeholder galeri bila foto belum diisi. */
  const ART = [['#f3e6c4','#e2c9a0'],['#f2dcd8','#e1b9bb'],['#e3e6cf','#c3cda8'],['#f6ecd2','#dcc58e']];
  const artHTML = i => `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Foto ${i + 1}">
      <defs><linearGradient id="ga${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ART[i % 4][0]}"/><stop offset="1" stop-color="${ART[i % 4][1]}"/></linearGradient></defs>
      <rect width="300" height="400" fill="url(#ga${i})"/>
      <g transform="translate(55 105) scale(1.9)">${Flora.flat(i % 4)}</g>
      <text x="150" y="362" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="20" letter-spacing="5" fill="#7a5712">FOTO ${i + 1}</text></svg>`;

  /* ---------- konten dinamis ---------- */
  function loadPhotos(){
    $$('[data-photo]').forEach(ph => {
      const key = ph.dataset.photo, src = CONFIG.photos[key];
      if(!src) return;
      const img = new Image();
      img.alt = key === 'bride' ? 'wanita.jpg' : 'pria.jpg';
      img.decoding = 'async';
      img.onload  = () => ph.replaceChildren(img);
      img.onerror = () => console.warn(`[Undangan] Foto "${src}" tidak ditemukan. Pastikan nama file dan lokasinya benar.`);
      img.src = src;
    });
  }

  function buildContent(){
    // nama tamu: index.html?to=Budi
    const to = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 60);
    if(to){ $('#guestName').textContent = to; $('#rsNama').value = to; $('#wsNama').value = to; }

    loadPhotos();

    // kartu acara
    $('#events').innerHTML = CONFIG.venues.map((v, i) => `
      <article class="card tilt" data-a="${i % 2 ? 'right' : 'left'}">
        <span class="medal"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-${esc(v.icon)}"/></svg></span>
        <h3>${esc(v.title)}</h3>
        <ul class="meta">
          <li><svg class="ico" aria-hidden="true"><use href="#i-calendar"/></svg><span>${esc(v.date)}</span></li>
          <li><svg class="ico" aria-hidden="true"><use href="#i-clock"/></svg><span>${esc(v.time)}</span></li>
          <li><svg class="ico" aria-hidden="true"><use href="#i-pin"/></svg><span><b>${esc(v.name)}</b><br>${esc(v.address)}</span></li>
        </ul>
        <a class="btn ghost" href="${mapsUrl(v.query)}" target="_blank" rel="noopener">Lihat Lokasi</a>
      </article>`).join('');

    // live streaming
    if(CONFIG.liveUrl) $('#liveRow').innerHTML = `<a class="btn pulse" href="${esc(CONFIG.liveUrl)}" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-broadcast"/></svg>Saksikan Live Streaming</a>`;
    else $('#liveRow').remove();

    // tab peta
    $('#mapTabs').innerHTML = CONFIG.venues.map((v, i) =>
      `<button class="tab" type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(v.title)}</button>`).join('');

    // galeri (foto asli atau placeholder; bila foto gagal dimuat → placeholder)
    const items = CONFIG.gallery.length ? CONFIG.gallery : ['', '', '', ''];
    $('#cf').innerHTML = items.map((src, i) => `<div class="it">${src ? `<img src="${esc(src)}" alt="Galeri ${i + 1}">` : artHTML(i)}</div>`).join('');
    $$('#cf .it img').forEach((img, i) => img.addEventListener('error', () => { img.parentElement.innerHTML = artHTML(i); }));

    // video
    if(CONFIG.video){
      const box = $('#videoBox');
      box.hidden = false;
      box.innerHTML = `<iframe loading="lazy" title="Video prewedding" src="${esc(CONFIG.video)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    } else $('#videoBox').remove();

    // amplop digital
    const giftHTML = g => {
      if(g.type === 'bank') return `<article class="card tilt" data-a="up"><span class="medal"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-bank"/></svg></span><h3>${esc(g.bank)}</h3><p class="rek">${esc(g.number)}</p><p>a.n. ${esc(g.holder)}</p><button class="btn" type="button" data-copy="${esc(g.number)}">Salin Nomor</button></article>`;
      if(g.type === 'qris' && g.image) return `<article class="card tilt" data-a="up"><span class="medal"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-envelope"/></svg></span><h3>QRIS</h3><div class="qr"><img src="${esc(g.image)}" alt="Kode QRIS"></div><p class="addr">Pindai dengan aplikasi bank atau e-wallet</p></article>`;
      if(g.type === 'address') return `<article class="card tilt" data-a="up"><span class="medal"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-gift"/></svg></span><h3>Kirim Kado</h3><p>${esc(g.recipient || '')}</p><p>${esc(g.text)}</p><button class="btn" type="button" data-copy="${esc(g.text)}">Salin Alamat</button></article>`;
      return '';
    };
    $('#gifts').innerHTML = CONFIG.gifts.map(giftHTML).join('');
  }

  /* ---------- peta ---------- */
  function bindMap(){
    const frame = $('#mapFrame'), tabs = $$('#mapTabs .tab');
    const show = i => {
      const v = CONFIG.venues[i];
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
      frame.src = `https://www.google.com/maps?q=${encodeURIComponent(v.query)}&output=embed`;
      $('#mapAddr').innerHTML = `<b>${esc(v.name)}</b><br>${esc(v.address)}`;
      $('#gmaps').href = mapsUrl(v.query);
      $('#waze').href = wazeUrl(v.query);
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
    show(0);
  }

  /* ---------- hitung mundur & kalender ---------- */
  function bindCountdown(){
    const els = { d:$('#cdD'), h:$('#cdH'), m:$('#cdM'), s:$('#cdS') };
    let timer = 0;
    const tick = () => {
      const t = Math.max(0, START - Date.now()) / 1000;
      Motion.num(els.d, String(Math.floor(t / 86400)));
      Motion.num(els.h, pad(Math.floor(t % 86400 / 3600)));
      Motion.num(els.m, pad(Math.floor(t % 3600 / 60)));
      Motion.num(els.s, pad(Math.floor(t % 60)));
      if(t <= 0){
        clearInterval(timer);
        const n = $('#cdNote'); n.hidden = false;
        n.textContent = Date.now() < END ? 'Hari bahagia kami sedang berlangsung.' : 'Terima kasih telah menjadi bagian dari hari bahagia kami.';
      }
    };
    tick(); timer = setInterval(tick, 1000);

    const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const place  = CONFIG.venues.map(v => `${v.name}, ${v.address}`).join(' / ');
    const detail = CONFIG.venues.map(v => `${v.title}: ${v.time}, ${v.name}`).join('\n');
    $('#gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent(CONFIG.title)}&dates=${fmt(START)}/${fmt(END)}`
      + `&details=${encodeURIComponent(detail)}&location=${encodeURIComponent(CONFIG.venues[0].name + ', ' + CONFIG.venues[0].address)}`;

    $('#icsBtn').addEventListener('click', () => {
      const e = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
      const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Undangan Pernikahan//ID','BEGIN:VEVENT',
        `UID:${fmt(START)}@undangan`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(START)}`,`DTEND:${fmt(END)}`,
        `SUMMARY:${e(CONFIG.title)}`,`LOCATION:${e(place)}`,`DESCRIPTION:${e(detail)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type:'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'pernikahan-adilah-wafie.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
  }

  /* ---------- salin ---------- */
  function bindCopy(){
    document.addEventListener('click', async e => {
      const b = e.target.closest('[data-copy]');
      if(!b) return;
      const txt = b.dataset.copy, old = b.textContent;
      try{ await navigator.clipboard.writeText(txt); }
      catch{
        const t = document.createElement('textarea');
        t.value = txt; t.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(t); t.select();
        try{ document.execCommand('copy'); }catch{ /* abaikan */ }
        t.remove();
      }
      b.textContent = 'Tersalin';
      setTimeout(() => { b.textContent = old; }, 1800);
    });
  }

  /* ---------- RSVP ---------- */
  function bindRSVP(){
    $('#rsvpForm').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, d = Object.fromEntries(new FormData(f));
      d.nama = d.nama.trim();
      if(!d.nama || !d.status) return;
      const list = store.get('rsvp', []); list.push({ ...d, t:new Date().toISOString() }); store.set('rsvp', list);
      post('rsvp', d);
      const note = $('#rsvpNote');
      note.textContent = `Terima kasih, ${d.nama}. Konfirmasi "${d.status}" (${d.jumlah} orang) telah tercatat.`;
      if(CONFIG.whatsapp){
        const msg = `Assalamu'alaikum, saya ${d.nama} mengonfirmasi kehadiran: ${d.status} (${d.jumlah} orang) pada pernikahan Adilah & Wafie.`;
        const a = document.createElement('a');
        a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
        a.target = '_blank'; a.rel = 'noopener'; a.textContent = ' Kirim juga via WhatsApp';
        note.appendChild(a);
      }
      const keep = $('#rsNama').value; f.reset(); $('#rsNama').value = keep;
    });
  }

  /* ---------- buku tamu ---------- */
  function bindWishes(){
    const cols = ['#d9a0a8','#e2b47a','#a9c29b','#b9a6d6','#e0c36c'];
    let wishes = store.get('wishes', [{ nama:'Keluarga Besar', pesan:'Selamat menempuh hidup baru, semoga sakinah, mawaddah, warahmah.', t:'Baru saja' }]);
    const render = () => {
      $('#wishList').innerHTML = wishes.map(w => `
        <div class="wish"><div class="av" style="background:${cols[w.nama.length % cols.length]}">${esc((w.nama[0] || '?').toUpperCase())}</div>
        <div><b>${esc(w.nama)}</b><p>${esc(w.pesan)}</p><small>${esc(w.t)}</small></div></div>`).join('');
    };
    render();
    $('#wishForm').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, d = Object.fromEntries(new FormData(f));
      d.nama = d.nama.trim(); d.pesan = d.pesan.trim();
      if(!d.nama || !d.pesan) return;
      d.t = new Date().toLocaleString('id-ID');
      wishes.unshift(d); wishes = wishes.slice(0, 50);
      store.set('wishes', wishes); post('wish', d); render();
      const keep = $('#wsNama').value; f.reset(); $('#wsNama').value = keep;
    });
  }

  /* ---------- navigasi bawah ---------- */
  function bindDock(){
    const links = $$('#dock a');
    if(!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin:'-45% 0px -45% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href')); if(s) io.observe(s); });
  }

  /* ---------- buka undangan & musik ---------- */
  function bindOpen(){
    if('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const mbtn = $('#musicBtn');
    if(CONFIG.music){
      audio = new Audio(CONFIG.music); audio.loop = true; audio.preload = 'none';
      audio.addEventListener('error', () => { mbtn.classList.remove('show'); audio = null; });
    }
    mbtn.addEventListener('click', () => {
      if(!audio) return;
      if(audio.paused){ audio.play().then(() => mbtn.classList.add('on')).catch(() => {}); }
      else{ audio.pause(); mbtn.classList.remove('on'); }
    });
    $('#openBtn').addEventListener('click', () => {
      if(opened) return;
      opened = true;
      const cover = $('#cover');
      cover.classList.add('open');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      $('#dock').classList.add('show');
      if(audio){
        mbtn.classList.add('show');
        audio.play().then(() => mbtn.classList.add('on')).catch(() => {});
      }
      setTimeout(Motion.startReveal, 700);
      setTimeout(() => cover.classList.add('gone'), 2700);
    });
  }

  function build(){ buildContent(); }
  function bind(){ bindMap(); bindCountdown(); bindCopy(); bindRSVP(); bindWishes(); bindDock(); bindOpen(); }
  return { build, bind };
})();

/* =========================================================
   INISIALISASI (urutan penting)
   ========================================================= */
App.build();     // 1. isi konten dinamis (acara, galeri, amplop, foto)
Flora.init();    // 2. bunga 3D, kertas, bingkai, kelopak
Motion.init();   // 3. animasi (setelah semua elemen ada)
App.bind();      // 4. interaksi
