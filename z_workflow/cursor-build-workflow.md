# Cursor Main Workflow — Writer Document Builds

**Quick-start for Cursor agents.** Coding law: [Rulesbook.md](Rulesbook.md) · Structure override: [.cursor/rules/structure-first-pipeline.mdc](../.cursor/rules/structure-first-pipeline.mdc)

This workflow turns a Zoho Writer brief into a **structured dev handoff** in `output/{page-slug}/`.

**Gold-standard example:** `output/sales-dashboard-examples/` — composed from section patterns (`banner-section`, `dashboard-wrapper` zigzag rows, `box-icon-section`, `steps-section`, `faq-section`), brief-driven block counts, placeholder assets.

**New Writer doc dropped?** Read **[writer-drop-playbook.md](writer-drop-playbook.md)** first — extraction, archetypes, section order, CTA visibility, pre-approve checks.

---

## Sources of truth

| Source | Role |
|--------|------|
| `cursor-build-workflow.md` | This playbook — phases, state, approval |
| `Rulesbook.md` | Permanent coding law — fonts, BEM, breakpoints |
| `.cursor/rules/structure-first-pipeline.mdc` | **Always-on override** — compose from section patterns, never clone whole pages |
| `section-index.json` | Section type → best reference folder + BEM class |
| `section-composites.json` | Multi-section archetypes (e.g. dashboard-examples landing) — **read when brief matches** |
| `writer-drop-playbook.md` | **New Writer drop** — exact output checklist, section order, reference patterns |
| Writer brief | **Only** source for copy, section list, and block counts |

```mermaid
flowchart TD
    start[Writer brief URL file or paste] --> preflight[Pre-flight]
    preflight --> phase0[Phase 0: Catalog Parse Match]
    phase0 --> phase1[Phase 1: Design tokens]
    phase1 --> phase2[Phase 2: Page blueprint]
    phase2 --> phase6[Phase 6: Compose structure]
    phase6 --> review[Review and open browser]
    review --> decision{User decision}
    decision -->|APPROVE| done[Done — dev handoff ready]
    decision -->|REVISE| phase6
```

---

## 1. Pre-flight (every build)

Before any code:

1. Read `Rulesbook.md` in full
2. Read `source/zohocustom.css` and `source/product.css`
3. Load cached indexes (do **not** full-scan all folders):
   - `site-catalog.json` — reference site metadata
   - `section-index.json` — section type → best reference
   - `team-dna.json` — team tokens + synthesis threshold
   - `section-composites.json` — multi-section archetypes (dashboard-examples landing, etc.)
   - `writer-drop-playbook.md` — **read when a new Writer doc is dropped**
   - `agent-build-gates.md` — short pre-approve checklist
4. Read or initialize `state.json`

**Hard stops:** No build until the writer brief is loaded. Nav and footer are never built — comment placeholders only.

---

## 2. Acquire the Writer brief

> **Full procedure:** [writer-drop-playbook.md](writer-drop-playbook.md) §1–2 (scroll all pages, archetype match, save to `briefs/`).

| Method | How |
|--------|-----|
| **A — Automated extract (preferred)** | `npm run extract:writer -- --url "…" --slug {slug}` → `briefs/{slug}.txt` + auto `validate:brief` |
| **A2 — Chrome MCP** | Agent runs `WRITER_BROWSER_EXTRACT_FN` from `scripts/writer-extract-core.mjs` → then `npm run validate:brief` |
| **B — File or paste** | Read `.txt` / `.md` directly or from pasted content — still run `validate:brief` |
| **C — Nothing yet** | Prompt for URL, file, or paste and wait |

**Hard stop:** Do not run `match-sites` or build until `validate:brief` exits 0.

Extract into `state.json → writer_brief`:

- `page_title`, `page_type`, `product_name`, `target_audience`, `tone`
- `keywords`, `key_messages`, `sections_required` (exclude nav/footer)
- Full raw copy saved to `briefs/{slug}.txt`

