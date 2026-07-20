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

    function initProgressAccordion() {
        var section = document.querySelector('.progress-section');
        if (!section) return;

        var wraps = section.querySelectorAll('.acc-wrap');
        var images = section.querySelectorAll('.image-part .step-image');
        if (!wraps.length) return;

        var timer = null;
        var index = 0;

        function activate(i) {
            index = i;
            wraps.forEach(function (w, wi) {
                w.classList.toggle('current', wi === i);
            });
            images.forEach(function (img, ii) {
                img.classList.toggle('active', ii === i);
            });
        }

        function next() {
            activate((index + 1) % wraps.length);
        }

        function startAuto() {
            stopAuto();
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            if (window.matchMedia('(max-width: 767px)').matches) return;
            timer = window.setInterval(next, 8000);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        wraps.forEach(function (wrap, i) {
            wrap.setAttribute('tabindex', '0');
            wrap.setAttribute('role', 'button');
            wrap.addEventListener('click', function () {
                activate(i);
                startAuto();
            });
            wrap.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(i);
                    startAuto();
                }
            });
        });

        activate(0);
        startAuto();
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

    function boot() {
        initOnScrollMovement();
        initProgressAccordion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
