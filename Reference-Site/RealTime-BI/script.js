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
            if (CountryCode != 'JP') {
                $('.trust-icon').slick(trustSlideSetting);
            }
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