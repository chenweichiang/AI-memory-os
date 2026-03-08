# AI Memory OS — 學術研究發表機會分析

## 系統的學術定位

AI Memory OS 不只是一個工具，它本質上是一個 **AI Agent 行為塑造框架 (Behavior Shaping Framework)**。從 HCI/設計研究的角度，它觸及了三個當前學術熱區：

1. **AI-Mediated Development Environments** — 人如何透過「架構約束」而非直接指令來控制 AI 行為
2. **Scaffolded AI in Education** — AI 作為教學鷹架，而非代勞工具
3. **Domain-Sensitive AI Persona Design** — 同一 AI 引擎透過不同「知識注入」產生截然不同的協作行為

---

## 研究方向 A：AI 行為塑造的設計空間研究

### 核心問題
> 開發者如何透過「環境約束 (Environmental Constraints)」而非「直接提示 (Direct Prompting)」來塑造 AI coding agent 的行為？

### 為什麼可以發
- 目前 Prompt Engineering 研究多聚焦於「怎麼寫好的 prompt」，但 AI Memory OS 提出了一個不同的範式：**透過架構約束（Docker 隔離、Decision Log 格式、Cloud LLM Reduction Protocol）來間接控制 AI 行為**
- 這類似於 HCI 中「**行為設計 (Behavioral Design)**」的概念 — 不是告訴使用者「不要做 X」，而是讓環境使 X 變得不可能或困難

### 研究方法
1. **Design Space Analysis** — 分析 AI Memory OS 中所有「約束機制」的分類學 (Taxonomy)
   - 物理約束（Docker 容器隔離）
   - 程序約束（start.md / end.md workflow）
   - 社會約束（Decision Log 透明化）
   - 認知約束（Cloud LLM Reduction Protocol 的步驟排序）
2. **比較實驗** — 同一個開發任務，比較「有 AI Memory OS」vs.「裸 AI」的行為差異
   - 測量指標：AI 偏離預期行為的次數、破壞性操作嘗試、未經授權的 API 呼叫

### 目標會議/期刊

| 場域 | 適合度 | 理由 |
|---|---|---|
| **ACM CHI** | ⭐⭐⭐⭐⭐ | AI 行為塑造 = Human-AI Interaction 核心議題 |
| **ACM DIS** | ⭐⭐⭐⭐ | 設計空間分析 (Design Space) 是 DIS 經典論文型態 |
| **ACM CSCW** | ⭐⭐⭐ | 人與 AI 的協作動態可歸入 CSCW |

---

## 研究方向 B：AI 教學鷹架在設計教育中的效果

### 核心問題
> 當 AI 被設定為「教學助教」而非「代寫工具」時，學生的學習成效與程式碼理解度有何差異？

### 為什麼可以發
- **Student Domain** 的設計理念——「引導思考，不直接給答案」——正是 Vygotsky 的 **鷹架理論 (Scaffolding Theory)** 在 AI 時代的實踐
- 學術誠信 + AI 輔助學習是目前全球教育界的燙手議題
- 江老師本身就在教學現場，有天然的實驗場域

### 研究設計（建議）
```
受試者：互動設計 / 程式設計課程學生（N ≥ 30）
分組：
  A 組 — 使用「Student Domain」AI Memory OS（AI 扮演教學助教）
  B 組 — 使用原版 Cursor/Copilot（無行為限制）
  C 組 — 無 AI 輔助（純人工）

實驗任務：完成一個互動設計專題（4-8 週）

測量指標：
  1. 程式碼理解度（期末口試 + 程式碼走讀）
  2. 學習自我效能量表（pre/post）
  3. AI 依賴程度（分析 AI 對話紀錄中的問題類型）
  4. 專題品質（Rubric 評分）
  5. 學術誠信事件數
  6. WEEKLY_LOG.md 的撰寫品質與反思深度
```

### 目標會議/期刊

| 場域 | 適合度 | 理由 |
|---|---|---|
| **ACM SIGCSE** | ⭐⭐⭐⭐⭐ | CS 教育首選研討會，直接命中主題 |
| **ACM CHI** | ⭐⭐⭐⭐ | 以 HCI 視角探討 AI-in-Education |
| **L@S (Learning at Scale)** | ⭐⭐⭐⭐ | AI 輔助大規模教學 |
| **THCI 期刊** | ⭐⭐⭐⭐ | 台灣 TSSCI，互動設計教育研究 |
| **IJDCI** | ⭐⭐⭐ | 設計計算與智慧期刊 |

---

## 研究方向 C：Domain-Sensitive AI Persona — 同一 AI 的多面貌

### 核心問題
> 透過「靜態知識注入」（而非 fine-tuning）改變 AI 的領域行為，使用者對不同 persona 的信任度、滿意度與協作品質有何差異？

