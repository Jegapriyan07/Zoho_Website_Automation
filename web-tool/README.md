# Zoho Web Page Builder — Web Tool

An internal web app that wraps the **existing** structure-first pipeline
(`z_workflow/AGENT-PROJECT-WORKFLOW.md`) in an authenticated UI. A Zoho-authenticated
employee pastes a **Writer document URL**, watches the pipeline run **live**
(Phase 0 → 1 → 2 → 6), gets the generated page auto-opened in a new tab, and can
**Accept** or **Revise** — every run persisted as a chat-style history thread.

> This tool is a **UI + orchestration layer only**. It does not reimplement brief
> extraction, matching, validation, or page composition — it shells out to the
> real `z_workflow/scripts` and drives the real agent for composition.

## Architecture

```
Browser SPA (public/)
   │  Zoho OAuth login · New build · Live console (SSE) · Review bar · History
   ▼
Express server (server/)
   ├── auth-zoho.js     Zoho OAuth2 auth-code flow, encrypted tokens, sessions
   ├── orchestrator.js  Phase state machine → shells out to pipeline scripts
   ├── composer.js      Phase 1/2/6 = agent (LLM) work → external COMPOSER_CMD
   ├── store.js         Durable JSON datastore (User/Run/RunEvent/Revision/Approval)
   └── sse.js           Live event stream keyed by run_id
   ▼
Existing pipeline (../z_workflow/scripts, ../output, ../Reference-Site …)
```

### What runs deterministically vs. via the agent

| Phase | How the tool runs it |
|-------|----------------------|
| **0** Extract | **Writer OAuth API** (fast, ~5s) → fallback `extract-writer.mjs` (Puppeteer) |
| **0** validate:brief | `scripts/validate-brief.mjs` |
| **0** match | `scripts/match-sites.mjs` |
| **1/2/6** compose | **Agent/LLM** via `COMPOSER_CMD` (no deterministic script exists — the Rulesbook forbids reinventing composition) |
| **Validation** | `scripts/validate-output.mjs` |

If `COMPOSER_CMD` is not set, the run **stops honestly** at a `manual_compose_required`
hard stop with the full build context — it never emits fake/garbage output.

## Setup

```bash
cd web-tool
npm install
cp .env.example .env       # then fill in values
npm start
```

Open http://localhost:4310.

### Environment (`.env`)

- `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` — from https://api-console.zoho.com
  (Server-based Application). Redirect URI: `${APP_BASE_URL}/auth/zoho/callback`.
- `ZOHO_ACCOUNTS_BASE` — your DC (`.com`, `.in`, `.eu`, …).
- `TOKEN_ENC_KEY` — 64 hex chars; encrypts Zoho tokens at rest (AES-256-GCM).
- `SESSION_SECRET` — signs the session cookie.
- `PIPELINE_ROOT` — absolute path to the `Web-pages` repo (auto-detected as `../`).
- `COMPOSER_CMD` — command that composes `output/<slug>/` (e.g. a Cursor CLI agent).

**Local dev without Zoho:** if `ZOHO_CLIENT_ID` is empty and you're on `localhost`,
a **dev login** appears so you can exercise the UI and the deterministic phases.
(Extraction will hit a real Zoho login wall unless the server Chrome profile is
signed in — which is the correct hard-stop behaviour.)

### Writer access (URL builds)

When you **Sign in with Zoho**, the app stores OAuth tokens with Writer API scope.
URL builds download the document via the **Writer REST API** (same speed as DOCX upload)
— no Chrome window, no second login.

If the API is unavailable (dev login, missing scope, external doc), the tool falls back to
Puppeteer with a **persistent Chrome profile** per employee (`data/chrome-profiles/<userId>`).

**One-time re-login:** if you signed in before this update, sign out and sign in again so
OAuth includes `ZohoWriter.documentEditor.ALL`.

Optional browser fallback setup (only needed when API fails):

```bash
cd ..
node z_workflow/scripts/warm-writer-session.mjs --user-data-dir "web-tool/data/chrome-profiles/<userId>"
```

Or click **Connect Writer session** in the New build screen.

## Data model

`data/*.json` — `users`, `runs`, `run_events`, `revisions`, `approvals`
(swap the `store.js` implementation for SQLite/Postgres later; the repository API stays).

## Notes / guarantees

- Phases run in the documented order; hard stops use the workflow vocabulary
  (`login_wall`, `extraction_failed`, `confidential_content`, `validate_brief_failed`,
  `validate_output_failed`) and surface as a non-dismissible red banner.
- **Accept** only sets `phase_6.approved = true`. **Promote is never triggered here** —
  it stays a later, dev-team action.
- Revise re-enters Phase 6 (general or section-scoped) and increments `revise_rounds`.
- Preview pages are served behind auth at `/preview/<slug>/…` (owner-only).
