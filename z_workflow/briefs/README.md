# Writer briefs

**Empty by default.** A `{slug}.txt` file appears here only after a **successful Chrome MCP extraction** from the Writer URL in the current session.

## Extraction — Chrome MCP only

```
1. navigate_page / new_page  →  {writer-doc-link}
2. If URL is Zoho Accounts / sign-in  →  STOP. Ask user to sign in in the MCP browser, then retry.
3. evaluate_script  →  WRITER_BROWSER_EXTRACT_FN  (z_workflow/scripts/writer-extract-core.mjs)
4. Save  →  z_workflow/briefs/{slug}.txt
5. npm run validate:brief -- --file z_workflow/briefs/{slug}.txt   (must exit 0)
```

## Hard stops (agent must obey)

| Do not | Why |
|--------|-----|
| Use an existing `briefs/*.txt` without extracting the user's URL in this session | Stale or wrong doc |
| Fall back to Puppeteer, paste, or file upload | User test flow is MCP-only |
| Run `match-sites` or build when extraction failed or login wall is up | No valid brief |
| Invent copy | Writer doc is the only content source |

## After a fresh brief is saved

1. Match archetype in `section-composites.json`
2. `node z_workflow/scripts/match-sites.mjs --brief-file z_workflow/briefs/{slug}.txt`
3. Build per [cursor-build-workflow.md](../cursor-build-workflow.md)

Optional `.validation.json` / `.extract.json` sidecars may be written by scripts after extraction.
