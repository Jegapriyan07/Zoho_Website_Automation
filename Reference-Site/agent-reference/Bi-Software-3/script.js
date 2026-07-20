/**
 * BI Software LP — live-matched behaviors:
 * - Hero stats bounce (.bottom-animated delayed so transition is visible)
 * - tab-sticky left-tab scrollspy
 * - FAQ accordion
 * (Trusted brands marquee ships with Web Page Builder inject — do not duplicate)
 */
document.addEventListener('DOMContentLoaded', function () {
    initHeroBounce();
    initScrollReveal();
    initToolTabScrollspy();
    initFaqAccordion();
});

function docTop(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
}

function headerOffset() {
    const header = document.querySelector('.product-header-top, .zw-product-header');
    return header ? header.offsetHeight : 0;
}

/** Stats cards start low (bottom:-50px); add class after paint so they bounce up */
function initHeroBounce() {
    const heroWrap = document.querySelector('.zwc-banner-section .content-wrap');
    if (!heroWrap) return;

    // Ensure starting state paints first
    heroWrap.classList.remove('bottom-animated', 'middle-animated', 'animated');

    window.requestAnimationFrame(function () {
        window.setTimeout(function () {
            heroWrap.classList.add('bottom-animated', 'middle-animated', 'animated');
        }, 80);
    });
}

function initScrollReveal() {
    const targets = [
        { sel: '.faq-section .content-wrap', cls: ['bottom-animated', 'middle-animated', 'top-animated', 'animated'] },
        { sel: '.zwc-learn-section', cls: ['middle-animated'] },
    ];

    if (!('IntersectionObserver' in window)) {
        targets.forEach(function (t) {
            const el = document.querySelector(t.sel);
            if (el) t.cls.forEach(function (c) { el.classList.add(c); });
        });
        return;
    }

    const io = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const cls = entry.target.getAttribute('data-reveal-cls');
                if (cls) {
                    cls.split(' ').forEach(function (c) {
                        if (c) entry.target.classList.add(c);
                    });
                }
                io.unobserve(entry.target);
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach(function (t) {
        const el = document.querySelector(t.sel);
        if (!el) return;
        el.setAttribute('data-reveal-cls', t.cls.join(' '));
        io.observe(el);
    });
}

function initToolTabScrollspy() {
    const tabs = document.getElementById('tabs');
    const leftTab = document.querySelector('.tab-sticky .left-tab');
    const rightContent = document.getElementById('right-content');
    if (!tabs || !rightContent) return;

    let isClickScrolling = false;
    let clickScrollTimer = null;
    let ticking = false;

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

    function updateStickyNav() {
        if (!leftTab) return;

        if (window.innerWidth <= 991) {
            leftTab.style.display = 'none';
            return;
        }

        leftTab.style.display = '';

        const tabSticky = document.querySelector('.tab-sticky');
        const contentTop = docTop(rightContent);
        const sectionEnd = tabSticky
            ? docTop(tabSticky) + tabSticky.offsetHeight - 80
            : Infinity;
        const y = window.pageYOffset;

        if (y >= contentTop - 160 && y < sectionEnd) {
            tabs.classList.add('fixed');
        } else {
            tabs.classList.remove('fixed');
        }
    }

    function updateActiveTab() {
        if (isClickScrolling) return;

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
    window.addEventListener('resize', onScroll);
    onScroll();
}

function initFaqAccordion() {
    const boxes = document.querySelectorAll('.faq-section .z-accordianBox');
    if (!boxes.length) return;

    boxes.forEach(function (box) {
        const heading = box.querySelector('h4');
        const panel = box.querySelector('ul');
        if (!heading || !panel) return;

        heading.addEventListener('click', function () {
            const isOpen = heading.classList.contains('active');

            boxes.forEach(function (b) {
                const h = b.querySelector('h4');
                const u = b.querySelector('ul');
                if (h) h.classList.remove('active');
                if (u) u.classList.remove('is-open');
            });

            if (!isOpen) {
                heading.classList.add('active');
                panel.classList.add('is-open');
            }
        });
    });
}
