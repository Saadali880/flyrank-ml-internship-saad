# Search Latency and Performance Budgets in Real-Time ranking

In high-performance search engine architectures, search ranking is structured as a multi-stage funnel designed to balance retrieval recall with scoring precision. While early-stage retrieval layers filter millions of candidate documents down to a few hundred matching items, the final re-ranking stage evaluates these candidates using complex machine learning models. To prevent query abandonment and maintain interactive responsiveness, the re-ranking layer must execute within a strict performance budget of 14ms.

---

## 1. Contextualizing the 14ms Latency Budget

Search engines operate under a total server response budget of 150ms. Beyond this threshold, users experience perceptible delays, leading to lower engagement. The table below outlines how the latency budget is distributed across the entire execution cycle:

| Step | Operation | Allocated Latency | Description |
| :--- | :--- | :--- | :--- |
| 1 | Network & DNS | 50ms - 80ms | Client request transit to the edge and back. |
| 2 | Candidate Retrieval | 15ms | Inverted index search, BM25 retrieval of top 1,000 matches. |
| 3 | Feature Extraction | 10ms | Hydrating candidate documents with historical click & user features. |
| **4** | **Re-ranking Inference** | **14ms** | Running GBDT / Random Forest models on candidates. |
| 5 | Snippet Generation | 15ms | Dynamically extracting text fragments for search results. |
| 6 | Page Rendering | 15ms | Serializing JSON, HTML generation, and page paint. |

If the re-ranking inference step exceeds 14ms, the engine is forced to fall back on raw heuristic scores or prune candidates, which reduces the search accuracy.

---

## 2. Heuristics vs. Machine Learning Ensembles

Search engines must trade off computational complexity for ranking accuracy:

### Static Heuristic Scoring ($<1\text{ms}$)
Traditional ranking relies on static scoring equations (e.g., BM25, TF-IDF) combined with static authority scores (e.g., PageRank). 
- **Mechanism**: Linear combination of term matching scores.
- **Compute cost**: Simple, vectorized float multiplications.
- **Limitation**: Cannot model non-linear interactions between features (e.g., matching a localized query with user location history).

### ML Ensemble Models ($>50\text{ms}$ unoptimized)
Modern ranking utilizes Gradient Boosted Decision Trees (GBDTs) and Random Forests to rank candidate items.
- **Mechanism**: Thousands of decision tree evaluations across features.
- **Compute cost**: Extremely high. Traversing hundreds of decision trees for 1,000 candidates involves significant CPU branch mispredictions and memory pointer hopping.

---

## 3. Software and Hardware Latency Optimization

To execute ML ensembles within the 14ms budget, search engines implement compilation, quantization, and structured caching.

### compiled Decision Trees (Pointerless Evaluation)
Traditional decision tree traversal uses node pointers, causing CPU L1/L2 cache misses. Compiling trees into native machine instructions or flat, nested `if-else` blocks in WebAssembly/JavaScript allows the compiler to optimize the instruction pipeline and make full use of the CPU's branch predictor.

Here is an example of a decision tree compiled directly into flat, pointerless JavaScript:

```javascript
// A compiled representation of a 3-depth decision tree predicting search relevance
function evaluateTree_0(features) {
    // features[0]: CTR (Normalized)
    // features[1]: PageRank
    // features[2]: User-query keyword matches
    
    if (features[0] <= 0.85) {
        if (features[2] <= 2.0) {
            return -0.45; // Leaf 1
        } else {
            return 0.12;  // Leaf 2
        }
    } else {
        if (features[1] <= 6.2) {
            return 0.35;  // Leaf 3
        } else {
            return 0.89;  // Leaf 4
        }
    }
}
```

### Quantized Decision Boundaries
Quantization maps floating-point features and decision splits from 32-bit float (`float32`) to 8-bit integers (`int8`). This reduces the memory footprint by 75% and accelerates execution by using SIMD (Single Instruction, Multiple Data) or integer arithmetic.

The linear quantization formula maps a float value $x$ to an integer value $q$:

$$q = \text{round}\left(\frac{x}{S}\right) + Z$$

Where:
- $S$ is the scale factor (a positive floating-point number).
- $Z$ is the zero-point integer representing the float value 0.0.

In the compiled trees, all comparison values (e.g., `features[0] <= 0.85`) are converted to `int8` boundary checks, allowing a single processor instruction to check multiple conditions simultaneously.

### Multi-Level Caching and Invalidation
To minimize re-ranking calls, search systems use a two-tiered caching system:
1. **Query Result Cache (QRC)**: Caches the final ranked SERP. It is invalidated using event-driven Webhooks when the underlying index updates.
2. **Feature & Score Cache (FSC)**: Caches individual document scores for common feature combinations. If a document's features and query parameters remain unchanged, its score is read directly from memory, bypassing tree inference entirely.
