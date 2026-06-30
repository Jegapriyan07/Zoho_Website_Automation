/* ============================================
   PRICING PAGE - MAIN SCRIPT
   ============================================ */

// ============================================================================
// SECTION 1: TRUST ICON DATA CONFIGURATION
// ============================================================================

/* Trust Icon Lists - Regional Brand Logos */
const inTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/hdfc.svg', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/mahindra.svg', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/larsen-toubro.png', _imgWidth: 170 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/nippon-paint.png', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/tata-communications.svg', _imgWidth: 220 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/weikfield.png', _imgWidth: 100 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/casagrand.png', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/zomato.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/vedantu.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kotak.png', _imgWidth: 130 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/coromandel.png', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/infosys-knowledge-institute.svg', _imgWidth: 180 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/wipro-foundation.png', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sun-pharma.png', _imgWidth: 40 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/thermax-global.svg', _imgWidth: 40 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/wns.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/mckinsey.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cisco.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/spykar.png', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/bennett-coleman.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/viacom18.png', _imgWidth: 110 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/tnpl.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/supreme-industries.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/freight-tiger.png', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sun-jewels.svg', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/lixil.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/printo.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/disys.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/minda-corporation.png', _imgWidth: 120 }
];

const laTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/gdm-seeds.svg', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/eficacia.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-promax.png', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/holcim.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/wisynco.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/pilgrims.png', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/uol.svg', _imgWidth: 90 }
];

const afTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/smollan.svg', _imgWidth: 130 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/glencore.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/pg-group.png', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/avelabs.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg', _imgWidth: 100 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/nahdet-misr.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kwal.png', _imgWidth: 55 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/juta.svg', _imgWidth: 90 }
];

const ukTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/nhs.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kantar.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/globalstar.png', _imgWidth: 110 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/jcb.svg', _imgWidth: 85 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/shell.svg', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/foyle.svg', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/iris.png', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/vectura.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/alight-llc.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cadent-gas.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/rgis.png', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/evo.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/dps-group.png', _imgWidth: 200 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/emr.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/das-house.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kelly-group.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/oliver.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/exertis.png', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/itransition.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/knights.png' }
];

const euTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/loreal.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/jlr.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/acer.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/securitas-direct.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/plastipak.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/jas.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/neonet.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-premo.png', _imgWidth: 130 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/suez.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/pierre-fabre.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/coloplast.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/groupe-beaumanoir.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kelly.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/hormann.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/tsg.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/concern.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/oetiker.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/agro-merchants.png', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/paccor.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/globalvia.png', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/bama.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sygnity.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/innovecs.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/alira-health.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/thieme.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sintef.svg', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kompan.svg' }
];

const usTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/dennys.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kaiser-permanente.svg', _imgWidth: 110 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/caterpillar.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/mitsubishi-heavy-industries.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/leggett-platt.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/yamaha-financial-services.png', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/johnson-controls.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cummins.svg', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/ima-group.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/flex.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/oaktree-capital.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/labcorp.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cbre.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/creme-de-la.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/aveanna.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/amplity-health.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sun-chemical.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/coach.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/capital-express.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/dole.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/heb.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/encora-digital.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/the-planet-group.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/eide-bailly.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/roadrunner-logistics.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/kerry-logistics.png' }
];

const jpTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/fujifilm.svg', _imgWidth: 110 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/honda.svg', _imgWidth: 135 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/saraya.png', _imgWidth: 150 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/inpex-corporation.svg', _imgWidth: 140 }
];

const caTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/go-auto.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/physiotec.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/bakers-delight.png', _imgWidth: 130 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/vancouver-coastal-health.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cima.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/laura.svg' }
];

const cnTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/season-group.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/tianjin-wanda-tyre.png', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/trane-technologies.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/high-fashion.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/com-lan.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cloudwise.svg', _imgWidth: 160 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/peninsula-dot-com.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/scania.svg' }
];

const trTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/media-verse.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/verifact.png', _imgWidth: 110 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/tg-global.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/als-global.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/rio-tinto.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/toll-logo.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/alliance.png', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/phd.png', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/cfl.png', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/brian-hilton.png', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/bendigo-health.png', _imgWidth: 80 }
];

const apacTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/emapta.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/outsourced-doers.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/meibanpng.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/agoda.svg', _imgWidth: 80 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/nexen.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/ito.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sri-trang.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/central-retail.png', _imgWidth: 160 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/vinh-hoan.png', _imgWidth: 65 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/interplex.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/genesys.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/shiji.svg', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/amk-technology.png', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/pba-robotics.png', _imgWidth: 60 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/aurionpro-inc.svg', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/assa-rent.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/airtac.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/sc-asset.svg' }
];

const meTrustIconList = [
    { _imgPath: '/sites/zweb/images/otherbrandlogos/emaar.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/iffco.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/gemseducation.svg', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/masafi.svg', _imgWidth: 90 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/americana-food.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/nvidia.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/premierinn.svg', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/manzilhealth.png', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/emirates-leisure-retail.png', _imgWidth: 120 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/qcs.png', _imgWidth: 140 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/leminar.png', _imgWidth: 70 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/orpak.png' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/al-dawaa.png', _imgWidth: 50 },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg' },
    { _imgPath: '/sites/zweb/images/otherbrandlogos/livenation.svg' }
];

// ============================================================================
// SECTION 2: TRUST ICON INITIALIZATION
// ============================================================================

/**
 * Adds country-specific trust icons to the page
 * @param {Array} countryList - Array of icon objects with _imgPath and optional _imgWidth
 */
function addCountryData(countryList) {
    $('.trust-icon').addClass('zwc-trust-' + CountryCode.toLowerCase());
    $('.trust-icon').html('');
    countryList.forEach(element => {
        $('.trust-icon').append(`<span class="ae-icon"><img width="${element._imgWidth ? element._imgWidth : 100}" src="${element._imgPath}"></span>`);
    });
}

// Country code mapping for trust icons
const _cusApacList = ['SG', 'MY', 'TH', 'VI', 'ID', 'PH'];

// Initialize trust icons based on country code
if (CountryCode == 'US') {
    addCountryData(usTrustIconList);
} else if (CountryCode == 'JP') {
    addCountryData(jpTrustIconList);
} else if (CountryCode == 'CA') {
    addCountryData(caTrustIconList);
} else if (CountryCode == 'CN') {
    addCountryData(cnTrustIconList);
} else if (CountryCode == 'GB') {
    addCountryData(ukTrustIconList);
} else if (customvar.lAmerica.indexOf(CountryCode) > -1) {
    $('.trust-icon').addClass('zwc-trust-lamerica');
    addCountryData(laTrustIconList);
} else if (customvar.meaList.indexOf(CountryCode) > -1) {
    $('.trust-icon').addClass('zwc-trust-mealist');
    addCountryData(meTrustIconList);
} else if (customvar.africaList.indexOf(CountryCode) > -1) {
    $('.trust-icon').addClass('zwc-trust-africa');
    addCountryData(afTrustIconList);
} else if (customvar.countryEu.indexOf(CountryCode) > -1 && CountryCode != 'GB') {
    $('.trust-icon').addClass('zwc-trust-eulist');
    addCountryData(euTrustIconList);
} else if (customvar.countryTranstasman.indexOf(CountryCode) > -1) {
    $('.trust-icon').addClass('zwc-trust-transtasman');
    addCountryData(trTrustIconList);
} else if (_cusApacList.indexOf(CountryCode) > -1) {
    $('.trust-icon').addClass('zwc-trust-apac');
    addCountryData(apacTrustIconList);
} else {
    addCountryData(inTrustIconList);
}

// Trust icon slider configuration
const trustSlideSetting = {
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    centerMode: true,
    variableWidth: true,
    autoplaySpeed: 0,
    speed: 3000,
    pauseOnHover: false,
    pauseOnFocus: false,
    infinite: true,
    cssEase: 'linear'
};

let trustSlickInitialized = false;
let _winWidth = $(window).width();

