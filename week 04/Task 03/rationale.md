# Portfolio Stack Decision Rationale
**Author: Saad Ali · Machine Learning Track**

This document outlines the three candidate stack options for my machine learning portfolio, pressure-tests the front-runner, and provides the final decision rationale based on my project requirements and constraints.

---

## 1. My Core Constraints

1. **Free Only**: The entire setup must run on zero-budget free tiers. No paid hosting, paid database plans, or paid API endpoints.
2. **Honest Skill Level**: I am a machine learning developer. I am highly comfortable with Python, pandas, scikit-learn, and Jupyter Notebooks. On the frontend, I have basic-to-intermediate knowledge of semantic HTML5, CSS3 styling, and client-side ES6 JavaScript, but I do not specialize in modern full-stack JavaScript frameworks (like React, Next.js, or backend Node.js engines).
3. **Portfolio Requirements**: The portfolio must be a high-fidelity single-scroll page structured as follows:
   - **Page 1 (Model Landing)**: Hero section displaying my one-line core claim and a live metric dashboard (14ms latency, +208% lift, chosen stack details).
   - **Page 2 (Model Evaluation & Demo)**: An interactive JS-based input playground for priorities, SVG charts (`top_feature_importance.svg`, `top_reason_codes.svg`, etc.), data preprocessing log details, and a dedicated failure/limitation boundary section.
   - **Page 3 (API Access & Contact)**: A short bio and an API sandbox request form where users can request simulated access.
4. **Display Layouts**: 
   - Interactive widgets (sliders, text inputs) for the model playground.
   - Metric dashboards with live pulses.
   - Static embedded vector SVGs for statistical charts.
   - Semantically clean tables and lists for data split explanations and limitations.
   - A link to the underlying code repository.
5. **Backend Needs**: Not yet. The interactive playground can evaluate model heuristic rules or compiled decision tree boundaries entirely client-side in Vanilla JS. The sandbox API request form can simulate key generation and return a mock key via client-side storage (`localStorage`) and a toast notification.

---

## 2. Three Stack Options: Simplest to Most Powerful

### Option A: Static HTML5 / CSS3 / Vanilla ES6 JavaScript (Chosen Stack)
- **How to Build**: Write a clean, semantic `index.html` styled with a custom `styles.css` stylesheet. Implement theme toggling, the interactive playground, and the mockup API sandbox key generator in a single, well-structured client-side `<script>` tag.
- **Where to Host**: GitHub Pages or Netlify (free tier).
- **Backend Needed?**: No backend. Fully static.
- **The Real Trade-off**:
  - *Pros*: Absolute simplest setup with zero maintenance. No dependencies to manage, no npm updates to run, and no build configurations to break. The page loading speed is near-instant, which is perfect for SEO and user experience.
  - *Cons*: Interactivity must be coded in raw DOM manipulation, which is slightly more verbose than reactive frameworks for complex interfaces, but completely manageable for a single playground calculator.

### Option B: Static Site Generator (Astro / Eleventy) + Tailwind CSS
- **How to Build**: Build a static site using Astro or Eleventy. Write layout elements as reusable components. Use Tailwind utility classes for rapid styling. Use small JavaScript blocks or Alpine.js for the interactive playground.
- **Where to Host**: Netlify, Vercel, or GitHub Pages.
- **Backend Needed?**: No backend. The build output is static HTML, CSS, and JS.
- **The Real Trade-off**:
  - *Pros*: Excellent component composition and cleaner styling speed thanks to Tailwind CSS utility classes. Astro compiles down to zero-KB JS by default.
  - *Cons*: Introduces a Node.js runtime dependency, build scripts, npm packages, and a learning curve for the SSG framework routing, making long-term maintenance slightly higher.

### Option C: Next.js (App Router) + React + Tailwind CSS + Supabase
- **How to Build**: Code a React-based web application. Use a component library like Recharts for graphs. Store request logs in a live database (Supabase) via Next.js serverless API routes.
- **Where to Host**: Vercel (Hobby plan) and Supabase (Free tier).
- **Backend Needed?**: Yes, serverless database handlers to process live sandbox API requests.
- **The Real Trade-off**:
  - *Pros*: Highly professional industry-standard web stack. Easy to connect to real-time databases to persist leads.
  - *Cons*: Massive build overhead, slow page hydration (larger bundle sizes), cold start latency on serverless calls, and complex React state-management bugs. Maintaining this requires regular dependency updates; if ignored for a year, the build pipeline will rot and fail.

---

## 3. Pressure-Testing the Front-Runner (Option A)

- **What breaks if I pick the simplest?**
  Nothing breaks within my project scope. The interactive scorer can execute the model's priority calculations locally in the user's browser (e.g., using a JS-translated representation of our model's weights). The API sandbox form is a simulation, so saving the key to a toast/clipboard is sufficient. If I ever need to capture actual emails in the future, I can easily embed a free form handler (like Google Forms, Airtable, or Tally) without writing backend code.
- **What do I maintain if I pick the most powerful (Next.js)?**
  I would have to maintain a complex local Node environment, configure environment variables for serverless routes, track security warnings on a deep node-modules tree, and resolve hydration errors if client-side actions don't align with server-side renders.
- **Can I finish in two weeks?**
  With Option A, yes, absolutely. The baseline HTML and CSS structures are already built and verified in `docs/`. Fulfilling the interactive calculator and sandbox request components will take only a few hours of JavaScript scripting.
- **Does it show my work the way it needs to be shown?**
  Yes. The clean typography and semantic layout present ML documentation clearly. High-performance SVGs scale dynamically without layout shifts. The client-side calculator responds instantly, proving that our scoring heuristics can be run at scale under a strict 14ms latency budget.

---

## 4. Final Decision & Written Rationale

*The choice made for the track thread:*

> **"I chose Option A: Static HTML5, CSS3, and Vanilla JavaScript hosted on Netlify / GitHub Pages. I considered Astro + Tailwind CSS and Next.js + React + Supabase as alternatives."**
> 
> Here is my rationale for this choice:
> 
> 1. **Can I maintain this?** 
>    Yes, effortlessly. A plain HTML/CSS/JS stack requires no dependencies, no local compiler, and no build configurations. It is resilient to library updates and will compile exactly the same way on any browser ten years from now. Since my focus is on machine learning engineering, I cannot afford to spend my time resolving dependency version mismatches or serverless cold starts.
> 
> 2. **Does it show my work well?** 
>    Yes. The primary proof of my work consists of numeric benchmarks, features, limitations, and SVG diagrams. Standard HTML offers semantic control for document scanning. The interactive playground evaluates model priority scores instantly without hitting network bottlenecks, proving the real-world efficiency of the prototype.
> 
> 3. **Honest Backend Needs:** 
>    At this stage, my portfolio does not require a real database. The scorer playground operates on client-side JS logic, and the Sandbox API request behaves as a mock generator. Opting for a backend would invite unnecessary hosting complexities and security concerns (e.g., managing credentials/databases) for a task that is entirely solved in the client.
