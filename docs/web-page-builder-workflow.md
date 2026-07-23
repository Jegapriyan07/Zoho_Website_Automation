# Zoho Web Page Builder — Working Flowchart

Analytics · Writer / DOCX → compose → inject → validate → review

```mermaid
flowchart TD
    A[Sign in with Zoho] --> B[New build]
    B --> C{Input type?}

    C -->|Writer URL| D[Phase 0: Writer API extract]
    C -->|DOCX upload| E[Phase 0: extract-docx in-process]

    D --> F{OAuth / Writer API OK?}
    F -->|No| G[HARD STOP: Sign in with Zoho]
    F -->|Yes| H[Brief saved to briefs/slug.txt]
    E --> H

    H --> I{Confidential markers?}
    I -->|Yes| J[HARD STOP: confidential_content]
    I -->|No| K[Finalize unique page slug]

    K --> L[validate:brief]
    L --> M{Brief valid?}
    M -->|No| N[HARD STOP: validate_brief_failed]
    M -->|Yes| O[match-sites + detect archetype]

    O --> P[Seed state.json: compose mode · end_banner · build_options]
    P --> Q[Optional: inject TEMPLATE DIRECTIVE into brief]
    Q --> R[Agent COMPOSER_CMD: Phase 1 tokens · Phase 2 blueprint · Phase 6 HTML/CSS/JS]

    R --> S{COMPOSER_CMD OK?}
    S -->|No| T[HARD STOP: manual_compose_required / compose_failed]
    S -->|Yes| U{Report Slider ON?}

    U -->|Yes| V[Inject report-slider shell]
    U -->|No| W[Auto-fix output archetype]
    V --> W

    W --> X[validate:output]
    X --> Y{Pass?}
    Y -->|No| Z[One auto-revise compose]
    Z --> AA[Re-apply Report Slider if ON]
    AA --> X2[validate:output again]
    X2 --> Y2{Pass?}
    Y2 -->|No| AB[HARD STOP: validate_output_failed]
    Y2 -->|Yes| AC{Trusted Brands ON?}
    Y -->|Yes| AC

    AC -->|Yes| AD[Inject Trusted Brands after hero]
    AC -->|No| AE[Awaiting review · open preview]
    AD --> AE

    AE --> AF{User action}
    AF -->|Edit files| AE
    AF -->|Download ZIP| AG[ZIP: page + source CSS]
    AF -->|Revise general/section| R
    AF -->|Accept| AH[Approved · phase_6.approved]
    AH --> AI[Later: dev polish + promote — outside tool]
```

## Files

| File | Use |
|------|-----|
| `web-page-builder-workflow.mmd` | Raw Mermaid — import into Mermaid Live, draw.io, Notion |
| `web-page-builder-workflow.html` | Open in browser → **Print / Save as PDF** |
| `web-page-builder-workflow.md` | Paste into GitHub / Notion / Confluence (Mermaid support) |
