# README — Zoho Web Page Builder Agent

## Single entry point · Drop a Writer link → autonomous compose build → auto-open in browser

**Trigger:**

```
{writer-doc-link}
read readme.md and start
```

The agent reads this file, pulls the Writer brief through the Chrome MCP, composes the
page section-by-section from real team section patterns, writes three files to
`output/{page-slug}/`, and opens the result in the browser — all without stopping.

---

## What this system does (compose, never clone)

For **each section the brief requires**, the agent pulls the **real HTML skeleton** of the
best-matching section pattern from one of two template sources, injects the brief's copy,
and stitches the sections together. It **never clones a whole page**.

| Template source | What it is | How the agent reads it |
|-----------------|-----------|------------------------|
| `Reference-Site/{page}/` | Team-built pages on disk (legacy + `agent-reference/`) | Read local `index.html` / `style.css` / `script.js` |
| `webtemplate/sitemap-categorized.json` | 630 live Zoho page links across 22 categories — each entry has **`sections[]`** with order, type, BEM class, layout (e.g. split left/right, zigzag) | **Read descriptions to pick the right page**, then fetch **one section** via Chrome MCP |

Different sections may come from different sources — e.g. hero from a `Reference-Site`
page, comparison table from a live `webtemplate` link. The writer's document is the **only**
source of copy, section list, and block counts.

**This is the compose workflow enforced by `.cursor/rules/structure-first-pipeline.mdc`.**
Full phase detail: [`z_workflow/cursor-build-workflow.md`](z_workflow/cursor-build-workflow.md).

---

## AGENT — startup sequence (run in order, no permission needed)

```
STEP 1  Read z_workflow/Rulesbook.md in full — coding law for every line
STEP 2  Read source/zohocustom.css + source/product.css — Puvi fonts, spacing, utilities
STEP 3  Load cached indexes (do NOT full-scan folders):
          z_workflow/section-index.json       section type → best Reference-Site + BEM class
          z_workflow/site-catalog.json         reference site metadata
          z_workflow/team-dna.json             team tokens + synthesis threshold
          z_workflow/section-composites.json   multi-section archetypes
          webtemplate/sitemap-categorized.json live template links per category (webtemplate source)
STEP 4  Read z_workflow/writer-drop-playbook.md + z_workflow/agent-build-gates.md
STEP 5  Read or initialize z_workflow/state.json
STEP 6  Acquire the Writer brief (see below), then follow cursor-build-workflow.md
        Phases 0 → 1 → 2 → 6 → auto-open browser
```

---

## Acquire the Writer brief — Chrome MCP only (hard stop on login)

**The only allowed method:** extract live from the Writer URL via **Chrome MCP** in this session.

```
1. new_page or navigate_page  { url: "<writer-doc-link>" }
2. Check page title / URL:
     - If Zoho Accounts / sign-in  →  STOP. Tell the user:
       "Sign in to Zoho in the browser tab, then say continue."
       Do NOT match, build, or use any file on disk.
     - If Writer editor loads  →  continue.
3. evaluate_script  { function: WRITER_BROWSER_EXTRACT_FN }
      (body in z_workflow/scripts/writer-extract-core.mjs — scrolls every .zw-page)
4. Save merged text  →  z_workflow/briefs/{slug}.txt
5. npm run validate:brief -- --file z_workflow/briefs/{slug}.txt   (must exit 0)
6. Only then  →  Phases 0, 1, 2, 6
```

### Forbidden (do not use as fallback)

| Forbidden | Reason |
|-----------|--------|
| Reading `briefs/*.txt` left from a previous session | Stale — user is testing from scratch |
| Puppeteer `npm run extract:writer` | Not the test path; MCP only |
| Pasted text / uploaded file | Not the test path; MCP only |
| Building when login wall or empty extraction | No valid brief |

**Hard stop:** do not run `match-sites`, fetch webtemplate sections, or write `output/` until step 5 passes on a brief extracted **in this session** from the user's Writer URL.

