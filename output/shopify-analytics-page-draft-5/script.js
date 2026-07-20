/**
 * Shopify Analytics — feature accordion + panel transitions
 * Pattern: live shopify-advanced-analytics.html / zanalytics_solutions.css
 * (.feature-accordian-section · fadeIn / transX)
 */
document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector(".feature-accordian-section");
  if (!section) return;

  const tabs = section.querySelectorAll("#tabs-nav > li");
  const panels = section.querySelectorAll(".tabs-stage > div");

  function activateTab(li) {
    const targetId = li.getAttribute("data-tab");
    if (!targetId) return;

    tabs.forEach(function (tab) {
      const heading = tab.querySelector("h3");
      tab.classList.remove("current");
      if (heading) {
        heading.classList.remove("active");
        heading.setAttribute("aria-expanded", "false");
      }
    });

    panels.forEach(function (panel) {
      panel.classList.remove("current");
      /* Force reflow so animation restarts on each switch */
      void panel.offsetWidth;
    });

    li.classList.add("current");
    const activeHeading = li.querySelector("h3");
    if (activeHeading) {
      activeHeading.classList.add("active");
      activeHeading.setAttribute("aria-expanded", "true");
    }

    const panel = section.querySelector("#" + targetId);
    if (panel) {
      panel.classList.add("current");
    }
  }

  tabs.forEach(function (li) {
    const heading = li.querySelector("h3");
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
});
