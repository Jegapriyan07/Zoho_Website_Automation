# Zoho Web Page Builder  
### Intern Project Overview — Analytics Team

**Prepared by:** Project Trainee Intern (4th year)  
**Team:** Analytics  
**Assigned by:** Development team  
**Audience:** Manager / team review  
**Repo:** Web Page Builder (`Web-pages`)

---

## 1. One-line pitch

> Paste a **Zoho Writer** marketing brief → get a **structured, team-standard web page scaffold** (`HTML` + `CSS` + `JS`) ready for Analytics developers to polish and ship.

This project turns a slow, manual “copy a reference page and rewrite content” process into a **guided, repeatable pipeline** that Analytics writers, developers, and Cursor agents can run the same way every time.

---

## 2. Why this project exists

Zoho Analytics ships many marketing / product landing pages. Historically, building each page meant:

| Pain point | Impact |
|------------|--------|
| Writers draft briefs in Zoho Writer | Content is ready — but not in page structure |
| Devs re-open old pages and clone layouts | Easy to copy wrong sections, wrong counts, wrong CSS |
| Brand rules live in people’s heads | Inconsistent fonts, CTAs, breakpoints, BEM |
| No shared “source of truth” for section patterns | Every build reinvents layout decisions |
| Feedback loops are slow | Revise cycles lack a clear Accept / Revise flow |

**Goal given by the team:** build a system from scratch that helps Analytics produce **dev-ready page scaffolds** that follow real team patterns — without cloning whole pages or inventing copy.

---

## 3. Who this supports

| Stakeholder | How they use it |
|-------------|-----------------|
| **Analytics writers / content** | Drop a Writer document URL; the system pulls their brief as the **only** source of copy, sections, and block counts |
| **Analytics frontend / web developers** | Receive `output/{page}/` with correct BEM, placeholders, and TODO flags — they swap assets, wire nav/footer templates, and polish |
| **Cursor / AI agents (team workflow)** | Follow a documented phase pipeline + Rulesbook so builds are consistent across people and sessions |
| **Analytics leadership / process owners** | One standard path: Writer → validate → match → compose → review → approve — auditable via `state.json` and run history |
| **Future interns / new joiners** | Onboarding is the playbooks (`README`, Rulesbook, workflow docs) — not tribal knowledge |

**Explicit non-goals (by design):**

- Not a public customer-facing product  
- Does **not** replace production publish or CMS  
- Does **not** build nav/footer (team templates own those)  
- Does **not** invent marketing copy — Writer brief only  

---

## 4. What was built (the system)

The deliverable is **two layers** that work together:

### A. Structure-first build pipeline (`z_workflow/`)

The “brain” of the project — scripts, indexes, rules, and playbooks:

| Piece | Role |
|-------|------|
| **Writer brief extraction** | Pulls content via **Zoho Writer API** (OAuth) into `briefs/{slug}.txt` |
| **Brief validation** | `validate:brief` — refuse to build on bad / incomplete briefs |
| **Site / section matching** | `match-sites` + `section-index.json` — map each brief section to a real team pattern |
| **Reference library** | `Reference-Site/` + promoted `agent-reference/` — gold patterns on disk |
| **Live template catalog** | `webtemplate/sitemap-categorized.json` (~630 Zoho pages, 22 categories) for section-level matches |
| **Rulesbook + Cursor rules** | Permanent coding law: Puvi fonts, BEM, CTA red, breakpoints, anti-patterns |
| **Compose output** | `output/{slug}/index.html` · `style.css` · `script.js` |
| **Output validation** | `validate:output` before handoff |
| **Promote path** | After approve + polish, promote into the reference library for the next build |

**Core principle:** *compose, never clone.*  
For each section the Writer brief asks for, pull the **section skeleton** (classes + nesting), inject brief copy, and stitch the page — do **not** copy an entire old page and find-replace text.

### B. Internal Web Tool (`web-tool/`)

