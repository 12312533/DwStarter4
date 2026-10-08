'use strict';
/* =========================================================
   utils.js — fungsi bantu yang dipakai semua berkas JS
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd   = (a, b) => a + Math.random() * (b - a);

/** Escape teks agar aman disisipkan ke HTML. */
const esc = s => String(s).replace(/[&<>"']/g, c => (
  { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
));

/** Pengguna meminta animasi dikurangi? */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Penyimpanan lokal yang aman (tidak error bila diblokir). */
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{ /* penyimpanan tidak tersedia */ } }
};

/** Kirim data ke CONFIG.endpoint (opsional, mis. Google Apps Script). */
const post = (type, data) => {
  if(!CONFIG.endpoint) return;
  fetch(CONFIG.endpoint, {
    method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain' },
    body:JSON.stringify({ type, ...data })
  }).catch(() => {});
};

const mapsUrl = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const wazeUrl = q => `https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`;
