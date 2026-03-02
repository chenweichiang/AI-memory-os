# 🧠 Universal AI Long-Term Memory Framework (全域 AI 長期記憶與動態工作流藍圖)

---

## 一、核心挑戰與解決方案

**核心挑戰：AI 代理面臨的三大陷阱**
現代 AI Coding Agent (如 Antigravity, Cursor, Windsurf) 雖然擁有強大的推理能力，但在接手真實世界的專案時，經常面臨三大致命陷阱：
1. **記憶斷層 (Context Fragmentation)**：每次開啟新對話，AI 皆從零開始，導致重複提示錯誤決策、忽視專案既定安全規範 (如備份路徑、憑證管理)。
2. **破壞性干涉 (Destructive Interference)**：AI 經常無法區分「全新專案」與「既有專案」，容易在接手機構舊專案時，使用預設模板盲目覆寫或破壞已穩定運行的環境與資料。
3. **工具盲區 (Operational Rigidity)**：習慣使用基礎、無效率的指令 (如單純的 `pip`, 迴圈爬蟲)，而不會主動利用現代化工具鏈 (如 `uv`, `pytest`, `rclone`, `Docker`) 來確保執行安全與隔離性。

**我們的解決方案：全域融合框架**
本框架 (Universal AI Long-Term Memory Framework) 徹底捨棄了「讓 AI 每次重頭掃描程式碼」的單一作法。我們建構了一個**三位一體**的解決方案：
- **五階段動態工作流 (5-Phase Dynamic Workflow)**：賦予 AI 稽核環境、動態規劃與自我修復的行為準則。
- **四層記憶架構 (Four-Layer Memory Architecture)**：將設定檔、除錯血淚史與海量雲端數據，轉換為 AI 隨觸可及的持久化記憶。
- **現代化工具鏈標準 (Modernized Toolchain)**：硬性規定 AI 的操作手段，消弭執行環境的不確定性。

透過這套框架，任何新接手專案的 AI 代理，都能瞬間具備等同於「資深專案維護者」的全域視野與操作紀律。

---

## 二、四層全域記憶架構 (Four-Layer Global Memory Architecture)

環境與工具是手腳，而記憶是 AI 的大腦。本系統由淺入深、由本地到雲端，為 AI 部署了四道防護網，確保知識的永久傳承：

```text
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: 結構化實體記憶 (Structured Physical Memory)         │
│  → 載體：AGENTS.md, GEMINI.md, config/ (SSoT)                │
│  → 觸發時機：Phase 1 啟動任務時必讀                            │
│  → 作用：專案的「憲法」與當下狀態。提供最高執行準則。             │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: 本地語義向量記憶 (Local Semantic Memory)             │
│  → 載體：LanceDB (無伺服器) + HuggingFace Embeddings         │
│  → 觸發時機：需要檢索跨檔案的架構脈絡或程式碼實作時                │
│  → 作用：將全專案程式碼與文件向量化，提供 AI 語義精準檢索能力。   │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: 對話經驗摘要索引 (Conversation Experience Digest)    │
│  → 載體：conversation_digest.py 打包歷史對話寫入 LanceDB       │
│  → 觸發時機：當遇到 Bug 或在 Phase 2 規劃遇到設計難點時          │
│  → 作用：繼承過去對話的除錯歷程、技術決策與失敗教訓，避免重蹈覆轍。 │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: 雲端原生大數據記憶 (Cloud-Native Semantic Memory)  │
│  → 載體：LlamaIndex (RAG 核心) + Rclone (極速過濾樹狀結構)     │
│  → 觸發時機：面臨超出儲存上限的海量研究素材或雲端營運資料時        │
│  → 作用：打破本地磁碟限制，讓 AI 動態存取 Google Drive 上的海量知識庫。│
└──────────────────────────────────────────────────────────────┘
```

---

## 三、動態代理工作流與記憶生命週期 (Dynamic Agentic Workflow)

本框架不只提供靜態記憶，更定義了 AI 代理 (Agent) 接手專案時應遵循的**動態決策型 (Dynamic Reasoning)** 工作流。AI 應避免死板的單向執行，並自主判斷何時規劃、執行、除錯與記憶，遵循以下五階段閉環 (Phase 0 ~ 4)：

