# Maintenance Commands

Quick reference for keeping the Web Page Builder workflow accurate.

Run **`npm run commands`** (or `node z_workflow/scripts/list-commands.mjs`) anytime to print this cheat sheet in the terminal.

---

## Workflow after APPROVE

| Step | Who | Action | SITE_AUDIT? |
|------|-----|--------|-------------|
| 1 | Agent | Builds `output/{page-slug}/` (scaffold) | No |
| 2 | Reviewer | Browser review → **APPROVE** (`phase_6.approved: true`) | No |
| 3 | Devs | Nav, footer, final images in `output/{slug}/` | No |
| 4 | Anyone | **`npm run promote`** → `Reference-Site/agent-reference/` | **Yes** (auto) |

### APPROVE vs promote — which runs SITE_AUDIT?

| Timing | Good for | SITE_AUDIT? |
|--------|----------|-------------|
| **At APPROVE** | Sign-off on structure and copy only | ❌ Not recommended |
| **After dev polish + promote** | Catalog reflects real production pages | ✅ **Recommended** |

**APPROVE** = “scaffold is correct.”  
**Promote** = “dev finished polish; add to reference library and refresh catalog.”

Promote always runs SITE_AUDIT unless you pass `--no-audit`.

---

## All commands

Run from the **project root** (`Web-pages/`).

### List commands (cheat sheet)

```bash
npm run commands
```

```bash
node z_workflow/scripts/list-commands.mjs
```

---

### SITE_AUDIT — refresh catalog and indexes

Rescans **`Reference-Site/`** (legacy pages) and **`Reference-Site/agent-reference/`** (promoted agent pages). Does not scan `output/`.

- `z_workflow/site-catalog.json`
- `z_workflow/section-index.json`
- `z_workflow/team-dna.json`
- `z_workflow/audit-report.txt`

**When to run:**

- After promoting an approved page
- After manually adding a new reference folder
- After a major revamp to an existing reference page
- Monthly hygiene

```bash
npm run audit
```

```bash
node z_workflow/scripts/site-audit.mjs
```

Alias in Cursor chat: **`SITE_AUDIT`**

---

### MATCH — test similarity scoring

Score a brief string against the catalog (Phase 0-C):

```bash
npm run match -- --brief "sales dashboard examples executive"
```

```bash
node z_workflow/scripts/match-sites.mjs --brief "cloud analytics comparison"
```

Validate auto-match accuracy (≥90% on test set):

```bash
npm run match:validate
```

```bash
node z_workflow/scripts/match-sites.mjs --validate
```

---

### PROMOTE — approved output → reference library

Copies `output/{slug}/` to **`Reference-Site/agent-reference/{folder}/`**, fixes CSS paths (`../../../source/`), updates registry + `state.json`, then runs SITE_AUDIT.

**Run after dev polish** (nav, footer, assets) — not at APPROVE time.

**From current approved build in state.json:**

```bash
npm run promote -- --from-state
```

```bash
node z_workflow/scripts/promote-output.mjs --from-state
```

**Specific slug:**

```bash
npm run promote -- --slug cloud-analytics-tools
```

**Preview only (no copy):**

```bash
npm run promote -- --slug cloud-analytics-tools --dry-run
```

**Custom folder name:**

```bash
npm run promote -- --slug cloud-analytics-tools --folder "Cloud Analytics Tools"
```

**Overwrite existing reference folder:**

```bash
npm run promote -- --slug my-page --force
```

**Skip audit (copy only):**

```bash
npm run promote -- --slug my-page --no-audit
```

---

### ORGANIZE — move stray reference folders into Reference-Site/

If reference folders appear at the project root again, run:

```bash
npm run organize
```

```bash
node z_workflow/scripts/organize-reference-sites.mjs --dry-run
```

---

## Folder layout

```
Web-pages/
├── source/                    Shared CSS — link only, never copy into pages
├── Reference-Site/            All reference pages
│   ├── AgenticAI/             Legacy team pages (root level)
│   ├── BI Finance/
│   └── agent-reference/       Agent builds after dev polish (promote target)
│       └── {Page-Name}/
├── output/                    Agent scaffolds (before polish)
│   └── {page-slug}/
└── z_workflow/
    ├── site-catalog.json      Cached metadata — read every build
    ├── section-index.json     Section type → best reference
    ├── team-dna.json          Team tokens + synthesis threshold
    ├── state.json             Live session (brief, match, approval, promote)
    ├── briefs/                Writer document copies per slug
    ├── promoted/              Registry: which output slugs became reference sites
    ├── scripts/
    └── MAINTENANCE.md         This file
```

### What goes where

| Location | Purpose | In site-catalog? |
|----------|---------|------------------|
| `output/{slug}/` | Dev handoff scaffold from agent | No |
| `Reference-Site/{name}/` | Legacy team reference pages | Yes |
| `Reference-Site/agent-reference/{name}/` | Dev-polished agent pages | Yes (after promote) |
| `z_workflow/briefs/` | Source copy for builds | No |
| `z_workflow/promoted/` | Audit trail of promotions | No |

---

## Requirements

- **Node.js 18+** (uses native `import` / ES modules)
- No `npm install` required — scripts use only Node built-ins

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `not approved in state.json` | Set `phase_6.approved: true` or use `--force` |
| `Reference folder already exists` | Use `--folder "Other-Name"` or `--force` |
| Promoted page not in catalog | Run `npm run audit` manually |
| Wrong CSS paths after promote | Promote sets `../../../source/` for agent-reference depth |
