/* HR & Workforce dashboard examples — page-specific JS */

(function ($) {
    'use strict';

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

document.addEventListener('DOMContentLoaded', function () {
    var onScrollEls = document.querySelectorAll('[data-onscroll]');
    if (onScrollEls.length) {
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

    var stepsSection = document.querySelector('.steps-section');
    if (stepsSection) {
        var tabList = stepsSection.querySelector('.steps-tab-list');
        var tabs = Array.from(stepsSection.querySelectorAll('.steps-tab'));
        var visuals = Array.from(stepsSection.querySelectorAll('.steps-visual'));
        var triggers = Array.from(stepsSection.querySelectorAll('.steps-tab-btn'));
        var progressBars = Array.from(stepsSection.querySelectorAll('.steps-progress'));

        if (tabs.length) {
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
        }
    }

    /* Sticky-stack scroll scale */
    var stickyWrap = document.querySelector('.sticky-section .each-box-fort');
    if (stickyWrap && typeof jQuery !== 'undefined') {
        var $cards = jQuery(stickyWrap).find('.scroll-card');
        var cardCount = $cards.length;
        var offsets = [];

        $cards.each(function (index) {
            var topPx = (index + 1) * 18 + 80;
            jQuery(this).css('top', topPx + 'px');
            offsets.push(jQuery(this).offset().top);
        });

        function scaleCard(cardIndex, step) {
            var scaleVal = cardIndex !== cardCount ? 1 - (cardCount - cardIndex) * step : 1;
            $cards.eq(cardIndex - 1).css('transform', 'scale(' + scaleVal + ',1)');
        }

        jQuery(window).on('scroll', function () {
            var scrollTop = jQuery(window).scrollTop();
            for (var i = 0; i < cardCount; i++) {
                var dist = offsets[i] - scrollTop;
                var cardHeight = $cards.eq(i).outerHeight();
                var threshold = cardHeight;
                var step = cardCount > 6 ? 0.0002 : 0.0007;
                while (dist < threshold) {
                    scaleCard(i + 1, step);
                    threshold -= 50;
                    step += cardCount > 6 ? 0.0002 : 0.0007;
                }
                if (dist > cardHeight + 50) {
                    $cards.eq(i).css('transform', 'scale(1,1)');
                }
            }
        });
    }
});