**The brief defines everything:** which sections exist, how many repeated blocks (dashboard types, FAQ items, cards), and all visible text.

---

## 3. Phase 0 — Catalog · Parse · Match

### 0-A Load catalog

Copy site metadata from `site-catalog.json` into `state.json → site_scan`. Print site count and readiness.

### 0-B Parse brief

Map writer content to section types: `hero`, `features`, `content-blocks`, `steps`, `faq`, `cta`, etc.

Count repeatable blocks (e.g. 8 dashboard types → 8 `dashboard-wrapper` zigzag rows).

### 0-C Similarity scoring

Run `node z_workflow/scripts/match-sites.mjs` using weights from `match-config.json`:

- Topic match (0–4)
- Page type match (0–2)
- Section structure overlap (0–2)
- Tone (0–1)
- Complexity (0–1)

**Deep-read only the sections you will use** — not every file in the top match. For each `sections_required` entry, read the mapped reference section's HTML + its CSS rules + any JS hook.

Build a **section source map** in `state.json → similarity.source_map`:

```
brief_section → reference folder → BEM class → layout style
```

Print match results and source map. Wait one cycle for user **OVERRIDE** or auto-proceed.

### Structure-first override (critical)

> **Do not clone whole reference pages.** Each build is a fresh composition from the writer's doc.
> Similarity matching picks section patterns and design flavour — not a page to copy wholesale.

Set `similarity.structure_mode: "compose"` in `state.json`.

Use `team-dna.json` + `section-index.json` alternates when a required section type is missing from the top 3 matches.

---

## 4. Phase 1 — Design tokens

Extract tokens from mapped reference sections + source files into `state.json → phase_1.design_tokens`:

- Colors as `--color-*` in `:root`
- Puvi via `var(--zf-primary-*)` — never numeric `font-weight`
- Spacing, radii, transitions from the reference sections used
- One-sentence `team_flavour` summary

---

## 5. Phase 2 — Page blueprint (no code yet)

Write `state.json → phase_2.webpage_blueprint` — a JSON spec per section:

- `source_site` — real folder name (e.g. `Executive-Dashboards`)
- `source_section_id` — reference class (e.g. `dashboard-wrapper`, `faq-section`)
- `repeat_count` — how many times to instantiate (from brief, not reference)
- `layout_style`, `bg_treatment`
- All copy from the brief (zero lorem ipsum)
- `adaptation_notes`: same BEM pattern, brief-driven content and counts

---

## 6. Phase 6 — Production build (structure-first)

Output: `output/{page-slug}/` with exactly three files: `index.html`, `style.css`, `script.js`.

### Mandatory build order

1. **Compose `index.html`** — one section at a time from blueprint:
   - Pull HTML skeleton from mapped reference section
   - Repeat blocks per `repeat_count`
   - Inject all copy from `briefs/{slug}.txt`
2. **Write `style.css`** — only rules for classes on this page:
   - Global typography block at top
   - `:root` from Phase 1 tokens
   - Section CSS extracted from reference (not full-file copy)
   - All 7 breakpoints at bottom
3. **Write `script.js`** — only behaviors present (accordion, slick, tabs, sticky scroll, etc.)
4. **Link** `../../source/zohocustom.css` and `../../source/product.css`
5. **Images** — universal placeholder `https://prezohoweb.zoho.com/` + `<!-- TODO: replace with final asset -->` (see `Rulesbook.md` §2.8)
6. **Nav/footer** — placeholders only:

```html
<!-- ░░ NAV — TEAM TEMPLATE · INSERT HERE ░░ -->
<!-- ░░ FOOTER — TEAM TEMPLATE · INSERT HERE ░░ -->
```

### Adaptation rule

| Keep from reference pattern | Driven by brief |
|----------------------------|-----------------|
| BEM class names and DOM hierarchy | Which sections exist |
| Component shape (card, zigzag row, accordion) | How many repeated blocks |
| Spacing, breakpoints, animation hooks | All visible text |
| JS interaction patterns | Images, hrefs, section ids |

### Dev handoff

