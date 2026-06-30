/* Sales dashboard examples — page-specific JS (cloned from Executive-Dashboards) */

(function ($) {
    'use strict';

    /* FAQ accordion */
    $('.z-accordianBox').find('h4.active').next().slideDown();
    $('.z-accordianBox').find('h4').on('click', function () {
        var _that = $(this);
        if (_that.next().is(':visible')) {
            _that.removeClass('active');
            _that.next().hide('slow');
        } else {
            $('.z-accordianBox').find('h4').removeClass('active');
            _that.addClass('active');
            $('.z-accordianBox > ul').hide('slow');
            _that.next().slideDown();
        }
    });
})(jQuery);

/* Steps section — tabbed accordion with auto-advancing progress */
document.addEventListener('DOMContentLoaded', function () {
    var stepsSection = document.querySelector('.steps-section');
    if (!stepsSection) {
        return;
    }

    var tabList = stepsSection.querySelector('.steps-tab-list');
    var tabs = Array.from(stepsSection.querySelectorAll('.steps-tab'));
    var visuals = Array.from(stepsSection.querySelectorAll('.steps-visual'));
    var triggers = Array.from(stepsSection.querySelectorAll('.steps-tab-btn'));
    var progressBars = Array.from(stepsSection.querySelectorAll('.steps-progress'));

    if (!tabs.length) {
        return;
    }

    var started = false;

    function activate(index) {
        tabs.forEach(function (tab, i) {
            tab.classList.toggle('active', i === index);
        });
        visuals.forEach(function (visual, i) {
            visual.classList.toggle('active', i === index);
        });
        progressBars.forEach(function (bar) {
            bar.classList.remove('running');
        });
        void progressBars[index].offsetWidth;
        progressBars[index].classList.add('running');
    }

    progressBars.forEach(function (bar, index) {
        bar.addEventListener('animationend', function (e) {
            if (e.animationName !== 'stepsProgress') {
                return;
            }
            if (!bar.classList.contains('running')) {
                return;
            }
            activate((index + 1) % tabs.length);
        });
    });

    triggers.forEach(function (btn, index) {
        btn.addEventListener('click', function () {
            activate(index);
        });
    });

    if (tabList) {
        tabList.addEventListener('mouseenter', function () {
            stepsSection.classList.add('paused');
        });
        tabList.addEventListener('mouseleave', function () {
            stepsSection.classList.remove('paused');
        });
    }

    var stepsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;
                activate(0);
            }
        });
    }, { threshold: 0.15 });

    stepsObserver.observe(stepsSection);
});
