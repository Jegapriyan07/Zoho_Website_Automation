/* ── Integration diagram: random logo-cell flip loop ───────────── */
(function () {
    const FLIP_CLASS   = 'is-flipping';
    const FLIP_DURATION = 700;   // ms — must match the CSS animation duration
    const MIN_INTERVAL  = 400;   // ms between each flip trigger
    const MAX_INTERVAL  = 900;

    let cells = [];
    let busy  = new Set();

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function flipOne() {
        const available = cells.filter(function (c) { return !busy.has(c); });
        if (available.length === 0) return;

        const cell = pickRandom(available);
        busy.add(cell);
        cell.classList.add(FLIP_CLASS);

        setTimeout(function () {
            cell.classList.remove(FLIP_CLASS);
            busy.delete(cell);
        }, FLIP_DURATION);
    }

    function scheduleNext() {
        const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        setTimeout(function () {
            flipOne();
            scheduleNext();
        }, delay);
    }

    document.addEventListener('DOMContentLoaded', function () {
        cells = Array.from(document.querySelectorAll('.za-cell--logo'));
        if (cells.length > 0) scheduleNext();
    });
}());


/* ── Truly section: random animated dot background ─────────────── */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const section = document.querySelector('.za-truly-section');
        if (!section) return;

        const DOT_COUNT = window.innerWidth <= 767 ? 40 : 100;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < DOT_COUNT; i++) {
            const dot = document.createElement('span');
            dot.className = 'za-truly-dot';

            const size = 2 + Math.random() * 3;            // 2–5 px
            const x    = Math.random() * 100;              // % left
            const y    = Math.random() * 100;              // % top
            const dur  = 3 + Math.random() * 4;            // 3–7 s
            const del  = (Math.random() * 6).toFixed(2);   // 0–6 s delay

            dot.style.cssText =
                'width:' + size.toFixed(1) + 'px;' +
                'height:' + size.toFixed(1) + 'px;' +
                'left:' + x.toFixed(2) + '%;' +
                'top:' + y.toFixed(2) + '%;' +
                '--dot-dur:' + dur.toFixed(2) + 's;' +
                '--dot-delay:-' + del + 's;';

            frag.appendChild(dot);
        }

        section.appendChild(frag);
    });
}());

/* ── za-line: animate 0→100% when integration section enters view ── */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const line = document.querySelector('.za-line');
        if (!line) return;

        const observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                line.classList.add('in-view');
            } else {
                line.classList.remove('in-view');
            }
        }, { threshold: 0.3 });

        // Observe the closest meaningful ancestor that has real height
        const target = line.closest('.za-integ-lines-wrap') || line.closest('.za-integ-diagram') || line;
        observer.observe(target);
    });
}());


