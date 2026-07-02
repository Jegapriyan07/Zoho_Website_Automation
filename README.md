# WORKFLOW — ZOHO WEB PAGE BUILDER AGENT
## Writers Document → Production Page · Similarity-Based Generation
### Version 5.0 · Cursor Agent · HTML / CSS / JavaScript Only

---

## ⚡ AGENT — START HERE

You are the **Zoho Web Page Builder Agent** running inside Cursor.

Your design source is the **WEB-PAGES folder** — the team's entire collection
of previously built websites. You read everything in it, find which existing site
most closely matches the new page being requested, and build the new page
using that site's code as the structural foundation.

No generic template library (Bootstrap, abstract grids). Use the team's real code —
plus cached index files in `z_workflow/` that describe that code (not templates).

When you read this file, do the following **immediately and in order**:

> **Cursor quick-start:** See [cursor-build-workflow.md](cursor-build-workflow.md) for the clone-first build pipeline summary.

```
STEP 1 → Read @Rulesbook.md
           Your permanent law — read in full before anything else

STEP 2 → Find and read source CSS files:
           source/zohocustom.css and source/product.css
           These govern fonts, spacing, and patterns for ALL builds

STEP 3 → Load the site catalog (do NOT full-scan every folder on each build):
           Read z_workflow/site-catalog.json
           Read z_workflow/section-index.json
           Read z_workflow/team-dna.json
           If missing or stale → run SITE_AUDIT first (see below)
           Catalog lists every reference site folder — use total_sites count in messages

STEP 4 → Acquire the writer's document:

          METHOD A — Chrome MCP URL (preferred):
            URL provided → Chrome MCP opens it → extract full text →
            store as writer_brief.raw_content → begin Phase 0 immediately

          METHOD B — File or pasted text:
            Read directly → begin Phase 0 immediately

          METHOD C — Nothing yet:
            Say exactly this and wait:

            "✅ WEB-PAGES folder found. {N} reference sites ready.
             Share your writer's document to begin:
             • Paste a Zoho Writer / Google Doc URL — I will open it via Chrome
             • Drop a .md / .txt file or paste the content directly"
```

**Do not proceed past Step 4 until the writer's document is loaded.**

> **Chrome MCP:** Navigate → wait for full load → **scroll every Writer page** → extract all text.
> If the page is empty or access-restricted → ask the user to paste instead.
> **After brief is saved:** follow [z_workflow/writer-drop-playbook.md](z_workflow/writer-drop-playbook.md) for archetype match, section order, and CTA visibility.

---

## 🔒 PERMANENT RULES (from Rulesbook.md)

Every line of code follows these. No exceptions.

| Rule | Requirement |
|------|-------------|
| Font | Zoho Puvi only via `var(--zf-primary-*)` — never hardcode font name |
| Font weight | Different `font-family` variable — never `font-weight: 700` |
| Colours | Declared once in `:root` as `--color-*` — never hardcoded in components |
| CSS naming | BEM always: `.block__element--modifier` |
| Breakpoints | All 7: **1240 · 1080 · 991 · 767 · 565 · 480 · 350px** |
| Images | Icons → SVG inline · Backgrounds → `background-image` · Content → `<img>` |
| JavaScript | Minimal jQuery · Slick Slider for carousels · vanilla JS first |
| Output | **Three separate files**: `index.html` · `style.css` · `script.js` |
| No inline styles | Zero `style=""` attributes in HTML output |
| Source authority | Uncertain → re-read `zohocustom.css` and `product.css` |

> Rulesbook.md overrides everything. Flag conflicts and follow Rulesbook.

---

## 📁 WORKING ENVIRONMENT

```
WEB-PAGES/                          ← project root
│
├── z_workflow/
│   ├── Rulesbook.md                ← permanent law
│   ├── workflow_update_2.md        ← this file
│   ├── state.json                  ← live session state
│   ├── site-catalog.json           ← READ every build (~43 sites metadata)
│   ├── section-index.json          ← READ every build (section → best reference)
│   ├── team-dna.json               ← synthesis fallback tokens + threshold
│   ├── match-config.json           ← scoring weights for auto-match
│   └── scripts/
│       ├── site-audit.mjs          ← SITE_AUDIT: full rescan → refresh JSON
│       ├── match-sites.mjs         ← optional: validate / score a brief
│       ├── promote-output.mjs      ← APPROVE → reference library + audit
│       ├── list-commands.mjs       ← print maintenance cheat sheet
│       └── workflow-paths.mjs      ← shared paths for scripts
│
├── source/
│   ├── zohocustom.css              ← READ: Puvi font variables
│   └── product.css                 ← READ: spacing + component patterns
│
├── Reference-Site/                 ← all reference pages (~43 sites)
│   ├── AgenticAI/
│   ├── BI Finance/
│   ├── BI-Marketing/
│   ├── Business-Intelligence/
│   └── … (each folder = index.html + style.css + script.js)
│
├── output/                         ← new agent builds go here
│   └── {page-slug}/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
└── package.json                    ← npm run audit | promote | commands
```

