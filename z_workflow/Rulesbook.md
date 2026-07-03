# README — AUTOMATION AGENT RULEBOOK
## Web Page Creation Standards · Zoho Web Project
### This file governs every build, every agent, every phase — no exceptions

---

> **HOW THIS FILE WORKS**
> - Rules listed as plain points → **specified by the project owner. Mandatory. Non-negotiable.**
> - Rules prefixed with `·` → **derived by analysing the source files (zohocustom.css + product.css). Equally mandatory.**
> - When in doubt about ANY implementation detail → **open and re-read the source files before proceeding.**
> - This rulebook is injected into every agent phase automatically. You do not need to ask for it.

---

## ⚠️ MANDATORY FIRST STEP — BEFORE EVERY BUILD

```
Before writing a single line of HTML, CSS, or JavaScript:
  1. Open and read:  source/zohocustom.css
  2. Open and read:  source/product.css
  3. Confirm font variables, spacing patterns, component naming, and breakpoints.
  4. Only then begin writing code.

If anything in the task brief conflicts with what you see in the source files,
the SOURCE FILE is the authority — flag the conflict but follow the source.
```

---

## SECTION 1 — HTML RULES

### 1.1 Naming & Semantics

- Element names must be semantic — use the correct HTML5 element for the job.
  Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` as appropriate.
  Never use `<div>` where a semantic element exists.

- Class names must be layout-descriptive — they describe the structure and role,
  not the visual appearance or colour.
  ✅ `.hero__content-wrap` `.features__card-grid` `.nav__link-list`
  ❌ `.blue-box` `.big-text` `.left-thing`

- IDs are reserved for JavaScript hooks and anchor links only.
  Never use IDs for CSS styling.

- · Wrapper containers must use `.content-wrap` as the standard inner container class,
  consistent with the pattern found throughout the source files.

- · Page-level sections must carry a descriptive class that mirrors the BEM block name.
  Example: the features section is `.features-section`, its container is `.features-section__wrap`.

### 1.2 Accessibility

- Add `aria-label` on every `<nav>` element.
  Example: `<nav aria-label="Primary navigation">`

- All `<img>` elements must have a meaningful `alt` attribute. Never leave it empty
  unless the image is purely decorative — in that case use `alt=""` explicitly.

- Interactive elements (`<button>`, `<a>`) must have visible `:focus` states in CSS.
  Never suppress `outline` without providing a custom focus indicator.

- Form inputs must have associated `<label>` elements. Never use `placeholder` as a substitute for a label.

- Heading hierarchy must be respected. One `<h1>` per page. `<h2>` for section titles.
  `<h3>` for card headings inside sections. Never skip levels.

- Add `role` attributes where native semantics are insufficient.
  Example: `role="tablist"`, `role="tab"`, `role="tabpanel"` for tab components.

- · Accordion triggers must use `<button>` elements with `aria-expanded="true/false"` and
  `aria-controls` pointing to the panel ID — following the `.z-accordianBox` pattern
  seen in the source files.

- · Icon-only buttons must have `aria-label` or a visually hidden `<span>` with the action name.

### 1.3 Structure

- The source files use `box-sizing: border-box` globally. Every file you create must
  include this reset at the top of its CSS.

- · Use `data-*` attributes for JavaScript hooks instead of classes.
  Classes are for styling. `data-action`, `data-target`, `data-classname` are for JS behaviour —
  consistent with the `.zmenu-resources[data-classname="..."]` pattern in the source.

- · Group related elements in a semantic container. Do not leave bare text nodes or
  standalone elements as direct children of `<body>`.

---

## SECTION 2 — CSS RULES

### 2.1 Font System — Zoho Puvi Only

- **The only permitted font family is Zoho Puvi.** Do not load Google Fonts, Adobe Fonts,
  system fonts, or any other typeface. No `font-family: Arial`, no `font-family: sans-serif`
  as a primary value.

- Zoho Puvi is loaded via `zohocustom.css`. The font stack is available as CSS variables.
  Always reference fonts through their CSS custom property — never hard-code the font-family name.

  **Full Puvi variable reference from source:**

  ```css
  /* Weight via font-family — not via font-weight */
  var(--zf-primary-thin)          /* Zoho_Puvi_Thin        */
  var(--zf-primary-light)         /* Zoho_Puvi_Light       */
  var(--zf-primary-extralight)    /* Zoho_Puvi_ExtraLight  */
  var(--zf-primary-regular)       /* Zoho_Puvi_Regular     */
  var(--zf-primary-medium)        /* Zoho_Puvi_Medium      */
  var(--zf-primary-semibold)      /* Zoho_Puvi_SemiBold    */
  var(--zf-primary-bold)          /* Zoho_Puvi_Bold        */
  var(--zf-primary-extrabold)     /* Zoho_Puvi_ExtraBold   */
  var(--zf-primary-black)         /* Zoho_Puvi_Black       */
  var(--zf-primary-extrablack)    /* Zoho_Puvi_ExtraBlack  */

  /* Italic variants */
  var(--zf-primary-semibold-italic)
  var(--zf-primary-bold-italic)

  /* Secondary / alternate */
  var(--zf-secondary-medium)
  var(--primaryfont-semibold)
  var(--secondaryfont-semibold)
  ```

  > If a variable name is uncertain, open `zohocustom.css` and confirm before using.

- · Every `@font-face` in the source uses `font-weight: normal` regardless of the weight.
  Weight variation is achieved by selecting a different `font-family` name, not by setting
  `font-weight: 700`. Follow this same pattern in any custom `@font-face` declarations.

- · Every `@font-face` must include `font-display: swap`. No exceptions.

### 2.2 Font Size & Colour — Global Declaration

- Font sizes and colour values must be declared once in `:root` as CSS custom properties.
  They must not be overridden locally in component-level selectors.

  ```css
  :root {
    /* Typography scale */
    --font-size-xs:   12px;
    --font-size-sm:   14px;
    --font-size-base: 16px;
    --font-size-md:   18px;
    --font-size-lg:   20px;
    --font-size-xl:   24px;
    --font-size-2xl:  28px;
    --font-size-3xl:  36px;
    --font-size-4xl:  48px;

    /* Colour tokens */
    --color-primary:     #03a9f5;
    --color-cta:         #da212a;
    --color-brand-cta:   #e42527;   /* Immutable — see §2.2.1 */
    --color-text-dark:   #000;
    --color-text-body:   #333;
    --color-text-muted:  #666;
    --color-bg-light:    #f7f7f7;
    --color-border:      #e4e4e4;
    --color-white:       #fff;
  }
  ```

  Component CSS uses the variable: `font-size: var(--font-size-md)`.
  Component CSS never writes: `font-size: 18px` directly.

- · Line-height follows the pattern from the source: `1.4` for headings, `1.5` for cards,
  `1.7` for body text and small labels. Use only these three values unless a specific
  design requirement dictates otherwise.

### 2.2.1 Brand CTA red — immutable across all page themes

**Source of truth:** `source/zohocustom.css` → `--primary-btn-color: #e42527`

