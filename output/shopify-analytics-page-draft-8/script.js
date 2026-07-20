/**
 * Shopify Analytics — gold behaviors from zanalytics_solutions.js + 5919.css
 * · Trusted brands counter rotation (.ec.cshow)
 * · Scroll reveal → .line-animated (scaleEffect on logos)
 * · Feature accordion fadeIn / transX
 */
document.addEventListener("DOMContentLoaded", function () {
  initScrollReveal();
  initBrandCounterRotation();
  initLineAnimatedScroll();
  initFeatureAccordion();
});

function initScrollReveal() {
  var targets = document.querySelectorAll("[data-animate]");
  if (!targets.length) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    targets.forEach(function (el) {
      el.classList.add("is-inview");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

/** Gold: rotate .ec counters every 2s (22 Thousand ↔ 4 Million) */
function initBrandCounterRotation() {
  var host = document.querySelector(".each-count");
  if (!host) return;

  var items = host.querySelectorAll(".ec");
  if (items.length < 2) return;

  items.forEach(function (el, i) {
    if (i === 0) {
      el.classList.add("cshow");
      el.style.display = "block";
    } else {
      el.classList.remove("cshow");
      el.style.display = "none";
    }
  });

  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  setInterval(function () {
    var current = host.querySelector(".ec.cshow") || host.querySelector(".ec:not([style*='display: none'])");
    if (!current) current = items[0];
    var next = current.nextElementSibling;
    if (!next || !next.classList.contains("ec")) {
      next = items[0];
    }
    current.classList.remove("cshow");
    current.style.display = "none";
    next.classList.add("cshow");
    next.style.display = "block";
  }, 2000);
}

/**
 * Gold scroll: .branding-logos / .connectors-section / .zcollaborate-section
 * get .line-animated when near viewport (triggers logo scaleEffect)
 */
function initLineAnimatedScroll() {
  var targets = document.querySelectorAll(
    ".branding-logos, .connectors-section, .zcollaborate-section"
  );
  if (!targets.length) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    targets.forEach(function (el) {
      el.classList.add("line-animated");
      el.style.opacity = "1";
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("line-animated");
        entry.target.style.opacity = "1";
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
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
