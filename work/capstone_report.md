# Capstone Report — Content Refresh Opportunity Scoring

- **Author:** Saad Ali
- **Lane:** Lane 2 - Refresh / Content Opportunity Scoring
- **Repo:** https://github.com/Saadali880/flyrank-ml-internship-saad
- **Date:** July 29, 2026

## 1. Problem framing

The goal of this system is to prioritize content pages for review and refresh to halt organic search traffic decay and optimize reviewer time.
- **Unit of Analysis**: The individual content page.
- **Output**: A blended refresh opportunity score (0 to 100) and suggested action classifications.
- **Action**: A content reviewer opens the top-ranked pages and decides whether to perform a structural text refresh, edit titles/metas for CTR, reorganize layout for engagement, or monitor.
- **Cost of a Wrong Call**: A false positive wastes reviewer time on a healthy page and risks disrupting a good ranking. A false negative results in unnoticed traffic cannibalization and revenue decline.
- **Why ML Helps**: Simple heuristic rules cannot scale or isolate linear feature interactions across varying client page sizes. Machine learning models identify multi-dimensional patterns associated with decline.

## 2. Data safety

- **Data Used**: The FlyRank ML Internship dataset containing 30,000 rows × 44 columns, representing GSC and GA4 telemetry across 32 clients.
- **Exclusions**: Evaluated post-outcome measurements (last 30 days telemetry) and direct label derivations (`trend_pct`, `trend_direction`) were dropped to prevent target leakage. Client and page IDs were kept strictly as pseudonym grouping variables, not features.
- **Missingness Handling**: Added binary flags (e.g., `has_word_count`) before imputing median values to prevent categorical signaling.

## 3. Baseline

- **Baseline Rule**: Target pages in striking distance of page-one rankings (avg position 3 to 15) that are stale (days since update >= 90) and visible (impressions >= 500).
- **Baseline Score**: Combined staleness, visibility, and position rank opportunity.
- **Performance**: On the client-holdout test split, the baseline rule achieved a **Precision@50 of 0.300** and an **ROC AUC of 0.4990**.

## 4. Model / analysis

- **Method**: Trained Logistic Regression (L2 regularization, balanced weights), Decision Trees, and Random Forests. Regularized Logistic Regression is the champion as it generalizes better to unseen client distributions than overfit trees.
- **Target Definition**: `is_declining_label` represents a >20% decline in Google Search Console impressions in the last 30 days vs. previous 30 days.

## 5. Evaluation

- **Validation Split**: Grouped Train/Test Split on `client_id` (80% train, 20% test). Forces evaluation on 7 entirely unseen holdout clients (6,163 rows) to simulate real production rollout.
- **Performance Comparison on Test Split**:
  - Logistic Regression (Champion): **ROC AUC 0.6177** | **Precision@50: 74.0%** (2.47x lift over baseline)
  - Baseline Heuristic: **ROC AUC 0.4990** | **Precision@50: 30.0%**
- **Error Modes**:
  1. *False Positives*: High-visibility pages flagged due to extreme age and room to fall (Stability Paradox), but representing highly stable evergreen content.
  2. *False Negatives*: Deeply ranked pages that suffer sudden external crawler or technical indexation errors.
  3. *High-Volume False Positives*: Healthy pages experiencing competitor content updates that cannibalize traffic.

## 6. Interpretation

- **Feature Importances (Logistic Regression Coefficients)**:
  - `log_impressions_90d` (+1.27): High visibility drives statistical decline risk (Stability Paradox - highest absolute room to fall).
  - `users_90d` (-0.83) & `log_clicks_90d` (-0.56): High active traffic is a strong indicator of ranking stability.
  - `avg_position` (-0.40): Worse ranks (numerically larger) have less risk of decline than highly competitive top positions.
  - `content_age_days` (-0.37): Older content shows survival stability (survivorship bias).

## 7. Recommendation

We calculate the `final_refresh_score` using a blended formula:
`Blended Score = 70% * Model Probability + 30% * Normalized Heuristic Score` (scaled 0-100).
Pages are prioritized and routed into 5 actions:
1. `refresh` (High-value visible decaying pages: blended score >= 50, model prob >= 65%)
2. `refresh_and_review_ctr` (Striking distance average position 1-20, CTR underperforming < 0.5%, impressions >= 500)
3. `refresh_and_review_engagement` (Sessions >= 30, scroll rate or engagement rate < 30%)
4. `expand_and_refresh` (Thin content word count < 1,200 with impressions >= 250)
5. `monitor` (Standard observation for healthy/low-demand pages)

### Model Retrain triggers:
- rolling holdout cohort Precision@50 drops below 50.0%.
- score Population Stability Index (PSI) exceeds 0.25.
- editorial rejection rate of recommended queue exceeds 35%.

## 8. Reproducibility

1. Clone repo: `git clone https://github.com/Saadali880/flyrank-ml-internship-saad.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Execute capstone notebook: `jupyter nbconvert --to notebook --execute work/notebooks/capstone.ipynb`
- Random Seed: `random_state=42`
