document.addEventListener("DOMContentLoaded", () => {
    const $slider = window.jQuery && window.jQuery(".trust-promo-slider");
    if ($slider && $slider.length && typeof $slider.slick === "function") {
        $slider.slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            pauseOnHover: true,
            fade: true,
            speed: 500,
            adaptiveHeight: true,
            accessibility: true,
        });
    }

    // Pie tabs — switch active tab; line animates top-to-bottom via CSS
    const tabList = document.querySelector(".pie-tabs-list");
    if (!tabList) return;

    const tabs = tabList.querySelectorAll(".pie-tab");
    let tabIntervalId = null;

    function setActiveTab(nextIndex) {
        const target = tabs[nextIndex];
        if (!target) return;

        tabs.forEach((t) => {
            t.classList.remove("is-active");
            t.setAttribute("aria-selected", "false");
        });
        target.classList.add("is-active");
        target.setAttribute("aria-selected", "true");
    }

    function getActiveIndex() {
        const active = tabList.querySelector(".pie-tab.is-active");
        if (!active) return 0;
        const idx = Number(active.getAttribute("data-index"));
        return Number.isFinite(idx) ? idx : 0;
    }

    function startTabAutoplay() {
        stopTabAutoplay();
        tabIntervalId = window.setInterval(() => {
            const current = getActiveIndex();
            const next = (current + 1) % tabs.length;
            setActiveTab(next);
        }, 5000);
    }

    function stopTabAutoplay() {
        if (tabIntervalId !== null) {
            window.clearInterval(tabIntervalId);
            tabIntervalId = null;
        }
    }

    // Start autoplay by default (5s per tab)
    startTabAutoplay();

    // Pause on hover/focus so it doesn't fight the user
    tabList.addEventListener("mouseenter", stopTabAutoplay);
    tabList.addEventListener("mouseleave", startTabAutoplay);
    tabList.addEventListener("focusin", stopTabAutoplay);
    tabList.addEventListener("focusout", startTabAutoplay);

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const index = tab.getAttribute("data-index");
            if (index === null) return;

            const idx = Number(index);
            if (!Number.isFinite(idx)) return;
            setActiveTab(idx);
            startTabAutoplay();
        });
    });
});
