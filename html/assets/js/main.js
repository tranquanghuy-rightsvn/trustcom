/* ==========================================================================
   TrustCom Media — site interactions
   - Hub SVG builder (hero graphic)
   - Mobile nav toggle
   - Lead form handling
   - GSAP ScrollTrigger (reveal + parallax) — native scroll, no scroll hijacking
   - Graceful fallback to IntersectionObserver if GSAP unavailable
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Hero hub graphic (only present on the home page) ---------------- */
  (function buildHub() {
    var L = document.getElementById('links');
    var N = document.getElementById('nodes');
    if (!L || !N) return;
    var s = ['Website', 'Fanpage', 'Quảng cáo', 'Video', 'Sàn TMĐT', 'Content', 'AI Agent'];
    var cx = 280, cy = 235, R = 175, NS = 'http://www.w3.org/2000/svg';
    var step = 360 / s.length;
    s.forEach(function (label, i) {
      var rad = (-90 + i * step) * Math.PI / 180,
        px = cx + R * Math.cos(rad),
        py = cy + R * Math.sin(rad) * 0.86;
      var ln = document.createElementNS(NS, 'path');
      ln.setAttribute('d', 'M' + cx + ',' + cy + ' L' + px + ',' + py);
      ln.setAttribute('class', 'link' + (i % 2 ? '' : ' on'));
      L.appendChild(ln);
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'node');
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', px); c.setAttribute('cy', py); c.setAttribute('r', 34);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', px); t.setAttribute('y', py + 4);
      t.setAttribute('text-anchor', 'middle'); t.textContent = label;
      g.appendChild(c); g.appendChild(t); N.appendChild(g);
    });
  })();

  /* ---- Mobile navigation ------------------------------------------------ */
  (function nav() {
    var tg = document.getElementById('navToggle');
    var lk = document.getElementById('navlinks');
    if (!tg || !lk) return;
    tg.setAttribute('aria-expanded', 'false');
    tg.addEventListener('click', function () {
      var open = lk.classList.toggle('open');
      tg.classList.toggle('open', open);
      tg.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    lk.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        lk.classList.remove('open');
        tg.classList.remove('open');
        tg.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  /* ---- Active-menu underline --------------------------------------------
     A sliding underline tracks the active nav item. On click it "jumps":
     it first stretches to the full width of the clicked link's text, then
     settles by shrinking down to half that width, centered. While scrolling,
     it just glides straight to the half-width mark under whichever section
     is in view. ------------------------------------------------------- */
  (function navUnderline() {
    var navLinks = document.getElementById('navlinks');
    if (!navLinks) return;
    var links = Array.prototype.slice.call(navLinks.querySelectorAll('a[href^="#"]:not(.btn)'));
    if (!links.length) return;

    var underline = document.createElement('span');
    underline.className = 'nav-underline';
    navLinks.appendChild(underline);

    var current = null;
    var shrinkTimer = null;
    var suppressSpy = false;
    var suppressClear = null;

    function place(link, jump, reverse) {
      clearTimeout(shrinkTimer);
      if (!link) { underline.style.width = '0px'; return; }

      var linkRect = link.getBoundingClientRect();
      var baseRect = navLinks.getBoundingClientRect();
      var left = linkRect.left - baseRect.left;
      var full = linkRect.width;
      var half = full * 0.5;
      var halfLeft = left + (full - half); // shrink from the left end only — right edge stays put
      var top = linkRect.bottom - baseRect.top + 6;

      underline.style.top = top + 'px';
      underline.style.transition = 'left .32s cubic-bezier(.65,0,.35,1), width .32s cubic-bezier(.65,0,.35,1)';

      if (jump && reverse) {
        // Clicking backwards (right → left): fly straight to the half-width
        // mark, skipping the stretch-then-shrink settle.
        underline.style.left = halfLeft + 'px';
        underline.style.width = half + 'px';
      } else if (jump) {
        // Phase 1: glide over and stretch to the full width of the text.
        underline.style.left = left + 'px';
        underline.style.width = full + 'px';
        // Phase 2: settle — shrink down to half width, centered.
        shrinkTimer = setTimeout(function () {
          underline.style.transition = 'left .28s ease, width .28s ease';
          underline.style.left = halfLeft + 'px';
          underline.style.width = half + 'px';
        }, 320);
      } else {
        underline.style.left = halfLeft + 'px';
        underline.style.width = half + 'px';
      }
    }

    function setActive(link, jump) {
      if (link === current) return;
      var reverse = jump && current ? links.indexOf(link) < links.indexOf(current) : false;
      links.forEach(function (a) { a.classList.remove('active'); });
      if (link) link.classList.add('active');
      place(link, jump, reverse);
      current = link;
    }

    links.forEach(function (a) {
      a.addEventListener('click', function () {
        // A click triggers native smooth-scrolling across possibly several
        // in-between sections — ignore scrollspy until that settles, so the
        // underline doesn't flicker across every section it passes over.
        suppressSpy = true;
        clearTimeout(suppressClear);
        // Fallback in case the target needs no scrolling at all (already in
        // view) — without this, no scroll event would ever fire to lift
        // the suppression again. Real scrolling below re-arms a shorter one.
        suppressClear = setTimeout(function () { suppressSpy = false; }, 700);
        setActive(a, true);
      });
    });

    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (suppressSpy) return;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = links.filter(function (a) {
            return a.getAttribute('href') === '#' + entry.target.id;
          })[0];
          if (link) setActive(link, false);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (sec) { io.observe(sec); });
    }

    // Resume scrollspy once scrolling has actually stopped (debounced —
    // covers both the programmatic scroll from a click and manual scrolling).
    window.addEventListener('scroll', function () {
      if (!suppressSpy) return;
      clearTimeout(suppressClear);
      suppressClear = setTimeout(function () { suppressSpy = false; }, 150);
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (current) place(current, false);
    });
  })();

  /* ---- Hero title sparkle -------------------------------------------------
     A single glowing dot wanders around the hero <h1>, leaving a fading
     trail. Each hop picks a fresh random destination and speed, so the path
     never repeats like a fixed orbit would. ------------------------------ */
  (function sparkleWander() {
    if (reduceMotion) return;
    var wrap = document.querySelector('.sparkle-wrap');
    var canvas = document.getElementById('sparkleCanvas');
    if (!wrap || !canvas) return;
    var ctx = canvas.getContext('2d');
    var PAD = 80;
    var w = 0, h = 0;
    var sparks = [];

    function resize() {
      w = wrap.clientWidth + PAD * 2;
      h = wrap.clientHeight + PAD * 2;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    // Random point on a ring around the text (never on top of it): random
    // angle + radius 90%..118% of the text's half-extents.
    function randomRingPoint() {
      var a = Math.random() * Math.PI * 2;
      var m = 0.9 + Math.random() * 0.28;
      return {
        x: w / 2 + (w - PAD * 1.3) / 2 * m * Math.cos(a),
        y: h / 2 + (h - PAD * 1.1) / 2 * m * Math.sin(a)
      };
    }

    var head = randomRingPoint();
    var target = randomRingPoint();
    var speed = 4 + Math.random() * 3; // px per frame, re-rolled every hop

    (function tick() {
      var dx = target.x - head.x, dy = target.y - head.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < speed) {
        head.x = target.x; head.y = target.y;
        target = randomRingPoint();
        speed = 4 + Math.random() * 3;
      } else {
        head.x += dx / dist * speed;
        head.y += dy / dist * speed;
      }

      for (var k = 0; k < 2; k++) {
        sparks.push({
          x: head.x, y: head.y,
          vx: (Math.random() - 0.5) * 0.9, vy: (Math.random() - 0.5) * 0.9,
          life: 1, r: 6 + Math.random() * 7,
          hue: 250 + Math.random() * 80 // purple-pink
        });
      }
      ctx.clearRect(0, 0, w, h);
      for (var i = sparks.length - 1; i >= 0; i--) {
        var p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + p.hue + ',85%,70%,' + (p.life * 0.85) + ')';
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bright glowing head on top of its trail.
      ctx.save();
      ctx.shadowColor = 'rgba(170,200,255,0.95)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      requestAnimationFrame(tick);
    })();
  })();

  /* ---- Portfolio video play/pause ---------------------------------------
     Paused by default (no autoplay, preload="none") so the card only costs
     bandwidth once a visitor opts in — better for SEO/perf than autoplay. */
  (function videoToggle() {
    document.querySelectorAll('.vis-video').forEach(function (vis) {
      var video = vis.querySelector('video');
      var btn = vis.querySelector('.vid-toggle');
      if (!video || !btn) return;
      btn.addEventListener('click', function () {
        if (video.paused) { video.play(); btn.classList.add('playing'); }
        else { video.pause(); btn.classList.remove('playing'); }
      });
      video.addEventListener('pause', function () { btn.classList.remove('playing'); });
      video.addEventListener('playing', function () { btn.classList.add('playing'); });
    });
  })();

  /* ---- Gold CTA ripple --------------------------------------------------
     Same mechanic as the ux.html ripple demo, but triggered on hover-enter
     instead of click, spawning from wherever the cursor entered. -------- */
  (function goldRipple() {
    if (reduceMotion) return;
    document.querySelectorAll('.btn-ripple').forEach(function (btn) {
      btn.addEventListener('mouseenter', function (e) {
        var rect = btn.getBoundingClientRect();
        var span = document.createElement('span');
        span.className = 'ripple';
        var size = Math.max(rect.width, rect.height);
        span.style.width = span.style.height = size + 'px';
        span.style.left = (e.clientX - rect.left - size / 2) + 'px';
        span.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(span);
        span.addEventListener('animationend', function () { span.remove(); });
      });
    });
  })();

  /* ---- Blog slider -------------------------------------------------------
     Horizontal scroll-snap track; the prev/next buttons just scroll it by
     one card's width (+ gap) at a time. -------------------------------- */
  (function blogSlider() {
    var track = document.getElementById('blogTrack');
    var prev = document.getElementById('blogPrev');
    var next = document.getElementById('blogNext');
    if (!track || !prev || !next) return;

    function step() {
      var card = track.querySelector('.post');
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function updateButtons() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  })();

  /* ---- Lead form -------------------------------------------------------- */
  (function leadForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('formMsg');
      if (msg) msg.style.display = 'block';
      var btn = this.querySelector('button');
      if (btn) btn.textContent = 'Đã gửi ✓';
    });
  })();

  /* ---- Reveal fallback (no GSAP) --------------------------------------- */
  function revealFallback() {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Scroll-driven effects (GSAP ScrollTrigger, native scrolling) ---- */
  function initMotion() {
    var hasGSAP = window.gsap && window.ScrollTrigger;

    // If reduced motion, just reveal everything and skip scroll effects.
    if (reduceMotion) { revealFallback(); return; }

    if (!hasGSAP) { revealFallback(); return; }

    gsap.registerPlugin(ScrollTrigger);

    // Reveal-on-scroll — GSAP drives the .rv elements.
    gsap.utils.toArray('.rv').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.8, ease: 'power2.out',
          onComplete: function () { el.classList.add('in'); },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // Parallax: hero hub graphic drifts as you scroll.
    var hub = document.querySelector('.hub');
    if (hub) {
      gsap.to(hub, {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Parallax: hero copy lifts gently.
    var heroCopy = document.querySelector('.hero-in > .rv:first-child');
    if (heroCopy) {
      gsap.to(heroCopy, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Generic parallax for any element flagged with [data-parallax].
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.getAttribute('data-parallax')) || 10;
      gsap.to(el, {
        yPercent: amount, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    ScrollTrigger.refresh();
  }

  // GSAP loads with `defer`, so it's ready by DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
