(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var meterNum = document.getElementById('meter-num');
  var meterFill = document.getElementById('meter-fill');
  var stage = document.querySelector('.cover-stage');
  var book = document.querySelector('.book');
  var hint = document.getElementById('scroll-hint');
  var ticking = false;

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100))) : 0;
    meterNum.textContent = pct;
    meterFill.style.width = pct + '%';

    if (!reduce && stage && book) {
      var travel = stage.offsetHeight - window.innerHeight;
      var p = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / (travel * 0.85))) : 0;
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      book.style.setProperty('--open', eased.toFixed(4));
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 3));
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Stagger the clue and fix chips inside each case
  document.querySelectorAll('.case').forEach(function (c) {
    c.querySelectorAll('.chip').forEach(function (chip, i) {
      chip.style.transitionDelay = (0.25 + i * 0.12) + 's';
    });
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
