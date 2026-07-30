import os
import sys
import duckdb
import pandas as pd
import numpy as np
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

con = duckdb.connect()
con.execute(f"CREATE OR REPLACE SECRET hf (TYPE huggingface, TOKEN '{tok}')")

# Paths
fact_sample_url = 'hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance_sample.parquet'
local_meta_path = r"C:\Users\hassa\.cache\huggingface\hub\datasets--FlyRank--internship-warehouse\snapshots\50cbf7c3909d07be4d1b5906b4d09e882e5acbf2\dim_content.parquet"

log("Step 1: Querying June 1-15 Features from sample table...")
q_feat = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    SUM(gsc_impressions) as gsc_impressions_total,
    SUM(gsc_clicks) as gsc_clicks_total,
    CASE WHEN SUM(gsc_impressions) > 0 THEN CAST(SUM(gsc_clicks) AS DOUBLE) / SUM(gsc_impressions) ELSE 0.0 END as gsc_ctr,
    AVG(gsc_avg_position) as gsc_avg_pos,
    CASE WHEN SUM(ga4_sessions) > 0 THEN CAST(SUM(ga4_engaged_sessions) AS DOUBLE) / SUM(ga4_sessions) ELSE 0.0 END as ga4_engagement_rate
FROM read_parquet('{fact_sample_url}')
WHERE report_date BETWEEN DATE '2026-06-01' AND DATE '2026-06-15'
GROUP BY client_hash_id, content_hash_id
"""
df_features = con.sql(q_feat).df()
log(f"Features queried. Shape: {df_features.shape}")

log("Step 2: Querying June 16-30 Labels from sample table...")
q_label = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    SUM(gsc_impressions) as future_impressions
FROM read_parquet('{fact_sample_url}')
WHERE report_date BETWEEN DATE '2026-06-16' AND DATE '2026-06-30'
GROUP BY client_hash_id, content_hash_id
"""
df_labels = con.sql(q_label).df()
log(f"Labels queried. Shape: {df_labels.shape}")

log("Step 3: Querying Content Metadata from local cache...")
q_meta = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    content_created_date,
    is_published,
    is_deleted
FROM read_parquet('{local_meta_path}')
"""
df_meta = con.sql(q_meta).df()
log(f"Metadata queried. Shape: {df_meta.shape}")

log("Step 4: Joining and filtering data...")
df_meta_clean = df_meta[(df_meta['is_published'] == True) & (df_meta['is_deleted'] == False)]

# Merge
df_joined = pd.merge(df_features, df_meta_clean, on=['client_hash_id', 'content_hash_id'], how='inner')
df_joined = pd.merge(df_joined, df_labels, on=['client_hash_id', 'content_hash_id'], how='left')
df_joined['future_impressions'] = df_joined['future_impressions'].fillna(0)

# Apply content age >= 90 filter
df_joined['content_age_days'] = (pd.to_datetime('2026-06-15') - pd.to_datetime(df_joined['content_created_date'])).dt.days
df_final = df_joined[
    (df_joined['gsc_impressions_total'] > 0) & 
    (df_joined['content_age_days'] >= 90)
].copy()

# Label: >20% decline in future 15 days impressions compared to first 15 days
df_final['is_declining_label'] = (df_final['future_impressions'] < 0.8 * df_final['gsc_impressions_total']).astype(int)

log(f"Final feature frame shape: {df_final.shape}")
print(df_final.head())

# Clean missing values
df_final = df_final.fillna(0)

# Feature list
honest_features = [
    'gsc_impressions_total',
    'gsc_clicks_total',
    'gsc_ctr',
    'gsc_avg_pos',
    'ga4_engagement_rate'
]
leaked_feature = 'future_impressions'
target = 'is_declining_label'

X_honest = df_final[honest_features]
X_leaked = df_final[honest_features + [leaked_feature]]
y = df_final[target]

log("Training with Leakage...")
X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(X_leaked, y, test_size=0.3, random_state=42, stratify=y)
clf_l = RandomForestClassifier(random_state=42, max_depth=5)
clf_l.fit(X_train_l, y_train_l)
preds_l = clf_l.predict(X_test_l)
probs_l = clf_l.predict_proba(X_test_l)[:, 1]

print("ROC AUC (Leaked):", roc_auc_score(y_test_l, probs_l))
print("Precision (Leaked):", precision_score(y_test_l, preds_l))

log("Training WITHOUT Leakage (Honest)...")
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(X_honest, y, test_size=0.3, random_state=42, stratify=y)
clf_h = RandomForestClassifier(random_state=42, max_depth=5)
clf_h.fit(X_train_h, y_train_h)
preds_h = clf_h.predict(X_test_h)
probs_h = clf_h.predict_proba(X_test_h)[:, 1]

print("ROC AUC (Honest):", roc_auc_score(y_test_h, probs_h))
print("Precision (Honest):", precision_score(y_test_h, preds_h))
