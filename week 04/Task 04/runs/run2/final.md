# Feature Leakage in Search Click Decline Modeling: Audits and Group-Based Splitting

Feature leakage is a critical failure mode in machine learning systems where information from the target label "leaks" into the training features. This problem is particularly acute in search click modeling and SEO forecasting, where historical traffic metrics and derived trends are readily available in raw datasets. Leakage leads to artificially inflated validation metrics during testing, followed by a total collapse in prediction accuracy when the model is deployed on live inference data.

---

## 1. The Mathematical Mechanism of Feature Leakage

In search click decline modeling, the target label $y$ is typically binary, indicating whether a specific page $d$ at time $t$ has experienced a significant click drop. For example, a common threshold is a $20\%$ decrease in clicks compared to the previous month:

$$y_t = \begin{cases} 1 & \text{if } \frac{C_t - C_{t-1}}{C_{t-1}} \le -0.20 \\ 0 & \text{otherwise} \end{cases}$$

Where $C_t$ represents the total clicks accumulated in month $t$.

Leakage occurs when we include features that are mathematical transformations of the variables used to construct the label $y$. In search analytics exports, features like `trend_pct` and `trend_direction` are frequently calculated as:

$$\text{trend\_pct} = \frac{C_t - C_{t-1}}{C_{t-1}}$$

$$\text{trend\_direction} = \text{sign}(C_t - C_{t-1})$$

A decision tree or gradient boosted ensemble will immediately isolate these features because they map directly to the target label. For example, the model learns the trivial decision boundary:

$$\text{If } \text{trend\_pct} \le -0.20 \implies y = 1$$

During cross-validation, the model achieves $100\%$ precision and recall. However, at the time of inference (month $t-1$), the clicks for month $t$ are unknown. Thus, `trend_pct` cannot be computed. If the model is forced to use historical values or defaults, the predictive power collapses.

---

## 2. Preventing Client Leakage with Group-Based Splitting

In multi-tenant SEO applications, click datasets contain rows from hundreds of different clients or domains. A standard random train-test split mixes pages from the same client across both sets. Because websites have unique baseline characteristics (e.g., brand-driven traffic, niche seasonality, domain authority), the model will memorize client-specific signatures.

To prevent this "client leak," we must partition data at the client level.

### Split Topology Comparison

| Splitting Method | Train Set Clients | Test Set Clients | Overlap Risk | Evaluation Validity |
| :--- | :--- | :--- | :--- | :--- |
| **Random Row Split** | `client_A`, `client_B`, `client_C` | `client_A`, `client_B`, `client_C` | **High**: Memorizes specific client baselines. | **Invalid**: Optimistic bias. |
| **Client Group Split** | `client_A`, `client_B` | `client_C` | **Zero**: Forces generalization to unseen domains. | **Valid**: Reflects true production performance. |

Here is how to implement a strict client-level split in Python using `scikit-learn`:

```python
import pandas as pd
from sklearn.model_selection import GroupKFold

# Sample dataset loading
# 'client_id' is the grouping column
data = pd.read_csv("search_clicks.csv")
X = data.drop(columns=["is_declining_label"])
y = data["is_declining_label"]
groups = data["client_id"]

# Instantiate GroupKFold to guarantee zero client overlap
gkf = GroupKFold(n_splits=5)

for fold, (train_idx, test_idx) in enumerate(gkf.split(X, y, groups)):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    print(f"Fold {fold+1}:")
    print(f"  Train clients: {set(groups.iloc[train_idx])}")
    print(f"  Test clients: {set(groups.iloc[test_idx])}")
    # Verify intersection is empty
    assert len(set(groups.iloc[train_idx]).intersection(set(groups.iloc[test_idx]))) == 0
    break
```

---

## 3. Designing a Strict Leakage Audit

A leakage audit must be integrated into the ML pipeline prior to feature engineering. The audit consists of two main programmatic checks: linear correlation analysis and a baseline decision tree feature importance audit.

Here is the complete implementation of a leakage audit runner:

```python
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier

def run_leakage_audit(df: pd.DataFrame, target_col: str, threshold: float = 0.90) -> list:
    """
    Audits features for potential leakage using correlation and feature importance checks.
    """
    leaking_features = []
    
    # 1. Correlation Audit
    correlations = df.corr(numeric_only=True)[target_col].abs()
    for col, corr_val in correlations.items():
        if col == target_col:
            continue
        if corr_val >= threshold:
            print(f"[WARNING] Linear correlation between {col} and {target_col} is {corr_val:.4f}")
            leaking_features.append(col)
            
    # 2. Decision Tree Feature Importance Audit
    X = df.select_dtypes(include=[np.number]).drop(columns=[target_col])
    y = df[target_col]
    
    # Fill simple NaNs for the audit tree
    X_filled = X.fillna(X.median())
    
    dt = DecisionTreeClassifier(max_depth=3, random_state=42)
    dt.fit(X_filled, y)
    
    for score, name in sorted(zip(dt.feature_importances_, X.columns), reverse=True):
        if score > 0.80:
            print(f"[WARNING] Feature '{name}' has a decision tree importance of {score:.4f}")
            if name not in leaking_features:
                leaking_features.append(name)
                
    return leaking_features

# Run audit example
df_clicks = pd.read_csv("search_clicks.csv")
flagged_cols = run_leakage_audit(df_clicks, target_col="is_declining_label")
print(f"\nAudit complete. Recommended columns to drop: {flagged_cols}")
```

By enforcing client-level group splits and running automated correlation and tree audits, teams can identify and eliminate leakage vectors before models reach production.
