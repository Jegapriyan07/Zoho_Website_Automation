# Master Prompt — "Zoho Web Page Builder Agent" Tool

> Paste this entire document into your coding agent (Claude Code, Cursor, etc.) as the build brief.
> It wraps the **existing** structure-first Cursor workflow (Phases 0 → 1 → 2 → 6, Chrome MCP,
> Rulesbook, validate scripts) inside a single authenticated web tool for employees.

---

## 0. One-line brief

Build a single internal web app where a Zoho-authenticated employee pastes a **Writer document
URL**, watches the existing agent pipeline run **live** in the browser (Phase 0 → 1 → 2 → 6), gets
the generated page auto-opened in a new tab, and can **Accept** or **Revise** (general or
section-specific) the result — with every run persisted as a **chat-style history** thread.

---

## 1. Source of truth — do not reinvent the pipeline

The tool is a **UI + orchestration layer** over the project that already exists at:

```
Web-pages/
├── z_workflow/
│   ├── AGENT-PROJECT-WORKFLOW.md   ← canonical phase spec (read this first)
│   ├── Rulesbook.md
│   ├── cursor-build-workflow.md
│   ├── section-index.json / site-catalog.json / team-dna.json / section-composites.json
│   ├── state.json
│   ├── briefs/{slug}.txt
│   └── scripts/ (match-sites.mjs, writer-extract-core.mjs, etc.)
├── Reference-Site/
├── webtemplate/sitemap-categorized.json
└── output/{page-slug}/{index.html, style.css, script.js, validation.json}
```

**Do not reimplement** brief extraction, matching, token extraction, blueprinting, or file
composition logic. The web tool must call the **same npm scripts / same phase logic** already
defined in `AGENT-PROJECT-WORKFLOW.md` §5–§9, just triggered from a UI instead of a chat prompt,
and streamed back to the browser instead of printed to a terminal.

Read `AGENT-PROJECT-WORKFLOW.md` in full before writing any backend code. Every phase, gate, and
validation script named there (`validate:brief`, `match`, `validate:output`, `promote`,
`find:webtemplate`) must be invoked exactly as documented, not approximated.

---

## 2. Users & Authentication

- Single audience: internal employees.
- **Hard gate:** the tool is unusable until the user authenticates via **Zoho OAuth (Zoho
  Accounts)**. This mirrors the existing "Login wall → STOP" hard stop in §5.1 of the workflow —
  except here the *tool itself* owns the login, so the agent should never hit a Writer login wall
  once a session exists.
- Use Zoho's standard OAuth2 authorization-code flow:
  1. Redirect to `https://accounts.zoho.com/oauth/v2/auth` with `scope=ZohoWriter.documents.READ`
     (plus whatever scope the extraction script needs), `client_id`, `redirect_uri`,
     `response_type=code`.
  2. Exchange `code` for `access_token` + `refresh_token` at `https://accounts.zoho.com/oauth/v2/token`.
  3. Store tokens server-side (per-user session), refresh silently before expiry.
  4. Every Writer-doc fetch on the backend must be made **with the logged-in user's token** —
     this is what removes the "ask user to sign in" hard stop from the automated flow, since the
     browser/session is already authenticated as that employee.
- Session model: short-lived JWT/session cookie for the app itself; Zoho tokens stored encrypted
  server-side, never exposed to the frontend.

---

## 3. Core user flow (exact sequence)

```
1. Employee logs in with Zoho account.
2. Home screen shows ONE input: "Writer Document URL".
3. Employee pastes the link → clicks "Build".
4. Live Agent Console appears (this session, this run):
     Phase 0  — Acquire brief · Catalog · Match     [streaming log]
     Phase 1  — Design tokens                        [streaming log]
     Phase 2  — Page blueprint                        [streaming log]
     Phase 6  — Production build (3 files written)     [streaming log]
     Validation — validate:output                     [pass/fail]
5. On success: generated output/{slug}/index.html is opened AUTOMATICALLY in a new browser tab.
6. Review bar appears in the tool with two primary actions:
     [ Accept ]                 → marks phase_6.approved = true, ends the run
     [ Revise ▾ ]               → opens two sub-options:
          - "General revise"    → free-text instruction applied to the whole page
          - "Revise specific content" → pick a section (hero / FAQ / testimonials / etc.)
                                         + free-text instruction for just that section
7. Revise re-enters Phase 6 only for the affected file(s)/section(s), re-validates, re-opens the
   updated tab, increments phase_6.revise_rounds, and the console/chat shows the new round.
8. Every step of every run (input, phase logs, decisions, revise instructions, output links,
   accept/reject) is appended to a persistent CHAT-style history for that employee, browsable later.
```

