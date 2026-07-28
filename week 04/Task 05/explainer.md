# Workflows vs. Agents and the Model Context Protocol (MCP)

This document provides a technical explainer on the distinction between structured workflows and autonomous agents, describes the architecture and primitives of the Model Context Protocol (MCP), classifies the FL-04 drafting pipeline, and outlines the steps to upgrade it. It also documents the implementation and verification of a custom Python MCP server.

---

## 1. Workflows vs. Agents: The Control Flow Spectrum

The fundamental distinction between an AI workflow and an AI agent lies in the **flow of control**: who directs the sequence of execution.

*   **Workflows** are orchestrations where the sequence of LLM calls and tool invocations is predefined and hardcoded by the developer. The control path is deterministic. While the LLM generates natural language or processes data at individual steps, it does not decide *what step to take next*. Common workflow patterns include:
    *   **Prompt Chaining**: Executing sequential LLM prompts where the output of one serves as the input to the next.
    *   **Routing**: Classifying an input and sending it to a specialized prompt or model.
    *   **Evaluator-Optimizer**: One LLM generates a draft, another evaluates it against a rubric and generates structured feedback, and a third (or the original) refines the draft.
    Workflows are highly predictable, consistent, easy to test, and cost-effective, making them ideal for structured tasks with well-defined steps.

*   **Agents** are systems where the LLM dynamically determines its own execution path. The developer provides a goal, a set of tools, and an environment, but the model uses its reasoning capabilities to choose which tools to call, in what order, and when the goal has been successfully accomplished. Agents operate in a feedback loop, reacting to tool outputs and modifying their strategies in real-time. This autonomy makes them highly flexible and capable of handling complex, open-ended tasks, but at the cost of higher latency, increased API usage, and lower predictability.

---

## 2. Classification of the FL-04 Writing Pipeline

The FL-04 technical writing pipeline (Drafting -> Critiquing -> Revising) is classified as a **workflow**, not an agent. Specifically, it implements the **Evaluator-Optimizer** pattern.

The sequence of actions is entirely hardcoded:
1. The **Drafting Agent** generates an initial Markdown article based on an input brief.
2. The **Critiquing Agent** evaluates that draft against a 5-point rubric and writes a structured review.
3. The **Revising Agent** consumes the original draft, the brief, and the critique to output a polished version.

The flow of control is strictly linear: `Step 1 -> Step 2 -> Step 3`. The LLMs have no autonomy over the routing or termination of the process. For instance, the Critiquing Agent cannot decide that the draft is perfect and skip the revision step, nor can the Revising Agent decide to loop back and request a second critique. Because the control path is determined by the developer's execution script rather than the model's runtime decisions, it is a structured workflow.

---

## 3. What is Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is an open-source standard designed to connect AI models to external data sources and tools. Developed by Anthropic, it functions like a "USB-C port" for AI, resolving the M×N integration problem where every client previously needed custom integrations for every data source.

MCP establishes a client-server architecture with three main primitives:
1.  **Tools (Model-Controlled)**: Executable functions that the model can call to perform actions with side effects (e.g., executing a database query, running a script, or writing a file). The model decides when and how to call them.
2.  **Resources (Application-Controlled)**: Read-only data streams that the client exposes to the model to provide context (e.g., local file contents, API documentation, or log streams). These are static or dynamic data readouts without side-effects.
3.  **Prompts (User-Controlled)**: Pre-configured prompt templates exposed by the server to guide user interactions, making it easy to feed structured context to the model.

---

## 4. Upgrading FL-04 to a True Autonomous Agent

To transform the FL-04 workflow into a true autonomous agent, we must hand control of the execution path to the LLM. An agentic upgrade would require:
1.  **A Dynamic Evaluation Loop**: Instead of a single, linear Draft-Critique-Revise pass, the agent would run in an autonomous loop. The model would write a draft, execute a self-evaluation tool, and analyze the score. If the score is below a predefined threshold, it will call a revision tool. The loop terminates only when the model self-determines that the criteria are met, or when a safety iteration limit is reached.
2.  **Integration of External Tools**: The model should be equipped with MCP tools to gather facts and verify outputs:
    *   A **Search Tool** (e.g., Brave Search MCP) to query the web for real-time statistical facts or documentation.
    *   A **Local Code Executor** (e.g., a Python repl or terminal tool) to run any code examples in the draft, validating that they compile and run without errors.
    *   A **File/Git Reader** to search existing documentation templates and maintain style consistency.
3.  **Dynamic Action Planning**: The agent would start with a high-level task: *"Write a technical guide on CTR statistical scaling."* The agent would outline its plan, query search tools for calculations, execute python code to verify formula math, and write the draft. It would decide dynamically whether it needs more research or if the article is ready for final formatting.

---

## 5. Verification of the Custom MCP Server Setup

We have implemented a Python-based MCP server (`mcp_server.py`) and configured it in the Claude Desktop app. Below is the verification of the three custom tools that chat alone cannot do.

### Task 1: Inspecting Local System Resource Usage (Tool: `get_system_status`)
*   **Prompt to Claude**: "What is my current system status?"
*   **Action**: Claude Desktop calls `get_system_status()`.
*   **Tool Output**:
    ```text
    System Status:
    - OS: Windows 11 (AMD64)
    - CPU Usage: 9.7%
    - Memory: 81.2% used (12.40 GB / 15.26 GB)
    - Disk: 24.4% used (154.70 GB / 634.76 GB)
    ```

### Task 2: Fetching Real-Time Weather (Tool: `fetch_openmeteo_weather`)
*   **Prompt to Claude**: "Can you fetch the live weather in London?"
*   **Action**: Claude Desktop calls `fetch_openmeteo_weather(city="London")`.
*   **Tool Output**:
    ```text
    Current weather in London, United Kingdom (Lat: 51.51, Lon: -0.13):
    - Conditions: Mainly clear
    - Temperature: 26.9°C
    - Relative Humidity: 45%
    - Wind Speed: 10.8 km/h
    ```

### Task 3: Searching Local Repository Files (Tool: `find_local_files_containing_text`)
*   **Prompt to Claude**: "Search my local workspace files for any occurrences of the word 'DraftingAgent'."
*   **Action**: Claude Desktop calls `find_local_files_containing_text(search_text="DraftingAgent")`.
*   **Tool Output**:
    ```text
    Found 'DraftingAgent' in 3 files:

    File: week 04\Task 04\claude_project_instructions.md
      Line 11: Input[Input Outline / Brief] -->|Step 1: Draft| DraftingAgent[Drafting Agent]
      Line 12: DraftingAgent -->|Initial Draft| CritiquingAgent[Critiquing Agent]
      Line 14: DraftingAgent -.->|Initial Draft| RevisingAgent
      (truncated...)

    File: week 04\Task 04\walkthrough.md
      Line 16: Input[Input Brief] -->|Step 1: Draft| DraftingAgent["Drafting Agent (LLM)"]
      Line 17: DraftingAgent -->|Initial Draft| CritiquingAgent["Critiquing Agent (LLM)"]
      Line 19: DraftingAgent -.->|Initial Draft| RevisingAgent
      (truncated...)

    File: week 04\Task 05\test_mcp_locally.py
      Line 29: print("--- 3. Testing find_local_files_containing_text ('DraftingAgent') ---")
      Line 31: search_output = find_local_files_containing_text("DraftingAgent")
    ```