The agent delivers **structure**, not a finished production page. Devs:

- Insert nav/footer from team templates
- Replace `https://prezohoweb.zoho.com/` placeholder URLs with final assets
- Polish spacing or one-off design tweaks as needed

### Section gate (per section)

- BEM classes match mapped reference pattern
- Copy only from brief — no invented headings or sections
- Block count matches brief (not reference page)
- Breakpoints: **1240 · 1080 · 991 · 767 · 565 · 480 · 350**

---

## 7. Review, revise, approve

After all three files are written:

1. Run `/review` or checklist in `.cursor/rules/web-pages-frontend.mdc`
2. Open `output/{slug}/index.html` in the browser
3. Print build summary (section mapping, synthesised sections if any)
4. Wait for user:

| Command | Action |
|---------|--------|
| **APPROVE** | Set `state.json → phase_6.approved = true` |
| **REVISE: [issue]** | Fix only named issue, re-write affected file only, increment `phase_6.revise_rounds` |
| **PROMOTE** | Run `npm run promote -- --from-state` **after dev polish** → `agent-reference/` + SITE_AUDIT |

After **APPROVE**, devs polish `output/{slug}/` (nav, footer, assets). Then promote — **not** at APPROVE time:

```bash
npm run promote -- --from-state
```

Promote copies to `Reference-Site/agent-reference/`, fixes CSS paths, and refreshes `site-catalog.json`.

---

## 8. State tracking

Every phase reads/writes `state.json`:

```json
{
  "run_id": "sales-dashboard-examples-2026-06-29",
  "writer_brief": { "...": "..." },
  "similarity": {
    "primary_source": "Executive-Dashboards",
    "structure_mode": "compose",
    "source_map": ["..."]
  },
  "phase_6": {
    "output_path": "output/sales-dashboard-examples/",
    "approved": false,
    "promoted": false,
    "reference_folder": "",
    "revise_rounds": 0
  }
}
```

---

## 9. Maintenance commands

Run **`npm run commands`** for the full cheat sheet. See `z_workflow/MAINTENANCE.md`.

| Command | When |
|---------|------|
| `npm run commands` | Print all maintenance commands |
| `npm run audit` / `SITE_AUDIT` | New reference site added, after promote, major revamp, or stale catalog |
| `npm run match -- --brief "..."` | Validate scoring against a brief |
| `npm run match:validate` | Run validation set (≥90% accuracy) |
| `npm run promote -- --from-state` | After APPROVE — copy output to reference library + audit |
| `npm run promote -- --slug <slug>` | Promote a specific output folder |
| `node z_workflow/scripts/site-audit.mjs` | Same as `npm run audit` |
| `node z_workflow/scripts/match-sites.mjs` | Same as `npm run match` |
| `npm run organize` | Move stray root reference folders → `Reference-Site/` |

---

## 10. Reference example — sales-dashboard-examples

**Composed from:** `Executive-Dashboards` section patterns (not a full-page clone)  
**Output:** `output/sales-dashboard-examples/`

What correct structure-first output looks like:

- `banner-section` hero — split text + image
- `dashboard-wrapper` — 8 zigzag blocks (brief count), not reference page count
- `pre-banner-section` — CTA bands (×2 as brief requires)
- `box-icon-section` — 6 CRM cards from brief
- `steps-section` — 4 tabbed steps from brief
- `faq-section` — 5 accordion items from brief
- CSS contains only rules for classes on this page
- JS trimmed to page behaviors only
- Nav/footer = comment placeholders

---

## Anti-patterns (do not do these)

- Copying entire reference `style.css` or `script.js`
- Cloning a whole reference `index.html` and swapping copy
- Using `output/*` pages as clone templates
- Keeping reference sections not in the writer's doc
- Inventing section class names when `section-index.json` has a pattern
- Building nav or footer code
- Copying `zohocustom.css` or `product.css` into the page folder

---

*Cursor quick-start · Structure-first enforced via .cursor/rules/structure-first-pipeline.mdc*
