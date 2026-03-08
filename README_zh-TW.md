# 🧠 AI Memory OS — 藍圖產生器

[繁體中文](README_zh-TW.md) | [English](README.md)

[![線上 Demo](https://img.shields.io/badge/線上_Demo-project.interaction.tw-00C853?style=flat-square&logo=vercel)](https://project.interaction.tw/)
[![測試](https://img.shields.io/badge/測試-104%20通過-brightgreen?style=flat-square)](src/generators.test.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![AGENTS.md](https://img.shields.io/badge/標準-AGENTS.md-blue?style=flat-square)](https://agents.md/)

**AI Memory OS** 是一個零後端的 React 純前端應用程式，用來為 AI 程式助手（Cursor、Windsurf、GitHub Copilot 等）產生容器化工作空間藍圖。使用者透過視覺化介面配置專案設定，一鍵下載 ZIP 壓縮檔 —— AI 打開後即擁有完整的記憶系統、行為準則、以及領域專業知識。

> **不需要 API Key。不需要雲端服務。一切都在瀏覽器中完成。**

---

## ✨ 產出內容

每個下載的 ZIP 都是一個完整的 AI 工作空間藍圖：

| 檔案 | 用途 |
|---|---|
| `AGENTS.md` | AI 人格、規則、Decision Log、Cloud LLM 節約協議 |
| `SETUP.md` | AI 自動化建置的逐步指引 |
| `.agents/workflows/start.md` | Session 開始協議（上下文檢索、健康檢查）|
| `.agents/workflows/end.md` | Session 結束協議（記憶持久化、Git 提交）|
| `.agents/module_registry.json` | 機器可讀的模組清單與腳本路徑 |
| `Dockerfile` + `docker-compose.yml` | 隔離的容器化環境 |
| `scripts/system/health_check.py` | 6 項自我診斷腳本（永遠包含）|
| `docs/DOMAIN_CONTEXT.md` | 領域專屬最佳實踐與目錄慣例 |
| `docs/USER_GUIDE_ZH.md` / `EN.md` | 依勾選模組動態產生的雙語操作手冊 |

## 🎯 領域系統 (Domain System)

選擇一個領域，將**角色專屬的 AI 行為**注入到每個產出的檔案中：

| 領域 | AI 行為定位 | 核心規則 |
|---|---|---|
| 🔧 **通用工作** | 標準開發助手 | 程式碼品質、Commit 紀律、相依性管理 |
| 🎓 **學生專題** | 教學助教（引導思考，不直接給答案）| 學術誠信、中文文件、每週進度日誌 |
| 🎨 **設計類工作** | 設計感知型協作者 | 素材管理（SVG/壓縮圖片）、Design Tokens、WCAG 無障礙 |
| ⚡ **互動程式** | 即時效能專家 | 禁止在 `draw()` 做 I/O、硬體安全防護、Demo 隨時可展示 |

每個領域自動配置：
- **AGENTS.md 規則** — 領域專屬的程式碼標準
- **SETUP.md 步驟** — 目錄建置與模板初始化
- **start.md 查詢** — LanceDB 語義查詢指令或本機檔案瀏覽主題
- **推薦模組** — 根據領域需求預先勾選
- **Decision Log 種子** — 預填的架構決策條目
- **DOMAIN_CONTEXT.md** — 最佳實踐文件

## 🧩 模組系統 (Module System)

14 個可自由組合的模組，橫跨 5 大類別：

### 記憶與知識庫
| 模組 | 功能 |
|---|---|
| **LanceDB 向量資料庫** | 本機向量索引，附 `ingest.py` / `query.py` 語義搜尋 |
| **上下文打包器** | Session 開始時產生 `CONTEXT_SNAPSHOT.md` —— 零 Token 的全局意識 |
| **回應快取** | SQLite 語義快取（相似度 ≥ 92% → 跳過雲端 LLM 呼叫）|
| **對話摘要器** | 擷取並儲存 Session 摘要，建立長期記憶 |
| **雲端硬碟** | LlamaIndex 整合 Google Drive / OneDrive 文件索引 |
| **Ollama 本機 LLM** | 隔離的 Ollama 容器（gemma:2b），完全脫機的隱私生成環境 |

### CI/CD 與品質
| 模組 | 功能 |
|---|---|
| **Python 工具鏈** | `pyproject.toml` + pytest + ruff 設定 |
| **Git Hook** | Pre-push：GitLeaks 機密掃描 + LanceDB 自動同步 |
| **測試矩陣** | Testinfra（Docker 驗證）+ Bats-core（Shell 行為測試）|

### 基礎設施
| 模組 | 功能 |
|---|---|
| **Edge Gateway** | Caddy 反向代理 + 學術爬蟲白名單 |
| **Watchdog** | Crontab 健康監控 + Docker 服務自動重啟 |
| **IaC Ansible** | Ansible Playbook 遠端部署自動化 |

### 教育
| 模組 | 功能 |
|---|---|
| **作業繳交系統** | 5GB 直傳 CDN + Google OIDC 實名驗證 |

### 環境
| 模組 | 功能 |
|---|---|
| **學術 LaTeX** | TexLive + CJK 字型支援 |

## 🚀 使用方式

### 線上使用（推薦）
1. 前往 **[project.interaction.tw](https://project.interaction.tw/)**
2. 設定專案名稱、角色、部署範圍
3. 選擇領域（非必要但強烈建議）
4. 勾選需要的模組
5. 下載 ZIP → 解壓至專案目錄
6. 用 AI 編輯器開啟 → 告訴你的 AI：*「請閱讀 AGENTS.md 並執行 SETUP.md」*

### 本機開發
```bash
git clone https://github.com/chenweichiang/AI-memory-os.git
cd AI-memory-os
npm install
npm run dev      # → http://localhost:5173
npm test         # → 104 項測試
npm run build    # → 正式版建置
```

## 🏗 系統架構

```
src/
├── App.tsx              # UI：4 步驟精靈、領域選擇器、模組開關
├── generators.ts        # 所有 prompt/腳本 生成器（1460 行、104 測試）
├── generators.test.ts   # 完整覆蓋測試套件
├── domains/
│   ├── index.ts         # 領域登錄與型別定義
│   ├── general.ts       # 通用工作領域描述
│   ├── student.ts       # 學生專題領域描述
│   ├── design.ts        # 設計類工作領域描述
│   └── interactive.ts   # 互動程式領域描述
├── main.tsx             # React 進入點
└── index.css            # Tailwind 指引
```

**關鍵設計決策：**
- **零後端** — 所有生成邏輯都在瀏覽器端透過 TypeScript 字串模板完成
- **零 AI API 依賴** — 產生過程不消耗任何 Token
- **模組感知的 Prompt** — Cloud LLM 節約協議只顯示已啟用模組的步驟
- **領域感知的查詢** — `start.md` 在 LanceDB 啟用時產生可執行的查詢指令，否則列出本機檔案瀏覽主題

## 🧪 測試

```bash
npm test   # 104 項測試涵蓋：
```

| 類別 | 數量 | 涵蓋範圍 |
|---|---|---|
| 輔助函式 | 4 | 名稱淨化、容器命名 |
| 靜態模板 | 10 | 所有 Python/Bash 腳本驗證 |
| 卸載 | 10 | 模組專屬的卸載指引 |
| AGENTS.md | 7 | 人格、架構、LLM 協議 |
| SETUP.md | 9 | Docker、Python、先決條件 |
| 工作流程 | 7 | start.md / end.md 產生 |
| 基礎設施 | 18 | Dockerfile、Compose、Caddy、Ansible |
| 使用者文件 | 9 | 中英文指南產生 |
| 模組隔離 | 3 | 模組間無交叉污染 |
| 領域注入 | 7 | 規則、設定、查詢（每個領域）|
| Phase 4 | 9 | 健康檢查、模組登錄 |
| **總計** | **104** | |

## 👥 作者

- **Chiang, Chenwei（江振維）** — [Interaction Lab](https://interaction.tw)

## 📄 授權

基於 [MIT License](https://opensource.org/licenses/MIT) 開源發布。
採用 [AGENTS.md](https://agents.md/) 開放標準進行自主代理指導。