---

## Fetch a webtemplate section via Chrome MCP

When a required section's best pattern is a `webtemplate` link (not on disk in
`Reference-Site/`):

```
1. new_page      { url: "<template url from sitemap-categorized.json>", background: true }
2. evaluate_script { function: () => { /* return outerHTML + computed styles of the
                     target section only */ } }
3. Reuse that section's DOM shape + BEM classes; inject brief copy; adapt to team tokens.
```

Extract **one section's structure** — never the whole page, never inline the site's full CSS/JS.
See `.cursor/rules/structure-first-pipeline.mdc` and `cursor-build-workflow.md` §6.

---

## Auto-open the output in the browser (mandatory final step)

After `index.html` · `style.css` · `script.js` are written to `output/{slug}/`:

```
new_page { url: "file:///<abs-repo-path>/output/{slug}/index.html" }
```

(or `navigate_page { type: "url", url: "file://…" }` in the current tab). Then take a
screenshot / snapshot for the build summary. This runs on every completed build.

---

## Autonomy rules

```
RULE 1  No permission prompts during Phases 0, 1, 2, 6 — read, match, fetch, write freely.
RULE 2  Writer brief: Chrome MCP extraction from the user's URL in THIS session only.
        Login wall (accounts.zoho) → STOP, ask user to sign in, retry. Never use stale briefs/*.txt.
        Also stop on CONFIDENTIAL CONTENT in the Writer doc
        (internal metrics, unreleased products, private customer data, contract terms).
        → stop, describe it, ask to confirm or replace.
RULE 3  After the build summary, the only expected human input is APPROVE / REVISE.
RULE 4  Do not over-fetch: fetch a webtemplate URL only when that section is actually
        sourced from webtemplate. Never fetch all 630 links. Never loop-fetch.
RULE 5  Compose only — reuse section structure, never clone a whole page or copy a
        reference page's full style.css / script.js.
```

---

## Project structure

```
Web-pages/
├── README.md                         ← YOU ARE HERE · single entry point
├── source/                           ← READ ONLY · zohocustom.css · product.css
├── Reference-Site/                   ← team pages — section-pattern source (on disk)
│   ├── {legacy pages}/
│   └── agent-reference/{promoted}/
├── webtemplate/
│   └── sitemap-categorized.json      ← 630 live template links — MCP-fetched section source
├── z_workflow/
│   ├── Rulesbook.md                  ← coding law
│   ├── cursor-build-workflow.md      ← phase-by-phase compose workflow
│   ├── writer-drop-playbook.md       ← Writer extraction + archetype + section order
│   ├── agent-build-gates.md          ← pre-approve checklist
│   ├── section-index.json · site-catalog.json · team-dna.json · section-composites.json
│   ├── briefs/{slug}.txt             ← extracted Writer copy
│   ├── state.json                    ← live session state (read/write each phase)
│   └── scripts/                      ← extract, validate, match, promote, audit
└── output/{page-slug}/               ← empty until a build completes (auto-opened in browser)
```

---

## What the agent delivers

| File | Contents |
|------|----------|
| `output/{slug}/index.html` | Composed sections (real BEM patterns), nav/footer = comment placeholders only |
| `output/{slug}/style.css` | Puvi `@font-face`, `:root` tokens, only classes used on this page, all 7 breakpoints |
| `output/{slug}/script.js` | Only behaviors present (accordion / slick / tabs / scroll reveal / sticky) |

Links `../../source/zohocustom.css` + `../../source/product.css`. Placeholder assets use
`https://prezohoweb.zoho.com/` + `<!-- TODO: replace with final asset -->`. Nav and footer
are never built — the team inserts them from shared templates.

---

*README v7.0 · Compose from Reference-Site + webtemplate (Chrome MCP) · Autonomous · Auto-open browser · Rulesbook.md is law*