Every landing page may use its own **page theme** tokens (`--color-primary`, `--color-secondary`,
gradients, section backgrounds). **Do not replace a vertical theme with client-dashboard blue/purple
unless the brief requires it.** Only **action elements** use brand red (see table below).

**Testimonial cards are an exception:** `.zwc-nav-box` pastels are **never** tinted from the page
theme. Always use the fixed extracted palette in §2.2.2.

| Element | Must use | Never use |
|---------|----------|-----------|
| `.cta-btn.act-btn` (all primary CTAs) | `background: var(--primary-btn-color)` or `#e42527` | Page `--color-primary`, gradient fills, teal/purple/violet |
| Testimonials header link (`See all testimonials`) | `color: var(--primary-btn-color)` | `--color-primary`, `--color-secondary`, gradient text |
| Arrow chevron on that link | `border-color: var(--primary-btn-color)` | Theme accent colours |
| `.zwc-nav-box` card backgrounds | Fixed extracted peach / mint / blue (§2.2.2) | Page theme tints (cyan, violet, teal, etc.) |

**Required in every `style.css` `:root` block:**

```css
--color-brand-cta: #e42527;
--primary-btn-color: #e42527;
```

**Required dev-handoff overrides** (when team nav hides `.cta-btn`):

```css
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

Gold-standard reference: `output/client-dashboard-software/style.css` (CTAs + link) · `output/financial-dashboard-examples/style.css` (testimonial cards).

### 2.2.2 Testimonial cards — extracted palette only (automation)

> **Automation rule:** Agents must copy these values on every build. Do **not** derive
> `.zwc-nav-box` colours from `--color-primary`, `--color-secondary`, or vertical theme tokens.

**Hear from our customers** marquee cards use a **fixed three-colour rotation** (peach → mint → blue),
matching Writer extraction / `BI-Marketing` / `Marketing-Agencies` — same on finance, sales, agency,
and all future dashboard landings.

**Required `:root` tokens (identical on every page):**

```css
--testimonial-peach-bg: #FFF4E8;
--testimonial-peach-border: #F0DCC8;
--testimonial-mint-bg: #EEF8F4;
--testimonial-mint-border: #C8E8D8;
--testimonial-blue-bg: #EEF4FC;
--testimonial-blue-border: #D4E4F5;
```

**Required `.zwc-nav-box` rules (copy verbatim — do not theme-tint):**

```css
.zwc-nav-box:nth-child(1),
.zwc-nav-box:nth-child(4) {
    background-color: var(--testimonial-peach-bg);
    border-color: var(--testimonial-peach-border);
}
.zwc-nav-box:nth-child(2),
.zwc-nav-box:nth-child(5) {
    background-color: var(--testimonial-mint-bg);
    border-color: var(--testimonial-mint-border);
}
.zwc-nav-box:nth-child(3),
.zwc-nav-box:nth-child(6) {
    background-color: var(--testimonial-blue-bg);
    border-color: var(--testimonial-blue-border);
}
.zwc-nav-box:nth-child(1) .descriptions-wrapper,
.zwc-nav-box:nth-child(4) .descriptions-wrapper {
    background-color: rgba(240, 220, 200, 0.45);
    border: 1px solid rgba(240, 220, 200, 0.45);
}
.zwc-nav-box:nth-child(2) .descriptions-wrapper,
.zwc-nav-box:nth-child(5) .descriptions-wrapper {
    background-color: rgba(200, 232, 216, 0.45);
    border: 1px solid rgba(200, 232, 216, 0.45);
}
.zwc-nav-box:nth-child(3) .descriptions-wrapper,
.zwc-nav-box:nth-child(6) .descriptions-wrapper {
    background-color: rgba(212, 228, 245, 0.45);
    border: 1px solid rgba(212, 228, 245, 0.45);
}
```

| Wrong (do not generate) | Right |
|-------------------------|-------|
| Sales cyan `#ECFEFF` / violet `#F5F3FF` card fills | Peach `#FFF4E8` / mint `#EEF8F4` / blue `#EEF4FC` |
| `background: var(--color-primary)` on testimonial cards | Fixed tokens above only |
| Themed inner quote box matching page gradient | `rgba(240,220,200,0.45)` / `rgba(200,232,216,0.45)` / `rgba(212,228,245,0.45)` |

