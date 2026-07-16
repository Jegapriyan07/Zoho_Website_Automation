// report-slider/report-template.js
// Empty reported-section shell — Zoho deployment fills .report-slider + .rating-table.
// Local preview shows black (left) / white (right) placeholder boxes only.

export const REPORT_SLIDER_START_MARKER = 'REPORT SLIDER SECTION — auto-injected by Web Page Builder';
export const REPORT_SLIDER_END_MARKER = 'END REPORT SLIDER SECTION';

/**
 * Remove a previously auto-injected report-slider block (if any).
 * @param {string} html
 * @returns {string}
 */
export function stripReportSliderBlock(html) {
  const startIdx = html.indexOf(REPORT_SLIDER_START_MARKER);
  if (startIdx === -1) return html;
  const commentStart = html.lastIndexOf('<!--', startIdx);
  const endIdx = html.indexOf(REPORT_SLIDER_END_MARKER, startIdx);
  if (commentStart === -1 || endIdx === -1) return html;
  const commentEnd = html.indexOf('-->', endIdx);
  if (commentEnd === -1) return html;
  return html.slice(0, commentStart) + html.slice(commentEnd + 3);
}

/**
 * Remove any agent-built reported-section so injection does not duplicate.
 * @param {string} html
 * @returns {string}
 */
export function stripAgentReportedSection(html) {
  return html.replace(
    /<section\s+[^>]*class="[^"]*reported-section[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
    ''
  );
}

/**
 * Build the empty shell the Zoho deployment server hydrates.
 * Layout only: black report box + white ratings column — no analyst copy.
 * @returns {string}
 */
export function buildReportSliderSnippet() {
  return `
<!-- ═══════════════════════════════════════════════════════════════
     ${REPORT_SLIDER_START_MARKER}
     Empty DOM shell — Zoho server fills .report-slider + .rating-table.
     Place immediately BEFORE #conclusion (closing Ready to build… CTA), after mid-page content.
     To remove: delete everything between these comment markers.
     ═══════════════════════════════════════════════════════════════ -->
<!-- Analysts quotes section -->
<section class="reported-section" aria-label="Analyst reports and ratings placeholder">
    <div class="content-wrap">
        <div class="report-slider">
        </div>
        <!-- Ratings sections -->
        <div class="trust-section rated-section">
            <div class="rating-table"></div>
        </div>
    </div>
</section>

<style>
/* ── Report Slider placeholder (black / white shell) ──────────── */
.reported-section {
  background: #fff;
  padding: 20px 0 90px;
}
.reported-section .content-wrap {
  display: flex;
  gap: 20px;
}
.reported-section .report-slider {
  background-color: var(--primary-font-color, #262626);
  color: var(--secondary-font-color, #fff);
  padding: 40px 50px;
  width: 55%;
  margin: 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 320px;
}
/* Empty left panel: scaffold looks like the live black quote box */
.reported-section .report-slider:empty::before {
  content: "Analyst quotes";
  opacity: 0.35;
  font-size: 14px;
  letter-spacing: 0.02em;
}
.reported-section .content-wrap .trust-section {
  width: 40%;
  height: 690px;
  overflow: auto;
  scrollbar-width: none;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e8eaee;
}
.reported-section .rating-table {
  margin: 0 auto 0;
  border: unset;
  padding: 10px;
  min-height: 100%;
}
.reported-section .rating-table:empty::before {
  content: "Ratings";
  display: block;
  opacity: 0.35;
  font-size: 14px;
  padding: 24px 12px;
  color: #333;
}
.reported-section .read-more-link {
  display: block;
  max-width: max-content;
  position: relative;
  color: var(--secondary-font-color, #fff);
  font-family: var(--zf-secondary-medium, inherit);
  padding-right: 35px;
  text-decoration: underline;
}
.reported-section .report-slider .slick-dots {
  text-align: left;
  padding-top: 30px;
}
.reported-section .slick-dots li {
  width: 20px;
  border-radius: 5px;
  background: #e0e0e0;
  height: 8px;
  border: 0;
  position: relative;
  display: inline-block;
  margin: 0 4px;
}
.reported-section .slick-dots li.slick-active {
  width: 35px;
  height: 8px;
  border: 0;
  background: #e0e0e0;
}
.reported-section .slick-dots li.slick-active:before {
  animation: rs-progresswidth 6s linear forwards;
  content: "";
  width: 40px;
  left: 0;
  position: absolute;
  background: #f70011;
  opacity: 1;
  height: 8px;
  border-radius: 5px;
}
@keyframes rs-progresswidth {
  from { width: 0; }
  to { width: 100%; }
}
.reported-section .report-slider .aem-report h5 {
  font-size: 35px;
  font-family: var(--primaryfont-semibold, var(--zf-primary-semibold, inherit));
  line-height: 45px;
  color: inherit;
}
.reported-section .report-slider .aem-report p {
  font-size: 17px;
  line-height: 27px;
  font-family: var(--primaryfont-regular, var(--zf-primary-regular, inherit));
}
.reported-section .rating-sec {
  width: 100%;
  display: flex;
  align-items: center;
  border: unset;
  box-shadow: 1px 1px 11px 0 #174aa81c;
  margin-bottom: 10px;
  border-radius: 9px;
  padding: 15px 20px;
  background: #fff;
  float: none;
}
.reported-section .rating-txt span {
  font-size: 24px;
}
.reported-section .content-wrap.animated .anim-star.svg-sprites.four_half1 {
  width: 90%;
}
@media (max-width: 991px) {
  .reported-section .report-slider,
  .reported-section .content-wrap .trust-section {
    width: 100%;
  }
  .reported-section .content-wrap {
    flex-wrap: wrap;
  }
  .reported-section .content-wrap .trust-section {
    height: auto;
    max-height: 420px;
  }
}
@media (max-width: 767px) {
  .reported-section {
    padding: 40px 0 60px;
  }
  .reported-section .report-slider {
    padding: 28px 24px;
    min-height: 220px;
  }
}
</style>

<script>
/* Slick init waits until Zoho fills .report-slider with slides */
(function () {
  function initReportSlider() {
    if (typeof window.jQuery === 'undefined' || !window.jQuery.fn || !window.jQuery.fn.slick) return;
    var $ = window.jQuery;
    var $el = $('.reported-section .report-slider');
    if (!$el.length || $el.hasClass('slick-initialized')) return;
    if (!$el.children().length) return;
    $el.slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerPadding: '60px',
      speed: 1000,
      autoplay: true,
      dots: true,
      arrows: false,
      fade: true,
      adaptiveHeight: true
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportSlider);
  } else {
    initReportSlider();
  }
})();
</script>
<!-- ═══════════════════════════════════════════════════════════════
     ${REPORT_SLIDER_END_MARKER}
     ═══════════════════════════════════════════════════════════════ -->
`;
}
