# z_workflow

Workflow assets for the Zoho Web Page Builder agent.

> **Entry point moved.** Start every build from the repo-root [`README.md`](../README.md):
>
> ```
> {writer-doc-link}
> read readme.md and start
> ```
>
> Phase-by-phase detail lives in [`cursor-build-workflow.md`](cursor-build-workflow.md)
> (compose from `Reference-Site/` + `webtemplate/` via Chrome MCP — never clone a whole page).
>
> **Writer brief:** Chrome MCP extraction only. Login wall → stop and ask user to sign in — never use cached `briefs/*.txt`.

## Files

| File / folder | Purpose |
|---------------|---------|
| `cursor-build-workflow.md` | Phase-by-phase compose workflow (phases, state, approval) |
| `Rulesbook.md` | Permanent coding law — fonts, BEM, breakpoints, CTA visibility |
| `writer-drop-playbook.md` | New Writer drop — extraction, archetypes, section order, pre-approve checks |
| `agent-build-gates.md` | Short pre-approve checklist |
| `section-index.json` | Section type → best `Reference-Site` folder + BEM class + alternates |
| `section-composites.json` | Multi-section archetypes (dashboard-examples, agency landings) |
| `site-catalog.json` | Metadata per reference site |
| `team-dna.json` | Aggregated tokens + synthesis threshold |
| `state.json` | Current build session (read/write each phase) |
| `briefs/{slug}.txt` | **Empty until Chrome MCP extracts** the current session's Writer URL |
| `scripts/` | extract-writer · validate-brief · match-sites · promote · audit · list-commands |

## Maintenance

```bash
npm run commands    # print full command cheat sheet
npm run audit       # refresh site-catalog.json
npm run promote -- --from-state   # after APPROVE + dev polish
```

Full docs: [`MAINTENANCE.md`](MAINTENANCE.md) · Folder map: [`../FOLDER-STRUCTURE.md`](../FOLDER-STRUCTURE.md)
