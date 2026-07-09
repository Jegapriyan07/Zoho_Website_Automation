$(document).ready(function () {
    $("#tabs a").click(function (e) {
        e.preventDefault();
        var target = $(this).attr("href");
        $("html, body").animate({
            scrollTop: $(target).offset().top - 100
        }, 700);
    });

    var contentTop = $("#right-content").offset().top;
    fixedNav(contentTop);
});

function pageMenu() {
    $(".cont-sec").each(function () {
        var scrollTop = $(window).scrollTop();
        var headerHeight = $(".product-header-top").outerHeight() || 0;
        if (scrollTop + headerHeight >= $(this).offset().top - 60) {
            var sectionId = $(this).attr("id");
            if (sectionId && $('#tabs li a[href$="#' + sectionId + '"]').length > 0) {
                $("#tabs li a").removeClass("active");
                $('#tabs li a[href$="#' + sectionId + '"]').addClass("active");
            }
        }
    });
}

function fixedNav(contentTop) {
    if ($("#tabs").length === 0) return;

    var viewportWidth = $(window).width();
    if (viewportWidth > 992) {
        var scrollTop = $(window).scrollTop();
        var tabs = $("#tabs");
        if (scrollTop >= contentTop) {
            tabs.addClass("fixed");
        } else {
            tabs.removeClass("fixed");
        }
        var sectionEnd = $(".tabsection").outerHeight() + $(".tabsection").offset().top - 400;
        if (scrollTop >= sectionEnd) {
            tabs.removeClass("fixed").addClass("attach");
        } else if (scrollTop >= contentTop) {
            tabs.removeClass("attach").addClass("fixed");
        }
    } else {
        $("#tabs").hide();
    }
}

$(window).scroll(function () {
    var contentTop = $("#right-content").offset().top;
    fixedNav(contentTop);
    pageMenu();
});

$(window).resize(function () {
    var contentTop = $("#right-content").offset().top;
    fixedNav(contentTop);
});

$('.z-accordianBox').find('h4.active').next().slideDown();

$('.z-accordianBox').find('h4').on('click', function () {
    var heading = $(this);
    if (heading.next().is(':visible')) {
        heading.removeClass('active');
        heading.next().slideUp();
    } else {
        $('.z-accordianBox h4').removeClass('active');
        $('.z-accordianBox > ul').slideUp();
        heading.addClass('active');
        heading.next().slideDown();
    }
});