Gold standard: `output/financial-dashboard-examples/style.css` · `output/sales-dashboard-examples/style.css` (after fix).

### 2.3 Font Weight Rules

- **Never use `letter-spacing` together with `font-weight`.** They are independent properties.
  Letter-spacing is a typographic spacing tool, not a weight modifier. They must not be
  applied together on the same element as a visual trick.

- · Do not use `font-weight: bold` or numeric font-weight values (`font-weight: 700`).
  Change the `font-family` CSS variable to achieve heavier or lighter weight — as the
  source files do throughout.
  ✅ `font-family: var(--zf-primary-semibold)`
  ❌ `font-weight: 600`

### 2.4 No Duplication, No Override

- Do not declare a CSS property that already exists in a parent or global selector
  for the same element. This creates specificity fights and maintenance problems.

- Do not override a global class with the same selector. If a global `.cta-btn` style
  exists in the source, do not redefine `.cta-btn` in a component file. Extend it
  with a modifier: `.cta-btn--dark`, `.cta-btn--outline`.

- · `!important` is forbidden except for:
  (a) language/RTL overrides (`.other-lang`, `.i18n-ar`)
  (b) utility classes that must always win (`.d-none`, `.hidden`)
  Any other use of `!important` indicates a specificity problem — fix the structure instead.

### 2.5 CSS Organisation

- Organise CSS rules in the same order as the HTML layout from top to bottom.
  The CSS for `<header>` comes before `<section>`, which comes before `<footer>`.

