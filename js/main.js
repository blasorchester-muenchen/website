/* boMUC — minimal behaviour. No dependencies.
   Everything here is an enhancement: with JS disabled the nav is a plain
   list, the carousel is a horizontally scrollable strip, and all reveal
   targets are visible. */
(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;

  /* ---- Mobile navigation ------------------------------------------------ */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var main = document.getElementById('main');

  if (toggle && nav) {
    var setNav = function (open) {
      nav.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = open ? 'hidden' : '';
      if (main) main.inert = open;
    };

    toggle.addEventListener('click', function () {
      setNav(nav.dataset.open !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.dataset.open === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ---- Carousels -------------------------------------------------------
     The buttons only nudge scrollLeft; the scroll container and its snap
     points do the actual work, so touch and trackpad behave natively. */
  document.querySelectorAll('[data-cara]').forEach(function (root) {
    var track = root.querySelector('.cara');
    var prev = root.querySelector('[data-cara-prev]');
    var next = root.querySelector('[data-cara-next]');
    if (!track || !prev || !next) return;

    var step = function () {
      var card = track.firstElementChild;
      if (!card) return track.clientWidth;
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    };

    var sync = function () {
      // 2px tolerance: fractional scroll widths otherwise never reach the end.
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' });
    });

    var queued = false;
    track.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { sync(); queued = false; });
    }, { passive: true });

    window.addEventListener('resize', sync);
    sync();
  });

  /* One control reveals the highlights for every card, so card controls stay
     aligned and the archive can be compared without opening items one by one. */
  document.querySelectorAll('[data-program-toggle]').forEach(function (toggle) {
    var root = toggle.closest('[data-cara]');
    if (!root) return;
    toggle.addEventListener('click', function () {
      var open = !root.classList.contains('programs-open');
      root.classList.toggle('programs-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Programmhöhepunkte ausblenden' : 'Programmhöhepunkte anzeigen';
    });
  });

  /* Accordions use native details/summary semantics. Only one item in a
     content group remains open, avoiding a long wall of optional copy. */
  document.querySelectorAll('.accordion').forEach(function (accordion) {
    accordion.querySelectorAll('details').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        accordion.querySelectorAll('details[open]').forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* ---- Lightbox ---------------------------------------------------------
     Anchors remain ordinary image links without JavaScript. A shared dialog
     upgrades them with grouping, keyboard navigation and touch swipes. */
  var dialog = document.getElementById('lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    var lightboxImage = dialog.querySelector('[data-lightbox-image]');
    var lightboxCaption = dialog.querySelector('[data-lightbox-caption]');
    var lightboxPrev = dialog.querySelector('[data-lightbox-prev]');
    var lightboxNext = dialog.querySelector('[data-lightbox-next]');
    var lightboxClose = dialog.querySelector('[data-lightbox-close]');
    var lightboxItems = [];
    var lightboxIndex = 0;
    var lightboxTrigger = null;

    var showLightboxItem = function (index) {
      if (!lightboxItems.length) return;
      lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
      var item = lightboxItems[lightboxIndex];
      var thumb = item.querySelector('img');
      lightboxImage.src = item.href;
      lightboxImage.alt = thumb ? thumb.alt : '';
      lightboxCaption.textContent = item.dataset.caption || lightboxImage.alt;
      var grouped = lightboxItems.length > 1;
      lightboxPrev.hidden = !grouped;
      lightboxNext.hidden = !grouped;
    };

    document.querySelectorAll('a[data-lightbox]').forEach(function (item) {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        var group = item.dataset.lightbox;
        lightboxItems = Array.from(document.querySelectorAll(
          'a[data-lightbox="' + CSS.escape(group) + '"]'
        ));
        lightboxTrigger = item;
        showLightboxItem(lightboxItems.indexOf(item));
        dialog.showModal();
        lightboxClose.focus();
      });
    });

    lightboxPrev.addEventListener('click', function () { showLightboxItem(lightboxIndex - 1); });
    lightboxNext.addEventListener('click', function () { showLightboxItem(lightboxIndex + 1); });
    lightboxClose.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      lightboxImage.removeAttribute('src');
      if (lightboxTrigger) lightboxTrigger.focus();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' && lightboxItems.length > 1) showLightboxItem(lightboxIndex - 1);
      if (event.key === 'ArrowRight' && lightboxItems.length > 1) showLightboxItem(lightboxIndex + 1);
    });

    var touchStartX = 0;
    dialog.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    dialog.addEventListener('touchend', function (event) {
      if (lightboxItems.length < 2) return;
      var distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 50) return;
      showLightboxItem(lightboxIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---- Scroll reveals -------------------------------------------------- */
  var targets = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    document.documentElement.classList.add('motion-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    targets.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
      io.observe(el);
    });
  }

  /* ---- Statistics ------------------------------------------------------
     The final value is present in HTML for no-JS and reduced-motion users.
     Only replace it with an animation once the number actually enters view. */
  var counters = document.querySelectorAll('[data-counter]');
  if (!reduced && 'IntersectionObserver' in window) {
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterIo.unobserve(entry.target);
        var el = entry.target;
        var target = Number(el.dataset.counter);
        var suffix = el.dataset.suffix || '';
        var startTime = performance.now();
        var duration = 2000;

        var tick = function (now) {
          var progress = Math.min((now - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        el.textContent = '0' + suffix;
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (counter) { counterIo.observe(counter); });
  }
})();
