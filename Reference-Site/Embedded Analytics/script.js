const initAccordions = (sectionWrapperId) => {
    const sectionWrapper = document.getElementById(sectionWrapperId);
    if (!sectionWrapper) return;

    const accordions = sectionWrapper.querySelectorAll(".accordion");
    const accordionImages = sectionWrapper.querySelectorAll(".accordion-image");
    let currentAccordionIndex = 0;
    const intervalTime = 12000;
    let progressInterval;
    let isPaused = false;

    const resetAllAccordions = () => {
        accordions.forEach((accordion) => {
            accordion.classList.remove("accordion_active");
            const progressBar = accordion.querySelector(".progress-bar");
            if (progressBar) {
                progressBar.style.transition = "none";
                progressBar.style.height = "0%";
            }
        });
    };

    const openAccordion = (index) => {
        resetAllAccordions();
        const activeAccordion = accordions[index];
        activeAccordion.classList.add("accordion_active");
        const progressBar = activeAccordion.querySelector(".progress-bar");
        if (progressBar) resetProgressBar(progressBar, intervalTime);
        toggleImage(index);
        currentAccordionIndex = index;
    };

    const resetProgressBar = (progressBar, duration) => {
        if (!progressBar) return;
        progressBar.style.transition = "none";
        progressBar.style.height = "0%";
        setTimeout(() => {
            progressBar.style.transition = `height ${duration / 1000}s linear`;
            progressBar.style.height = "100%";
        }, 10);
    };

    const switchToNextAccordion = () => {
        const nextIndex = (currentAccordionIndex + 1) % accordions.length;
        openAccordion(nextIndex);
    };

    const startAutomation = () => {
        stopAutomation();
        progressInterval = setInterval(() => {
            if (!isPaused) {
                switchToNextAccordion();
            }
        }, intervalTime);
    };

    const stopAutomation = () => {
        clearInterval(progressInterval);
    };

    accordions.forEach((accordion, index) => {
        const intro = accordion.querySelector(".accordion_intro");

        if (!accordion.querySelector(".progress-bar")) {
            const progressBar = document.createElement("div");
            progressBar.classList.add("progress-bar");
            intro.appendChild(progressBar);
        }

        intro.addEventListener("click", () => {
            openAccordion(index);
            startAutomation();
        });
    });

    const toggleImage = (index) => {
        accordionImages.forEach((img, i) => {
            img.classList.toggle("active", i === index);
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                resetAllAccordions();
                openAccordion(0);
                startAutomation();
            } else {
                stopAutomation();
                resetAllAccordions();
            }
        });
    }, { threshold: 0.8 });

    observer.observe(sectionWrapper);
};

document.addEventListener("DOMContentLoaded", function () {
    initAccordions("data-integration");
});


