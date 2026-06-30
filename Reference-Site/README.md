# Reference-Site

All **production reference pages** live here. The agent uses these folders for similarity matching and section patterns.

Each subfolder is one page. **Two tiers:**

| Location | Contents |
|----------|----------|
| Root (`Reference-Site/`) | Legacy team pages — AgenticAI, BI Finance, … |
| `agent-reference/` | Dev-polished agent builds (via promote) |

```
Reference-Site/
├── AgenticAI/
├── BI Finance/
├── Business-Intelligence/
└── agent-reference/
    └── Cloud-Analytics-Tools/
```

Each contains `index.html`, `style.css`, and optionally `script.js`.

## Source CSS

Pages link to shared team CSS (one level up from this folder):

```html
<link rel="stylesheet" href="../../source/zohocustom.css">
<link rel="stylesheet" href="../../source/product.css">
```

Some older pages use local copies of `zohocustom.css` in the folder — do not remove without dev review.

## Adding a page

1. Agent builds → `output/{slug}/`
2. **APPROVE** scaffold (reviewer)
3. Dev polishes nav, footer, assets in `output/{slug}/`
4. **Promote:** `npm run promote -- --slug <page-slug>` → `agent-reference/` + catalog update

Do **not** run SITE_AUDIT at APPROVE — run it via **promote** after polish.

## Maintenance

```bash
npm run audit      # Refresh site-catalog.json after changes
npm run commands   # Full command list
```

See `z_workflow/MAINTENANCE.md`.
