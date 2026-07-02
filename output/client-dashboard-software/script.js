'use strict';

(function ($) {
    $('.z-accordianBox').find('h4.active').next().slideDown();
    $('.z-accordianBox').find('h4').on('click', function () {
        var $that = $(this);
        if ($that.next().is(':visible')) {
            $that.removeClass('active');
            $that.next().hide('slow');
        } else {
            $('.z-accordianBox').find('h4').removeClass('active');
            $that.addClass('active');
            $('.z-accordianBox > ul').hide('slow');
            $that.next().slideDown();
        }
    });
})(jQuery);

document.addEventListener('DOMContentLoaded', function () {
    var onScrollEls = document.querySelectorAll('[data-onscroll]');
    if (onScrollEls.length && window.IntersectionObserver) {
        var scrollObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('zwe-om');
                }
            });
        }, { threshold: 0.15 });
        onScrollEls.forEach(function (el) {
            scrollObserver.observe(el);
        });
    }

    var hiwSteps = document.querySelectorAll('.how-it-works-section .hiw-step');
    if (hiwSteps.length) {
        if (window.IntersectionObserver) {
            var hiwObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('hiw-visible');
                        hiwObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
            hiwSteps.forEach(function (step) {
                hiwObserver.observe(step);
            });
        } else {
            hiwSteps.forEach(function (step) {
                step.classList.add('hiw-visible');
            });
        }
    }
});
