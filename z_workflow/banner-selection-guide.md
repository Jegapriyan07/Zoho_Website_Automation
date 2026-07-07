# Banner selection guide — choose by slot, not one-size-fits-all

**Read before Phase 6.** A landing page uses **different banner treatments per role**. The hero is never the same pattern as the closing CTA band. Reusing one background everywhere is an anti-pattern.

Companion: [section-composites.json](section-composites.json) · [writer-drop-playbook.md](writer-drop-playbook.md)

---

## Core rule

| Slot | Role | Must differ from |
|------|------|----------------|
| **Hero** | First impression, H1, primary CTA | Closing band (different class + bg) |
| **Mid-page CTA** | One-click / feature push after content blocks | Hero and closing (often white or flat neutral) |
| **Dark showcase** | Examples carousel / sticky cards — **not a CTA band** | Hero and pre-FAQ CTA |
| **Closing CTA** | Pre-FAQ red-button band | Hero; may match or contrast mid-page band |
| **In-content CTA** | Sidebar TOC card inside long-form guides | Full-width bands |

**Do not** copy `pre-banner-section` CSS onto the hero. **Do not** use plain white `za-bottom-section` for closing CTAs.

---

## Pattern catalog (Reference-Site + output)

### Hero patterns (pick ONE per page)

| ID | Class | Background | Use when | Reference |
|----|-------|------------|----------|-----------|
| **H-03** | `banner` + `.banner-bg` | Pastel linear gradient, rounded bottom | Agency / client-dashboard landings | `Marketing-Agencies`, `output/ppc-agency-client-dashboard` |
| **H-07** | `banner-section` | Theme radial gradients on `--primary-bg` | Dashboard-examples landings | `output/sales-dashboard-examples`, `output/finance-dashboard-examples` |
| **H-06** | `banner` (card) | Dark gradient card, inset margins | Long-form guides with sidebar TOC | `output/cloud-analytics-tools`, `collaborative-bi` |
| **H-09** | `za-banner-section` | Light gradient or image-set hero | Product / white-label webtemplate pages | `output/white-label-reporting-tool`, `Homepage-2026` |
| **H-08** | `banner-section` | Brand radial (green promo) | Integration / coupon campaigns | `output/zoho-books-analytics-integration`, `Coupon page` |
| **H-04** | `banner` + `.banner-main` | Dark solid `#201B18`, white text | BI / marketing dark hero | `BI-Marketing`, `Enterprise` |

### CTA band patterns (by slot — may repeat class, **never repeat bg**)

| ID | Class | Modifier / bg | Slot | Reference |
|----|-------|---------------|------|-----------|
| **C-01** | `pre-banner-section` | `blue-shadow-with-texture.png` + radial overlays | **Closing pre-FAQ** | `Marketing-Agencies`, `output/ppc-agency-client-dashboard`, `output/white-label-reporting-tool` |
| **C-02** | `pre-banner-section` | Theme radial gradients (matches hero family) | **Closing pre-FAQ** | `output/sales-dashboard-examples` `#conclusion` |
| **C-04** | `pre-banner-section` | `.bg-white` — flat white | **Mid-page one-click** only | `output/sales-dashboard-examples` `#one-click-cta` |
| **C-07** | `pre-banner-section` | `.pre-banner-cta` — brand dark + texture | **Closing promo** | `Coupon page`, `output/zoho-books-analytics-integration` |
| **C-09** | `pre-banner` | `.sep` — dark gradient `#362546` → `#050520` | **Closing** on dark BI pages | `Embedded Analytics` |
| **C-11** | `pre-banner` (in-content) | Soft gradient card, rounded, inset | **Sidebar / article inline** | `collaborative-bi`, `output/cloud-analytics-tools` |
| **C-03** | `pre-banner-section` | Flat `#f8f9fc` | Light neutral mid/closing | `Executive-Dashboards`, `Generative-ai` |

### Dark showcase (NOT a CTA — no red button band styling)