### 0. Phase 0: 環境稽核與初始化 (Environment Audit & Initialization)
- **觸發時機**：首次接手專案或啟動任務前。
- **動作**：AI 在執行任何實質變更前，必須先透過工具 (`list_dir`, `view_file`) 探勘工作目錄，判斷當前是「全新專案」還是「既有專案」。
  - **既有專案 (Existing Projects)**：主動找出既有的環境設定 (如 `uv.lock`, `.venv`, `docker-compose.yml`) 與資料庫路徑。若發現缺漏現代化必備工具 (如 `pytest`, `rclone`) 或本架構的記憶載體 (`AGENTS.md`, `.lancedb`)，AI 應以「就地升級」的態度進行安裝補齊，並協助將零散腳本整併入標準化目錄 (如 `config/`, `scripts/`)。**嚴禁無視既有環境直接覆寫或重複配置。**
  - **全新專案 (Greenfield Projects)**：從零建立標準化目錄結構，並執行核心工具鏈初始化 (如 `uv init`)。

### 1. Phase 1: 啟動與全域感知 (Context Retrieval & Localization)
- **觸發時機**：完成 Phase 0 環境稽核後，正式處理使用者的 `/start` 任務或新需求時。
- **動作**：AI 必須首先硬性讀取專案根目錄的 `AGENTS.md` (守則與狀態)，接著利用 `sys-ask` 檢索 LanceDB 提取過往的除錯血淚史與技術決策。
- **目標**：將使用者的「歷史習慣 (Habits)」與「當下意圖 (Intent)」疊加，建立強大的上下文，作為後續執行的最高準則，絕不盲目猜測。

### 2. Phase 2: 動態推論 (Dynamic Planning)
- **觸發時機**：AI 充分理解上下文後。
- **動作**：由 AI 評估任務難度。
  - **低難度**：直接切換至執行模式修改程式碼，不硬性要求產出計畫書。
  - **高難度**：強制進入規劃模式。AI 必須產出防禦性計畫 (如 `implementation_plan.md`)，並主動暫停執行，**等待使用者審閱與核准後才能開工**。若缺乏關鍵配置或權限，也需在此刻向使用者討要。
  - **工具選型與腳本決策 (Tool Selection & Scripting)**：
    - **導入成熟開源庫**：在手刻複雜邏輯前，AI **必須**先評估是否已有業界成熟工具（例如查閱 Awesome Lists 找出最佳實踐，以 `rclone` 取代手刻 API 遞迴）。
    - **撰寫 Shell Script 的時機**：面對需重複執行的系統操作（伺服器維護、備份、批次清理、環境建置）或排程任務時，AI 應主動將指令封裝為 Shell Script (`.sh`) 並歸檔至 `scripts/` 目錄，確保操作可復現且能被 Git 版控，杜絕依賴一次性終端機指令。

### 3. Phase 3: 閉環執行與自我修復 (Self-Healing Execution)
- **觸發時機**：進入工具操作階段 (修改檔案、Terminal 執行)。
- **動作**：AI 在寫碼或下達指令後，**必須主動觸發驗證機制 (Verification)**：
  - **即時輸出審計 (Immediate Output Audit)**：不論 Exit code，須立即分析 stdout/stderr。主動搜尋 `Error`, `Warning`, `Failed`, `Missing`, `Not found` 等關鍵字，確認實質結果。
  - **實體狀態驗證 (Post-Execution Verification)**：操作後立即檢視目標狀態。涉及檔案則 `ls` 或 `view_file`；涉及服務則 `docker ps` 或檢查 Healthcheck。
  - **缺漏稽核 (Omission Audit)**：完成大項操作後，主動對照原始需求，確認無「孤兒檔案」或遺漏的參數調整。
