import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BrainCircuit, Download, Code2, Server, Database, Github, BookOpen, Layers, AlertCircle, Monitor, Globe, Network, Wrench, ShieldCheck, FolderGit2, UserCircle, Link, Library, Home, Languages, BookCheck, LayoutGrid, X } from 'lucide-react';
import { type ProjectConfig, getSafeProjectName, assembleZipContent } from './generators';
import { DOMAINS } from './domains';

const TRANSLATIONS = {
  en: {
    title: "AI Memory OS",
    subtitleSetup: "Blueprint Generator",
    subtitleTeardown: "Teardown Assistant",
    labSite: "Lab Site",
    wiki: "Wiki",
    github: "GitHub",
    introTitle: "A foundation generator designed for AI-assisted development.",
    introDesc: "Equip your AI assistant with a standardized persona, autonomous workflows, and an isolated Docker infrastructure from day one.",
    introFooterInstall: "Select your required modules below to export a production-ready project blueprint.",
    introFooterUninstall: "Select the modules you wish to safely tear down and remove from the project.",
    usageTitle: "Usage Instructions",
    usageSteps: [
      "Extract the downloaded ZIP file into your project's root directory.",
      "Ask your AI assistant (e.g., VS Code Antigravity, Cursor, or Windsurf) to read AGENTS.md and SETUP.md.",
      "The AI will autonomously identify the environment and guide you through initialization."
    ],
    step1: "Step 01",
    step1Title: "Operational Mode",
    setupMode: "Setup Mode",
    teardownMode: "Teardown Mode",
    step2: "Step 02",
    step2Title: "Infrastructure Scope",
    scopeLocal: "Local Only",
    scopeLocalSub: "Single Dev",
    scopeServer: "Public VPS",
    scopeServerSub: "Web Hosting",
    scopeFull: "Full Stack",
    scopeFullSub: "Cloud Sync",
    step3: "Step 03",
    step3Title: "Project Metadata",
    projectName: "Project Name",
    userRole: "User Project Role(s)",
    aiRole: "AI Project Role(s)",
    domain: "Target Domain",
    projectNamePlaceholder: "e.g. AI-Memory-OS",
    userRolePlaceholder: "Keywords e.g. Lead Architect Designer",
    aiRolePlaceholder: "Keywords e.g. System Expert Devops",
    domainPlaceholder: "project.example.com",
    referenceTitle: "Reference Implementations",
    referenceSub: "Explore real-world academic projects built with agentic architectures.",
    viewProject: "View on GitHub",
    citesageTitle: "CiteSage: AI Citation Verifier",
    citesageDesc: "An agentic self-learning system for validating academic metadata and semantic consistency.",
    graphvizTitle: "Academic Wiki Toolchain",
    graphvizDesc: "Professional SVG rendering toolkit with CJK support, optimized for research and design education.",
    resourcesMenu: "Resources",
    refSection: "Reference Projects",
    labSection: "Lab Links",
    step4: "Step 04",
    step4Title: "Component Matrix",
    required: "Required",
    core: "Core",
    actionRequired: "Action Required",
    previewTitle: "Structure Preview",
    previewDesc: "// Automatically generated directory snapshot",
    exportSetup: "Export Blueprint OS",
    exportTeardown: "Export Teardown OS",
    footerDesign: "Design by",
    footerInfra: "Infrastructure",
    footerManagement: "Management",
    footerDeployment: "Deployment",
    academicRes: "Academic Research",
    aiKnowledge: "AI-Assisted Knowledge",
    domainLabel: "Project Domain",
    domainGeneral: "General (No specific domain)",
  },
  zh: {
    title: "AI Memory OS",
    subtitleSetup: "專案藍圖產生器",
    subtitleTeardown: "卸載清理助手",
    labSite: "研究室首頁",
    wiki: "知識庫",
    github: "GitHub",
    introTitle: "專為 AI 協作開發設計的專案基礎產生器。",
    introDesc: "從第一天起，就為您的 AI 助手配備標準化人格、自動化工作流與隔離的 Docker 基礎設施。",
    introFooterInstall: "在下方選擇所需的模組，即可匯出正式環境等級的專案藍圖。",
    introFooterUninstall: "選擇您想要安全卸載並從專案中移除的模組。",
    usageTitle: "使用說明",
    usageSteps: [
      "將下載的 ZIP 檔案解壓縮至您的專案根目錄。",
      "請您的 AI 助手（如 VS Code Antigravity、Cursor 或 Windsurf）讀取 AGENTS.md 與 SETUP.md。",
      "AI 將自動識別環境並引導您完成初始化設定。",
    ],
    step1: "步驟 01",
    step1Title: "操作模式",
    setupMode: "安裝模式",
    teardownMode: "卸載模式",
    step2: "步驟 02",
    step2Title: "基礎架構範圍",
    scopeLocal: "僅限本地",
    scopeLocalSub: "單機開發",
    scopeServer: "雲端主機 (VPS)",
    scopeServerSub: "網站託管",
    scopeFull: "全端同步",
    scopeFullSub: "雲端同步",
    step3: "步驟 03",
    step3Title: "專案元數據",
    projectName: "專案名稱",
    userRole: "您的成員角色 (關鍵字)",
    aiRole: "AI 的成員角色 (關鍵字)",
    domain: "目標網域",
    projectNamePlaceholder: "例如：AI-Memory-OS",
    userRolePlaceholder: "用空格區隔例如：首席架構師 研究員",
    aiRolePlaceholder: "用空格區隔例如：系統專家 自動化 Assistant",
    domainPlaceholder: "project.example.com",
    referenceTitle: "實作參考範例",
    referenceSub: "探索使用 Agentic 架構建立的真實學術研究專案範例。",
    viewProject: "前往 GitHub 查看",
    citesageTitle: "CiteSage 學術引用驗證系統",
    citesageDesc: "具備 Agentic 自學能力的自動化驗證系統，專為處理複雜文獻元資料與語義一致性設計。",
    graphvizTitle: "學術級 Wiki 繪圖工具箱",
    graphvizDesc: "為研究與設計教育打造，支援 SVG Graphviz 與 Noto Sans CJK 的專業級 Wiki 基礎設施。",
    resourcesMenu: "資源選單",
    refSection: "實作參考",
    labSection: "相關資源",
    step4: "步驟 04",
    step4Title: "組件矩陣",
    required: "必要",
    core: "核心",
    actionRequired: "需要後續操作",
    previewTitle: "結構預覽",
    previewDesc: "// 自動產生的目錄快照",
    exportSetup: "匯出專案藍圖 OS",
    exportTeardown: "匯出卸載清理 OS",
    footerDesign: "設計於",
    footerInfra: "基礎設施",
    footerManagement: "知識管理",
    footerDeployment: "部署網址",
    academicRes: "學術研究環境",
    aiKnowledge: "AI 輔助知識庫",
    domainLabel: "專案領域",
    domainGeneral: "通用（不限定領域）",
  }
};

