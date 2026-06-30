# agent-reference

**Dev-polished pages** built by the Cursor agent and promoted from `output/`.

Legacy team pages stay in `Reference-Site/` root (AgenticAI, BI Finance, etc.).  
Agent-built pages go here after polish so the catalog stays organized.

## When to promote

| Step | Action | SITE_AUDIT? |
|------|--------|-------------|
| 1 | Agent builds `output/{slug}/` | No |
| 2 | Reviewer **APPROVE** (structure + copy OK) | No |
| 3 | Dev adds nav, footer, final images | No |
| 4 | **`npm run promote -- --from-state`** | **Yes** (automatic) |

**Best practice:** Run promote + audit **after polish**, not at APPROVE.  
The catalog should reflect production-ready pages, not placeholders.

## Path

```
Reference-Site/agent-reference/Cloud-Analytics-Tools/
├── index.html      ← links to ../../../source/
├── style.css
└── script.js
```

## Command

```bash
npm run promote -- --slug cloud-analytics-tools
npm run promote -- --from-state
```

Promote copies from `output/`, fixes CSS paths for this depth, and runs `SITE_AUDIT` so the page appears in `site-catalog.json` with `reference_origin: "agent"`.

## Re-promote after more polish

If dev updates `output/{slug}/` further, run promote again with `--force` to refresh `agent-reference/` and the catalog.
