# Week 1: Draw the Path — Deliverables Reference Sheet

This file compiles pre-configured and narrowed deliverables for all four major tracks. You can copy these directly into your Claude Project or use them as a starting point.

---

## 🛠️ Track A: Dev / SEO / Ops

### 1. Proof Statement & Voice Card
* **Proof Statement:** "I take a rough idea to a working tool running in production. I am showing this to a lead developer or engineering manager at a small, fast-moving product team, so they will look at my GitHub repository and email me to chat. Why this exists: A standard resume lists technologies, but it cannot prove I can deploy a clean, functioning web utility that works under load."
* **Voice Card:** "direct, warm, plain, specific, no buzzwords, short sentences"

### 2. Portfolio Sitemap Structure
1. **Home / Hero Claim** [Role: LANDING]
   * *Description:* Displays my core proof claim: "I take raw ideas to working tools in production." Contains a live dashboard widget showing real-time stats of my deployed tool.
2. **Case Study: The App Build** [Role: PROOF]
   * *Description:* Explains the user problem, my mechanical code decisions, deployment hurdles, and hosts links to the live running application and open-source GitHub repository.
3. **Contact & Resume** [Role: ACTION]
   * *Description:* Simple mailto contact link and download link for my technical PDF resume.

### 3. Claude Project Settings: Custom Instructions
```markdown
You are an expert technical tutor for my 8-week Portfolio Build.
My background and track is: Dev / SEO / Ops.

Proof Statement:
"I take a rough idea to a working tool running in production. I am showing this to a lead developer or engineering manager at a small, fast-moving product team, so they will look at my GitHub repository and email me to chat. Why this exists: A standard resume lists technologies, but it cannot prove I can deploy a clean, functioning web utility that works under load."

Voice Card:
"direct, warm, plain, specific, no buzzwords, short sentences"

DIRECTIVES:
1. Act as a strict tutor. Do not build the portfolio for me.
2. Explain the mechanical reasoning behind your styling and layout choices.
3. Push back on generic, template-driven designs. Keep layouts tightly aligned to my proof claim and one action.
4. Keep all responses brief and educational.
```

### 4. Sitemap Pressure-Test Prompt
```text
This is my proof statement: "I take a rough idea to a working tool running in production. I am showing this to a lead developer or engineering manager at a small, fast-moving product team, so they will look at my GitHub repository and email me to chat. Why this exists: A standard resume lists technologies, but it cannot prove I can deploy a clean, functioning web utility that works under load."

This is my sitemap:
Page 1: Home / Hero Claim [landing] - Displays my core proof claim and a live widget.
Page 2: Case Study: The App Build [proof] - Explains the problem, code decisions, and links to live URL and Git.
Page 3: Contact & Resume [action] - Simple mailto contact link.

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.
```

### 5. Sitemap Change Notes (Pass Criteria)
> "Change: I will remove the separate resume page download link and integrate my bio/resume details directly into the Contact section on the Home page, reducing sitemap clutter down to a lean 2-page app flow."

---

## 🎨 Track B: UI / UX Designer

### 1. Proof Statement & Voice Card
* **Proof Statement:** "I turn confusing, multi-step user flows into simple, usable screens. I am showing this to a design lead or product manager at a small product team, so they will email me to set up a chat. Why this exists: LinkedIn shows my job titles, but it cannot demonstrate my step-by-step wireframe testing, user research, and design reasoning."
* **Voice Card:** "clear, human, friendly, objective, no buzzwords, concise"

### 2. Portfolio Sitemap Structure
1. **Portfolio Home** [Role: LANDING]
   * *Description:* Headline stating my user flow simplification claim. Displays a high-fidelity before/after interactive slider of my main project.
2. **Case Study: Flow Optimization** [Role: PROOF]
   * *Description:* The three beats: Problem (checkout drop-off), what I did (user testing, paper prototypes, component design), and outcome (drop-off fell in testing).
3. **Get In Touch** [Role: ACTION]
   * *Description:* Simple bio block and a direct email button to schedule a portfolio review.

### 3. Claude Project Settings: Custom Instructions
```markdown
You are an expert design tutor for my 8-week Portfolio Build.
My background and track is: UI / UX Designer.

Proof Statement:
"I turn confusing, multi-step user flows into simple, usable screens. I am showing this to a design lead or product manager at a small product team, so they will email me to set up a chat. Why this exists: LinkedIn shows my job titles, but it cannot demonstrate my step-by-step wireframe testing, user research, and design reasoning."

Voice Card:
"clear, human, friendly, objective, no buzzwords, concise"

DIRECTIVES:
1. Act as a strict design tutor. Do not write copy or design screens for me.
2. Explain usability guidelines (Nielsen Norman principles) when criticizing layouts.
3. Push back on cosmetic changes that don't serve the core user flow.
```

### 4. Sitemap Pressure-Test Prompt
```text
This is my proof statement: "I turn confusing, multi-step user flows into simple, usable screens. I am showing this to a design lead or product manager at a small product team, so they will email me to set up a chat. Why this exists: LinkedIn shows my job titles, but it cannot demonstrate my step-by-step wireframe testing, user research, and design reasoning."

This is my sitemap:
Page 1: Portfolio Home [landing] - Headline and high-fidelity before/after interactive slider.
Page 2: Case Study: Flow Optimization [proof] - Problem, wireframes, user test notes, and prototypes.
Page 3: Get In Touch [action] - Short bio and direct email link.

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.
```