/**
 * Initialize trust icon slider when scrolled into view
 */
function trustSlideFun() {
    if ($(window).scrollTop() + ($(window).height()) >= $('.trusted-icon-wrap').offset().top) {
        $('.trust-icon').slick(trustSlideSetting);
        trustSlickInitialized = true;
    }
}

// Initialize trust slider
trustSlideFun();

// Lazy load trust slider on scroll
$(window).scroll(function () {
    if (!trustSlickInitialized) {
        trustSlideFun();
    }
});

// Reinitialize trust slider on window resize
$(window).on('resize', function () {
    if (_winWidth != $(window).width()) {
        if ($('.trust-icon').hasClass('slick-initialized')) {
            $('.trust-icon').slick('unslick').slick(trustSlideSetting);
        }
    }
});

// ============================================================================
// SECTION 3: FREE TRIAL LINK SETUP
// ============================================================================

$(window).on("load", function () {
    if ($("body").hasClass("body-umain")) {
        $(".start-freetrail").attr("href", "https://analytics.zoho." + domainOne + "/");
    }
});

// ============================================================================
// SECTION 4: CONTACT FORM FUNCTIONALITY
// ============================================================================

/**
 * Reload captcha image
 */
function reloadImg() {
    if (document.getElementById('imgid').src.indexOf('&d') !== -1) {
        document.getElementById('imgid').src = document.getElementById('imgid').src.substring(0, document.getElementById('imgid').src.indexOf('&d')) + '&d' + new Date().getTime();
    } else {
        document.getElementById('imgid').src = document.getElementById('imgid').src + '&d' + new Date().getTime();
    }
}

// Add contact us button to page
var pr_contactus = '<button class="getquote-box contact-form" data-subject="Pricing inquiry from pricing page"> <span class="rd-demoButton getquote-form bottom-form-container">' + Drupal.t("Contact Us") + '</span></div>';
$('.zw-template-inner').append(pr_contactus);

// Show/hide contact us button on scroll
$(window).scroll(function () {
    var wS = $(this).scrollTop();
    if (wS > $(window).height()) {
        $('.getquote-box').css({
            'opacity': 1,
            'visibility': 'visible'
        });
    } else {
        $('.getquote-box').css({
            'opacity': 0,
            'visibility': 'hidden'
        });
    }
});

// ============================================================================
// SECTION 5: PRICING PAGE INITIALIZATION
// ============================================================================

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (CountryCode === 'US') {
        $('.page-container').addClass('auto-code-us');
    }
    if ($('.changePriceContainer').length > 1) {
        $('.changePriceContainer').style.display = 'block';
    }

    // US-specific pricing layout
    if (CountryCode == "US") {
        $('.pricing-wrap').addClass('pricing-box-4');
        $('.pricing-wrap').removeClass('pricing-box-5');
        $('.zwc_toggle_container').addClass('block-box-5');
        $('.zwc_toggle_container').addClass('block-box-4');
    }

    // FAQ link customization
    $('.pricing-faq ul li:last-child a').addClass('nonlang');
    $('.pricing-faq ul li:last-child a').attr('href', '/analytics/training.html');

    // Initialize slider
    $('.sliders-parent .slick-cont').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: false,
        dots: true,
        infinite: false,
        arrows: false,
        responsive: [
            {
                breakpoint: 480,
                settings: {
                    centerMode: false,
                },
            },
        ],
    });
});

// ============================================================================
// SECTION 6: PDF DOWNLOAD SETUP
// ============================================================================

// $(window).on('load', function () {
//     $(".download-desktop a").hide();
//     var pathname = 'pricing-comparison.html';
//     var env = (window.location.host != _preZ) ? 'live' : 'prezohoweb';
//     var curtype = $(".changeCurrency.action").attr('data-currency').split(",")[0];
//     var filePathDomain = (window.location.origin == "https://www.zoho.com") ? "https://zpdfcreate-709834020.catalystserverless.com" : "https://zpdfcreate-709834020.development.catalystserverless.com"
//     var pdfurl = filePathDomain + "/server/zpdfcreate/zoho-" + productName + "-plan-comparison?env=" + env + "&pathname=" + pathname + "&proname=" + productName + "&curtype=" + curtype + "&countryCode=" + CountryCode
//     var pageLang = langsrc.replace(/[^a-zA-Z-]/g, "")
//     if (pageLang == "") {
//         $('.zdownload-pdf').attr("href", pdfurl);
//     } else {
//         pdfurl = pdfurl + '&lang=' + pageLang;
//         $('.zdownload-pdf').attr("href", pdfurl);
//     }
// });

