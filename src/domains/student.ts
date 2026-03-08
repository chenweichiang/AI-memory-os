// src/domains/student.ts
import type { DomainProfile } from './index';

export const studentDomain: DomainProfile = {
    id: 'student',
    name: 'Student Project',
    nameZh: '學生專題',

    agentsRules: `### Domain Rules — Student Project (學生專題模式)

- **教學優先 (Teaching First)**: 當學生遇到技術問題時，AI 必須先解釋概念原理，再示範解法。禁止直接貼出完整答案而不附解說。目標是讓學生「學會」，而非「抄完」。
- **學術誠信 (Academic Integrity)**: 所有引用必須標明出處。所有借用的程式碼片段需附上原始來源連結。禁止將 AI 產出的內容直接當作自己的原創。
- **中文溝通 (Chinese Communication)**: 所有程式碼註解和文件預設使用繁體中文（Taiwan）。變數命名可以用英文，但 README、報告等文件一律使用中文撰寫。
- **專題文件規範 (Documentation Standard)**: README.md 必須包含：專案動機（為什麼做）、使用方法（怎麼用）、成果展示（做了什麼）、組員分工（誰做的）。
- **進度追蹤 (Progress Tracking)**: 每週結束前更新 \`docs/WEEKLY_LOG.md\`，記錄本週進度與下週計畫。
- **檔案命名 (File Naming)**: 禁止使用 \`test1.py\`、\`final_v2_REAL.zip\` 等不具語義的檔名。所有檔案名稱必須描述其用途。
`,

    setupSteps: `### Domain Setup — Student Project
4. **Initialize project documentation**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "mkdir -p docs/ && cat > README.md << 'HEREDOC'
# 專題名稱

## 動機
_（說明為什麼要做這個專題）_

## 使用方法
_（說明如何安裝與執行）_

## 成果展示
_（放上截圖或 Demo 連結）_

## 組員分工
| 姓名 | 學號 | 負責項目 |
|---|---|---|
| | | |
HEREDOC"
   \`\`\`
5. **Create weekly log template**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "cat > docs/WEEKLY_LOG.md << 'HEREDOC'
# 每週進度日誌

## Week 1 (YYYY/MM/DD)
### 本週完成
- 

### 遇到的問題
- 

### 下週計畫
- 
HEREDOC"
   \`\`\`
`,

    startQueries: [
        '專題進度與待辦事項',
        '最近的程式碼修改與問題',
    ],

    recommendedModules: ['mem_lancedb', 'ci_python_tools', 'edu_submission', 'context_bundler'],

    seedDecisions: `| YYYY-MM-DD | course | 課程名稱: [e.g. 互動設計 / 程式設計] | high | docs/ | - | Active | - | - |
| YYYY-MM-DD | course | 指導教授: [e.g. 江振維老師] | high | docs/ | - | Active | - | - |
| YYYY-MM-DD | project | 專題主題: [簡述] | high | README.md | - | Active | - | - |
| YYYY-MM-DD | lang | 程式語言: [e.g. Python / JavaScript / Processing] | high | src/ | - | Active | - | - |
`,

    contextDoc: `# Domain Context — 學生專題

本專案為課堂專題，遵循學術誠信與教學引導原則。

## 目錄慣例
\`\`\`
docs/
├── README.md           ← 專題說明（動機/方法/成果/分工）
├── WEEKLY_LOG.md        ← 每週進度日誌
└── references/          ← 參考資料與引用來源
src/                     ← 主要程式碼
assets/                  ← 圖片、影片等素材
homework_submission/     ← 作業繳交區（如已啟用）
\`\`\`

## AI 助教使用守則
1. AI 是你的「助教」，不是「代工」
2. 遇到問題先自己嘗試 → 再問 AI → AI 會引導你思考
3. AI 產出的程式碼需要自己理解後才能使用
4. 所有從 AI 獲得的關鍵協助需記錄在週報中

## 繳交 Checklist
- [ ] README.md 填寫完整
- [ ] 程式碼有中文註解
- [ ] 每週進度日誌已更新
- [ ] 所有引用已標明出處
- [ ] 檔案命名語義清晰
`,
};