const ChipInput = ({ value, onChange, placeholder, icon }: { value: string, onChange: (val: string) => void, placeholder: string, icon: React.ReactNode }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isComposing = React.useRef(false);
  const chips = value.split(/\s+/).filter(Boolean);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 忽略 IME 輸入法選字時的 Enter 或空白鍵
    if (isComposing.current || e.nativeEvent.isComposing) return;

    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !chips.includes(val)) {
        onChange([...chips, val].join(' '));
        setInputValue('');
      } else if (val && chips.includes(val)) {
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && chips.length > 0) {
      e.preventDefault();
      const newChips = [...chips];
      newChips.pop();
      onChange(newChips.join(' '));
    }
  };

  const removeChip = (indexToRemove: number) => {
    const newChips = chips.filter((_, i) => i !== indexToRemove);
    onChange(newChips.join(' '));
  };

  return (
    <div className="relative group w-full" onClick={() => inputRef.current?.focus()}>
      <div className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-wrap items-center gap-2 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 focus-within:bg-white transition-all cursor-text min-h-[50px]">
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none flex items-center h-full">
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 flex-shrink-0' })}
        </div>

        {/* Chips */}
        {chips.map((chip, i) => (
          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full shadow-sm">
            {chip}
            <button
              type="button"
              onClick={() => removeChip(i)}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => { isComposing.current = false; }}
          onBlur={() => {
            const val = inputValue.trim();
            if (val && !chips.includes(val)) {
              onChange([...chips, val].join(' '));
            }
            setInputValue('');
          }}
          className="flex-1 min-w-[30px] max-w-full bg-transparent outline-none text-[13px] font-medium text-slate-900 placeholder:text-slate-300"
          placeholder={chips.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
};

const MODULES = [
  {
    id: 'core_agents',
    category: 'Local Core & Workspace',
    categoryZh: '本地核心與工作區',
    icon: <BrainCircuit className="w-5 h-5" />,
    name: 'Universal AGENTS.md',
    nameZh: '通用 AGENTS.md',
    desc: 'Standardized Persona, Success Log, Decision Log, and Memory Schema.',
    descZh: '標準化人格設定、成功記錄、決策日誌與記憶架構。',
    required: true,
  },
  {
    id: 'core_workflows',
    category: 'Local Core & Workspace',
    categoryZh: '本地核心與工作區',
    icon: <Code2 className="w-5 h-5" />,
    name: 'Dynamic Start/End Workflows',
    nameZh: '動態 Start/End 工作流',
    desc: 'Pre-configured state machine workflows for Agent Context Revival and Persistence.',
    descZh: '預先配置的狀態機工作流，用於 Agent 上下文重啟與持久化。',
    required: true,
  },
  {
    id: 'infra_docker',
    category: 'Local Core & Workspace',
    categoryZh: '本地核心與工作區',
    icon: <Layers className="w-5 h-5" />,
    name: 'Dockerized Workspace',
    nameZh: 'Docker 化工作空間',
    desc: 'Mandatory isolated container environment (docker-compose) for the AI to work in.',
    descZh: '強制隔離的容器環境 (docker-compose)，供 AI 在其中運行。',
    required: true,
  },
  {
    id: 'mem_lancedb',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Database className="w-5 h-5" />,
    name: 'Local Vector Database (LanceDB)',
    nameZh: '本地向量資料庫 (LanceDB)',
    desc: 'Serverless vector database. Injects lancedb, huggingface, and sentence-transformers to embed the local codebase.',
    descZh: '無伺服器向量資料庫。整合 lancedb、huggingface 以嵌入本地代碼庫。',
    required: false,
  },
  {
    id: 'mem_ollama',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Server className="w-5 h-5" />,
    name: 'Local LLM Engine (Ollama)',
    nameZh: '本地 LLM 引擎 (Ollama)',
    desc: 'Deploys a local, isolated Ollama container for completely private AI generation.',
    descZh: '部署本地隔離的 Ollama 容器，用於完全私密的 AI 生成。',
    required: false,
  },
  {
    id: 'env_academic',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <BookOpen className="w-5 h-5" />,
    name: 'Academic Research Environment',
    nameZh: '學術研究環境',
    desc: 'Generates Dockerfile with LaTeX (TeXLive), Pandoc, and Python Data Science stack.',
    descZh: '產出包含 LaTeX、Pandoc 與 Python 數據科學工具集的文件。',
    required: false,
  },
  {
    id: 'mem_cloud',
    category: 'Cloud & Remote Integrations',
    categoryZh: '雲端與遠端整合',
    icon: <Database className="w-5 h-5" />,
    name: 'Cloud Drive Integration',
    nameZh: '雲端硬碟整合',
    desc: 'Deploys rclone in Docker and generates LlamaIndex scripts (llama_drive_indexer.py) for persistent cloud file retrieval.',
    descZh: '在 Docker 部署 rclone 並產出 LlamaIndex 腳本，用於雲端檔案檢索。',
    required: false,
    prerequisites: ['Google Drive / OneDrive Account', 'Cloud API Credentials'],
    prerequisitesZh: ['Google Drive / OneDrive 帳號', '雲端 API 憑證']
  },
  {
    id: 'ci_git_hook',
    category: 'Cloud & Remote Integrations',
    categoryZh: '雲端與遠端整合',
    icon: <Github className="w-5 h-5" />,
    name: 'Git Hook Automation',
    nameZh: 'Git Hook 自動化',
    desc: 'Deploys gitleaks for secret scanning and creates a pre-push hook to guarantee vector memory sync before uploading.',
    descZh: '部署 gitleaks 進行密鑰掃描，並建立 pre-push hook 確保上傳前同步。',
    required: false,
    prerequisites: ['Remote Git Repository (e.g., GitHub / Gitea)'],
    prerequisitesZh: ['遠端 Git 倉庫 (例如 GitHub / Gitea)']
  },
  {
    id: 'ci_python_tools',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Wrench className="w-5 h-5" />,
    name: 'Python Tooling (uv, pytest, ruff)',
    nameZh: 'Python 工具鏈 (uv, pytest, ruff)',
    desc: 'Generates pyproject.toml and a tests/ envelope for strict code quality and unit testing.',
    descZh: '產生 pyproject.toml 與 tests/ 目錄，用於嚴格代碼品質控管。',
    required: false,
  },
  {
    id: 'ci_testing_matrix',
    category: 'Cloud & Remote Integrations',
    categoryZh: '雲端與遠端整合',
    icon: <ShieldCheck className="w-5 h-5" />,
    name: 'Full Coverage Testing Matrix',
    nameZh: '全覆蓋測試矩陣',
    desc: 'Installs bats and shellcheck. Automates Python Testinfra (container state) and Bats (shell script behavior).',
    descZh: '安裝 bats 與 shellcheck，自動化 Python 與 Shell 腳本測試。',
    required: false,
  },
  {
    id: 'infra_gateway',
    category: 'Public Infrastructure (VPS)',
    categoryZh: '公用基礎設施 (VPS)',
    icon: <Server className="w-5 h-5" />,
    name: 'Edge Gateway (Caddy)',
    nameZh: '邊緣網關 (Caddy)',
    desc: 'Caddyfile proxy template with Academic Bot whitelist and rate-limiting.',
    descZh: '具備學術機器人白名單與速率限制的 Caddyfile 代理範本。',
    required: false,
    prerequisites: ['Public Domain Name', 'Public IP Address (VPS)'],
    prerequisitesZh: ['公用網域名稱', '公用 IP 地址 (VPS)']
  },
  {
    id: 'infra_watchdog',
    category: 'Public Infrastructure (VPS)',
    categoryZh: '公用基礎設施 (VPS)',
    icon: <Server className="w-5 h-5" />,
    name: 'Self-Healing Watchdog',
    nameZh: '自我修護看門狗',
    desc: 'Autonomous crontab script that checks HTTP endpoints and restarts frozen containers.',
    descZh: '自動化的 crontab 腳本，檢查端點並重啟假死的容器。',
    required: false,
    prerequisites: ['Public Domain Name'],
    prerequisitesZh: ['公用網域名稱']
  },
  {
    id: 'infra_iac',
    category: 'Public Infrastructure (VPS)',
    categoryZh: '公用基礎設施 (VPS)',
    icon: <Code2 className="w-5 h-5" />,
    name: 'IaC Deployment (Ansible)',
    nameZh: 'IaC 部署 (Ansible)',
    desc: 'Generates Ansible playbooks and deploy.sh for remote server synchronized updates and crontab management.',
    descZh: '產生 Ansible playbooks 用於遠端伺服器同步更新與排程管理。',
    required: false,
    prerequisites: ['SSH Access to VPS'],
    prerequisitesZh: ['VPS 的 SSH 存取限權']
  },
  {
    id: 'mem_digest',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Database className="w-5 h-5" />,
    name: 'Conversation Digest',
    nameZh: '對話紀實摘要',
    desc: 'Python utility to extract, summarize, and archive long-running agent conversation logs.',
    descZh: '用於提取、摘要並封存長期的 Agent 對話日誌之 Python 工具。',
    required: false,
  },
  {
    id: 'context_bundler',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Monitor className="w-5 h-5" />,
    name: 'Context Bundler',
    nameZh: '本機上下文打包器',
    desc: 'Generates CONTEXT_SNAPSHOT.md before each session — git state, LanceDB results, and decision log — so the AI starts with full context without any cloud LLM call.',
    descZh: '每次 session 開始前自動打包 git 狀態、LanceDB 語意搜尋與決策日誌，讓 AI 不需要呼叫雲端 LLM 就能理解專案現況。',
    required: false,
  },
  {
    id: 'response_cache',
    category: 'Local Data & Models',
    categoryZh: '本地數據與模型',
    icon: <Database className="w-5 h-5" />,
    name: 'Response Cache',
    nameZh: '本機回應快取',
    desc: 'SQLite-based local Q&A cache with semantic similarity search. Answered questions never hit the cloud again.',
    descZh: '以 SQLite 在本機快取 LLM 問答，語意相似的問題直接從本機返回，相同問題不再呼叫雲端。',
    required: false,
  },
  {
    id: 'edu_submission',
    category: 'Cloud & Remote Integrations',
    categoryZh: '雲端與遠端整合',
    icon: <BookCheck className="w-5 h-5" />,
    name: 'Student Submission Toolchain',
    nameZh: '學生作業自動繳交工具鏈',
    desc: 'Equips the AI with strict validation prompts and a resilient upload script for submitting large assignment files to the professors Drive.',
    descZh: '賦予 AI 嚴格的驗證提示與強韌的上傳腳本，用以將巨型作業檔案提交至老師的雲端資料夾。',
    required: false,
    prerequisites: ['Homework API Endpoint'],
    prerequisitesZh: ['繳交作業 API 網址']
  }
];

function App() {
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(
    MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.required }), {})
  );

  const [config, setConfig] = useState({
    projectName: 'My AI Project',
    userRole: 'Researcher Developer',
    aiRole: 'System_Architect Specialist',
    domain: 'example.com',
  });

  const [deploymentScope, setDeploymentScope] = useState<'local' | 'server' | 'full'>('local');
  const [actionType, setActionType] = useState<'install' | 'uninstall'>('install');

  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const t = TRANSLATIONS[language];

  const toggleModule = (id: string, required: boolean) => {
    if (required) return;
    setSelectedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  // Group modules by category
  const categories = MODULES.reduce((acc, mod) => {
    acc[mod.category] = acc[mod.category] || [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, typeof MODULES>);

  const getVisibleCategories = () => {
    if (actionType === 'uninstall') return Object.keys(categories);
    if (deploymentScope === 'local') return ['Local Core & Workspace', 'Local Data & Models'];
    if (deploymentScope === 'server') return ['Local Core & Workspace', 'Local Data & Models', 'Public Infrastructure (VPS)'];
    return Object.keys(categories);
  };

  const visibleCategoryList = getVisibleCategories();

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const isModuleActive = (id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (!mod) return false;
    const isNodeRequired = mod.required && actionType === 'install';
    const isSelected = selectedModules[id] || isNodeRequired;
    return isSelected && visibleCategoryList.includes(mod.category);
  };

  const handleActionTypeChange = (newType: 'install' | 'uninstall') => {
    setActionType(newType);
    if (newType === 'uninstall') {
      setSelectedModules({}); // Clear selections so nothing is uninstalled by accident
      setSelectedDomain('');  // Reset domain when switching to uninstall
    } else {
      setSelectedModules(prev => {
        const next = { ...prev };
        MODULES.forEach(mod => {
          if (mod.required) next[mod.id] = true;
        });
        return next;
      });
    }
  };

  const generateZip = async () => {
    const zip = new JSZip();
    const projectConfig: ProjectConfig = { ...config, deploymentScope, selectedDomain: selectedDomain || undefined };
    const safeProjectName = getSafeProjectName(projectConfig);
    const folderName = actionType === 'uninstall' ? `teardown_${safeProjectName}` : safeProjectName;
    const folder = zip.folder(folderName);
    if (!folder) return;

    assembleZipContent(folder, projectConfig, isModuleActive, actionType);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, actionType === 'uninstall' ? `${safeProjectName}_Teardown_OS.zip` : `${safeProjectName}_Blueprint_OS.zip`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 flex flex-col items-center font-sans text-slate-800">
      <div className="max-w-6xl w-full mb-10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
        <div className="flex items-center gap-4 group">
          <div className={`p-2.5 rounded-xl shadow-sm transition-all duration-500 ${actionType === 'install' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-red-600 text-white shadow-red-200'}`}>
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none mb-1">{t.title}</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">{actionType === 'install' ? t.subtitleSetup : t.subtitleTeardown}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-400 hover:text-blue-600 transition-all duration-300 group"
          >
            <Languages className="w-4 h-4 transition-transform group-hover:rotate-12" />
            {language === 'en' ? '繁體中文' : 'English'}
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          {/* Resources Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-400 hover:text-blue-600 transition-all duration-300">
              <LayoutGrid className="w-4 h-4" />
              {t.resourcesMenu}
            </button>

            {/* Dropdown Panel - Adds a transparent bridge block right under the button to prevent hover gap */}
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right group-hover:translate-y-0 translate-y-2">
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-2 flex flex-col gap-1">

                {/* Reference Section */}
                <div className="px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t.refSection}</span>
                </div>
                <a href="https://github.com/chenweichiang/citesage" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors group/item">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                    <BookCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 leading-tight">CiteSage</div>
                  </div>
                </a>
                <a href="https://github.com/chenweichiang/MediaWiki-Academic-Graphviz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors group/item">
                  <div className="bg-purple-50 text-purple-600 p-1.5 rounded-lg group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 leading-tight">Wiki Graphviz</div>
                  </div>
                </a>

                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                {/* Lab links */}
                <div className="px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t.labSection}</span>
                </div>
                <a href="https://interaction.tw/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-sm font-medium text-slate-600 transition-colors">
                  <Home className="w-4 h-4 text-slate-400" />
                  {t.labSite}
                </a>
                <a href="https://wiki.interaction.tw/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-sm font-medium text-slate-600 transition-colors">
                  <Library className="w-4 h-4 text-slate-400" />
                  {t.wiki}
                </a>
                <a href="https://github.com/chenweichiang/AI-memory-os" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-sm font-medium text-slate-600 transition-colors">
                  <Github className="w-4 h-4 text-slate-400" />
                  {t.github}
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 flex-grow">

        <div className="xl:col-span-5 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            <div className="text-sm text-slate-500 mb-6 space-y-4 leading-relaxed">
              <p className="font-medium text-slate-600">{t.introTitle}</p>
              <p>{t.introDesc}</p>
              <p className="text-slate-400 italic text-[13px]">{actionType === 'install' ? t.introFooterInstall : t.introFooterUninstall}</p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className={`p-1.5 rounded-lg ${actionType === 'install' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.usageTitle}</h3>
              </div>
              <div className="space-y-5">
                {t.usageSteps.map((text, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center transition-all duration-300 ${actionType === 'install' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'}`}>
                      {i + 1}
                    </div>
                    <p className="text-[13px] text-slate-600 leading-snug group-hover:text-slate-900 transition-colors pointer-events-none">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Action Type */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.step1}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actionType === 'install' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{t.step1Title}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleActionTypeChange('install')}
                className={`group relative flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl font-bold text-xs transition-all duration-300 focus:outline-none ${actionType === 'install'
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50'
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:border-blue-200 hover:text-slate-600 hover:shadow-lg'
                  }`}
              >
                <Download className={`w-5 h-5 transition-transform duration-300 ${actionType === 'install' ? 'scale-110' : 'opacity-50 group-hover:scale-110 group-hover:opacity-100'}`} />
                {t.setupMode}
              </button>
              <button
                onClick={() => handleActionTypeChange('uninstall')}
                className={`group relative flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl font-bold text-xs transition-all duration-300 focus:outline-none ${actionType === 'uninstall'
                  ? 'bg-red-600 text-white shadow-xl shadow-red-200 ring-4 ring-red-50'
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:border-red-200 hover:text-slate-600 hover:shadow-lg'
                  }`}
              >
                <AlertCircle className={`w-5 h-5 transition-transform duration-300 ${actionType === 'uninstall' ? 'scale-110' : 'opacity-50 group-hover:scale-110 group-hover:opacity-100'}`} />
                {t.teardownMode}
              </button>
            </div>
          </div>

          {/* Step 2: Deployment Scope */}
          {actionType === 'install' && (
            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.step2}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">{t.step2Title}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'local', icon: <Monitor />, label: t.scopeLocal, sub: t.scopeLocalSub },
                  { id: 'server', icon: <Globe />, label: t.scopeServer, sub: t.scopeServerSub },
                  { id: 'full', icon: <Network />, label: t.scopeFull, sub: t.scopeFullSub }
                ].map((scope) => (
                  <div
                    key={scope.id}
                    onClick={() => setDeploymentScope(scope.id as any)}
                    className={`group cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${deploymentScope === scope.id ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-md'}`}
                  >
                    <div className={`mb-3 p-2 rounded-xl transition-colors ${deploymentScope === scope.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 group-hover:text-blue-500 shadow-sm'}`}>
                      {React.cloneElement(scope.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                    </div>
                    <span className="font-bold text-xs text-slate-900 leading-none">{scope.label}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{scope.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.step3}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actionType === 'install' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{t.step3Title}</span>
            </div>

            <div className="space-y-6">
              {[
                { name: 'projectName', label: t.projectName, icon: <FolderGit2 />, placeholder: t.projectNamePlaceholder, show: true, type: 'text' },
                { name: 'userRole', label: t.userRole, icon: <UserCircle />, placeholder: t.userRolePlaceholder, show: actionType === 'install', type: 'chip' },
                { name: 'aiRole', label: t.aiRole, icon: <BrainCircuit />, placeholder: t.aiRolePlaceholder, show: actionType === 'install', type: 'chip' },
                { name: 'domain', label: t.domain, icon: <Link />, placeholder: t.domainPlaceholder, show: actionType === 'install' && (deploymentScope !== 'local'), type: 'text' }
              ].filter(f => f.show).map((field) => (
                <div key={field.name} className="relative group">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">{field.label}</label>
                  {field.type === 'chip' ? (
                    <ChipInput
                      value={(config as any)[field.name]}
                      onChange={(val) => handleConfigChange({ target: { name: field.name, value: val } } as any)}
                      placeholder={field.placeholder!}
                      icon={field.icon}
                    />
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        {React.cloneElement(field.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                      </div>
                      <input
                        type="text"
                        name={field.name}
                        value={(config as any)[field.name]}
                        onChange={handleConfigChange}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                        placeholder={field.placeholder!}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Domain Selector (Phase 3) */}
            {actionType === 'install' && (
              <div className="relative group">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">{t.domainLabel}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                  <select
                    value={selectedDomain}
                    onChange={(e) => {
                      const newDomainId = e.target.value;
                      const prevDomain = DOMAINS.find(d => d.id === selectedDomain);
                      const newDomain = DOMAINS.find(d => d.id === newDomainId);

                      setSelectedDomain(newDomainId);

                      setSelectedModules(prev => {
                        const next = { ...prev };

                        // Step 1: Uncheck previous domain's recommended modules
                        // (only if they're not required)
                        if (prevDomain) {
                          const newRecs = new Set(newDomain?.recommendedModules || []);
                          prevDomain.recommendedModules.forEach(id => {
                            const mod = MODULES.find(m => m.id === id);
                            // Only uncheck if: not required AND not recommended by new domain
                            if (mod && !mod.required && !newRecs.has(id)) {
                              next[id] = false;
                            }
                          });
                        }

                        // Step 2: Check new domain's recommended modules
                        if (newDomain) {
                          newDomain.recommendedModules.forEach(id => { next[id] = true; });
                        }

                        return next;
                      });
                    }}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">{t.domainGeneral}</option>
                    {DOMAINS.map(d => (
                      <option key={d.id} value={d.id}>{language === 'zh' ? d.nameZh : d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>


          {/* Step 4: Module Selection */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t.step4}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${actionType === 'install' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{t.step4Title}</span>
            </div>

            <div className="space-y-10">
              {Object.entries(categories)
                .filter(([category]) => visibleCategoryList.includes(category))
                .map(([category, mods]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-5">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">{language === 'zh' ? mods[0].categoryZh : category}</h4>
                      <div className="h-px bg-slate-100 flex-grow"></div>
                    </div>
                    <div className="space-y-3">
                      {mods.map((mod) => {
                        const isNodeRequired = mod.required && actionType === 'install';
                        const isSelected = selectedModules[mod.id] || isNodeRequired;
                        const cardSelectedClass = actionType === 'install'
                          ? 'border-blue-500 bg-blue-50/30'
                          : 'border-red-500 bg-red-50/30';

                        return (
                          <div
                            key={mod.id}
                            onClick={() => toggleModule(mod.id, isNodeRequired)}
                            className={`group flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${isNodeRequired ? 'opacity-70 cursor-not-allowed border-slate-50 bg-slate-50' : isSelected ? `${cardSelectedClass} shadow-sm` : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-md cursor-pointer'}`}
                          >
                            <div className="mt-1">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? (actionType === 'install' ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-red-600 border-red-600 shadow-sm') : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`text-[13px] font-bold flex items-center gap-2 ${isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                  {React.cloneElement(mod.icon as React.ReactElement<{ className?: string }>, { className: `w-4 h-4 ${isSelected ? (actionType === 'install' ? 'text-blue-600' : 'text-red-600') : 'text-slate-400'}` })}
                                  {language === 'zh' ? mod.nameZh : mod.name}
                                </span>
                                {isNodeRequired && <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md tracking-tighter shadow-sm shadow-blue-200">{t.required}</span>}
                                {mod.required && actionType === 'uninstall' && <span className="text-[9px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded-md tracking-tighter">{t.core}</span>}
                              </div>
                              <p className="text-[11px] font-medium text-slate-400 leading-normal">{language === 'zh' ? mod.descZh : mod.desc}</p>

                              {mod.prerequisites && isSelected && actionType === 'install' && (
                                <div className="mt-4 rounded-xl bg-white/60 border border-blue-100/50 backdrop-blur-sm shadow-sm overflow-hidden">
                                  <div className="bg-blue-50/50 px-3 py-1.5 border-b border-blue-100/50 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3 text-blue-500" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/70">{t.actionRequired}</p>
                                  </div>
                                  <ul className="py-2 px-1">
                                    {(language === 'zh' && mod.prerequisitesZh ? mod.prerequisitesZh : mod.prerequisites).map((req: string, idx: number) => (
                                      <li key={idx} className="px-3 py-1.5 flex items-start gap-2.5">
                                        <div className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-blue-400" />
                                        <span className="text-[10px] text-slate-500 font-bold leading-tight">{req}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Preview - Output */}
        <div className="xl:col-span-7 flex flex-col xl:sticky xl:top-12 xl:h-[calc(100vh-10rem)]">
          <div className="bg-[#0f172a] rounded-[2rem] shadow-2xl flex-grow flex flex-col overflow-hidden border border-slate-800 ring-8 ring-slate-100/50 transition-all duration-500">
            <div className="flex bg-[#1e293b] px-6 py-4 items-center justify-between border-b border-slate-800">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t.previewTitle}</p>
              <div className="w-10"></div>
            </div>

            <div className="p-8 overflow-y-auto flex-grow text-[#94a3b8] font-mono text-[13px] leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
              <div className="text-slate-600 mb-4 select-none italic text-xs">{t.previewDesc}</div>

              {actionType === 'uninstall' ? (
                <>
                  {`\n📁 teardown_${config.projectName.replace(/\s+/g, '_')}/\n`}
                  {`└── 📄 UNINSTALL_TEARDOWN.md\n`}
                </>
              ) : (
                <>
                  {`\n📁 ${config.projectName.replace(/\s+/g, '_')}/\n`}
                  {`├── 📄 SETUP.md\n`}
                  {`├── 📄 AGENTS.md\n`}
                  {`├── 📁 .agents/\n│   ${(isModuleActive('context_bundler') || isModuleActive('response_cache')) ? '├──' : '└──'} 📁 workflows/\n│   ${(isModuleActive('context_bundler') || isModuleActive('response_cache')) ? '│' : ' '}   ├── 📄 start.md\n│   ${(isModuleActive('context_bundler') || isModuleActive('response_cache')) ? '│' : ' '}   └── 📄 end.md\n`}
                  {isModuleActive('context_bundler') && `│   ${isModuleActive('response_cache') ? '├──' : '└──'} 📁 context/\n│   ${isModuleActive('response_cache') ? '│' : ' '}   └── 📄 .gitkeep\n`}
                  {isModuleActive('response_cache') && `│   ├── 📁 cache/\n│   │   └── 📄 .gitkeep\n`}
                  {`│   └── 📄 module_registry.json\n`}
                  {`├── 📁 docs/\n│   ├── 📄 USER_GUIDE_ZH.md\n│   ├── 📄 USER_GUIDE_EN.md\n`}
                  {selectedDomain && `│   └── 📄 DOMAIN_CONTEXT.md\n`}

                  {isModuleActive('edu_submission') && `├── 📁 homework_submission/\n│   └── 📄 README.md\n`}

                  {isModuleActive('ci_git_hook') && `├── 📁 .git/hooks/\n│   └── 📄 pre-push\n`}

                  {`├── 📁 scripts/\n`}
                  {isModuleActive('edu_submission') && `│   ├── 📄 submit_homework.py\n`}
                  {isModuleActive('mem_lancedb') && `│   ├── 📄 ingest.py\n│   ├── 📄 query.py\n`}
                  {isModuleActive('context_bundler') && `│   ├── 📄 bundle_context.py\n`}
                  {isModuleActive('response_cache') && `│   ├── 📄 cache.py\n`}
                  {isModuleActive('mem_cloud') && `│   ├── 📄 llama_drive_indexer.py\n`}
                  {`│   └── 📁 system/\n`}
                  {isModuleActive('infra_watchdog') && `│       ├── 📄 watchdog.sh\n`}
                  {isModuleActive('ci_testing_matrix') && `│       ├── 📄 test_matrix.sh\n`}
                  {isModuleActive('infra_iac') && `│       ├── 📄 deploy.sh\n`}
                  {isModuleActive('mem_digest') && `│       ├── 📄 conversation_digest.py\n`}
                  {`│       └── 📄 health_check.py\n`}

                  {(isModuleActive('ci_python_tools') || isModuleActive('ci_testing_matrix')) && `├── 📁 tests/\n`}
                  {isModuleActive('ci_python_tools') && `│   └── 📄 test_basic.py\n`}
                  {isModuleActive('ci_testing_matrix') && `│   ├── 📁 infra/\n│   │   └── 📄 test_infra.py\n│   └── 📁 shell/\n│       └── 📄 test_scripts.bats\n`}
                  {isModuleActive('ci_python_tools') && `├── 📄 pyproject.toml\n`}

                  {isModuleActive('infra_gateway') && `├── 📁 config/\n│   └── 📁 caddy/\n│       └── 📄 Caddyfile\n`}
                  {isModuleActive('infra_iac') && `├── 📁 ansible/\n│   ├── 📄 inventory.ini\n│   └── 📁 playbooks/\n│       └── 📄 update_scripts.yml\n`}
                  {`├── 📄 Dockerfile\n`}
                  {`├── 📄 docker-compose.yml\n`}
                </>
              )}
            </div>

            <div className="p-6 bg-[#1e293b]/50 backdrop-blur-md border-t border-slate-800">
              <button
                onClick={generateZip}
                className={`w-full text-white font-black uppercase tracking-[0.1em] text-xs py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${actionType === 'uninstall' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                  }`}
              >
                {actionType === 'uninstall' ? <AlertCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                {actionType === 'uninstall' ? t.exportTeardown : t.exportSetup}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 mb-12 text-center w-full max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full mb-8"></div>
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">
          &copy; {new Date().getFullYear()} Interaction Lab &bull; {t.footerDesign} <span className="text-slate-900 font-black">Chiang, Chenwei</span>
        </p>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mb-6">
          {[
            { label: t.footerInfra, val: t.academicRes },
            { label: t.footerManagement, val: t.aiKnowledge },
            { label: t.footerDeployment, val: 'project.interaction.tw' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
              <span className="text-[10px] font-bold text-slate-900">{item.val}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400/80 font-medium tracking-widest uppercase">
          Last Updated &bull; 2026-03-08
        </div>
      </footer>
    </div>
  );
}

export default App;
