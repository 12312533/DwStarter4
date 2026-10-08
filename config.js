'use strict';
/* =========================================================
   config.js — UBAH DATA UNDANGAN DI SINI SAJA
   ========================================================= */

const CONFIG = {
  title : 'Pernikahan Adilah & Wafie',
  start : '2026-12-20T08:00:00+07:00',   // awal acara (dipakai hitung mundur & kalender)
  end   : '2026-12-20T14:00:00+07:00',   // akhir acara

  // Daftar acara. icon: 'mosque' atau 'goblet'
  venues: [
    { icon:'mosque', title:'Akad Nikah', date:'Sabtu, 20 Desember 2026', time:'08.00 – 10.00 WIB',
      name:'Masjid Al-Ikhlas', address:'Jl. Merdeka No. 10, Jakarta Pusat',
      query:'Masjid Al-Ikhlas, Jl. Merdeka No. 10, Jakarta Pusat' },
    { icon:'goblet', title:'Resepsi', date:'Sabtu, 20 Desember 2026', time:'11.00 – 14.00 WIB',
      name:'Gedung Graha Bunga', address:'Jl. Sudirman No. 25, Jakarta Selatan',
      query:'Gedung Graha Bunga, Jl. Sudirman No. 25, Jakarta Selatan' }
  ],

  liveUrl : 'https://www.youtube.com/',   // kosongkan '' untuk menyembunyikan tombol live
  music   : '',                           // contoh: 'music.mp3'
  video   : '',                           // contoh: 'https://www.youtube.com/embed/ID_VIDEO'
  whatsapp: '',                           // contoh: '6281234567890' (untuk kirim RSVP via WhatsApp)
  endpoint: '',                           // URL Google Apps Script untuk menyimpan RSVP & ucapan

  // FOTO — taruh file foto di folder yang sama dengan index.html
  photos  : { bride:'wanita.jpg', groom:'pria.jpg' },
  gallery : ['prewed1.jpg','prewed2.jpg','prewed3.jpg','prewed4.jpg','prewed5.jpg','prewed6.jpg'],                           // contoh: ['g1.jpg','g2.jpg','g3.jpg','g4.jpg']

  // Amplop digital
  gifts   : [
    { type:'bank',    bank:'Bank BCA', number:'1234567890', holder:'Adilah Putri' },
    { type:'qris',    image:'' },         // isi nama file gambar QRIS agar kartu tampil
    { type:'address', recipient:'Adilah & Wafie', text:'Jl. Mawar No. 5, Jakarta Selatan 12345' }
  ]
};
