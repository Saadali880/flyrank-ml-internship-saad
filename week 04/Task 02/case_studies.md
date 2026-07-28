# ML Case Study Evidence Specs
**Author: Saad Ali · Machine Learning Track**

This file outlines the empirical metrics, feature sets, preprocessing steps, and charts for the portfolio case study: **"Search Priority Model for Content Refresh Opportunities"**.

---

## 1. Key Performance Benchmarks

- **Baseline Heuristics Precision@50:** `0.24` (Using simple index position queries)
- **Random Forest Model Precision@50:** `0.74`
- **Precision Lift:** `+208%` (Precision lift of 3.08x)
- **Inference Latency:** `14ms` (Computed on a local Python Flask API benchmark)

---

## 2. Model Spec & Feature Engineering

### Numeric Features
- `impressions`
- `clicks`
- `ctr`
- `position`
- `impressions_change`
- `clicks_change`
- `position_change`

### Excluded (Leakage) Features
- `trend_direction`
- `trend_pct`
- *Reason:* These fields were used to construct the label `is_declining_label`, and using them would cause data leakage, making the validation metrics artificially perfect but useless on real-world test sets.

---

## 3. Data Pipeline Logs

### Preprocessing Log
1. **Load Raw Data:** Processed 30,000 anonymized Search Console page rows.
2. **Handle NaNs:** Filled missing click/position data with zero baseline values.
3. **Construct Label:** Derived label `is_declining_label` from declining clicks/position trend profiles.
4. **Leakage Audit:** Scanned and removed columns matching the label formulation (`trend_direction`, etc.).
5. **Data Split:** Split data by holding out **20% of clients** entirely (not rows) to prevent client leakage.

---

## 4. Model Limitations & Failure Modes

- **Low-Volume Tail Queries:** The model's precision degrades on pages with <10 monthly impressions due to lack of stable click signals.
- **Seasonal Spikes:** Rapid short-term changes (e.g., Black Friday) are misclassified since the model relies on longer historical windows.
- **Safeguards:** Implemented threshold filters requiring a minimum traffic history before applying priority scoring.
