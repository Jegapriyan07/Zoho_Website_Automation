// branding-section-template.js
// Live gold: mobile-apps.html / shopify-advanced-analytics.html
// Logos = Zoho trust-brands SPRITE (IKEA, Canon/LaLiga, HP, …) — NOT India marquee img list.
// Layout: TRUSTED BY GREAT BRANDS · bc1 counter LEFT · bc2 logo grid RIGHT (20% float ×9).

/** Live sprite icons on mobile-apps / Shopify branding-section (order matches live DOM). */
export const BRANDING_SECTION_ICONS = [
  { className: 'zicon-ikea', label: 'IKEA' },
  { className: 'zicon-suzuki', label: 'Suzuki' },
  { className: 'zicon-laliga', label: 'La Liga' },
  { className: 'zicon-mobile', label: 'Mobile / Comcast family' },
  { className: 'zicon-hp-wrap', label: 'HP' },
  { className: 'zicon-allianz', label: 'Allianz' },
  { className: 'zicon-johnson', label: 'Johnson Controls' },
  { className: 'zicon-life', label: 'Life / Vimeo family' },
  { className: 'zicon-crs', label: 'CRS / Tesla family' }
];

const SPRITE_URL =
  'https://www.zohowebstatic.com/sites/zweb/images/commonroot/zp-trust-brands-sprite.png';

/**
 * Build <section class="branding-section"> for solutions-template landings.
 * Ignores marquee brand img list — always uses live sprite set.
 */
