$(document).ready(function () {
    $('#tabs a').on('click', function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 100
        }, 700);
    });

    var rightContentTop = $('#right-content').offset().top;
    fixedNav(rightContentTop);

    $('.z-accordianBox').find('h4.active').next().slideDown();

    $('.z-accordianBox').find('h4').on('click', function () {
        var $heading = $(this);
        if ($heading.next().is(':visible')) {
            $heading.removeClass('active');
            $heading.next().slideUp();
        } else {
            $('.z-accordianBox h4').removeClass('active');
            $('.z-accordianBox > ul').slideUp();
            $heading.addClass('active');
            $heading.next().slideDown();
        }
    });
});

function pageMenu() {
    $('.cont-sec').each(function () {
        var scrollTop = $(window).scrollTop();
        var headerHeight = $('.product-header-top').outerHeight() || 0;
        if (scrollTop + headerHeight >= $(this).offset().top - 60) {
            var id = $(this).attr('id');
            if (id && $('#tabs li a[href$="#' + id + '"]').length) {
                $('#tabs li a').removeClass('active');
                $('#tabs li a[href$="#' + id + '"]').addClass('active');
            }
        }
    });
}

function fixedNav(startTop) {
    if (!$('#tabs').length) return;

    var width = $(window).width();
    if (width > 992) {
        var scrollTop = $(window).scrollTop();
        var $tabs = $('#tabs');
        if (scrollTop >= startTop) {
            $tabs.addClass('fixed');
        } else {
            $tabs.removeClass('fixed');
        }
        var sectionEnd = $('.tabsection').outerHeight() + $('.tabsection').offset().top - 400;
        if (scrollTop >= sectionEnd) {
            $tabs.removeClass('fixed').addClass('attach');
        } else if (scrollTop >= startTop) {
            $tabs.removeClass('attach').addClass('fixed');
        }
    } else {
        $('#tabs').hide();
    }
}

$(window).on('scroll', function () {
    var rightContentTop = $('#right-content').offset().top;
    fixedNav(rightContentTop);
    pageMenu();
});

$(window).on('resize', function () {
    var rightContentTop = $('#right-content').offset().top;
    fixedNav(rightContentTop);
});
