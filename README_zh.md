# 🧠 AI 長期記憶工作環境建構指南

---

## 一、核心問題

AI Coding Agent 的記憶是**短暫的** — 每次新對話都從零開始。
本框架透過四層機制，讓 AI「回想起」過去的所有關鍵決策與工作成果。

---

## 二、四層記憶架構

```
┌─────────────────────────────────────────────────┐
│  Layer 1: 結構化檔案記憶 (File-Based Memory)     │
│  → AGENTS.md / GEMINI.md                         │
│  → AI 每次新對話優先讀取                           │
├─────────────────────────────────────────────────┤
│  Layer 2: 語義向量記憶 (Semantic Memory)          │
│  → LanceDB + Embedding Model                     │
│  → 支援自然語言檢索歷史脈絡                        │
├─────────────────────────────────────────────────┤
│  Layer 3: 對話摘要索引 (Conversation Digest)      │
│  → 自動掃描過去的對話記錄                           │
│  → 索引至 LanceDB 供語義檢索                       │
├─────────────────────────────────────────────────┤
│  Layer 4: 雲端原生語義記憶 (Cloud Semantic)       │
│  → Google Drive / OneDrive 深度整合             │
│  → LlamaIndex + Rclone 高速索引優化               │
└─────────────────────────────────────────────────┘
```

---

## 三、Layer 1：結構化檔案記憶

在專案根目錄建立 `AGENTS.md`，包含以下區塊：

#### 必要區塊

```markdown
# AGENTS.md

## AI Persona
- AI 的身分定義、語言偏好、行為準則

## 系統架構摘要
- 專案的核心技術棧、部署環境、關鍵路徑

## 變更紀錄 (Success Log)
- 按日期記錄每次對話完成的工作
- 格式：日期 → 主題 → 細項

## 技術決策紀錄 (Decision Log)
- 表格形式記錄 | 日期 | 決策 | 理由 | 結果 |
- AI 在新對話中優先閱讀此區塊

## 待辦事項 (Roadmap)
- [ ] 未完成項目
- [x] 已完成項目
```

#### 遵循 AGENTS.md 開放標準

