# Writer Drop Playbook — exact output every build

**Read this whenever a new Zoho Writer URL arrives.**

Goal: structured dev handoff in `output/{page-slug}/` that matches the brief **and** team reference patterns — no missing CTAs, no skipped Writer pages, no wrong section order.

Companion files: [agent-build-gates.md](agent-build-gates.md) · [section-composites.json](section-composites.json) · [banner-selection-guide.md](banner-selection-guide.md) · [cursor-build-workflow.md](cursor-build-workflow.md)

Reference outputs (promoted to `Reference-Site/agent-reference/` when approved): sales-dashboard-examples.

---

## 0. Trigger checklist (do first)

```
[ ] Writer URL opened via Chrome MCP in THIS session
[ ] NOT on Zoho Accounts login page (if login → stop, ask user to sign in, retry)
[ ] Fresh extract saved → z_workflow/briefs/{slug}.txt (not a stale file from disk)
[ ] validate:brief exit 0
[ ] Brief char count ≈ Writer footer "Chars:" (if shown)
[ ] All Writer pages scrolled (Page 1 of N … N of N)
[ ] section-composites.json archetype matched (if applicable)
[ ] banner-selection-guide.md — hero vs mid-cta vs closing-cta bg treatments differ (no one banner reused everywhere)
[ ] state.json reset for new run_id / page_slug
```

---

## 1. Acquire the Writer brief — Chrome MCP only (mandatory)

### Step 1 — Open the Writer URL

```
navigate_page or new_page  →  {writer-doc-link}
```

### Step 2 — Login gate (fail closed)

| Signal | Action |
|--------|--------|
| URL contains `accounts.zoho` or page title is "Zoho Accounts" | **STOP.** Tell user: sign in in the browser tab, then say **continue**. Do not read `briefs/*.txt`, do not build. |
| Writer editor loads (`.zw-page` present) | Continue to extraction |
| Empty extraction after scroll | **STOP.** Ask user to confirm login / sharing, then retry |

### Step 3 — Extract via Chrome MCP

Use `evaluate_script` with `WRITER_BROWSER_EXTRACT_FN` from `z_workflow/scripts/writer-extract-core.mjs`:

1. Incrementally scrolls the Writer editor (hydrates lazy pages)
2. Merges per-page `innerText` + structured `p/h/td` walk
3. Agent saves `z_workflow/briefs/{slug}.txt`

Then:

```bash
npm run validate:brief -- --file z_workflow/briefs/{slug}.txt
```

### Forbidden

| Do not | Why |
|--------|-----|
| Use `briefs/*.txt` from a previous session | User is testing from scratch |
| Use Puppeteer when user expects MCP test flow | Wrong extraction path |
| Accept paste/file instead of MCP when a Writer URL was given | Bypasses the test |
| Build on failed extraction | No valid content source |

### Extraction gates (fail closed)

| Gate | Rule |
|------|------|
| **validate-brief** | Exit 0 required before `match-sites` / build |
| **Char count** | Merged length ≥ 90% of Writer footer `Chars:` |
| **Archetype** | Match `section-composites.json` (`agency-landing`, `dashboard-examples-landing`, …) |
| **Required strings** | Per archetype — e.g. `Step 1`, `Hear from our happy customers`, `Dresner Advisory` |
| **Section inventory** | Step count, FAQ count, rating platforms per composite |

Char count alone is **not** sufficient (table spillover can inflate count while missing sections).

### Parse into `state.json → writer_brief`

- `page_title`, `page_type`, `product_name`, `sections_required`
- `keywords`, `key_messages`
- Count repeatable blocks (zigzag rows, FAQ items, integration cards)

---

## 2. Detect page archetype

After parsing, check `section-composites.json` for a match.

```bash
npm run validate:brief -- --file z_workflow/briefs/{slug}.txt
```

Archetypes: `dashboard-examples-landing` · `agency-landing` · `comparison-guide` (cloud / AI / BI long-form guides)

### `comparison-guide`

**Brief signals:** `tools at a glance`, `comparison matrix`, `cloud analytics`, `ai powered data analytics`, `how to choose`

**Gold page:** `output/cloud-analytics/` · **CSS:** `z_workflow/gold-snippets/article-toc-layout.css` · Live: `cloud-reporting-tools.html`

| Rule | Requirement |
|------|-------------|
| Top-level HTML | `banner` → **one** `tabsection` → `faq-section` only (copy nesting from `output/cloud-analytics/index.html`) |
| Nested body | glance table / tool deep-dives / steps / key-features = `.cont-sec` inside `#right-content` — **never** sibling `<section class="comparison-table-section">` |
| Rail | **340px** sticky `.left-tab` |
| Content gutter | `.cont-sec { margin-left: 100px }` |
| Peach CTA | **Inside** `ul#tabs` (last child) — scrolls with TOC |
| Tables | `.table-wrap { overflow-x:auto }` · 7-col `.comparison-table-7col` min-width 1200px |
| FAQ | `.faq-section` after tabsection — never in TOC |