// ============================================================================
// SECTION 7: FAQ EXPAND/COLLAPSE
// ============================================================================

$('.zexpand').on('click', function () {
    $(this).hide();
    $('.zcollapse').show()
    $('.pricing-faq').find('li').addClass('zactive').find('p, .faq-list').slideDown();
});

$('.zcollapse').on('click', function () {
    $(this).hide();
    $('.zexpand').show()
    $('.pricing-faq').find('li:not(:first-child)').removeClass('zactive');
    $('.pricing-faq').find('li:not(:first-child) p,li:not(:first-child) .faq-list').slideUp();
});

// ============================================================================
// SECTION 8: PRICING CATEGORY TABS
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Constants
    const DEFAULT_CATEGORY = 'starter';
    const TRANSITION_DURATION = '0.15s';
    const RESIZE_DEBOUNCE_DELAY = 50;
    const POSITION_CALC_DELAY = 100;

    // Layout mappings
    const LAYOUT_CLASSES = {
        starter: 'pricing-box-3',
        large: 'pricing-box-3',
        enterprise: 'pricing-box-5'
    };

    // DOM elements
    const elements = {
        categoryTabs: document.querySelectorAll('.category-tab'),
        pricingCards: document.querySelectorAll('.product-block'),
        comparisonCells: document.querySelectorAll('.zwc_comp_cell[data-category]'),
        tabsContainer: document.querySelector('.pricing-category-tabs'),
        indicator: document.querySelector('.tab-indicator'),
        pricingWrap: document.querySelector('.pricing-wrap')
    };

    // State
    let currentCategory = DEFAULT_CATEGORY;
    let resizeTimeout;

    // Initialize
    initializeTabs();
    setupEventListeners();

    function initializeTabs() {
        filterByCategory(DEFAULT_CATEGORY, false);
        const activeTab = document.querySelector('.category-tab.active');
        if (activeTab && elements.indicator) {
            moveIndicator(activeTab);
        }
    }

    function setupEventListeners() {
        // Tab click handlers
        elements.categoryTabs.forEach(tab => {
            tab.addEventListener('click', handleTabClick);
        });

        // Dropdown change handler
        const categoryDropdown = document.getElementById('category-select');
        if (categoryDropdown) {
            categoryDropdown.addEventListener('change', handleDropdownChange);
        }

        // Resize handler
        window.addEventListener('resize', handleResize);

        // Initialize position calculations
        setTimeout(calculatePositions, POSITION_CALC_DELAY);
    }

    function handleTabClick(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category');

        if (category === currentCategory) return;

        switchToCategory(category, this);
    }

    function handleDropdownChange(e) {
        const category = this.value;

        if (category === currentCategory) return;

        // Find the corresponding tab to pass to switchToCategory for indicator positioning
        const correspondingTab = document.querySelector(`.category-tab[data-category="${category}"]`);
        switchToCategory(category, correspondingTab);
    }

    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentActive = document.querySelector('.category-tab.active');
            if (currentActive && elements.indicator) {
                moveIndicator(currentActive);
            }
            calculatePositions();
        }, RESIZE_DEBOUNCE_DELAY);
    }

    function switchToCategory(category, clickedTab) {
        currentCategory = category;

        updateActiveTab(clickedTab);
        moveIndicator(clickedTab);
        filterByCategory(category, true);
        // Removed the problematic line that was setting minHeight to 0
        // document.querySelectorAll('.product-block .main-box').forEach(box => {
        //     box.style.minHeight = '0';
        // });

    }

    function updateActiveTab(activeTab) {
        elements.categoryTabs.forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');
    }

    function filterByCategory(category, animate = true) {
        filterPricingCards(category);
        filterComparisonCells(category);
        updateGridLayout(category);
    }

    function filterPricingCards(category) {
        elements.pricingCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            // Check if the category is included in the card's data-category attribute
            const isActive = cardCategory && cardCategory.split(' ').includes(category);

            if (isActive) {
                showCard(card);
            } else {
                hideCard(card);
            }
        });
    }

    function filterComparisonCells(category) {
        elements.comparisonCells.forEach(cell => {
            const cellCategory = cell.getAttribute('data-category');
            // Check if the category is included in the cell's data-category attribute
            const isActive = cellCategory && cellCategory.split(' ').includes(category);

            if (isActive) {
                showCell(cell);
            } else {
                hideCell(cell);
            }
        });
    }

    function showCard(card) {
        card.classList.remove('hidden', 'anim-hide', 'anim-show');
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
    }

    function hideCard(card) {
        card.classList.add('hidden');
        card.classList.remove('anim-hide', 'anim-show');
    }

    function showCell(cell) {
        cell.classList.remove('hidden');
        cell.style.opacity = '1';
    }

    function hideCell(cell) {
        cell.classList.add('hidden');
        cell.style.opacity = '0';
    }

    function updateGridLayout(category) {
        if (!elements.pricingWrap) return;

        // Remove all layout classes
        Object.values(LAYOUT_CLASSES).forEach(className => {
            elements.pricingWrap.classList.remove(className);
        });

        // Add appropriate class
        const layoutClass = LAYOUT_CLASSES[category];
        if (layoutClass) {
            elements.pricingWrap.classList.add(layoutClass);
        }
    }

    function moveIndicator(activeTab) {
        if (!elements.indicator || !elements.tabsContainer) return;

        const position = calculateIndicatorPosition(activeTab);
        applyIndicatorPosition(position);
    }

    function calculateIndicatorPosition(activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = elements.tabsContainer.getBoundingClientRect();

        return {
            left: tabRect.left - containerRect.left,
            width: tabRect.width
        };
    }

    function applyIndicatorPosition(position) {
        elements.indicator.style.transition = `all ${TRANSITION_DURATION} ease-out`;
        elements.indicator.style.width = `${position.width}px`;
        elements.indicator.style.left = `${position.left}px`;
    }

    function calculatePositions() {
        elements.categoryTabs.forEach(tab => {
            const position = calculateIndicatorPosition(tab);
            tab._indicatorLeft = position.left;
            tab._indicatorWidth = position.width;
        });
    }
});

