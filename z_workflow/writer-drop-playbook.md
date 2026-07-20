# Writer Drop Playbook — exact output every build

**Read this whenever a new Zoho Writer URL arrives.**

Goal: structured dev handoff in `output/{page-slug}/` that matches the brief **and** team reference patterns — no missing CTAs, no skipped Writer pages, no wrong section order.

Companion files: [agent-build-gates.md](agent-build-gates.md) · [section-composites.json](section-composites.json) · [banner-selection-guide.md](banner-selection-guide.md) · [cursor-build-workflow.md](cursor-build-workflow.md)

Reference outputs (promoted to `Reference-Site/agent-reference/` when approved): sales-dashboard-examples · excel-spreadsheet-reporting-lp-3 · **what-is-business-intelligence-lp-3** (BI guide gold) · **sqlite-db-page-draft-2** (database-connector / Athena gold) · **firebird** (Firebird-style DB connector gold) · **shopify-analytics-page-draft-8** (app-connector / Shopify gold).

---

## 0. Trigger checklist (do first)

```
[ ] Writer brief via Writer API (Web Page Builder Phase 0 / extractWriterViaApi) — NOT Chrome MCP
[ ] briefs/{slug}.extract.json has extraction_method: "writer_api"
[ ] Fresh extract saved → z_workflow/briefs/{slug}.txt
[ ] validate:brief exit 0
[ ] Brief char count ≈ Writer footer "Chars:" (if shown)
[ ] section-composites.json archetype matched (if applicable)
[ ] banner-selection-guide.md — hero vs mid-cta vs closing-cta bg treatments differ (no one banner reused everywhere)
[ ] state.json reset for new run_id / page_slug
```

---

## 1. Acquire the Writer brief — Writer API only (mandatory)

### Step 1 — Extract via Zoho Writer API

Web Page Builder Phase 0 calls `extractWriterViaApi` (`web-tool/server/writer-api.js`):

1. OAuth access token for the signed-in Zoho user
2. `GET /writer/api/v1/download/{documentId}?format=docx`
3. `extractDocx` → `z_workflow/briefs/{slug}.txt` + `.extract.json` with `extraction_method: "writer_api"`

Agent / CLI: rely on the tool build, or confirm the sidecar already shows `writer_api`. Do **not** open the Writer URL in Chrome MCP.

Then:

```bash
npm run validate:brief -- --file z_workflow/briefs/{slug}.txt
```

### Step 2 — Auth gate (fail closed)

| Signal | Action |
|--------|--------|
| No OAuth tokens / Writer API 401–403 | **STOP.** Tell user: Sign in with Zoho in Web Page Builder, grant Writer scopes, retry build. |
| API returns null / download failed | **STOP.** Do not fall back to Chrome MCP or Puppeteer. |
| `extraction_method: "writer_api"` + validate:brief exit 0 | Continue to match / compose |

### Forbidden

| Do not | Why |
|--------|-----|
| Chrome MCP → Writer URL | User rule: Writer API only |
| Puppeteer `extract:writer` | Browser path — not API |
| Use `briefs/*.txt` from a previous session without API re-extract | Stale / wrong source |
| Accept paste when a Writer URL was given | Bypasses the document |
| Build on failed extraction | No valid content source |

### Extraction gates (fail closed)

| Gate | Rule |
|------|------|
| **validate-brief** | Exit 0 required before `match-sites` / build |
| **extraction_method** | Must be `writer_api` in sidecar when a Writer URL drove the run |
| **Char count** | Merged length ≥ 90% of Writer footer `Chars:` when available |
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

Archetypes: `dashboard-examples-landing` · `agency-landing` · `comparison-guide` (cloud / AI / BI long-form guides) · `what-is-business-intelligence` (BI definitional guide) · `bi-software-landing` (Best BI Software product LP) · `white-label-reporting-landing` · `spreadsheet-reporting-landing` (Excel reporting LP) · `database-connector-landing` (SQLite / Athena / DB connector LPs) · `app-connector-landing` (Shopify / SaaS app connector LPs) · `mobile-apps-landing` (Zoho Analytics Mobile Apps main page)

### `app-connector-landing`

**Brief signals:** `Shopify Analytics Page`, `shopify-advanced-analytics.html`, `Why choose Zoho Analytics for your Shopify store`, `Try our native Shopify analytics`, `Advanced Shopify analytics - Key features`, `Join Zoho Analytics today`

