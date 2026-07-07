# WORKFLOW — ZOHO WEB PAGE BUILDER AGENT
## Full Build Instructions · Phase by Phase
### Version 6.0 · Autonomous · No-Permission Build

---

> **Entry point is README.md** — read that first.
> This file contains the detailed phase-by-phase build process.
> Agent reads this after README.md during every build.

---

## 🗂️ STATE — LIVE SESSION OBJECT

Read from `z_workflow/state.json` at the start of every phase.
Write to `z_workflow/state.json` at the end of every phase.

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
    "page_category": "",
    "sections_required": [],
    "key_messages": [],
    "keywords": []
  },

  "template_picks": {
    "status": "pending",
    "picks": []
  },

  "phase_1": {
    "status": "pending",
    "design_tokens": null
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

## TEMPLATE SYSTEM

### template-usage.json structure

`z_workflow/template-usage.json` tracks every template in `webtemplate/sitemap-categorized.json`.

**Create it if it does not exist** by reading `webtemplate/sitemap-categorized.json`
and building this structure:

```json
{
  "last_updated": "ISO_DATE",
  "total_templates": 630,
  "auto_reset_log": [],
  "categories": {
    "AI & Intelligence": {
      "total": 16,
      "available_count": 16,
      "used_count": 0,
      "available": [
        { "name": "Ai Powered Embedded Analytics", "url": "https://..." },
        { "name": "Ai Powered Self Service",        "url": "https://..." }
      ],
      "used": []
    },
    "Core Features": {
      "total": 81,
      "available_count": 81,
      "used_count": 0,
      "available": [ ... ],
      "used": []
    }
  }
}
```

All 22 categories. All 630 templates start in `available`.

---

### RANDOM PICK ALGORITHM

For each section the page needs, the agent picks ONE template from the matching category:

```
1. Find the right category for this section type (see CATEGORY MAP below)

2. Check template-usage.json → category.available[]
   If available[] is empty (all used) → AUTO-RESET:
     Move ALL items from category.used[] back to category.available[]
     Set used_count = 0, available_count = total
     Append to auto_reset_log: { category, reset_at, reason: "exhausted" }
     Log: "♻️ {category} template pool exhausted — pool reset, picking fresh"

3. Pick a RANDOM index:
   index = Math.floor(Math.random() * category.available.length)
   picked = category.available[index]

4. Mark as used immediately:
   Move picked from available[] to used[]
   Add: { name, url, used_at: ISO_DATE, used_for: page_slug, section_type }
   Update available_count and used_count
   Write template-usage.json to disk NOW (before build continues)

5. Store pick in STATE.template_picks.picks:
   { section_type, category, name, url }

6. Proceed — use this template's name and URL as design direction for the section
```

**You never fetch the URL unless Chrome MCP is available AND the section needs
structural reference.** The template name alone is sufficient design direction
for most sections. If you do fetch → extract layout and visual structure only,
not content.

---

### CATEGORY MAP — Section Type → Template Category

```
hero / banner / above-fold     →  use page_category (topic-matched, see below)
features / benefits / why-us   →  "Core Features"
comparison / vs / alternative  →  "Competitor Comparisons"
dashboard / data / analytics   →  "Dashboards"
stats / numbers / metrics      →  "Dashboards"
data visualisation / charts    →  "Data Visualization & Charts"
industry / vertical / sector   →  "Industry Solutions"
integration / connector        →  "Third-Party Integrations"
zoho-app integration           →  "Zoho App Integrations"
customers / case study / trust →  "Customers & Case Studies"
pricing / plans / tiers        →  "Pricing & Plans"
embedded / white-label         →  "Embedded Analytics"
AI / agentic / ML / Zia        →  "AI & Intelligence"
report / analyst / award       →  "Analyst Reports & Awards"
mobile / cloud / on-premise    →  "Mobile & Cloud"
webinar / event / newsletter   →  "Webinars & Events"
cta / conversion / signup      →  "General"
content / text / general       →  "General"
form / contact                 →  "General"
```

**Page-level category (for hero section)** — match `writer_brief.keywords` to category:
```
keywords mention AI/Zia/ML     →  "AI & Intelligence"
keywords mention dashboard     →  "Dashboards"
keywords mention features      →  "Core Features"
keywords mention competitor    →  "Competitor Comparisons"
keywords mention industry      →  "Industry Solutions"
keywords mention integration   →  "Third-Party Integrations"
keywords mention embedded      →  "Embedded Analytics"
keywords mention pricing       →  "Pricing & Plans"
default (no strong match)      →  "General"
```

---

## PHASE 0 — PARSE WRITER'S DOCUMENT

### 0-A · Parse Brief

Read the writer's document and extract:

```
page_title        → exact page name
page_type         → landing-page / feature-page / product-page / comparison / etc.
product_name      → what product/tool/feature is this page about?
target_audience   → who reads this?
tone              → formal / conversational / bold / technical / friendly
key_messages      → top 3–5 things the page must communicate
keywords          → main topic words
page_category     → which sitemap-categorized.json category best matches this page?
sections_required → infer which sections the page needs
                    EXCLUDE ALWAYS: nav, footer
                    Infer from content:
                    hero · features · stats · cta · pricing · testimonials ·
                    faq · comparison · tabs · content-blocks · form · media
```

**CONFIDENTIAL CHECK:**
Scan the writer's document for content that appears confidential:
internal revenue figures, unreleased product names, private customer data,
contract terms, personal information, internal roadmap dates.

If found → STOP and ask:
```
"⚠️ CONFIDENTIAL CONTENT DETECTED
 The following content in the writer's document appears sensitive:
 [{describe what was found}]
 
 Confirm it is safe to use in the output page, or provide
 replacement copy for this section."
```

If not found → proceed immediately. No further permission needed.

Save `STATE.writer_brief`. Save `state.json`.

---

### 0-B · Pick Templates (random, per section)

For each section in `sections_required`:

1. Look up the matching category from the CATEGORY MAP
2. Run the RANDOM PICK ALGORITHM
3. Store the pick in STATE

Print ONE summary after all picks are done:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎲 TEMPLATE PICKS (random · marked used)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[nav]     [TEAM TEMPLATE — not picked]
hero      "Ai Powered Embedded Analytics"    AI & Intelligence      ✓ used
features  "Features - Generative Ai"         Core Features          ✓ used
stats     "Executive Dashboards Overview"    Dashboards             ✓ used
cta       "Zoho Analytics Overview"          General                ✓ used
[footer]  [TEAM TEMPLATE — not picked]

template-usage.json updated ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ OVERRIDE: {section} {exact template name from category}
  (replaces that section's pick and re-marks used)
→ Proceeding to build in 1 step
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait exactly ONE response cycle.
OVERRIDE → swap that section's pick (un-mark old, mark new), reprint table.
Silence or anything else → proceed to Phase 1 immediately.

Set `STATE.template_picks.status = "complete"`. Save `state.json`.

---

## PHASE 1 — DESIGN TOKEN EXTRACTION

Read `source/zohocustom.css` and `source/product.css`.
Read the picked template names to understand the visual direction.
(Optional: if Chrome MCP available, fetch 1 template URL to extract layout signals)

Extract design tokens for this page:

```json
{
  "design_tokens": {
    "color_primary":        "<from source CSS>",
    "color_secondary":      "<hex>",
    "color_accent":         "<CTA/highlight hex>",
    "color_dark_bg":        "<dark section bg>",
    "color_light_bg":       "<light section bg>",
    "color_text_primary":   "<main text>",
    "color_text_secondary": "<muted text>",
    "color_border":         "<border hex>",

    "font_display":         "var(--zf-primary-bold)",
    "font_semibold":        "var(--zf-primary-semibold)",
    "font_body":            "var(--zf-primary-regular)",

    "font_size_hero":       "<h1 size>",
    "font_size_h2":         "<section heading>",
    "font_size_h3":         "<card heading>",
    "font_size_body":       "<body text>",
    "font_size_small":      "<label/caption>",
    "line_height_body":     "1.6",

    "border_radius_btn":    "4px",
    "border_radius_card":   "12px",
    "border_radius_badge":  "20px",

    "spacing_section_v":    "80px",
    "content_max_width":    "1200px",
    "column_gap":           "30px",
    "card_padding":         "30px",

    "shadow_card":          "<or none>",
    "transition_base":      "all .5s ease",
    "animation_style":      "<reveal-on-scroll|subtle-fade|none>"
  }
}
```

> Font values must use `var(--zf-primary-*)` — verify names in `source/zohocustom.css`.
> Colour values must come from team reference or source CSS — never invented.

Save `STATE.phase_1`. Save `state.json`. Proceed to Phase 2.

---

## PHASE 2 — PAGE BLUEPRINT

Complete page specification. No code yet. Content + structure.

```json
{
  "page_title":       "<SEO title>",
  "page_slug":        "<kebab-case>",
  "meta_description": "<max 155 chars>",
  "output_path":      "output/{page-slug}/",

  "sections": [
    {
      "id":               "<section slug>",
      "order":            1,
      "section_type":     "<hero|features|stats|cta|testimonials|faq|comparison|form>",
      "template_pick":    "<template name from STATE.template_picks>",
      "template_url":     "<template url — design direction reference>",
      "layout_style":     "<split|zigzag|full-bleed|3col-grid|carousel|centered|etc.>",
      "bg_treatment":     "<light-solid|dark-solid|gradient|image-overlay|white>",
      "content": {
        "headline":       "<real copy from writer's document>",
        "subheadline":    "<real copy or null>",
        "body":           "<real copy or null>",
        "cta_primary":    { "label": "<>", "href": "<url or #anchor>" },
        "cta_secondary":  { "label": "<>", "href": "<url or #>" },
        "items": [
          { "icon": "<svg name or null>", "title": "<>", "description": "<>" }
        ]
      },
      "design_direction": "<1 sentence: how the template pick influences this section's visual design>"
    }
  ],

  "nav_footer":    "TEAM TEMPLATES — comment placeholders only",
  "global_notes":  "<font loading, :root token notes>"
}
```

**Layout coherence check:**
```
✓ At least 3 distinct layout_styles across sections
✓ No more than 2 sections sharing the same layout_style
✓ No more than 2 consecutive sections with the same bg_treatment
If fail → adjust layout_style/bg_treatment of offending section to restore variety
```

Zero lorem ipsum. `template_pick` must be filled for every section.

Save `STATE.phase_2`. Save `state.json`. Proceed to Phase 6.

---

## PHASE 6 — PRODUCTION BUILD

> Before writing code:
> 1. Re-read `source/zohocustom.css` — confirm Puvi variable names
> 2. Re-read `source/product.css` — confirm spacing and patterns
> 3. Re-read `STATE.phase_1.design_tokens`
> 4. Re-read `STATE.phase_2.webpage_blueprint`

**Build rule — template picks are design direction, not code source:**

```
THE TEMPLATE PICK TELLS YOU:
  ✓ The visual personality of this section (bold/minimal/feature-rich/data-heavy)
  ✓ The approximate layout density (how much content to include)
  ✓ The design direction (what a well-designed page in this category looks like)

YOU CODE FROM SCRATCH FOLLOWING:
  ✓ Rulesbook.md — every rule, no exceptions
  ✓ Phase 1 design_tokens — all colour, spacing, font values
  ✓ Phase 2 blueprint — real content, layout_style, bg_treatment per section
  ✓ Reference-Site/ — look at team's reference pages for BEM naming patterns
                       and component structure only (not for content cloning)

NEVER:
  ✗ Copy-paste HTML from a fetched template URL
  ✗ Clone an entire reference site
  ✗ Use Bootstrap or generic grid frameworks
  ✗ Override content that was not specified in the writer's document
```

**Create `output/{page-slug}/`**

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

  <!-- Section: {section_type} · Template direction: {template_pick} -->
  <section id="{section-slug}" class="{section-type}-section">
    <!-- ... content from writer's document, coded to Rulesbook.md standards ... -->
  </section>

  <!-- repeat for all sections in blueprint order -->

</main>

<!-- ░░ FOOTER — TEAM TEMPLATE · INSERT HERE ░░ -->

<script src="script.js" defer></script>
</body>
</html>
```

**HTML checklist:**
```
✓ One <h1> — hero section headline only
✓ Logical <h2> per section, <h3> for sub-items and cards
✓ Descriptive alt on every <img>
✓ aria-label on every <nav> element
✓ aria-expanded on all accordion triggers
✓ data-* for all JS hooks — never class names as JS selectors
✓ loading="lazy" on all below-fold images
✓ Zero inline style="" attributes
✓ Template pick name in HTML comment above each section (for reference)
```

---

### FILE 2 · `output/{page-slug}/style.css`

```
Order (strict):

1. @font-face blocks — pattern from source/zohocustom.css
   Every declaration:
     font-display: swap;
     font-weight: normal;     ← always normal — never 400/700/bold
   Weight is expressed via font-family name choice only

2. :root { }
   ALL Phase 1 design_tokens as CSS custom properties
   Variable names match the team's existing naming (from Reference-Site/ patterns)

3. Global reset + base
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   html { scroll-behavior: smooth; }
   body { font-family: var(--zf-primary-regular); color: var(--color-text-primary); }
   img { max-width: 100%; height: auto; display: block; }
   a { text-decoration: none; color: inherit; }
   .content-wrap { max-width: var(--content-max-width, 1200px); margin: 0 auto; padding: 0 24px; }

4. Section styles — top-to-bottom HTML order
   BEM: .hero-section__title  .features-section__card  .features-section__card--highlighted
   All colour values → var(--color-*) from :root
   No nav CSS. No footer CSS.

5. Utility classes (pattern from source/product.css):
   .m-0, .m-t-15, .m-b-30, .p-b-0, .p-t-0, .f-20 etc.

6. Media queries at bottom — descending:
   @media (max-width: 1240px) { }
   @media (max-width: 1080px) { }
   @media (max-width:  991px) { }
   @media (max-width:  767px) { }
   @media (max-width:  565px) { }
   @media (max-width:  480px) { }
   @media (max-width:  350px) { }

7. Reduced motion:
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after { transition: none !important; animation: none !important; }
   }

Forbidden:
  ✗ font-weight: 600 / 700 / bold / bolder
  ✗ Hardcoded hex values outside :root
  ✗ !important except RTL/lang overrides and utility classes
  ✗ Spacing values not in the team scale (no 17px, 23px, 11px etc.)
  ✗ Any nav or footer CSS
  ✗ Overriding a global class at component level
  ✗ Duplicate selectors
  ✗ letter-spacing combined with font-weight on the same element
```

---

### FILE 3 · `output/{page-slug}/script.js`

```javascript
'use strict';

$(document).ready(function () {

  // Include only the JS blocks this page's sections actually need.
  // Pattern from Reference-Site/ script.js files for team naming convention.
  // No nav toggle or footer JS — team templates handle those.

  // ── Scroll reveal ─────────────────────────────────────────────────────
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ── Slick Slider — include ONLY if page has a carousel section ────────
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

  // ── Accordion ──────────────────────────────────────────────────────────
  $('[data-action="accordion-toggle"]').on('click', function () {
    var $panel = $($(this).data('target'));
    $(this).toggleClass('active');
    $(this).attr('aria-expanded', function (_, val) {
      return val === 'true' ? 'false' : 'true';
    });
    $panel.slideToggle(300);
  });

  // ── Animated counter — include ONLY if page has a stats section ────────
  if ($('[data-count]').length) {
    var counted = false;
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        $('[data-count]').each(function () {
          var $el = $(this), target = parseInt($el.data('count'), 10);
          $({ n: 0 }).animate({ n: target }, {
            duration: 1500,
            step:     function () { $el.text(Math.floor(this.n).toLocaleString()); },
            complete: function () { $el.text(target.toLocaleString()); }
          });
        });
      }
    }, { threshold: 0.4 }).observe($('[data-count]')[0]);
  }

  // ── Tabs ───────────────────────────────────────────────────────────────
  $('[data-action="tab"]').on('click', function () {
    var target = $(this).data('target');
    $('[data-action="tab"]').removeClass('active').attr('aria-selected', 'false');
    $('[data-tab-panel]').hide().attr('hidden', true);
    $(this).addClass('active').attr('aria-selected', 'true');
    $('[data-tab-panel="' + target + '"]').show().removeAttr('hidden');
  });

  // Add further interaction blocks below as this page's sections require

});
```

---

### AFTER ALL THREE FILES ARE WRITTEN — print and wait:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  BUILD COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files:
  output/{page-slug}/index.html
  output/{page-slug}/style.css
  output/{page-slug}/script.js

Template picks used:
  hero         ← "{template name}"  ({category})
  features     ← "{template name}"  ({category})
  stats        ← "{template name}"  ({category})
  cta          ← "{template name}"  ({category})

Instant templates:  nav + footer  [team inserts separately]
Layout patterns:    {distinct layout list}
Breakpoints:        1240·1080·991·767·565·480·350 ✅
Rulesbook:          Applied ✅
template-usage.json: Updated — {N} templates marked used this run

→ APPROVE — done
→ REVISE: [specific issue] — fix only that, re-output affected file only
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**ON REVISE:** Fix only the named issue. Re-write only the affected file.
Increment `STATE.phase_6.revise_rounds`. Touch nothing else.

**ON APPROVE:** Set `STATE.phase_6.approved = true`. Save `state.json`. Done.

---

## TEMPLATE USAGE — RESET RULES

```
AUTO-RESET (per category):
  When category.available[] is empty → reset that category
  Move all category.used[] → category.available[]
  Reset counts: available_count = total, used_count = 0
  Log the reset in auto_reset_log with timestamp and reason
  Print: "♻️ {Category} pool reset — all {N} templates available again"

