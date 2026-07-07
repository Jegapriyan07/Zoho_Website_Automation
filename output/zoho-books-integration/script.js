(function () {
    'use strict';

    function initStepsAnimation() {
        var section = document.querySelector('.threeSimpleSteps-section');
        if (!section || !('IntersectionObserver' in window)) {
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    section.classList.add('in-view');
                    section.classList.remove('not-in-view');
                } else {
                    section.classList.add('not-in-view');
                    section.classList.remove('in-view');
                }
            });
        }, { threshold: 0.5 });

        observer.observe(section);
    }

    function initCarousel() {
        if (typeof window.jQuery === 'undefined' || !window.jQuery.fn.slick) {
            return;
        }

        window.jQuery('.sampleDashboard-image ul').slick({
            infinite: true,
            speed: 500,
            autoplaySpeed: 5000,
            autoplay: true,
            centerMode: true,
            centerPadding: '0',
            variableWidth: true,
            arrows: true
        });
    }

    function initAccordion() {
        if (typeof window.jQuery === 'undefined') {
            return;
        }

        var $ = window.jQuery;
        $('.z-accordianBox').find('h4.active').next().show();

        $('.z-accordianBox').find('h4').on('click', function () {
            var $heading = $(this);
            if ($heading.next().is(':visible')) {
                $heading.removeClass('active');
                $heading.next().hide('slow');
            } else {
                $('.z-accordianBox').find('h4').removeClass('active');
                $heading.addClass('active');
                $('.z-accordianBox > ul').hide('slow');
                $heading.next().slideDown();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initStepsAnimation);

    if (typeof window.jQuery !== 'undefined') {
        window.jQuery(document).ready(function () {
            initCarousel();
            initAccordion();
        });
    }
})();
