/**
 * firebird — page behaviors only
 * - Hero entrance (.middle-animated) matching live firebird.html
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
    var heroWrap = document.querySelector(".za-banner-section .content-wrap");
    if (!heroWrap) return;

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("middle-animated", "bottom-animated", "animated");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(heroWrap);
    } else {
      heroWrap.classList.add("middle-animated", "bottom-animated", "animated");
    }
  });
})();
