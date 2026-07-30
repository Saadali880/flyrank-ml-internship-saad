import os
import sys
import duckdb

def log(msg):
    print(msg)
    sys.stdout.flush()

log("Reading token...")
p = os.path.expanduser('~/.cache/huggingface/token')
with open(p, 'r') as f:
    tok = f.read().strip()

con = duckdb.connect()
con.execute(f"CREATE OR REPLACE SECRET hf (TYPE huggingface, TOKEN '{tok}')")

log("Querying for client_0797ff3a1fc9a6a5 in March 2026...")
res = con.sql("""
    SELECT COUNT(*) as cnt 
    FROM read_parquet('hf://datasets/FlyRank/internship-warehouse/fact_content_daily_performance/month=2026-03/*.parquet') 
    WHERE client_hash_id = 'client_0797ff3a1fc9a6a5'
""").df()
log(f"Done! Count: {res.iloc[0]['cnt']}")