This must match `AGENT-PROJECT-WORKFLOW.md` §2 (mermaid flow) and §10 (Review · Revise · Approve)
one-to-one — the UI is a rendering of that state machine, not a new one.

---

## 4. Screen-by-screen spec

### 4.1 Login screen
- "Sign in with Zoho" button only. No password field of the tool's own.

### 4.2 New Build screen
- One input field: Writer Document URL (validate it's a `writer.zoho.com` URL before submit).
- "Build" button → disabled while a run is in progress.
- Below the input: list of the employee's recent runs (mini chat history preview, most recent
  first), each showing: page title, slug, status (building / awaiting review / approved /
  revising), timestamp.

### 4.3 Live Agent Console (during a run)
- A vertically stacked, timestamped log, one block per phase, matching the phase names in
  `AGENT-PROJECT-WORKFLOW.md` §5–§8:
  - Phase 0: brief extraction progress (page N of N scrolled, char-count check, catalog match
    result — `primary_source`, `archetype`, `source_map` table)
  - Phase 1: design tokens extracted (color swatches + font tokens rendered visually, not just
    JSON)
  - Phase 2: blueprint section order (render the archetype's section list as a simple ordered
    list, e.g. hero → intro → zigzag features → … → FAQ)
  - Phase 6: file-write progress for `index.html`, `style.css`, `script.js`
  - Validation: `validate:output` pass/fail with the actual error list if it fails
- Hard stops must surface as a distinct, non-dismissible red banner in this console, not a silent
  failure: Zoho login wall, failed extraction, confidential content detected, validate:brief /
  validate:output failure — reusing the exact wording/trigger conditions from §3.1 of the workflow.
- No user interaction is possible during Phases 0/1/2/6 (matches "No permission during build" rule)
  — the console is read-only while streaming.

### 4.4 Output handoff
- The moment Phase 6 + validation succeed, the frontend opens
  `file://` (local dev) or a served static route to `output/{slug}/index.html` in a **new browser
  tab** automatically (`window.open`), exactly as §10 step 3 does with Chrome MCP
  `new_page`/`take_screenshot` — but for a real employee this should be a served preview URL
  (e.g. `/preview/{slug}/index.html`) rather than a raw filesystem path.