- **平台相容性與語法稽核 (Platform Compatibility & Syntax Audit)**：在引入特定平台標籤 (如 MediaWiki 的 `<syntaxhighlight>`) 或依賴擴充功能前，AI **必須**先確認目標環境是否支援。若不支援，應回歸標準相容語法 (如 `<pre>`) 或尋找替代方案，嚴禁盲目產出無效語法。
- **工具試配與靈活替換 (Tool Adjustment & Pivot)**：引入新工具或腳本後，先以最小範圍 (Dry-run) 實測。若遭遇版本不相容或文件過時，AI 應自主搜尋最新解法調適；若評估修復成本過高，須果斷判定工具不適任並切換替代方案，不陷入死胡同。
- **自我修復與求援 (Self-Healing & Escalation)**：若遇報錯 (黃燈)，AI 需自主讀取 Log，微調 (例如調用 `uv` 補裝依賴套件) 後重新重試，不立刻打擾使用者。僅在連續失敗 3 次或遭遇不可逆的致命錯誤 (紅燈) 時，才中斷迴圈，並帶著精煉的 Error Log 向使用者求援。

### 4. Phase 4: 經驗收斂與記憶持久化 (Evidence Logging)
- **觸發時機**：任務結束或使用者輸入 `/end`。
- **動作**：AI 將本回覆中自創的新解法、除錯血淚史等「經驗」，濃縮成文字寫回 `AGENTS.md` (Decision Log)，並主動清理本次任務產生的暫存檔，保持專案整潔。
- **版本控制衛生 (Git Hygiene)**：執行 Git 提交前，需用 `git status` 檢查變更，並撰寫具描述性的 Commit Message，避免無意義的巨型提交 (Monolithic commit)。
- **自動化**：執行 Git Push，觸發 `pre-push` hook 呼叫 `ingest.py`，將最新經驗刻入 LanceDB。

---

## 四、AI 開發工具鏈標準 (Standard AI Toolchain)

為了配合上述的「自我修復機制」與「執行驗證」，AI 接手本框架專案時，**必須預設使用以下現代化工具鏈**，這攸關操作速度、環境隔離與系統安全：

### 1. Python 環境與套件管理：`uv`
- **為什麼用**：極致的解析與安裝速度（比傳統 pip 快數十倍）。當 AI 在背景自我修復（例如遇到 `ImportError` 隨即補裝套件）時，`uv` 能瞬間完成，不阻礙思路與工作流。同時能以 `.venv` 確保專案環境絕對隔離鎖定。
- **怎麼用**：
  - 環境初始化：`uv init` / `uv venv`
  - 安裝套件：`uv pip install <package>` (而非 `pip install`)
  - 執行腳本：`uv run <script.py>` (自動使用虛擬環境，無須 source 啟動)
- **macOS 穩定性提示**：在 macOS 環境下，為避免 Python `requests` 分送時遭遇 SSL 憑證檢查失敗，AI 應主動在維護腳本中整合 `certifi` 並重置 `ssl._create_default_https_context`。

### 2. 自動化測試驗證：`pytest`
- **為什麼用**：呼應 Phase 3 的「主動驗證」。AI 修改核心程式碼後，必須透過測試來證明邏輯正確，或是捕獲邊界錯誤 (Edge Cases)，嚴禁假設程式碼會動就直接交差，更要避免人肉除錯。
- **怎麼用**：
  - 運行測試：`uv run pytest <test_file.py> -v`
  - 寫入測試：針對每個複雜邏輯變更，AI 應主動在 `tests/` 目錄建立測試案例。

### 3. 雲端檔案大數據讀取與備份：`rclone`
- **為什麼用**：傳統 API (如 Google Drive) 的遞迴抓取極易觸發 Rate Limit，或落入無窮迴圈（例如誤掃出幾萬個 `node_modules`）。`rclone` 的 `--fast-list` 與實體 `purge` 能秒殺並過濾萬級檔案，是 AI 整理大數據與建構 Layer 4 (雲端記憶) 的唯一指定工具。
- **怎麼用**：
  - 極速尋找/產出清單：`rclone lsjson "remote:path" --fast-list`
  - 實體抹除廢物檔案：`rclone purge "remote:path/to/garbage"`

### 4. 基礎設施與微服務隔離：`Docker`
- **為什麼用**：確保開發、測試與正式環境的絕對一致。透過 Compose 配置 `deploy.resources` (CPU/Memory 上限)，能有效防止單一 AI 工具或服務失控吃光記憶體，導致全系統 OOM 崩潰。
- **怎麼用**：
  - 啟動與更新：`docker compose up -d`
  - 驗證健康度：`docker ps` / `docker logs --tail 50 <service_name>`

