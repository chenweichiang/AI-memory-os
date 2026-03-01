# 🧠 Universal AI Long-Term Memory Framework

---

## I. The Core Problem
AI Coding Agents have "short-term memory"—each new conversation starts from scratch. This framework uses a three-layer mechanism to let the AI "recall" all past key decisions and work results.

---

## II. Three-Layer Memory Architecture

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Structured File-Based Memory           │
│  → AGENTS.md / GEMINI.md                         │
│  → AI prioritizes reading these at the start     │
├─────────────────────────────────────────────────┤
│  Layer 2: Semantic Vector Memory                 │
│  → LanceDB + Embedding Model                     │
│  → Supports natural language historical retrieval │
├─────────────────────────────────────────────────┤
│  Layer 3: Conversation Digest Index              │
│  → Automatically scans past conversation logs    │
│  → Indexed into LanceDB for semantic search      │
├─────────────────────────────────────────────────┤
│  Layer 4: Cloud-Native Semantic Memory           │
│  → Google Drive / OneDrive Integration           │
│  → LlamaIndex + Rclone for high-speed indexing   │
└─────────────────────────────────────────────────┘
```

---

## III. Layer 1: Structured File-Based Memory

Create an `AGENTS.md` in the project root containing the following sections:

#### Mandatory Sections

```markdown
# AGENTS.md

## AI Persona
- AI identity definition, language preferences, behavior guidelines

## System Architecture Summary
- Core tech stack, deployment environment, critical paths

## Success Log
- Work completed per conversation, sorted by date
- Format: Date → Topic → Details

## Decision Log
- Table format: | Date | Decision | Rationale | Result |
- AI should prioritize reading this in new conversations

## Roadmap
- [ ] In-progress/To-do items
- [x] Completed items
```

#### Adhering to the AGENTS.md Open Standard

`AGENTS.md` has become an [open standard](https://agents.md) for AI Coding Agents, supported by OpenAI Codex, Google Jules, Cursor, Windsurf, GitHub Copilot, and more. 

When creating `AGENTS.md`, it is recommended to follow the standard format with these **common sections**:

```markdown
## Project overview        ← Summary of architecture and tech stack
## Dev environment setup   ← Setup instructions and commands
## Build and deploy        ← Build and deployment steps
## Git workflow            ← Version control guidelines
## Coding style            ← Standards and conventions
## Testing instructions    ← Commands and testing rules
## Security considerations ← Security strategy
```

On this foundation, add the **memory-specific sections** of this framework:

```markdown
## Memory system           ← Explanation of the three-layer architecture
## Success Log             ← Work log updated by AI per session
## Decision Log            ← Structured decision table
## Roadmap                 ← Task tracking
```

> 📎 Standard Spec & Compatible Tools: [https://agents.md](https://agents.md) / [GitHub](https://github.com/agentsmd/agents.md)

#### Rules

- The AI **must update** the Success Log and Decision Log before ending each conversation.
- This file is the **core long-term memory carrier** across conversations.
- Use Git version control to ensure memory is never lost.

---

## IV. Layer 2: Semantic Vector Memory (LanceDB)

#### Why LanceDB?

- **Serverless**: Embedded database, no extra services required.
- **High Performance**: Extremely fast vector search, ideal for local development.
- **Python Native**: Just `pip install lancedb`.

#### Implementation

##### 1. Install Dependencies

```bash
pip install lancedb langchain-huggingface langchain-text-splitters sentence-transformers
```

##### 2. Create Indexing Script `scripts/ingest.py`

```python
"""Index project files into LanceDB"""
import lancedb
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH = PROJECT_ROOT / ".lancedb"
COLLECTION = "project_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def ingest():
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    db = lancedb.connect(DB_PATH)
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    data = []

    for pattern in ["*.md", "*.py", "*.yml", "*.yaml", "*.json"]:
        for f in PROJECT_ROOT.rglob(pattern):
            if any(x in f.parts for x in [".git", ".venv", "__pycache__", ".lancedb"]):
                continue
            try:
                content = f.read_text(encoding="utf-8")
                for chunk in splitter.split_text(content):
                    data.append({
                        "vector": embeddings.embed_query(chunk),
                        "text": chunk,
                        "source": str(f.relative_to(PROJECT_ROOT)),
                    })
            except Exception:
                continue

    if data:
        if COLLECTION in db.table_names():
            db.drop_table(COLLECTION)
        db.create_table(COLLECTION, data=data)
        print(f"✅ Indexed {len(data)} chunks")

if __name__ == "__main__":
    ingest()
```

##### 3. Create Query Script `scripts/query.py`

```python
"""Semantic search for LanceDB KB"""
import sys, lancedb
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings

DB_PATH = Path(__file__).parent.parent / ".lancedb"
COLLECTION = "project_knowledge"

def query(text, limit=5):
    db = lancedb.connect(DB_PATH)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vec = embeddings.embed_query(text)
    table = db.open_table(COLLECTION)
    results = table.search(vec).limit(limit).to_list()
    for i, r in enumerate(results, 1):
        score = max(0, 1.0 - r.get("_distance", 1.0))
        print(f"[{i}] {r['source']} ({score:.2f})")
        print(f"    {r['text'][:300]}")