export function buildBrandingSectionSnippet() {
  const logoLis = BRANDING_SECTION_ICONS.map(
    ({ className, label }) =>
      `            <li><span class="${className}" aria-label="${label}">Icon</span></li>`
  ).join('\n');

  return `
<!-- ═══════════════════════════════════════════════════════════════
     TRUSTED BRANDS SECTION — auto-injected by Web Page Builder
     Variant: branding-section (mobile-apps / app-connector gold)
     Logos: live zp-trust-brands-sprite (IKEA · HP · …) — not India marquee list
     To remove: delete everything between these comment markers.
     ═══════════════════════════════════════════════════════════════ -->
<section class="branding-section" aria-label="Trusted by great brands" data-tb-variant="branding-section">
  <div class="content-wrap">
    <div class="branding-logos">
      <h2><span>Trusted by Great Brands</span></h2>
      <div class="branding-wrap">
        <div class="branding-count bc1">
          <div class="each-count">
            <div class="ec ec1 cshow">
              <span class="ec-num" za-thousand-customers="">22</span>
              <div class="ec-text"><span>Thousand</span>Customers</div>
            </div>
            <div class="ec ec2">
              <span class="ec-num" za-million-users="">4</span>
              <div class="ec-text"><span>Million</span>Users</div>
            </div>
          </div>
        </div>
        <div class="branding-count bc2">
          <ul>
${logoLis}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector('.branding-section[data-tb-variant="branding-section"]');
  if (!root) return;

  /* Dual counter rotate (live zanalytics_solutions) */
  var ec1 = root.querySelector('.ec.ec1');
  var ec2 = root.querySelector('.ec.ec2');
  if (ec1 && ec2) {
    setInterval(function () {
      var showFirst = ec1.classList.contains('cshow');
      if (showFirst) {
        ec1.classList.remove('cshow');
        ec1.style.display = 'none';
        ec2.classList.add('cshow');
        ec2.style.display = 'block';
      } else {
        ec2.classList.remove('cshow');
        ec2.style.display = 'none';
        ec1.classList.add('cshow');
        ec1.style.display = 'block';
      }
    }, 2000);
  }

  /* One-by-one logo entrance — live scaleEffect via .line-animated */
  var logos = root.querySelector('.branding-logos');
  if (!logos) return;

  var reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playLogoEntrance() {
    logos.classList.add('line-animated');
  }

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    playLogoEntrance();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        playLogoEntrance();
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );
  observer.observe(logos);
});
</script>

<style>
/* ── Trusted Brands · branding-section (live mobile-apps / Shopify) ── */
@keyframes tb-scaleEffect {
  0% { visibility: hidden; opacity: 0; transform: scale(0.8); }
  100% { visibility: visible; opacity: 1; transform: scale(1); }
}

.branding-section[data-tb-variant="branding-section"] {
  padding: 90px 0 40px;
  background: #fff;
}
.branding-section[data-tb-variant="branding-section"] .branding-logos {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}
.branding-section[data-tb-variant="branding-section"] .branding-logos h2 {
  font-size: 38px;
  line-height: 47.5px;
  font-weight: 400;
  letter-spacing: 1px;
  text-align: center;
  text-transform: uppercase;
  margin: 0 0 20px;
}
.branding-section[data-tb-variant="branding-section"] .branding-logos h2 span {
  display: inline-block;
  border-bottom: 1px solid #000;
  padding-bottom: 8px;
}
.branding-section[data-tb-variant="branding-section"] .branding-wrap {
  display: table;
  width: 100%;
  margin: 50px auto 0;
  table-layout: fixed;
}
.branding-section[data-tb-variant="branding-section"] .branding-count {
  display: table-cell;
  vertical-align: middle;
}
.branding-section[data-tb-variant="branding-section"] .branding-wrap .bc1 {
  width: 220px;
  background: #fff8f8;
  border: 1px solid #ffdad1;
  border-radius: 5px;
  padding: 28px 16px;
  text-align: center;
  box-sizing: border-box;
}
.branding-section[data-tb-variant="branding-section"] .branding-wrap .bc2 {
  padding-left: 60px;
  text-align: left;
  width: auto;
}
.branding-section[data-tb-variant="branding-section"] .each-count {
  position: relative;
  min-height: 120px;
}
.branding-section[data-tb-variant="branding-section"] .ec {
  display: none;
}
.branding-section[data-tb-variant="branding-section"] .ec.cshow {
  display: block;
}
.branding-section[data-tb-variant="branding-section"] .ec-num {
  display: block;
  font-size: 56px;
  line-height: 1.1;
  font-weight: 700;
  color: #ef5065;
}
.branding-section[data-tb-variant="branding-section"] .ec-text {
  margin-top: 6px;
  font-size: 19px;
  line-height: 1.35;
  color: #000;
  font-weight: 600;
}
.branding-section[data-tb-variant="branding-section"] .ec-text span {
  display: block;
  color: #ef5065;
  font-size: 19px;
  font-weight: 600;
}
.branding-section[data-tb-variant="branding-section"] .bc2 ul {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
  overflow: hidden;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li {
  float: left;
  display: inline-block;
  position: relative;
  width: 20%;
  text-align: left;
  margin: 25px 0;
  list-style: none;
  box-sizing: border-box;
  opacity: 0;
  visibility: hidden;
}
/* Staggered one-by-one reveal (live zanalytics_solutions scaleEffect) */
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(1) { animation: tb-scaleEffect 0.8s ease-out 0.5s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(2) { animation: tb-scaleEffect 0.8s ease-out 0.7s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(3) { animation: tb-scaleEffect 0.8s ease-out 0.9s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(4) { animation: tb-scaleEffect 0.8s ease-out 1.1s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(5) { animation: tb-scaleEffect 0.8s ease-out 1.3s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(6) { animation: tb-scaleEffect 0.8s ease-out 1.5s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(7) { animation: tb-scaleEffect 0.8s ease-out 1.7s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(8) { animation: tb-scaleEffect 0.8s ease-out 1.9s forwards; }
.branding-section[data-tb-variant="branding-section"] .branding-logos.line-animated ul li:nth-child(9) { animation: tb-scaleEffect 0.8s ease-out 2.1s forwards; }
@media (prefers-reduced-motion: reduce) {
  .branding-section[data-tb-variant="branding-section"] .bc2 li {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    animation: none !important;
  }
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span {
  background-image: url("${SPRITE_URL}");
  display: inline-block;
  vertical-align: middle;
  background-size: 1100px auto;
  background-repeat: no-repeat;
  height: 40px;
  width: 115px;
  font-size: 0;
  color: transparent;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-ikea {
  background-position: 0 -524px;
  width: 92px;
  background-size: 1050px auto;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-suzuki {
  background-position: -880px -555px;
  width: 85px;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-laliga {
  background-position: -121px -576px;
  width: 100px;
  background-size: 1050px auto;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-mobile {
  background-position: -186px -460px;
  width: 115px;
  background-size: 850px auto;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-hp-wrap {
  background-position: -1048px -49px;
  width: 40px;
  background-size: 1300px auto;
  position: relative;
  left: 30px;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-allianz {
  width: 85px;
  background-position: -993px -500px;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-johnson {
  background-position: -986px -554px;
  width: 90px;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-life {
  background-position: -85px -469px;
  width: 96px;
  background-size: 950px auto;
}
.branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-crs {
  background-position: -6px -602px;
  width: 110px;
}
@media (max-width: 991px) {
  .branding-section[data-tb-variant="branding-section"] .branding-wrap {
    display: block;
  }
  .branding-section[data-tb-variant="branding-section"] .branding-count {
    display: block;
  }
  .branding-section[data-tb-variant="branding-section"] .branding-wrap .bc1 {
    width: 220px;
    margin: 0 auto 36px;
  }
  .branding-section[data-tb-variant="branding-section"] .branding-wrap .bc2 {
    padding-left: 0;
  }
  .branding-section[data-tb-variant="branding-section"] .bc2 li {
    width: 33.333%;
    text-align: center;
  }
  .branding-section[data-tb-variant="branding-section"] .bc2 li span.zicon-hp-wrap {
    left: 0;
  }
}
@media (max-width: 565px) {
  .branding-section[data-tb-variant="branding-section"] {
    padding: 60px 0 30px;
  }
  .branding-section[data-tb-variant="branding-section"] .bc2 li {
    width: 50%;
    margin: 18px 0;
  }
}
</style>
<!-- END TRUSTED BRANDS SECTION -->
`;
}