document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".sections");
    const imageContainer = document.querySelector(".image-container");
    const image = document.querySelector(".image");
    const images = [
        "/sites/zweb/images/analytics/zafn-dataprep-studio.jpg",
        "/sites/zweb/images/analytics/feature/executive-dashboard.jpg",
        "/sites/zweb/images/analytics/zaf-ext-apis.webp",
        "/sites/zweb/images/analytics/feature/za-zia-question.png",
        "/sites/zweb/images/analytics/analytics-on-the-move-version2.png",
        "/sites/zweb/images/analytics/feature/cloud.jpeg",
    ];

    let currentSectionIndex = 0;

    function changeImage(sectionIndex) {
        if (sectionIndex >= 0 && sectionIndex < images.length) {
            const newImageSrc = images[sectionIndex];
            const newImage = new Image();
            newImage.src = newImageSrc;

            newImage.onload = function () {
                imageContainer.style.opacity = 0;
                setTimeout(function () {
                    image.src = newImageSrc;
                    imageContainer.style.opacity = 1;
                }, 300);
            };
        }
    }

    function handleIntersect(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const sectionIndex = parseInt(entry.target.dataset.index);
                if (sectionIndex !== currentSectionIndex) {
                    currentSectionIndex = sectionIndex;
                    changeImage(sectionIndex);
                }
                entry.target.classList.add("fade-in");
            } else {
                entry.target.classList.remove("fade-in");
            }
        });
    }

    const observer = new IntersectionObserver(handleIntersect, {
        root: null,
        threshold: 0.5,
        rootMargin: "-25% 0px -25% 0px",
    });

    sections.forEach((section, index) => {
        section.dataset.index = index;
        observer.observe(section);
    });

    changeImage(0);

    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeModal = document.querySelector(".close");

    imageContainer.addEventListener("click", function () {
        modal.style.display = "flex";
        modalImage.src = image.src;
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

const imgSlider = document.querySelector(".img-slider");

if (imgSlider) {
    $(imgSlider).slick({
        centerMode: true,
        centerPadding: "0",
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
                    centerPadding: "40px",
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 1
                }
            }
        ]
    });

    $(imgSlider).on("afterChange", function (event, slick, currentSlide) {
        setTimeout(() => {
            let activeSlide = slick.$slides.eq(currentSlide).attr("data-testimonial");
            document.querySelectorAll(".testi-content").forEach(el => el.classList.remove("active"));
            document.querySelector("." + activeSlide)?.classList.add("active");
        }, 100);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("adsModal").style.display = "flex";
    }, 180000);

    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("adsModal").style.display = "none";
    });
    window.addEventListener("click", (event) => {
        if (event.target === document.getElementById("adsModal")) {
            document.getElementById("adsModal").style.display = "none";
        }
    });
});


var getZCount = customvar.numberOfUsers;
$('.zc-count').text(getZCount);
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

jQuery(document).ready(function () {
    // form section
    $('.zcontact-form').on('click', function (e) {
        e.preventDefault();
        $('.formSec').addClass("active zbiframe").css('transition', 'all ease 0.75s');
        $('.formSec').addClass('bookMyDemo');
        $('#czone-home').hide();
        $('.zbookings-form').show();
        $(".freeze_layer").fadeIn(400);
        $('body').addClass('fixed-pos');
        $(".zsiq_theme1.zsiq_floatmain").hide();
    });

    $('.zreq-form').on('click', function (e) {
        e.preventDefault();
        $(".formSec").addClass("active").css('transition', 'all ease 0.75s');
        $('.formSec').addClass('priceQuote');
        $('.zbookings-form').hide();
        $('#czone-home').show();
        $(".freeze_layer").fadeIn(400);
        $('body').addClass('fixed-pos');
        $(".zsiq_theme1.zsiq_floatmain").hide();
    });

    // form section closing 
    $(".form-close,.freeze_layer").on('click', function () {
        $(".formSec").removeClass("active zbiframe");
        $('.formSec').removeClass('bookMyDemo');
        $('.formSec').removeClass('priceQuote');
        $(".freeze_layer").fadeOut(100);
        $('body').removeClass('fixed-pos');
        $(".zsiq_theme1.zsiq_floatmain").show();
    });

    $(window).on('load', function () {
        setTimeout(function () {
            // adding class to signup btn
            $('.zgh-signup').addClass('scrollstop');
            $('.scrollstop').attr('style', 'display:inline-block');
        }, 1000);

        // param for iframe
        let zcf_marketing_source, zsignup_url, zcf_mr_url;
        zcf_marketing_source = customvar.czms().split('|')[0]; //Testsource
        zsignup_url = window.location.href; //testurl.zoho.com
        zcf_mr_url = customvar.czmr(); //testmarketing%20url

        var iframeLink
        if (countryEu.indexOf(CountryCode) > -1) {
            iframeLink = 'https://zohocorp.zohobookings.eu/portal-embed#/115569000002460704?Marketing%20Source=' + zcf_marketing_source + '&Signup%20URL=' + zsignup_url + '&Marketing%20Ref%20URL=' + zcf_mr_url + '';
        } else {
            iframeLink = 'https://assist.zohobookings.com/portal-embed#/3846319000024144874?Marketing%20Source=' + zcf_marketing_source + '&Signup%20URL=' + zsignup_url + '&Marketing%20Ref%20URL=' + zcf_mr_url + '';
        }

        $('.zbookings-form iframe').attr('src', iframeLink);
    });
});