// ============================================================================
// SECTION 9: TESTIMONIAL IMAGE SLIDER
// ============================================================================

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
                breakpoint: 991,
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

    // Add click functionality to testimonial images using event delegation
    $(imgSlider).on('click', 'li, li img', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Get the li element (either clicked directly or parent of clicked img)
        const $li = $(this).is('li') ? $(this) : $(this).closest('li');

        // Get the data-testimonial attribute to identify the correct slide
        const testimonialId = $li.attr('data-testimonial');

        if (testimonialId) {
            // Find the original slide index by matching the data-testimonial attribute
            const $allSlides = $(imgSlider).find('li');
            let targetIndex = -1;

            $allSlides.each(function (index) {
                if ($(this).attr('data-testimonial') === testimonialId) {
                    targetIndex = index;
                    return false; // break the loop
                }
            });

            if (targetIndex >= 0) {
                $(imgSlider).slick('slickGoTo', targetIndex);
            }
        }
    });

    $(imgSlider).on("afterChange", function (event, slick, currentSlide) {
        setTimeout(() => {
            let activeSlide = slick.$slides.eq(currentSlide).attr("data-testimonial");
            document.querySelectorAll(".testi-content").forEach(el => el.classList.remove("active"));
            document.querySelector("." + activeSlide)?.classList.add("active");
        }, 100);
    });
}