### 5. 基礎設施自動化佈建 (IaC)：`Ansible`
- **為什麼用**：實踐多主機系統操作的自動化與版本控制。舉凡設定的反向代理、服務更新、到環境變數同步，都應透過 Ansible playbook 完成，避免 SSH 隨機修改造成「配置漂移」。
- **怎麼用**：
  - 執行部署：`ansible-playbook -i ansible/inventory.ini ansible/playbooks/<service>.yml`

### 6. 全量測試與實體狀態驗證：`Testinfra` & `Bats`
- **為什麼用**：這是「全覆蓋測試」的靈魂。`pytest-testinfra` 讓 AI 能用 Python 撰寫測試來驗證伺服器的「最終實體狀態」（如目錄 UID 10000 是否正確），而 `Bats-core` 則負責 Shell 腳本的邏輯單元測試。
- **怎麼用**：
  - 運算狀態驗證：`uv run pytest tests/integration/ --hosts=remote-server`
  - 腳本單元測試：`bats tests/unit/test_script.bats`

---

## 五、Layer 1 實作：結構化檔案記憶

了解了工作流與工具後，從建立 `AGENTS.md` 開始架構專案記憶。

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
- 每一筆決策必須包含「最小結構化欄位 (Schema)」確保可維護性：
  - `Scope`: project / module / infra / security / data / user-pref
  - `Decision`: 決策內容與方向
  - `Confidence`: high / medium / low (避免將不確定的 workaround 奉為鐵律)
  - `Provenance`: 附上原始碼路徑、Commit Hash、或錯誤日誌片段 (確保可追溯)
  - `Review_after`: (選填) 標註這份決策或 workaround 是否有過期時效限制
  - `Status`: Active (生效中) / Obsolete (已廢棄) / Experimental (實驗中)
  - `Conflict_with`: 註記與哪一筆歷史決策產生矛盾 (編號或日期)
  - `Superseded_by`: 若決策已廢棄，指引至新的決策記錄
- 表格形式記錄：| Date | Scope | Decision | Confidence | Provenance | Review_after | Status | Conflict_with | Superseded_by |

## 系統安全與記憶邊界 (Security Boundaries)
- **永不寫入**：API Keys、存取權杖 (Tokens)、密碼、未脫敏的真實個資。
- **可寫入**：密鑰雜湊值 (Hash/Fingerprint)、憑證存取的系統變數或路徑 (如 Secret Manager 位置)。
- **共用記憶存取控制 (Shared Memory Access)**：
  - 在多 Agent 協作場景，應實施 **RBAC (基於角色的存取控制)**，例如維修 Agent 僅具備作業日誌讀取權限制。
  - 對於跨專案的共用向量庫，建議在儲存層實施加密 (如整合 Infisical 或加密 LanceDB 檔案)。

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

## 六、Layer 2 實作：語義向量記憶（LanceDB）

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

#### 5. 檢索策略升級建議 (Retrieval Upgrades)
為了降低無關片段的干擾，強烈建議在生產環境中將 `query.py` 擴充實作以下機制：
- **雙軌檢索 (Bimodal Retrieval: FTS + Vector)**：在工程領域中，「變數/函式名稱」或「錯誤碼」的精確比對 (Full-Text Search) 往往比語義更有效。建議：
    - **FTS (全文檢索)**：用於精確 Symbol 查找。
    - **Vector (向量語義)**：用於模糊意圖理解。
- **混合檢索 (Hybrid Retrieval)**：結合 BM25 與 Vector，實行召回分流：向量佔 70%，關鍵字佔 30%。
- **重排序 (Reranker)**：將初步檢索出的 Top-K 結果套用 Reranker 模型二次篩選，大幅減少跨檔案、跨模組時的誤取。
- **意圖路由 (Query Router)**：根據使用者的搜尋字串判斷 Intent (例如分流為 Debug, Architecture, Ops, Security)，動態路由查閱不同記憶層 (Layer 1~4)。

---

## 七、Layer 3 實作：對話摘要索引

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

## 八、Layer 4 實作：雲端原生語義記憶 (G-Drive / OneDrive)

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

