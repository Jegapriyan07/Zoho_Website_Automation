$(document).ready(function () {
    $("#tabs a").click(function (s) {
        s.preventDefault();
        var i = $(this).attr("href");
        $("html, body").animate({
            scrollTop: $(i).offset().top - 100
        }, 700, function () { })
    });
    var s = $("#right-content").offset().top;
    fixedNav(s)
});
function pageMenu() {
    $(".cont-sec").each(function () {
        var s = jQuery(window).scrollTop()
            , i = jQuery(".product-header-top").outerHeight();
        if (s + i >= jQuery(this).offset().top - 60) {
            var e = $(this).attr("id");
            if (e) {
                if ($('#tabs li a[href$="#' + e + '"]').length > 0) {
                    var t = $('#tabs li a[href$="#' + e + '"]').position().top;
                    if (typeof t !== "undefined") {
                        $("#tabs li a").removeClass("active");
                        $('#tabs li a[href$="#' + e + '"]').addClass("active")
                    }
                }
            }
        }
    })
}
function fixedNav(s) {
    if ($("#tabs").length > 0) {
        var i = $(window).width();
        if (i > 992) {
            var e = $(window).scrollTop();
            var t = $("#tabs");
            if (e >= s) {
                t.addClass("fixed")
            } else {
                t.removeClass("fixed")
            }
            var a = $(".tabsection").outerHeight() + $(".tabsection").offset().top - 400;
            if (e >= a) {
                $("#tabs").removeClass("fixed");
                $("#tabs").addClass("attach")
            } else if (e >= s) {
                $("#tabs").removeClass("attach");
                $("#tabs").addClass("fixed")
            }
        } else {
            $("#tabs").hide()
        }
    }
}
$(window).scroll(function () {
    var s = $("#right-content").offset().top;
    fixedNav(s);
    pageMenu()
});
$(window).resize(function () {
    var s = $("#right-content").offset().top;
    fixedNav(s)
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