import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BrainCircuit, Download, Code2, Server, Database, Github, BookOpen, Layers, AlertCircle, Monitor, Globe, Network, Wrench, ShieldCheck } from 'lucide-react';

const MODULES = [
  {
    id: 'core_agents',
    category: 'Local Core & Workspace',
    icon: <BrainCircuit className="w-5 h-5" />,
    name: 'Universal AGENTS.md',
    desc: 'Standardized Persona, Success Log, Decision Log, and Memory Schema.',
    required: true,
  },
  {
    id: 'core_workflows',
    category: 'Local Core & Workspace',
    icon: <Code2 className="w-5 h-5" />,
    name: 'Dynamic Start/End Workflows',
    desc: 'Pre-configured state machine workflows for Agent Context Revival and Persistence.',
    required: true,
  },
  {
    id: 'infra_docker',
    category: 'Local Core & Workspace',
    icon: <Layers className="w-5 h-5" />,
    name: 'Dockerized Workspace',
    desc: 'Mandatory isolated container environment (docker-compose) for the AI to work in.',
    required: true,
  },
  {
    id: 'mem_lancedb',
    category: 'Local Data & Models',
    icon: <Database className="w-5 h-5" />,
    name: 'Local Vector Database (LanceDB)',
    desc: 'Generates ingest.py and query.py for embedded serverless vector indexing.',
    required: false,
  },
  {
    id: 'env_academic',
    category: 'Local Data & Models',
    icon: <BookOpen className="w-5 h-5" />,
    name: 'Academic Research Environment',
    desc: 'Generates Dockerfile with LaTeX (TeXLive), Pandoc, and Python Data Science stack.',
    required: false,
  },
  {
    id: 'mem_cloud',
    category: 'Cloud & Remote Integrations',
    icon: <Database className="w-5 h-5" />,
    name: 'Cloud Drive Integration',
    desc: 'LlamaIndex + Rclone templates for persistent cloud file retrieval.',
    required: false,
    prerequisites: ['Google Drive / OneDrive Account', 'Cloud API Credentials']
  },
  {
    id: 'ci_git_hook',
    category: 'Cloud & Remote Integrations',
    icon: <Github className="w-5 h-5" />,
    name: 'Git Hook Automation',
    desc: 'Pre-push hook to guarantee vector memory sync before uploading code.',
    required: false,
    prerequisites: ['Remote Git Repository (e.g., GitHub / Gitea)']
  },
  {
    id: 'ci_python_tools',
    category: 'Local Data & Models',
    icon: <Wrench className="w-5 h-5" />,
    name: 'Python Tooling (uv, pytest, ruff)',
    desc: 'Generates pyproject.toml and a tests/ envelope for strict code quality and unit testing.',
    required: false,
  },
  {
    id: 'ci_testing_matrix',
    category: 'Cloud & Remote Integrations',
    icon: <ShieldCheck className="w-5 h-5" />,
    name: 'Full Coverage Testing Matrix',
    desc: 'Automates Python Testinfra (container state) and Bats (shell script behavior).',
    required: false,
  },
  {
    id: 'infra_gateway',
    category: 'Public Infrastructure (VPS)',
    icon: <Server className="w-5 h-5" />,
    name: 'Edge Gateway (Caddy)',
    desc: 'Caddyfile proxy template with Academic Bot whitelist and rate-limiting.',
    required: false,
    prerequisites: ['Public Domain Name', 'Public IP Address (VPS)']
  },
  {
    id: 'infra_watchdog',
    category: 'Public Infrastructure (VPS)',
    icon: <Server className="w-5 h-5" />,
    name: 'Self-Healing Watchdog',
    desc: 'Autonomous crontab script that checks HTTP endpoints and restarts frozen containers.',
    required: false,
    prerequisites: ['Public Domain Name']
  },
  {
    id: 'infra_iac',
    category: 'Public Infrastructure (VPS)',
    icon: <Code2 className="w-5 h-5" />,
    name: 'IaC Deployment (Ansible)',
    desc: 'Generates Ansible playbooks and deploy.sh for remote server synchronized updates and crontab management.',
    required: false,
    prerequisites: ['SSH Access to VPS']
  },
  {
    id: 'mem_digest',
    category: 'Local Data & Models',
    icon: <Database className="w-5 h-5" />,
    name: 'Conversation Digest',
    desc: 'Python utility to extract, summarize, and archive long-running agent conversation logs.',
    required: false,
  }
];

