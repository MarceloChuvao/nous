# NOUS OS Architecture: The Operating System for Agents

> **Vision:** A true Operating System where the **Main Agent is the Kernel**, managing resources, memory, and security for a ecosystem of specialized Agents (Processes) and Skills (Drivers).

---

## 1. The Metaphor: OS Components

| OS Concept | NOUS OS Equivalent | Description |
| :--- | :--- | :--- |
| **Kernel** | **Main Agent (NOUS)** | The central orchestrator. Manages resources, security, and context switching. |
| **Memory (RAM)** | **Short-term Context** | Active conversation window, immediate working memory. |
| **Memory (Swap)** | **Working Context** | `working/` directory. State of active tasks/projects. |
| **Disk (Storage)** | **Long-term Memory** | Vector DB (Semantic) + Firestore (Structured Profile). |
| **Processes** | **Agents** | Complex, stateful entities (e.g., Doctor, Accountant). |
| **Syscalls/Drivers** | **Skills** | Atomic capabilities (e.g., "Send Email", "Read PDF", "Search Web"). |
| **Permissions** | **Governance Layer** | Contracts, LGPD compliance, and security boundaries. |
| **Shell/UI** | **LENS (Voice/Text)** | The interface where the user interacts with the Kernel. |

---

## 2. The Kernel: Main Agent (NOUS)

The **Main Agent** is not just a chatbot; it is the **System Kernel**.

### Responsibilities:
1.  **Orchestration (Scheduler):** Decides which Agent (Process) needs to run to satisfy a user request.
2.  **Resource Management:** Monitors token usage (cost) and execution time. Kills "runaway" agents.
3.  **Context Switching:** Manages the flow of information between the User and multiple Agents.
    *   *Example:* User talks to "Doctor Agent", then switches to "Travel Agent". The Kernel ensures the Travel Agent doesn't see the medical data unless explicitly permitted.
4.  **Security Enforcement:** Enforces the Governance Layer (see Section 5).

### Architecture:
- **Runtime:** LangGraph (Stateful).
- **Router:** A specialized model (or lightweight classifier) that routes prompts to the correct Agent or Skill.

---

## 3. Memory Hierarchy

Just like an OS has a memory hierarchy for performance and persistence, NOUS OS has:

### Level 1: Short-term Memory (RAM)
- **What:** The current conversation session.
- **Tech:** In-memory context window of the LLM.
- **Characteristics:** Fast, ephemeral, expensive (tokens).
- **Use Case:** "What did I just say?"

### Level 2: Medium-term Memory (Swap/Working)
- **What:** The state of active tasks and projects.
- **Tech:** `working/` directory (Markdown files) + Redis/Firestore cache.
- **Characteristics:** Persistent across sessions but focused on *current* objectives.
- **Use Case:** "Where did we stop on the website redesign project?"

### Level 3: Long-term Memory (Disk)
- **What:** The user's entire history, knowledge, and profile.
- **Tech:**
    - **Structured:** Firestore (`PROFILE`, `CONTEXT`).
    - **Unstructured (Semantic):** Vector Database (e.g., Pinecone, Weaviate, or Supermemory.ai).
- **Characteristics:** Infinite retention, slower retrieval (requires search), semantic.
- **Use Case:** "What was that wine I liked 3 years ago?" or "Summarize my medical history from the last decade."

---

## 4. Process Management: Agents vs. Skills

We distinguish between **Agents** (Processes) and **Skills** (Syscalls).

### 🛠️ Skills (Atomic Capabilities)
- **Definition:** Stateless, single-purpose functions.
- **Examples:** `send_email`, `query_sql`, `convert_pdf_to_text`, `search_google`.
- **Creation:** No-code (Flowise) or Code.
- **Marketplace:** **Skill Store** (Drivers).
- **Orchestration:** Called by the Kernel or by Agents.

### 🤖 Agents (Complex Processes)
- **Definition:** Stateful, goal-oriented entities that use multiple Skills.
- **Examples:**
    - **Doctor Agent:** Uses `read_medical_record`, `search_pubmed`, `analyze_symptoms`.
    - **Travel Agent:** Uses `search_flights`, `book_hotel`, `check_weather`.
- **Creation:** Composed in Flowise (Agent Builder).
- **Marketplace:** **Agent Store** (Applications).

---

## 5. Governance Layer (Security & LGPD)

The "User Mode" vs. "Kernel Mode" protection.

### 📜 Contracts & Interfaces
- Every Agent must implement a standard **Interface Contract**:
    - `inputs`: What data it needs.
    - `outputs`: What it produces.
    - `permissions`: What it accesses.
- **Verification:** The Kernel verifies the contract before installing/running the Agent.

### 🛡️ Privacy & LGPD (Data Masking)
- **Middleware:** Before data is sent to an Agent, it passes through a Privacy Middleware.
- **PII Redaction:** Automatically masks CPF, Credit Card, Address (unless explicitly authorized).
- **Zero-Knowledge:** Long-term memory vectors are encrypted. The OS (Kernel) holds the keys, not the external Agents.

### 🚦 Permission System
- **Manifest:** Agents declare permissions in `agent.yaml` (e.g., `read:health`, `write:calendar`).
- **User Prompts:**
    - *Kernel:* "The 'Travel Agent' wants to access your 'Calendar'. Allow?"
    - *User:* "Allow once" / "Always allow".

---

## 6. The User Experience

1.  **User:** "NOUS, planeje uma viagem para a Itália."
2.  **Kernel (Main Agent):**
    - Identifies intent: `travel_planning`.
    - Checks Memory (Long-term): "User likes wine, prefers business class."
    - Spawns Process: **Travel Agent**.
3.  **Travel Agent:**
    - Request: "I need budget info."
4.  **Kernel:**
    - Checks Permissions: Travel Agent has `read:finance`? No.
    - Prompt User: "Travel Agent needs budget info. Share 'Finance Summary'?"
5.  **User:** "Yes."
6.  **Travel Agent:**
    - Uses Skill: `search_flights`.
    - Uses Skill: `search_hotels`.
    - Returns plan.
7.  **Kernel:**
    - Saves plan to `working/italy_trip/plan.md` (Medium-term memory).
    - Presents summary to User.

---

## 7. Roadmap for Implementation

1.  **Kernel Core:** Implement the Main Agent router and context switching logic in LangGraph.
2.  **Memory Layer:** Integrate a Vector DB for Long-term memory.
3.  **Skill Registry:** Define the standard schema for Skills (Syscalls).
4.  **Governance:** Implement the PII masking middleware and Permission Manager.
