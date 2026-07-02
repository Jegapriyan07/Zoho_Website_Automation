# Writer briefs

One text file per page build. The agent saves extracted copy here during Phase 0.

| File | Page |
|------|------|
| `cloud-analytics-tools.txt` | Cloud analytics comparison guide |
| `sales-dashboard-examples.txt` | Sales dashboard examples landing |
| `embedded-analytics-sales.txt` | Embedded analytics for sales |
| `financial-dashboard-examples.txt` | Finance dashboard examples landing |

Optional `.json` sidecars may exist for structured brief metadata.

**Do not delete** briefs for promoted pages — they document the content source for the build.

---

## Extraction rules (Zoho Writer URL)

**Automated (preferred):**

```bash
npm run extract:writer -- --url "<writer-url>" --slug <page-slug>
npm run validate:brief -- --file z_workflow/briefs/<slug>.txt
```

**Manual / Chrome MCP:** use `WRITER_BROWSER_EXTRACT_FN` in `z_workflow/scripts/writer-extract-core.mjs`, then validate.

1. Sign in via `--headed` first run (persistent Chrome profile).
2. Extraction merges per-page text + structured DOM walk (not `innerText` only).
3. **validate-brief must pass** before `match-sites` or build.
4. Save full text here, then follow [writer-drop-playbook.md](../writer-drop-playbook.md).

---

## After brief is saved

1. Match archetype in `section-composites.json`
2. Run `node z_workflow/scripts/match-sites.mjs --brief-file z_workflow/briefs/{slug}.txt`
3. Build per [cursor-build-workflow.md](../cursor-build-workflow.md)
