# Output folder

Agent-generated **dev handoff scaffolds**. Not part of the reference library until promoted.

## Contents

Each subfolder is one build:

```
output/
├── cloud-analytics-tools/
├── sales-dashboard-examples/
├── embedded-analytics-sales/
└── zoho-books-integration/
```

Each contains exactly: `index.html`, `style.css`, `script.js` (optional).

## Lifecycle

1. **Build** — Cursor agent writes here during Phase 6
2. **Review** — Open `index.html` in browser; **APPROVE** or REVISE (no audit yet)
3. **Polish** — Devs replace placeholders, add nav/footer in this folder
4. **Promote** — Moves to `Reference-Site/agent-reference/` and runs SITE_AUDIT:

```bash
npm run promote -- --slug <page-slug>
```

**Best timing:** Promote **after polish**, not at APPROVE.

## Do not

- Use `output/*` as clone templates for new builds (use `section-index.json` + reference folders)
- Expect `output/` to appear in `site-catalog.json` without running **promote**

See `z_workflow/MAINTENANCE.md` for all commands.
