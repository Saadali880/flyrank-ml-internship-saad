# Checkpoint 1 Design Review: Survive the Crit

This document compiles the proof statement, design review feedback, classification of issues, and the fixes made to Saad Ali's portfolio page.

---

## 1. Proof Statement & Context
- **Proof Statement**: "I build machine learning models that run on messy, real-world data and am honest about their limits. I am showing this to an AI engineering manager who needs a working prototype, so they will request custom model run tests. Why this exists: A list of certificates cannot prove I can clean dirty datasets, train models, and manage real deployment latency."
- **Target Persona**: AI Engineering Lead / Hiring Manager looking for practical ML prototype builders.
- **Key Action**: Request custom model run tests / email to chat.

---

## 2. Reviewer Questions & Initial Response
The reviewer was asked two specific questions immediately upon opening the site (10-second test):

1. **In ten seconds, what do I do?**
   - *Answer*: "You build search-priority ML models that predict search traffic decay and prioritize refreshes under a strict latency budget, built on 79M+ rows of search performance data."
2. **Would you believe I am good at it?**
   - *Answer*: "Yes. The active production project shows real metrics (+247% Precision@50 lift, 14ms latency limit) and has an interactive playground widget where I can run model inferences with custom inputs."

---

## 3. Feedback Sort

### Must-Fix (Confusing, Broken, or Hurts Key Action)
1. **Raw Markdown Links (Broken UX)**: The "DNS Walkthrough" link in the footer opens the raw markdown file (`dns_walkthrough.md`) in the browser. Renders as plain, unstyled text. Looks unfinished.
2. **Input Contrast (Readability)**: The border lines for input fields in the interactive playground card are very thin and dim in dark mode, making them difficult to see clearly on some screens.
3. **Scorer Logic Ambiguity (Honesty)**: The scorer playground lists "Opportunity Score" and "Probability of Decay" without clarifying how they are computed or that the Opportunity Score blends model predictions with heuristics.

### Nice-to-Have (Later / Optimization)
1. **Inference Latency Metric**: Show client-side latency in the widget model output (e.g. "Inference took < 1ms") to visually demonstrate the latency-sensitive claim in action.
2. **Branding Visuals**: Enhance the header monogram with a subtle logo or SVG icon.
3. **Real Professional Photo**: Re-add an "About" photo once a genuine professional headshot of Saad is captured.

---

## 4. Must-Fixes Addressed on the Live Site

The following changes were made to the codebase and deployed live to address the must-fixes:

1. **DNS Walkthrough Page Refactor**:
   - Created [dns_walkthrough.html](file:///d:/Flyrank/docs/portfolio/dns_walkthrough.html), a fully styled standalone web page that presents the domain mapping zone configuration and resolution lifecycle.
   - Updated [index.html](file:///d:/Flyrank/docs/portfolio/index.html) to link directly to this styled HTML page instead of the raw markdown file.
2. **Form Input Contrast Enhancements**:
   - In [styles.css](file:///d:/Flyrank/docs/portfolio/styles.css), increased the opacity of the input borders to `0.35` (default) and `0.6` (hover) to ensure proper legibility in dark mode.
3. **Opportunity Score Transparency**:
   - Updated the description text of the "Run Scorer Inference" widget in [index.html](file:///d:/Flyrank/docs/portfolio/index.html) to explicitly mention that it runs client-side inference using the trained Logistic Regression weights and that the Opportunity Score is a blended metric (70% model probability + 30% ranking/staleness heuristics).
