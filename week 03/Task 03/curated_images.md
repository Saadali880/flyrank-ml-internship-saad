# Portfolio Image Curation & Sitemap

*Prepared by Saad Ali — Machine Learning Track*
*Visual Theme: Analytical, Precise Slate/Teal Frame*

---

## 1. Portfolio Content Map & Image Needs

This map outlines the sections of our portfolio and details exactly which images serve each section, along with the source call (Real Capture vs. AI-Generated).

### Page 1: Landing (The Hero & Claim)
* **Goal**: Establish immediate professional credibility, present the one-line value proposition, and draw the viewer's attention to the core machine learning benchmarks.
* **One-Line Claim**: 
  > "I build machine learning models that run on messy, real-world search data and am honest about their performance limits."
* **Image Needs**:
  1. **Brand Favicon / Monogram** (`keepers/favicon.png`): A technical monospace `[S]` monogram that acts as the browser icon.
     * **Call**: **AI-Generated Connective Tissue**. Engineered to match the Geist Mono typeface and corporate identity.
  2. **Hero Background / Texture** (`keepers/hero_bg.png`): A subtle, low-contrast vector grid pattern that adds depth without adding noise.
     * **Call**: **AI-Generated Connective Tissue**. Curated to hold a flat, blueprint-like aesthetic.

### Page 2: Work Proof (Case Study: Content Refresh Pipeline)
* **Goal**: Prove that the ranking model outperforms simple rules on real-world datasets and showcase the actual feature importance weights.
* **Image Needs**:
  1. **Top Feature Importance Chart** (`keepers/top_feature_importance.svg`): SVG bar chart showing the statistical weights of search signals (impressions, clicks, rankings).
     * **Call**: **Real Capture**. Exported directly from the execution of the evaluation pipeline in `scripts/04_evaluate_and_export.py`.
  2. **Top Reason Codes Chart** (`keepers/top_reason_codes.svg`): SVG chart showing the transparent heuristics behind baseline model predictions.
     * **Call**: **Real Capture**. Exported directly from the evaluation pipeline.
  3. **Action Mix Chart** (`keepers/action_mix.svg`): Distribution chart showing recommendation breakdown.
     * **Call**: **Real Capture**. Exported directly from the evaluation pipeline.

### Page 3: About & Contact (The Person & Sandbox CTA)
* **Goal**: Put a human face to the technical work and guide engineering leads to register for a sandbox API key to test the model.
* **Image Needs**:
  1. **Profile Headshot** (`keepers/saad_photo.jpg`): A professional, warm, high-quality headshot of Saad Ali.
     * **Call**: **Real Photo**. Placed to build human connection and trust (templated placeholder is realistic; to be swapped with Saad's final camera capture).
  2. **Simulated Sandbox Interface**: A screenshot of the UI code or the mock sandbox widget.
     * **Call**: **Real Capture** (of UI code / HTML rendering).

---

## 2. Discrimination & Rejection Logs (The Discernment Part)

To preserve a premium, professional frame that makes the technical work the center of attention, we binned images that felt generic, loud, or artificial.

### Hero Background Curation

| Candidate | Status | Image Link | Discernment & Rationale |
| :--- | :--- | :--- | :--- |
| **Tech Blueprint Grid** | **KEEPER** | [hero_bg.png](file:///d:/Flyrank/week%2003/Task%2003/keepers/hero_bg.png) | Flat, subtle, and geometric. It fits the slate background (#F8FAFC / #0F172A) and uses the exact teal accent (#0D9488) in fine lines. It stays in the background and respects the "frame, not the painting" rule. |
| **Glossy 3D Glassmorphism Sphere** | **REJECTED** | [hero_bg_rejected_glass.png](file:///d:/Flyrank/week%2003/Task%2003/rejected/hero_bg_rejected_glass.png) | **Why Rejected:** This image has the typical, shiny, melted "AI slop" look. The neon pink and cyan gradients completely clash with our color palette. It is visually loud, distracts from the charts, and looks like a generic web template. |

### Favicon / Monogram Curation

| Candidate | Status | Image Link | Discernment & Rationale |
| :--- | :--- | :--- | :--- |
| **Monospace `[S]` Monogram** | **KEEPER** | [favicon.png](file:///d:/Flyrank/week%2003/Task%2003/keepers/favicon.png) | Flat, clean, vector-based. It aligns perfectly with the Geist Mono font family and remains readable at 16x16 favicon dimensions. |
| **Chrome Reflective 3D Sphere** | **REJECTED** | [favicon_rejected_glossy.png](file:///d:/Flyrank/week%2003/Task%2003/rejected/favicon_rejected_glossy.png) | **Why Rejected:** This logo uses metallic chrome surfaces and glowing neon gradients that look cheap and dated. More importantly, it scales poorly: at small browser-tab resolutions, the details melt into an unreadable cyan-purple blob. |

---

## 3. Key Decision Summary: Where Real Captures Beat AI

* **Model Performance Charts**: We rejected using any AI-generated mockups for charts or statistics. AI-generated charts always contain hallucinated, gibberish text labels, and fake curves. Using real SVG charts directly exported from our Python pipeline (`top_feature_importance.svg`, etc.) builds trust with engineering leads who can verify the data.
* **Profile Headshot**: We use a real photo of the person. AI avatar generators or stylized drawings look artificial and suggest a lack of authenticity, which goes against our core branding value: *empirical transparency*.