Composer injects nest instructions + gold snippet. `cloud-analytics-2` failed when the agent treated `section_order` as sibling sections — that path is now banned/validated.

### `dashboard-examples-landing`

**Brief signals:** `50+`, `dashboard examples`, `by type`, `Explore Examples`, `one-click`, `Connect popular`

**Examples:** sales-dashboard-examples

**Section order (strict — from Writer doc):**

| # | Section | BEM class | Reference folder | Notes |
|---|---------|-----------|------------------|-------|
| 1 | Hero | `banner-section` | Executive-Dashboards | Split text + image; CTA **Explore Examples** |
| 2 | Dashboard types | `sticky-card-section` | **BI Finance** | Sticky `scroll-card` stack ×N from **brief** (finance landings) |
| 3 | One-click CTA | `pre-banner-section` | Executive-Dashboards | **Build … Dashboards Now** + bullet line |
| 4 | Integrations | `box-icon-section` | sales-dashboard-examples | Card grid ×N from brief |
| 5 | Recognition | `reported-section` | **BI-Marketing** | Dresner slider + ratings column |
| 6 | Testimonials | `testimonials-section` | **BI-Marketing** | Header + **See all testimonials** + marquee |
| 7 | How-to steps | `steps-section` | Executive-Dashboards | Tabbed STEP 1–4 **after** social proof |
| 8 | Closing CTA | `pre-banner-section` | Executive-Dashboards | **START FOR FREE** |
| 9 | FAQ | `faq-section` | Executive-Dashboards | `z-accordian` ×N from brief |

> Writer page ~10 often = recognition + testimonials. Steps come **after** testimonials in the doc — do not place steps before social proof.

### `agency-landing`

**Brief signals:** `agency`, `client dashboard`, `white-label`, `Book a free demo`, `report to clients`

**Examples:** client-dashboard-software

**Section order (strict — from Writer doc):**

| # | Section | BEM class | Reference folder | Notes |
|---|---------|-----------|------------------|-------|
| 1 | Hero | `banner` | Marketing-Agencies | **Book a free demo** |
| 2 | Intro | `agency-intro-section` | Marketing-Agencies | Centered agency pitch |
| 3 | Features | `dashboard-wrapper` | Executive-Dashboards | Zigzag ×N from Writer tables (not sticky-card) |
| 4 | Benefits | `icon-border-section` | Marketing-Agencies | 3 dark cards |
| 5 | Comparison | `integrations-grid-section` | Marketing-Agencies | 3×2 feature comparison cards |
| 6 | How it works | `how-it-works-section` | Marketing-Agencies | 4-step timeline — **Writer page ~6** |
| 7 | Testimonials | `testimonials-section` | Marketing-Agencies | **Hear from our happy customers** + See all testimonials |
| 8 | Recognition | `reported-section` | BI-Marketing | Dresner + ratings — **Writer page ~7** |
| 9 | CTA intro | `cta-intro-section` | Marketing-Agencies | Heading + body (button on next page) |
| 10 | Demo CTA | `pre-banner-section` | Marketing-Agencies | Demo + ★ bullets |
| 11 | FAQ | `faq-section` | Marketing-Agencies | `z-accordian` ×N |

> Do not map Writer page 6 to comparison row 2 only. Page numbers ≠ section boundaries when tables span pages.

If no composite matches → use `section-index.json` per section + `team-dna.json` for synthesis.

---

## 3. Per-section reference patterns (copy structure, not whole page)

### Hero — `banner-section` (Executive-Dashboards)

```html
<a href="#dashboard-types" class="cta-btn act-btn">Explore Examples</a>
```

### One-click + closing CTA — `pre-banner-section`

**Mid-page** one-click may be `.bg-white`. **Closing** `#conclusion` must use a **catalogued end-banner colour** from [`end-banner-types.json`](end-banner-types.json) — never plain white, and **not the same look on every build**.

Phase 0 sets `state.similarity.end_banner` (slug-hash pick). Copy that type’s `css_skeleton` onto `#conclusion.pre-banner-section`. See [`banner-selection-guide.md`](banner-selection-guide.md).

```html
<section class="pre-banner-section p-90 t-center" id="conclusion">
  <div class="content-wrap">
    <h2>Ready to build your sales dashboard?</h2>
    <div class="cta-btn-wrap">
      <a href="#" class="cta-btn act-btn">START FOR FREE</a>
    </div>
  </div>
</section>
```

**Example CSS — EB-04 soft theme wash (one of eight types):**