// Banner animation — pure scroll-progress driven, single-phase
// prog 0→1: text fades out, dashboard rises from grass and stays up
// No wheel interception — animation is a pure function of scrollY.
(function () {
    if (window.innerWidth <= 991) return;

    var bannerSection = document.querySelector('.za-banner-section');
    var stickyWrap    = document.querySelector('.za-banner-sticky-wrap');
    var iframeSection = document.querySelector('.iframe-step-section');
    if (!bannerSection || !stickyWrap) return;

    var iframeBox  = iframeSection && iframeSection.querySelector('.iframe-step-box');
    var iframeEl   = iframeBox && iframeBox.querySelector('iframe');
    var contentBox = bannerSection.querySelector('.za-banner-content-box');
    var grassBg    = bannerSection.querySelector('.banner-grass-bg');

    var overlay = null;
    var prevY   = -1;

    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

    function getDashRise() { return iframeSection ? -(iframeSection.offsetTop - 40) : 0; }

    // Overlay: sits over the cross-origin iframe so wheel events bubble to the
    // parent document instead of being eaten by the iframe context.
    function showOverlay() {
        if (!iframeBox || overlay) return;
        overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:9;pointer-events:auto';
        iframeBox.appendChild(overlay);
    }
    function hideOverlay() { if (overlay) { overlay.remove(); overlay = null; } }

    // Cache stickyWrap page-top so we can calculate the exact scroll position
    // at which the sticky section leaves the viewport (= end of banner zone).
    // Recomputed on resize.
    var swPageTop = stickyWrap.getBoundingClientRect().top + window.scrollY;
    var bannerZoneEnd = swPageTop + stickyWrap.offsetHeight; // scroll Y where sticky exits viewport

    function update() {
        var y = window.scrollY;
        if (y === prevY) return;
        prevY = y;

        var range = stickyWrap.offsetHeight - window.innerHeight;
        var prog  = clamp(y / range, 0, 1);
        var rise  = getDashRise();

        // Single phase: text fades out, dashboard rises from grass and stays risen
        var t = ease(prog);
        if (contentBox) {
            contentBox.style.opacity   = (1 - t).toFixed(4);
            contentBox.style.transform = 'translateY(' + (-40 * t).toFixed(2) + 'px)';
        }
        if (iframeSection) {
            iframeSection.style.transform = 'translateY(' + (rise * t).toFixed(2) + 'px)';
            iframeSection.style.zIndex    = t > 0.05 ? '2000' : '';
        }
        if (grassBg) {
            grassBg.style.bottom = (-25 - 95 * t).toFixed(1) + 'px';
        }

        // Overlay must stay present for the ENTIRE banner zone (from page load until
        // the sticky section scrolls fully out of view). Without this, the cross-origin
        // iframe eats wheel events at the start (y=0, iframe is in lower viewport) and
        // in the dead zone after animation ends (prog=1 but sticky still visible).
        if (y < bannerZoneEnd) {
            if (!overlay) showOverlay();
            if (iframeEl) iframeEl.style.pointerEvents = 'none';
        } else {
            hideOverlay();
            if (iframeEl) iframeEl.style.pointerEvents = '';
        }
    }

    var rafPending = false;
    window.addEventListener('scroll', function () {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function () { rafPending = false; update(); });
    }, { passive: true });

    window.addEventListener('resize', function () {
        swPageTop     = stickyWrap.getBoundingClientRect().top + window.scrollY;
        bannerZoneEnd = swPageTop + stickyWrap.offsetHeight;
        prevY = -1;
        update();
    });

    update();
})();

// banner dashboard
function bnrDashboard() {
    for (let i = 1; i <= 8; i++) {
        if (i == 1) {
            $('#step1-btn, .zdb-tooltip').on('click', function (e) {
                $('#step1-btn, .zdb-tooltip').hide();
                $('.za-db-step1').addClass('active');
            });
        }
        else {
            $(`#step${i}-btn`).on('click', function (e) {
                $(`.za-db-step${i > 1 ? i - 1 : 8}`).removeClass('active');
                $(`.za-db-step${i}`).addClass('active'); // Add active class to the current step
            });
        }
    }

    $('#step8-btn').on('click', function (e) {
        $('#step1-btn, .zdb-tooltip').show();
        $('.zdb-tooltip').addClass('active');
        $(`.za-db-step${i}`).removeClass('active'); // Remove active class from all steps
    });
}
$(document).ready(function () {
    bnrDashboard();

    $('.za-gartner-wrap').slick({
        dots: false,
        arrows: false,
        infinite: false,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false,
        fade: true,
        speed: 500,
        centerMode: true,
    });
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

inTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/hdfc.svg',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/mahindra.svg',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/larsen-toubro.png',
        _imgWidth: 170
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/nippon-paint.png',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/tata-communications.svg',
        _imgWidth: 220
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/weikfield.png',
        _imgWidth: 100
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/casagrand.png',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/zomato.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/vedantu.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kotak.png',
        _imgWidth: 130
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/coromandel.png',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/infosys-knowledge-institute.svg',
        _imgWidth: 180
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/wipro-foundation.png',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sun-pharma.png',
        _imgWidth: 40
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/thermax-global.svg',
        _imgWidth: 40
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/wns.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/mckinsey.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cisco.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/spykar.png',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/bennett-coleman.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/viacom18.png',
        _imgWidth: 110
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/tnpl.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/supreme-industries.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/freight-tiger.png',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sun-jewels.svg',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/lixil.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/printo.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/disys.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/minda-corporation.png',
        _imgWidth: 120
    }
];

const laTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/gdm-seeds.svg',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/eficacia.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-promax.png',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/holcim.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/wisynco.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/pilgrims.png',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/uol.svg',
        _imgWidth: 90
    }
];

const afTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/smollan.svg',
        _imgWidth: 130
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/glencore.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/pg-group.png',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/avelabs.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg',
        _imgWidth: 100
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/nahdet-misr.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kwal.png',
        _imgWidth: 55
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/juta.svg',
        _imgWidth: 90
    }
];

const ukTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/nhs.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kantar.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/globalstar.png',
        _imgWidth: 110
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/jcb.svg',
        _imgWidth: 85
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/shell.svg',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/foyle.svg',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/iris.png',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/vectura.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/alight-llc.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cadent-gas.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/rgis.png',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/evo.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/dps-group.png',
        _imgWidth: 200
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/emr.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/das-house.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kelly-group.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/oliver.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/exertis.png',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/itransition.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/knights.png',
    }
];

const euTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/loreal.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/jlr.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/acer.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/securitas-direct.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/plastipak.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/jas.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/neonet.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-premo.png',
        _imgWidth: 130
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/suez.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/pierre-fabre.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/coloplast.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/groupe-beaumanoir.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kelly.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/hormann.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/tsg.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/concern.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/oetiker.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/agro-merchants.png',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/paccor.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/globalvia.png',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/bama.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sygnity.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/innovecs.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/alira-health.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/thieme.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sintef.svg',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kompan.svg',
    }
];

const usTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/dennys.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kaiser-permanente.svg',
        _imgWidth: 110
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/caterpillar.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/mitsubishi-heavy-industries.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/leggett-platt.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/yamaha-financial-services.png',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/johnson-controls.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cummins.svg',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/ima-group.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/flex.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/oaktree-capital.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/labcorp.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cbre.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/creme-de-la.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/aveanna.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/amplity-health.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sun-chemical.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/coach.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/capital-express.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/dole.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/heb.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/encora-digital.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/the-planet-group.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/eide-bailly.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/roadrunner-logistics.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/kerry-logistics.png',
    }
];


const jpTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/fujifilm.svg',
        _imgWidth: 110
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/honda.svg',
        _imgWidth: 135
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/saraya.png',
        _imgWidth: 150
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/inpex-corporation.svg',
        _imgWidth: 140
    }
];

const caTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/go-auto.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/physiotec.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/bakers-delight.png',
        _imgWidth: 130
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/vancouver-coastal-health.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cima.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/laura.svg',
    }
];

const cnTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/season-group.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/tianjin-wanda-tyre.png',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/trane-technologies.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/high-fashion.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/com-lan.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cloudwise.svg',
        _imgWidth: 160
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/peninsula-dot-com.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/scania.svg',
    }
];

const trTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/media-verse.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/verifact.png',
        _imgWidth: 110
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/tg-global.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/als-global.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/rio-tinto.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/toll-logo.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/alliance.png',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/phd.png',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/cfl.png',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/brian-hilton.png',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/bendigo-health.png',
        _imgWidth: 80
    }
];

const apacTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/emapta.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/outsourced-doers.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/meibanpng.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/agoda.svg',
        _imgWidth: 80
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/nexen.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/ito.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sri-trang.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/central-retail.png',
        _imgWidth: 160
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/vinh-hoan.png',
        _imgWidth: 65
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/interplex.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/genesys.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/shiji.svg',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/amk-technology.png',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/pba-robotics.png',
        _imgWidth: 60
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/aurionpro-inc.svg',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/assa-rent.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/airtac.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/sc-asset.svg',
    }
];

const meTrustIconList = [
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/emaar.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/iffco.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/gemseducation.svg',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/masafi.svg',
        _imgWidth: 90
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/americana-food.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/nvidia.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/premierinn.svg',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/manzilhealth.png',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/emirates-leisure-retail.png',
        _imgWidth: 120
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/qcs.png',
        _imgWidth: 140
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/leminar.png',
        _imgWidth: 70
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/orpak.png',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/al-dawaa.png',
        _imgWidth: 50
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg',
    },
    {
        _imgPath: '/sites/zweb/images/otherbrandlogos/livenation.svg',
    }
];


function addCountryData(countryList) {
    $('.trust-icon').addClass('zwc-trust-' + CountryCode.toLowerCase());
    $('.trust-icon').html('');
    countryList.forEach(element => {
        $('.trust-icon').append(`<span class="ae-icon"><img width="${element._imgWidth ? element._imgWidth : 100}" src="${element._imgPath}"></span>`);
    });
}

let _cusApacList = ['SG', 'MY', 'TH', 'VI', 'ID', 'PH'];

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