---

## 九、核心指令工作流定義 (Core Workflows: /start & /end)

此兩項工作流是銜接動態代理閉環 (Phase 0~4) 的關鍵，必須具現化為獨立檔案供 AI 遵循。

#### 1. `/start` 工作流 — 新對話啟動與全域感知 
建立 `.agents/workflows/start.md`：

```markdown
---
description: 初始化專案記憶與全域感知
---
1. 執行環境稽核 (Phase 0)：判斷是全新或既有專案，檢查有無必要現代化套件 (`uv`, `pytest`) 或整併混亂的腳本。
2. 讀取 AGENTS.md（包含 Success Log, Decision Log, Roadmap）。
3. 多維度語義檢索 LanceDB (`sys-ask`) 提取歷史習慣與過往經驗。
4. 將「歷史習慣」與「當下意圖」結合，決定是否需要進入 Planning 模式，或是直接開始 Execution (Phase 1 & 2)。
5. 向使用者回報準備狀態。
```

#### 2. `/end` 工作流 — 對話結束保存與經驗收斂 
建立 `.agents/workflows/end.md`：

```markdown
---
description: 對話結束記憶保存與經驗收斂
---
1. 進行自我反思：盤點本次任務中是否創造了新工具腳本、新解法或經歷了除錯過程 (Phase 4)。
2. 執行記憶重組與過期淘汰 (Memory Reconsolidation & Pruning)：
   - **版本去重 (Versioning & Dedup)**：合併本次修改與過去相似的決策紀錄，若邏輯相同則更新日期而非新增。
   - **衝突解決 (Conflict Resolution)**：若同一個組件發現設定矛盾，標註 `Conflict_with` 並以最新解法覆蓋，將舊決策標註為 `Obsolete` 並填入 `Superseded_by`。
   - **權重調整 (Weighting & Decay)**：根據檢索召回次數 (Recall frequency) 增加權重；將長期未命中或超過 `Review_after` 的暫時性方案降權或歸檔。
   - **品質過濾**：剔除對話中產生的無效 workaround 或低信心度 (Confidence: low) 且無續航價值的紀錄。
3. 清理暫存：確保 /tmp 等無用測試資料已被清理移除。
4. 更新 AGENTS.md：
   - 將新知與解法濃縮，寫入符合最小 Schema (Scope, Confidence 等) 的決策紀錄。
   - Success Log 新增本次完成的工作。
5. 執行 Git commit + push (這步驟如果發現機密憑證外洩需觸發預防性阻擋，例如 gitleaks 攔截)。
6. 觸發 pre-push hook 即時更新 LanceDB 向量庫，並向使用者確認記憶已持久化。
```

> 💡 **提示：非 IDE 原生 Agent 隱式映射 (Tool-Agnostic Mapping)**
> `/start` 與 `/end` 的本質是一個雙向的 **狀態機 (State Machine)**。若您面臨無法使用自動化 `.agents/workflows` 的環境 (如自架機器人、單純網頁端 LLM Chat)，請確保該 Agent 每次接手循環任務時，開場與結尾都硬性通過提示詞強制套用這些步驟，以達成通用相容。

---

## 十、自動化：Git Hook Auto-Sync

建立 `.git/hooks/pre-push`，在每次推送時自動更新 LanceDB：

```bash
#!/bin/bash
echo "🧠 同步知識庫 (增量更新)..."

# 生產環境強烈建議：利用 git diff 計算改動檔名，實作「增量更新 (Incremental Indexing)」，取代全量重建。
python scripts/ingest.py

# 保護機制：若索引失敗，直接中斷 push，確保程式碼歷史與向量記憶永遠保持絕對同步，避免記憶斷層。
if [ $? -ne 0 ]; then
  echo "❌ 知識庫索引失敗！請檢查錯誤或執行 git push --no-verify"
  exit 1  
fi

echo "✅ 知識庫已更新"
```

---

## 十一、全新專案快速啟動清單 (Greenfield Quick Start Checklist)

在全新專案中，請 AI 依序完成 (若為既有專案，請改為「審閱並補齊」)：

