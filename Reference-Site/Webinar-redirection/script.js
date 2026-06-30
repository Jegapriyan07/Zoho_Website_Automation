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

// Circular Progress Countdown Functionality
function initCountdown() {
    const countdownNumber = document.getElementById('countdown-number');
    const countdownContent = document.querySelector('.countdown-content');
    const analyticsIcon = document.getElementById('analytics-icon');
    const progressRingFill = document.querySelector('.progress-ring-fill');
    
    // Check if elements exist
    if (!countdownNumber || !countdownContent || !analyticsIcon || !progressRingFill) {
        setTimeout(initCountdown, 500);
        return;
    }
    
    let timeLeft = 30;
    const totalTime = 30;
    
    // Get the actual SVG dimensions from CSS
    const svgElement = document.querySelector('.progress-ring');
    const svgWidth = svgElement.getBoundingClientRect().width;
    const radius = svgWidth / 2 - 4; // Account for stroke width
    const circumference = 2 * Math.PI * radius;
    
    // Set initial stroke-dasharray and offset
    progressRingFill.style.strokeDasharray = circumference;
    progressRingFill.style.strokeDashoffset = circumference;
    
    function updateProgress() {
        const progress = (totalTime - timeLeft) / totalTime;
        const offset = circumference - (progress * circumference);
        progressRingFill.style.strokeDashoffset = offset;
    }
    
    function updateCountdown() {
        countdownNumber.textContent = timeLeft;
        updateProgress();
        
        if (timeLeft <= 0) {
            // Hide countdown content and show analytics icon
            countdownContent.style.display = 'none';
            analyticsIcon.style.display = 'block';
            
            // Add a subtle pulse animation to the icon
            analyticsIcon.style.animation = 'fadeIn 0.5s ease-in-out, pulse 2s infinite';
            
            clearInterval(countdownInterval);
        } else {
            timeLeft--;
        }
    }
    
    // Initial update to show starting state
    updateCountdown();
    
    // Start the countdown
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Initialize countdown when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
} else {
    initCountdown();
}

// Handle window resize to recalculate circumference
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const progressRingFill = document.querySelector('.progress-ring-fill');
        const svgElement = document.querySelector('.progress-ring');
        
        if (progressRingFill && svgElement) {
            const svgWidth = svgElement.getBoundingClientRect().width;
            const radius = svgWidth / 2 - 4;
            const circumference = 2 * Math.PI * radius;
            
            progressRingFill.style.strokeDasharray = circumference;
        }
    }, 100);
});

$(document).ready(function () {
    // trusted icons
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
        centerMode: false,
        variableWidth: true,
        autoplaySpeed: 0,
        speed: 3000,
        pauseOnHover: false,
        pauseOnFocus: false,
        infinite: true,
        // lazyLoad: 'ondemand',
        cssEase: 'linear'
    }


    // Initialize slider immediately
    $('.trust-icon').slick(trustSlideSetting);

    let _winWidth = $(window).width();

    $(window).on('resize', function () {
        if (_winWidth != $(window).width()) {
            if ($('.trust-icon').hasClass('slick-initialized')) {
                $('.trust-icon').slick('unslick').slick(trustSlideSetting);
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const slides = document.querySelectorAll('.slide');
    const prevNav = document.querySelector('.prev-nav');
    const nextNav = document.querySelector('.next-nav');

    let currentSlideIndex = 0;
    const slideData = ['low-cost', 'extensibility', 'flexibility', 'security', 'infrastructure', 'ease-of-use'];

    // Initialize - show first slide (Low Cost)
    currentSlideIndex = 0; // Low Cost is at index 0
    updateActiveSlide();

    // Tab click functionality
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');

            // Update current slide index
            currentSlideIndex = index;
            updateActiveSlide();
        });
    });

    // Navigation arrows functionality
    prevNav.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
        updateActiveSlide();
        updateActiveTab();
    });

    nextNav.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
        updateActiveSlide();
        updateActiveTab();
    });

    // Function to update active slide
    function updateActiveSlide() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlideIndex) {
                slide.classList.add('active');
            }
        });
    }

    // Function to update active tab
    function updateActiveTab() {
        tabButtons.forEach((btn, index) => {
            btn.classList.remove('active');
            if (index === currentSlideIndex) {
                btn.classList.add('active');
            }
        });
    }

    // Auto-play functionality (optional)
    let autoPlayInterval;

    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        }, 5000); // Change slide every 5 seconds
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Start auto-play
    startAutoPlay();

    // Stop auto-play on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // Touch/swipe support for mobile
    let startX = 0;
    let startY = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    sliderContainer.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = startX - endX;
        const diffY = startY - endY;

        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swipe left - next slide
                    currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
                } else {
                    // Swipe right - previous slide
                    currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
                }
                updateActiveSlide();
                updateActiveTab();
            }
        }

        startX = 0;
        startY = 0;
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentSlideIndex = (currentSlideIndex - 1 + slideData.length) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        } else if (e.key === 'ArrowRight') {
            currentSlideIndex = (currentSlideIndex + 1) % slideData.length;
            updateActiveSlide();
            updateActiveTab();
        }
    });
});

$(".testimonial-wrap").slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerPadding: "60px",
    autoplay: true,
    dots: true,
    arrows: false,
    speed: 2e3,
    fade: true,
    adaptiveHeight: true
});


