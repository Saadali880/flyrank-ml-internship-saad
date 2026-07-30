# Still Ugly List

Honest, known-rough list for the live portfolio at
https://saadali880.github.io/flyrank-ml-internship-saad/portfolio/

1. **The "About" photo is not actually me.** It's a stock/AI-generated corporate
   headshot that was flagged as a placeholder back in `week 03/Task 03/curated_images.md`
   ("templated placeholder... to be swapped with Saad's final camera capture") and never
   swapped out. This is the single biggest honesty problem on the site right now — it
   directly contradicts the portfolio's own "empirical transparency" pitch. Needs a real
   photo before this is anything more than a draft.
2. **"Growth Plan" nav/footer link opens raw Markdown**, not a styled page
   (`next_case_study.md` served as-is by GitHub Pages). It's technically reachable
   (200 status) but looks broken/unfinished to a visitor.
3. **The "Personal Agent" is a scripted client-side chatbot**, not a real LLM. The UI
   implies more autonomy than exists — trace log entries are canned, not generated. Fine
   as a demo of interaction design, but the framing ("autonomous loop") oversells it.
4. **`hero_bg.png` is a ~745KB unoptimized JPEG** doing background-texture duty at 8%
   opacity. Nobody needs to download three-quarters of a megabyte for a texture that
   subtle — hasn't been compressed or resized yet.
5. **No real backend behind the contact flow.** "Email Me" is a plain `mailto:` link,
   not a form with validation or a lead-capture flow like the original content map
   envisioned ("API Sandbox Access Form"). Fine for an ugly version, but a visitor
   clicking it just opens their mail client.
6. **Never tested on an actual phone**, only checked responsive CSS breakpoints in the
   code. The `.about-card` stacks under 600px in theory; hasn't been confirmed on a real
   device.
7. **The interactive scorer's "model" is a hardcoded heuristic in `app.js`**, not a
   served model artifact — the site can't actually run the trained Random Forest from
   the notebooks. The numbers shown (14ms, 0.747 AUC) are pulled from evaluation runs,
   but the live demo itself doesn't call any real inference.
8. **Single-page anchor nav, not literal separate pages.** The original 3-page sitemap
   (Landing / Playground / Action) was a planning-time framing; what actually shipped is
   one long scrolling page with anchor links. Works fine, just isn't what the sitemap
   doc literally describes.
