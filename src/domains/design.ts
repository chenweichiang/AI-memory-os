// src/domains/design.ts
import type { DomainProfile } from './index';

export const designDomain: DomainProfile = {
    id: 'design',
    name: 'Design Work',
    nameZh: '設計類工作',

    agentsRules: `### Domain Rules — Design Work (設計類工作)

- **設計檔案管理 (Asset Management)**: 圖片資源統一放 \`assets/\` 目錄，按類別分子目錄：\`icons/\`、\`photos/\`、\`illustrations/\`。向量圖優先使用 SVG 格式。點陣圖壓縮後才能 commit（不超過 500KB/張）。
- **設計系統文件化 (Design System)**: 色彩、字型、間距等 Design Tokens 統一記錄在 \`docs/DESIGN_TOKENS.md\`。程式碼中禁止直接硬編碼 hex 色碼（使用 CSS 變數或 token 引用）。
- **設計稿連結 (Design Source)**: Figma / Sketch / Adobe XD 等設計稿連結統一記錄在 \`docs/DESIGN_LINKS.md\`，附上版本號與最後更新時間。
- **UX 優先 (User Experience First)**: 每次 UI 修改必須附上「為什麼這樣改」的設計理由。純粹的美觀調整也需要說明（例如：「改善視覺層次」）。
- **可及性 (Accessibility)**: 所有互動元素需有適當的 \`aria-\` 標籤。色彩對比度需達 WCAG AA 標準（4.5:1）。表單元素需有明確的 \`<label>\`。
- **響應式設計 (Responsive)**: 所有頁面預設支援手機、平板、桌機三種斷點。不同斷點的佈局邏輯記錄在 \`docs/RESPONSIVE_SPEC.md\`。
`,

    setupSteps: `### Domain Setup — Design Work
4. **Create design asset structure**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "mkdir -p assets/{icons,photos,illustrations} docs/"
   \`\`\`
5. **Initialize design documentation**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "cat > docs/DESIGN_TOKENS.md << 'HEREDOC'
# Design Tokens

## Colors
| Token | Value | Usage |
|---|---|---|
| --color-primary | #3B82F6 | Primary action buttons |
| --color-bg | #F8FAFC | Page background |

## Typography
| Token | Value |
|---|---|
| --font-heading | Inter, sans-serif |
| --font-body | Inter, sans-serif |

## Spacing
| Token | Value |
|---|---|
| --space-sm | 8px |
| --space-md | 16px |
| --space-lg | 32px |
HEREDOC"
   \`\`\`
6. **Initialize design links**:
   \`\`\`bash
   docker exec -i \${containerName} bash -c "cat > docs/DESIGN_LINKS.md << 'HEREDOC'
# Design Source Links

| Tool | URL | Version | Last Updated |
|---|---|---|---|
| Figma | _(paste link)_ | v1.0 | YYYY-MM-DD |
HEREDOC"
   \`\`\`
`,

    startQueries: [
        '最近的設計決策與 UI 變更',
        '使用者研究發現與回饋',
        '設計系統與色彩規範',
    ],

    recommendedModules: ['mem_lancedb', 'mem_digest', 'context_bundler', 'response_cache'],

    seedDecisions: `| YYYY-MM-DD | design | 設計工具: [e.g. Figma / Sketch / Adobe XD] | high | docs/DESIGN_LINKS.md | - | Active | - | - |
| YYYY-MM-DD | design | 設計語言: [e.g. Material Design / Apple HIG / 自訂] | high | docs/ | - | Active | - | - |
| YYYY-MM-DD | design | 色彩主題: [e.g. 淺色 / 深色 / 雙模式] | med | docs/DESIGN_TOKENS.md | - | Active | - | - |
`,

    contextDoc: `# Domain Context — 設計類工作

本專案以設計為核心，強調使用者體驗與視覺品質。

## 目錄慣例
\`\`\`
assets/
├── icons/           ← SVG 圖示
├── photos/          ← 攝影圖片（已壓縮）
└── illustrations/   ← 插畫與向量素材
docs/
├── DESIGN_TOKENS.md ← 色彩、字型、間距定義
├── DESIGN_LINKS.md  ← Figma/Sketch 設計稿連結
└── RESPONSIVE_SPEC.md ← 響應式規格
src/                 ← 實作程式碼
\`\`\`

## 設計交付物 Checklist
- [ ] Design Tokens 文件已更新
- [ ] 設計稿連結已附上最新版本
- [ ] 所有圖片已壓縮（< 500KB）
- [ ] 色彩對比度達 WCAG AA
- [ ] 手機/平板/桌機三斷點均已驗證

## 設計理由記錄格式
每次 UI 修改在 commit message 或 Decision Log 中附上：
- **改了什麼**：描述具體的 UI 變化
- **為什麼改**：設計理由（改善可讀性？提升轉換率？使用者回饋？）
- **影響範圍**：哪些頁面/元件受影響
`,
};