A Zoho-authenticated UI so the team does not need to live in the terminal:

| Capability | Detail |
|------------|--------|
| **Sign in with Zoho** | OAuth; Writer document access for URL builds |
| **New build** | Paste Writer URL → run Phase 0 → 1 → 2 → 6 |
| **Live console** | SSE stream of pipeline progress |
| **Preview** | Auth-gated preview of generated pages |
| **Accept / Revise** | Human gate after composition; revise re-enters Phase 6 |
| **Run history** | Chat-style threads per build (persisted runs / events / approvals) |

The web tool is an **orchestration + UX layer**. It shells out to the real `z_workflow` scripts and agent composition — it does not fake page generation.

---

## 5. End-to-end product flow (how a build runs)

```text
Writer doc URL
      │
      ▼
┌─────────────────┐
│  Phase 0        │  Extract (Writer API) → validate brief → match sections
└────────┬────────┘
         ▼
┌─────────────────┐
│  Phase 1        │  Design tokens (team DNA / page flavour)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Phase 2        │  Page blueprint (section order + source map)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Phase 6        │  Compose HTML / CSS / JS into output/{slug}/
└────────┬────────┘
         ▼
   Validate + open preview
         │
         ▼
   APPROVE  or  REVISE (loop Phase 6)
         │
         ▼
   Dev handoff → (later) promote polished page into Reference-Site
```

**Hard stops (quality gates):**

- Zoho auth missing / Writer API 401–403 → stop and ask to Sign in  
- Brief validation fails → no build  
- Confidential content in Writer → stop and escalate  
- Output validation fails → fix before approve  

---

## 6. Journey of the project — how it grew from scratch

*Separate timeline for the presentation. This is the story of how the work matured.*

### Stage 0 — Assignment & blank slate

- Joined as a **project trainee intern** (4th year) through **manager referral**  
- Assigned by the **Analytics development** team to own a greenfield problem:  
  **“Help us turn Writer briefs into consistent Analytics web-page scaffolds.”**  
- No finished product existed — only the need, team pages, and Zoho’s existing CSS/source conventions  

### Stage 1 — Understand the craft of Analytics pages

- Studied real team pages under `Reference-Site/` and shared `source/` CSS  
- Captured recurring section types (hero, zigzag, FAQ, steps, testimonials, banners, etc.)  
- Learned that “looking like Zoho Analytics” is not one template — it is **many section patterns** + strict frontend rules  

### Stage 2 — First automation ideas (scripts & docs)

- Built the early workflow assets under `z_workflow/`:  
  - extract / validate / match scripts  
  - session `state.json`  
  - command cheat sheet  
- Documented phase-by-phase behaviour so the process could be repeated by an agent or a human  

### Stage 3 — “Pick a template” → “Compose from sections”

- Early thinking leaned toward picking a whole webtemplate page  
- Team reality and quality issues pushed a better model:  
  **structure-first compose** — map *each* brief section to the best pattern; never clone a full page  
- Added indexes: `section-index.json`, `site-catalog.json`, `team-dna.json`, composites for multi-section page types  
- Catalogued live Zoho pages (`webtemplate`) so missing patterns could be fetched **section-only**  

### Stage 4 — Rules as code (reliability)

- Formalized `Rulesbook.md` + Cursor always-on rules (`.cursor/rules/…`)  
- Encoded anti-patterns the team actually hits (CTA visibility, brand red, TOC behaviour, archetype-specific gold snippets, etc.)  
- Shifted Writer extraction to **Writer API only** (auth-gated) so briefs are trustworthy and not scraped through brittle browser login walls  

### Stage 5 — Web Tool for the team

- Wrapped the pipeline in `web-tool/`: Zoho login, live run console, Accept/Revise, history  
- Made the product usable by people who should not have to memorize npm scripts  
- Kept a clear split: **deterministic scripts** for extract/validate/match · **agent composition** for HTML/CSS/JS  

### Stage 6 — Handoff-ready system (today)

