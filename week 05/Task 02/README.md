# Week 5, Task 02 — Ship the Ugly Version

**Live URL:** https://saadali880.github.io/flyrank-ml-internship-saad/portfolio/
(Research paper landing page it links out from: https://saadali880.github.io/flyrank-ml-internship-saad/)

## What changed this task

The portfolio site (`docs/portfolio/`) already existed from earlier weeks — an interactive
ML content scorer, a scripted "personal agent" chat console, and a Model Specs section —
but three planned pieces from the original sitemap (`week 03/Task 04/portfolio_map.md`,
`week 04/Task 02/content_map.md`) had never actually been assembled into the live page:

1. **About & Contact section** — Page 3 of the sitemap (bio, photo, contact CTA) didn't
   exist on the site at all. Added it: bio text, "Email Me" (mailto), "View GitHub Repo".
2. **Evidence charts** — `top_feature_importance.svg`, `top_reason_codes.svg`, and
   `action_mix.svg` were real exports from `scripts/04_evaluate_and_export.py`, curated
   back in `week 03/Task 03/keepers/`, but never embedded on the live page. The Model
   Specs section only showed the numbers as text. Added the actual chart images.
3. **Favicon + hero texture** — `favicon.png` and `hero_bg.png` were curated and rejected
   against alternatives in `week 03/Task 03/curated_images.md` but never wired in. Both
   now load on the live page.

All five real image assets now live in `docs/portfolio/assets/` and are committed —
copied from `week 03/Task 03/keepers/`, not regenerated.

## Sitemap reachability check

| Page | URL | Status |
|---|---|---|
| Research paper (capstone) | `/` | 200, live |
| Interactive portfolio (scorer, agent, specs, evidence charts, about) | `/portfolio/` | 200, live, all sections confirmed rendering |
| Growth plan / next case study | `/portfolio/next_case_study.md` | 200, reachable — but renders as raw Markdown, not a styled page (see still-ugly list) |

Verified via direct `curl` against the live GitHub Pages URL after the Pages build
finished (not just locally) — all six new asset files return 200, all three sitemap
pages return 200, no console errors on load, all `<img>` tags report `complete: true`.

## Explaining the code

- Static site, no build step: `index.html` + `styles.css` + `app.js`, deployed via
  GitHub Pages from the `docs/` folder on `main`.
- Single-page layout with anchor-based nav (`#playground`, `#agent-section`, `#specs`,
  `#about`) rather than separate HTML files per sitemap page — a deliberate earlier
  decision (see `week 04/Task 03/rationale.md`), not something added this task.
- The "Personal Agent" chat is a **scripted, client-side simulation** in `app.js`
  (keyword-matched canned responses + a fake trace log), not a real LLM call. This is
  worth being able to explain out loud if anyone asks — it demonstrates UI/interaction
  design, not an actual agent integration.
- New CSS added this task (`.hero-bg-image`, `.about-card`, `.about-photo`,
  `.about-body`, `.about-actions`) reuses the existing design tokens
  (`--accent`, `--card-bg`, `--card-border`, etc.) already defined in `styles.css`
  rather than introducing new colors or fonts.

## Still open

See [still_ugly.md](./still_ugly.md).

## Real-person feedback

See [feedback_request.md](./feedback_request.md) — **this step has not happened yet**.
It needs you to actually send the live link to one real person in your target field and
record what they said; I can't fabricate that. The file has the message template and a
place to fill in their reaction once you have it.
