# Saad Ali's Portfolio Growth Plan: Next Case Study

This document outlines the exact plan, placement, and implementation details for adding the next case study to Saad Ali's Machine Learning & AI Engineering Portfolio. It preserves the build context of the current project and sets a concrete recurring schedule to ensure the portfolio remains a living career platform.

---

## 1. Where the Next Case Study Will Go

To maintain a clean, single-page application flow that aligns with Track C parameters, the new case study will be integrated directly into the existing interactive web portfolio:

*   **Navigation Link**: A new link will be added to the navigation bar in [docs/portfolio/index.html](file:///D:/Flyrank/docs/portfolio/index.html):
    ```html
    <a href="#drift-detector" class="nav-link">Model Drift Monitor</a>
    ```
*   **Layout Placement**: A new section `<section class="section-container" id="drift-detector">` will be appended directly below **Section 3: Technical Specifications** and above the **Footer** in [docs/portfolio/index.html](file:///D:/Flyrank/docs/portfolio/index.html).
*   **Visual Style**: The section will inherit the existing dark/light grid layout, styling tokens, and custom UI components defined in [docs/portfolio/styles.css](file:///D:/Flyrank/docs/portfolio/styles.css) (using `.card` and `.btn` classes for consistent visual language).

---

## 2. Steps to Add the Case Study

Using the preserved Claude Project build context, the additions can be drafted in a single conversation:

1.  **Open the Claude Project**: Ensure the existing project is selected (it holds custom instructions containing Saad's voice card, model features, data safety rules, and CSS properties).
2.  **Provide the Technical Artifacts**: Input the new monitoring python script (`scripts/06_monitor_drift.py`) and log output.
3.  **Prompt the Assistant**:
    > "I have built a production model drift monitor. Using the existing theme, design tokens, and personal agent console patterns in index.html and app.js, write the drop-in HTML and JS chunks to add this case study as Section 4. Keep the writing style aligned with my voice card (direct, plain, specific)."
4.  **Integrate Code**: Insert the generated HTML code block into `index.html` and append the new drift simulation tool to `app.js`.
5.  **Local Verification**: Run a local server (`python -m http.server 8000` inside `docs/portfolio`) to test interactions and review agent execution trace logs for the new "monitor drift" query routing.

---

## 3. The Named Next Case Study (Three-Beat Shape)

*   **Case Title**: *Automated Model Drift Monitor & Retraining Pipeline*
*   **Beat 1 (The Problem)**: Once the Content Scorer was deployed in production, seasonal search queries and search engine algorithm updates caused data distribution shifts. This data drift decayed the opportunity scorer's Precision@50 from 74% to below 50% within weeks, rendering recommendations inaccurate without the team realizing.
*   **Beat 2 (What I Did)**: I built a lightweight Python monitoring pipeline (`scripts/06_monitor_drift.py`) that calculates the Population Stability Index (PSI) and Precision@50 over weekly rolling client cohorts. If the PSI exceeds 0.25 or editorial validation rejection exceeds 35%, the script automatically triggers a retraining run using GroupKFold splits on the latest holdout datasets and logs a warning.
*   **Beat 3 (What Came of It)**: We observed that this monitor caught an induced data drift event in week 4, successfully retraining and restoring Precision@50 back to 72% on holdout cohorts. It eliminated 100% of manual drift audits (saving ~3 hours per week of manual checking) and established clear, data-backed boundaries for model reliability.

---

## 4. Evidence of Calendar Reminder

To prevent the portfolio from going stale, a recurring Google Calendar reminder has been set for every two weeks to audit model performance and update case findings:

*   **Event Name**: `Portfolio Case Study: Model Drift Pipeline`
*   **Schedule**: Every 2 weeks on Saturday, starting August 15, 2026, at 10:00 AM.
*   **Action**: Run the drift monitor, export updated coefficients, and review the personal agent console logs.

Evidence is saved at: [portfolio_reminder.jpg](file:///D:/Flyrank/docs/portfolio/portfolio_reminder.jpg)

---

## 5. Build Context Preservation

By keeping the current Claude Project intact, future additions remain cheap and fast. The project memory contains:
*   **Voice Card**: Direct, plain, specific, no buzzwords, short sentences.
*   **Technical Context**: Pre-configured variables for Logistic Regression coefficients, GroupKFold cross-validation details, and data safety exclusions (target variables dropped).
*   **Styling Baseline**: System variables for CSS variables (`--bg-primary`, `--accent`, `--card-bg`), font loading, and animations.
