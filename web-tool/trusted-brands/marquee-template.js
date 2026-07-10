// trusted-brands/marquee-template.js
// Generates the self-contained trusted-brands HTML block.
//
// PLACEMENT: inject this block AFTER the first </section> tag in index.html
// (i.e. after the hero/banner section), matching the layout on
// https://www.zoho.com/analytics/ai-powered-embedded-analytics.html
//
// Marquee speed matches production Slick settings: speed 3000, cssEase linear.
// Counter animation uses IntersectionObserver and counts from 1 (2000ms, Zoho numberAnimate).

import { BRAND_STATS } from './brands-data.js';

/** Base URL for brand logo assets in local / preview builds. */
export const PREZOHO_WEB_BASE = 'https://prezohoweb.zoho.com';

// Marquee speed calibrated from live zoho.com/analytics Slick track (30-brand IN list):
// ~261px per step, ~3018ms per step → ~86.5 px/s average scroll speed.
export const SLICK_STEP_PX = 261;
export const SLICK_STEP_MS = 3018;
export const MARQUEE_PX_PER_SECOND = (SLICK_STEP_PX / SLICK_STEP_MS) * 1000;

/** @deprecated Use pixel-based duration from measured track width at runtime. */
export const MARQUEE_SPEED_MS = SLICK_STEP_MS;

/** Duration for one full brand set at live analytics scroll speed. */
export function getMarqueeDurationMs(oneSetWidthPx) {
  return Math.round((oneSetWidthPx / SLICK_STEP_PX) * SLICK_STEP_MS);
}

/** Customer / member count-up duration (matches Zoho numberAnimate). */
export const COUNT_ANIMATION_MS = 2000;

const TRUSTED_BRANDS_START_MARKER = 'TRUSTED BRANDS SECTION — auto-injected by Web Page Builder';
const TRUSTED_BRANDS_END_MARKER = 'END TRUSTED BRANDS SECTION';

/**
 * Prepend prezohoweb base URL so logo images load in local preview.
 * Accepts relative (/sites/…) or absolute URLs.
 */
export function resolveBrandImgPath(path) {
  if (!path) return PREZOHO_WEB_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PREZOHO_WEB_BASE}${normalized}`;
}

/**
 * Remove an existing trusted-brands block (if any) before re-injection.
 * @param {string} html
 * @returns {string}
 */
export function stripTrustedBrandsBlock(html) {
  const startIdx = html.indexOf(TRUSTED_BRANDS_START_MARKER);
  if (startIdx === -1) return html;

  const commentStart = html.lastIndexOf('<!--', startIdx);
  const endIdx = html.indexOf(TRUSTED_BRANDS_END_MARKER, startIdx);
  if (endIdx === -1) return html;

  const commentEnd = html.indexOf('-->', endIdx);
  if (commentStart === -1 || commentEnd === -1) return html;

  return html.slice(0, commentStart) + html.slice(commentEnd + 3);
}

/**
 * Build the full <section class="za-brandsCounts"> HTML block.
 *
 * @param {Array<{_imgPath:string, _imgWidth?:number}>} brands
 * @param {{ customers:{value,unit,label}, users:{value,unit,label} }} [stats]
 * @returns {string} Self-contained HTML string ready for injection.
 */
export function buildMarqueeSnippet(brands, stats = BRAND_STATS) {
  const allBrands = [...brands, ...brands];

  const logoItems = allBrands.map(({ _imgPath, _imgWidth }) => {
    const src = resolveBrandImgPath(_imgPath);
    const w = _imgWidth || 100;
    const logoName = _imgPath.split('/').pop().replace(/\.[^.]+$/, '');
    const name = logoName.replace(/-/g, ' ');
    return `        <span class="ae-icon">
          <img
            src="${src}"
            data-real-src="${src}"
            data-logo-name="${logoName}"
            width="${w}"
            alt="${name} logo"
            loading="lazy"
          />
        </span>`;
  }).join('\n');

  const statRows = [
    { attr: 'za-thousand-customers', ...stats.customers },
    { attr: 'za-million-users', ...stats.users }
  ];

  const statsHtml = statRows.map((s) => `
            <li>
              <span><span class="counts" ${s.attr} data-target="${s.value}">1</span>${s.unit}</span>
              <p>${s.label}</p>
            </li>`).join('');

  return `
<!-- ═══════════════════════════════════════════════════════════════
     TRUSTED BRANDS SECTION — auto-injected by Web Page Builder
     To remove: delete everything between these comment markers.
     ═══════════════════════════════════════════════════════════════ -->
<section class="za-brandsCounts" aria-label="Trusted by leading brands">
  <div class="brand-wrapper">

    <!-- trusted brands section -->
    <section class="marquee-wrapper" aria-hidden="true">
      <div class="trusted-icon-wrap" role="list">
        <div class="trust-icon tb-track" role="listitem">