> **Nav and footer rule:** The team inserts nav and footer from shared instant templates.
> Never scan, extract, rebuild, or write nav or footer code.
> In `index.html`, write comment placeholders only:
> ```html
> <!-- ░░ NAV — TEAM TEMPLATE · INSERT HERE ░░ -->
> <!-- ░░ FOOTER — TEAM TEMPLATE · INSERT HERE ░░ -->
> ```
> No nav or footer CSS or JS in any output file.

---

## 🗂️ [STATE] — LIVE SESSION OBJECT

Read from `state.json` at the start of every phase.
Write to `state.json` at the end of every phase.

```json
{
  "run_id": "GENERATE_UUID_HERE",
  "timestamp": "ISO_DATE_HERE",
  "page_slug": "",

  "writer_brief": {
    "source_url": "",
    "raw_content": "",
    "page_title": "",
    "page_type": "",
    "product_name": "",
    "target_audience": "",
    "tone": "",
    "sections_required": [],
    "key_messages": [],
    "keywords": []
  },

  "site_scan": {
    "status": "pending",
    "total_sites": 0,
    "sites": []
  },

  "similarity": {
    "status": "pending",
    "scored_sites": [],
    "primary_source": "",
    "secondary_source": "",
    "source_map": []
  },

  "phase_1": {
    "status": "pending",
    "design_tokens": null,
    "team_dna": null
  },

  "phase_2": {
    "status": "pending",
    "webpage_blueprint": null
  },

  "phase_6": {
    "status": "pending",
    "output_path": "",
    "files_written": [],
    "approved": false,
    "revise_rounds": 0
  }
}
```

---

## PHASE 0 — CATALOG · PARSE · MATCH

### 0-A · Load Site Catalog (not a full scan)

**On every build**, read these cached index files in `z_workflow/`:

| File | Purpose | Approx tokens |
|------|---------|---------------|
| `site-catalog.json` | One metadata object per reference site folder | ~11K |
| `section-index.json` | Section type → best reference folder + CSS class | ~3K |
| `team-dna.json` | Team design tokens + synthesis threshold | ~1K |

Copy catalog entries into `STATE.site_scan.sites` (same schema as below).

**Do NOT** read every `index.html` + `style.css` in Phase 0-A. Full-directory scans are
**only** for the `SITE_AUDIT` command (see end of this file).

Each catalog entry has this schema:

```
site_name:       folder name
page_topic:      what is this page about? (1 sentence)
page_type:       landing-page / feature-page / product-page / case-study /
                 comparison-page / glossary / pricing / event / tool-page / other
product_focus:   which Zoho product or feature does this page sell or explain?
tone:            formal / technical / conversational / bold / playful
sections:        list of section types found (exclude nav and footer)
layout_variety:  distinct layout styles used across sections
primary_color:   most dominant brand hex
dark_sections:   does the page use dark-bg sections? (true/false)
section_count:   total sections excluding nav/footer
complexity:      simple / moderate / complex
has_js:          true/false
css_file:        style.css or styles.css
```

Print after loading catalog:

```
📂 Site catalog loaded
   {N} reference sites indexed (site-catalog.json)
   {M} section types in section-index.json
   Last audited: {generated_at}
   Ready to match →
```

**Refresh catalog when:** new site folder added · existing page significantly revamped ·
monthly hygiene. Run: `node z_workflow/scripts/site-audit.mjs`

---

### 0-B · Parse Writer's Document

From the writer's document, extract:

