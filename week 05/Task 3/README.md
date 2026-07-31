# FlyRank Content Refresh Research Scout
## Agent Design Specification
**Author: Saad Ali · Machine Learning & AI Engineering Track**

---

### 1. Job to Be Done (JTBD)
The **FlyRank Content Refresh Research Scout** is an autonomous agent designed to identify high-value organic search content experiencing performance decay, analyze telemetry logs, crawl the live page, fetch search intent keyword variations, and write a structured, publication-ready content refresh brief for editors.

* **The Problem:** Website content decay is inevitable. Search intent shifts, competitors write newer guides, and rankings decline. Manually auditing Google Search Console (GSC) for rank decay, auditing Google Analytics (GA4) for engagement dips, crawling pages for word counts, and researching new keyword variants takes 1.5 to 2 hours per page. Because this process is tedious, editorial teams either refresh the wrong pages or write updates based on "vibes" rather than GSC data.
* **The Solution:** An agent that completes this entire pipeline in under 2 minutes. It identifies high-decay pages, inspects their live structure, scouts secondary keyword opportunities, and compiles a comprehensive brief containing exact title rewrites, layout recommendations, and key paragraphs to update.

---

### 2. User Persona & Usage Frequency
* **The User:** Saad Ali (ML Intern & SEO Analyst) and website content editors.
* **Usage Frequency:** **Weekly**. The agent runs every Monday morning as a batch job, analyzing the previous week's traffic logs. It outputs a ranked queue of the top 5 pages requiring optimization, accompanied by their respective refresh briefs.
* **Interface:** Command-line trigger that outputs structured Markdown briefs stored under `docs/refresh_briefs/` and updates the interactive portfolio dashboard interface.

---

### 3. Tools, Data Sources, and Access Plan
To function without human intervention, the agent is equipped with five read-only tools and one export tool:

| Tool Name | Purpose | Data Source | Access Plan & Auth |
| :--- | :--- | :--- | :--- |
| `gsc_metrics_loader` | Pulls organic impressions, clicks, CTR, and positions over a 90-day comparison window. | Google Search Console API | Authenticated via Google Service Account OAuth 2.0 credentials JSON key. Reads from a read-only GSC property connection. |
| `ga4_telemetry_loader` | Fetches scroll depth event counts (`scroll_depth_90`) and average engagement time per page. | Google Analytics Data API v1beta | Authenticated using the same Google Service Account JSON key. |
| `local_db_query` | Checks content publication date, tags, and previous refresh logs. | Local DuckDB cache | Read-only connection to the local database file `data/processed/refresh_queue.db`. |
| `live_page_crawler` | Crawls the page URL to extract the current HTML title, H1s, H2s, and total word count. | Live Target Webpage | Python `requests` + `BeautifulSoup4` with a custom user-agent header. Reads only public HTML. |
| `serper_keyword_scout` | Fetches related Google search queries, volumes, and competitor snippets. | Google search results (via Serper API) | HTTPS API request. Authenticated via `SERPER_API_KEY` stored in local `.env` (free tier, capped at 2,500 monthly requests). |
| `brief_exporter` | Writes and saves the final Markdown refresh brief. | Local filesystem | Write access to `docs/refresh_briefs/` directory. |

---

### 4. Draft Instructions (System Prompt)
The following system instructions govern the LLM-based reasoning loop of the agent:

```text
You are the FlyRank Content Refresh Research Scout, a senior SEO analyst and technical writer. Your goal is to analyze search performance decay and write actionable, data-driven content refresh briefs.

Your execution loop follows these steps:
1. Parse the page's search telemetry (impressions, clicks, CTR, position, and scroll rates) for the last 90 days vs. prior 90 days.
2. Formulate a diagnostic classification:
   - REFRESH: Clicks down >=20%, impressions down, position dropped, content age >180 days.
   - CTR EDIT: Impressions stable, position in striking distance (ranks 3-15), CTR underperforms baseline (<1%).
   - LAYOUT ENGAGEMENT: Clicks/impressions stable, scroll rate <30% on high traffic.
   - CONTENT EXPANSION: Clicks stable, position >=10, word count <1000.
   - MONITOR: Stable performance.
3. Crawl the live page to extract headers (H1/H2) and evaluate content structure.
4. Call Serper API to identify secondary ranking opportunities and related user intent queries.
5. Generate a structured Markdown brief containing:
   - Diagnostic Summary (Why this page is flagged)
   - Proposed Title & Meta Description rewrites (Exactly 3 alternatives under 60 chars)
   - Structural Header Changes (H2/H3 insertions to match new user search intent)
   - Paragraph updates (Specific technical details to inject or expand)
   - UX Layout improvements (Callout boxes, bullet lists, or tables to fix scroll rate)

Guidelines:
- Maintain an analytical, precise, and candid tone.
- Avoid generic marketing advice like "make content engaging". Suggest exact additions.
- Use LaTeX formatting for any statistical calculations if referenced.
- Ensure all title recommendations fit within standard search snippet bounds (<=60 characters).
```

---

### 5. Pre-Build Evaluation Cases (FL-03 / Hamel Husain Style)
These evaluation cases are defined before building to ensure that the agent meets functional thresholds and logic routes correctly.

#### Case 1: Happy Path (Severe Traffic Decay)
* **Input Data:**
  - URL: `/ml-feature-engineering`
  - Telemetry: Clicks down 35%, Impressions down 20%, Avg Position 4.5 -> 8.2, Content Age: 250 days, Scroll Rate: 42%, Word Count: 1400.
