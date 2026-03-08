# 🧠 AI Memory OS — Blueprint Generator

[繁體中文](README_zh-TW.md) | [English](README.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-project.interaction.tw-00C853?style=flat-square&logo=vercel)](https://project.interaction.tw/)
[![Tests](https://img.shields.io/badge/Tests-104%20passing-brightgreen?style=flat-square)](src/generators.test.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![AGENTS.md](https://img.shields.io/badge/standard-AGENTS.md-blue?style=flat-square)](https://agents.md/)

**AI Memory OS** is a zero-backend React SPA that generates containerized workspace blueprints for AI coding agents (Cursor, Windsurf, GitHub Copilot, etc.). Instead of manually writing `AGENTS.md`, Dockerfiles, and setup scripts, users configure their project through a visual interface and download a single ZIP containing everything an AI agent needs to operate autonomously — with memory, guardrails, and domain expertise built in.

> **Zero API keys required. Zero cloud dependencies. Everything runs in the browser.**

---

## ✨ What It Generates

Each downloaded ZIP is a self-contained AI workspace blueprint:

| File | Purpose |
|---|---|
| `AGENTS.md` | AI persona, rules, Decision Log, and Cloud LLM Reduction Protocol |
| `SETUP.md` | Step-by-step autonomous initialization guide for the AI |
| `.agents/workflows/start.md` | Session-start protocol (context retrieval, health check) |
| `.agents/workflows/end.md` | Session-end protocol (memory persistence, git commit) |
| `.agents/module_registry.json` | Machine-readable manifest of active modules and script paths |
| `Dockerfile` + `docker-compose.yml` | Isolated container environment |
| `scripts/system/health_check.py` | 6-point self-diagnostic (always included) |
| `docs/DOMAIN_CONTEXT.md` | Domain-specific best practices and directory conventions |
| `docs/USER_GUIDE_ZH.md` / `EN.md` | Auto-generated user manuals matching selected modules |

## 🎯 Domain System

Choose a domain to inject **role-specific AI behavior** into every generated file:

| Domain | AI Behavior | Key Rules |
|---|---|---|
| 🔧 **General Purpose** | Standard development assistant | Code quality, commit discipline, dependency management |
| 🎓 **Student Project** | Teaching assistant (guides, doesn't give answers) | Academic integrity, Chinese documentation, weekly progress logs |
| 🎨 **Design Work** | Design-aware collaborator | Asset management (SVG/compressed images), Design Tokens, WCAG accessibility |
| ⚡ **Interactive Coding** | Real-time performance expert | No I/O in `draw()`, hardware safety guards, demo-ready commits |

Each domain auto-configures:
- **AGENTS.md rules** — domain-specific coding standards
- **SETUP.md steps** — directory scaffolding and templates
- **start.md queries** — LanceDB semantic queries or local file review topics
- **Recommended modules** — pre-selected based on domain needs
- **Decision Log seeds** — pre-filled architectural decisions
- **DOMAIN_CONTEXT.md** — best practices document

## 🧩 Module System

14 composable modules across 5 categories:

### Memory & Knowledge
| Module | What It Does |
|---|---|
| **LanceDB** | Local vector database with `ingest.py` / `query.py` for semantic search |
| **Context Bundler** | Generates `CONTEXT_SNAPSHOT.md` at session start — zero-token context awareness |
| **Response Cache** | SQLite-backed semantic cache (≥92% similarity → skip cloud LLM) |
| **Conversation Digest** | Extracts and stores session summaries for long-term memory |
| **Cloud Drive** | LlamaIndex integration for Google Drive / OneDrive indexing |
| **Ollama** | Local LLM container (gemma:2b) for offline, privacy-first generation |

### CI/CD & Quality
| Module | What It Does |
|---|---|
| **Python Tooling** | `pyproject.toml` + pytest + ruff configuration |
| **Git Hook** | Pre-push: GitLeaks secret scanning + LanceDB auto-sync |
| **Testing Matrix** | Testinfra (Docker) + Bats-core (Shell) test scaffolding |

### Infrastructure
| Module | What It Does |
|---|---|
| **Edge Gateway** | Caddy reverse proxy with academic bot whitelist |
| **Watchdog** | Crontab health monitoring + auto-restart for Docker services |
| **IaC Ansible** | Ansible playbooks for remote deployment automation |

### Education
| Module | What It Does |
|---|---|
| **Homework Submission** | 5GB direct-to-CDN upload with Google OIDC verification |

### Environment
| Module | What It Does |
|---|---|
| **Academic LaTeX** | TexLive + CJK font support in Docker |

## 🚀 Usage

### Online (Recommended)
1. Visit **[project.interaction.tw](https://project.interaction.tw/)**
2. Configure project name, roles, deployment scope
3. Select a domain (optional but recommended)
4. Toggle modules as needed
5. Download ZIP → Unzip into project folder
6. Open in AI editor → Tell your AI: *"Read AGENTS.md and execute SETUP.md"*

### Local Development
```bash
git clone https://github.com/chenweichiang/AI-memory-os.git
cd AI-memory-os
npm install
npm run dev      # → http://localhost:5173
npm test         # → 104 tests
npm run build    # → Production bundle
```

## 🏗 Architecture

```
src/
├── App.tsx              # UI: 4-step wizard, domain selector, module toggles
├── generators.ts        # All prompt/script generators (1460 lines, 104 tests)
├── generators.test.ts   # Full coverage test suite
├── domains/
│   ├── index.ts         # Domain registry and type definitions
│   ├── general.ts       # General Purpose domain profile
│   ├── student.ts       # Student Project domain profile
│   ├── design.ts        # Design Work domain profile
│   └── interactive.ts   # Interactive Coding domain profile
├── main.tsx             # React entry point
└── index.css            # Tailwind directives
```

**Key design decisions:**
- **Zero backend** — All generation happens client-side via TypeScript string templates
- **Zero dependencies on AI APIs** — No tokens consumed during generation
- **Module-aware prompts** — Cloud LLM Reduction Protocol only shows steps for active modules
- **Domain-aware queries** — `start.md` generates executable LanceDB commands when available, falls back to topic review when not

## 🧪 Testing

```bash
npm test   # 104 tests covering:
```

| Category | Tests | Coverage |
|---|---|---|
| Helpers | 4 | Name sanitization, container naming |
| Static templates | 10 | All Python/Bash scripts validated |
| Teardown | 10 | Module-specific uninstall instructions |
| AGENTS.md | 7 | Persona, architecture, LLM protocol |
| SETUP.md | 9 | Docker, Python, prerequisites |
| Workflows | 7 | start.md / end.md generation |
| Infrastructure | 18 | Dockerfile, Compose, Caddy, Ansible |
| User Docs | 9 | ZH/EN guide generation |
| Module Isolation | 3 | No cross-contamination between modules |
| Domain Injection | 7 | Rules, setup, queries per domain |
| Phase 4 | 9 | Health check, module registry |
| **Total** | **104** | |

## 👥 Author

- **Chiang, Chenwei (江振維)** — [Interaction Lab](https://interaction.tw)

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT).
Built on the [AGENTS.md](https://agents.md/) open standard for autonomous agent instruction.