**Gold live LAYOUT:** [shopify-advanced-analytics.html](https://www.zoho.com/analytics/shopify-advanced-analytics.html) · **CSS:** `zanalytics_solutions.css` + `5919.css`  
**Gold output (compose from this):** `output/shopify-analytics-page-draft-8/`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `header-section` | umain: centered h1 + lead + **ACCESS ZOHO ANALYTICS** · slider below |
| 2 | Brands | `branding-section` | Counter LEFT + logo sprites RIGHT · dual counters rotate · `scaleEffect` on scroll |
| 3 | Native app | `shopify-banner-section` | h2 `#f1dc05` + 2-col checks + absolute black **Get the app now** · `saa-icon` float |
| 4 | Why choose | `feature-accordian-section` | Accordion tabs ×N + dashboard images |
| 5 | Key features | `zcollaborate-section` | Feature cards ×N + **Explore more features** |
| 6 | Connectors | `connectors-section` | Inventory / CRM / Survey pastel cards + outline View more |
| 7 | Testimony | `testimonial-section` | Placeholder when brief has Customer testimony |
| 8 | Ratings | `trust-section` | Rated the best — placeholder / inject |
| 9 | How-tos | `how-tosec-wrap` | Solutions / How-Tos placeholder |
| 10 | Closing CTA | `bottom-section` `#conclusion` | Join Zoho Analytics today + ACCESS ZOHO ANALYTICS — end-banner pool |

**Anti-pattern:** Do not match Shopify / app-connector briefs to `database-connector-landing` just because the brief mentions **Data blending**. Do not invent `.sbs-head` flex for the app banner — gold uses absolute `.apps-link`.

### `mobile-apps-landing`

**Brief signals:** `ZA BI APP Main Page`, `ZOHO ANALYTICS MOBILE APPS`, `Enjoy the complete native approach`, `Experience the truly native`, `Mobile BI App`, `Dashboards App`, `Analyze your data on-the-move`, `mobile-apps.html`

**Gold live LAYOUT:** [mobile-apps.html](https://www.zoho.com/analytics/mobile-apps.html) · **CSS:** `29675.css` + `zanalytics_solutions.css`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `header-section` | Peach `#fef2f2` · centered h1 48 + bold lead 17 + **ACCESS ZOHO ANALYTICS** · device image below |
| 2 | Native intro | `feature-common-title` | Centered h2 38 + lead · “Here's what makes… stand out” |
| 3 | Features | `feature-accordian-section` | Accordion tabs ×N from brief (often 6) + images |
| 4 | Product apps | `third-party-section` | 2 pastel `party-flex-inner` cards · Read more · App Store / Play |
| 5 | Testimony | `testimonial-section` | Placeholder: peach quote icon + **Hear it from our customers** + TODO (no invented quotes) |
| 6 | Ratings | `trust-section` | **Rated the best** — full live 3×3 `.rating-table` grid |
| 7 | Closing CTA | `bottom-section` | Analyze your data on-the-move… + ACCESS ZOHO ANALYTICS |

**Anti-pattern:** Do not match Mobile Apps briefs to `database-connector-landing` just because the brief mentions **Zia Insights**. When ★ Trusted Brands is on, inject **`branding-section`** (counter + logo grid) — never the BI marquee `.za-brandsCounts`.

### `firebird-db-landing`

**Brief signals:** `What is Firebird?`, `firebird.html`, `Unleash the power of your Firebird data`, `Maximize your Firebird data with the collaboration of Zoho Analytics`, `Data Visualization and Reporting`, `Analytics made Simple, Results Made Powerful`

**Gold live LAYOUT:** [firebird.html](https://www.zoho.com/analytics/firebird.html) · **CSS:** `29667.css`  
**Gold snippet:** `z_workflow/gold-snippets/firebird-db-type-scale.css`  
**Gold output / agent-reference:** `output/firebird/` → `Reference-Site/agent-reference/Firebird/`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `za-banner-section` | Peach `#fef2f2` split — h1 + What-is definition as lead + **ACCESS ZOHO ANALYTICS** · banner img |
| 2 | Value band | `za-features-section` | Red `#d83d3e` 95% rounded — Maximize… + `.za-feature-title` |
| 3–6 | Capabilities | `zdashboard-section` (+ `zdb2` on 2 & 4) | Data import · prep · blending · Live Connect — title + desc + media |
| 7 | Deeper features | `za-analyze-section` | 3 cards — Visualization · Enhanced BI · Scalability |
| 8 | Closing CTA | `za-bottom-section` `#conclusion` | Analytics made Simple… — end-banner pool |

**Anti-pattern:** Do not match Firebird briefs to Athena `database-connector-landing` (Incremental fetch / Zia Insights / Predictive / Conversational). Do not invent `.zconnecting-section` or `.zbanner-section` for this layout.
**Anti-pattern:** Do not leave `.za-feature-title` at scaffold 17px — must be **26px / 40px** (override `.page-container p`). Do not use Athena side-by-side dashboard title/desc — Firebird stacks + centers them (h2 **32**/42).

### `database-connector-landing`

**Brief signals:** `SQLite Database landing page`, `amazon-athena.html`, `What is SQLite?`, `Data Import`, `Data Preparation`, `Live Connect`, `Data Blending`, `Incremental fetch`, `Zia Insights`, `ACCESS ZOHO ANALYTICS`

**Gold live LAYOUT:** [amazon-athena.html](https://www.zoho.com/analytics/amazon-athena.html) · **CSS:** `27735.css`
**Gold snippets:** `z_workflow/gold-snippets/database-connector-type-scale.css` · `database-connector-zresrc-cards.css`
**Gold output (compose from this):** `output/sqlite-db-page-draft-2/`
**Alternate live (no competitor table):** [sqlite.html](https://www.zoho.com/analytics/sqlite.html)

**Type scale (live Athena — do not use scaffold 16/20/32):** h1 **50**/60 · h2 **36**/45 · feature h4 **23**/32.2 · body p **17**/27.2 · what-is p **18**/28.8 · resource h4 **21**/29.4 · learn-more **17**/25.5 · section padding **100px** · h2 margin `0 0 15` · p margin `0 0 20`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `zbanner-section` | Logos + h1 + lead + **ACCESS ZOHO ANALYTICS** (brief CTA) |
| 2 | Brands | `trust-section` | Trusted by great brands — skip if ★ Trusted Brands inject |
| 3 | Counts | `tbrand-section` | Customers / Users / Reports counters |
| 4 | What is DB? | `zvalue-section` | Definition block from brief |
| 5 | Value together | `zvalue-section` | How Zoho Analytics + DB bring value |
| 6–9 | Capabilities | `zdashboard-section` (+ `zdb2` on rows 2 & 4) | Data Import · Prep · Live Connect · Blending — `.zdashboard-box` + `.zdashboard-img` |
| 10 | Key features | `zconnecting-section` | 4 cards — icons are **images** (`<img class="zconnecting-icon">` placeholders; live uses sprite/PNG on `h4::before`) |
| 11 | Comparison | `zcomparison-section` | **OPTIONAL** — only if brief has competitor table (Athena has QuickSight; SQLite draft → skip) |
| 12 | Testimony | `ztesti-section` | **Visible** placeholder: h2 + photo img + name/title/quote TODOs (never empty collapsing section) |
| 13 | Resources | `zresrc-section` | **BOX cards** — `.zresrc-list` padding 35px · radius 12px · soft shadow + icon + Learn more CTA. Gold: `gold-snippets/database-connector-zresrc-cards.css` |
| 14 | Closing CTA | `zbottom-section` `#conclusion` | Start exploring… + ACCESS ZOHO ANALYTICS — end-banner pool, never plain white |

**Anti-pattern:** Do not invent a QuickSight / competitor comparison when the Writer doc omits it.  
**Anti-pattern:** Do not use testing-3 `dashboard-wrapper` clip-path zigzag — use Athena `.zdashboard-section` / `.zdb2` media rows.  
**Anti-pattern:** Do not emit flat `.zresrc-list` text columns — each resource item must be a **box card** (shadow + padding + radius) with `.learn-more-cta`.  
**Anti-pattern:** Do not ship scaffold type (h1 42 / h2 32 / p 16) — copy `database-connector-type-scale.css`.

Composer injects gold output path + both gold snippets + Athena BEM rules. Inventory gates: `require_database_connector_type_scale`, `require_database_connector_zresrc_cards`, `require_database_connector_feature_icons`, `require_testimonials_placeholder`.

### `what-is-business-intelligence`

**Brief signals:** `What is Business Intelligence?`, `How does Business Intelligence work?`, `Traditional BI vs Modern BI`, `Industrial use cases of Business Intelligence`, `what-is-business-intelligence.html`

**Gold live:** [what-is-business-intelligence.html](https://www.zoho.com/analytics/what-is-business-intelligence.html) · **CSS:** `39804.css`  
**Gold snippet:** `z_workflow/gold-snippets/what-is-bi-type-scale.css`  
**Gold output (compose from this):** `output/what-is-business-intelligence-lp-3/`  
**BEM reference:** `Reference-Site/Business-Intelligence/`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `banner` | Centered overview + **Get Started** |
| 2 | Brands/counts | `za-brandsCounts` | Marquee + 16K / 3M (or ★ Trusted Brands inject) |
| 3 | Scrollspy tabs | `tab-section` | Horizontal `.tab-btn` row — **not** article `.tabsection` TOC |
| 4 | Intro | `question-section` | Split text + illustration |
| 5 | Mid CTA | `pre-banner` | Demo band → **Book a demo** |
| 6 | How BI works | `sticky-card-section` | Sticky `.scroll-card` ×5 from brief |
| 7 | Comparison | `comparison-table-section` | Traditional vs Modern table |
| 8 | Benefits | `box-icon-section` | Benefit `.card` grid ×N |
| 9 | Testimonials | `testimonials-section` | **Placeholder only** — header + See all link; **no** zwc-nav-box cards |
| 10 | Goals | `progress-section` | Accordion goals ×5 — **no** growth-engine line inside |
| 11 | Goals statement banner | `pre-banner` `#goals-align-banner` | Writer **Separate banner for this:** → prezoho placeholder bg + h2 text only |
| 12 | Companies use | `use-cases-section` | How companies use BI |
| 13 | Industries | `features-tabs-section` | Vertical industry tabs ×6 |
| 14 | Closing CTA | `pre-banner` `#conclusion` | **Start your BI journey today** |
| 15 | FAQ | `faq-section` | After closing CTA only |

**Anti-pattern:** Do not nest this page as `comparison-guide` article TOC (`.tabsection` / `.left-tab`). Sibling sections match live.  
**Anti-pattern:** Do not append Writer “Separate banner for this:” copy inside `.progress-section` — always a sibling `.pre-banner`.  
**Anti-pattern:** Do not match **BI Software Landing Page** / `business-intelligence-bi-software.html` briefs here — use `bi-software-landing`.

**Type scale (live 39804):** h1 42/50.4 · h2 32/40 · h3 24/31.2 · p/li 17/27.2 · `.title-desc` 20/32 width 80% · FAQ h4 18 / padding 25px · sections 90px.  
**Gold snippet:** `z_workflow/gold-snippets/what-is-bi-type-scale.css` — do **not** ship scaffold h3 20px / p 16px.

Composer injects gold output path + type-scale snippet + placeholder testimonials rule. Inventory gates: `require_what_is_bi_type_scale`, `require_testimonials_placeholder`.

### `bi-software-landing`

**Brief signals:** `BI Software Landing Page`, `business-intelligence-bi-software.html`, `Top Business Intelligence softwares in 2026`, `How to choose the best BI Software: Key features`, `Trusted BI Platform by great brands`

**Gold live (primary):** [business-intelligence-bi-software.html](https://www.zoho.com/analytics/business-intelligence-bi-software.html) · **CSS:** `23064.css`  
**Sibling (Top-N tools):** [business-analytics-software.html](https://www.zoho.com/analytics/business-analytics-software.html) · **CSS:** `27747.css` — `.tab-sticky` product picks  
**Gold snippets (COPY into style.css):**  
- `z_workflow/gold-snippets/bi-software-landing-layout.css`  
- `z_workflow/gold-snippets/bi-software-trusted-brands-isolation.css` (when ★ Trusted Brands inject is on)  
**Gold output / agent-reference:** `output/bi-software-3/` → `Reference-Site/agent-reference/Bi-Software-3/`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `zwc-banner-section` | h1 + lead + **Access Zoho analytics** + `.zwc-stats` ×6 · **must** set `item1::before` → `banner-before.png`, `item3::before` → `banner-beforegraph.svg`, `<img class="banner-arrow">` → `banner-arrow.svg` (prezoho paths — never bare `prezohoweb.zoho.com/`) |
| 2 | Trusted brands | `za-brandsCounts` | ★ **Trusted Brands inject only** (heading + 22K/4M + logo marquee). Do **not** compose live `.trust-section` / `.tbrand-section` when inject is on. COPY isolation CSS so live `.trust-icon { margin:-120px }` does not clip logos. |
| 3 | Definition | `zwc-learn-section` | What is Business Intelligence Software? |
| 4 | Key features | `zwc-feature-section` | `.feature-cont` paired h3/p ×6 from brief |
| 5 | Testimony | `zwc-testimonials` | Capterra shell + TODO — no invented quote |
| 6 | Top BI softwares | `tab-sticky` | Left tabs + `.cont-sec` ×4 (Zoho · Power BI · Tableau · Sisense) + Pricing |
| 7 | FAQ | `faq-section` | `.z-accordian` ×8 after tools |

**Do not compose** (live-only, absent from Writer Changes): Benefits (`.zwc-otherfea-section`), What makes Zoho best (`.note-section`), Building blocks, Types of reports, Why choose, `.zwc-footer-section`.

**Anti-pattern:** Do not treat as `what-is-business-intelligence` (no Traditional vs Modern / goals accordion / industry tabs).  
**Anti-pattern:** Do not nest FAQ inside `.tab-sticky`.  
**Anti-pattern:** Do not leave hero `::before` / arrow URLs as bare `https://prezohoweb.zoho.com/`.  
**Anti-pattern:** Do not ship unscoped `.trust-icon { margin:-120px }` alongside Trusted Brands inject.

### `spreadsheet-reporting-landing`

**Brief signals:** `Replace Excel Reporting`, `Why Move Beyond Excel`, `limits of traditional spreadsheets`, `Excel vs Zoho Analytics`, `Migrate Your Excel Sheets`, `Excel Reporting FAQs`

**Gold live:** [spreadsheet-reporting.html](https://www.zoho.com/analytics/spreadsheet-reporting.html) · **CSS:** `40836.css`  
**Gold snippet (COPY into style.css):** `z_workflow/gold-snippets/spreadsheet-reporting-layout.css`  
**Gold output:** `output/excel-spreadsheet-reporting-lp-3/`

| # | Section | BEM class | Live structure (do not invent) |
|---|---------|-----------|--------------------------------|
| 1 | Hero | `banner-section` | Primary **Try Zoho Analytics for free** + **Watch demo** |
| 2 | Why beyond Excel | `progress-section` | `.table-wrap` → `.acc-wrap`×3 + `.image-part` → `.step-image`×3 — **not** progress-timeline cards |
| 3 | Spreadsheet limits | `limits-section` | `.limits-grid` → `.limit-item` → `p` ×6 + `.limits-closing` |
| 4 | Zoho capabilities | `dashboard-wrapper` | Zigzag cream cards + `<span class="check">` — see cream-card rules below |
| 5 | Comparison | `comparison-table-section` | Columns **Features \| Zoho \| Excel** + `.analytics-light` / `.analytics-dark` |
| 6 | Migration | `excel-migration-section` | `.migration-wrapper` → `.migration-step` ×4 (`.step-icon` + h4) |
| 7 | Mid CTA | `pre-banner-section` | Primary **Sign up for free** + **Get a personalized Demo** (≠ hero) |
| 8 | Customer stories | `za-custories-section` | When brief lists Customer stories |
| 9 | Recognition | `reported-section` | **SKIP** when report_slider injected |
| 10 | Pricing CTA | `pre-banner-section.light` `#conclusion` | Primary **Start your free trial today!** + **Sign up for free** (≠ hero primary) |
| 11 | FAQ | `faq-section` | `.z-accordian` |

**Banner CTA rule:** hero / mid / closing each get **different primary** labels (`cta_banner_map`). Never stamp “Try Zoho Analytics for free” on every band.

**Type scale (live 40836):** h1 42/50.4 · h2 32/40 · h3 24/31.2 · p/li 17/25.5 · `.page-container .title-desc` 20/32 · limit-item p 18 · migration-subtitle 22 · FAQ h4 18 / padding 25px · sections 90px (FAQ 80px).

**Cream dashboard cards (mandatory):**
- `isolation: isolate` on `.main-wrapper`
- `::before` `#fef8eb` ~871×570 · `border-radius: 30px` · **`z-index: 0`** (never `-1` — panel vanishes)
- image/content `z-index: 1` · `img.dashboard-image` border `5px solid #000` · radius 20px
- Do **not** use testing-3 clip-path / 55% zigzag panels for this archetype

**Pipeline injections:** Trusted brands after hero · Report slider before `#conclusion`.

Composer injects gold snippet path + `mandatory_css` + live BEM. Inventory gates: `require_spreadsheet_cream_panel`, `require_spreadsheet_type_scale`, `require_distinct_banner_ctas`.
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
