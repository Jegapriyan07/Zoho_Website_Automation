document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".threeSimpleSteps-section");

    if (section) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        section.classList.add("in-view");
                        section.classList.remove("not-in-view");
                    } else {
                        section.classList.add("not-in-view");
                        section.classList.remove("in-view");
                    }
                });
            },
            {
                threshold: 0.5,
            }
        );

        observer.observe(section);
    }
});


$('.sampleDashboard-image ul').slick({
    infinite: true,
    speed: 500,
    autoplaySpeed: 5000,
    autoplay: true,
    centerMode: true,
    centerPadding: "0",
    variableWidth: true,

    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: false,
                variableWidth: false
            }
        }
    ]
});

$('.sampleDashboard-image-mobile ul').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    centerMode: true,
    centerPadding: "0",
    variableWidth: false
});

function openCouponLinks() {
    const getRedeemBtns = document.querySelectorAll(".dwnload-btn");
    const links = {
        US: "https://analytics.zoho.com/ZDBHome.cc?zdbreferer=inventory-wallet-credits&PLANID=15&WEBSITETRYNOW=true&COUPON_CODE=CSCANA_8_25",
        IN: "https://analytics.zoho.in/ZDBHome.cc?zdbreferer=inventory-wallet-credits&PLANID=15&WEBSITETRYNOW=true&COUPON_CODE=CSCANA1_8_25"
    };

    let finalLink = "";

    if (typeof zohouser !== "undefined" && zohouser.DC_INFO) {
        let dcInfo = zohouser.DC_INFO.toUpperCase();
        if (links[dcInfo]) {
            finalLink = links[dcInfo];
        }
    }

    if (!finalLink && typeof CountryCode !== "undefined") {
        let countryCodeUpper = CountryCode.toUpperCase();
        if (links[countryCodeUpper]) {
            finalLink = links[countryCodeUpper];
        }
    }

    if (!finalLink) {
        finalLink = links["US"];
    }

    getRedeemBtns.forEach(btn => {
        btn.setAttribute("href", finalLink);
        btn.setAttribute("target", "_blank");
    });
}

if ($(".report-slider").length) {
    $(".report-slider").slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerPadding: '60px',
        speed: 1000,
        autoplay: true,
        dots: true,
        arrows: false,
        speed: 1000,
        fade: true,
        adaptiveHeight: true,
    });
}

var getZCount = typeof customvar !== "undefined" ? customvar.numberOfUsers : 0;
if ($('.zc-count').length) {
    $('.zc-count').text(getZCount);
}

if ($('.z-accordianBox').length) {
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
}

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