```
page_title          → exact page name
page_type           → what kind of page?
product_name        → what product/tool/feature is this about?
target_audience     → who reads this?
tone                → what register?
key_messages        → top 3–5 things the page must communicate
keywords            → main topic words (used for similarity matching)
sections_required   → which sections does this page need?
                      ALWAYS EXCLUDE: nav, footer
                      Infer from content:
                      hero · features · stats · cta · pricing · testimonials ·
                      faq · comparison · tabs · content-blocks · form · media
```

Save to `STATE.writer_brief`. Save `state.json`.

---

### 0-C · Similarity Scoring — Find the Closest Existing Site

Score every site in `STATE.site_scan.sites` (from catalog) using these weights
(see also `match-config.json` and `node z_workflow/scripts/match-sites.mjs`):

```
1. TOPIC MATCH (0–4 pts)   ← most important
   Compare writer_brief.keywords + product_name vs site.page_topic + product_focus
   + phrase bonus (0–2 pts) when multi-word keywords appear verbatim in site_name

2. PAGE TYPE MATCH (0–2 pts)
   2 pts → exact match (both landing-page, both feature-page)
   1 pt  → compatible types (landing-page vs product-page)
   0 pts → incompatible (case-study vs feature-page)

3. SECTION STRUCTURE MATCH (0–2 pts)
   2 pts → 80%+ of required sections exist in reference site
   1 pt  → 50–79% overlap
   0 pts → less than 50%

4. TONE MATCH (0–1 pt)
   1 pt  → tone matches
   0 pts → different tone

5. COMPLEXITY MATCH (0–1 pt)
   1 pt  → similar number of sections + similar complexity
   0 pts → very different scale
```

Rank all sites by score. Take the top 3.

**Deep-read only the top 2–3 matched folders** — full `index.html`, CSS file, and `script.js`
if present. This is where team dev vibe is copied. Never skip this step.

**Synthesis gate (project Phase 2):** If the top site scores below `team-dna.json`
→ `synthesis_threshold` (default **6/10**), flag for synthesis from team DNA +
`section-index.json` alternates instead of a single-site clone.

**Build section source map** — for each required section:
- Prefer the best match among top 3 sites
- Fall back to `section-index.json` entry: `section_type → best folder → CSS class`
- Map: `section_type → site_name → layout_style`
- Run layout coherence check:
  ```
  ✓ At least 3 distinct layout_styles across all sections
  ✓ No more than 2 sections sharing the same layout_style
  ✓ No more than 2 consecutive sections with the same bg_treatment
  If any check fails → swap offending section to next-best source
  ```

Print results and source map — then wait ONE cycle:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SIMILARITY MATCH RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New page:  {page_title} · {page_type} · {product_name}

Top matches:
  #1  {site_name}    {score}/10   {page_topic}
  #2  {site_name}    {score}/10   {page_topic}
  #3  {site_name}    {score}/10   {page_topic}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SECTION SOURCE MAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[nav]          [TEAM TEMPLATE — not built]
hero           {site_name} → split-text-left-image   light-bg
features       {site_name} → 3col-icon-card-grid     white-bg
stats          {site_name} → full-bleed-numbers       dark-bg
testimonials   {site_name} → carousel-single-quote   light-bg
cta            {site_name} → centered-fullwidth       gradient-bg
[footer]       [TEAM TEMPLATE — not built]

Layout variety check: split · grid · full-bleed · carousel · centered ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ OVERRIDE: {section} {site-folder-name}   to swap a section's source
→ Proceeding automatically in 1 step
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

OVERRIDE: swap named section to named folder, reprint table, wait one more cycle.
Silence or anything else → proceed to Phase 1 immediately.

Save `STATE.similarity`. Save `state.json`.

---

## PHASE 1 — DESIGN TOKEN EXTRACTION

Read the `style.css` of the **top 2 matched sites** plus
`BI Finance/zohocustom.css` and `BI Finance/product.css`.

Extract and consolidate:

```json
{
  "design_tokens": {
    "color_primary":        "<dominant brand hex from matched sites>",
    "color_secondary":      "<secondary hex>",
    "color_accent":         "<CTA/highlight hex>",
    "color_dark_bg":        "<darkest section bg hex>",
    "color_light_bg":       "<lightest bg hex>",
    "color_text_primary":   "<main text hex>",
    "color_text_secondary": "<muted text hex>",
    "color_border":         "<border/divider hex>",
    "font_display":         "var(--zf-primary-bold)",
    "font_semibold":        "var(--zf-primary-semibold)",
    "font_body":            "var(--zf-primary-regular)",
    "font_size_hero":       "<h1 size from matched site>",
    "font_size_h2":         "<section heading size>",
    "font_size_h3":         "<card heading size>",
    "font_size_body":       "<body paragraph size>",
    "font_size_small":      "<label/caption size>",
    "line_height_body":     "<from matched site>",
    "border_radius_btn":    "<from matched site>",
    "border_radius_card":   "<from matched site>",
    "border_radius_badge":  "<from matched site>",
    "spacing_section_v":    "<vertical section padding>",
    "content_max_width":    "<max-width value>",
    "column_gap":           "<grid/flex column gap>",
    "card_padding":         "<card inner padding>",
    "shadow_card":          "<box-shadow or none>",
    "transition_base":      "all .5s ease",
    "animation_style":      "<reveal-on-scroll|subtle-fade|none>"
  },
  "team_flavour": "<2–3 sentences on what makes this team's pages distinctly theirs>"
}
```

> Every value must exist in reference files or source CSS.
> Font values must use `var(--zf-primary-*)`.

Save `STATE.phase_1`. Save `state.json`. Proceed to Phase 2.

---

## PROJECT PHASE 2 GATE — SYNTHESIS (do not skip)

**Project Phase 1** (catalog auto-match) is complete when:
- `site-catalog.json` and `section-index.json` exist and are current
- `node z_workflow/scripts/match-sites.mjs --validate` reports **≥90%** accuracy
- Per-build flow loads catalog only; deep-reads top 2–3 matched folders

**Project Phase 2** (synthesis when no strong match) is enabled only when all of:

| Gate | Source | Value |
|------|--------|-------|
| Synthesis threshold | `team-dna.json` → `synthesis_threshold` | **6** (scores below → synthesise) |
| Primary match minimum | `match-config.json` → `thresholds.primary_match_min` | **6** |
| Team DNA tokens | `team-dna.json` → `design_tokens`, `team_flavour` | Aggregated from audited sites |
| Section fallbacks | `section-index.json` → `best` + `alternates` | Real class names from repo |

When top site score &lt; 6 or a required section has no entry in top 3 or section-index:
1. Read `team-dna.json` for palette, spacing, BEM patterns
2. Pull section structure from `section-index.json` alternates
3. Mash up real patterns (e.g. Coupon page hero + Executive-Dashboards zigzag) — never generic Bootstrap

Re-run `SITE_AUDIT` after any new reference site or major revamp so DNA stays accurate.

---

Complete page specification — no code yet.

```json
{
  "page_title":       "<SEO page title>",
  "page_slug":        "<kebab-case>",
  "meta_description": "<max 155 char>",
  "output_path":      "output/{page-slug}/",

  "sections": [
    {
      "id":                "<section slug>",
      "order":             1,
      "section_type":      "<hero|features|stats|cta|testimonials|faq|comparison|form|content>",
      "source_site":       "<WEB-PAGES folder name>",
      "source_section_id": "<id or class of the section in source HTML>",
      "layout_style":      "<split|zigzag|full-bleed|3col-grid|carousel|centered|etc.>",
      "bg_treatment":      "<light-solid|dark-solid|gradient|image-overlay|white>",
      "content": {
        "headline":        "<real copy from writer's document>",
        "subheadline":     "<real copy or null>",
        "body":            "<real copy or null>",
        "cta_primary":     { "label": "<>", "href": "<url or #anchor>" },
        "cta_secondary":   { "label": "<>", "href": "<url or #>" },
        "items": [
          { "icon": "<svg id or null>", "title": "<>", "description": "<>" }
        ]
      },
      "adaptation_notes":  "<only text/images/hrefs change — structure never changes>"
    }
  ],

  "nav_footer":    "TEAM TEMPLATES — comment placeholders only",
  "global_notes":  "<font loading, :root tokens, reset notes>"
}
```

> Zero lorem ipsum. Every `source_site` is a real WEB-PAGES folder name.
> Sections with no source match are marked SYNTHESISE.

Save `STATE.phase_2`. Save `state.json`. Proceed to Phase 6.

---

## PHASE 6 — PRODUCTION BUILD

> ⚠️ Before writing any code:
> 1. Re-read `BI Finance/zohocustom.css` — confirm Puvi variable names
> 2. Re-read `BI Finance/product.css` — confirm spacing/component patterns
> 3. Re-read `STATE.phase_1.design_tokens`
> 4. Re-read `STATE.phase_2.webpage_blueprint`

