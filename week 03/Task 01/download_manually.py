import os
import sys
import requests
import time

def log(msg):
    print(msg)
    sys.stdout.flush()

p = os.path.expanduser('~/.cache/huggingface/token')
with open(p, 'r') as f:
    tok = f.read().strip()

headers = {"Authorization": f"Bearer {tok}"}

def download_file(url, local_filename):
    log(f"Starting download: {url} -> {local_filename}")
    start_time = time.time()
    response = requests.get(url, headers=headers, stream=True)
    if response.status_code != 200:
        log(f"Failed to download. Status code: {response.status_code}")
        log(response.text)
        return False
        
    total_size = int(response.headers.get('content-length', 0))
    log(f"Total file size: {total_size / (1024*1024):.2f} MB")
    
    downloaded = 0
    last_print = time.time()
    
    with open(local_filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=1024*1024):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                current_time = time.time()
                if current_time - last_print >= 5:
                    pct = (downloaded / total_size) * 100 if total_size > 0 else 0
                    speed = downloaded / (1024*1024 * (current_time - start_time))
                    log(f"Downloaded: {downloaded / (1024*1024):.2f} MB ({pct:.1f}%) | Speed: {speed:.2f} MB/s")
                    last_print = current_time
                    
    log(f"Download complete: {local_filename} in {time.time() - start_time:.2f} seconds")
    return True

# Download March partition
url_march = "https://huggingface.co/datasets/FlyRank/internship-warehouse/resolve/main/fact_content_daily_performance/month=2026-03/data_0.parquet"
download_file(url_march, "march_performance.parquet")

# Download April partition
url_april = "https://huggingface.co/datasets/FlyRank/internship-warehouse/resolve/main/fact_content_daily_performance/month=2026-04/data_0.parquet"
download_file(url_april, "april_performance.parquet")
