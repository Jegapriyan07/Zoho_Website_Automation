# README — Zoho Web Page Builder Agent

## Single entry point · Drop a Writer link → autonomous compose build → auto-open in browser

**Trigger:**

```
{writer-doc-link}
read readme.md and start
```

The agent reads this file, pulls the Writer brief through the **Zoho Writer API**, composes the
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

## Acquire the Writer brief — Writer API only (hard stop on auth fail)

**The only allowed method:** Zoho **Writer API** via Web Page Builder Phase 0 (`extractWriterViaApi`).  
**Never** use Chrome MCP or Puppeteer to open/scrape Writer documents.

```
1. Web Page Builder / extractWriterViaApi  { writer URL }
     — OAuth token + GET /writer/api/v1/download/{id}?format=docx
2. Auth gate:
     - No tokens / 401–403  →  STOP. Tell the user:
       "Sign in with Zoho in the Web Page Builder, then retry the build."
       Do NOT open Writer in Chrome MCP.
     - API OK  →  continue.
3. Save  →  z_workflow/briefs/{slug}.txt
   Sidecar  →  briefs/{slug}.extract.json  (extraction_method: "writer_api")
4. npm run validate:brief -- --file z_workflow/briefs/{slug}.txt   (must exit 0)
5. Only then  →  Phases 0 match, 1, 2, 6
```

### Forbidden (do not use as fallback)

| Forbidden | Reason |
|-----------|--------|
| Chrome MCP → Writer URL | User rule: Writer API only |
| Puppeteer `npm run extract:writer` | Browser path — not API |
| Reading stale `briefs/*.txt` without API re-extract | Wrong / old source |
| Pasted text / uploaded file when a Writer URL was given | Bypasses the document |
| Building when API extraction failed | No valid brief |

**Hard stop:** do not run `match-sites`, fetch webtemplate sections, or write `output/` until step 4 passes on a `writer_api` brief.

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
RULE 2  Writer brief: Zoho Writer API only (extraction_method: writer_api).
        Never Chrome MCP / Puppeteer for Writer docs.
        API auth fail → STOP, ask user to Sign in with Zoho in Web Page Builder.
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
