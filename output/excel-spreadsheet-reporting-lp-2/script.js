(function () {
    'use strict';

    function initOnScrollMovement() {
        var scrollTargets = document.querySelectorAll('[data-onscroll]');
        if (!scrollTargets.length) return;

        if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            scrollTargets.forEach(function (el) {
                el.classList.add('zwe-om');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('zwe-om');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

        scrollTargets.forEach(function (el) {
            observer.observe(el);
        });
    }

    document.querySelectorAll('.z-accordianBox h4').forEach(function (heading) {
        heading.setAttribute('tabindex', '0');
        heading.setAttribute('role', 'button');

        function toggleFaq() {
            var list = heading.parentElement.querySelector('ul');
            var isActive = heading.classList.contains('active');

            document.querySelectorAll('.z-accordianBox h4').forEach(function (h) {
                h.classList.remove('active');
            });
            document.querySelectorAll('.z-accordianBox > ul').forEach(function (ul) {
                ul.style.display = 'none';
            });

            if (!isActive && list) {
                heading.classList.add('active');
                list.style.display = 'block';
            }
        }

        heading.addEventListener('click', toggleFaq);
        heading.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq();
            }
        });
    });

    var firstFaq = document.querySelector('.z-accordianBox h4.active');
    if (firstFaq) {
        var firstList = firstFaq.parentElement.querySelector('ul');
        if (firstList) {
            firstList.style.display = 'block';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOnScrollMovement);
    } else {
        initOnScrollMovement();
    }
})();
