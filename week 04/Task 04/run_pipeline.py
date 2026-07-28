import os
import argparse
import sys

# Define prompt templates
DRAFT_PROMPT_TEMPLATE = """You are a senior technical writer and ML engineer. Your goal is to draft high-quality, professional technical articles.
When given an input outline or topic, write a clear, comprehensive draft.

Rules:
1. Tone: Objective, technical, and authoritative. Avoid marketing fluff or overly generic introductions.
2. Structure: Use clean Markdown headers (H1, H2, H3), lists, and bold text for readability.
3. Detail: Include concrete technical details, mathematical formulations, or pseudocode where appropriate. Do not use placeholders or hand-waving explanations.
4. Formatting: Use code blocks (```python, ```sql, etc.) for code, and standard Markdown tables for comparison.

---
Draft a comprehensive, detailed technical article based on the following input:

INPUT BRIEF:
{input_brief}
---

Your response should contain only the draft article in clean Markdown, starting directly with the H1 title."""

CRITIQUE_PROMPT_TEMPLATE = """You are a principal technical editor and ML researcher. Your goal is to review draft technical articles and provide a detailed, critical review.
Be honest, strict, and constructive. Point out specific gaps, inaccuracies, or poor formatting.

Evaluate the draft against this 5-point rubric:
1. Technical Accuracy & Precision: Are the concepts (e.g. ML models, SEO metrics) explained correctly?
2. Readability & Structure: Is the logical flow clear? Are transitions smooth?
3. Completeness: Does the article address all aspects of the brief?
4. Tone & Professionalism: Is the tone objective and professional? Are there buzzwords or empty phrases?
5. Formatting & Examples: Are code blocks, lists, and tables used effectively?

Output format:
Your critique must be structured as follows:
### Rubric Evaluation
- **Technical Accuracy & Precision**: [Score /5 + explanation]
- **Readability & Structure**: [Score /5 + explanation]
- **Completeness**: [Score /5 + explanation]
- **Tone & Professionalism**: [Score /5 + explanation]
- **Formatting & Examples**: [Score /5 + explanation]

### Key Strengths
- [List 2-3 key strengths]

### Critical Gaps & Weaknesses
- [List 2-3 specific issues or gaps]

### Actionable Revision Instructions
- [List 3-5 specific, step-by-step instructions for the next agent to revise this draft]

---
Critique the following draft article based on the system rubric.

INPUT BRIEF:
{input_brief}

DRAFT ARTICLE:
{draft_content}
---

Your response should contain only the structured critique, starting with the evaluation section."""

REVISE_PROMPT_TEMPLATE = """You are a master technical editor. Your task is to revise an initial draft based on a critique report.
You must apply all actionable revision instructions, correct all highlighted weaknesses, and maintain or enhance the strengths.

Rules:
1. Address every single critique point.
2. Maintain clean, semantically correct Markdown structure.
3. Ensure no placeholder text, markers, or meta-commentary (e.g., "Here is the revised draft:") is present in the final output. Start directly with the H1 title.
4. Improve sentence flow and word choice for maximum impact and clarity.

---
Revise the draft article based on the critique report.

INPUT BRIEF:
{input_brief}

ORIGINAL DRAFT:
{draft_content}

CRITIQUE REPORT:
{critique_content}
---

Produce the final polished article in Markdown. Start directly with the H1 title and output nothing else."""

# 5 real inputs
DEFAULT_INPUTS = {
    1: {
        "title": "CTR Role in Search Ranking",
        "brief": "Explain the role of Click-Through Rate (CTR) in modern search engine ranking algorithms. Discuss how search engines use CTR as a dynamic signal (e.g., to adjust rankings based on user engagement) while guarding against click spam, clickbaity titles, and noise. Address how positional bias is corrected using statistical scaling (e.g. dividing by average CTR for that position)."
    },
    2: {
        "title": "Feature Leakage in Click Modeling",
        "brief": "Provide a deep dive into feature leakage when predicting search click decline. Detail how columns derived directly from the label (such as 'trend_direction' or 'trend_pct' which use the same traffic thresholds) lead to artificially perfect metrics during validation but fail on future datasets. Explain how to design a strict leakage audit and how client-level data splitting (rather than random row splitting) prevents client leak."
    },
    3: {
        "title": "Search Latency and Performance Budgets",
        "brief": "Analyze why a strict 14ms inference latency budget is critical for real-time search ranking queues. Contrast static heuristic scoring (which takes <1ms but is low-lift) with random forest / gradient boosted decision tree ensembles. Explain the hardware, caching, and software optimization techniques (like JS-compiled client-side trees or quantized decision boundaries) required to maintain sub-15ms execution."
    },
    4: {
        "title": "Heuristics vs Machine Learning for Content Prioritization",
        "brief": "Compare heuristic baseline rules with learned models (like Random Forests) for prioritizing content refresh opportunities. The baseline heuristic uses simple index queries (impressions > X and clicks decline > Y), yielding a Precision@50 of 0.24. The Random Forest model leverages historical click, impression, position, and change features, achieving a Precision@50 of 0.74 (+208% lift). Detail why the learned model is more robust."
    },
    5: {
        "title": "Tail Queries and Seasonal Noise in Search Queues",
        "brief": "Examine how tail queries (low-volume pages with <10 monthly impressions) and seasonal spikes (such as shopping holidays) act as major failure modes in automated content refresh models. Propose statistical safeguards, including baseline traffic threshold filters, confidence-interval-based click signals, and sliding-window average smoothing to prune noisy pages from the recommendation queue."
    }
}