let trustSlideSetting = {
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
    // lazyLoad: 'ondemand',
    cssEase: 'linear'
}

var trustSlickInitialized = false;

function trustSlideFun() {
    if ($('body').hasClass('i18n-en')) {
        if ($(window).scrollTop() + ($(window).height()) >= $('.trusted-icon-wrap').offset().top) {
            $('.trust-icon').slick(trustSlideSetting);
            trustSlickInitialized = true;
        }
    } else {
        if ($(window).scrollTop() + ($(window).height() * .9) >= $('.trusted-icon-wrap').offset().top) {
            $('.trust-icon').slick(trustSlideSetting);
            trustSlickInitialized = true;
        }
    }

}

trustSlideFun();

$(window).scroll(function () {
    if (!trustSlickInitialized) {
        trustSlideFun();
    }
});

let _winWidth = $(window).width();

$(window).on('resize', function () {
    if (_winWidth != $(window).width()) {
        if ($('.trust-icon').hasClass('slick-initialized')) {
            $('.trust-icon').slick('unslick').slick(trustSlideSetting);
        }
    }
});

/* badges section end */

// integ slider
$('.za-integ-img ul').slick({
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    centerMode: true,
    centerPadding: '15px',
    variableWidth: true,
    autoplaySpeed: 0,
    speed: 3000,
    pauseOnHover: false,
    pauseOnFocus: false,
    infinite: true,
    // lazyLoad: 'ondemand',
    cssEase: 'linear'
});


//slider code 
$('#zcust-testi-sm').slick({
    dots: false,
    arrows: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    focusOnSelect: true,
    pauseOnHover: false,
    asNavFor: '#zcust-testimonials',
    draggable: false,
});
$('#zcust-testimonials').slick({
    lazyLoad: 'ondemand',
    dots: false,
    arrows: false,
    fade: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 10000,
    pauseOnHover: false,
    asNavFor: '#zcust-testi-sm',
    // responsive: [
    //     {
    //         autoplay: false,
    //         breakpoint: 767,
    //         settings: "unslick"
    //     }
    // ]
});

// feature scroll slider 

let scrollingElem = $(".za-journey-box");
scrollingElem = jQuery.makeArray(scrollingElem);