* **Expected Tool Sequence:**
  1. `local_db_query` (retrieve tags/history)
  2. `live_page_crawler` (extract headers)
  3. `serper_keyword_scout` (scout keyword variations)
  4. `brief_exporter` (export brief)
* **Expected Classification:** `🚨 REFRESH`
* **Pass/Fail Criteria:**
  - PASS: Output brief identifies the 3.7 rank position drop, suggests 3 title alternatives under 60 characters, and identifies at least 2 secondary keywords.
  - FAIL: Agent suggests monitoring the page, or skips keyword scouting.

#### Case 2: Striking Distance & Low CTR
* **Input Data:**
  - URL: `/python-model-quantization`
  - Telemetry: Clicks down 5%, Impressions stable, Avg Position: 4.1 (striking distance), CTR: 0.4% (GSC average at pos 4 is 2.5%), Scroll Rate: 48%, Word Count: 1800.
* **Expected Tool Sequence:**
  1. `live_page_crawler` (to extract current meta title & meta description)
  2. `brief_exporter`
* **Expected Classification:** `🔍 CTR TITLE EDIT`
* **Pass/Fail Criteria:**
  - PASS: Output brief focuses entirely on Title/Snippet optimization. Suggests exactly 3 title alternatives under 60 characters and 2 meta description rewrites. Explicitly skips body content rewriting suggestions since traffic is stable but clicks are bottlenecked.
  - FAIL: Agent suggests a full body rewrite, or recommends titles exceeding 60 characters.

#### Case 3: Layout Engagement Drop
* **Input Data:**
  - URL: `/logistic-regression-guide`
  - Telemetry: Clicks stable, Impressions stable, Avg Position: 2.1, Scroll Rate: 18% (target is >=30%), Content Age: 45 days, Word Count: 2500.
* **Expected Tool Sequence:**
  1. `live_page_crawler`
  2. `brief_exporter`
* **Expected Classification:** `📈 LAYOUT ENGAGEMENT`
* **Pass/Fail Criteria:**
  - PASS: Output brief targets page layout, recommending structural UX changes (e.g., adding an executive summary box, placing bullet lists in the intro, embedding code snippets higher).
  - FAIL: Agent suggests changing titles or keywords, ignoring the scroll rate anomaly.

#### Case 4: Thin Content Expansion
* **Input Data:**
  - URL: `/duckdb-starter-guide`
  - Telemetry: Clicks stable, Impressions up 45%, Avg Position: 11.2, Scroll Rate: 65%, Content Age: 90 days, Word Count: 450.
* **Expected Tool Sequence:**
  1. `live_page_crawler`
  2. `serper_keyword_scout`
  3. `brief_exporter`
* **Expected Classification:** `✍️ CONTENT EXPANSION`
* **Pass/Fail Criteria:**
  - PASS: Output brief recommends doubling word count by addressing specific subheadings identified in the keyword scout results (e.g. "duckdb parquet query", "duckdb vs pandas performance").
  - FAIL: Agent suggests monitoring or layout edits without suggesting content additions.

#### Case 5: Monitor Stable Performance
* **Input Data:**
  - URL: `/ai-agent-ethics`
  - Telemetry: Clicks stable, Impressions stable, Avg Position: 1.2, Scroll Rate: 52%, Content Age: 320 days, Word Count: 2000.
* **Expected Tool Sequence:**
  1. `brief_exporter`
* **Expected Classification:** `🛡️ MONITOR PERFORMANCE`
* **Pass/Fail Criteria:**
  - PASS: Agent logs stable metrics and outputs a simple confirmation that no modifications are needed. The system does not create an edit brief.
  - FAIL: Agent suggests changing titles or content of a high-performing, stable ranking asset.

---

### 6. Risks, Guardrails, and Safety Constraints
To prevent dangerous behavior, the agent has three hard guardrails:

* **No Automated Direct Edits (CMS Isolation):**
  > [!WARNING]
  > The agent is strictly read-only regarding the live website CMS. It outputs Markdown files to `docs/refresh_briefs/`. It has no write tools to connect to WordPress, Shopify, or GitHub code pushes directly. A human must manually review, approve, and execute the edits on the live site.
* **Keyword API Cost Safeguard:**
  > [!IMPORTANT]
  > The `serper_keyword_scout` tool is restricted to a maximum of 10 API calls per batch run. If the input queue of decaying pages exceeds 10 URLs, the agent will pause and prompt the user: *"Queue exceeds 10 URLs. Proceed with additional API calls? (Y/N)"*. This prevents unexpected Serper API charges.
* **Scrape Integrity and IP Isolation:**
  > [!CAUTION]
  > The `live_page_crawler` must never attempt to scrape URL structures containing login pathways (e.g., `/wp-admin`, `/login`, `/dashboard`). It checks page HTML tags and immediately aborts if it detects session cookies or login input forms. It must also respect `robots.txt`.

---

### 7. Platform Choice & Justification
* **Chosen Platform:** **Scripted Agent on the Scripting Path (Python + LiteLLM / LangChain custom execution)**
* **Estimated Build Time:** **6 to 8 hours**. Creating the Python utility file `refresh_scout.py` to handle the GSC/GA4 API client credentials and BeautifulSoup parser will take ~4 hours. Building the LLM tool-calling logic and Markdown exporter will take ~3 hours.
* **Justification Against Alternative (Claude Project with Connectors):**
  While a Claude Project is extremely simple to configure for document search, it lacks the ability to run custom local scripts that execute GSC/GA4 API authentication, connect to a local DuckDB cache, or scrape live pages dynamically in response to user prompts. A scripted Python agent provides absolute control over the data pipeline, allows local testing with unit-test suites, and can easily run as a headless cron job on a server without ongoing subscription costs.
