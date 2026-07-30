import os
import duckdb
import pandas as pd

p = os.path.expanduser('~/.cache/huggingface/token')
tok = open(p).read().strip()

con = duckdb.connect()
con.execute(f"CREATE OR REPLACE SECRET hf (TYPE huggingface, TOKEN '{tok}')")

target_client = 'client_2910fd937f0b4d9a'
fact_sample_url = 'hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance_sample.parquet'
local_meta_path = r"C:\Users\hassa\.cache\huggingface\hub\datasets--FlyRank--internship-warehouse\snapshots\50cbf7c3909d07be4d1b5906b4d09e882e5acbf2\dim_content.parquet"

df_features = con.sql(f"""
    SELECT client_hash_id, content_hash_id, SUM(gsc_impressions) as gsc_impressions_total 
    FROM read_parquet('{fact_sample_url}') 
    WHERE client_hash_id = '{target_client}' 
      AND report_date BETWEEN DATE '2026-06-01' AND DATE '2026-06-15' 
    GROUP BY client_hash_id, content_hash_id
""").df()

df_meta = con.sql(f"""
    SELECT client_hash_id, content_hash_id, content_created_date, is_published, is_deleted 
    FROM read_parquet('{local_meta_path}') 
    WHERE client_hash_id = '{target_client}'
""").df()

df_meta_clean = df_meta[(df_meta['is_published'] == True) & (df_meta['is_deleted'] == False)]

print("df_features shape:", df_features.shape)
print("df_meta_clean shape:", df_meta_clean.shape)

df_joined = pd.merge(df_features, df_meta_clean, on=['client_hash_id', 'content_hash_id'], how='inner')
print("Inner joined shape:", df_joined.shape)

if len(df_joined) > 0:
    print("GSC total > 0 count:", (df_joined['gsc_impressions_total'] > 0).sum())
    df_joined['content_age_days'] = (pd.to_datetime('2026-06-15') - pd.to_datetime(df_joined['content_created_date'])).dt.days
    print("Age >= 90 count:", (df_joined['content_age_days'] >= 90).sum())
    print("Both count:", ((df_joined['gsc_impressions_total'] > 0) & (df_joined['content_age_days'] >= 90)).sum())
