import os
import sys
import duckdb
import pandas as pd
import numpy as np

def log(msg):
    print(msg)
    sys.stdout.flush()

log("Loading HF token...")
p = os.path.expanduser('~/.cache/huggingface/token')
with open(p, 'r') as f:
    tok = f.read().strip()

log("Connecting to DuckDB...")
con = duckdb.connect()
con.execute(f"CREATE OR REPLACE SECRET hf (TYPE huggingface, TOKEN '{tok}')")
con.execute("SET threads=1;")
con.execute("SET memory_limit='4GB';")

log("Step 1: Querying active clients from dim_clients...")
clients_df = con.sql("""
    SELECT client_hash_id
    FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/dim_clients.parquet')
    WHERE is_active = TRUE
    LIMIT 2
""").df()
active_clients = tuple(clients_df['client_hash_id'].tolist())
log(f"Active clients: {active_clients}")

log("Step 2: Querying march features...")
march_q = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    SUM(gsc_impressions) as gsc_impressions_total,
    SUM(gsc_clicks) as gsc_clicks_total,
    CASE WHEN SUM(gsc_impressions) > 0 THEN CAST(SUM(gsc_clicks) AS DOUBLE) / SUM(gsc_impressions) ELSE 0.0 END as gsc_ctr,
    AVG(gsc_avg_position) as gsc_avg_pos,
    CASE WHEN SUM(ga4_sessions) > 0 THEN CAST(SUM(ga4_engaged_sessions) AS DOUBLE) / SUM(ga4_sessions) ELSE 0.0 END as ga4_engagement_rate
FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance/month=2026-03/*.parquet')
WHERE client_hash_id IN {active_clients}
GROUP BY client_hash_id, content_hash_id
"""
df_march = con.sql(march_q).df()
log(f"March features queried! Shape: {df_march.shape}")

log("Step 3: Querying april labels...")
april_q = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    SUM(gsc_impressions) as future_impressions
FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance/month=2026-04/*.parquet')
WHERE client_hash_id IN {active_clients}
GROUP BY client_hash_id, content_hash_id
"""
df_april = con.sql(april_q).df()
log(f"April labels queried! Shape: {df_april.shape}")

log("Step 4: Querying content meta...")
meta_q = f"""
SELECT 
    client_hash_id, 
    content_hash_id,
    content_created_date,
    is_published,
    is_deleted
FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/dim_content.parquet')
WHERE client_hash_id IN {active_clients}
"""
df_meta = con.sql(meta_q).df()
log(f"Content metadata queried! Shape: {df_meta.shape}")