- Within each block, order properties as follows:
  ```
  1. Layout & position  (display, position, top, left, z-index, float)
  2. Box model          (width, height, margin, padding, border, box-sizing)
  3. Typography         (font-family, font-size, line-height, color, text-align)
  4. Visual             (background, border-radius, box-shadow, opacity)
  5. Animation          (transition, transform, animation)
  6. Miscellaneous      (cursor, overflow, content for pseudo-elements)
  ```

- · Group selectors that share identical declarations rather than repeating the block.
  `.solution-box h3, .card__title` instead of two separate identical blocks.

### 2.6 BEM Structure — Mandatory

- All CSS must follow BEM (Block Element Modifier) naming.

  ```
  Block:    .features-section
  Element:  .features-section__card
  Element:  .features-section__card-title
  Modifier: .features-section__card--highlighted
  Modifier: .features-section--dark-bg
  ```

- Block names are kebab-case. Elements use double underscore `__`. Modifiers use double hyphen `--`.

- · Utility/helper classes (single-purpose) follow a short functional pattern consistent
  with the source files: `.m-0`, `.m-t-15`, `.p-b-0`, `.f-20`. These are global and must
  not be redefined locally.

### 2.7 Media Queries — All Breakpoints Required

- Every component must be tested and have explicit CSS for all seven breakpoints:

  ```css
  @media only screen and (max-width: 1240px) { }   /* Large desktop crop    */
  @media only screen and (max-width: 1080px) { }   /* Standard desktop      */
  @media only screen and (max-width:  991px) { }   /* Tablet landscape      */
  @media only screen and (max-width:  767px) { }   /* Tablet portrait       */
  @media only screen and (max-width:  565px) { }   /* Large mobile          */
  @media only screen and (max-width:  480px) { }   /* Standard mobile       */
  @media only screen and (max-width:  350px) { }   /* Small mobile          */
  ```

- Media queries are placed at the **bottom of the CSS file**, after all component rules,
  grouped by breakpoint in descending order (largest first).

- · At 767px and below, multi-column grid layouts must collapse to single column.
  At 480px and below, font sizes must reduce proportionally. At 350px, all padding
  must be reviewed to ensure no horizontal overflow.

- · Do not use `min-width` media queries unless building up from a mobile-first base.
  The source files use `max-width` as the primary direction.

### 2.8 Images & Placeholders

#### Universal dev-handoff placeholder (mandatory for all new builds)

During scaffold generation, **every** provisional asset — content images, icons, logos, avatars,
and CSS banner/section backgrounds — must use this single approved placeholder URL:

```
https://prezohoweb.zoho.com/
```

Do **not** use `placehold.co`, local file paths, or other CDN URLs for placeholders.
The dev team replaces this URL with final assets at handoff.

**Required on every placeholder `<img>`:**

```html
<!-- TODO: replace with final asset -->
<img
  src="https://prezohoweb.zoho.com/"
  alt="Descriptive label for the final asset"
  width="1200"
  height="675"
  loading="lazy">
```

Keep `width` and `height` from the Figma/brief dimensions — only the `src` is universal.

**Required on every placeholder CSS background (banners, hero sections, decorative panels):**

```css
.hero-section {
    /* TODO: replace with final background asset */
    background-image: url('https://prezohoweb.zoho.com/');
    background-size:     cover;
    background-position: center top;
    background-repeat:   no-repeat;
}
```

**Icons during scaffold:** use the same URL in `<img src="...">` (or as a CSS `background-image`
on icon holders) until the final SVG or sprite is supplied. Production handoff still prefers
inline SVG or sprite patterns from the source files — but **never** a different placeholder service.

#### Production image rules (after dev replaces placeholders)

- **For icons and UI graphics in production — use SVG inline or as `<img src="file.svg">`.**
  Never use raster PNG/JPG for icons in final output.

- · SVG sprite technique is used in the source (`.svg-sprites` class with
  `background-position` offsets). When building icon sets, follow this sprite pattern.

- **For background sections, decorative images, and hero backgrounds — use CSS
  `background-image` with these properties always declared together:**
  ```css
  background-size:     cover;
  background-position: center top;  /* or center center */
  background-repeat:   no-repeat;
  ```

- **For content images (photographs, product screenshots, illustrations) — use `<img>` tag**
  with `alt`, `width`, and `height` attributes. Never embed content images as CSS backgrounds.

