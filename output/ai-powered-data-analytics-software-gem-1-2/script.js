/**
 * AI Powered Data Analytics Software — comparison-guide behaviors
 * Sticky TOC (tabsection) + FAQ accordion (z-accordian)
 * Vanilla JS — no jQuery dependency for local file:// preview
 */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.getElementById('tabs');
    const rightContent = document.getElementById('right-content');

    if (tabs) {
        tabs.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                const href = link.getAttribute('href');
                if (!href || href.charAt(0) !== '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: top, behavior: 'smooth' });
                tabs.querySelectorAll('a').forEach(function (a) {
                    a.classList.remove('active');
                });
                link.classList.add('active');
            });
        });
    }

    function updateStickyNav() {
        if (!tabs || !rightContent) return;
        if (window.innerWidth <= 992) {
            tabs.style.display = 'none';
            return;
        }
        tabs.style.display = '';
        const contentTop = rightContent.getBoundingClientRect().top + window.pageYOffset;
        const scrollTop = window.pageYOffset;
        const tabsection = document.querySelector('.tabsection');
        if (!tabsection) return;

        if (scrollTop >= contentTop) {
            tabs.classList.add('fixed');
        } else {
            tabs.classList.remove('fixed');
        }

        const sectionEnd = tabsection.offsetHeight + tabsection.offsetTop - 400;
        if (scrollTop >= sectionEnd) {
            tabs.classList.remove('fixed');
            tabs.classList.add('attach');
        } else if (scrollTop >= contentTop) {
            tabs.classList.remove('attach');
            tabs.classList.add('fixed');
        }
    }

    function updateActiveTab() {
        if (!tabs) return;
        const anchors = [
            'step-tldr',
            'step1',
            'step2',
            'comparison-glance',
            'tools',
            'key-features',
            'why-zoho',
            'complete-platform',
            'faqs'
        ];
        const scrollPos = window.pageYOffset + 120;
        let current = anchors[0];
        anchors.forEach(function (id) {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= scrollPos) {
                current = id;
            }
        });
        tabs.querySelectorAll('a').forEach(function (a) {
            const href = a.getAttribute('href');
            a.classList.toggle('active', href === '#' + current);
        });
    }

    window.addEventListener('scroll', function () {
        updateStickyNav();
        updateActiveTab();
    });
    window.addEventListener('resize', updateStickyNav);
    updateStickyNav();

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