```css
#conclusion.pre-banner-section {
  text-align: center;
  background-color: #eef5ff;
  background-image:
    radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0, transparent 45%),
    radial-gradient(circle at 90% 80%, color-mix(in srgb, var(--color-secondary) 18%, transparent) 0, transparent 50%);
  padding: 90px 0;
}
```

| Do | Do not |
|----|--------|
| Apply `state.similarity.end_banner` treatment (EB-01…EB-08) | Reuse `blue-shadow-with-texture` on every page |
| Keep closing ≠ hero ≠ mid-cta `.bg-white` | Copy hero radial fingerprint onto `#conclusion` |
| Reference webtemplate examples listed on the selected type | Leave closing on plain white / `za-bottom-section` |

Dark variant (examples carousel): `Create-Dashboard` `.sampleDashboard-section` — use when brief maps to dark showcase band before closing CTA.

```html
<a href="…" class="cta-btn act-btn">Build Finance Dashboards Now</a>
<!-- closing -->
<a href="#" class="cta-btn act-btn">START FOR FREE</a>
```

### Recognition — `reported-section` (BI-Marketing)

- `report-slider` → `.aem-report` uses **`<h5>`** (not h3)
- `trust-section.rated-section` → `.rating-table` → `.rating-sec`
- Each rating: `.rating-left` (platform + stars) + `.rating-right` (score `<span>`)
- Copy ratings verbatim from brief

### Testimonials — `testimonials-section` (BI-Marketing)

**Header row (required — do not omit):**

```html
<div class="content-wrap">
  <h2 class="t-left">Hear from our customers</h2>
  <a href="/analytics/customers.html">See all testimonials <span class="arrow"></span></a>
</div>
```

- Dual `.zwc-nav-box-wrap` blocks for seamless marquee
- Card colors: nth-child 1/4 peach, 2/5 green, 3/6 blue
- Copy from brief — do not swap in BI-Marketing customer names unless brief says so

### Steps — `steps-section` (Executive-Dashboards)

- Tabbed list + visual panel; auto-advance progress bars
- STEP count = brief count

---

## 4. Mandatory CSS — CTA visibility (every output page)

Linked `zohocustom.css` hides CTAs until team nav injects `body.umain`:

```css
.cta-btn { display: none; }
.act-btn.cta-btn { visibility: hidden; opacity: 0; }
```

**Every `output/{slug}/style.css` must include:**

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
    padding: 13px 30px;
    border-radius: 4px;
    font-family: var(--zf-primary-semibold);
    font-size: 16px;
    text-transform: uppercase;
    margin-top: 20px;
}

.testimonials-section .content-wrap a {
    color: var(--primary-btn-color);
}

.testimonials-section .content-wrap a .arrow {
    border-color: var(--primary-btn-color);
}

/* No focus rings on click — required on every scaffold page */
.page-container button:focus,
.page-container button:focus-visible,
.page-container a.act-btn:focus,
.page-container a.act-btn:focus-visible,
.page-container a.cta-btn:focus,
.page-container a.cta-btn:focus-visible,
.page-container [role="button"]:focus,
.page-container [role="button"]:focus-visible,
.page-container .steps-tab-btn:focus,
.page-container .steps-tab-btn:focus-visible,
.page-container .features-tab-btn:focus,
.page-container .features-tab-btn:focus-visible,
.page-container .z-accordianBox h4:focus,
.page-container .z-accordianBox h4:focus-visible {
    outline: none;
    box-shadow: none;
}
```

**No button focus outlines** — do not add `:focus` / `:focus-visible` rings on CTAs, tabs, steps, or accordion headers. Active/selected states (`.active`) are fine; click focus rings are not.

**Brand red is theme-independent** — page `--color-primary` / gradients must not tint CTAs or the testimonials link. See `Rulesbook.md` §2.2.1.

**Testimonial cards are theme-independent** — `.zwc-nav-box` peach/mint/blue pastels are fixed extracted values on every page. Never tint from sales/finance vertical theme. Copy verbatim from `Rulesbook.md` §2.2.2 or `team-dna.json` testimonial_* tokens.

Without this, buttons exist in HTML but are **invisible** in Live Server / local preview.

---

## 5. Phase 6 build rules (structure-first)

1. Compose `index.html` section-by-section from blueprint — **one reference section at a time**
2. `style.css` — only classes on this page; extract from mapped reference, not full-file copy
3. `script.js` — only behaviors present (accordion, steps tabs, scroll reveal, slick if slider)
4. Link `../../source/zohocustom.css` + `../../source/product.css`
5. Images: `https://prezohoweb.zoho.com/` + `<!-- TODO: replace with final asset -->` (see `Rulesbook.md` §2.8)
6. Nav/footer: comment placeholders only

