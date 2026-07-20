# Agent build gates — avoid missed brief details

**Read [writer-drop-playbook.md](writer-drop-playbook.md) first when a new Writer doc is dropped.**

This file is the short checklist. The playbook has full section patterns and reference folders.

---

## 1. Writer brief extraction (Phase 0-B)

| Gate | Requirement |
|------|-------------|
| **extract-writer** | **Writer API only** — Web Page Builder Phase 0 / `extractWriterViaApi` (`writer_api` in sidecar). ❌ Chrome MCP · ❌ Puppeteer |
| **validate-brief** | `npm run validate:brief -- --file z_workflow/briefs/{slug}.txt` — **exit 0 before build** |
| **extraction_method** | `briefs/{slug}.extract.json` → `"writer_api"` |
| **Char count** | Merged length ≥ 90% of footer `Chars:` when available — not sufficient alone |
| **Required strings** | Per `section-composites.json` archetype (steps, testimonials, Dresner, …) |
| **CTA audit** | Every brief CTA → visible `<a class="cta-btn act-btn">` in output |
| **Composite** | Match `section-composites.json` — do not skip recognition/testimonials/how-it-works |
| **Save** | `z_workflow/briefs/{slug}.txt` before matching |

---

## 1b. Output validation (before APPROVE)

| Gate | Requirement |
|------|-------------|
| **validate-output** | `npm run validate:output -- --slug {slug}` or `--from-state` — **exit 0 before APPROVE** |
| **Block counts** | Per archetype `output_inventory_checks` (example rows, FAQ items, steps, …) |
| **Banner slots** | Hero vs mid-cta vs closing-cta use different `bg_treatment` — `banner_audit` in validation.json flags identical hero/closing CSS |
| **CTA strings** | Every `cta_strings_required` entry visible in HTML |
| **Mandatory CSS** | Brand CTA override + `--primary-btn-color: #e42527` |
| **Article TOC layout** | `comparison-guide`: `.left-tab` **340px** + `.cont-sec { margin-left: 100px }` (content starts late). Gold: `output/cloud-analytics` |
| **Placeholders** | `prezohoweb.zoho.com` only — no `placehold.co` or `./assets/` |
| **Mid-page CTA band** | Red `.cta-btn.act-btn` inside `pre-banner-section` (or dark showcase band) — **not** plain white `za-bottom-section` |

---

## 1c. Article TOC + late content (comparison-guide)

When the archetype is `comparison-guide` (or any page with `.tabsection` / left-tab):

| Check | Pass |
|-------|------|
| Top-level sections | **Only** `banner` → `tabsection` → `faq-section` (gold STRUCTURE) |
| Nested article body | Tables / tools / steps / CTAs = `.cont-sec` **inside** `#right-content` — never sibling `<section class="comparison-table-section">` |
| Rail width | `.left-tab { flex: 0 0 340px; width: 340px }` — **do not shrink** |
| Content gutter | `.cont-sec { margin: 0 0 45px 100px }` — content starts **late** |
| TOC type | “In this article” **32px** Puvi Bold · links **16px** SemiBold · `padding: 12px 15px` |
| Peach CTA | **Inside** scrollable `ul#tabs` as last child — not outside the scrollbar |
| Tables | `.table-wrap { overflow-x: auto }` + min-width 960/1200 — horizontal scroll, no mid-word crush |
| FAQ | **Not** in TOC — `.faq-section` after tabsection |

Gold page: **`output/cloud-analytics/`** · CSS: **`z_workflow/gold-snippets/article-toc-layout.css`** · live: `cloud-reporting-tools.html`  
Composer lists nested blocks as “NEST as .cont-sec” (not top-level sections). `validate:output` fails sibling article `<section>`s.

---

## 2. CTA visibility + brand red (Phase 6 — critical)

`zohocustom.css` hides `.act-btn.cta-btn` until team nav loads. **Always override in page CSS.**

**Brand CTA red is theme-independent** — see `Rulesbook.md` §2.2.1. Page theme colours must not tint buttons or the testimonials link.

```css
:root {
    --color-brand-cta: #e42527;
    --primary-btn-color: #e42527;
}

.page-container .cta-btn.act-btn {
    display: inline-block;
    visibility: visible;
    opacity: 1;
    background: var(--primary-btn-color);
    color: #fff;
}

.testimonials-section .content-wrap a {
    color: var(--primary-btn-color);
}

.testimonials-section .content-wrap a .arrow {
    border-color: var(--primary-btn-color);
}
```

Gold standard: `output/client-dashboard-software/style.css`

---

## 2c. Mid-page / closing CTA band — `pre-banner-section` (Phase 6)

**Every red CTA block before FAQ (or page end) must sit inside a visible CTA band** — textured gradient or dark showcase — not plain white padding.

| Check | Pass |
|-------|------|
| Section class | `pre-banner-section` (or mapped reference equivalent) |
| Background | `background-image` with `blue-shadow-with-texture.png` and/or theme gradients — **not** unstyled white |
| Buttons | Inside `.cta-btn-wrap` within `.content-wrap` |
| Anti-pattern | `za-bottom-section` with only `padding` and no background treatment |

Gold standards: `output/ppc-agency-client-dashboard`, `output/white-label-reporting-tool`, `Reference-Site/Marketing-Agencies`

---

## 2b. Testimonial card palette (Phase 6 — automation)

**Do not theme-tint** `.zwc-nav-box` from `--color-primary` or vertical palette.

Fixed extracted values — copy from `Rulesbook.md` §2.2.2 · `team-dna.json`:

```css
--testimonial-peach-bg: #FFF4E8;
--testimonial-peach-border: #F0DCC8;
--testimonial-mint-bg: #EEF8F4;
--testimonial-mint-border: #C8E8D8;
--testimonial-blue-bg: #EEF4FC;
--testimonial-blue-border: #D4E4F5;
```

Inner quote boxes: `rgba(240,220,200,0.45)` · `rgba(200,232,216,0.45)` · `rgba(212,228,245,0.45)` — never cyan/violet/teal tints.

Gold standard: `output/sales-dashboard-examples/style.css`

---

## 3. Dashboard-examples landing order

See [section-composites.json](section-composites.json) → `dashboard-examples-landing`

**Order:** hero → sticky-stack types (`sticky-card-section`) → one-click CTA → integrations → **recognition** → **testimonials** → steps → closing CTA → FAQ

> Finance builds use **BI Finance** `scroll-card` stacking — sales variant still uses zigzag `dashboard-wrapper`.

**References:** recognition + testimonials → **BI-Marketing** (not partial PowerBI pattern)

### Dashboard zigzag (left/right rows) — gold standard `output/testing-3/`

When the brief uses `dashboard-wrapper` content blocks:

| Check | Pass |
|-------|------|
| Row classes | Alternating `.main-wrapper.right-content` / `.left-content` |
| Spacing | `padding: 100px 0`, `margin-bottom: 50px`, `gap: 40px` |
| Panels | 55% `::before` rectangles, `border-radius: 30px`, **no clip-path** |
| Images | Vertically centered in image column |
| Motion | `data-onscroll` + `.zwe-om` IntersectionObserver in `script.js` |

---

## 3b. Trusted Brands builds (★ Trusted Brands checkbox)

When `build_options.trusted_brands` is true in `state.json` (Web Page Builder option):

| Gate | Requirement |
|------|-------------|
| **Variant from architecture** | `section-composites.json` → `trusted_brands_inject.variant` · `mobile-apps-landing` / `app-connector-landing` → **`branding-section`** · BI / default → **`marquee`** (`.za-brandsCounts`) |
| **Verify matches variant** | Inject verify fails if wrong BEM for archetype (marquee on Mobile Apps, or branding-section when marquee required) |
| **Agent must NOT build** | No `za-brandsCounts`, `branding-section`, `marquee-wrapper`, or `za-cust-counts` in agent output — server injects after compose |
| **Placement** | Injected immediately after first `</section>` (hero close) |
| **Logo count (marquee)** | 30 brands from `inTrustIconList` (`web-tool/trusted-brands/brands-data.js`) |
| **Logo count (branding-section)** | 9 live sprite icons (`zicon-ikea` … via `zp-trust-brands-sprite.png`) · dual rotating counters — **not** India marquee img list |
| **Image paths** | `https://prezohoweb.zoho.com/sites/zweb/images/otherbrandlogos/…` |
| **Lazy load** | `loading="lazy"` on every logo `<img>` |
| **Marquee speed** | Live-calibrated: `SLICK_STEP_PX` 261 · `SLICK_STEP_MS` 3018 · pixel `--tb-scroll-end` (marquee variant only) |
| **Counters** | `za-thousand-customers` / `za-million-users` |
| **Gold standard (marquee)** | `output/testing-3/index.html` |
| **Gold standard (branding-section)** | live `mobile-apps.html` / `shopify-advanced-analytics.html` |

Pipeline: `web-tool/trusted-brands/inject.js` · variant resolver `variants.js`.

Pipeline module: `web-tool/trusted-brands/inject.js` — used on **every** build path (Writer URL, DOCX upload, revise).

---

## 3c. Report Slider builds (★ Report Slider checkbox)

When `build_options.report_slider` is true in `state.json` (Web Page Builder option):

| Gate | Requirement |
|------|-------------|
| **Agent must NOT build** | No `reported-section`, `report-slider`, `aem-report`, or `rating-table` in agent output — server injects |
| **What gets injected** | Empty DOM shell only (matches `report-slider-with-ratings` handoff) — black left box + white ratings column |
| **Placement** | Immediately **before** `#conclusion` (closing Ready to build… CTA) — **not** before mid-page `#one-click-cta`, not after dashboard mid-page |
| **Timing** | Injected **before** `validate:output` |
| **Hydration** | Zoho deployment fills empty `.report-slider` + `.rating-table` |
| **Gold standard** | Empty shell HTML from writer handoff / Live `reported-section` structure |

Pipeline module: `web-tool/report-slider/inject.js` — used on **every** build path (Writer URL, DOCX upload, revise).

UI: both options are independent checkboxes; user clicks **Build page** once.

## 4. Before APPROVE

1. Grep output for every CTA string from brief + `See all testimonials`
2. Open in browser — buttons must be **visible**, not just in DOM
3. Section count vs composite / `source_map`
4. **End banner** — `#conclusion` uses `state.similarity.end_banner` from `end-banner-types.json` (not plain white; not the same EB type on every build)
5. **Dashboard zigzag** — `.dashboard-wrapper .main-wrapper` has `padding: 100px 0`, `gap: 40px`, clean rectangle `::before` panels (NO clip-path); image column vertically centered
6. **No focus rings** — clicking CTAs / step tabs / accordion headers must not show outline or focus box-shadow (see playbook mandatory CSS)
7. Checklist in `.cursor/rules/web-pages-frontend.mdc`

---

*See [writer-drop-playbook.md](writer-drop-playbook.md) for HTML skeletons and per-section rules.*