MANUAL RESET (full library):
  Type: RESET_TEMPLATES
  Moves ALL used[] → available[] across ALL categories
  Writes template-usage.json
  Prints: "♻️ Full template library reset — {630} templates available"

USAGE REPORT:
  Type: TEMPLATE_STATUS
  Prints a table:
  Category                    Available   Used   Total
  AI & Intelligence           13          3      16
  Core Features               71          10     81
  [etc.]
  Total available: {N} / 630
```

---

## AUTONOMY RULES

```
RULE 1 — NO PERMISSIONS DURING BUILD
The agent never stops to ask permission during Phase 1, 2, or 6.
Reading files, picking templates, writing output → all proceed without asking.

RULE 2 — THE ONLY STOP GATE IS CONFIDENTIAL CONTENT
If writer's document contains content that appears confidential:
internal metrics / unreleased products / private data / personal info →
STOP in Phase 0-A and ask for confirmation before proceeding.
This is the ONLY thing that pauses the build.

RULE 3 — OVERRIDE IS THE ONLY HUMAN INPUT AFTER START
After the template pick summary is shown (Phase 0-B), the only expected
human input is OVERRIDE / REVISE / APPROVE.
If the user sends any other message during build → treat it as a note,
complete the current phase, then address it.

RULE 4 — DO NOT OVER-FETCH
Only fetch a template URL when Chrome MCP is available AND the section
genuinely needs layout structural reference.
Never fetch all 630 URLs. Never fetch URLs in a loop.
Template name alone is sufficient design direction in most cases.