- · Use `loading="lazy"` on all `<img>` elements that are not in the initial viewport
  (i.e., everything below the hero section).

### 2.9 Spacing System

- · From analysis of the source files, spacing values follow multiples of 5:
  `5px, 10px, 15px, 20px, 24px, 25px, 30px, 40px, 50px, 60px, 80px, 100px`
  Do not use arbitrary values like `17px` or `23px` for margins and padding.

- · Section vertical padding follows this pattern: `80px 0` desktop → `60px 0` at 991px
  → `40px 0` at 767px → `30px 0` at 480px.

### 2.10 Transitions & Animations

- · All interactive transitions use `transition: all .5s ease` or `transition: .3s ease`
  as seen in the source. Never use `0.7s` or longer for hover states.

- · `transform` and `transition` must always appear together on animated elements.
  Define transition on the base state, not on the `:hover` state.
  ✅ `.card { transition: all .5s ease; }` `.card:hover { transform: translateY(-4px); }`
  ❌ `.card:hover { transition: all .5s ease; transform: translateY(-4px); }`

### 2.11 Z-Index Scale

- · Follow the z-index scale established in the source files:
  ```
  Local stacking (cards, badges):  z-index: 1 – 5
  Sticky nav / floating elements:  z-index: 10 – 20
  Dropdowns / tooltips:            z-index: 50 – 100
  Modals / overlays:               z-index: 100
  Fixed banners / promos:          z-index: 999
  ```
  Never use arbitrary values like `z-index: 9999`.

### 2.12 Box Model

- · `box-sizing: border-box` must be declared globally:
  ```css
  *, *::before, *::after { box-sizing: border-box; }
  ```
  This is consistent with the source and must appear in every new stylesheet.

### 2.13 Pseudo-Elements

- · Use `::before` and `::after` (double colon, CSS3 standard) for all new code.
  The source uses single colon `:before`/`:after` in legacy sections — do not copy that
  pattern for new elements.

- · When using pseudo-elements for icons or decorative shapes, always set:
  `content: ''`, `position: absolute`, and define both `width` and `height`.

---

## SECTION 3 — JAVASCRIPT RULES

### 3.1 jQuery Usage

- **Use minimal jQuery.** Only use jQuery where it meaningfully reduces code complexity.
  For simple DOM queries, classList toggles, and event listeners — use vanilla JS.

- jQuery is treated as a utility, not the primary way to interact with the DOM.
  Never chain more than 3 jQuery methods without assigning to a variable first.

- · Follow the `.active` class toggle pattern seen in the source for show/hide and
  accordion behaviour. The class is toggled via JS — CSS handles the visual result.
  Example: `$(this).toggleClass('active')` → CSS handles `.accordion__panel.active { display: block; }`

### 3.2 Sliders

- **For any carousel or slider component — use Slick Slider only.**
  Do not use Swiper, Owl Carousel, Glide, or custom-built sliders.
  Reference: `$.fn.slick` initialisation pattern.

- · Slick Slider must be initialised after DOM ready. Always wrap in `$(document).ready()`.

- · Slick Slider responsive breakpoints must match the project breakpoints defined in Section 2.7.
  Pass a `responsive` array to the Slick config covering at minimum: 991px, 767px, 480px.

### 3.3 General JS Standards

- All JS must be wrapped in `$(document).ready(function() { ... })` or a native
  `DOMContentLoaded` listener. No bare script execution at the top level.

- · Use `'use strict';` at the top of every script file or function scope.

- · Event listeners must use `.addEventListener()` (vanilla) or `.on()` (jQuery).
  Never use inline event handlers (`onclick=""`, `onmouseover=""`).

- · For scroll-triggered animations, use `IntersectionObserver` (vanilla JS).
  Do not use scroll event listeners for appearance effects — they are performance-heavy.

- · Class toggling is the primary mechanism for UI state changes.
  JS adds/removes classes. CSS defines what those classes look like.
  Never write `element.style.color = '...'` or `element.style.display = '...'` in JS.
  Use `element.classList.add('is-hidden')` and define `.is-hidden { display: none }` in CSS.

- · Accordion and tab components must update `aria-expanded` via JS when toggled,
  consistent with the accessibility rules in Section 1.2.

