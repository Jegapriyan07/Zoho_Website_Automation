/**
 * ============================================================================
 * COMPONENT: Role Issues Fade Effect
 * ============================================================================
 */
(function RoleIssuesComponent() {
  const roleIssuesLists = Array.from(document.querySelectorAll(".role-issues"));
  
  roleIssuesLists.forEach((list) => {
    // Wrap the list if not already wrapped
    if (!list.parentElement?.classList.contains('role-issues-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'role-issues-wrapper';
      list.parentNode.insertBefore(wrapper, list);
      wrapper.appendChild(list);
      
      // Create fade elements
      const fadeRight = document.createElement('div');
      fadeRight.className = 'role-issues-fade-right';
      wrapper.appendChild(fadeRight);
      
      const fadeLeft = document.createElement('div');
      fadeLeft.className = 'role-issues-fade-left';
      wrapper.appendChild(fadeLeft);
    }
    
    const wrapper = list.parentElement;
    const fadeRight = wrapper.querySelector('.role-issues-fade-right');
    const fadeLeft = wrapper.querySelector('.role-issues-fade-left');
    
    const updateFadeState = () => {
      if (!list || !fadeRight || !fadeLeft) return;
      const scrollLeft = list.scrollLeft;
      const scrollWidth = list.scrollWidth;
      const clientWidth = list.clientWidth;
      const nearEnd = scrollLeft + clientWidth >= scrollWidth - 5;
      const hasScrolled = scrollLeft > 5;
      const canScroll = scrollWidth > clientWidth;
      
      // Update right fade (show when not at end and can scroll)
      if (canScroll && !nearEnd) {
        fadeRight.classList.remove('hidden');
      } else {
        fadeRight.classList.add('hidden');
      }
      
      // Update left fade (show when scrolled)
      if (hasScrolled) {
        fadeLeft.classList.add('visible');
      } else {
        fadeLeft.classList.remove('visible');
      }
    };
    
    const handler = () => updateFadeState();
    list.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    // Initial check after a small delay to ensure layout is complete
    setTimeout(() => updateFadeState(), 100);
    updateFadeState();
  });
})();

/**
 * ============================================================================
 * COMPONENT: Role Help Accordion
 * ============================================================================
 */
(function RoleHelpAccordionComponent() {
  const setupAccordion = (accordion) => {
    const helpItems = Array.from(accordion.querySelectorAll(".role-help-item"));
    const helpImage = accordion.closest(".role-help")?.querySelector(".role-help-image");
    
    const setItemHeight = (item, shouldOpen) => {
      const content = item.querySelector("p");
      if (!content) return;
      
      if (shouldOpen) {
        // Add class first to enable content visibility for measurement
        item.classList.add("is-open");
        // Update icon immediately when class is added
        updateHelpIcons();
        // Temporarily remove max-height to get accurate measurement
        item.style.setProperty('--accordion-height', '');
        // Get the natural height
        const height = content.scrollHeight;
        // Set to 0 for animation start
        item.style.setProperty('--accordion-height', '0px');
        // Force reflow to ensure 0px is applied
        void content.offsetHeight;
        // Then animate to full height
        requestAnimationFrame(() => {
          item.style.setProperty('--accordion-height', `${height}px`);
        });
      } else {
        // Get current height for smooth collapse
        const height = content.scrollHeight || content.offsetHeight;
        if (height > 0) {
          item.style.setProperty('--accordion-height', `${height}px`);
          // Force reflow
          void content.offsetHeight;
        }
        // Then collapse
        requestAnimationFrame(() => {
          item.style.setProperty('--accordion-height', '0px');
          item.classList.remove("is-open");
          // Update icon immediately when class is removed
          updateHelpIcons();
        });
      }
    };
    
    const setHelpImage = (item) => {
      if (!helpImage || !item) return;
      const nextSrc = item.getAttribute("data-image");
      if (nextSrc) {
        helpImage.src = nextSrc;
      }
    };
    
    const updateHelpIcons = () => {
      helpItems.forEach((item) => {
        const icon = item.querySelector(".role-help-icon");
        if (!icon) return;
        icon.textContent = item.classList.contains("is-open") ? "–" : "+";
      });
    };
    
    if (!helpItems.length) return;
    
    helpItems.forEach((item) => {
      const trigger = item.querySelector(".role-help-trigger");
      const content = item.querySelector("p");
      if (!trigger || !content) return;
      
      // Clean up CSS custom property after transition completes (only for collapsed state)
      const handleTransitionEnd = (e) => {
        // Only handle max-height transitions and ensure it's for this specific content element
        if (e.propertyName === 'max-height' && e.target === content) {
          // Only clear custom property if it's collapsed (to allow natural height when open)
          const currentHeight = getComputedStyle(item).getPropertyValue('--accordion-height');
          if (!item.classList.contains("is-open") && parseFloat(currentHeight) === 0) {
            item.style.removeProperty('--accordion-height');
          }
        }
      };
      content.addEventListener('transitionend', handleTransitionEnd);
      
      trigger.addEventListener("click", () => {
        if (item.classList.contains("is-open")) {
          setItemHeight(item, false);
          return;
        }
        helpItems.forEach((other) => {
          if (other !== item) setItemHeight(other, false);
        });
        setItemHeight(item, true);
        setHelpImage(item);
      });
    });
    
    const initialItem =
      helpItems.find((item) => item.classList.contains("is-open")) || helpItems[0];
    if (initialItem) {
      setItemHeight(initialItem, true);
      setHelpImage(initialItem);
    }
    updateHelpIcons();
    
    window.addEventListener("resize", () => {
      helpItems.forEach((item) => {
        if (!item.classList.contains("is-open")) return;
      });
    });
  };

  document
    .querySelectorAll(".role-help-list")
    .forEach((accordion) => setupAccordion(accordion));
})();

/**
 * ============================================================================
 * COMPONENT: Role Tabs Navigation
 * ============================================================================
 */
(function RoleTabsComponent() {
  // Constants
  const roleTabs = Array.from(document.querySelectorAll(".roles-tab"));
  const rolesTabsContainer = document.querySelector(".roles-tabs");
  const roleTabScrollOffset = 350;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  
  // State
  let isRoleTabTicking = false;
  
  // Tab Targets Mapping
  const roleTabTargets = roleTabs
    .map((tab) => {
      const targetId = tab.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      return target ? { tab, target } : null;
    })
    .filter(Boolean);

  /**
   * Updates the indicator position to match the active tab
   */
  const updateIndicator = (activeTab) => {
    if (!rolesTabsContainer || !activeTab) return;
    
    // Simple toggle switch effect: get tab position and width
    // Subtract padding so indicator starts at 0px instead of 4px
    const containerPadding = parseFloat(getComputedStyle(rolesTabsContainer).paddingLeft) || 0;
    const left = activeTab.offsetLeft - containerPadding;
    const width = activeTab.offsetWidth;
    
    // Update indicator position (CSS transition handles smooth movement)
    rolesTabsContainer.style.setProperty('--indicator-left', `${left}px`);
    rolesTabsContainer.style.setProperty('--indicator-width', `${width}px`);
    rolesTabsContainer.classList.add("has-active");
  };

  /**
   * Scrolls the active tab into view within the container
   */
  const scrollTabIntoView = (activeTab, updateIndicatorCallback = null) => {
    if (!rolesTabsContainer || !activeTab) return;
    
    const containerRect = rolesTabsContainer.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const currentScrollLeft = rolesTabsContainer.scrollLeft;
    const containerWidth = containerRect.width;
    const containerScrollWidth = rolesTabsContainer.scrollWidth;
    const activeTabIndex = roleTabs.indexOf(activeTab);
    const nextTab = activeTabIndex >= 0 && activeTabIndex < roleTabs.length - 1 ? roleTabs[activeTabIndex + 1] : null;
    const isShrunk = window.innerWidth <= 991;
    
    // Calculate the tab's position relative to the container's scrollable area
    const tabLeftRelativeToContainer = tabRect.left - containerRect.left + currentScrollLeft;
    const tabRightRelativeToContainer = tabLeftRelativeToContainer + tabRect.width;
    
    // Get current scroll position and container width
    const scrollLeft = rolesTabsContainer.scrollLeft;
    
    // Calculate if we need to scroll
    let targetScrollLeft = scrollLeft;
    const padding = 10; // Padding from edges
    
    // If shrunk and next tab exists, scroll to reveal both active and next tab
    if (isShrunk && nextTab) {
      const nextTabRect = nextTab.getBoundingClientRect();
      const nextTabLeftRelativeToContainer = nextTabRect.left - containerRect.left + currentScrollLeft;
      const nextTabRightRelativeToContainer = nextTabLeftRelativeToContainer + nextTabRect.width;
      
      // Calculate scroll position to show active tab and reveal next tab
      // Position active tab near left (with padding) and show as much of next tab as possible
      const maxScrollLeft = containerScrollWidth - containerWidth;
      
      // If tab is to the left of visible area, scroll to show it
      if (tabLeftRelativeToContainer < scrollLeft + padding) {
        targetScrollLeft = Math.max(0, tabLeftRelativeToContainer - padding);
      }
      // If tab is visible, scroll to reveal more of the next tab
      else {
        // Position active tab at padding from left, then show next tab
        const activeTabTargetPosition = padding;
        
        // Calculate scroll position: position active tab at padding, show next tab
        let calculatedScrollLeft = tabLeftRelativeToContainer - activeTabTargetPosition;
        
        // Ensure we don't scroll past max
        calculatedScrollLeft = Math.min(maxScrollLeft, calculatedScrollLeft);
        
        // Ensure we don't scroll before start
        calculatedScrollLeft = Math.max(0, calculatedScrollLeft);
        
        // Check if next tab would be visible after scrolling
        const nextTabVisibleLeft = nextTabLeftRelativeToContainer - calculatedScrollLeft;
        const nextTabVisibleRight = nextTabRightRelativeToContainer - calculatedScrollLeft;
        
        // If next tab would be at least partially visible (even if cut off), use this position
        if (nextTabVisibleRight > 0 && nextTabVisibleLeft < containerWidth) {
          targetScrollLeft = calculatedScrollLeft;
        } else {
          // Fallback: ensure active tab is visible with padding, and try to show next tab
          if (tabRightRelativeToContainer > scrollLeft + containerWidth - padding) {
            targetScrollLeft = tabRightRelativeToContainer - containerWidth + padding;
          } else {
            // Active tab is visible, scroll to show more of next tab
            // Scroll further right to reveal next tab
            const revealNextTabScroll = nextTabLeftRelativeToContainer - (containerWidth * 0.7); // Show next tab at 70% from left
            targetScrollLeft = Math.min(maxScrollLeft, Math.max(0, revealNextTabScroll));
          }
        }
      }
    } else {
      // Original logic for non-shrunk screens or last tab
      // If tab is to the left of visible area, scroll to show it
      if (tabLeftRelativeToContainer < scrollLeft + padding) {
        targetScrollLeft = Math.max(0, tabLeftRelativeToContainer - padding);
      }
      // If tab is to the right of visible area, scroll to show it
      else if (tabRightRelativeToContainer > scrollLeft + containerWidth - padding) {
        targetScrollLeft = tabRightRelativeToContainer - containerWidth + padding;
      }
    }
    
    // Scroll smoothly if needed
    if (targetScrollLeft !== scrollLeft) {
      rolesTabsContainer.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
      
      // Update indicator after scroll completes
      if (updateIndicatorCallback) {
        // Wait for scroll animation to complete (typically 300-500ms)
        setTimeout(() => {
          updateIndicatorCallback(activeTab);
        }, 400);
      }
    } else if (updateIndicatorCallback) {
      // Tab is already visible, update indicator immediately
      updateIndicatorCallback(activeTab);
    }
  };

  /**
   * Smoothly scrolls to a target element
   */
  const smoothScrollTo = (target, duration = 1200, offset = 0) => {
    if (!target || prefersReducedMotion.matches) {
      if (target) {
        const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetY, behavior: 'instant' });
      }
      return;
    }
    if (duration <= 0) {
      const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: 'instant' });
      return;
    }
    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
    const distance = targetY - startY;
    let startTime = null;
    const easeInOut = (t) => 0.5 * (1 - Math.cos(Math.PI * t));
    const step = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOut(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /**
   * Updates which role tab should be active based on scroll position
   */
  const updateActiveRoleTab = () => {
    if (!roleTabTargets.length) return;
    const scrollPosition = window.scrollY + roleTabScrollOffset + 1;
    let activeTarget = roleTabTargets[0];
    roleTabTargets.forEach((item) => {
      const targetTop = item.target.getBoundingClientRect().top + window.scrollY;
      if (targetTop <= scrollPosition) {
        activeTarget = item;
      }
    });
    roleTabs.forEach((item) => item.classList.remove("is-active"));
    activeTarget.tab.classList.add("is-active");
    // Scroll the navbar horizontally to bring the active tab into view
    scrollTabIntoView(activeTarget.tab, updateIndicator);
  };

  /**
   * Handles scroll events with throttling
   */
  const handleRoleTabScroll = () => {
    if (isRoleTabTicking) return;
    isRoleTabTicking = true;
    requestAnimationFrame(() => {
      updateActiveRoleTab();
      isRoleTabTicking = false;
    });
  };


  // Event Listeners: Tab Click
  roleTabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      roleTabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      
      // Scroll the navbar horizontally to bring the active tab into view
      scrollTabIntoView(tab, updateIndicator);
      
      const targetId = tab.getAttribute("href");
      if (targetId) {
        const target = document.querySelector(targetId);
        if (target) {
          smoothScrollTo(target, 10, roleTabScrollOffset);
        }
      }
    });
  });

  // Event Listeners: Window Scroll & Resize
  window.addEventListener("scroll", () => {
    handleRoleTabScroll();
  }, { passive: true });
  
  window.addEventListener("resize", () => {
    handleRoleTabScroll();
    // Update indicator after layout changes, using requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      const activeTab = roleTabs.find(tab => tab.classList.contains("is-active"));
      if (activeTab) {
        updateIndicator(activeTab);
      }
    });
  });

  // Initialization
  updateActiveRoleTab();
  // Ensure indicator is set after initial render
  requestAnimationFrame(() => {
    const activeTab = roleTabs.find(tab => tab.classList.contains("is-active"));
    if (activeTab && rolesTabsContainer) {
      updateIndicator(activeTab);
    }
  });
})();

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