if __name__ == "__main__":
    query(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else "project overview")
```

##### 4. Set Shell Aliases

```bash
# Add to ~/.zshrc or ~/.bashrc
alias sys-ask="python /path/to/project/scripts/query.py"
```

---

## V. Layer 3: Conversation Digest Indexing

Build a script to automatically scan the conversation logs directory of your AI IDE and index summaries into LanceDB:

```python
"""Scan AI conversation logs and index summaries into LanceDB"""
# For Antigravity: ~/.gemini/antigravity/brain/
# For Cursor: ~/.cursor/conversations/ (if applicable)
# Index files like overview.txt, walkthrough.md, and task.md into 
# the conversation_digests collection in LanceDB.
```

> **Key**: Paths vary by IDE; adjust according to your actual environment.

---

## VI. Layer 4: Cloud-Native Semantic Memory (G-Drive / OneDrive)

For large-scale research data, local storage is insufficient. Integrate cloud storage providers as a primary knowledge source:

#### 1. Optimization Strategy: Rclone + LlamaIndex
- **Rclone**: Used for lighting-fast file listing and management.
- **LlamaIndex**: Used for industry-standard semantic ingestion (RAG) of cloud content.
- **Custom API**: Use a private Google Cloud Client ID/Secret to avoid shared rate limits.

#### 2. Implementation Sample `scripts/llama_drive_indexer.py`
```python
from llama_index.readers.google import GoogleDriveReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

def sync_cloud():
    # Use private credentials for high performance
    loader = GoogleDriveReader(client_secrets_path="config/google_drive_credentials.json")
    documents = loader.load_data(folder_id="YOUR_ROOT_FOLDER_ID")
    # Index into LanceDB (Layer 2)
    # ... indexing logic ...
```

#### 3. Rules for AI
- Always create a dedicated `AI_Workspace` folder on the cloud for AI-generated data.
- Generate a markdown inventory (`optimized_inventory.md`) and upload it back to the cloud for easy user review.

#### `/start` Workflow — New Conversation Initialization

Create `.agents/workflows/start.md`:

```markdown
---
description: Initialize project memory
---
1. Read AGENTS.md (Success Log, Decision Log, Roadmap)
2. Perform multi-dimensional semantic search in LanceDB:
   - Current system status and to-dos
   - Recent conversation summaries
   - User preferences and instructions
3. Check `git status` for uncommitted changes
4. Report memory summary to the user
```

#### `/end` Workflow — Conversation Persistence

Create `.agents/workflows/end.md`:

```markdown
---
description: Conversation end memory persistence
---
1. Update AGENTS.md:
   - Add current work to Success Log
   - Add tech decisions to Decision Log (if any)
   - Update Roadmap status
2. Execute conversation digest indexing (conversation_digest.py)
3. Git commit + push (triggers pre-push hook to update LanceDB main index)
4. Confirm memory persistence to the user
```

---

## VII. Git Hook Auto-Sync

Create `.git/hooks/pre-push` to automatically update LanceDB on every push:

```bash
#!/bin/bash
echo "🧠 Syncing knowledge base..."
python scripts/ingest.py
echo "✅ Knowledge base updated"
```

---

## VIII. Memory Lifecycle Overview

```
User inputs /start
    ↓
AI reads AGENTS.md (Structured Memory)
    ↓
AI queries LanceDB (Semantic Memory + Conversation Digests)
    ↓
AI "recalls" historical context and starts work
    ↓
Conversation process (Full Memory)
    ↓
User inputs /end
    ↓
AI updates AGENTS.md (Writes new memory)
    ↓
AI runs conversation_digest (Indexes conversation summary)
    ↓
Git push (triggers pre-push hook → ingest.py → LanceDB update)
    ↓
Memory persistence complete ✅
```

---

## IX. Quick Start Checklist

In any new project, have the AI complete these in order:

- [ ] Create `AGENTS.md` (with Persona, Success Log, Decision Log, Roadmap)
- [ ] Install LanceDB dependencies
- [ ] Create `scripts/ingest.py` and `scripts/query.py`
- [ ] Create `scripts/conversation_digest.py`
- [ ] Create `.agents/workflows/start.md` and `end.md`
- [ ] Set up Git pre-push hook
- [ ] Set up Shell alias `sys-ask`
- [ ] Run initial indexing `python scripts/ingest.py`
- [ ] Test `sys-ask "project overview"` to confirm retrieval

---

## X. Important Notes

1. **Add `.lancedb/` to `.gitignore`**: The vector store is local and does not need to be pushed.
2. **`AGENTS.md` must be pushed**: This is the core memory across environments.
3. **Embedding Model Selection**: `all-MiniLM-L6-v2` is lightweight and fast, suitable for most scenarios.
4. **Incremental Indexing**: In production, track mtime/size to avoid full rebuilds.
5. **Cross-Project Sharing**: Multi-project semantic search can be achieved through a unified Memory API.

---

*This guide was generated by Antigravity AI, based on real-world experience at Interaction Lab.*