- · Use `data-*` attributes as JS selectors, not classes.
  Example: `document.querySelectorAll('[data-action="toggle"]')` — not `$('.toggle-btn')`.

---

## SECTION 4 — SOURCE FILE MANDATORY ANALYSIS

### When to re-open the source files

The agent must re-read the source files at these moments:

| Situation | File to check |
|---|---|
| Implementing any font | `zohocustom.css` → confirm variable name |
| Setting colours | Both files → confirm existing tokens |
| Building a button | `product.css` → `.cta-btn` pattern |
| Building a card or solution box | `product.css` → `.solution-box` pattern |
| Building an accordion | `product.css` → `.z-accordianBox` pattern |
| Building a code block | `product.css` → `.code-block` pattern |
| Setting media queries | Both files → confirm breakpoint values |
| Setting z-index | Both files → confirm scale |
| Building a slider | `zohocustom.css` → check if Slick is already initialised |
| Any RTL or multi-language concern | `zohocustom.css` → `.i18n-ar`, `.lang-rtl` patterns |
| Any animation or transition | Both files → confirm timing values |
| Unsure about anything | **Open both files. Read before writing.** |

---

## SECTION 5 — GENERAL QUALITY RULES

### 5.1 No Inline Styles

- · Zero inline styles (`style=""` attributes) in any HTML output.
  All visual styling belongs in the CSS file.

### 5.2 No Hardcoded Colours in Components

- · Component-level CSS must not contain hardcoded hex values for colours that are
  already defined as CSS custom properties. Use `var(--color-primary)` not `#03a9f5`.

### 5.3 Output Structure Per Build

- Every build produces exactly three files: `index.html`, `style.css`, `script.js`
- `index.html` → semantic HTML only, no `<style>` tags, no `<script>` tags inside `<body>`
- `style.css` → all styling, organised as per Section 2.5
- `script.js` → all interaction, wrapped in document ready

### 5.4 Border Radius Scale

- · From source analysis, border-radius follows three values:
  ```
  4px   → buttons, small inputs, tags
  12px  → cards, panels, modal containers
  50% / 100% → circles, avatar images, close buttons
  ```
  Do not use arbitrary radius values like `8px` or `20px` unless for pill buttons (`border-radius: 20px`).

### 5.5 No Empty Rules

- · Do not leave empty CSS rule blocks. If a media query block has no overrides for
  a particular breakpoint, omit that breakpoint for that component.

### 5.6 Flexbox as Primary Layout

- · The source uses `display: flex` and `flex-flow: wrap` as the primary layout tool.
  Use CSS Grid only when the layout cannot be achieved cleanly with flex.
  Never use float-based layouts.

### 5.7 RTL Awareness

- · When implementing padding, margin, or positioning that is directional
  (left/right specific), use logical properties where possible:
  `padding-inline-start` instead of `padding-left`,
  `margin-inline-end` instead of `margin-right`.
  This ensures RTL language layouts work correctly — consistent with the `.i18n-ar` patterns in the source.

---

## QUICK DECISION CHECKLIST

Before submitting any build output, verify:

- [ ] Source files were read at the start of this build
- [ ] Only Zoho Puvi used — via CSS variable, not hardcoded font name
- [ ] Font variation achieved via `font-family` variable, not `font-weight`
- [ ] All colours declared in `:root`, used as `var()` in components
- [ ] `letter-spacing` not combined with `font-weight`
- [ ] No CSS duplication or global class override
- [ ] CSS ordered to match HTML structure top-to-bottom
- [ ] BEM naming applied to all classes
- [ ] All 7 breakpoints covered: 1240, 1080, 991, 767, 565, 480, 350
- [ ] Icons use the universal placeholder URL during scaffold; SVG in production handoff
- [ ] All placeholder `<img>` and CSS backgrounds use `https://prezohoweb.zoho.com/` — not `placehold.co`
- [ ] Slick Slider used if any carousel is present
- [ ] jQuery used minimally; vanilla JS used for simple tasks
- [ ] `aria-label`, `alt`, `aria-expanded` applied to interactive elements
- [ ] Heading hierarchy respected (one H1 per page)
- [ ] No inline styles in HTML
- [ ] Transitions defined on base state, not on `:hover`
- [ ] `box-sizing: border-box` declared globally

---

*Rulebook v1.0 · Applies to all phases, all agents, all builds · Source authority: zohocustom.css + product.css*