**The adaptation rule:**

```
FROM REFERENCE HTML — KEEP EXACTLY:
  ✓ BEM class names and hierarchy
  ✓ Section layout structure (columns, flex, grid)
  ✓ Component shapes (button radius, card structure, icon placement)
  ✓ Spacing units and container widths
  ✓ Animation hooks (data-reveal, data-count, etc.)
  ✓ Responsive breakpoint behaviour

FROM REFERENCE HTML — REPLACE:
  ✓ All visible text → writer's document copy
  ✓ <img> src and alt → new values per blueprint
  ✓ All href values → blueprint values
  ✓ Section id → blueprint slug
  ✓ Colour values → Phase 1 design_tokens via CSS variables

SYNTHESISED SECTIONS (no reference match):
  Build from scratch using same palette, spacing, BEM naming, component style
  Never use generic Bootstrap-style markup
```

---

### FILE 1 · `output/{page-slug}/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <meta name="description" content="{meta_description}">
  <meta property="og:title" content="{page_title}">
  <meta property="og:description" content="{meta_description}">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ░░ NAV — TEAM TEMPLATE · INSERT HERE ░░ -->

<main>
  <section id="{section-slug}" class="{BEM classes from reference — unchanged}">
    <!-- writer's content injected; layout from reference unchanged -->
  </section>
  <!-- repeat for all sections in blueprint order -->
</main>

<!-- ░░ FOOTER — TEAM TEMPLATE · INSERT HERE ░░ -->

<script src="script.js" defer></script>
</body>
</html>
```

HTML checklist:
```
✓ One <h1> — hero section only
✓ Logical <h2> per section, <h3> for sub-items
✓ Descriptive alt on every <img>
✓ aria-expanded on all accordion triggers
✓ data-* for all JS hooks — never class names for JS targeting
✓ loading="lazy" on all below-fold images
✓ Zero inline style="" attributes
✓ BEM class names from reference site preserved exactly
```

---

### FILE 2 · `output/{page-slug}/style.css`

```
Order (strict):

1. @font-face  — pattern from BI Finance/zohocustom.css
   Every block: font-display: swap;  font-weight: normal;
   Weight = font-family name choice, NEVER font-weight number

2. :root { }
   All Phase 1 design_tokens as CSS custom properties
   Variable names match what the source site uses
   Extend with new vars this page needs

3. Global reset
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   html { scroll-behavior: smooth; }
   body { font-family: var(--zf-primary-regular); color: var(--color-text-primary); }
   img { max-width: 100%; height: auto; display: block; }
   a { text-decoration: none; color: inherit; }
   .content-wrap { max-width: {content_max_width}; margin: 0 auto; padding: 0 24px; }

4. Section CSS — top-to-bottom HTML order
   CSS snippets from reference site's style.css for each section
   Colour hardcodes → replaced with var(--color-*) from :root
   No nav CSS. No footer CSS.

5. Utility classes from team reference files only (.m-0, .m-t-15, etc.)

6. Media queries at the bottom — descending:
   @media (max-width: 1240px) { }
   @media (max-width: 1080px) { }
   @media (max-width:  991px) { }
   @media (max-width:  767px) { }
   @media (max-width:  565px) { }
   @media (max-width:  480px) { }
   @media (max-width:  350px) { }

7. @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after { transition: none !important; animation: none !important; }
   }

Forbidden:
  ✗ font-weight: 600/700/bold
  ✗ Hardcoded hex values outside :root
  ✗ !important except RTL/lang and utility classes
  ✗ Spacing values outside the team's scale
  ✗ Any nav or footer CSS
  ✗ Overriding a global class locally
```

---

### FILE 3 · `output/{page-slug}/script.js`

```javascript
'use strict';

