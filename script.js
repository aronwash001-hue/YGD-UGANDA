/* ===========================================================
   YGDU — shared behaviour
   Mobile menu, sticky nav, animated counters, scroll reveal
   =========================================================== */
(function () {
  var nav      = document.getElementById('nav');
  var burger   = document.getElementById('hamburger');
  var menu     = document.getElementById('navmenu');
  var floatCta = document.getElementById('floatCta');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mark the current page in the nav --- */
  var here = location.pathname.split('/').pop() || 'index.html';
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      if (a.getAttribute('href') === here) a.classList.add('active');
    });
  }

  /* --- Mobile menu --- */
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* --- Close the menu if the window grows to desktop width --- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 900) closeMenu();
    }, 120);
  });

  /* --- Nav shadow + floating Register button --- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (!floatCta) return;
    var past = y > window.innerHeight * 0.55;
    var reg = document.getElementById('register');
    var inForm = false;
    if (reg) {
      var r = reg.getBoundingClientRect();
      inForm = r.top < window.innerHeight * 0.8 && r.bottom > 0;
    }
    floatCta.classList.toggle('show', past && !inForm);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Animated counters --- */
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
    var duration = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);        /* ease-out cubic */
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.count');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var statsObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { statsObs.observe(c); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* --- Scroll reveal --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { revObs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  }

  /* --- Smooth in-page scrolling that clears the fixed nav --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();
