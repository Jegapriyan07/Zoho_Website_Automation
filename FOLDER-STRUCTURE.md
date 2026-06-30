# Folder structure

How this repository is organized.

## Layers

| Layer | Path | Role |
|-------|------|------|
| **Shared CSS** | `source/` | `zohocustom.css`, `product.css` — linked from every page |
| **Reference library (legacy)** | `Reference-Site/{name}/` | Team-built pages |
| **Reference library (agent)** | `Reference-Site/agent-reference/{name}/` | Polished agent pages in catalog |
| **Agent output** | `output/{slug}/` | Scaffolds awaiting dev polish and promote |
| **Workflow** | `z_workflow/` | Catalogs, briefs, state, scripts |
| **Tooling** | `.cursor/` | Cursor agent rules and validation |

## Project root (clean layout)

```
Web-pages/
├── source/                 Shared team CSS
├── Reference-Site/
│   ├── AgenticAI/              Legacy pages (43 sites)
│   └── agent-reference/        Promoted agent pages
├── output/                     Scaffolds before polish
│   └── {page-slug}/
├── z_workflow/               Catalogs, briefs, scripts
├── docs/
├── package.json
└── README.md
```

## Reference-Site/

Every finished marketing/product page lives here — **not** at the project root.

```
Reference-Site/
├── AgenticAI/                  legacy
├── BI Finance/
├── Executive-Dashboards/
└── agent-reference/            agent-promoted
    └── Cloud-Analytics-Tools/
```

**Naming:** Mixed conventions exist (spaces, Title-Case, kebab-case). New promoted pages use **Title-Case-With-Hyphens**.

**SITE_AUDIT scans:** All folders under `Reference-Site/` that contain `index.html`.

## Output vs reference

```
Writer brief → Agent → output/my-page/           (scaffold)
                ↓ APPROVE + polish
              npm run promote
                ↓
         Reference-Site/agent-reference/My-Page/
                ↓ npm run audit (via promote)
         site-catalog.json  (reference_origin: "agent")
```

## Skipped directories

Never treated as reference sites:

- `output/`, `z_workflow/`, `source/`, `docs/`, `.cursor/`, `Release-note/`

## z_workflow/

| File / folder | Purpose |
|---------------|---------|
| `site-catalog.json` | Metadata per reference site |
| `section-index.json` | Best reference per section type |
| `team-dna.json` | Aggregated tokens + synthesis threshold |
| `state.json` | Current build session |
| `briefs/` | Writer document text per slug |
| `promoted/` | Registry after promote |
| `scripts/` | audit, match, promote, organize, list-commands |
| `MAINTENANCE.md` | All maintenance commands |

## Maintenance

```bash
npm run commands    # Print command cheat sheet
npm run audit       # Refresh catalog
npm run promote -- --from-state
npm run organize    # Re-run root → Reference-Site migration (if needed)
```

Full docs: `z_workflow/MAINTENANCE.md`
