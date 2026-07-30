import os
import duckdb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, precision_score

# Authenticate with Hugging Face
p = os.path.expanduser('~/.cache/huggingface/token')
with open(p, 'r') as f:
    tok = f.read().strip()

con = duckdb.connect()
con.execute(f"CREATE OR REPLACE SECRET hf (TYPE huggingface, TOKEN '{tok}')")

# DuckDB configuration for stable remote parquet reads
con.execute("SET threads=1;")
con.execute("SET max_memory='4GB';")

print("--- Step 1: Loading Features (March 2026) and Labels (April 2026) ---")

query = """
WITH march_features AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        SUM(gsc_impressions) as gsc_impressions_total,
        SUM(gsc_clicks) as gsc_clicks_total,
        CASE WHEN SUM(gsc_impressions) > 0 THEN CAST(SUM(gsc_clicks) AS DOUBLE) / SUM(gsc_impressions) ELSE 0.0 END as gsc_ctr,
        AVG(gsc_avg_position) as gsc_avg_pos,
        CASE WHEN SUM(ga4_sessions) > 0 THEN CAST(SUM(ga4_engaged_sessions) AS DOUBLE) / SUM(ga4_sessions) ELSE 0.0 END as ga4_engagement_rate
    FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance/month=2026-03/*.parquet')
    GROUP BY client_hash_id, content_hash_id
),
april_labels AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        SUM(gsc_impressions) as future_impressions
    FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance/month=2026-04/*.parquet')
    GROUP BY client_hash_id, content_hash_id
),
content_meta AS (
    SELECT 
        client_hash_id, 
        content_hash_id,
        content_created_date,
        is_published,
        is_deleted
    FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/dim_content.parquet')
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
    -- Label: >20% decline in impressions in future month
    CASE WHEN COALESCE(l.future_impressions, 0) < 0.8 * f.gsc_impressions_total THEN 1 ELSE 0 END as is_declining_label
FROM march_features f
LEFT JOIN april_labels l ON f.client_hash_id = l.client_hash_id AND f.content_hash_id = l.content_hash_id
JOIN content_meta m ON f.client_hash_id = m.client_hash_id AND f.content_hash_id = m.content_hash_id
WHERE m.is_published IS TRUE 
  AND m.is_deleted IS FALSE 
  -- Grain filters: page has visibility and is at least 90 days old
  AND f.gsc_impressions_total > 0
  AND (DATE '2026-03-31' - m.content_created_date) >= 90
"""

print("Running SQL Query to compile feature frame...")
df = con.sql(query).df()
print(f"Compiled DataFrame shape: {df.shape}")
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

print("\n--- Step 2: Training with Leakage ---")
X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(X_leaked, y, test_size=0.3, random_state=42, stratify=y)
clf_l = RandomForestClassifier(random_state=42, max_depth=5)
clf_l.fit(X_train_l, y_train_l)
preds_l = clf_l.predict(X_test_l)
probs_l = clf_l.predict_proba(X_test_l)[:, 1]

print("ROC AUC (Leaked):", roc_auc_score(y_test_l, probs_l))
print("Precision (Leaked):", precision_score(y_test_l, preds_l))
print(classification_report(y_test_l, preds_l))

print("\n--- Step 3: Training WITHOUT Leakage (Honest) ---")
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(X_honest, y, test_size=0.3, random_state=42, stratify=y)
clf_h = RandomForestClassifier(random_state=42, max_depth=5)
clf_h.fit(X_train_h, y_train_h)
preds_h = clf_h.predict(X_test_h)
probs_h = clf_h.predict_proba(X_test_h)[:, 1]

print("ROC AUC (Honest):", roc_auc_score(y_test_h, probs_h))
print("Precision (Honest):", precision_score(y_test_h, preds_h))
print(classification_report(y_test_h, preds_h))
