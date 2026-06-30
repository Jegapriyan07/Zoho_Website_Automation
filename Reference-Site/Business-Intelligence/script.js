// Initialize tab functionality when DOM is ready
function initTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');

    const sections = [
        document.querySelector('#overview'),
        document.querySelector('#how-it-works'),
        document.querySelector('#comparison'),
        document.querySelector('#benefits'),
        document.querySelector('#goals-of-bi'),
        document.querySelector('#companies-using-bi'),
        document.querySelector('#use-cases'),
    ];

    // Scroll to section on tab click
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const section = sections[index];
            if (!section) return; // Skip if section doesn't exist

            const h2 = section.querySelector('h2');
            if (!h2) return; // Skip if h2 doesn't exist

            const headerOffset = 150;
            const elementPosition = h2.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Function to get the currently most visible section
    function getCurrentSection() {
        const viewportHeight = window.innerHeight;
        const viewportMiddle = window.pageYOffset + viewportHeight / 2;
        let currentSection = null;
        let minDistance = Infinity;

        sections.forEach((section, index) => {
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.pageYOffset;
            const sectionBottom = sectionTop + rect.height;
            const sectionMiddle = sectionTop + rect.height / 2;

            // Calculate distance from viewport middle to section middle
            const distance = Math.abs(viewportMiddle - sectionMiddle);

            // Check if section is in viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                if (distance < minDistance) {
                    minDistance = distance;
                    currentSection = index;
                }
            }
        });

        return currentSection;
    }

    // Highlight tab when section is in view
    const observer = new IntersectionObserver((entries) => {
        const currentSectionIndex = getCurrentSection();
        if (currentSectionIndex !== null && currentSectionIndex !== -1) {
            tabs.forEach(tab => tab.classList.remove('active'));
            if (tabs[currentSectionIndex]) tabs[currentSectionIndex].classList.add('active');
        }
    }, {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });

    // Filter out null sections and observe only existing ones
    sections.filter(section => section !== null).forEach(section => observer.observe(section));

    // Also update on scroll for more responsive behavior
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentSectionIndex = getCurrentSection();
                if (currentSectionIndex !== null && currentSectionIndex !== -1) {
                    tabs.forEach(tab => tab.classList.remove('active'));
                    if (tabs[currentSectionIndex]) tabs[currentSectionIndex].classList.add('active');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabNavigation);
} else {
    // DOM is already ready
    initTabNavigation();
}


document.addEventListener("DOMContentLoaded", function () {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.feature-tab-btn');
    const slides = document.querySelectorAll('.slide');
    const prevNav = document.querySelector('.prev-nav');
    const nextNav = document.querySelector('.next-nav');

    let currentSlideIndex = 0;
    const slideData = ['retail', 'finance', 'healthcare', 'manufacturing', 'education', 'government'];

    // Initialize - show first slide (Retail and e-commerce)
    currentSlideIndex = 0; // Retail and e-commerce is at index 0
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
        }, 8000); // Change slide every 5 seconds
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
        // Image switching disabled - single static image for all sections
        // accordionImages.forEach((img, i) => {
        //     img.classList.toggle("active", i === index);
        // });
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

$(document).ready(function () {
    var s = $(".sticky-section .each-box-fort");
    var o = "#9AC7FF";
    var c = s.find(".scroll-card");
    var d = c.length;
    var r = [];

    c.each(function (s) {
        var o = (s + 1) * 18 + 170;
        $(this).css("top", o + "px");
        r.push($(this).offset().top);

        // Initialize videos - ensure loop is set and start paused
        var video = $(this).find('.scroll-video')[0];
        if (video) {
            video.setAttribute('loop', '');
            video.pause(); // Start paused
        }
    });

    function l(s, o) {
        s != d ? scaleVal = 1 - (d - s) * o : scaleVal = 1;
        $(c).eq(s - 1).css("transform", "scale(" + scaleVal + ",1)")
    }

    $(window).scroll(function () {
        var s = $(window).scrollTop();
        var windowHeight = $(window).height();

        for (var o = 0; o < d; o++) {
            var a = r[o] - s;
            var e = c.eq(o).find(".bs-shad");
            var i = c.eq(o).outerHeight();
            var n = i;
            var t = 7e-4;
            if (d > 6) {
                t = 2e-4
            }
            while (a < n) {
                l(o + 1, t);
                n -= 50;
                if (d > 6) {
                    t += 2e-4
                } else {
                    t += 7e-4
                }
            }
            if (a > i + 50) {
                c.eq(o).css("transform", "scale(1,1)")
            }

            // Video playback control - check if card is in viewport
            var video = c.eq(o).find('.scroll-video')[0];
            if (video) {
                var cardElement = c.eq(o)[0];
                var rect = cardElement.getBoundingClientRect();

                // Check if card is in viewport (at least 30% visible)
                var cardVisibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                var cardHeight = rect.height;
                var visibilityRatio = cardVisibleHeight / cardHeight;
                var isInView = visibilityRatio > 0.3 && rect.top < windowHeight && rect.bottom > 0;

                if (isInView) {
                    // Card is in view - play video
                    if (video.paused) {
                        video.play().catch(function (err) {
                            console.log('Video autoplay prevented:', err);
                        });
                    }
                } else {
                    // Card is out of view - pause video
                    if (!video.paused) {
                        video.pause();
                    }
                }
            }
        }
    });
});


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