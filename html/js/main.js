(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var applyStuckState = function () {
      var isStuck = header.classList.contains("is-stuck");
      if (!isStuck && window.scrollY > 80) {
        header.classList.add("is-stuck");
      } else if (isStuck && window.scrollY < 40) {
        header.classList.remove("is-stuck");
      }
      ticking = false;
    };
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyStuckState);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var menuBtn = document.querySelector(".header-menu-btn");
  var drawer = document.querySelector(".mobile-drawer");
  var drawerClose = document.querySelector(".mobile-drawer__close");
  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      drawer.classList.add("is-open");
    });
  }
  if (drawerClose && drawer) {
    drawerClose.addEventListener("click", function () {
      drawer.classList.remove("is-open");
    });
  }
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) {
        drawer.classList.remove("is-open");
      }
    });
  }

  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".faq-item__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq-item.is-open").forEach(function (el) {
        el.classList.remove("is-open");
      });
      if (!wasOpen) item.classList.add("is-open");
    });
  });

  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      var suffix = el.getAttribute("data-count-suffix") || "";
      var duration = 1500;
      var startTime = null;
      var step = function (timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counters.forEach(animateCount);
    }
  }

  document.querySelectorAll(".tab-showcase").forEach(function (widget) {
    var buttons = widget.querySelectorAll(".tab-showcase__list button");
    var panels = widget.querySelectorAll(".tab-showcase__grid");
    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        panels.forEach(function (p, j) {
          p.style.display = j === i ? "grid" : "none";
        });
      });
    });
  });
})();
