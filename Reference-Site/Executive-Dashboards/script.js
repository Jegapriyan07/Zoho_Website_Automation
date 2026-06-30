if (typeof $ !== 'undefined' && $.fn && typeof $.fn.slick === 'function') {
    $(".report-slider").slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerPadding: '60px',
        speed: 1000,
        autoplay: true,
        dots: true,
        arrows: false,
        fade: true,
        adaptiveHeight: true,
    });

    $(".image-wrapper .content-wrap").slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerPadding: '60px',
        autoplay: true,
        dots: true,
        arrows: false,
        speed: 2000,
        fade: true,
        adaptiveHeight: true,
    });
}

if (typeof customvar !== 'undefined' && customvar && customvar.numberOfUsers != null) {
    $('.zc-count').text(customvar.numberOfUsers);
}
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

// Steps section — tabbed accordion with auto-advancing progress
document.addEventListener("DOMContentLoaded", function () {
    const stepsSection = document.querySelector(".steps-section");
    if (!stepsSection) return;

    const tabList = stepsSection.querySelector(".steps-tab-list");
    const tabs = Array.from(stepsSection.querySelectorAll(".steps-tab"));
    const visuals = Array.from(stepsSection.querySelectorAll(".steps-visual"));
    const triggers = Array.from(stepsSection.querySelectorAll(".steps-tab-btn"));
    const progressBars = Array.from(stepsSection.querySelectorAll(".steps-progress"));
    if (!tabs.length) return;

    let started = false;

    function activate(index) {
        tabs.forEach(function (tab, i) {
            tab.classList.toggle("active", i === index);
        });
        visuals.forEach(function (visual, i) {
            const isActive = i === index;
            visual.classList.toggle("active", isActive);
            const vid = visual.querySelector("video");
            if (vid) {
                if (isActive) {
                    vid.currentTime = 0;
                    vid.play();
                } else {
                    vid.pause();
                }
            }
        });
        progressBars.forEach(function (bar) {
            bar.classList.remove("running");
        });
        void progressBars[index].offsetWidth;
        progressBars[index].classList.add("running");
    }

    progressBars.forEach(function (bar, index) {
        bar.addEventListener("animationend", function (e) {
            if (e.animationName !== "stepsProgress") return;
            if (!bar.classList.contains("running")) return;
            activate((index + 1) % tabs.length);
        });
    });

    triggers.forEach(function (btn, index) {
        btn.addEventListener("click", function () {
            activate(index);
        });
    });

    if (tabList) {
        tabList.addEventListener("mouseenter", function () {
            stepsSection.classList.add("paused");
        });
        tabList.addEventListener("mouseleave", function () {
            stepsSection.classList.remove("paused");
        });
    }

    const stepsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;
                activate(0);
            }
        });
    }, { threshold: 0.15 });

    stepsObserver.observe(stepsSection);
});