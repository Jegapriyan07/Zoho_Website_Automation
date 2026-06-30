'use strict';

$(document).ready(function () {

    // Three steps SVG line animation
    var stepsSection = document.querySelector('.threeSimpleSteps-section');
    if (stepsSection) {
        var stepsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    stepsSection.classList.add('in-view');
                    stepsSection.classList.remove('not-in-view');
                } else {
                    stepsSection.classList.add('not-in-view');
                    stepsSection.classList.remove('in-view');
                }
            });
        }, { threshold: 0.5 });
        stepsObserver.observe(stepsSection);
    }

    // Sample dashboard carousel
    if ($('[data-slider]').length && $.fn.slick) {
        $('[data-slider]').slick({
            infinite: true,
            speed: 500,
            autoplaySpeed: 5000,
            autoplay: true,
            centerMode: true,
            centerPadding: '0',
            variableWidth: true,
            arrows: true,
            dots: true,
            responsive: [
                { breakpoint: 991, settings: { arrows: true } },
                { breakpoint: 767, settings: { arrows: false } },
                { breakpoint: 480, settings: { arrows: false, dots: true } }
            ]
        });
    }

    // Campaign credit links
    function openCouponLinks() {
        var links = {
            US: 'https://analytics.zoho.com/ZDBHome.cc?zdbreferer=bigin-wallet-credits&PLANID=15&WEBSITETRYNOW=true&COUPON_CODE=CSCANA_6_25',
            IN: 'https://analytics.zoho.in/ZDBHome.cc?zdbreferer=bigin-wallet-credits&PLANID=15&WEBSITETRYNOW=true&COUPON_CODE=CSCANA1_6_25'
        };
        var finalLink = '';

        if (typeof zohouser !== 'undefined' && zohouser.DC_INFO && links[zohouser.DC_INFO.toUpperCase()]) {
            finalLink = links[zohouser.DC_INFO.toUpperCase()];
        } else if (typeof CountryCode !== 'undefined' && links[CountryCode.toUpperCase()]) {
            finalLink = links[CountryCode.toUpperCase()];
        } else {
            finalLink = links.US;
        }

        document.querySelectorAll('[data-action="claim-credit"]').forEach(function (btn) {
            btn.setAttribute('href', finalLink);
            btn.setAttribute('target', '_blank');
        });
    }

    openCouponLinks();
    $('[data-action="claim-credit"]').on('click', function () {
        openCouponLinks();
    });

    // FAQ accordion
    $('.z-accordianBox').find('h4.active').next().slideDown();
    $('.z-accordianBox').find('h4').on('click', function () {
        var $trigger = $(this);
        if ($trigger.next().is(':visible')) {
            $trigger.removeClass('active');
            $trigger.next().hide('slow');
        } else {
            $('.z-accordianBox').find('h4').removeClass('active');
            $trigger.addClass('active');
            $('.z-accordianBox > ul').hide('slow');
            $trigger.next().slideDown();
        }
    });

});