// ============================================================================
// SECTION 10: TYPE CONFIGURATION & DROPDOWN
// ============================================================================

// Type configuration for cluster plans
const typeConfig = {
    "Type 1": { users: "50", rows: "500 Million", approx: "approx 500 GB of data" },
    "Type 2": { users: "100", rows: "1 Billion", approx: "approx 1 TB of data" },
    "Type 3": { users: "150", rows: "1.5 Billion", approx: "approx 1.5 TB of data" }
};

// Store selected type for form
let selectedType = "Type 1"; // Default value

// Custom dropdown menu handler
document.addEventListener("click", (e) => {
    const menu = e.target.closest(".select-menu");

    // Close all menus first
    document.querySelectorAll(".select-menu.active").forEach(m => {
        if (m !== menu) m.classList.remove("active");
    });

    if (e.target.closest(".select-btn")) {
        // Toggle current menu
        menu.classList.toggle("active");
        return;
    }

    if (e.target.closest(".option")) {
        const option = e.target.closest(".option");
        menu.querySelector(".sBtn-text").textContent = option.textContent;
        menu.classList.remove("active");

        // Remove selected class from all options in this menu
        menu.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));

        // Add selected class to the clicked option
        option.classList.add("selected");

        // Store selected type
        selectedType = option.textContent.trim();

        // Update custom values
        const config = typeConfig[option.textContent];
        if (config) {
            const usersSpan = document.querySelector('#zplan5 .cluster-users');
            const rowsSpan = document.querySelector('#zplan5 .cluster-rows');
            if (usersSpan) usersSpan.textContent = "Starts at " + config.users + " Users";
            if (rowsSpan) rowsSpan.textContent = "Starts at " + config.rows + " Rows" + (config.approx ? " (" + config.approx + ")" : "");
        }
        return;
    }

    // If clicked outside any menu
    document.querySelectorAll(".select-menu.active").forEach(m => m.classList.remove("active"));
});

// Set main box min-height
$(".main-box").css("min-height", "auto");

// Initialize default type selection
document.addEventListener("DOMContentLoaded", function () {
    // Set "Type 1" as selected by default
    const defaultOption = document.querySelector('.select-menu .option');
    if (defaultOption && defaultOption.textContent.trim() === "Type 1") {
        defaultOption.classList.add("selected");
    }
    // Initialize the default text for users and rows based on Type 1
    const defaultConfig = typeConfig["Type 1"];
    if (defaultConfig) {
        const usersSpan = document.querySelector('#zplan5 .cluster-users');
        const rowsSpan = document.querySelector('#zplan5 .cluster-rows');
        if (usersSpan) usersSpan.textContent = "Starts at " + defaultConfig.users + " Users";
        if (rowsSpan) rowsSpan.textContent = "Starts at " + defaultConfig.rows + " Rows" + (defaultConfig.approx ? " (" + defaultConfig.approx + ")" : "");
    }
});

// ============================================================================
// SECTION 11: MONTHLY/YEARLY PRICING TOGGLE
// ============================================================================

// Simple class logic for monthly/yearly pricing
// $(".pricing-tab > span.monthly").on("click", function () {
//     $(".price").addClass("zprice-monthly");
//     $(".price").removeClass("zprice-yearly");
// });

// $(".pricing-tab > span.yearly").on("click", function () {
//     $(".price").addClass("zprice-yearly");
//     $(".price").removeClass("zprice-monthly");
// });

const rowMonthly = document.querySelector('.rowMonthly');
const rowYearly = document.querySelector('.rowYearly');
const getToggleSlide = document.querySelector(".pricing-tab .ztoggle-slide.active");
const getMobileSelectToggle = document.querySelector("#zmobile-mon-yearly");

function initToggleSlide() {
    rowMonthly.classList.remove('active');
    rowYearly.classList.add('active');
}

function updateToggleSlide() {
    if (getToggleSlide.classList.contains('active')) {
        rowMonthly.classList.add('active');
        rowYearly.classList.remove('active');
    } else {
        rowMonthly.classList.remove('active');
        rowYearly.classList.add('active');
    }
    setMobileSelectToggle(getToggleSlide.classList.contains('active') ? 'Y' : 'M');
}