RULE 5 — TEMPLATE PICK = DESIGN DIRECTION ONLY
Picked template name/URL tells you the visual personality to code toward.
You write the section from scratch. No copy-paste from template HTML.
No cloning. No iframe. No scraping content from the template URL.
```

---

## CORE RULES

```
RULE A — RULESBOOK IS LAW
Every conflict with Rulesbook.md → Rulesbook wins. Flag it. Follow it.

RULE B — RANDOM VARIETY IS MANDATORY
Templates must be picked randomly — no repeating a used template
within the same category until the pool is exhausted.
This ensures every page has a unique design direction.

RULE C — BEM IS ALWAYS
Every CSS class: .block__element--modifier
No exceptions for any section type.

RULE D — THREE FILES ALWAYS
index.html + style.css + script.js — always three, always separate.
No single-file output. No <style> in HTML. No inline styles.

RULE E — NAV + FOOTER ARE NEVER BUILT
Comment placeholders only in index.html. No nav/footer CSS or JS.

RULE F — STATE ALWAYS TRAVELS
Read state.json before every phase. Write state.json after every phase.
```

---

## QUICK PHASE REFERENCE

```
"read @README.md and start" + writer's document
               │
               ▼
[STARTUP]      Read Rulesbook.md → source CSS → template-usage.json
               │
               ▼
[PHASE 0-A]    Parse writer's document
               Check for confidential content → only stop if found
               Extract: page_type, product, keywords, sections_required
               │
               ▼
[PHASE 0-B]    For each section: pick random template from matching category
               Mark each pick as used in template-usage.json immediately
               Print ONE summary table · wait 1 cycle for OVERRIDE
               Silence → proceed
               │
               ▼
[PHASE 1]      Extract design tokens from source CSS
               Use template pick names as visual direction context
               │
               ▼
[PHASE 2]      Page blueprint — real content, layout, template direction per section
               Run layout coherence check
               │
               ▼
[PHASE 6]      Write index.html + style.css + script.js
               Coded from scratch using Rulesbook + tokens + blueprint
               Template picks = design direction only (not source code)
               Nav/footer = comment placeholders only
               → REVISE loop if needed
               ▼ APPROVE
✅ DONE — output/{page-slug}/ ready
           template-usage.json updated
           Team inserts nav + footer from instant templates
```

---

*workflow.md v6.0 · Random template picks · Autonomous build · No permissions ·
Template variety via usage tracking · Rulesbook.md is law*