(function () {
    'use strict';

    /* threeSimpleSteps-section animated line on scroll */
    document.addEventListener('DOMContentLoaded', function () {
        var stepsSection = document.querySelector('.threeSimpleSteps-section');
        if (stepsSection) {
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            stepsSection.classList.add('in-view');
                            stepsSection.classList.remove('not-in-view');
                        } else {
                            stepsSection.classList.add('not-in-view');
                            stepsSection.classList.remove('in-view');
                        }
                    });
                },
                { threshold: 0.5 }
            );
            observer.observe(stepsSection);
        }
    });

    /* sampleDashboard-section slick carousel */
    $(document).ready(function () {
        var $carousel = $('.sampleDashboard-image ul');
        if ($carousel.length && typeof $.fn.slick === 'function') {
            $carousel.slick({
                infinite: true,
                speed: 500,
                autoplaySpeed: 5000,
                autoplay: true,
                centerMode: true,
                centerPadding: '0',
                variableWidth: true,
                arrows: true,
                dots: false
            });
        }

        /* FAQ accordion */
        $('.z-accordianBox').find('h4.active').next().show();

        $('.z-accordianBox').find('h4').on('click keydown', function (e) {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') {
                return;
            }
            if (e.type === 'keydown') {
                e.preventDefault();
            }

            var $heading = $(this);
            var $list = $heading.next('ul');

            if ($list.is(':visible')) {
                $heading.removeClass('active').attr('aria-expanded', 'false');
                $list.hide('slow');
            } else {
                $('.z-accordianBox h4').removeClass('active').attr('aria-expanded', 'false');
                $('.z-accordianBox > ul').hide('slow');
                $heading.addClass('active').attr('aria-expanded', 'true');
                $list.slideDown();
            }
        });
    });
})();