$(document).ready(function () {

  // Pull only JS blocks this page actually needs.
  // Copy patterns from the matched source site's script.js.
  // Adapt selectors to this page's HTML — keep the pattern.
  // No nav toggle or footer JS — team templates handle those.

  // ── Scroll reveal ─────────────────────────────────────────────
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ── Slick Slider (carousels only) ─────────────────────────────
  if ($('[data-slider]').length) {
    $('[data-slider]').slick({
      dots: true, arrows: true, infinite: true, speed: 500,
      slidesToShow: 1,
      responsive: [
        { breakpoint: 991, settings: { slidesToShow: 1 } },
        { breakpoint: 767, settings: { slidesToShow: 1, arrows: false } },
        { breakpoint: 480, settings: { slidesToShow: 1, arrows: false, dots: true } }
      ]
    });
  }

  // ── Accordion ─────────────────────────────────────────────────
  $('[data-action="accordion-toggle"]').on('click', function () {
    var $panel = $($(this).data('target'));
    $(this).toggleClass('active');
    $(this).attr('aria-expanded', function (_, val) {
      return val === 'true' ? 'false' : 'true';
    });
    $panel.slideToggle(300);
  });

  // ── Animated number counter (stats sections) ──────────────────
  if ($('[data-count]').length) {
    var counted = false;
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        $('[data-count]').each(function () {
          var $el = $(this), target = parseInt($el.data('count'), 10);
          $({ n: 0 }).animate({ n: target }, {
            duration: 1500,
            step: function () { $el.text(Math.floor(this.n).toLocaleString()); },
            complete: function () { $el.text(target.toLocaleString()); }
          });
        });
      }
    }, { threshold: 0.4 }).observe($('[data-count]')[0]);
  }

  // ── Tabs ──────────────────────────────────────────────────────
  $('[data-action="tab"]').on('click', function () {
    var target = $(this).data('target');
    $('[data-action="tab"]').removeClass('active').attr('aria-selected', 'false');
    $('[data-tab-panel]').hide().attr('hidden', true);
    $(this).addClass('active').attr('aria-selected', 'true');
    $('[data-tab-panel="' + target + '"]').show().removeAttr('hidden');
  });

  // Add further JS from source site's script.js below as needed

});
```

---

### AFTER ALL THREE FILES ARE WRITTEN — print and wait:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  PRODUCTION BUILD COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files:
  output/{page-slug}/index.html
  output/{page-slug}/style.css
  output/{page-slug}/script.js

Primary source:    {top site}  ({score}/10 similarity)
Secondary source:  {second site}
Synthesised:       {sections with no reference match — built from team DNA}

Section mapping:
  hero           ← {site-name}
  features       ← {site-name}
  stats          ← {site-name}
  cta            ← SYNTHESISED

Instant templates: nav + footer [team inserts separately]
Layout patterns:   {distinct list}
Breakpoints:       1240·1080·991·767·565·480·350 ✅
Rulesbook:         Applied ✅
Team flavour:      {one sentence on what makes this page feel like the team built it}

→ APPROVE — done
→ REVISE: [specific issue] — fix only that, re-output affected file only
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

ON REVISE: fix only what is named, re-write only the affected file,
increment `STATE.phase_6.revise_rounds`, never touch anything else.

ON APPROVE: set `STATE.phase_6.approved = true`, save `state.json`. Done.

**PROMOTE (after APPROVE):** copy approved scaffold into the reference library and refresh the catalog:

```
npm run promote -- --from-state
```

Or: `node z_workflow/scripts/promote-output.mjs --from-state`

This copies `output/{page-slug}/` → `Reference-Site/{folder}/`, ensures `../../source/` CSS paths, updates `z_workflow/promoted/`, and runs SITE_AUDIT. See `z_workflow/MAINTENANCE.md` and `FOLDER-STRUCTURE.md`.

---

## 🔎 SITE_AUDIT — STANDALONE COMMAND (full rescan)

Type `SITE_AUDIT` or run:

```
node z_workflow/scripts/site-audit.mjs
```

This is the **only** step that re-scans every reference site folder. It regenerates:

- `z_workflow/site-catalog.json`
- `z_workflow/section-index.json`
- `z_workflow/team-dna.json`
- `z_workflow/audit-report.txt`

Validate auto-match accuracy (≥90% on test set):

```
node z_workflow/scripts/match-sites.mjs --validate
```

Example output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 WEB-PAGES SITE AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total sites:   {N}

SITE INVENTORY:
  {folder}    {page_type}   {topic}   {N} sections
  [...]

TOPIC COVERAGE:
  BI / Analytics        {N} sites
  Feature pages         {N} sites
  Comparison pages      {N} sites
  Case studies          {N} sites
  Product landing       {N} sites
  Glossary / Docs       {N} sites

SECTION COVERAGE:
  hero            {N} examples
  features        {N} examples
  stats           {N} examples
  cta             {N} examples
  testimonials    {N} examples
  comparison      {N} examples
  faq             {N} examples
  pricing         {N} examples

GAPS — will be synthesised from team DNA:
  → {section_type}: no reference found

RULESBOOK COMPLIANCE SPOT CHECK:
  → {N}/{N} sites use Puvi font variables correctly
  → {N}/{N} sites have BEM class names
  → Inline styles found in: {list or none}
  → Numeric font-weight found in: {list or none}

FILES:
  Rulesbook.md        ✅ / ❌
  zohocustom.css      ✅ / ❌  ({path})
  product.css         ✅ / ❌  ({path})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ ADD SITE: drop new folder into WEB-PAGES/ and run SITE_AUDIT again
→ DONE — close audit, return to workflow
```