### `#conclusion.pre-banner-section` — end-banner pool (do not skip / do not clone)

When the brief has a closing/demo CTA (`START FOR FREE`, `Book a free demo`, etc.), style `#conclusion` from **`state.similarity.end_banner`** (`end-banner-types.json` EB-01…EB-08). Colours follow webtemplate / reference patterns — **do not default every build to blue-shadow texture**.

```bash
npm run select:end-banner -- --slug <page> --archetype <id>
```

Use `.pre-banner-list` for ★ bullet lines when the brief has them. **Browser gate:** closing band must show a clean, non-white treatment that matches the selected EB type — and must differ from hero + mid-cta.

### `dashboard-wrapper` zigzag — spacing (do not skip)

When composing zigzag feature rows from `Executive-Dashboards` / agency briefs:

| Rule | Value |
|------|-------|
| Row padding | `100px 0` per `.main-wrapper` |
| Row gap | `margin-bottom: 50px` between rows |
| Flex gap | `gap: 40px` between image + copy columns |
| Panel shape | Clean **rectangle** `::before` — `width: 55%; height: 100%; border-radius: 30px` — NO `clip-path` |
| Image column | `min-height: 360px`, `display: flex`, `align-items: center`, `justify-content: center` |
| Placeholder img | `max-width: 560px`, `min-height: 300px`, `object-fit: cover` |
| Token | `--teritary-bg: #f8f9fc` for panel fill |

Gold standard: `output/testing-2/style.css` → `.dashboard-wrapper` block.

Gold standard: `output/testing-2/style.css` → `.dashboard-wrapper` block.

**Never:** clone whole reference `index.html` / `style.css` / `script.js`
**Never:** use `clip-path` on `.banner-section` or `.hero-dashboard-preview` backgrounds. Use plain `border-radius` rectangles.

---

## 6. Pre-approve verification (run every build)

### Grep brief CTAs in output HTML

```bash
# Example for dashboard-examples landing — adapt strings from brief
grep -E "Explore Examples|Build .* Dashboards Now|START FOR FREE|See all testimonials" output/{slug}/index.html
```

### Browser check

Open `output/{slug}/index.html` and confirm:

- [ ] Red CTA buttons visible (hero, one-click, closing) — `#e42527`, not page theme colour
- [ ] **See all testimonials** link + arrow chevron are `#e42527`
- [ ] Testimonial `.zwc-nav-box` cards use **extracted** peach/mint/blue — NOT page theme colours (§2.2.2)
- [ ] **See all testimonials →** link visible top-right of testimonials
- [ ] Recognition block: dark Dresner panel + rating cards
- [ ] Section order matches composite / brief
- [ ] Zigzag / FAQ / card counts match brief
- [ ] **Pre-banner CTA** shows textured/dark background band — not plain white (see §5 `pre-banner-section`)
- [ ] **Dashboard zigzag** rows have clean **rectangle** `::before` panels (NO clip-path), 100px row padding, centered image column (see §5 `dashboard-wrapper`)

### Section count

Compare `index.html` sections to `section-composites.json` or `state.json → similarity.source_map`.

---

## 7. state.json fields to set

```json
{
  "writer_brief": { "raw_content_file": "z_workflow/briefs/{slug}.txt", "sections_required": ["…"] },
  "similarity": {
    "structure_mode": "compose",
    "archetype": "dashboard-examples-landing",
    "source_map": [ "… per section …" ]
  },
  "phase_6": { "output_path": "output/{slug}/", "approved": false }
}
```

---

## 8. Lessons from dashboard-examples builds (do not repeat)

| Mistake | Fix |
|---------|-----|
| Only extracted Writer page 1 | Scroll all `.zw-page` elements before extract |
| CTAs in HTML but invisible | Add `.page-container .cta-btn.act-btn` visibility override |
| Skipped page ~10 social proof | Always check composite for `reported-section` + `testimonials-section` |
| Testimonials without header link | BI-Marketing: `h2.t-left` + **See all testimonials** |
| Used PowerBI partial pattern | Testimonials + recognition → **BI-Marketing** |
| Steps before recognition | Writer order: recognition → testimonials → **then** steps |
| Used `<h3>` in Dresner block | Reference uses `<h5>` in `.aem-report` |
| Plain text rating rows | Use `.rating-left` / `.rating-right` structure |

---

## 9. Quick command reference

```bash
node z_workflow/scripts/match-sites.mjs --brief-file z_workflow/briefs/{slug}.txt
npm run validate:brief -- --file z_workflow/briefs/{slug}.txt
npm run audit          # refresh catalog after promote
npm run promote -- --from-state   # after dev polish + APPROVE
```

---

*Writer drop playbook v1.0 · Derived from dashboard-examples revise rounds · Update when new archetypes are promoted*
