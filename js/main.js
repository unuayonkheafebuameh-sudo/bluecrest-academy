/* BlueCrest International Academy - shared site script (Phase 1) */
(function () {
  'use strict';

  var NEWS = [
    { d: '2026-10-28', t: 'First term examinations timetable released', p: 'Examinations begin in the second week of December. Check your class timetable.' },
    { d: '2026-10-20', t: 'BlueCrest wins inter-school science fair', p: 'Our SSS 2 team took first place with a solar water purifier.' },
    { d: '2026-10-12', t: 'Admissions open for 2026/2027', p: 'Apply online for Primary 1 to SSS 1 entry.' }
  ];
  var EVENTS = [
    { d: '2026-11-14', t: 'Inter-house sports day', p: 'School field, 9:00 AM' },
    { d: '2026-11-27', t: 'Parent and teacher meeting', p: 'School hall, 10:00 AM' },
    { d: '2026-12-10', t: 'First term examinations begin', p: 'All classes' }
  ];
  var TESTI = [
    { q: 'My daughter looks forward to school every day, and I can follow her progress from my phone.', a: 'Mrs. A. Okafor, Parent' },
    { q: 'The teachers push us hard and care about us. I felt ready for WAEC.', a: 'Tunde, SSS 3 student' },
    { q: 'Paying fees and getting receipts online saves me hours every term.', a: 'Mr. I. Bello, Parent' }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmt(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Header shadow on scroll */
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Render lists with an empty state */
  function list(el, items) {
    if (!el) return;
    el.innerHTML = items.length ? items.map(function (i) {
      return '<div class="item"><small>' + fmt(i.d) + '</small><h4>' + esc(i.t) + '</h4><p>' + esc(i.p) + '</p></div>';
    }).join('') : '<p class="sub">Nothing posted yet. Please check back soon.</p>';
  }
  list($('#newsList'), NEWS);
  list($('#eventList'), EVENTS);
  var t = $('#testi');
  if (t) t.innerHTML = TESTI.map(function (x) {
    return '<figure class="card quote"><p>“' + esc(x.q) + '”</p><b>' + esc(x.a) + '</b></figure>';
  }).join('');

  /* Count-up numbers */
  var counters = document.querySelectorAll('[data-count]');
  function run(el) {
    var end = +el.dataset.count, start = performance.now(), dur = 1200;
    (function tick(n) {
      var p = Math.min((n - start) / dur, 1);
      el.textContent = Math.round(end * p).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    });
    counters.forEach(function (c) { io.observe(c); });
  } else { counters.forEach(function (c) { c.textContent = c.dataset.count; }); }

  /* Contact form (validation only for now) */
  var form = $('#contactForm'), msg = $('#contactMsg');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    msg.className = 'msg ' + (ok ? 'ok' : 'err');
    msg.textContent = ok ? 'Thank you. Your message was received (demo mode: not yet stored).' : 'Please fill in every field with a valid email address.';
    if (ok) form.reset();
  });

  $('#yr').textContent = new Date().getFullYear();
})();
