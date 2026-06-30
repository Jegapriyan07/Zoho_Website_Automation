$(document).ready(function () {
    var isClickScrolling = false;
    var clickScrollTimer = null;
    var ticking = false;

    function scrollTabIntoView($link) {
        var $tabs = $("#tabs");
        if (!$tabs.length || !$link.length) return;

        var tabsTop = $tabs.offset().top;
        var tabsBottom = tabsTop + $tabs.outerHeight();
        var linkTop = $link.offset().top;
        var linkBottom = linkTop + $link.outerHeight();

        if (linkTop < tabsTop) {
            $tabs.stop(true).animate(
                { scrollTop: $tabs.scrollTop() - (tabsTop - linkTop) - 10 },
                300
            );
        } else if (linkBottom > tabsBottom) {
            $tabs.stop(true).animate(
                { scrollTop: $tabs.scrollTop() + (linkBottom - tabsBottom) + 10 },
                300
            );
        }
    }

    $("#tabs a").on("click", function (e) {
        e.preventDefault();
        var targetSelector = $(this).attr("href");
        var $target = $(targetSelector);
        if (!$target.length) return;

        $("#tabs li a").removeClass("active");
        $(this).addClass("active");
        scrollTabIntoView($(this));

        isClickScrolling = true;
        if (clickScrollTimer) clearTimeout(clickScrollTimer);

        $("html, body").stop(true).animate({
            scrollTop: $target.offset().top - 100
        }, 600, "swing", function () {
            clickScrollTimer = setTimeout(function () {
                isClickScrolling = false;
            }, 80);
        });
    });

    function getRightContentTop() {
        var $rc = $("#right-content");
        return $rc.length ? $rc.offset().top : 0;
    }

    function pageMenu() {
        if (isClickScrolling) return;

        var scrollTop = $(window).scrollTop();
        var headerOffset = $(".product-header-top").outerHeight() || 0;
        var trigger = scrollTop + headerOffset + 60;
        var currentId = null;

        $(".cont-sec").each(function () {
            if (trigger >= $(this).offset().top) {
                currentId = this.id;
            }
        });

        if (!currentId) return;

        var $activeLink = $('#tabs li a[href$="#' + currentId + '"]');
        if ($activeLink.length && !$activeLink.hasClass("active")) {
            $("#tabs li a").removeClass("active");
            $activeLink.addClass("active");
            scrollTabIntoView($activeLink);
        }
    }

    function fixedNav(threshold) {
        var $tabs = $("#tabs");
        if (!$tabs.length) return;

        if ($(window).width() <= 992) {
            $tabs.hide();
            return;
        }
        $tabs.show();

        var scrollTop = $(window).scrollTop();
        if (scrollTop >= threshold) {
            $tabs.addClass("fixed");
        } else {
            $tabs.removeClass("fixed");
        }
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            fixedNav(getRightContentTop());
            pageMenu();
            ticking = false;
        });
    }

    fixedNav(getRightContentTop());
    $(window).on("scroll", onScroll);
    $(window).on("resize", function () {
        fixedNav(getRightContentTop());
    });
});

$('.sampleDashboard-image ul').slick({
    infinite: true,
    // slidesToShow: 3,
    // slidesToScroll: 1,
    speed: 500,
    autoplaySpeed: 5000,
    infinite: true,
    autoplay: true,
    centerMode: true,
    centerPadding: "0",
    variableWidth: false,
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
    variableWidth: false // Change to false if images should be the same width
});

if (typeof customvar !== "undefined" && customvar.numberOfUsers) {
    $('.zc-count').text(customvar.numberOfUsers);
}

$('.z-accordianBox').find('h4.active').next().slideDown();

$('.z-accordianBox').find('h4').on('click', function () {
    var _that = $(this);
    if (_that.next().is(':visible')) {
        _that.removeClass('active');
        _that.next().slideUp();
    } else {
        $('.z-accordianBox h4').removeClass('active');
        $('.z-accordianBox > ul').slideUp();
        _that.addClass('active');
        _that.next().slideDown();
    }
});

jQuery(document).ready(function () {
    // form section
    $('.book-btn').on('click', function (e) {
        e.preventDefault();
        $('.formSec').addClass("active zbiframe").css('transition', 'all ease 0.75s');
        $('.formSec').addClass("bookMyDemo");
        $('#czone-home').hide();
        $('.zbookings-form').show();
        $(".freeze_layer").fadeIn(400);
        $('body').addClass('fixed-pos');
        $(".zsiq_theme1.zsiq_floatmain").hide();
    });

    $('.zreq-form').on('click', function (e) {
        e.preventDefault();
        $(".formSec").addClass("active").css('transition', 'all ease 0.75s');
        $('.formSec').addClass("priceQuote");
        $('.zbookings-form').hide();
        $('#czone-home').show();
        $(".freeze_layer").fadeIn(400);
        $('body').addClass('fixed-pos');
        $(".zsiq_theme1.zsiq_floatmain").hide();
    });

    // form section closing 
    $(".form-close,.freeze_layer").on('click', function () {
        $(".formSec").removeClass("active zbiframe");
        $('.formSec').removeClass("bookMyDemo");
        $('.formSec').removeClass("priceQuote");
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
            iframeLink = 'https://bookings.zohocorp.com/portal-embed#/3846319000024144874?Marketing%20Source=' + zcf_marketing_source + '&Signup%20URL=' + zsignup_url + '&Marketing%20Ref%20URL=' + zcf_mr_url + '';
        }

        $('.zbookings-form iframe').attr('src', iframeLink);
    });
});