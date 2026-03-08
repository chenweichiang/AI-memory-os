// src/domains/interactive.ts
import type { DomainProfile } from './index';

export const interactiveDomain: DomainProfile = {
    id: 'interactive',
    name: 'Interactive Coding',
    nameZh: '互動程式',

    agentsRules: `### Domain Rules — Interactive Coding (互動程式)

- **即時效能 (Real-Time Performance)**: 互動程式需保持穩定幀率（≥ 30 fps）。禁止在 \`draw()\`、\`loop()\`、\`update()\` 等每幀呼叫的函式中執行檔案 I/O、網路請求、或大量記憶體配置。大型計算需移至 \`setup()\` 或非同步處理。
- **硬體安全 (Hardware Safety)**: 操作 GPIO、馬達、伺服機、感測器時，AI 必須先確認電路安全。禁止自行修改電壓/電流設定值或 pin 配置，除非使用者明確指示。接線變更必須先更新 \`docs/PINOUT.md\`。
- **Demo 就緒 (Demo Ready)**: 每次 commit 必須保持展示用的 UI 或互動流程在可運行狀態。絕對禁止推送「半完成互動」或「暫時壞掉的 Demo」到 main branch。
- **多媒體資源 (Media Assets)**: 音檔、影片、3D 模型統一放 \`media/\` 目錄。超過 50MB 的檔案使用 Git LFS 或 \`.gitignore\` 排除。小型素材（音效、sprite）放 \`assets/\` 目錄。
- **互動文件化 (Interaction Documentation)**: 每個互動流程需在 \`docs/INTERACTION_FLOW.md\` 中記錄：輸入來源（鍵盤/滑鼠/感測器）→ 處理邏輯 → 輸出反饋（視覺/聲音/動態）。
- **展演設置 (Exhibition Setup)**: 若為裝置展演，需在 \`docs/EXHIBITION_SETUP.md\` 記錄：硬體清單、接線圖、場地需求、開機/關機 SOP。
`,

    setupSteps: `### Domain Setup — Interactive Coding
4. **Create interactive project structure**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "mkdir -p sketches/ media/{audio,video,models} assets/ hardware/ docs/"
   \`\`\`
5. **Initialize interaction flow document**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "cat > docs/INTERACTION_FLOW.md << 'HEREDOC'
# Interaction Flow

## Flow 1: [Name]
\\\`\\\`\\\`
Input (Source)  →  Processing (Logic)  →  Output (Feedback)
[e.g. webcam]  →  [face detection]    →  [particle effect]
\\\`\\\`\\\`

### Details
- **Input**: 
- **Processing**: 
- **Output**: 
- **Frame Rate Target**: 30 fps
HEREDOC"
   \`\`\`
`,

    startQueries: [
        '互動流程與使用者操作邏輯',
        '硬體接線與感測器配置',
        '效能瓶頸與幀率問題',
    ],

    recommendedModules: ['mem_lancedb', 'ci_python_tools', 'ci_git_hook', 'ci_testing_matrix'],

    seedDecisions: `| YYYY-MM-DD | framework | 創作框架: [e.g. p5.js / Processing / TouchDesigner / Unity] | high | sketches/ | - | Active | - | - |
| YYYY-MM-DD | hardware | 硬體平台: [e.g. Arduino Uno / Raspberry Pi / ESP32 / 無] | high | hardware/ | - | Active | - | - |
| YYYY-MM-DD | exhibit | 展演場地: [e.g. 教室展示 / 藝廊 / 線上] | med | docs/ | - | Active | - | - |
`,

    contextDoc: `# Domain Context — 互動程式

本專案為互動程式/新媒體創作專案，強調即時效能與展示品質。

## 目錄慣例
\`\`\`
sketches/            ← 主要互動程式碼（p5.js / Processing sketch）
hardware/
├── schematics/      ← 電路圖（Fritzing / KiCad）
├── PINOUT.md        ← GPIO 腳位對照表
└── BOM.md           ← 硬體材料清單
media/
├── audio/           ← 音效與音樂
├── video/           ← 影片素材
└── models/          ← 3D 模型
assets/              ← 小型素材（sprite、icon）
docs/
├── INTERACTION_FLOW.md  ← 互動流程文件
└── EXHIBITION_SETUP.md  ← 展演設置 SOP
\`\`\`

## 效能最佳實踐
- \`setup()\` 中做一次性初始化（載入模型、建立連線）
- \`draw()\` 中只做渲染和輕量邏輯
- 感測器資料用非同步讀取 + 緩衝區，不在主迴圈中阻塞
- 使用 \`millis()\` 做計時，不要用 \`delay()\`

## 硬體除錯指南
1. 序列埠連不上 → 確認 baud rate 和 port 正確
2. 感測器數值異常 → 先校正基線值（calibration）
3. 馬達不轉 → 確認供電足夠（不要只用 USB 供電）
4. 展演當機 → 加入 watchdog timer 或自動重啟機制
`,
};
