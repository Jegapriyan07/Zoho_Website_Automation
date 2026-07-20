/**
 * ZA BI APP Main Page — feature accordion only
 * Pattern: live mobile-apps.html / zanalytics_solutions accordion
 */
document.addEventListener("DOMContentLoaded", function () {
  initScrollReveal();
  initFeatureAccordion();
  initTrustSectionStars();
});

function initScrollReveal() {
  var targets = document.querySelectorAll("[data-animate]");
  if (!targets.length) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal(el) {
    el.classList.add("is-inview");
  }

  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    targets.forEach(reveal);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
  );

  targets.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      reveal(el);
    } else {
      observer.observe(el);
    }
  });
}

/** Live mobile-apps: .trust-section .content-wrap.animated fills star bars */
function initTrustSectionStars() {
  var wrap = document.querySelector(".trust-section .content-wrap");
  if (!wrap) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    wrap.classList.add("animated");
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        wrap.classList.add("animated");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(wrap);
}

function initFeatureAccordion() {
  var section = document.querySelector(".feature-accordian-section");
  if (!section) return;

  var tabs = section.querySelectorAll("#tabs-nav > li");
  var panels = section.querySelectorAll(".tabs-stage > div");

  function activateTab(li) {
    var targetId = li.getAttribute("data-tab");
    if (!targetId) return;

    tabs.forEach(function (tab) {
      var heading = tab.querySelector("h3");
      tab.classList.remove("current");
      if (heading) {
        heading.classList.remove("active");
        heading.setAttribute("aria-expanded", "false");
      }
    });

    panels.forEach(function (panel) {
      panel.classList.remove("current");
      void panel.offsetWidth;
    });

    li.classList.add("current");
    var activeHeading = li.querySelector("h3");
    if (activeHeading) {
      activeHeading.classList.add("active");
      activeHeading.setAttribute("aria-expanded", "true");
    }

    var panel = section.querySelector("#" + targetId);
    if (panel) {
      panel.classList.add("current");
    }
  }

  tabs.forEach(function (li) {
    var heading = li.querySelector("h3");
    if (!heading) return;

    heading.addEventListener("click", function () {
      activateTab(li);
    });

    heading.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateTab(li);
      }
    });
  });
}
