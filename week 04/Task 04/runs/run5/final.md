# Mitigating Tail Queries and Seasonal Noise in Content Refresh Models

Automated content refresh models track organic search data to identify pages experiencing traffic decline. However, raw search metrics are highly noisy. Two primary sources of error are tail queries (low-volume pages with high variance) and seasonal spikes (such as shopping holidays). Without statistical safeguards, these noise vectors trigger false positives in predictive queues, leading to wasted content optimization efforts.

---

## 1. Noise Vectors and Statistical Failure Modes

The table below summarizes the primary noise vectors in search data and their corresponding failure modes:

| Noise Type | Failure Mode | Root Cause | Statistical Safeguard | Mathematical Metric |
| :--- | :--- | :--- | :--- | :--- |
| **Tail Queries** | Spurious 100% click drops. | Law of Small Numbers (high variance in low-sample data). | Baseline traffic thresholding & Wilson CTR bounds. | Impressions $\ge 100$, Clicks $\ge 10$. |
| **Seasonal Spikes** | False decay flags post-holiday. | Return to baseline traffic after temporary event spikes. | Year-over-Year (YoY) normalization & Rolling mean. | $CTR_{\text{diff\_YoY}} = CTR_t - CTR_{t-12}$. |
| **Weekly Noise** | Erratic recommendation ranks. | Normal day-of-week fluctuations (weekday vs. weekend). | Sliding-window smoothing. | 90-day simple moving average. |

---

## 2. Statistical Safeguards

To prevent false positives, search ranking models implement three mathematical guardrails.

### 1. Baseline Traffic Threshold Filtering
To prune tail queries, a hard pre-filtering rule is applied to the dataset. Pages failing to meet the minimum threshold are discarded before inference:

$$\text{Keep Page if: } \text{Impressions}_{\text{month}} \ge 100 \quad \text{AND} \quad \text{Clicks}_{\text{month}} \ge 10$$

### 2. Confidence-Interval-Based CTR Signals (Wilson Score)
Rather than calculating raw percentage click declines, models evaluate the change in Click-Through Rate (CTR) using confidence intervals. For a given page, the click count $c$ and impression count $n$ define the observed CTR, $p = c/n$. 

The lower and upper bounds ($p_{\text{lower}}, p_{\text{upper}}$) of the CTR are calculated using the **Wilson Score Interval**:

$$p_{\text{bounds}} = \frac{p + \frac{z^2}{2n} \pm z \sqrt{\frac{p(1-p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$

Where $z$ is the standard normal distribution score corresponding to the desired confidence level (e.g., $z = 1.96$ for a $95\%$ confidence level). 

A traffic drop is flagged as a true organic decline only if the confidence intervals of the current month and the previous month do not overlap:

$$p_{\text{upper}}(t) < p_{\text{lower}}(t-1)$$

### 3. Year-over-Year (YoY) Normalization and Rolling Averages
To decouple seasonal spikes from actual content degradation, traffic is normalized against the same period in the previous year. The Year-over-Year traffic ratio, $R_{\text{YoY}}$, is computed as:

$$R_{\text{YoY}}(t) = \frac{\overline{C}_{\text{90d}}(t)}{\overline{C}_{\text{90d}}(t-365)}$$

Where $\overline{C}_{\text{90d}}(t)$ represents the 90-day simple moving average (SMA) of daily clicks at time $t$:

$$\overline{C}_{\text{90d}}(t) = \frac{1}{90} \sum_{i=0}^{89} C_{t-i}$$

Using a 90-day moving average dampens daily and weekly noise, while the YoY ratio filters out predictable annual spikes (e.g., Black Friday traffic). A page is only prioritized for a refresh if $R_{\text{YoY}}(t) < 0.80$, signifying a $20\%$ drop relative to its historical seasonal baseline.

---

## 3. Preprocessing and Statistical Audit Pipeline

The following Python script implements the full statistical audit pipeline, including threshold filtering, moving average smoothing, and Wilson Score interval overlap checking:

```python
import pandas as pd
import numpy as np

def calculate_wilson_bounds(clicks: float, impressions: float, confidence: float = 0.95) -> tuple:
    """
    Computes the lower and upper Wilson score bounds for a CTR.
    """
    if impressions == 0:
        return 0.0, 0.0
    p = clicks / impressions
    z = 1.96  # 95% confidence
    
    denominator = 1 + (z**2) / impressions
    center = (p + (z**2) / (2 * impressions)) / denominator
    spread = z * np.sqrt((p * (1 - p) / impressions) + (z**2) / (4 * impressions**2)) / denominator
    
    return max(0.0, center - spread), min(1.0, center + spread)

def audit_search_queue(df: pd.DataFrame) -> pd.DataFrame:
    """
    Filters and flags true organic declines in a Search Console dataset.
    """
    # 1. Baseline Traffic Filter
    filtered_df = df[(df["impressions"] >= 100) & (df["clicks"] >= 10)].copy()
    
    # 2. Sliding-Window Smoothing (90-day rolling mean for Clicks & Impressions)
    # Assumes df is sorted chronologically per page
    filtered_df["clicks_smoothed"] = filtered_df.groupby("page_url")["clicks"].transform(lambda x: x.rolling(90, min_periods=1).mean())
    filtered_df["impressions_smoothed"] = filtered_df.groupby("page_url")["impressions"].transform(lambda x: x.rolling(90, min_periods=1).mean())
    
    # 3. Calculate Wilson CTR bounds on smoothed values
    bounds = filtered_df.apply(
        lambda row: calculate_wilson_bounds(row["clicks_smoothed"], row["impressions_smoothed"]), 
        axis=1
    )
    filtered_df["ctr_lower"] = [b[0] for b in bounds]
    filtered_df["ctr_upper"] = [b[1] for b in bounds]
    
    # 4. Identify Statistically Significant Decline (relative to a 90-day lagged baseline)
    filtered_df["lagged_ctr_lower"] = filtered_df.groupby("page_url")["ctr_lower"].shift(90)
    filtered_df["lagged_ctr_upper"] = filtered_df.groupby("page_url")["ctr_upper"].shift(90)
    
    # Check for non-overlapping confidence intervals
    filtered_df["is_true_decline"] = (filtered_df["ctr_upper"] < filtered_df["lagged_ctr_lower"])
    
    return filtered_df

# Example execution
# df_search = pd.read_csv("daily_search_performance.csv")
# df_audited = audit_search_queue(df_search)
# target_refresh_list = df_audited[df_audited["is_true_decline"] == True]
```

By integrating this pipeline into search automation tools, teams ensure their editing resources are directed to pages facing genuine content decay rather than statistical noise.
