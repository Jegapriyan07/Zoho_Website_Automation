/* what-is-business-intelligence-lp-3 — tab scrollspy, sticky cards, goals accordion, industry tabs, FAQ */

function initTabNavigation() {
    const tabs = document.querySelectorAll('.tab-section .tab-btn');
    const sections = [
        document.querySelector('#overview'),
        document.querySelector('#how-it-works'),
        document.querySelector('#comparison'),
        document.querySelector('#benefits'),
        document.querySelector('#goals-of-bi'),
        document.querySelector('#companies-using-bi'),
        document.querySelector('#use-cases')
    ];

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const section = sections[index];
            if (!section) return;

            const h2 = section.querySelector('h2');
            if (!h2) return;

            const headerOffset = 150;
            const elementPosition = h2.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    function getCurrentSection() {
        const viewportHeight = window.innerHeight;
        const viewportMiddle = window.pageYOffset + viewportHeight / 2;
        let currentSection = null;
        let minDistance = Infinity;

        sections.forEach((section, index) => {
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.pageYOffset;
            const sectionMiddle = sectionTop + rect.height / 2;
            const distance = Math.abs(viewportMiddle - sectionMiddle);

            if (rect.top < viewportHeight && rect.bottom > 0) {
                if (distance < minDistance) {
                    minDistance = distance;
                    currentSection = index;
                }
            }
        });

        return currentSection;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentSectionIndex = getCurrentSection();
                if (currentSectionIndex !== null && currentSectionIndex !== -1) {
                    tabs.forEach((tab) => tab.classList.remove('active'));
                    if (tabs[currentSectionIndex]) {
                        tabs[currentSectionIndex].classList.add('active');
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

const initAccordions = (sectionWrapperId) => {
    const sectionWrapper = document.getElementById(sectionWrapperId);
    if (!sectionWrapper) return;

    const accordions = sectionWrapper.querySelectorAll('.accordion');
    let currentAccordionIndex = 0;
    const intervalTime = 12000;
    let progressInterval;
    let isPaused = false;

    const resetAllAccordions = () => {
        accordions.forEach((accordion) => {
            accordion.classList.remove('accordion_active');
            accordion.setAttribute('aria-expanded', 'false');
            const progressBar = accordion.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.height = '0%';
            }
        });
    };

    const resetProgressBar = (progressBar, duration) => {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.height = '0%';
        setTimeout(() => {
            progressBar.style.transition = `height ${duration / 1000}s linear`;
            progressBar.style.height = '100%';
        }, 10);
    };

    const openAccordion = (index) => {
        resetAllAccordions();
        const activeAccordion = accordions[index];
        if (!activeAccordion) return;
        activeAccordion.classList.add('accordion_active');
        activeAccordion.setAttribute('aria-expanded', 'true');
        const progressBar = activeAccordion.querySelector('.progress-bar');
        if (progressBar) resetProgressBar(progressBar, intervalTime);
        currentAccordionIndex = index;
    };

    const switchToNextAccordion = () => {
        const nextIndex = (currentAccordionIndex + 1) % accordions.length;
        openAccordion(nextIndex);
    };

    const stopAutomation = () => {
        clearInterval(progressInterval);
    };

    const startAutomation = () => {
        stopAutomation();
        progressInterval = setInterval(() => {
            if (!isPaused) {
                switchToNextAccordion();
            }
        }, intervalTime);
    };

    accordions.forEach((accordion, index) => {
        const intro = accordion.querySelector('.accordion_intro');
        if (!intro) return;
        intro.addEventListener('click', () => {
            openAccordion(index);
            startAutomation();
        });
    });

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
    }, { threshold: 0.4 });

    observer.observe(sectionWrapper);
};

function initIndustryTabs() {
    const tabButtons = document.querySelectorAll('.feature-tab-btn');
    const slides = document.querySelectorAll('.features-tabs-section .slide');
    const prevNav = document.querySelector('.prev-nav');
    const nextNav = document.querySelector('.next-nav');
    const sliderContainer = document.querySelector('.slider-container');

    if (!tabButtons.length || !slides.length) return;

    let currentSlideIndex = 0;
    const slideCount = slides.length;

    function updateActiveSlide() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlideIndex);
        });
    }

    function updateActiveTab() {
        tabButtons.forEach((btn, index) => {
            btn.classList.toggle('active', index === currentSlideIndex);
        });
    }

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            currentSlideIndex = index;
            updateActiveSlide();
            updateActiveTab();
        });
    });

    if (prevNav) {
        prevNav.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + slideCount) % slideCount;
            updateActiveSlide();
            updateActiveTab();
        });
    }

    if (nextNav) {
        nextNav.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % slideCount;
            updateActiveSlide();
            updateActiveTab();
        });
    }

    let autoPlayInterval;

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % slideCount;
            updateActiveSlide();
            updateActiveTab();
        }, 8000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);

        let startX = 0;
        let startY = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    currentSlideIndex = (currentSlideIndex + 1) % slideCount;
                } else {
                    currentSlideIndex = (currentSlideIndex - 1 + slideCount) % slideCount;
                }
                updateActiveSlide();
                updateActiveTab();
            }

            startX = 0;
            startY = 0;
        });
    }
}

function initFaqAccordion() {
    const boxes = document.querySelectorAll('.z-accordianBox');
    if (!boxes.length) return;

    boxes.forEach((box) => {
        const heading = box.querySelector('h4');
        if (!heading) return;
        heading.addEventListener('click', () => {
            const isOpen = heading.classList.contains('active');
            boxes.forEach((b) => {
                const h = b.querySelector('h4');
                if (h) h.classList.remove('active');
            });
            if (!isOpen) {
                heading.classList.add('active');
            }
        });
    });
}

function initStickyCards() {
    if (typeof window.jQuery === 'undefined') return;

    const $ = window.jQuery;
    const s = $('.sticky-section .each-box-fort');
    if (!s.length) return;

    const c = s.find('.scroll-card');
    const d = c.length;
    const r = [];

    c.each(function (index) {
        const topOffset = (index + 1) * 18 + 170;
        $(this).css('top', topOffset + 'px');
        r.push($(this).offset().top);
    });

    function scaleCard(cardIndex, step) {
        let scaleVal = cardIndex !== d ? 1 - (d - cardIndex) * step : 1;
        $(c).eq(cardIndex - 1).css('transform', 'scale(' + scaleVal + ',1)');
    }

    $(window).on('scroll', function () {
        const scrollTop = $(window).scrollTop();

        for (let o = 0; o < d; o++) {
            let a = r[o] - scrollTop;
            const i = c.eq(o).outerHeight();
            let n = i;
            let t = 7e-4;
            if (d > 6) {
                t = 2e-4;
            }
            while (a < n) {
                scaleCard(o + 1, t);
                n -= 50;
                if (d > 6) {
                    t += 2e-4;
                } else {
                    t += 7e-4;
                }
            }
            if (a > i + 50) {
                c.eq(o).css('transform', 'scale(1,1)');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initTabNavigation();
    initAccordions('data-integration');
    initIndustryTabs();
    initFaqAccordion();
    initStickyCards();
});
