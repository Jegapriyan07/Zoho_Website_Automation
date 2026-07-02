/* Feature grid template — page-specific JS */

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
});