### 4.5 Review bar
- Persistent bar pinned above/below the console once a run reaches "awaiting review":
  - **Accept** button → single click, confirms, sets `phase_6.approved = true`, run moves to
    "Approved" state, no further action until dev team promotes it later (§10 — "Promote is not
    at APPROVE time").
  - **Revise** button → opens a small panel with two tabs:
    - **General revise**: one free-text box ("What should change across the page?") → on submit,
      re-runs Phase 6 build with that instruction folded in as a `REVISE:` note, per §10 table.
    - **Revise (specific content)**: a dropdown of the sections actually present in this page
      (pulled from `phase_2.webpage_blueprint` / `sections_required`), plus a free-text box scoped
      to that one section → on submit, only the named section/file is rewritten (§10: "Fix only
      named issue · rewrite affected file only").
  - Each revise submission increments `phase_6.revise_rounds` and re-opens the updated tab.

### 4.6 History (Chat) view
- A left-hand sidebar (or separate "History" tab): every run appears as a conversation thread,
  chronological, similar to a chat app's thread list.
- Opening a thread replays it as a chat transcript:
  - Employee message: the Writer URL submitted.
  - Agent messages: each phase's log block (collapsed by default, expandable).
  - Agent message: output link + screenshot thumbnail of the generated page.
  - Employee message: Accept, or Revise + the instruction text, for each round.
  - Final status chip: Approved / Promoted / Abandoned.
- History must be per-employee (scoped to the authenticated Zoho user) and durable across
  sessions.

---

## 5. Backend orchestration requirements

- The backend is a thin orchestrator that shells out to the **existing** npm scripts, in this
  exact order, per run:

  ```bash
  npm run validate:brief -- --file z_workflow/briefs/{slug}.txt
  npm run match -- --brief-file z_workflow/briefs/{slug}.txt
  # Phase 1 + Phase 2 logic as already implemented in the agent scripts
  # Phase 6 file writes (index.html, style.css, script.js)
  npm run validate:output -- --slug {slug}
  ```

- Writer-brief extraction (§5.1) must run **server-side**, using the authenticated employee's
  Zoho session/token, driving the same `WRITER_BROWSER_EXTRACT_FN` logic currently invoked via
  Chrome MCP — headless-browser or Chrome MCP equivalent on the server, saving to
  `z_workflow/briefs/{slug}.txt` exactly as before.
- Every phase's stdout/state must be streamed to the frontend in real time — use Server-Sent
  Events or a WebSocket per run (`run_id`), not polling, so the Live Agent Console feels live.
- `state.json` remains the per-run source of truth (§11) but should additionally be persisted
  into a proper datastore (Postgres/SQLite/etc.) keyed by `run_id` + employee id, so history
  survives restarts and supports the chat-history view.
- Revise actions map to a re-entry into Phase 6 only (§10: "increment `phase_6.revise_rounds`"),
  never a full re-run of Phase 0–2 unless the revise instruction implies a structural/section
  change the current `source_map` can't satisfy — in that edge case, surface it back to the
  employee rather than silently guessing.
- **Promote** (`npm run promote`) is intentionally **not** exposed as a button in this tool at
  Accept time — per §10, promotion happens later by the dev team after nav/footer/asset polish.
  Accept only flips `phase_6.approved`.

---

## 6. Data model (minimum viable)

```
User            { id, zoho_user_id, email, tokens(enc) }
Run             { id, user_id, writer_doc_url, slug, page_title, status,
                  created_at, updated_at }
RunEvent        { id, run_id, phase (0|1|2|6|validation), payload(json),
                  created_at }        -- powers both the live console and the chat replay
Revision        { id, run_id, round, scope (general|section), section_name(nullable),
                  instruction, created_at }
Approval        { id, run_id, approved_by, approved_at }
```

`Run.status` enum: `extracting → matching → tokens → blueprint → building → validating →
awaiting_review → revising → approved → (later, offline) promoted → failed(<reason>)`.

`failed` reasons should reuse the workflow's own hard-stop vocabulary: `login_wall`,
`extraction_failed`, `confidential_content`, `validate_brief_failed`, `validate_output_failed`.

---

## 7. Non-functional requirements

- **Security:** Zoho tokens encrypted at rest; no Writer content or generated output visible to
  any employee other than the run's owner (unless you explicitly want a shared/team history —
  confirm before building).
- **Idempotency:** re-submitting the same Writer URL should either resume the existing run or
  explicitly start a new one — decide and label clearly in the UI ("Start new build" vs "Resume").
- **Observability:** every hard stop and validation failure must be both shown in the console
  *and* recorded as a `RunEvent`, so the history view is a faithful transcript, not just a happy
  path.
- **No silent deviation from the Rulesbook:** the orchestrator must not skip or reorder
  Phases 0/1/2/6, must not build nav/footer, must not use `placehold.co` or local asset
  placeholders — all per §14 Anti-patterns. These are backend guarantees, not just prompt
  suggestions.

---

## 8. Suggested tech stack (adjust to team standard)

- Frontend: React/Next.js, SSE or WebSocket client for the live console, Tailwind for styling.
- Backend: Node/Express (same runtime as the existing `z_workflow/scripts`, so the npm scripts
  can be shelled out to directly without a language bridge).
- Headless browser for Writer extraction: Puppeteer/Playwright driven by the backend, reusing
  `writer-extract-core.mjs`'s exported extraction function rather than duplicating it.
- Datastore: Postgres (or SQLite for a first internal version) for `Run`, `RunEvent`,
  `Revision`, `Approval`.
- Static preview serving: serve `output/{slug}/` behind an authenticated route
  (`/preview/{slug}/index.html`) instead of raw `file://` paths, so "open in new tab" works for
  real employees, not just local Cursor sessions.

---

## 9. Acceptance criteria (definition of done)

- [ ] Employee cannot reach the Build screen without a valid Zoho session.
- [ ] Submitting a Writer URL triggers Phases 0→1→2→6 in the documented order, visible live.
- [ ] Any hard stop (login wall, failed extraction, confidential content, validation failure)
      halts the run and shows a clear, non-dismissible banner — no partial/garbage output shown
      as if it succeeded.
- [ ] On success, the generated page opens automatically in a new tab.
- [ ] Accept and Revise (general + specific-section) both work exactly as in §10 of the workflow,
      including `revise_rounds` incrementing and only the affected file(s) changing.
- [ ] Every run, including all revise rounds, is retrievable afterward as a chat-style thread
      scoped to the employee who ran it.
- [ ] Promote is never triggered automatically by Accept — it remains a separate, later, dev-team
      action.

---

*This master prompt is derived entirely from `AGENT-PROJECT-WORKFLOW.md` (README v7.0 synthesis,
July 2026). Any ambiguity should be resolved by re-reading that document, not by inventing new
phase behavior.*
