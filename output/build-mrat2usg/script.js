(function () {
    'use strict';

    var STEP_DURATION = 7000;
    var stepsSection = document.querySelector('.steps-section');
    var tabs = document.querySelectorAll('.steps-tab');
    var panels = document.querySelectorAll('.steps-visual');
    var currentTab = 0;
    var timer = null;

    function setActiveTab(index) {
        currentTab = index;

        tabs.forEach(function (tab, i) {
            var btn = tab.querySelector('.steps-tab-btn');
            var progress = tab.querySelector('.steps-progress');
            var isActive = i === index;

            tab.classList.toggle('active', isActive);
            if (btn) {
                btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            }
            if (progress) {
                progress.classList.remove('running');
                void progress.offsetWidth;
                if (isActive) {
                    progress.classList.add('running');
                }
            }
        });

        panels.forEach(function (panel, i) {
            var isActive = i === index;
            panel.classList.toggle('active', isActive);
            panel.hidden = !isActive;
        });
    }

    function scheduleNext() {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            var next = (currentTab + 1) % tabs.length;
            setActiveTab(next);
            scheduleNext();
        }, STEP_DURATION);
    }

    if (tabs.length && panels.length) {
        tabs.forEach(function (tab, index) {
            var btn = tab.querySelector('.steps-tab-btn');
            if (!btn) return;

            btn.addEventListener('click', function () {
                if (stepsSection) {
                    stepsSection.classList.add('paused');
                }
                setActiveTab(index);
            });
        });

        setActiveTab(0);
        scheduleNext();
    }

    document.querySelectorAll('.z-accordianBox h4').forEach(function (heading) {
        heading.setAttribute('tabindex', '0');
        heading.setAttribute('role', 'button');

        function toggleFaq() {
            var box = heading.parentElement;
            var list = box.querySelector('ul');
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
})();
