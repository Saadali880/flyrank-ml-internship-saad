import os
import sys
import duckdb
from huggingface_hub import hf_hub_download
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, precision_score

def log(msg):
    print(msg)
    sys.stdout.flush()

log("Reading token...")
p = os.path.expanduser('~/.cache/huggingface/token')
with open(p, 'r') as f:
    tok = f.read().strip()

log("Downloading files via hf_hub_download...")
# We use the token to download the gated dataset files
dim_content_path = hf_hub_download(
    repo_id="FlyRank/internship-warehouse", 
    repo_type="dataset", 
    filename="dim_content.parquet", 
    token=tok
)
log(f"dim_content.parquet downloaded to: {dim_content_path}")

fact_march_path = hf_hub_download(
    repo_id="FlyRank/internship-warehouse", 
    repo_type="dataset", 
    filename="fact_content_daily_performance/month=2026-03/data_0.parquet", 
    token=tok
)
log(f"March performance downloaded to: {fact_march_path}")

fact_april_path = hf_hub_download(
    repo_id="FlyRank/internship-warehouse", 
    repo_type="dataset", 
    filename="fact_content_daily_performance/month=2026-04/data_0.parquet", 
    token=tok
)
log(f"April performance downloaded to: {fact_april_path}")

log("Connecting to local DuckDB...")
con = duckdb.connect()

log("Querying local parquet files...")
query = f"""
WITH march_features AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        SUM(gsc_impressions) as gsc_impressions_total,
        SUM(gsc_clicks) as gsc_clicks_total,
        CASE WHEN SUM(gsc_impressions) > 0 THEN CAST(SUM(gsc_clicks) AS DOUBLE) / SUM(gsc_impressions) ELSE 0.0 END as gsc_ctr,
        AVG(gsc_avg_position) as gsc_avg_pos,
        CASE WHEN SUM(ga4_sessions) > 0 THEN CAST(SUM(ga4_engaged_sessions) AS DOUBLE) / SUM(ga4_sessions) ELSE 0.0 END as ga4_engagement_rate
    FROM read_parquet('{fact_march_path}')
    GROUP BY client_hash_id, content_hash_id
),
april_labels AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        SUM(gsc_impressions) as future_impressions
    FROM read_parquet('{fact_april_path}')
    GROUP BY client_hash_id, content_hash_id
),
content_meta AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        content_created_date,
        is_published,
        is_deleted
    FROM read_parquet('{dim_content_path}')
)
SELECT 
    f.client_hash_id,
    f.content_hash_id,
    f.gsc_impressions_total,
    f.gsc_clicks_total,
    f.gsc_ctr,
    f.gsc_avg_pos,
    f.ga4_engagement_rate,
    m.content_created_date,
    COALESCE(l.future_impressions, 0) as future_impressions,
    CASE WHEN COALESCE(l.future_impressions, 0) < 0.8 * f.gsc_impressions_total THEN 1 ELSE 0 END as is_declining_label
FROM march_features f
LEFT JOIN april_labels l ON f.client_hash_id = l.client_hash_id AND f.content_hash_id = l.content_hash_id
JOIN content_meta m ON f.client_hash_id = m.client_hash_id AND f.content_hash_id = m.content_hash_id
WHERE m.is_published IS TRUE 
  AND m.is_deleted IS FALSE 
  AND f.gsc_impressions_total > 0
  AND (DATE '2026-03-31' - m.content_created_date) >= 90
"""

df = con.sql(query).df()
log(f"Compiled DataFrame shape: {df.shape}")
print(df.head())

# Clean missing values
df = df.fillna(0)

# Feature and target split
honest_features = [
    'gsc_impressions_total',
    'gsc_clicks_total',
    'gsc_ctr',
    'gsc_avg_pos',
    'ga4_engagement_rate'
]
leaked_feature = 'future_impressions'
target = 'is_declining_label'

X_honest = df[honest_features]
X_leaked = df[honest_features + [leaked_feature]]
y = df[target]

log("Training with Leakage...")
X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(X_leaked, y, test_size=0.3, random_state=42, stratify=y)
clf_l = RandomForestClassifier(random_state=42, max_depth=5)
clf_l.fit(X_train_l, y_train_l)
preds_l = clf_l.predict(X_test_l)
probs_l = clf_l.predict_proba(X_test_l)[:, 1]

print("ROC AUC (Leaked):", roc_auc_score(y_test_l, probs_l))
print("Precision (Leaked):", precision_score(y_test_l, preds_l))
print(classification_report(y_test_l, preds_l))

log("Training WITHOUT Leakage (Honest)...")
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(X_honest, y, test_size=0.3, random_state=42, stratify=y)
clf_h = RandomForestClassifier(random_state=42, max_depth=5)
clf_h.fit(X_train_h, y_train_h)
preds_h = clf_h.predict(X_test_h)
probs_h = clf_h.predict_proba(X_test_h)[:, 1]

print("ROC AUC (Honest):", roc_auc_score(y_test_h, probs_h))
print("Precision (Honest):", precision_score(y_test_h, preds_h))
print(classification_report(y_test_h, preds_h))