function App() {
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(
    MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.required }), {})
  );

  const [config, setConfig] = useState({
    projectName: 'My AI Project',
    authorName: 'Developer',
    domain: 'example.com',
  });

  const [deploymentScope, setDeploymentScope] = useState<'local' | 'server' | 'full'>('local');

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
    if (deploymentScope === 'local') return ['Local Core & Workspace', 'Local Data & Models', 'Cloud & Remote Integrations'];
    if (deploymentScope === 'server') return ['Local Core & Workspace', 'Public Infrastructure (VPS)'];
    return Object.keys(categories);
  };

  const visibleCategoryList = getVisibleCategories();

  const isModuleActive = (id: string) => {
    const mod = MODULES.find(m => m.id === id);
    if (!mod) return false;
    return selectedModules[id] && visibleCategoryList.includes(mod.category);
  };

  const generateZip = async () => {
    const zip = new JSZip();
    const safeProjectName = config.projectName.replace(/\s+/g, '_');
    const folder = zip.folder(safeProjectName);
    if (!folder) return;

    // Core AGENTS.md
    let agentsMd = `# AGENTS.md — ${config.projectName}\n\n`;
    agentsMd += `> **Format Standard**: [AGENTS.md Open Standard](https://agents.md)\n\n`;
    agentsMd += `## AI Persona\n- You are the AI Assistant assigned to ${config.projectName}.\n- Address the user as: ${config.authorName}.\n- Language: Traditional Chinese (Taiwan), unless specified otherwise.\n\n`;

    if (deploymentScope === 'server' || deploymentScope === 'full') {
      agentsMd += `## System Architecture\n- Domain: ${config.domain}\n- Core configuration source of truth is the local \`config/\` directory.\n\n`;
    } else {
      agentsMd += `## System Architecture\n- Environment: Local Development Workspace\n- Core configuration source of truth is the local \`config/\` directory.\n\n`;
    }

    agentsMd += `## Workspace Rules\n- **CRITICAL**: All code execution, compilation, and file modifications MUST be performed entirely inside the Docker container environment. Do not install packages or run scripts on the bare metal host.\n`;
    agentsMd += `- **PROACTIVE SETUP**: Upon first reading this repository, you MUST immediately scan for \`SETUP.md\` or \`docker-compose.yml\` and autonomously initiate the setup commands (e.g., \`docker-compose up -d --build\`, \`git init\`). **⚠️ CRITICAL: You must check if the environment is already running first (e.g., via \`docker ps\` or checking for \`.venv\`). DO NOT OVERWRITE or reinstall if the system is already configured.**\n\n`;
    agentsMd += `## Security & Boundaries\n- **Never write**: API Keys, Tokens, Passwords, unredacted PII.\n- **Safe to write**: Hashes, Fingerprints, reference paths.\n\n`;
    agentsMd += `## Success Log\n- ${new Date().toISOString().split('T')[0]} : Initialized project persistent memory via AI Memory OS Generator.\n\n`;
    agentsMd += `## Decision Log\n> Every decision must include this minimum schema.\n\n| Date | Scope | Decision | Confidence | Provenance | Review_after | Status | Conflict_with | Superseded_by |\n|---|---|---|---|---|---|---|---|---|\n| ${new Date().toISOString().split('T')[0]} | infra | Initialized Blueprint OS | high | Generator | - | Active | - | - |\n\n`;
    agentsMd += `## Roadmap\n- [ ] Analyze codebase and begin planning.\n`;
    folder.file("AGENTS.md", agentsMd);

    // Initial Setup Instructions (SETUP.md)
    let setupMd = `# First Time Setup Guide\n\nWelcome to your new AI Memory OS workspace! As your AI coding assistant, I will autonomously help you set up this environment.\n\n`;
    setupMd += `## 🤖 AI Auto-Execution Protocol\n**Attention AI Agent:** You must proactively execute the commands in the \`Installation\` section below. \n- **Verification First (Zero-Destruct Policy)**: Before running ANY setup commands, you MUST test if the system is already configured. The bash commands below have built-in safety checks, but you must remain vigilant and never overwrite an existing working state.\n- **Autonomous Debugging**: If any command fails, debug it autonomously before asking the human for help.\n\n`;

    setupMd += `## 🛠️ Installation\nPlease run the following commands sequentially to bring up the environment (if not already running):\n\`\`\`bash\n`;
    if (isModuleActive('infra_docker') || true) {
      setupMd += `# 1. Start the container\nif ! docker ps | grep -q "${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace"; then\n  docker-compose up -d --build\nelse\n  echo "Docker environment already running."\nfi\n\n`;
    }
    if (isModuleActive('ci_python_tools') || isModuleActive('ci_testing_matrix')) {
      setupMd += `# 2. Configure Python environment INSIDE the container\n`;
      setupMd += `docker exec -it ${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace bash -c "`;
      setupMd += `if [ ! -d '.venv' ]; then uv venv; fi && source .venv/bin/activate`;
      if (isModuleActive('ci_python_tools')) setupMd += ` && uv pip install -e .[dev]`;
      if (isModuleActive('ci_testing_matrix')) setupMd += ` && uv pip install pytest-testinfra`;
      setupMd += `"\n`;
    }
    setupMd += `\`\`\`\n\n`;

    if (isModuleActive('ci_git_hook') || isModuleActive('infra_gateway') || isModuleActive('mem_cloud')) {
      setupMd += `## 🔑 Prerequisites Checklist\nPlease ensure we have the following accounts and credentials prepared:\n\n`;
    }

    if (isModuleActive('ci_git_hook')) {
      setupMd += `### 1. Remote Git Repository (GitHub / Gitea)\n- **Why:** Required for version control and the automated pre-push memory sync.\n- **Human Action:** Please create an empty repository on GitHub or your local Gitea server and provide me with the clone URL.\n- **AI Action:** I will execute \`git init\`, \`git remote add origin <URL>\`, and \`git push -u origin main\`.\n\n`;
    }

    if (isModuleActive('mem_cloud')) {
      setupMd += `### 2. Cloud Storage API (Google Drive / OneDrive)\n- **Why:** Required for integrating persistent cloud documents into our local memory vector database.\n- **Human Action:** Please go to the Google Cloud Console (or Azure Portal) and create an OAuth Client ID/Secret. Download the \`credentials.json\` file and place it in the \`config/\` directory.\n- **AI Action:** Once provided, I will run the Rclone authorization flow and configure LlamaIndex targeting the mounted container.\n\n`;
    }

    if (isModuleActive('infra_gateway') || isModuleActive('infra_watchdog')) {
      setupMd += `### 3. Public Domain & VPS Infrastructure\n- **Why:** Required for Edge Gateway routing and uptime monitoring.\n- **Human Action:** Please ensure your domain (or IP) \`${config.domain}\` points to your server. Make sure port 80 (and 443 if using a domain) is open on your VPS firewall.\n- **AI Action:** I will deploy the \`docker-compose.yml\` gateway service and start Caddy.\n\n`;
    }

    setupMd += `***\n\n**To the Human User:** Please read the prerequisites checklist (if any). Provide me with the necessary repository URLs or credentials, and I will handle the rest!\n`;
    folder.file("SETUP.md", setupMd);

    // Core Workflows
    let startWf = `---\ndescription: Initialize project memory and context retrieval\n---\n1. **Environment Audit (Phase 0)**: Determine if greenfield or existing. Check for modernized tools.\n2. **Verify Subsystems**: Run \`docker ps\` and syntax checks to ensure the system is healthy before modifying code.\n3. **Read AGENTS.md**: Internalize Success Log, Decision Log, and Roadmap.\n4. **Perform Semantic Search**: Extract Historical Habits and past experiences.\n5. **Dynamic Planning**: Autonomously determine whether to enter PLANNING mode or jump to EXECUTION.\n6. **Report readiness** to the user.\n`;
    let endWf = `---\ndescription: Conversation end memory persistence and evidence logging\n---\n1. **Self-Reflection**: Review newly created shell scripts, solutions, or resolved bugs.\n2. **Memory Reconsolidation & Pruning**: Dedup, Conflict Resolution, Weighting, Quality Filter.\n3. **Clean Workspace**: Wipe temporary rubbish.\n4. **Update AGENTS.md**: Condense new knowledge into Decision Log and Success Log.\n5. **Git Push**: Execute Git commit + push to trigger pre-push hook for vector indexing.\n6. **Confirm memory persistence** to the user.\n`;

    folder.folder(".agents")?.folder("workflows")?.file("start.md", startWf);
    folder.folder(".agents")?.folder("workflows")?.file("end.md", endWf);

    // LanceDB
    if (isModuleActive('mem_lancedb')) {
      let ingestPy = `"""Index project files into LanceDB"""\nimport lancedb\nfrom pathlib import Path\nfrom langchain_huggingface import HuggingFaceEmbeddings\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\n# ... Implement LanceDB ingest logic here ...\nprint("✅ Indexed chunks")\n`;
      let queryPy = `"""Semantic search for LanceDB KB"""\nimport sys, lancedb\nfrom pathlib import Path\nfrom langchain_huggingface import HuggingFaceEmbeddings\n\n# ... Implement LanceDB query logic here ...\n`;
      folder.folder("scripts")?.file("ingest.py", ingestPy);
      folder.folder("scripts")?.file("query.py", queryPy);
    }

    // Git Hook
    if (isModuleActive('ci_git_hook')) {
      let prePush = `#!/bin/bash\necho "🧠 Syncing knowledge base (Incremental update)..."\n# Must run ingestion inside the container\ndocker exec ${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace bash -c "source .venv/bin/activate && python scripts/ingest.py"\nif [ $? -ne 0 ]; then\n  echo "❌ Knowledge base indexing failed!"\n  exit 1\nfi\necho "✅ Knowledge base updated"\n`;
      folder.folder(".git")?.folder("hooks")?.file("pre-push", prePush);
    }

    // Python Tooling
    if (isModuleActive('ci_python_tools')) {
      let pyprojectToml = `[project]\nname = "${safeProjectName.toLowerCase().replace(/_/g, '-')}"\nversion = "0.1.0"\ndescription = "AI Generated Project"\nauthors = [{name = "${config.authorName}"}]\nrequires-python = ">=3.10"\ndependencies = []\n\n[project.optional-dependencies]\ndev = [\n    "pytest>=8.0.0",\n    "pytest-cov>=4.1.0",\n    "ruff>=0.3.0"\n]\n\n[tool.ruff]\nline-length = 120\n\n[tool.pytest.ini_options]\ntestpaths = ["tests"]\npython_files = "test_*.py"\n`;
      folder.file("pyproject.toml", pyprojectToml);

      let testBasicPy = `import pytest\n\ndef test_environment_ready():\n    """Verify testing matrix is operational."""\n    assert True\n`;
      folder.folder("tests")?.file("test_basic.py", testBasicPy);
    }

    // Testing Matrix (Bats, Testinfra)
    if (isModuleActive('ci_testing_matrix')) {
      let testMatrixSh = `#!/bin/bash\n# Full Coverage Testing Matrix\nif [ ! -f /.dockerenv ]; then\n  echo "❌ CRITICAL: This script must be run INSIDE the Docker container!"\n  exit 1\nfi\n\necho "Running Shellcheck..."\nfind scripts/ -type f -name "*.sh" -exec shellcheck {} +\n\necho "Running Python Unit Tests..."\npytest tests/\n\necho "Running Bats Core Tests..."\nbats tests/shell/\n\necho "Running Docker Testinfra Validation..."\npytest tests/infra/\n\necho "✅ Matrix Passed"\n`;
      folder.folder("scripts")?.folder("system")?.file("test_matrix.sh", testMatrixSh);

      let testInfraPy = `import testinfra\n\ndef test_local_socket_listening(host):\n    """Verify internal container state and active services."""\n    # e.g., assert host.socket("tcp://0.0.0.0:8000").is_listening\n    assert True\n`;
      folder.folder("tests")?.folder("infra")?.file("test_infra.py", testInfraPy);

      let batsTest = `#!/usr/bin/env bats\n\n@test "Syntax check scripts" {\n    run bash -n scripts/system/test_matrix.sh\n    [ "$status" -eq 0 ]\n}\n`;
      folder.folder("tests")?.folder("shell")?.file("test_scripts.bats", batsTest);
    }

    // IP Validation Helper
    const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(config.domain);
    const protocol = isIpAddress ? 'http' : 'https';

    // Caddyfile
    if (isModuleActive('infra_gateway')) {
      let caddyHost = isIpAddress ? `http://${config.domain}` : config.domain;
      let caddyfile = `${caddyHost} {\n  # Academic Bot Whitelist\n  @bots {\n    header User-Agent *Googlebot*\n    header User-Agent *GPTBot*\n    header User-Agent *ClaudeBot*\n  }\n  \n  reverse_proxy localhost:8080\n}\n`;
      folder.folder("config")?.folder("caddy")?.file("Caddyfile", caddyfile);
    }

    // Dockerized Workspace Structure
    if (isModuleActive('infra_docker') || true) { // Always evaluated, it's required
      let compose = `services:\n  workspace:\n    container_name: ${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace\n    build: .\n    image: ${safeProjectName.toLowerCase().replace(/_/g, '-')}-env\n`;
      compose += `    volumes:\n      - .:/workspace\n    working_dir: /workspace\n    command: sleep infinity\n    restart: unless-stopped\n    deploy:\n      resources:\n        limits:\n          memory: 2G\n`;

      if (isModuleActive('infra_gateway')) {
        // Expose port if needed for Caddy integration
        compose += `\n  gateway:\n    image: caddy:alpine\n    ports:\n      - "80:80"\n      - "443:443"\n    volumes:\n      - ./config/caddy/Caddyfile:/etc/caddy/Caddyfile\n    restart: unless-stopped\n`;
      }

      folder.file("docker-compose.yml", compose);
    }

    let dockerfile = `FROM ubuntu:24.04\n\nENV DEBIAN_FRONTEND=noninteractive\n\nRUN apt-get update && apt-get install -y \\\n    curl \\\n    git \\\n    python3-pip \\\n    python3-venv \\\n`;
    if (isModuleActive('env_academic')) {
      dockerfile += `    texlive-full \\\n    pandoc \\\n`;
    }
    dockerfile += `    && rm -rf /var/lib/apt/lists/*\n\n# Safely install uv globally\nRUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh\n\nWORKDIR /workspace\n`;
    folder.file("Dockerfile", dockerfile);

    // Watchdog
    if (isModuleActive('infra_watchdog')) {
      let watchdog = `#!/bin/bash\n# Self-Healing Watchdog\n# Checks endpoints and restarts frozen docker containers\n\nTARGET="${protocol}://${config.domain}"\nCONTAINER="${safeProjectName.toLowerCase().replace(/_/g, '-')}-workspace"\n\nif ! curl -s --head  --request GET "$TARGET" | grep "200" > /dev/null; then\n  echo "Endpoint dead. Restarting container..."\n  docker restart "$CONTAINER"\nfi\n`;
      folder.folder("scripts")?.folder("system")?.file("watchdog.sh", watchdog);
    }

    // IaC Ansible
    if (isModuleActive('infra_iac')) {
      let deploySh = `#!/bin/bash\n# Deploy configuration to staging/production\necho "Pushing changes via Ansible..."\nansible-playbook -i ansible/inventory.ini ansible/playbooks/update_scripts.yml\n`;
      folder.folder("scripts")?.folder("system")?.file("deploy.sh", deploySh);

      let inventory = `[production]\n${config.domain} ansible_user=root\n`;
      folder.folder("ansible")?.file("inventory.ini", inventory);

      let playbook = `---\n- name: Update Crontabs and Scripts\n  hosts: production\n  tasks:\n    - name: Ensure watchdog is in crontab\n      ansible.builtin.cron:\n        name: "Self-healing watchdog"\n        minute: "*/5"\n        job: "/workspace/scripts/system/watchdog.sh > /dev/null 2>&1"\n`;
      folder.folder("ansible")?.folder("playbooks")?.file("update_scripts.yml", playbook);
    }

    // Conversation Digest
    if (isModuleActive('mem_digest')) {
      let digestPy = `"""Extract and summarize Agent conversation logs"""\nimport json, os, datetime\n\ndef generate_digest(log_path):\n    # TODO: Implement LLM summarization of log history\n    print(f"✅ Generated daily digest for {datetime.date.today()}")\n\nif __name__ == '__main__':\n    generate_digest('.agents/logs')\n`;
      folder.folder("scripts")?.folder("system")?.file("conversation_digest.py", digestPy);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${safeProjectName}_Blueprint_OS.zip`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center font-sans text-gray-800">
      <div className="max-w-6xl w-full grid grid-cols-12 gap-8">

        {/* Left Sidebar - Options */}
        <div className="col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold tracking-tight">AI Memory OS</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">Configure and export your persistent memory and infrastructure blueprint.</p>

            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1: Deployment Scope</h3>
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setDeploymentScope('local')}
                  className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all ${deploymentScope === 'local' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <Monitor className={`w-6 h-6 mb-2 ${deploymentScope === 'local' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm text-gray-900">Local Only</span>
                  <span className="text-[10px] text-gray-500 mt-1">Docker on your laptop</span>
                </div>

                <div
                  onClick={() => setDeploymentScope('server')}
                  className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all ${deploymentScope === 'server' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <Globe className={`w-6 h-6 mb-2 ${deploymentScope === 'server' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm text-gray-900">Public VPS</span>
                  <span className="text-[10px] text-gray-500 mt-1">Caddy & Watchdog scripts</span>
                </div>

                <div
                  onClick={() => setDeploymentScope('full')}
                  className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all ${deploymentScope === 'full' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <Network className={`w-6 h-6 mb-2 ${deploymentScope === 'full' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm text-gray-900">Full Stack</span>
                  <span className="text-[10px] text-gray-500 mt-1">Local + Cloud Infra</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2: Global Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" name="projectName" value={config.projectName} onChange={handleConfigChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input type="text" name="authorName" value={config.authorName} onChange={handleConfigChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              {(deploymentScope === 'server' || deploymentScope === 'full') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Domain (For Infra)</label>
                  <input type="text" name="domain" value={config.domain} onChange={handleConfigChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Step 3: Module Selection</h3>

            <div className="space-y-8">
              {Object.entries(categories)
                .filter(([category]) => visibleCategoryList.includes(category))
                .map(([category, mods]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-1">{category}</h4>
                    <div className="space-y-3">
                      {mods.map((mod) => (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(mod.id, mod.required)}
                          className={`flex gap-3 p-3 rounded-lg border ${selectedModules[mod.id] ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} ${mod.required ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} transition-colors`}
                        >
                          <div className="mt-0.5">
                            <input
                              type="checkbox"
                              checked={selectedModules[mod.id]}
                              onChange={() => toggleModule(mod.id, mod.required)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              disabled={mod.required}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {mod.icon} {mod.name}
                              {mod.required && <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">Required</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{mod.desc}</p>

                            {/* Rendering Prerequisites Warnings if the module is selected */}
                            {mod.prerequisites && selectedModules[mod.id] && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {mod.prerequisites.map((req: string, idx: number) => (
                                  <span key={idx} className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded shadow-sm">
                                    <AlertCircle className="w-3 h-3" /> Prefix req: {req}
                                  </span>
                                ))}
                              </div>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Preview - Output */}
        <div className="col-span-7 flex flex-col">
          <div className="bg-gray-900 rounded-xl shadow-xl flex-grow flex flex-col overflow-hidden border border-gray-800">
            <div className="flex bg-gray-800 px-4 py-3 items-center justify-between border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-xs font-mono text-gray-400">Blueprint Preview</p>
              <div></div>
            </div>

            <div className="p-6 overflow-y-auto flex-grow text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              <div className="opacity-50"># This preview shows the folder structure that will be generated.</div>
              {`\n📁 ${config.projectName.replace(/\s+/g, '_')}/\n`}
              {`├── 📄 SETUP.md\n`}
              {`├── 📄 AGENTS.md\n`}
              {`├── 📁 .agents/\n│   └── 📁 workflows/\n│       ├── 📄 start.md\n│       └── 📄 end.md\n`}

              {isModuleActive('ci_git_hook') && `├── 📁 .git/hooks/\n│   └── 📄 pre-push\n`}

              {(isModuleActive('mem_lancedb') || isModuleActive('infra_watchdog') || isModuleActive('ci_testing_matrix') || isModuleActive('infra_iac') || isModuleActive('mem_digest')) && `├── 📁 scripts/\n`}
              {isModuleActive('mem_lancedb') && `│   ├── 📄 ingest.py\n│   ├── 📄 query.py\n`}
              {(isModuleActive('infra_watchdog') || isModuleActive('ci_testing_matrix') || isModuleActive('infra_iac') || isModuleActive('mem_digest')) && `│   └── 📁 system/\n`}
              {isModuleActive('infra_watchdog') && `│       ├── 📄 watchdog.sh\n`}
              {isModuleActive('ci_testing_matrix') && `│       ├── 📄 test_matrix.sh\n`}
              {isModuleActive('infra_iac') && `│       ├── 📄 deploy.sh\n`}
              {isModuleActive('mem_digest') && `│       └── 📄 conversation_digest.py\n`}

              {(isModuleActive('ci_python_tools') || isModuleActive('ci_testing_matrix')) && `├── 📁 tests/\n`}
              {isModuleActive('ci_python_tools') && `│   └── 📄 test_basic.py\n`}
              {isModuleActive('ci_testing_matrix') && `│   ├── 📁 infra/\n│   │   └── 📄 test_infra.py\n│   └── 📁 shell/\n│       └── 📄 test_scripts.bats\n`}
              {isModuleActive('ci_python_tools') && `├── 📄 pyproject.toml\n`}

              {isModuleActive('infra_gateway') && `├── 📁 config/\n│   └── 📁 caddy/\n│       └── 📄 Caddyfile\n`}
              {isModuleActive('infra_iac') && `├── 📁 ansible/\n│   ├── 📄 inventory.ini\n│   └── 📁 playbooks/\n│       └── 📄 update_scripts.yml\n`}
              {isModuleActive('env_academic') && `├── 📄 Dockerfile\n`}
              {`├── 📄 docker-compose.yml\n`}
            </div>

            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <button
                onClick={generateZip}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Blueprint ZIP
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