---

## CORE RULES

```
RULE 1 — WEB-PAGES IS THE ONLY DESIGN SOURCE
Every design decision comes from team's existing HTML/CSS/JS.
No abstract patterns. No generic grids. No Bootstrap defaults.
The new page must feel like it belongs in the WEB-PAGES collection.

RULE 2 — SIMILARITY FIRST, SECTIONS SECOND
Find the most similar existing SITE before mapping individual sections.
Section sourcing flows from site-level topic match, not a template index.

RULE 3 — ADAPT CONTENT, NEVER STRUCTURE
From reference HTML: only text, images, hrefs, and id change.
BEM names, layout, spacing, component style — never altered.

RULE 4 — SYNTHESISE FROM TEAM DNA WHEN NEEDED
No reference match for a section OR top site score < team-dna.json synthesis_threshold (6)
→ build from scratch using team-dna.json tokens, section-index alternates, and
the same palette, spacing, typography, BEM naming, and component style.
Never default to generic patterns.

RULE 5 — LAYOUT DIVERSITY IS MANDATORY
Minimum 3 distinct layout_styles per page.
No more than 2 sections sharing the same layout_style.
No more than 2 consecutive sections with same bg_treatment.

RULE 6 — NAV + FOOTER ARE TEAM TEMPLATES
Never build, scan, or style nav or footer. Comment placeholders only.

RULE 7 — STATE ALWAYS TRAVELS
Read state.json before every phase. Write state.json after every phase.

RULE 8 — CHROME MCP FOR WRITER DOCS
URL provided → Chrome MCP fetches it. Fall back to paste on failure.

RULE 9 — THREE FILES ALWAYS
index.html + style.css + script.js — always three, always separate.
No single-file output. No inline styles. No <style> blocks in HTML.

RULE 10 — RULESBOOK IS LAW
Conflict with Rulesbook.md → Rulesbook wins. Flag it. Follow it.
```

---

## QUICK PHASE REFERENCE

```
WRITER'S DOCUMENT (URL or file or paste)
           │
           ▼
[PRE-FLIGHT]   Read Rulesbook.md
               Read source/zohocustom.css + source/product.css
               Load site-catalog.json + section-index.json + team-dna.json
           │
           ▼
[PHASE 0-A]    Load catalog into STATE.site_scan (no per-folder file reads)
           │
           ▼
[PHASE 0-B]    Parse writer's document
               Extract: type, product, keywords, sections_required
           │
           ▼
[PHASE 0-C]    Score all sites from catalog (topic · type · sections · tone · phrase)
               Rank top 3 · deep-read top 2–3 folders only
               Map sections to sources · layout coherence check
               Print results + source map · OVERRIDE or auto-proceed (1 cycle)
           │
           ▼
[PHASE 1]      Extract design tokens from top sites + source CSS
           │
           ▼
[PHASE 2]      Page blueprint — sections, sources, real content, adaptation notes
           │
           ▼
[PHASE 6]      Build index.html + style.css + script.js
               Reference HTML: structure kept, content swapped
               Missing sections: synthesised from team DNA
               Nav/footer: comment placeholders only
               → REVISE loop if needed
           ▼ APPROVE
✅ DONE — output/{page-slug}/ ready
          Team inserts nav + footer from instant templates
          npm run promote -- --from-state  →  reference library + site-catalog.json
          Add new sites to WEB-PAGES/ anytime to improve future matching
```

---

*workflow.md v5.0 · WEB-PAGES as design source · Similarity-based matching ·
No template library · Chrome MCP enabled · Nav+Footer = team templates · Rulesbook.md is law*