| ID | Class | Background | Slot | Reference |
|----|-------|------------|------|-----------|
| **D-01** | `sampleDashboard-section` | Radial `#2A365D` → `#171C2C` | Mid-page examples carousel | `Create-Dashboard`, `BI Finance` |
| **D-03** | `sticky-card-section` | Same dark radial | Finance dashboard-examples sticky stack | `output/finance-dashboard-examples`, `BI Finance` |

---

## Per-archetype banner map (what each page type uses)

### `agency-landing` / `ppc-agency-client-dashboard`

```
Hero     → H-03  banner + banner-bg (pastel gradient)
Closing  → C-01  pre-banner-section textured (before FAQ)
```
**One closing band only.** No mid-page full-width CTA band unless brief adds `cta-intro-section`.

### `dashboard-examples-landing` (+ sales/finance/hr variants)

```
Hero       → H-07  banner-section radial gradient
Mid-page   → C-04  pre-banner-section.bg-white  (#one-click-cta)
Closing    → C-01  pre-banner-section textured   (#conclusion) — large common band, NOT hero gradient
Optional   → D-03  sticky-card-section (finance) or dashboard-wrapper zigzag (sales)
Social     → reported-section + testimonials-section (before steps/closing)
```
**Three distinct treatments on one page** — hero soft gradient ≠ white one-click ≠ textured closing band (like white-label / agency).

### `comparison-guide` / `embedded-sales-analytics`

```
Hero       → H-06  banner dark card
Inline CTAs→ C-11  .pre-banner cards in tabsection sidebar (repeat per section)
Closing    → C-11  .pre-banner in-content OR full-width pre-banner before FAQ
FAQ        → faq-section
```
**No full-width textured band** unless brief has standalone closing CTA section.

### `white-label-reporting-landing`

```
Hero     → H-09  za-banner-section light gradient
Closing  → C-01  pre-banner-section textured (before FAQ)
```
**Hero and closing must look different** — za-banner vs pre-banner-section.

### `integration-campaign` (zoho-books, coupon)

```
Hero       → H-08  banner-section brand radial
Showcase   → D-02  sampleDashboard-section dark #262626
Closing    → C-07  pre-banner-section.pre-banner-cta
```

---

## Decision flow (agent Phase 0 / Phase 6)

```
1. Match archetype in section-composites.json
2. For each section_order entry with type hero | cta:
   - Read banner_slot if present (hero | mid-cta | closing-cta | inline-cta | dark-showcase)
   - Read bg_treatment if present (gradient-hero | texture-closing | bg-white | dark-showcase | inline-card)
   - Pull CSS from the mapped reference folder FOR THAT SLOT ONLY
3. Confirm page has ≥2 different bg treatments when archetype lists both hero + closing CTA
4. validate:output — closing CTA must not be za-bottom-section on plain white
5. Read `output/{slug}/validation.json` → `banner_audit` compares hero vs closing background fingerprints
```

---

## Anti-patterns

| Wrong | Right |
|-------|-------|
| Same `pre-banner-section` texture on hero and closing | Hero = `banner-section` / `banner`; closing = textured `pre-banner-section` |
| Both mid + closing use `.bg-white` | Mid = `.bg-white`; closing = textured band (C-01) |
| Closing CTA copies hero radial gradient | Hero = `banner-section` gradient; closing = `pre-banner-section` + `blue-shadow-with-texture.png` |
| `sampleDashboard-section` styling on CTA band | Dark showcase for carousel only; CTA uses `pre-banner-section` |
| Copy Marketing-Agencies closing band onto long-form hero | Long-form hero = H-06 dark card; inline = C-11 |
| `za-bottom-section` plain white before FAQ | `pre-banner-section` with background treatment |

---

## Gold-standard outputs by slot

| Slot | Gold standard |
|------|---------------|
| Agency hero | `output/ppc-agency-client-dashboard` |
| Agency closing | `output/ppc-agency-client-dashboard`, `Reference-Site/Marketing-Agencies` |
| Dashboard hero + one-click + closing | `output/sales-dashboard-examples`, `output/finance-dashboard-examples` |
| White-label hero + closing | `output/white-label-reporting-tool` |
| Long-form inline CTA | `output/cloud-analytics-tools` |
| Dark showcase + promo closing | `output/zoho-books-analytics-integration` |
