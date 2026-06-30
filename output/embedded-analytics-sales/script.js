/* Embedded Analytics clone — page-specific JS only */

(function ($) {
    'use strict';

    $(function () {
    $('.sticky-section').each(function () {
        var s = $(this).find('.each-box-fort');
        var c = s.find('.scroll-card');
        var d = c.length;
        var r = [];

        c.each(function (i) {
            var offset = (i + 1) * 18 + 100;
            $(this).css('top', offset + 'px');
            r.push($(this).offset().top);
        });

        function applyScale(index, scale) {
            var scaleVal = index !== d ? 1 - (d - index) * scale : 1;
            $(c).eq(index - 1).css('transform', 'scale(' + scaleVal + ',1)');
        }

        $(window).on('scroll', function () {
            var scrollTop = $(window).scrollTop();

            for (var i = 0; i < d; i++) {
                var cardTop = r[i] - scrollTop;
                var card = c.eq(i);
                var cardHeight = card.outerHeight();
                var scaleThreshold = cardHeight;
                var scaleIncrement = d > 6 ? 2e-4 : 7e-4;

                while (cardTop < scaleThreshold) {
                    applyScale(i + 1, scaleIncrement);
                    scaleThreshold -= 50;
                    scaleIncrement += d > 6 ? 2e-4 : 7e-4;
                }

                if (cardTop > cardHeight + 50) {
                    card.css('transform', 'scale(1,1)');
                }
            }
        });

        $(window).trigger('scroll');
    });

    /* Testimonial slick slider */
    var imgSlider = document.querySelector('.img-slider');

    if (imgSlider && $.fn.slick) {
        $(imgSlider).slick({
            centerMode: true,
            centerPadding: '0',
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            speed: 1000,
            arrows: false,
            dots: true,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        centerMode: true,
                        centerPadding: '40px',
                        slidesToShow: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '40px',
                        slidesToShow: 1
                    }
                }
            ]
        });

        $(imgSlider).on('afterChange', function (event, slick, currentSlide) {
            setTimeout(function () {
                var activeSlide = slick.$slides.eq(currentSlide).attr('data-testimonial');
                document.querySelectorAll('.testi-content').forEach(function (el) {
                    el.classList.remove('active');
                });
                var activeContent = document.querySelector('.' + activeSlide);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            }, 100);
        });
    }

    /* FAQ accordion — h4 click (Embedded Analytics pattern) */
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
    });
})(jQuery);