### 為什麼可以發
- AI Memory OS 的 4 個 Domain 實質上是 4 種不同的 **AI Persona**，但底層是同一個 LLM
- 這挑戰了「一個 AI 用到底」的預設假設 — 證明 **context engineering > model selection**
- 與「Role-Playing Agents」研究相關，但著重於「職業角色」而非「虛構角色」

### 研究方法
1. **Within-Subject Experiment** — 同一批使用者分別體驗 4 個 Domain 的 AI
2. **Wizard of Oz + Real System** — 前期用 WoZ 驗證概念，後期用真實系統
3. **質性分析** — 半結構式訪談，探索使用者如何感知不同 persona 的差異

### 測量指標
- UEQ (User Experience Questionnaire)
- Trust in AI Scale
- Task-Technology Fit
- 協作滿意度（自訂量表）

### 目標會議/期刊

| 場域 | 適合度 | 理由 |
|---|---|---|
| **ACM DIS** | ⭐⭐⭐⭐⭐ | Persona 設計 + 互動系統 = DIS 完美主題 |
| **ACM C&C** | ⭐⭐⭐⭐ | 創意工具中的 AI 角色設計 |
| **IJHCS** | ⭐⭐⭐⭐ | 人與 AI 互動的 SCI 期刊 |
| **BIT** | ⭐⭐⭐ | Behaviour & Information Technology (SSCI) |

---

## 研究方向 D：互動程式創作中的 AI 安全護欄

### 核心問題
> 在涉及實體硬體（Arduino、感測器、馬達）的互動設計專案中，AI 的「安全護欄」設計空間是什麼？

### 為什麼可以發
- **Interactive Domain** 的硬體安全規則（禁止自行改 GPIO 電壓、接線變更須先更新 PINOUT.md）是目前 AI coding assistant 研究中**幾乎沒人討論**的議題
- 隨著 AI 被用於 Physical Computing / Creative Coding，安全問題會急遽升高
- 這個方向跨越了 HCI、Tangible Interaction、Safety Engineering

### 研究方法
- **Incident Analysis** — 收集 AI 在互動設計專案中造成的「事故」案例（硬體損壞、安全隱患）
- **Design Workshop** — 邀請互動設計師共同設計 AI 安全護欄
- **Prototype + User Study** — 用 AI Memory OS Interactive Domain 做原型驗證

### 目標會議/期刊

| 場域 | 適合度 | 理由 |
|---|---|---|
| **ACM TEI** | ⭐⭐⭐⭐⭐ | Tangible & Embodied Interaction，硬體安全完美契合 |
| **ACM DIS** | ⭐⭐⭐⭐ | 設計系統 + 互動安全 |
| **ACM CHI** | ⭐⭐⭐⭐ | Physical Computing + AI Safety |
| **IJDCI** | ⭐⭐⭐ | 設計計算領域 |

---

## 最佳發表策略建議

### 短期（3-6 個月）— 投稿研討會

> [!TIP]
> **最速可投**：方向 A 的 Design Space Analysis 不需要使用者研究，純系統分析 + 框架論述即可撰寫

1. **ACM DIS 2026/2027** — 方向 A 或方向 C 的系統論文 (Systems Paper)
   - 論文型態：System Contribution + Design Rationale
   - 篇幅：8-12 頁
   - 不需大規模使用者實驗
2. **ACM CHI Late-Breaking Work** — 方向 B 的初步教學實驗
   - 篇幅：4 頁
   - 可用單班學生的初步數據

### 中期（6-12 個月）— 累積實驗數據

3. **ACM SIGCSE** — 方向 B 完整的教育實驗論文
   - 需要至少一學期的教學實驗數據
4. **ACM CHI Full Paper** — 方向 C 的 Persona 比較研究
   - 需要完整的使用者研究

### 長期（12-18 個月）— 投稿期刊

5. **IJHCS (SCI)** — 方向 A + C 合併為完整的框架論文
6. **THCI (TSSCI)** — 方向 B 的繁體中文教育研究論文

---

## 論文初步標題建議

| 方向 | 標題草案 |
|---|---|
| A | *"Beyond Prompting: Designing Environmental Constraints for AI Coding Agent Behavior Shaping"* |
| B | *"AI as Teaching Assistant, Not Ghost Writer: Scaffolded AI in Design Education"* |
| C | *"One Engine, Four Personas: Domain-Sensitive AI Behavior Through Static Knowledge Injection"* |
| D | *"Don't Touch the GPIO: Designing Safety Guardrails for AI-Assisted Physical Computing"* |

---

## 江老師的獨特優勢

1. **教學現場** — 直接在課堂部署 Student Domain，收集真實教學數據
2. **跨域整合** — 互動設計 + AI + 教育，這個交叉點人很少
3. **系統已上線** — [project.interaction.tw](https://project.interaction.tw/) 已部署可用，不需要「未來工作」
4. **開源** — GitHub repo 完整可重現，reviewer 可直接驗證
