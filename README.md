# 🧠 AI Memory OS Blueprint Generator

[繁體中文](README_zh-TW.md) | [English](README.md)

[![Deploy](https://github.com/chenweichiang/AI-memory-os/actions/workflows/deploy.yml/badge.svg)](https://interaction.tw/project_gen/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AGENTS.md Standards](https://img.shields.io/badge/standard-AGENTS.md-blue)](https://agents.md/)

AI Memory OS Blueprint Generator is a React-based Visual SPA designed to **bridge the gap between AI Coding Prompt Engineering and secure DevOps Infrastructure**. It allows developers to configure and export a fully-fledged isolated container working environment for AI agents (e.g., Cursor, Windsurf) through an intuitive UI. 

Instead of manually crafting `AGENTS.md` and writing boilerplate Dockerfiles, this generator packages isolated networking, self-healing mechanics, automated git-hook vector syncing, and zero-destruct execution policies into a single, cohesive ZIP archive.

---

## 🚀 Features

- **Proactive AI Execution (Zero-Destruct Protocol)**: The generated `SETUP.md` includes AI commands that proactively audit the host (`if ! docker ps...`) before establishing the container environment. The AI acts as a DevOps engineer without requiring human prompts to start the setup.
- **Strict Container Segregation**: Your AI is confined to a Docker environment (`.dockerenv` physical barriers) for all execution—preventing accidental `rm -rf /` or pip package pollution on your Mac/PC host.
- **Edge Gateway & Self-Healing (VPS Ready)**: Automatically configures Caddy reverse proxies with academic bot whitelists and crontab-driven Watchdog Bash scripts that restart frozen docker services.
- **Semantic Memory Automation**: Instantly stubs out Python files for `LanceDB` local vector embeddings and `LlamaIndex` cloud integrations. Features `pre-push` git hooks to guarantee the AI synchronizes memory prior to every commit.
- **Multi-Layer Test Matrix**: Stubs Testinfra (Docker validation) and Bats-core (Shell behavior testing).

## 🛠 Usage

1. **Access the Application**: Visit the live deployment at [https://interaction.tw/project_gen/](https://interaction.tw/project_gen/) or clone this repository and run `npm run dev`.
2. **Select Target Scope**: Choose between "Local Only", "Public VPS", or "Full Stack" to narrow down necessary modules.
3. **Configure Settings**: Select the modules you wish to package into your AI's brain (e.g., Python Tooling, Ansible playbooks, Conversation Digest).
4. **Download Blueprint**: Hit download, unzip into your new empty project folder.
5. **Awaken the Agent**: Open the folder in an AI-native editor (e.g., Cursor) and simply state: *"Read AGENTS.md and execute the initial setup."*

## 📁 Repository Structure

This repository is built with **React**, **Vite**, and **TailwindCSS**. It relies on `JSZip` to bundle the dynamic Markdown and Shell script strings client-side. There is no backend database required.

\`\`\`
src/
├── App.tsx          // UI logic, Module selection lists, JSZip logic
├── App.css          // Vanilla extensions for TailwindCSS
├── index.css        // Tailwind directives
\`\`\`

## 📚 Motivation

Relying on AI to generate code requires establishing hard guardrails. The AI Memory OS was born out of the Interaction Lab's academic research into making Autonomous Agents resilient and auditable. By packing the environment constraints (`limits: memory: 2G`) into the repo alongside the `AGENTS.md` persona directions, teams can guarantee that any AI checking out the project operates under the exact same technical constraints and toolchains.

## 👥 Authors

- **Chiang, Chenwei (江振維)** - Interaction Lab

## 📄 License & Standards

This project uses the [AGENTS.md](https://agents.md/) open standard protocol for instructing autonomous agents. 
Open Source under the MIT License.
