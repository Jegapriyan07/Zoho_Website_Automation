const tabs = document.querySelectorAll('.tab-btn');

const sections = [
    document.querySelector('#introduction'),
    document.querySelector('#AI-powered-embedded-analytics'),
    document.querySelector('#Embed-for-AI-Powered-Analytics'),
    document.querySelector('#Examples'),
    document.querySelector('#How-to-Embed-AI-Analytics'),
    document.querySelector('#Use-case'),
    document.querySelector('#Get-Started')
];

// Scroll to section on tab click
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        const section = sections[index];
        const h2 = section.querySelector('h2');

        const headerOffset = 150;
        const elementPosition = h2.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Highlight tab when section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target);
            tabs.forEach(tab => tab.classList.remove('active'));
            if (tabs[index]) tabs[index].classList.add('active');
        }
    });
}, {
    threshold: 0.6
});

sections.forEach(section => observer.observe(section));

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

jQuery(document).ready(function () {
    // form section
    $('.zcontact-form').on('click', function (e) {
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

$('.features-tabs-menu li').click(function () {
    var id = $(this).attr('data-id');
    $('.features-tabs-menu li').removeClass('active');
    $('.features-list').removeClass('active');
    $(this).addClass('active');
    $('#' + id).addClass('active');
    var hwidth = $(this).width();
    var hleft = $(this).offset().left;
    var tableft = $('.features-tabs-menu').offset().left;
    $('.high-light').css({ 'width': hwidth, 'left': hleft - tableft });
});

$(document).ready(function () {
    const targetHrefs = [
        '/analytics/glossary/embedded-reporting-tool.html',
        '/analytics/embedded-bi.html',
        '/analytics/embedded-dashboards.html',
        '/analytics/embedded-analytics-sales.html',
        '/analytics/insightshq/5-best-ai-data-visualization-tools.htmll',
        '/analytics/insightshq/5-best-ai-data-visualization-tools.html',
        '/analytics/features/predictive-ai.html'
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