def setup_directories():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    runs_dir = os.path.join(base_dir, "runs")
    os.makedirs(runs_dir, exist_ok=True)
    
    for i in range(1, 6):
        run_path = os.path.join(runs_dir, f"run{i}")
        os.makedirs(run_path, exist_ok=True)
        
        # Write default input.txt if it doesn't exist
        input_file = os.path.join(run_path, "input.txt")
        if not os.path.exists(input_file):
            with open(input_file, "w", encoding="utf-8") as f:
                f.write(DEFAULT_INPUTS[i]["brief"])
            print(f"Initialized {input_file}")

def get_run_status(run_dir):
    input_exists = os.path.exists(os.path.join(run_dir, "input.txt"))
    draft_exists = os.path.exists(os.path.join(run_dir, "draft.txt"))
    critique_exists = os.path.exists(os.path.join(run_dir, "critique.txt"))
    final_exists = os.path.exists(os.path.join(run_dir, "final.md"))
    
    if not input_exists:
        return "Not Started"
    elif not draft_exists:
        return "Awaiting Draft"
    elif not critique_exists:
        return "Awaiting Critique"
    elif not final_exists:
        return "Awaiting Revision"
    else:
        return "Completed"

def print_status():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    runs_dir = os.path.join(base_dir, "runs")
    
    print("\n=== PIPELINE RUN STATUS ===")
    print(f"{'Run ID':<8} | {'Topic':<45} | {'Status':<20}")
    print("-" * 80)
    for i in range(1, 6):
        run_dir = os.path.join(runs_dir, f"run{i}")
        status = get_run_status(run_dir)
        title = DEFAULT_INPUTS[i]["title"]
        print(f"Run {i:<4} | {title:<45} | {status:<20}")
    print("=" * 80)

def generate_prompts():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    runs_dir = os.path.join(base_dir, "runs")
    
    for i in range(1, 6):
        run_dir = os.path.join(runs_dir, f"run{i}")
        
        # Check input brief
        input_file = os.path.join(run_dir, "input.txt")
        if not os.path.exists(input_file):
            continue
            
        with open(input_file, "r", encoding="utf-8") as f:
            brief = f.read().strip()
            
        # Draft Prompt
        draft_prompt_file = os.path.join(run_dir, "step1_draft_prompt.txt")
        with open(draft_prompt_file, "w", encoding="utf-8") as f:
            f.write(DRAFT_PROMPT_TEMPLATE.format(input_brief=brief))
            
        # Critique Prompt (if draft exists)
        draft_file = os.path.join(run_dir, "draft.txt")
        if os.path.exists(draft_file):
            with open(draft_file, "r", encoding="utf-8") as df:
                draft_content = df.read().strip()
            critique_prompt_file = os.path.join(run_dir, "step2_critique_prompt.txt")
            with open(critique_prompt_file, "w", encoding="utf-8") as f:
                f.write(CRITIQUE_PROMPT_TEMPLATE.format(input_brief=brief, draft_content=draft_content))
                
            # Revision Prompt (if critique exists)
            critique_file = os.path.join(run_dir, "critique.txt")
            if os.path.exists(critique_file):
                with open(critique_file, "r", encoding="utf-8") as cf:
                    critique_content = cf.read().strip()
                revision_prompt_file = os.path.join(run_dir, "step3_revision_prompt.txt")
                with open(revision_prompt_file, "w", encoding="utf-8") as f:
                    f.write(REVISE_PROMPT_TEMPLATE.format(input_brief=brief, draft_content=draft_content, critique_content=critique_content))
                    
    print("\n[OK] Prompts generated for all runs based on current file states!")
    print("Check the prompt files in each runs/runX folder to copy-paste them to your AI tool.")

def main():
    parser = argparse.ArgumentParser(description="FlyRank Task 04 No-Code Writing Pipeline Coordinator")
    parser.add_argument("--init", action="store_true", help="Initialize folders and default briefs")
    parser.add_argument("--status", action="store_true", help="Check the current status of all runs")
    parser.add_argument("--generate-prompts", action="store_true", help="Generate or update prompt files for all steps")
    
    args = parser.parse_args()
    
    if len(sys.argv) == 1:
        parser.print_help()
        return
        
    if args.init:
        setup_directories()
        print_status()
    elif args.status:
        print_status()
    elif args.generate_prompts:
        generate_prompts()

if __name__ == "__main__":
    main()