- [ ] 執行專案環境初始化 `uv init`
- [ ] 建立 `AGENTS.md`（含 Persona, Success Log, Decision Log, Roadmap）
- [ ] 安裝 LanceDB 相關套件
- [ ] 建立 `scripts/ingest.py` 與 `scripts/query.py`
- [ ] 建立 `scripts/conversation_digest.py`
- [ ] 建立 `.agents/workflows/start.md` 與 `end.md`
- [ ] 設定 Git pre-push hook
- [ ] 設定 Shell 別名 `sys-ask`
- [ ] 測試 `sys-ask "專案概述"` 確認檢索正常

---

## 十二、全量覆蓋測試矩陣 (Total Coverage Testing Matrix)

為了確保專案的長期穩定性與「即時驗證」協議的落實，AI 必須建立並維護以下三層測試矩陣：

### 1. Static Layer: 靜態程式碼稽核 (Linting)
- **工具**：`ShellCheck` (Shell), `Ruff` (Python)。
- **目標**：在代碼執行前攔截語法錯誤、不安全變數引用與風格偏差。

### 2. Logic Layer: 腳本邏輯單元測試 (Unit Testing)
- **工具**：`Bats-core` (Shell), `Pytest` (Python)。
- **實作**：針對核心維護腳本 (如 `watchdog.sh`) 撰寫 Mock 測試，驗證邊界條件下（如網路斷線、磁碟滿載）的邏輯收斂性。

### 3. State Layer: 伺服器最終狀態驗證 (Integration/State)
- **工具**：`Testinfra` (Pytest 擴充)。
- **核心價值**：跨越「代碼正確」與「環境正確」的鴻溝。
- **驗證項目**：
    - 遠端目錄權限與 UID/GID (如 `uploads` 應歸屬特定容器用戶)。
    - Docker 容器 Healthcheck 狀態。
    - 系統服務埠 (Ports) 監聽狀態。
    - 磁碟空間與系統負載。

## 十三、通用記憶 OS (Unified Memory API)

當專案擴大，我們期待能跨越單一專案實現「跨代理由統一管理」時，強烈建議將 Layer 1 (AGENTS.md) 實體狀態 與 Layer 2/3 (LanceDB) 向量資料，聯合封裝為一個無差別存取的開放 **Memory API** 規格介面：

**API 規範建議**：
- `write(memory_item)`: 將符合最低 Schema 結構的單筆決策經驗，正規化並寫回系統。
- `query(intent, scope, text)`: 不管前端是 Cursor, Windsurf, 還是 CLI，都能藉由 Intent 自動路由提取四層記憶中的高相關性片段。
- `consolidate()`: 在背景定期對持久層進行 Dedup (去重) 與 Decay (過期淘汰) 維護。

---

## 十四、系統評測與驗收指標 (Evaluation Benchmarks)

當我們將這套實作從「最佳化規範」升格為「系統工具 OS」時，建議部署量化評測流程，驗證這套記憶架構是否切實減少了系統性錯誤。

- **硬性指標建議**：
  - **重複犯錯率 (Repeat Error Rate)**：觀測同規格的 Bug 在不同回合對話中是否發生二次出現。
  - **修復時效 (Time-to-fix & Iteration Count)**：追蹤專案除錯所需的「平均修復迭代次數」，確認記憶生效。
  - **檢索降噪率 (Irrelevant Retrieval Ratio)**：提取出的 Context Snippet 中，真正在當前任務有用的關聯精準比例。
  - **記憶庫成熟度 (Memory Maturity)**：統計 Decision Log 中 `Active` 與 `Obsolete` 的比例，以及 `Superseded` 鏈條的完整性。
  - **召回命中率 (Memory Hit Rate)**：統計 Phase 1 檢索出的資訊中，有多少比例被 Phase 2 的 Plan 採納。
- **測試驗證方式**：抽取與回放過去真實專案中發生過的「歷史長段血淚對話紀錄結合 Commit Logs」，引入新 AI Agent 進行盲測 (Replay Test)，觀測其是否因載入該框架與記憶而「免除重蹈覆轍」。

---

*本藍圖由 Interaction Lab 結合了 Antigravity AI 的實戰經驗產出，以解決新世代 AI 開發的協作痛點。*