### 5. Sitemap Change Notes (Pass Criteria)
> "Change: I will integrate the 'Get In Touch' bio card directly at the bottom of the landing page, creating a single scroll page with an anchor-link for my case study, keeping the user inside a single unified experience."

---

## 🤖 Track C: Machine Learning

### 1. Proof Statement & Voice Card
* **Proof Statement:** "I build machine learning models that run on messy, real-world data and am honest about their limits. I am showing this to an AI engineering manager who needs a working prototype, so they will request custom model run tests. Why this exists: A list of certificates cannot prove I can clean dirty datasets, train models, and manage real deployment latency."
* **Voice Card:** "analytical, precise, candid, clear, technical"

### 2. Portfolio Sitemap Structure
1. **Model Landing** [Role: LANDING]
   * *Description:* States ML prototype claim. Displays dynamic model accuracy curves and inference speed benchmarks on raw test data.
2. **Model Evaluation & Demo** [Role: PROOF]
   * *Description:* A live input field where the visitor can write test text and see model classification results, alongside a details section listing dataset cleaning steps and known failure modes.
3. **API Access & Contact** [Role: ACTION]
   * *Description:* Form to request API keys or schedule an intro call, alongside my email link.

### 3. Claude Project Settings: Custom Instructions
```markdown
You are an expert ML engineering tutor for my 8-week Portfolio Build.
My background and track is: Machine Learning.

Proof Statement:
"I build machine learning models that run on messy, real-world data and am honest about their limits. I am showing this to an AI engineering manager who needs a working prototype, so they will request custom model run tests. Why this exists: A list of certificates cannot prove I can clean dirty datasets, train models, and manage real deployment latency."

Voice Card:
"analytical, precise, candid, clear, technical"

DIRECTIVES:
1. Act as an ML tutor. Explain hardware, dataset bias, and metric details.
2. Highlight limitations. Force me to document where models fail.
3. Keep layout simple so code and model inputs take center stage.
```

### 4. Sitemap Pressure-Test Prompt
```text
This is my proof statement: "I build machine learning models that run on messy, real-world data and am honest about their limits. I am showing this to an AI engineering manager who needs a working prototype, so they will request custom model run tests. Why this exists: A list of certificates cannot prove I can clean dirty datasets, train models, and manage real deployment latency."

This is my sitemap:
Page 1: Model Landing [landing] - States ML prototype claim, displays accuracy curves and speeds.
Page 2: Model Evaluation & Demo [proof] - Live input playground and dataset prep logs.
Page 3: API Access & Contact [action] - Key request form and email.

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.
```

### 5. Sitemap Change Notes (Pass Criteria)
> "Change: I will add a 'Model Limitations & Failure Modes' subsection inside my demo page to show engineering honesty, proving I don't hide model shortcomings under ideal data inputs."

---

## 📈 Track D: Growth Marketing

### 1. Proof Statement & Voice Card
* **Proof Statement:** "I grow organic traffic and can demonstrate the before and after analytics. I am showing this to a bootstrapped startup founder looking for sustainable traffic, so they will book a strategy call on my calendar widget. Why this exists: Resume claims are easily inflated; a case study proves my exact campaign planning, attribution tools, and traffic metrics."
* **Voice Card:** "results-driven, direct, warm, analytical, transparent"

### 2. Portfolio Sitemap Structure
1. **Traffic Growth Home** [Role: LANDING]
   * *Description:* Core metric claim with a high-impact before/after organic pageview chart.
2. **Case Study: Content SEO Refactor** [Role: PROOF]
   * *Description:* Problem (stagnant organic clicks), what I did (audited links, rewrote copy, fixed SEO meta tags), and outcome (+40% traffic growth in 60 days).
3. **Book Growth Session** [Role: ACTION]
   * *Description:* Integrated scheduler widget to book a 15-minute intro traffic consultation.

### 3. Claude Project Settings: Custom Instructions
```markdown
You are an expert growth marketing tutor for my 8-week Portfolio Build.
My background and track is: Growth Marketing.

Proof Statement:
"I grow organic traffic and can demonstrate the before and after analytics. I am showing this to a bootstrapped startup founder looking for sustainable traffic, so they will book a strategy call on my calendar widget. Why this exists: Resume claims are easily inflated; a case study proves my exact campaign planning, attribution tools, and traffic metrics."

Voice Card:
"results-driven, direct, warm, analytical, transparent"

DIRECTIVES:
1. Act as a marketing tutor. Push back on empty jargon like 'synergize' or 'leverage'.
2. Help me explain the attribution model behind my numbers.
3. Guide me in designing high-converting layout sections.
```

### 4. Sitemap Pressure-Test Prompt
```text
This is my proof statement: "I grow organic traffic and can demonstrate the before and after analytics. I am showing this to a bootstrapped startup founder looking for sustainable traffic, so they will book a strategy call on my calendar widget. Why this exists: Resume claims are easily inflated; a case study proves my exact campaign planning, attribution tools, and traffic metrics."

This is my sitemap:
Page 1: Traffic Growth Home [landing] - Core metric claim and before/after organic growth chart.
Page 2: Case Study: Content SEO Refactor [proof] - SEO audits, content rewrites, and traffic analytics.
Page 3: Book Growth Session [action] - Integrated scheduler widget.

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.
```

### 5. Sitemap Change Notes (Pass Criteria)
> "Change: I will place the Calendly scheduling widget directly at the bottom of the home page as well, so founders convinced by the main chart don't have to navigate to a separate page to book their call."
