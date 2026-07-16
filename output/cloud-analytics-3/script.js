/**
 * Cloud Analytics Tools Guide — sticky TOC + FAQ accordion
 * Left rail sticks via CSS (flex + .left-tab { position: sticky }).
 * Scrollspy: Reference-Site/page-revamp / live cloud-reporting-tools
 */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.getElementById('tabs');
    const leftTab = document.querySelector('.tabsection .left-tab');
    const rightContent = document.getElementById('right-content');
    let isClickScrolling = false;
    let clickScrollTimer = null;
    let ticking = false;

    function docTop(el) {
        return el.getBoundingClientRect().top + window.pageYOffset;
    }

    function headerOffset() {
        const header = document.querySelector('.product-header-top');
        return header ? header.offsetHeight : 0;
    }

    if (tabs) {
        tabs.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                const href = link.getAttribute('href');
                if (!href || href.charAt(0) !== '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();

                tabs.querySelectorAll('a').forEach(function (a) {
                    a.classList.remove('active');
                });
                link.classList.add('active');

                isClickScrolling = true;
                if (clickScrollTimer) clearTimeout(clickScrollTimer);

                window.scrollTo({ top: docTop(target) - 100, behavior: 'smooth' });

                clickScrollTimer = setTimeout(function () {
                    isClickScrolling = false;
                }, 700);
            });
        });
    }

    function updateStickyNav() {
        if (!tabs || !rightContent || !leftTab) return;

        if (window.innerWidth <= 1200) {
            leftTab.style.display = 'none';
            return;
        }

        leftTab.style.display = '';

        /* Keep .fixed on while article is in view — enables TOC self-scroll (live pattern) */
        const tabsection = document.querySelector('.tabsection');
        const contentTop = docTop(rightContent);
        const sectionEnd = tabsection
            ? tabsection.offsetTop + tabsection.offsetHeight - 80
            : Infinity;
        const y = window.pageYOffset;
        if (y >= contentTop - 160 && y < sectionEnd) {
            tabs.classList.add('fixed');
        } else {
            tabs.classList.remove('fixed');
        }
    }

    function updateActiveTab() {
        if (!tabs || isClickScrolling) return;

        const trigger = window.pageYOffset + headerOffset() + 60;
        let currentId = null;

        tabs.querySelectorAll('a[href^="#"]').forEach(function (a) {
            const id = a.getAttribute('href').slice(1);
            if (!id) return;
            const el = document.getElementById(id);
            if (el && trigger >= docTop(el)) {
                currentId = id;
            }
        });

        if (!currentId) return;

        tabs.querySelectorAll('a').forEach(function (a) {
            const href = a.getAttribute('href');
            a.classList.toggle('active', href === '#' + currentId);
        });
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            updateStickyNav();
            updateActiveTab();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateStickyNav);
    updateStickyNav();
    updateActiveTab();

    /* FAQ accordion */
    const accordionBoxes = document.querySelectorAll('.z-accordianBox');
    accordionBoxes.forEach(function (box) {
        const heading = box.querySelector('h4');
        if (!heading) return;
        heading.setAttribute('tabindex', '0');
        heading.setAttribute('role', 'button');
        heading.setAttribute('aria-expanded', heading.classList.contains('active') ? 'true' : 'false');

        function toggle() {
            const isOpen = heading.classList.contains('active');
            accordionBoxes.forEach(function (other) {
                const h = other.querySelector('h4');
                if (h) {
                    h.classList.remove('active');
                    h.setAttribute('aria-expanded', 'false');
                }
            });
            if (!isOpen) {
                heading.classList.add('active');
                heading.setAttribute('aria-expanded', 'true');
            }
        }

        heading.addEventListener('click', toggle);
        heading.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    });
});
