# Heuristics vs. Machine Learning for Content Prioritization: Precision@k and Model Robustness

In large-scale SEO and digital asset management, content refresh prioritization is a primary driver of organic traffic retention. Identifying which pages suffer from actual content decay—as opposed to seasonal fluctuations or random variance—requires ranking thousands of candidate URLs. Traditionally, search teams have relied on static, rule-based heuristics to filter these pages. Modern search operations are transitioning to learned machine learning models, such as Random Forests, to maximize the precision of their optimization queues.

---

## 1. Defining the Prioritization Metric: Precision@k

To evaluate the efficiency of a prioritization queue, search teams use the Precision@k metric. This metric measures the fraction of true positive content decay candidates in the top $k$ recommendations:

$$\text{Precision@k} = \frac{\sum_{i=1}^{k} \text{rel}(i)}{k}$$

Where:
- $k$ is the cut-off threshold of recommendations (e.g., $k=50$).
- $\text{rel}(i) \in \{0, 1\}$ is the relevance label of the document at rank position $i$, where $1$ indicates actual content decay (true positive) and $0$ indicates a false positive (healthy page flagged due to noise).

---

## 2. Heuristic Baseline vs. Random Forest Model

### The Heuristic Baseline
The heuristic approach uses simple database queries to flag URLs exceeding hard-coded thresholds. For example:

$$\text{Flag Page if: } \text{Impressions} > 10,000 \quad \text{AND} \quad \Delta \text{Clicks}_{\text{month}} \le -20\%$$

When evaluated against historical validation sets, this heuristic baseline yields a **Precision@50 of 0.24**. In practice, 38 out of the top 50 flagged pages are false positives, leading to wasted content editing resources.

### The Random Forest Model
The Random Forest model treats prioritization as a supervised classification problem. By training on a comprehensive set of historical and contextual features, the model achieves a **Precision@50 of 0.74**, representing a **+208% lift** over the heuristic.

### Feature Comparison Matrix

| Feature Category | Specific Variable | Heuristic Baseline | Random Forest | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Traffic Volatility** | Clicks Decline ($30\text{d}$) | Yes | Yes | Short-term drop in organic search visits. |
| | Impressions | Yes | Yes | Baseline visibility in Search Console. |
| | Clicks Trend ($90\text{d}$) | No | Yes | Long-term traffic trajectory to filter out short-term noise. |
| **Search Position** | Avg. Rank Position | No | Yes | Historical rank location on the search results page. |
| | Position Volatility | No | Yes | Standard deviation of daily rank to detect search update impact. |
| **Seasonality** | Holiday Traffic Flag | No | Yes | Boolean marker for seasonal shopping or industry closures. |
| **Metadata** | Last Refresh Age | No | Yes | Time elapsed since the last content update. |
| | Content Length Change | No | Yes | Changes in word count and semantic coverage. |

---

## 3. High-Dimensional Decision Boundaries

The performance gap between the heuristic and the Random Forest lies in the shape of their decision boundaries. 

A heuristic baseline defines an orthogonal, two-dimensional split (a hyper-rectangle). It asserts that all pages with high impressions and a specific click drop are identical candidates. This rigid partition cannot bend to accommodate pages that are declining due to external search engine algorithm updates, nor can it ignore pages experiencing seasonal drops.

In contrast, a Random Forest model builds an ensemble of decision trees. Each tree splits the data on different feature subsets, creating a high-dimensional, non-linear decision boundary. By combining these trees, the model learns complex decision paths, such as prioritizing a page that has only a $10\%$ click drop if its average rank has fallen from $1.2$ to $2.5$ while its competitors are rising.

---

## 4. Model Training and Class Imbalance Mitigation

Because content decay is relatively rare (often affecting $<5\%$ of total pages in any given month), the training dataset is highly imbalanced. Training a classifier on imbalanced data causes the model to optimize for the majority class (healthy pages), leading to low recall for decay candidates.

To mitigate this, the Random Forest model is trained using **class-weighted cost functions**. In `scikit-learn`, this is implemented using `class_weight="balanced"`. The loss function assigns a penalty weight to each class inversely proportional to its frequency:

$$W_j = \frac{N}{C \times n_j}$$

Where:
- $W_j$ is the weight of class $j$ (0 or 1).
- $N$ is the total number of samples.
- $C$ is the number of classes (2).
- $n_j$ is the number of samples in class $j$.

This forces the ensemble trees to prioritize split boundaries that isolate the minority decay class, directly boosting Precision@k in the top recommendation queue.