$(document).ready(function () {
    let position_arr = [];
    let zwcOffset = $(window).width() < 1199 ? 40 : 130;
    let scrollLockIndex = -1;
    let scrollLockTimer  = null;

    function zwcStickySection() {
        if ($(window).width() <= 991) return;
        position_arr = [];
        $('.za-journey-box').each(function (index) {
            position_arr.push($(this).offset().top);
        });
    }

    // ── Active tab: pick the LAST box whose top is at/above scroll + trigger ──
    function getActiveIndex(scrollTop) {
        const boxes = $('.za-journey-box');
        let active = 0;
        boxes.each(function (index) {
            if (scrollTop >= $(this).offset().top - 300) {
                active = index;
            }
        });
        return active;
    }

    function updateJourneyNav() {
        if ($(window).innerWidth() <= 991) return;

        const scrollTop  = $(window).scrollTop();
        const navItems   = $('.za-journey-nav ul li');
        const boxes      = $('.za-journey-box');
        const $extend    = $('#extend');
        const lastBottom = $extend.length ? $extend.offset().top + $extend.outerHeight() : 0;

        // ── Single correct active index ────────────────────────
        // While a tab-click scroll is animating, honour the locked index so the
        // active pill doesn't flicker through intermediate tabs during the glide.
        const activeIdx = scrollLockIndex >= 0 ? scrollLockIndex : getActiveIndex(scrollTop);
        navItems.each(function (i) {
            const isActive = i === activeIdx;
            $(this).toggleClass('active', isActive);
            $(this).attr('aria-selected', isActive ? 'true' : 'false');
            $(this).attr('tabindex', isActive ? '0' : '-1');
        });

        // ── Video play/pause ────────────────────────────────────
        const sectionVideo = $('.za-journey-section > video, .za-journey-section .za-journey-wrap > video').get(0);
        boxes.each(function (i) {
            const vid = $(this).find('video').get(0);
            if (!vid) return;
            if (i === activeIdx) { vid.play && vid.play(); }
            else                 { vid.pause && vid.pause(); }
        });

        // ── Card scale effect: smooth scroll-driven (no CSS transition) ──
        // Scale interpolates from 1.0 → MIN_SCALE over FADE_RANGE px so the
        // "recede into stack" effect is continuous — no binary snap or fighting.
        const MIN_SCALE  = 0.9788;
        const FADE_RANGE = 300;

        boxes.each(function (i, el) {
            const boxTop  = $(el).offset().top;
            const overlap = scrollTop - boxTop;   // <0 = below scroll, ≥0 = scrolled past

            let scale;
            if (overlap < -FADE_RANGE) {
                scale = 1;
            } else if (overlap < 0) {
                const t = (overlap + FADE_RANGE) / FADE_RANGE;   // 0 → 1
                scale = 1 - t * (1 - MIN_SCALE);
            } else {
                scale = MIN_SCALE;
            }

            el.style.transform = 'scale(' + scale.toFixed(4) + ')';
        });

        // ── Sticky nav: release at bottom of journey section ───
        if (lastBottom > 0 && scrollTop >= lastBottom - 200) {
            $('.za-journey-nav').addClass('makesticky');
        } else {
            $('.za-journey-nav').removeClass('makesticky');
        }
    }

    // ── rAF-throttled scroll handler ───────────────────────────
    let rafPending = false;
    function onScroll() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function () {
            rafPending = false;
            updateJourneyNav();
        });
    }

    // ── Nav click/keyboard: smooth scroll to section ────────────────────
    function activateJourneyTab(li) {
        const idx = $(li).index();
        if (position_arr[idx] === undefined) return;

        // Lock the active index so updateJourneyNav doesn't cycle through
        // intermediate tabs while the smooth-scroll animation runs.
        scrollLockIndex = idx;
        if (scrollLockTimer) clearTimeout(scrollLockTimer);
        scrollLockTimer = setTimeout(function () {
            scrollLockIndex = -1;
            updateJourneyNav();
        }, 700);

        // Apply active class immediately so the pill switches before the page moves.
        const allTabs = $('.za-journey-nav ul li');
        allTabs.removeClass('active').attr({ 'aria-selected': 'false', tabindex: '-1' });
        $(li).addClass('active').attr({ 'aria-selected': 'true', tabindex: '0' }).focus();

        window.scrollTo({ top: position_arr[idx] - zwcOffset, behavior: 'smooth' });
    }

    $(document).on('click', '.za-journey-nav ul li', function () {
        activateJourneyTab(this);
    });

    // Keyboard: Enter/Space activates; ArrowLeft/ArrowRight moves focus.
    $(document).on('keydown', '.za-journey-nav ul li', function (e) {
        const tabs = $('.za-journey-nav ul li');
        const idx  = tabs.index(this);
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateJourneyTab(this);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = tabs.get((idx + 1) % tabs.length);
            activateJourneyTab(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = tabs.get((idx - 1 + tabs.length) % tabs.length);
            activateJourneyTab(prev);
        }
    });

    // ── Init ───────────────────────────────────────────────────
    zwcStickySection();
    updateJourneyNav();
    btmListItems();

    $(window).on('resize', function () {
        zwcOffset = $(window).width() < 1199 ? 40 : 130;
        zwcStickySection();
        updateJourneyNav();
        btmListItems();
    });

    $(document).on('scroll', onScroll);
});

function btmListItems() {
    let leftmargin = $('.za-truly-section h2').offset().left;
    $('.za-truly-section ul').css({ 'margin-left': leftmargin });
}

$(window).on('resize', function () {
    btmListItems();
});

$(document).ready(function () {
    $('.zag-promo-box a, .za-mapps-cont a').addClass('nonlang');
    $('.za-integ-links a:first').addClass('nonlang');
     customvar.langsrcremove();
});

function btmListItemsRight() {
    if ($('body').hasClass('i18n-ar')) {
        let containerWidth = $('.za-truly-section').outerWidth();
        let headerOffsetLeft = $('.za-truly-section h2').offset().left;
        let headerWidth = $('.za-truly-section h2').outerWidth();
        let rightMargin = containerWidth - (headerOffsetLeft + headerWidth);
        $('.za-truly-section ul').css({ 'margin-right': rightMargin });
    }
}

btmListItemsRight();
$(window).on('resize', function () {
    btmListItemsRight();
});


