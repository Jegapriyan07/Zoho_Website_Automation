/**
 * sqlite-db-page-draft-2 — page behaviors only
 * - Logo pair entrance (.middle-animated) on hero + value logos
 * - Databridge note reveal (.zwe-om) on scroll
 */
(function () {
  "use strict";

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var animateRoots = document.querySelectorAll(
      ".zbanner-section, #value-together"
    );
    var noteWraps = document.querySelectorAll(".za-note-wrap[data-onscroll]");

    if ("IntersectionObserver" in window) {
      var animObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("middle-animated");
              animObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );

      animateRoots.forEach(function (el) {
        animObserver.observe(el);
      });

      var noteObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("zwe-om");
              noteObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );

      noteWraps.forEach(function (el) {
        noteObserver.observe(el);
      });
    } else {
      animateRoots.forEach(function (el) {
        el.classList.add("middle-animated");
      });
      noteWraps.forEach(function (el) {
        el.classList.add("zwe-om");
      });
    }
  });
})();
