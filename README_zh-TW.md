# 🧠 AI Memory OS Blueprint Generator

[![Deploy](https://github.com/chenweichiang/AI-memory-os/actions/workflows/deploy.yml/badge.svg)](https://interaction.tw/project_gen/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AGENTS.md 標準](https://img.shields.io/badge/standard-AGENTS.md-blue)](https://agents.md/)

AI Memory OS 藍圖產生器 (Blueprint Generator) 是一個基於 React 的純前端視覺化單頁應用程式 (SPA)。
這套系統的核心價值在於：**弭平「AI 提示詞工程」與「安全的伺服器維運架構 (DevOps Infrastructure)」之間的鴻溝**。
它允許開發者透過直覺的視覺化勾選介面，一鍵打包匯出專屬於自己 AI Agent (如 Cursor、Windsurf、GitHub Copilot) 的容器化隔離工作環境與長期記憶庫骨架。

與其手動刻寫 `AGENTS.md` 並掙扎於各種 Dockerfiles 的基礎建設，這個產生器能夠將：獨立網路架構、伺服器自癒機制 (Watchdog)、強制透過 Git hook 同步的向量記憶點，以及「不會破壞既有系統」的 AI 執行準則... 全部壓縮在一包緊湊的 ZIP 檔案中交付給您的 AI。

---

## 🚀 核心特色

- **搶佔式 AI 啟動 (零破壞防禦協定)**：匯出包內的 `SETUP.md` 裝載著能讓 AI 「自動自發」建置起環境的腳本。這些 Bash 指令強制 AI 在啟動前必須先審視本機狀態（例如 `if ! docker ps...`），防止 AI 覆蓋到正常運作中的系統。
- **嚴密的容器化隔離 (Strict Container Segregation)**：您的 AI 被強制囚禁在 Docker 環境內工作（透過 `.dockerenv` 設置實體路徑防線）。這確保了 AI 不會誤觸 Mac/PC 本機端的 `rm -rf /`，也不會弄髒本機的 Python 虛擬環境套件庫。
- **邊緣閘道與自癒架構 (適合 VPS 部署)**：自動生成帶有「學術爬蟲白名單」與「惡意機器人黑名單」的 Caddy 反向代理伺服器。並配有 Watchdog Crontab 腳本能偵測當機服務並自動重啟 Docker 容器。
- **語義記憶自動化 (Semantic Memory Automation)**：秒瞬生成 `LanceDB` (本地向量索引) 與 `LlamaIndex` (雲端掛載) 的 Python 架構。附帶 `pre-push` Git hook，霸道地確保 AI 在 Commit 程式碼前肯定得先乖乖將新知識向量化入庫。
- **三層式測試矩陣 (Testing Matrix)**：涵蓋 Testinfra (Docker 狀態驗證) 與 Bats-core (Shell 腳本行為測試) 的自動化測試樣板。

## 🛠 使用方式

1. **存取應用程式**：您可以直接造訪已部署的即時網頁 [https://interaction.tw/project_gen/](https://interaction.tw/project_gen/)，或者選用 `git clone` 並在本機執行 `npm run dev`。
2. **選擇部署受眾 (Scope)**：依據需求選擇 "純本機 (Local Only)"、"公開 VPS (Public VPS)" 或是 "全端環境 (Full Stack)"。
3. **配置細項模組**：勾選您希望加裝到 AI 大腦內的基礎建設與工具鏈（例如 Python Tooling、Ansible Playbook 遠端腳本部署、長時段對話摘要器等）。
4. **下載藍圖 ZIP**：點擊 下載，並解壓縮至您全新或既有的空白專案目錄下。
5. **啟動 AI Agent**：使用原生支援 AI 的文字編輯器 (例如 Cursor) 開啟該專案，並輸入首句通關密語：*"請閱讀 AGENTS.md 並執行初始環境設定。"*

## 📁 儲存庫結構 (Repository Structure)

這個專案由 **React**、**Vite** 以及 **TailwindCSS** 打造，並且依賴 `JSZip` 實作了純前端的字串壓縮封裝邏輯，無需依賴任何後端或資料庫即可運作。

\`\`\`
src/
├── App.tsx          // UI 邏輯、動態模組選單、JSZip 匯出實作
├── App.css          // Vanilla CSS (針對 TailwindCSS 的進階延伸)
├── index.css        // Tailwind 指引檔
\`\`\`

## 📚 設計動機 (Motivation)

在學術環境中深度依賴自主 AI (Autonomous Agents) 去產生大量自動化程式碼時，設定「絕對不可逾越的硬性防護欄」是重中之重。AI Memory OS 誕生於互動設計實驗室 (Interaction Lab)。我們希望能將包含「記憶體限制 (`limits: memory: 2G`)」的環境約束，結合 AI Persona 主角的系統提示詞 (`AGENTS.md`)，一起打包進 Repo 內隨身攜帶。

讓每一支被派送下來處理專案的 AI，不論在誰的電腦上，都面臨著「絕對相同的環境限制與最高指令準則」。

## 👥 作者群

- **Chiang, Chenwei (江振維)** - Interaction Lab

## 📄 授權與標準 (License & Standards)

本專案強烈推行 [AGENTS.md](https://agents.md/) 輔助機器人指導標準系統。
基於 MIT License 開源發布。
