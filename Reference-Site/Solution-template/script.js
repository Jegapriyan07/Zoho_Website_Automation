// Testimonial video modal — click thumbnail to open the video in a popup
function initTestimonialVideoModal() {
    const modal = document.getElementById('testimonialVideoModal');
    if (!modal || modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';

    const frame = modal.querySelector('.video-modal-frame');
    const triggers = document.querySelectorAll('.video-thumb[data-video-url]');
    let lastFocused = null;

    function buildEmbedSrc(rawUrl) {
        try {
            const url = new URL(rawUrl, window.location.href);
            const host = url.hostname.toLowerCase();

            if (host.includes('youtube.com') || host === 'youtu.be') {
                let id = '';
                if (host === 'youtu.be') {
                    id = url.pathname.replace(/^\//, '');
                } else if (url.pathname.startsWith('/embed/')) {
                    return rawUrl;
                } else {
                    id = url.searchParams.get('v') || '';
                }
                if (!id) return rawUrl;
                return 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
            }

            if (host.includes('vimeo.com')) {
                if (host === 'player.vimeo.com') return rawUrl;
                const id = url.pathname.split('/').filter(Boolean).pop();
                if (id) return 'https://player.vimeo.com/video/' + encodeURIComponent(id) + '?autoplay=1';
            }

            // Zoho WorkDrive (and any other provider): embed the share URL as-is
            return rawUrl;
        } catch (e) {
            return rawUrl;
        }
    }

    function openModal(videoUrl) {
        if (!videoUrl) return;
        lastFocused = document.activeElement;
        const src = buildEmbedSrc(videoUrl);
        frame.innerHTML = '<iframe src="' + src + '" title="Customer testimonial video" '
            + 'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('video-modal-open');
        const closeBtn = modal.querySelector('.video-modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('video-modal-open');
        frame.innerHTML = '';
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    triggers.forEach(function (btn) {
        btn.addEventListener('click', function () {
            openModal(btn.getAttribute('data-video-url'));
        });
    });

    modal.addEventListener('click', function (e) {
        if (e.target.closest('[data-close-modal]')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialVideoModal);
} else {
    initTestimonialVideoModal();
}


// Insurance Analytics Section - Slider Functionality with Slick
(function () {
    var analyticsSlickInitialized = false;

    function initAnalyticsSlider() {
        if (!analyticsSlickInitialized && $('.analytics-slider').length) {
            // Slick slider settings
            var analyticsSlideSettings = {
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 8000, // 8 seconds
                arrows: true,
                dots: false,
                fade: false,
                speed: 600,
                pauseOnHover: true,
                pauseOnFocus: true,
                infinite: true,
                cssEase: 'ease-in-out'
            };

            // Initialize Slick slider
            $('.analytics-slider').slick(analyticsSlideSettings);

            // Set initial active button
            $('.nav-btn').removeClass('active');
            $('.nav-btn[data-index="0"]').addClass('active');

            // Update active button when slide changes
            $('.analytics-slider').on('afterChange', function (event, slick, currentSlide) {
                $('.nav-btn').removeClass('active');
                $('.nav-btn[data-index="' + currentSlide + '"]').addClass('active');
            });

            // Button click handlers - navigate to specific slide
            $('.nav-btn').on('click', function () {
                var index = parseInt($(this).attr('data-index'));
                $('.analytics-slider').slick('slickGoTo', index);
            });

            analyticsSlickInitialized = true;
        }
    }

    // Initialize on document ready
    $(document).ready(function () {
        initAnalyticsSlider();
    });

    // Initialize on scroll (lazy load)
    $(window).scroll(function () {
        if (!analyticsSlickInitialized) {
            var sliderTop = $('.analytics-slider-wrapper').offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();

            if (windowBottom >= sliderTop - 200) {
                initAnalyticsSlider();
            }
        }
    });

    // Reinitialize on window resize
    let _analyticsWinWidth = $(window).width();
    $(window).on('resize', function () {
        if (_analyticsWinWidth != $(window).width()) {
            if ($('.analytics-slider').hasClass('slick-initialized')) {
                var currentSlide = $('.analytics-slider').slick('slickCurrentSlide');
                $('.analytics-slider').slick('unslick');
                analyticsSlickInitialized = false;
                initAnalyticsSlider();
                if (currentSlide !== undefined) {
                    $('.analytics-slider').slick('slickGoTo', currentSlide);
                }
            }
        }
    });
})();


$(document).ready(function () {
    var s = $(".sticky-section .each-box-fort");
    var o = "#9AC7FF";
    var c = s.find(".scroll-card");
    var d = c.length;
    var r = [];
    c.each(function (s) {
        var o = (s + 1) * 18 + 80;
        $(this).css("top", o + "px");
        r.push($(this).offset().top)
    });
    function l(s, o) {
        s != d ? scaleVal = 1 - (d - s) * o : scaleVal = 1;
        $(c).eq(s - 1).css("transform", "scale(" + scaleVal + ",1)")
    }
    $(window).scroll(function () {
        var s = $(window).scrollTop();
        for (var o = 0; o < d; o++) {
            var a = r[o] - s;
            var e = c.eq(o).find(".bs-shad");
            var i = c.eq(o).outerHeight();
            var n = i;
            var t = 7e-4;
            if (d > 6) {
                t = 2e-4
            }
            while (a < n) {
                l(o + 1, t);
                n -= 50;
                if (d > 6) {
                    t += 2e-4
                } else {
                    t += 7e-4
                }
            }
            if (a > i + 50) {
                c.eq(o).css("transform", "scale(1,1)")
            }
        }
    })
});

$('.za-gartner-wrap').slick({
    dots: true,
    arrows: false,
    infinite: false,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    speed: 500,
});

function numberAnimate() {
    $('.za-promo-section .zwe-ob .counts').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 2000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}

let countVal = 0;
$(window).on("scroll", function () {
    if (countVal == 0 && $(".za-promo-section .zwe-ob .counts").length > 0) {
        countVal++;
        numberAnimate();
    }
    zTtip();
});

function zTtip() {
    let wW = $(window).outerWidth();
    if (wW > 990) {
        let winTop = $(window).scrollTop();
        let elmFix = $('.zdb-tooltip');
        if (winTop > 100) {
            elmFix.addClass('active');
        }
    }
}


$('.report-slider').slick({
    dots: true,
    arrows: false,
    infinite: false,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    speed: 500,
});