- Single entry: drop Writer link → autonomous compose → preview → Approve / Revise  
- Output is a **dev scaffold**, not a fake “production final” page  
- Gold pages / gold snippets exist so future builds stay aligned with proven Analytics landings  
- Maintenance path: audit, promote, refresh catalogs  

**What this journey shows:** the project did not start as a UI demo — it started as a **process problem**, then became scripts + law, then became a **team product**.

---

## 7. Technical highlights (for a technical manager)

| Area | What was implemented |
|------|----------------------|
| **Auth** | Zoho OAuth2; encrypted tokens at rest; session cookies |
| **Writer integration** | Writer REST download (DOCX) → brief text + extract sidecar |
| **Orchestration** | Phase state machine, SSE live events, durable JSON run store |
| **Matching** | Similarity / section mapping against reference + webtemplate catalogs |
| **Composition model** | Section skeletons + brief injection + page-scoped CSS/JS only |
| **Quality gates** | `validate:brief`, `validate:output`, hard-stop vocabulary |
| **Agent integration** | Cursor Rulesbook + structure-first pipeline so LLM builds stay on-rails |
| **Dev handoff** | Placeholder CDN assets + `<!-- TODO -->`; nav/footer slots left for templates |

---

## 8. Value delivered to Analytics

1. **Faster first draft** — minutes/hours of scaffold instead of days of manual clone-and-edit  
2. **Consistency** — same fonts, BEM, breakpoints, CTA rules every run  
3. **Fewer wrong pages** — brief drives section list and counts; reference pages do not dictate extra sections  
4. **Safer content source** — Writer API + validation; confidential content gate  
5. **Shared memory** — indexes, gold snippets, and promoted references improve over time  
6. **Team-usable product** — Web Tool UI + documented agent workflow, not only a personal script  

---

## 9. What I personally owned as the intern

*(Useful talking points for the manager conversation.)*

- Took a **greenfield** Analytics ask and turned it into a working **pipeline + internal tool**  
- Learned Zoho Analytics frontend conventions deeply enough to encode them as **Rulesbook + gates**  
- Designed for **real users** on the team (writers + devs), not only for a demo  
- Separated concerns correctly: UI orchestration vs. composition vs. validation  
- Iterated when the first approach (whole-page template pick) was weaker than **section compose**  
- Documented the system so the team can run and extend it after the internship  

---

## 10. Current status & honest next steps

**Today**

- Pipeline phases 0 → 1 → 2 → 6 are defined and runnable  
- Web Tool supports Zoho login, Writer URL builds, live progress, Accept/Revise, history  
- Output lands in `output/{slug}/` for browser review and developer handoff  

**Natural next steps (if the team continues investment)**

- Stronger production store (SQLite/Postgres instead of JSON files)  
- Tighter `COMPOSER_CMD` / agent packaging for one-click team installs  
- Expand gold snippets + section-index coverage for more page archetypes  
- Deeper integration with Analytics publish / CMS workflows (post-scaffold)  

---

## 11. Closing line for the presentation

I joined Analytics as a project trainee intern through manager referral, and was given a real problem: **make Writer-to-page work reliable for our team**.  

What I built is not a one-off script — it is a **structure-first Web Page Builder** for Zoho Analytics: Writer brief in, team-pattern scaffold out, with validation, review, and a UI the team can actually use.

---

### Appendix — Key folders (quick map)

```text
Web-pages/
├── README.md                 ← Agent / build entry point
├── web-tool/                 ← Zoho-authenticated Web Page Builder UI
├── z_workflow/               ← Pipeline, Rulesbook, scripts, briefs, state
├── Reference-Site/           ← On-disk section pattern library
├── webtemplate/              ← Live Zoho page catalog (~630 links)
├── source/                   ← Shared Zoho CSS (read-only for builds)
└── output/                   ← Generated page scaffolds per slug
```

---

*Document purpose: manager presentation / intern project review · Analytics · Zoho Web Page Builder*