function setMobileSelectToggle(value) {
    if (getMobileSelectToggle) {
        getMobileSelectToggle.value = value;
    }
}

function updateFromDropdown() {
    if (getMobileSelectToggle && getMobileSelectToggle.value === 'M') {
        // Monthly selected: based on updateToggleSlide logic, when showing monthly, toggle should be active
        getToggleSlide.classList.add('active');
        rowMonthly.classList.add('active');
        rowYearly.classList.remove('active');
    } else if (getMobileSelectToggle && getMobileSelectToggle.value === 'Y') {
        // Yearly selected: based on updateToggleSlide logic, when showing yearly, toggle should not be active
        getToggleSlide.classList.remove('active');
        rowMonthly.classList.remove('active');
        rowYearly.classList.add('active');
    }
}

initToggleSlide();
getToggleSlide.addEventListener('click', () => {
    updateToggleSlide();
});

// Listen for dropdown changes
if (getMobileSelectToggle) {
    getMobileSelectToggle.addEventListener('change', () => {
        updateFromDropdown();
    });
}



// ============================================================================
// SECTION 12: ROWS CHANGE HANDLER
// ============================================================================

$('#rows').on('change', function () {
    $(".zrows .zportal-price,.zrows .zportal-price.zyearly").find('.zshow').removeClass('zshow');
    $(".zrows .zportal-price").find('.zpricegroup').eq($(this).find(":selected").index()).addClass('zshow');
    $(".zrows .zportal-price.zyearly").find('.zpricegroup').eq($(this).find(":selected").index()).addClass('zshow');
});

// Initialize rows dropdown to 0.25 million rows on page load
$(document).ready(function () {
    $('#rows').val('1').trigger('change');
});

addDynamicScript("zc-crm-webform").then(() => {
    $(".crm-form-wrap").zcform({
        formType: "WebToCaseForm",
        groupId: "analytics-no-captcha",
        subject: "Custom quote request from pricing page",
        title: "Get your customized quote from our sales team.",
        formPosition: "slide",
        slideOrPopupTrigger: ".zcontactus, .getquote-form",

        fields: [
            {
                id: "zcf_reported_by",
                validate: { required: true }
            },
            {
                id: "zcf_email",
                validate: { required: true }
            },
            {
                id: "zcf_phone",
                countryCode: true,
                validate: { required: true }
            },
            {
                id: "zcf_description",
                type: "textarea",
                label: "Description",
                placeholder:
                    "Specify users, rows, dedicated server capacity or your custom needs.",
            },
            {
                id: 'zcf_enterdigest',
                hide: true,
            },
        ],

        onSlideOrPopupOpen: ({ event, form, container }) => {
            const titleElement = container?.querySelector(
                "#z_crmwebform_1_title"
            );

            const clickedEl = event.target;
            const descriptionEl = form.querySelector('textarea[data-map-id="zcf_description"]');
            const subjectEl = form.querySelector('input[data-map-id="zcf_subject"]');

            // Cluster form trigger
            if (clickedEl.closest("button.cluster-form")) {
                subjectEl.value =
                    "Custom quote request from pricing page";
                descriptionEl.placeholder =
                    "Specify users, rows, dedicated server capacity or your custom needs.";

                // Include selected type in the description field
                if (descriptionEl && selectedType) {
                    descriptionEl.value = `Selected Plan: ${selectedType}`;
                }

                if (titleElement) {
                    titleElement.textContent =
                        "Get your customized quote from our sales team.";
                }
            }

            // Contact form trigger
            if (clickedEl.closest("button.contact-form")) {
                subjectEl.value =
                    "Please describe your query or issue in detail.";

                descriptionEl.placeholder =
                    "Please describe your query or issue in detail.";
                descriptionEl.value = "";
                if (titleElement) {
                    titleElement.textContent = "Contact Us";
                }
            }
        },

        successMessage:
            "Thanks for contacting us! We'll be in touch with you shortly."
    });
});
