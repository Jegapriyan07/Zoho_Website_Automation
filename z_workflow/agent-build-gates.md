# Agent build gates — avoid missed brief details

**Read [writer-drop-playbook.md](writer-drop-playbook.md) first when a new Writer doc is dropped.**

This file is the short checklist. The playbook has full section patterns and reference folders.

---

## 1. Writer brief extraction (Phase 0-B)

| Gate | Requirement |
|------|-------------|
| **extract-writer** | `npm run extract:writer -- --url … --slug …` OR Chrome MCP + `writer-extract-core.mjs` |
| **validate-brief** | `npm run validate:brief -- --file z_workflow/briefs/{slug}.txt` — **exit 0 before build** |
| **All pages** | Extract script scrolls editor + every `.zw-page` (not only `innerText` once) |
| **Page count** | Writer footer `Page X of N` — per-page lengths in `{slug}.extract.json` |
| **Char count** | Merged length ≥ 90% of footer `Chars:` — not sufficient alone |
| **Required strings** | Per `section-composites.json` archetype (steps, testimonials, Dresner, …) |
| **CTA audit** | Every brief CTA → visible `<a class="cta-btn act-btn">` in output |
| **Composite** | Match `section-composites.json` — do not skip recognition/testimonials/how-it-works |
| **Save** | `z_workflow/briefs/{slug}.txt` before matching |

---

## 2. CTA visibility + brand red (Phase 6 — critical)

`zohocustom.css` hides `.act-btn.cta-btn` until team nav loads. **Always override in page CSS.**

**Brand CTA red is theme-independent** — see `Rulesbook.md` §2.2.1. Page theme colours must not tint buttons or the testimonials link.

```css
:root {
    --color-brand-cta: #e42527;
    --primary-btn-color: #e42527;
}

.page-container .cta-btn.act-btn {
    display: inline-block;
    visibility: visible;
    opacity: 1;
    background: var(--primary-btn-color);
    color: #fff;
}

.testimonials-section .content-wrap a {
    color: var(--primary-btn-color);
}

.testimonials-section .content-wrap a .arrow {
    border-color: var(--primary-btn-color);
}
```

Gold standard: `output/client-dashboard-software/style.css`

---

## 2b. Testimonial card palette (Phase 6 — automation)

**Do not theme-tint** `.zwc-nav-box` from `--color-primary` or vertical palette.

Fixed extracted values — copy from `Rulesbook.md` §2.2.2 · `team-dna.json`:

```css
--testimonial-peach-bg: #FFF4E8;
--testimonial-peach-border: #F0DCC8;
--testimonial-mint-bg: #EEF8F4;
--testimonial-mint-border: #C8E8D8;
--testimonial-blue-bg: #EEF4FC;
--testimonial-blue-border: #D4E4F5;
```

Inner quote boxes: `rgba(240,220,200,0.45)` · `rgba(200,232,216,0.45)` · `rgba(212,228,245,0.45)` — never cyan/violet/teal tints.

Gold standard: `output/financial-dashboard-examples/style.css`

---

## 3. Dashboard-examples landing order

See [section-composites.json](section-composites.json) → `dashboard-examples-landing`

**Order:** hero → sticky-stack types (`sticky-card-section`) → one-click CTA → integrations → **recognition** → **testimonials** → steps → closing CTA → FAQ

> Finance gold standard (`output/financial-dashboard-examples`) uses **BI Finance** `scroll-card` stacking — sales variant still uses zigzag `dashboard-wrapper`.

**References:** recognition + testimonials → **BI-Marketing** (not partial PowerBI pattern)

---

## 4. Before APPROVE

1. Grep output for every CTA string from brief + `See all testimonials`
2. Open in browser — buttons must be **visible**, not just in DOM
3. Section count vs composite / `source_map`
4. Checklist in `.cursor/rules/web-pages-frontend.mdc`

---

*See [writer-drop-playbook.md](writer-drop-playbook.md) for HTML skeletons and per-section rules.*