${logoItems}
        </div>
      </div>
    </section>

    <!-- customers and members counts section -->
    <section class="za-counts-section">
      <div class="za-cust-counts" data-onscroll>
        <ul>${statsHtml}
        </ul>
      </div>
    </section>

  </div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function() {
  var trustWrap = document.querySelector('.za-brandsCounts .trusted-icon-wrap');
  var track = trustWrap && trustWrap.querySelector('.tb-track');
  var countsWrap = document.querySelector('.za-cust-counts[data-onscroll]');
  var COUNT_DURATION = ${COUNT_ANIMATION_MS};
  var SLICK_STEP_PX = ${SLICK_STEP_PX};
  var SLICK_STEP_MS = ${SLICK_STEP_MS};

  /* Lazy-start marquee when scrolled into view (matches zoho.com/analytics Slick init). */
  if (trustWrap && track) {
    function startMarquee() {
      if (track.classList.contains('tb-track--playing')) return;
      /* Measure actual track width — translateX(-50%) uses clipped width and runs ~half speed. */
      var oneSetWidth = track.scrollWidth / 2;
      var durationMs = Math.round((oneSetWidth / SLICK_STEP_PX) * SLICK_STEP_MS);
      track.style.setProperty('--tb-scroll-end', '-' + oneSetWidth + 'px');
      track.style.setProperty('--tb-marquee-duration', durationMs + 'ms');
      track.classList.add('tb-track--playing');
    }

    if ('IntersectionObserver' in window) {
      var marqueeObserver = new IntersectionObserver(function(entries, obs) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          startMarquee();
          obs.disconnect();
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      marqueeObserver.observe(trustWrap);
    } else {
      startMarquee();
    }
  }

  if (!countsWrap) return;

  function animateCount(el, start, end, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = String(Math.floor(progress * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;

      countsWrap.querySelectorAll('.counts').forEach(function(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        el.textContent = '1';
        animateCount(el, 1, target, COUNT_DURATION);
      });

      obs.disconnect();
    });
  }, { threshold: 0.5 });

  countObserver.observe(countsWrap);
});
</script>

<style>
/* ── Trusted Brands Block ─────────────────────────────────────── */
.za-brandsCounts {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 6px 13px #feac8980);
}
.brand-wrapper {
  background-color: #e6e9ea;
  border-radius: 0 0 50px 50px;
  position: relative;
  padding: 50px 0;
  overflow: hidden;
}

.trusted-icon-wrap {
  overflow: hidden;
  display: flex;
  width: 100%;
}
@keyframes tb-scroll {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(var(--tb-scroll-end, -50%), 0, 0); }
}
.tb-track {
  display: flex;
  align-items: center;
  width: max-content;
  will-change: transform;
  /* Paused until IntersectionObserver measures width and starts animation. */
}
.tb-track.tb-track--playing {
  animation: tb-scroll var(--tb-marquee-duration, 90s) linear infinite;
}
.tb-track.tb-track--playing:hover { animation-play-state: paused; }
.trust-icon .ae-icon {
  margin: 0 150px 0 0;
  font-size: 0;
  display: inline-flex;
  text-align: center;
  align-items: center;
  min-height: 100px;
  vertical-align: top;
  flex-shrink: 0;
}
.trust-icon .ae-icon img {
  display: block;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  transform: scale(1.15);
}

.za-cust-counts ul {
  display: flex;
  max-width: 450px;
  margin: 15px auto 0;
  text-align: center;
  justify-content: center;
  background-color: #ffffff96;
  border-radius: 20px;
  padding: 30px 20px 20px;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: #a18afb;
  box-shadow: 0 4px 22px 0 #00000017;
  list-style: none;
}
.za-cust-counts ul > li {
  width: 40%;
  position: relative;
}
.za-cust-counts ul > li p {
  margin: 0;
  font-size: 20px;
  color: #000;
}
.za-cust-counts ul > li > span {
  font-size: 50px;
  line-height: 50px;
  font-family: var(--zf-primary-semibold, inherit);
  color: #000;
}
.za-cust-counts ul > li > span::after {
  content: '+';
  font-family: var(--zf-primary-extralight, inherit);
}
.za-cust-counts ul > li > span span {
  color: #000;
}
.za-cust-counts ul > li:not(:first-child)::before {
  content: '';
  position: absolute;
  width: 1px;
  height: 50%;
  background: #601d1c;
  top: 0;
  bottom: 0;
  margin: auto;
  left: 0;
  opacity: .2;
}

@media only screen and (max-width: 576px) {
  .za-cust-counts ul > li p { font-size: 15px; }
  .za-cust-counts ul > li > span { font-size: 30px; line-height: 28px; }
  .za-brandsCounts { z-index: 0; }
  .za-cust-counts ul { max-width: 343px; }
  .trust-icon .ae-icon { margin: 0 60px 0 0; min-height: 64px; }
}
</style>
<!-- ═══════════════════════════════════════════════════════════════
     END TRUSTED BRANDS SECTION
     ═══════════════════════════════════════════════════════════════ -->
`;
}