jQuery(window).scroll(function () {
    jQuery(".solu-box-wrap-main").each(function (e) {
        var t = jQuery(this).offset().top + jQuery(this).outerHeight();
        var a = jQuery(window).scrollTop() + jQuery(window).height();
        if (a > t) {
            jQuery(this).animate({
                opacity: "1"
            }).addClass("animation-open")
        }
    })
    let e = $(window).scrollTop();
    if (e >= 500) {
        $(".za-hdr").addClass("zhdr-stcky");
        $(".za-hdr-logo img").attr("src", "/sites/zweb/images/productlogos/analytics.svg")
    } else {
        $(".za-hdr").removeClass("zhdr-stcky");
        $(".za-hdr-logo img").attr("src", "/sites/zweb/images/productlogos/analytics-dark.svg")
    }
});

$(document).ready(function () {
    const targetHrefs = [
        '/analytics/insightshq/top-bi-tools.html',
        '/analytics/self-service-analytics-platform.html',
        '/analytics/glossary/embedded-reporting-tool.html',
        '/analytics/glossary/what-is-bi-reporting.html',
        '/analytics/embedded-analytics-saas.html',
        '/analytics/embedded-analytics-sales.html',
    ];

    let ranLangRemove = false;

    $('a').each(function () {
        const href = $(this).attr('href');
        if (href && targetHrefs.some(path => href.includes(path))) {
            $(this).addClass('nonlang');

            if (!ranLangRemove && typeof customvar !== 'undefined' && typeof customvar.langsrcremove === 'function') {
                customvar.langsrcremove();
                ranLangRemove = true;
            }

        }
        customvar.langsrcremove();

    });
});

$(document).ready(function () {
    var s = $(".sticky-section .each-box-fort");
    var c = s.find(".scroll-card");
    var d = c.length;
    var r = [];

    // Set top offsets and store absolute top positions
    c.each(function (i) {
        var offset = (i + 1) * 18 + 100;
        $(this).css("top", offset + "px");
        r.push($(this).offset().top);
    });

    // Utility to apply scaling to cards
    function applyScale(index, scale) {
        var scaleVal = index !== d ? 1 - (d - index) * scale : 1;
        $(c).eq(index - 1).css("transform", "scale(" + scaleVal + ",1)");
    }

    // Utility to check if element is in viewport
    function isInViewport(el) {
        var elementTop = el.offset().top;
        var elementBottom = elementTop + el.outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        return elementBottom > viewportTop + 100 && elementTop < viewportBottom - 100;
    }

    // Scroll handler
    $(window).on("scroll", function () {
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
                card.css("transform", "scale(1,1)");
            }

            // 🔹 Card 7: Play <video> when in viewport
            if (card.hasClass("card7") && isInViewport(card)) {
                var video = card.find("video")[0];
                if (video && video.paused) {
                    video.play().catch(function (e) {
                        console.warn("Autoplay failed:", e);
                    });
                }
            }

            // 🔹 Card 8: Lazy load iframe with autoplay
            if (card.hasClass("card8") && isInViewport(card)) {
                var iframe = card.find("iframe");
                if (iframe.length && !iframe.attr("src")) {
                    var dataSrc = iframe.attr("data-src");
                    if (dataSrc) {
                        iframe.attr("src", dataSrc);
                    }
                }
            }
        }
    });

    // Trigger scroll once on load
    $(window).trigger("scroll");
});


document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".threeSimpleSteps-section");

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
});