`AGENTS.md` 已成為 AI Coding Agent 的[開放標準](https://agents.md)，受到 OpenAI Codex、Google Jules、Cursor、Windsurf、GitHub Copilot 等主流工具支援。

建立 `AGENTS.md` 時，建議參照標準格式，包含以下**通用區塊**：

```markdown
## Project overview        ← 專案架構與技術棧摘要
## Dev environment setup   ← 開發環境設定與指令
## Build and deploy        ← 建置與部署步驟
## Git workflow            ← 版控規範
## Coding style            ← 程式碼風格與慣例
## Testing instructions    ← 測試指令與規範
## Security considerations ← 安全策略
```

在此基礎上，加入本框架的**記憶專屬區塊**：

```markdown
## Memory system           ← 四層記憶架構說明
## 變更紀錄 (Success Log)   ← AI 每次更新的工作日誌
## 技術決策紀錄 (Decision Log) ← 結構化決策表格
## 待辦事項 (Roadmap)       ← 任務追蹤
```

> 📎 標準規範與相容工具列表：[https://agents.md](https://agents.md) / [GitHub](https://github.com/agentsmd/agents.md)

#### 規則

- AI 在每次對話結束前 **必須更新** Success Log 與 Decision Log。
- 此檔案是 AI 跨對話的 **核心長期記憶載體**。
- 透過 Git 版控，確保記憶不會遺失。

---

## 四、Layer 2：語義向量記憶（LanceDB）

#### 為何選 LanceDB

- **零伺服器**：嵌入式資料庫，無需額外服務。
- **高效能**：向量搜尋速度極快，適合本地開發。
- **Python 原生**：`pip install lancedb` 即可使用。

#### 建立方式

##### 1. 安裝依賴

```bash
pip install lancedb langchain-huggingface langchain-text-splitters sentence-transformers
```

##### 2. 建立索引腳本 `scripts/ingest.py`

```python
"""將專案檔案索引至 LanceDB"""
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

##### 3. 建立查詢腳本 `scripts/query.py`

```python
"""語義搜尋 LanceDB 知識庫"""
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

##### 4. 設定 Shell 別名

```bash
# 加入 ~/.zshrc 或 ~/.bashrc
alias sys-ask="python /path/to/project/scripts/query.py"
```

---

## 五、Layer 3：對話摘要索引

建立腳本自動掃描 AI IDE 的對話記錄目錄，將摘要索引至 LanceDB：

```python
"""掃描 AI 對話日誌，索引摘要至 LanceDB"""
# 適用 Antigravity: ~/.gemini/antigravity/brain/
# 適用 Cursor: ~/.cursor/conversations/  (如適用)
# 將 overview.txt, walkthrough.md, task.md 等檔案索引至
# LanceDB 的 conversation_digests 集合
```

> **關鍵**：不同 IDE 的對話儲存路徑不同，需根據實際環境調整。

---

## 六、Layer 4：雲端原生語義記憶 (G-Drive / OneDrive)

針對大規模的研究資料，本地儲存往往不足。將雲端空間整合為主要的知識來源：

#### 1. 優化策略：Rclone + LlamaIndex
- **Rclone**：用於極速的檔案列表與基礎操作。
- **LlamaIndex**：業界標準的雲端內容語義讀取 (RAG) 引擎。
- **私有 API**：引導使用者建立專屬 GCP Client ID，繞過公共配額限制。

#### 2. 實作範例 `scripts/llama_drive_indexer.py`
```python
from llama_index.readers.google import GoogleDriveReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

def sync_cloud():
    # 使用私有憑證確保高效能
    loader = GoogleDriveReader(client_secrets_path="config/google_drive_credentials.json")
    documents = loader.load_data(folder_id="您的根目錄ID")
    # 同步至 LanceDB (Layer 2)
```

#### 3. AI 操作準則
- 在雲端建立專屬的 `AI_Workspace` 資料夾，作為 AI 處理資料的緩衝區。
- 自動產生 `optimized_inventory.md` 清單並回傳至雲端，方便使用者隨時掌握雲端資產。

#### `/start` 工作流 — 新對話啟動與全域感知 (Context Retrieval)

建立 `.agents/workflows/start.md`：

```markdown
---
description: 初始化專案記憶與全域感知
---
1. 讀取 AGENTS.md（包含 Success Log, Decision Log, Roadmap）
2. 多維度語義檢索 LanceDB 提取歷史習慣 (Habits) 與過往經驗。
3. 檢查 git status 確認未提交變更。
4. 將「歷史習慣」與使用者的「當下意圖」結合，決定是否需要進入 Planning 模式，或是直接開始 Execution。向使用者回報準備狀態。
```

#### `/end` 工作流 — 對話結束保存與經驗收斂 (Evidence Logging)

建立 `.agents/workflows/end.md`：

```markdown
---
description: 對話結束記憶保存與經驗收斂
---
1. 進行自我反思 (Self-Reflection)：盤點本次任務中是否創造了新解法或經歷了除錯過程。
2. 更新 AGENTS.md：
   - 將新知與解法濃縮寫入 Decision Log (形成永久習慣)。
   - Success Log 新增本次完成的工作。
   - Roadmap 更新完成狀態。
3. 執行對話摘要索引（conversation_digest.py）。
4. Git commit + push（觸發 pre-push hook 即時更新 LanceDB 向量庫）。
5. 向使用者確認記憶已持久化。
```

---

## 七、Git Hook 自動同步

建立 `.git/hooks/pre-push`，在每次推送時自動更新 LanceDB：

```bash
#!/bin/bash
echo "🧠 同步知識庫..."
python scripts/ingest.py
echo "✅ 知識庫已更新"
```

---

## 八、動態代理工作流與記憶生命週期 (Dynamic Agentic Workflow)

本框架不只提供靜態記憶，更定義了 AI 代理 (Agent) 應遵循的**動態決策型 (Dynamic Reasoning)** 工作流。AI 應避免死板的單向執行，並自主判斷何時規劃、執行、除錯與記憶，遵循以下四階段閉環：

### 1. Phase 1: 啟動與全域感知 (Context Retrieval)
- **觸發時機**：使用者輸入 `/start` 或給予新專案任務時。
- **動作**：AI 自動讀取 `AGENTS.md` (守則與習慣)，並透過 `sys-ask` 檢索 LanceDB 提取過往經驗。
- **目標**：用使用者的「歷史習慣 (Habits)」搭配「當下意圖 (Intent)」作為執行的最高準則，不盲目猜測。

### 2. Phase 2: 動態推論 (Dynamic Planning)
- **觸發時機**：AI 充分理解上下文後。
- **動作**：由 AI 評估任務難度。
  - **低難度**：直接切換至執行模式修改程式碼，不硬性要求產出計畫書。
  - **高難度**：強制進入規劃模式，產出防禦性計畫。若缺乏關鍵配置或權限，AI 需主動暫停並要求使用者提供指示。

### 3. Phase 3: 閉環執行與自我修復 (Self-Healing Execution)
- **觸發時機**：進入工具操作階段 (修改檔案、Terminal 執行)。
- **動作**：AI 在寫碼或下達指令後，**必須主動觸發驗證 (Verification)**，如檢視 log、執行 curl。
- **自我修復 (Self-Healing)**：若遇報錯 (黃燈)，AI 需自主讀取 Log、微調後重試，不立刻打擾使用者。僅在連續失敗或不可逆的致命錯誤 (紅燈) 出現時，才中斷迴圈向使用者求援。

### 4. Phase 4: 經驗收斂與記憶持久化 (Evidence Logging)
- **觸發時機**：任務結束或使用者輸入 `/end`。
- **動作**：AI 將本回覆中自創的新解法、除錯血淚史等「經驗」，濃縮成文字寫回 `AGENTS.md` (Decision Log)。
- **自動化**：執行 Git Push，觸發 `pre-push` hook 呼叫 `ingest.py`，將最新經驗刻入 LanceDB。

### 工作流總覽圖示

```text
使用者輸入 /start (或新指令)
    ↓
[Phase 1] 讀取 AGENTS.md + 檢索 LanceDB (喚醒習慣與上下文)
    ↓
[Phase 2] 動態推論任務難度 (簡單直上 / 複雜需計畫防呆)
    ↓
[Phase 3] 執行工具 (工具呼叫 ↔ 自動驗證與自我修復 閉環)
    ↓
[Phase 4] 經驗收斂 (將新解法寫入 AGENTS.md)
    ↓
使用者輸入 /end + Git push (觸發 LanceDB 永續寫入) ✅
```

---

## 九、快速啟動清單

在任何新專案中，請 AI 依序完成：

- [ ] 建立 `AGENTS.md`（含 Persona, Success Log, Decision Log, Roadmap）
- [ ] 安裝 LanceDB 相關套件
- [ ] 建立 `scripts/ingest.py` 與 `scripts/query.py`
- [ ] 建立 `scripts/conversation_digest.py`
- [ ] 建立 `.agents/workflows/start.md` 與 `end.md`
- [ ] 設定 Git pre-push hook
- [ ] 設定 Shell 別名 `sys-ask`
- [ ] 執行首次索引 `python scripts/ingest.py`
- [ ] 測試 `sys-ask "專案概述"` 確認檢索正常

---

## 十、注意事項

1. **`.lancedb/` 加入 `.gitignore`**：向量庫是本地的，不需要推送。
2. **`AGENTS.md` 必須推送**：這是跨環境的核心記憶。
3. **Embedding Model 選擇**：`all-MiniLM-L6-v2` 輕量快速，適合大多數場景。
4. **增量索引**：生產環境建議追蹤 mtime/size，避免全量重建。
5. **多專案共享**：可透過統一的 Memory API 實現跨專案語義檢索。

---

*本指南由 Antigravity AI 生成，基於 Interaction Lab 的實戰經驗。*
