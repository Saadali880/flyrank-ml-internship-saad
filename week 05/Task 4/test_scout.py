import os
import subprocess
import sys

# Reconfigure stdout/stderr for UTF-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

scout_script = r"D:\Flyrank\week 05\Task 4\refresh_scout.py"
briefs_dir = r"D:\Flyrank\docs\refresh_briefs"

test_cases = [
    {
        "url": "/ml-feature-engineering",
        "slug": "ml-feature-engineering",
        "expected_class": "🚨 REFRESH",
        "should_generate_brief": True
    },
    {
        "url": "/python-model-quantization",
        "slug": "python-model-quantization",
        "expected_class": "🔍 CTR TITLE EDIT",
        "should_generate_brief": True
    },
    {
        "url": "/logistic-regression-guide",
        "slug": "logistic-regression-guide",
        "expected_class": "📈 LAYOUT ENGAGEMENT",
        "should_generate_brief": True
    },
    {
        "url": "/duckdb-starter-guide",
        "slug": "duckdb-starter-guide",
        "expected_class": "✍️ CONTENT EXPANSION",
        "should_generate_brief": True
    },
    {
        "url": "/ai-agent-ethics",
        "slug": "ai-agent-ethics",
        "expected_class": "🛡️ MONITOR PERFORMANCE",
        "should_generate_brief": False
    }
]

print("Starting FlyRank Content Refresh Scout test suite...\n")

all_passed = True

for case in test_cases:
    url = case["url"]
    slug = case["slug"]
    expected = case["expected_class"]
    should_gen = case["should_generate_brief"]
    
    print(f"==================================================")
    print(f"Testing Case URL: {url}")
    print(f"Expected Outcome: {expected}")
    print(f"==================================================")
    
    brief_path = os.path.join(briefs_dir, f"refresh_brief_{slug}.md")
    if os.path.exists(brief_path):
        os.remove(brief_path)
        
    cmd = [sys.executable, scout_script, "--url", url]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", check=True)
        stdout = res.stdout
        print(stdout)
        
        if expected in stdout:
            print(f"✔ CLASSIFICATION VERIFIED: Found '{expected}' in log output.")
        else:
            print(f"✘ CLASSIFICATION ERROR: Could not find '{expected}' in log output.")
            all_passed = False
            
        if should_gen:
            if os.path.exists(brief_path):
                print(f"✔ BRIEF EXPORT VERIFIED: Brief created at {brief_path}.")
                with open(brief_path, "r", encoding="utf-8") as f:
                    content = f.read()
                if expected in content:
                    print("✔ BRIEF CONTENT VERIFIED: Classification matches brief header.")
                else:
                    print("✘ BRIEF CONTENT ERROR: Classification not found inside brief file.")
                    all_passed = False
            else:
                print("✘ BRIEF EXPORT ERROR: Expected brief file was not generated.")
                all_passed = False
        else:
            if os.path.exists(brief_path):
                print("✘ BRIEF EXPORT ERROR: Brief was generated for a MONITOR case.")
                all_passed = False
            else:
                print("✔ BRIEF EXPORT VERIFIED: Correctly skipped brief generation.")
                
    except subprocess.CalledProcessError as e:
        print(f"✘ COMMAND EXECUTION ERROR: Agent process crashed with exit code {e.returncode}.")
        print("Stdout:", e.stdout)
        print("Stderr:", e.stderr)
        all_passed = False
    print()

print("==================================================")
if all_passed:
    print("ALL 5 EVALUATION CASES PASSED SUCCESSFULLY!")
    sys.exit(0)
else:
    print("SOME TEST CASES FAILED. Check logs above.")
    sys.exit(1)
