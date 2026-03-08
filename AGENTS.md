# AGENTS.md — ai-memory-generator

> **Format Standard**: [AGENTS.md Open Standard](https://agents.md)
> **Scope**: Governs AI-assisted development on **this generator project** — NOT the downstream projects it generates.
> **Primary Audience**: AI assistants (Antigravity, Cursor, Copilot, etc.) working on this codebase.

---

## 1. Project Identity

**ai-memory-generator** is a **client-side React + TypeScript SPA** that lets users configure and export a ZIP archive containing AI agent configuration files (AGENTS.md, SETUP.md, workflows, Dockerfile, Python scripts, etc.) for other projects.

| Item | Value |
|---|---|
| Stack | React 19, TypeScript, Vite 7, TailwindCSS 4 |
| ZIP generation | JSZip + file-saver (100% client-side, no server) |
| UI + state | `src/App.tsx` (~889 lines) — React component, state, JSX |
| Generator logic | `src/generators.ts` (~1225 lines) — all ZIP content generation |
| Test suite | `src/generators.test.ts` (~679 lines, 88 tests, vitest) |
| Styling | TailwindCSS utility classes only — no separate CSS components |
| Build output | `dist/` (static files, deployed to `project.interaction.tw`) |
| Build command | `npm run build` (runs `tsc -b && vite build`) |
| Test command | `npm test` (runs `vitest run`) |
| Lint command | `npm run lint` |
| Dev server | `npm run dev` |

**There is no backend, no database, no API.** Generator logic lives in pure functions in `src/generators.ts`; UI logic lives in `src/App.tsx`.

---

## 2. Architecture Map

Read this before touching any code. The codebase is split across two main files.

```
src/
├── App.tsx            (~889 lines — UI, state, JSX)
├── generators.ts      (~1225 lines — all ZIP content generation)
└── generators.test.ts (~679 lines — 88 vitest unit tests)
```

### src/App.tsx — UI Layer

```
src/App.tsx
│
├── TRANSLATIONS (L7–L137)
│   ├── en: { ... }       ← English UI strings
│   └── zh: { ... }       ← Traditional Chinese UI strings
│   ⚠️  Both objects MUST have identical keys.
│
├── ChipInput (L139–L214)
│   └── Tag-input UI component for userRole / aiRole fields.
│       Do not modify unless fixing IME / chip input behavior.
│
├── MODULES (L216–L417)
│   └── Array of 17 module definitions. Each entry controls:
│       - id, category, categoryZh, icon, name, nameZh
│       - desc, descZh, required, prerequisites, prerequisitesZh
│
├── App() function (L419–L889)
│   ├── State: selectedModules, config, deploymentScope, actionType, language
│   │
│   ├── getVisibleCategories() (L453–L458)
│   │   ├── 'local'  → ['Local Core & Workspace', 'Local Data & Models']
│   │   ├── 'server' → above + ['Public Infrastructure (VPS)']
│   │   └── 'full'   → all categories
│   │
│   ├── isModuleActive(id) (L466–L472)
│   │   └── Returns true ONLY IF:
│   │       1. selectedModules[id] is true (or mod.required + install mode), AND
│   │       2. mod.category is in visibleCategoryList for current scope
│   │
│   ├── generateZip() (L489–L501) — 13-line orchestrator
│   │   └── Creates JSZip, builds ProjectConfig, delegates to
│   │       assembleZipContent() in generators.ts, then saves blob.
│   │
│   └── JSX return (L503–L889)
│       ├── UI steps (action type, scope, metadata, module matrix)
│       └── Preview tree (L806–L846) — MANUAL replica of generated output
```

### src/generators.ts — Generator Layer

```
src/generators.ts
│
├── Types (L12–L20)
│   ├── ProjectConfig   ← { projectName, userRole, aiRole, domain, deploymentScope }
│   └── ModuleChecker   ← (id: string) => boolean
│
├── Helpers (L24–L43)
│   ├── getSafeProjectName(config)  → config.projectName.replace(/\s+/g, '_')
│   ├── getContainerName(config)    → lowercase-kebab + '-workspace'
│   ├── getUserRoles(config)        → config.userRole.split(/\s+/).filter(Boolean)
│   ├── getAiRoles(config)          → config.aiRole.split(/\s+/).filter(Boolean)
│   └── isIpAddress(domain)         → /^\d+\.\d+\.\d+\.\d+$/.test()
│
├── Static Template Constants
│   ├── INGEST_PY, QUERY_PY, TEST_BASIC_PY
│   ├── SUBMIT_HOMEWORK_PY, HOMEWORK_README
│   ├── LLAMA_DRIVE_INDEXER_PY, TEST_MATRIX_SH
│   ├── TEST_INFRA_PY, BATS_TEST, DEPLOY_SH
│   ├── CONVERSATION_DIGEST_PY, BUNDLE_CONTEXT_PY, CACHE_PY
│
├── Dynamic Generator Functions
│   ├── generateTeardownMd(config, isActive)
│   ├── generateAgentsMd(config, isActive)
│   ├── generateSetupMd(config, isActive)
│   ├── generateStartWorkflow(config, isActive)
│   ├── generateEndWorkflow(config, isActive)
│   ├── generatePrePushHook(config, isActive)
│   ├── generatePyprojectToml(config, isActive)
│   ├── generateCaddyfile(config, isActive)
│   ├── generateDockerCompose(config, isActive)
│   ├── generateDockerfile(config, isActive)
│   ├── generateWatchdogSh(config)
│   ├── generateAnsibleInventory(config)
│   ├── generateAnsiblePlaybook(config)
│   ├── generateUserDocZH(config, isActive)
│   └── generateUserDocEN(config, isActive)
│
└── assembleZipContent(folder, config, isActive, actionType)
    └── Orchestrator: calls generators + folder.file() to assemble ZIP.
        This is the function called from App.tsx's generateZip().
```

### File Creation API (JSZip)

Inside `assembleZipContent()` (generators.ts), files are created with:
```typescript
folder.file("filename.ext", contentString);           // file in root
folder.folder("scripts")?.file("ingest.py", content); // file in subdirectory
folder.folder("a")?.folder("b")?.file("c.txt", content); // nested
```
`folder` is the root JSZip folder. All content is a string — use template literals.

---

## 3. Canonical Module IDs

`isModuleActive(id)` performs a **strict string match**. An incorrect ID silently returns `false` — no error, no warning.

| ID | Category | Scope Available | Required |
|---|---|---|---|
| `core_agents` | Local Core & Workspace | local, server, full | ✅ required |
| `core_workflows` | Local Core & Workspace | local, server, full | ✅ required |
| `infra_docker` | Local Core & Workspace | local, server, full | ✅ required |
| `mem_lancedb` | Local Data & Models | local, server, full | optional |
| `mem_ollama` | Local Data & Models | local, server, full | optional |
| `env_academic` | Local Data & Models | local, server, full | optional |
| `ci_python_tools` | Local Data & Models | local, server, full | optional |
| `mem_digest` | Local Data & Models | local, server, full | optional |
| `context_bundler` | Local Data & Models | local, server, full | optional |
| `response_cache` | Local Data & Models | local, server, full | optional |
| `mem_cloud` | Cloud & Remote Integrations | full only | optional |
| `ci_git_hook` | Cloud & Remote Integrations | full only | optional |
| `ci_testing_matrix` | Cloud & Remote Integrations | full only | optional |
| `edu_submission` | Cloud & Remote Integrations | full only | optional |
| `infra_gateway` | Public Infrastructure (VPS) | server, full | optional |
| `infra_watchdog` | Public Infrastructure (VPS) | server, full | optional |
| `infra_iac` | Public Infrastructure (VPS) | server, full | optional |

---

## 4. How to Add a New Module — Complete Checklist

Adding a new module requires changes across `src/App.tsx` and `src/generators.ts`, plus optionally AGENTS.md. Follow this order:

### Step 1 — Add to MODULES array (App.tsx L216–L417)

Insert a new object. Copy the exact shape:

```typescript
{
  id: 'your_module_id',          // snake_case, unique, lowercase
  category: 'Local Data & Models',  // MUST be one of the 4 valid categories (exact string)
  categoryZh: '本地數據與模型',
  icon: <Database className="w-5 h-5" />,  // pick from existing Lucide imports at L4
  name: 'Your Module Name',
  nameZh: '您的模組中文名稱',
  desc: 'EN description (max ~100 chars).',
  descZh: '中文說明（最多約100字元）。',
  required: false,
  // Only add prerequisites if the user must do something manually:
  prerequisites: ['A GitHub Account', 'API Key from XYZ'],
  prerequisitesZh: ['GitHub 帳號', 'XYZ API 金鑰'],
},
```

Valid `category` values (case-sensitive):
- `'Local Core & Workspace'`
- `'Local Data & Models'`
- `'Cloud & Remote Integrations'`
- `'Public Infrastructure (VPS)'`

### Step 2 — Add generation logic to `src/generators.ts`

Each generated file has its own function in `generators.ts`. Depending on what your module produces, you may need to modify one or more of these functions:

**For a new standalone script file**, add a static template constant and wire it into `assembleZipContent()`:
```typescript
// 1. Add constant near other static templates
const YOUR_SCRIPT_PY = `#!/usr/bin/env python3\n"""..."""\nimport sys\n...`;

// 2. Wire into assembleZipContent()
if (isActive('your_module_id')) {
  folder.folder("scripts")?.file("your_script.py", YOUR_SCRIPT_PY);
}
```

**For conditional content in an existing generator** (e.g., AGENTS.md, SETUP.md, teardown, pyproject.toml):
```typescript
// In the appropriate generator function:
if (isActive('your_module_id')) {
  content += `## Your Module Section\n...\n\n`;
}
```

**Key generator functions to modify by content type:**

| Content type | Generator function |
|---|---|
| Generated AGENTS.md section | `generateAgentsMd()` |
| SETUP.md instruction | `generateSetupMd()` |
| Teardown instruction | `generateTeardownMd()` |
| Python dependency | `generatePyprojectToml()` — add to `deps` array |
| docker-compose service | `generateDockerCompose()` |
| Dockerfile apt package | `generateDockerfile()` |
| Caddyfile reverse proxy | `generateCaddyfile()` |
| Start workflow step | `generateStartWorkflow()` |
| End workflow step | `generateEndWorkflow()` |
| User guide section | `generateUserDocZH()` + `generateUserDocEN()` |

**If your module creates a new file**, also add the `folder.file()` call in `assembleZipContent()` at the bottom of generators.ts.

### Step 3 — Update the preview tree JSX (App.tsx L806–L846)

Add the corresponding line in the preview tree. **This is MANUAL — it does NOT auto-generate.** Match the exact condition used in `assembleZipContent()`:

```tsx
{isModuleActive('your_module_id') && `│   ├── 📄 your_script.py\n`}
```

Place it in the correct position to reflect actual directory structure.

### Step 4 — Add UI strings to TRANSLATIONS (if needed)

If your module name or description needs to appear in the UI (beyond the MODULES array), add to both `en` and `zh` objects at L7–L137. **Both objects must always have identical keys.**

### Step 5 — Add unit tests (`src/generators.test.ts`)

Add tests for any new generator function or template constant. Follow the existing pattern:
```typescript
describe('generateYourFunction', () => {
  it('includes expected content when module active', () => {
    const result = generateYourFunction(baseConfig, activeModules('your_module_id'));
    expect(result).toContain('expected content');
  });
  it('excludes content when module inactive', () => {
    const result = generateYourFunction(baseConfig, noneActive);
    expect(result).not.toContain('optional content');
  });
});
```

Run `npm test` to verify all 88+ tests pass.

### Step 6 — Update AGENTS.md (this file)

Add your module ID to the canonical module ID table in Section 3.

---

## 5. Coding Rules

### R1 — Cross-Document Variable Consistency

All generated files share these computed variables from `generators.ts` helper functions:
- `getSafeProjectName(config)` — `config.projectName.replace(/\s+/g, '_')`
- `getContainerName(config)` — lowercase kebab-case + `-workspace`
- `getUserRoles(config)` — `config.userRole.split(/\s+/).filter(Boolean)`
- `getAiRoles(config)` — `config.aiRole.split(/\s+/).filter(Boolean)`

**Rule**: If you change how any of these are computed, audit ALL generator functions that call them. Run `npm test` — the test suite validates these helpers.

---

### R2 — Bash Error Handling: `set -e` + `||` Pattern

All generated shell scripts use `set -euo pipefail`. With this flag, a failing command causes **immediate script exit before any `if [ $? ]` check runs**.

**❌ WRONG — `$?` check is unreachable after failure:**
```bash
set -euo pipefail
some_command
if [ $? -ne 0 ]; then echo "failed"; fi  # never reached if some_command fails
```

**✅ CORRECT — use `||` for controlled error handling:**
```bash
set -euo pipefail
some_command || { echo "❌ Error message"; exit 1; }
```

**✅ ALSO CORRECT — conditional execution with guard:**
```bash
if some_check_command 2>/dev/null; then
  do_something || { echo "❌ Failed"; exit 1; }
else
  echo "ℹ️ Skipping — condition not met"
fi
```

---

### R3 — Ubuntu 24.04 apt Package Availability

The Dockerfile base is `ubuntu:24.04`. These tools are NOT available via apt and require alternative install methods:

| Tool | ❌ Not apt | ✅ Correct install |
|---|---|---|
| `gitleaks` | `apt install gitleaks` | `curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/main/scripts/install.sh \| sh -s -- -b /usr/local/bin` |
| `uv` | `apt install uv` | `curl -LsSf https://astral.sh/uv/install.sh \| env UV_INSTALL_DIR="/usr/local/bin" sh` |

**Rule**: Before adding any tool to the apt block, verify it exists in Ubuntu 24.04. If in doubt, add a separate `RUN curl ...` installation block after the main apt block.

---

### R4 — isModuleActive() ID Must Be Exact

```typescript
// From src/App.tsx L466-L472:
const isModuleActive = (id: string) => {
  const mod = MODULES.find(m => m.id === id);
  if (!mod) return false;  // ← wrong ID = silent false
  const isNodeRequired = mod.required && actionType === 'install';
  const isSelected = selectedModules[id] || isNodeRequired;
  return isSelected && visibleCategoryList.includes(mod.category);
};
```

Wrong ID → `mod` is `undefined` → returns `false` → generated file/section is silently omitted. **Always cross-check against the canonical table in Section 3.**

---

### R5 — Stub Python Scripts Must Be Meaningful

Every generated Python stub must have all of the following:

1. **Module docstring** — purpose, usage example with actual CLI args, numbered implementation steps
2. **CLI argument handling** — `sys.argv` parsing or `argparse`, with usage message if called wrong
3. **Guard checks** — verify prerequisites before running (e.g., check if `.lancedb/` exists)
4. **Import error handling** — catch `ImportError`, print remediation command, `sys.exit(1)`
5. **`if __name__ == '__main__':` block** — proper entry point

**❌ Unacceptable stub:**
```python
def query():
    # TODO: implement
    pass
```

**✅ Acceptable stub** (see `QUERY_PY` constant in generators.ts):
```python
"""Semantic search for LanceDB knowledge base.

Usage:
    python scripts/query.py "<your search query>" [top_k]

Implementation steps for the AI:
    1. Load the LanceDB table from .lancedb/
    2. Embed the query using HuggingFaceEmbeddings
    3. Run vector similarity search, return top_k results
"""
import sys
from pathlib import Path

def query(query_str: str, top_k: int = 5):
    db_path = Path(".lancedb")
    if not db_path.exists():
        print("⚠️  LanceDB not initialized. Run scripts/ingest.py first.")
        return
    try:
        import lancedb
    except ImportError as e:
        print(f"❌ Missing dependency: {e}. Run: uv pip install lancedb")
        sys.exit(1)
    print(f"🔍 Querying: '{query_str}' (top {top_k})")
    print("⚠️  Not yet implemented. Ask the AI to complete this script.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python scripts/query.py "<query>" [top_k]')
        sys.exit(1)
    query(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 5)
```

---

### R6 — Dependency Chains: Update All 3 Locations

When a module introduces Python packages, update **all three** generator functions in `generators.ts`:

| Generator function | What to update |
|---|---|
| `generatePyprojectToml()` | Add `if (isActive('id')) deps.push('"package>=version"')` |
| `generateSetupMd()` | Add `uv pip install package-name` to the docker exec command |
| `generatePrePushHook()` | Ensure guard checks still make sense; update if needed |

---

### R7 — Preview Tree Must Manually Mirror assembleZipContent()

The preview tree (App.tsx L806–L846) is JSX that renders file paths as plain text. It is **NOT generated from `assembleZipContent()`** — it is a manually maintained copy.

**After every change to `assembleZipContent()` that creates or removes a file:**
1. Open the preview tree JSX section (search for `previewDesc` or L806 in App.tsx)
2. Add/remove/modify the corresponding `{isModuleActive('id') && \`│   ├── 📄 ...\n\`}` line
3. Verify the condition expression is identical to the one in `assembleZipContent()`

---

### R8 — Scope / Category Assignment

```typescript
// From src/App.tsx L453-L458:
const getVisibleCategories = () => {
  if (actionType === 'uninstall') return Object.keys(categories);
  if (deploymentScope === 'local') return ['Local Core & Workspace', 'Local Data & Models'];
  if (deploymentScope === 'server') return ['Local Core & Workspace', 'Local Data & Models', 'Public Infrastructure (VPS)'];
  return Object.keys(categories);  // 'full' = all
};
```

A module in `'Cloud & Remote Integrations'` is **invisible and always inactive** in `local` and `server` scopes. Assigning a module to the wrong category causes it to be silently excluded.

**Decision guide for new modules:**
- Available in single-machine development → `'Local Data & Models'`
- Requires a public domain/VPS → `'Public Infrastructure (VPS)'`
- Requires cloud account / remote repo / external service → `'Cloud & Remote Integrations'`
- Core infrastructure always needed → `'Local Core & Workspace'`

---

### R9 — Docker Isolation for Generated Workflow Commands

The generated `start.md` and `end.md` instruct the target AI to run commands. All Python execution MUST go through `docker exec`:

**✅ Correct (as in start.md template, L660):**
```bash
docker exec -i ${containerName} bash -c "source .venv/bin/activate && python scripts/query.py 'query string'"
```

**❌ Wrong — runs on host, violates Docker isolation:**
```bash
python scripts/query.py 'query string'
uv run scripts/query.py 'query string'
```

**Sole exception**: `edu_submission` module runs `submit_homework.py` on the host because Google OAuth requires a browser. This is already documented in the generated AGENTS.md as `⚠️ NOT inside Docker`.

---

### R10 — TRANSLATIONS Bilingual Parity

```typescript
const TRANSLATIONS = {
  en: { key1: "value", key2: "value", ... },
  zh: { key1: "值", key2: "值", ... }
};
```

**Rule**: Both `en` and `zh` objects must always have **identical keys**. Adding a key to `en` without adding it to `zh` causes `t.yourKey` to be `undefined` in ZH mode, which renders as blank UI text (no error thrown).

When adding a new UI string: add the English version to `en`, then immediately add the Traditional Chinese (Taiwan) version to `zh` at the same relative position.

---

### R11 — No `|| true` in Generated Scripts

`|| true` silently suppresses errors and makes debugging impossible. It was removed from the codebase. Do not reintroduce it.

**❌ Wrong:**
```bash
docker compose up -d || true
python scripts/ingest.py || true
```

**✅ Correct — let it fail loudly or handle explicitly:**
```bash
docker compose up -d
python scripts/ingest.py || { echo "❌ Indexing failed"; exit 1; }
```

---

### R12 — Template Literal String Building Patterns

All generated file content is built by appending to a `let` variable inside each generator function in `generators.ts`. Follow these patterns exactly:

**Simple file (no conditions):**
```typescript
let content = `line 1\n`;
content += `line 2\n`;
folder.file("filename.md", content);
```

**Conditional sections:**
```typescript
let content = `# Header\n\n`;
content += `Always included section.\n\n`;
if (isModuleActive('some_module')) {
  content += `## Optional Section\nOnly when module is active.\n\n`;
}
content += `## Footer\nAlways here.\n`;
folder.file("output.md", content);
```

**⚠️ Pitfall — do NOT split a template literal mid-string with an assignment:**
```typescript
// ❌ WRONG — this breaks the string
let content = `[project]\nname = "${name}"\n
dev = ["pytest"]  // ← this is JS code, not part of the string!
`;
```
```typescript
// ✅ CORRECT — concatenate cleanly
let content = `[project]\nname = "${name}"\n`;
content += `\n[project.optional-dependencies]\ndev = ["pytest"]\n`;
```

---

## 6. Generated File Templates Reference

### Container Naming Convention
```
safeProjectName = config.projectName.replace(/\s+/g, '_')
// e.g., "My AI Project" → "My_AI_Project"

containerName = safeProjectName.toLowerCase().replace(/_/g, '-') + '-workspace'
// e.g., "My_AI_Project" → "my-ai-project-workspace"
```

### Generated File Locations
```
{folderName}/
├── AGENTS.md                          — always (install)
├── SETUP.md                           — always (install)
├── UNINSTALL_TEARDOWN.md              — always (uninstall)
├── Dockerfile                         — always (install)
├── docker-compose.yml                 — always (install)
├── pyproject.toml                     — if ci_python_tools
├── .agents/
│   ├── workflows/
│   │   ├── start.md                   — always (install)
│   │   └── end.md                     — always (install)
│   ├── context/.gitkeep               — if context_bundler
│   └── cache/.gitkeep                 — if response_cache
├── docs/
│   ├── USER_GUIDE_ZH.md               — always (install)
│   └── USER_GUIDE_EN.md               — always (install)
├── .git/hooks/pre-push                — if ci_git_hook
├── scripts/
│   ├── submit_homework.py             — if edu_submission
│   ├── ingest.py                      — if mem_lancedb
│   ├── query.py                       — if mem_lancedb
│   ├── bundle_context.py              — if context_bundler
│   ├── cache.py                       — if response_cache
│   ├── llama_drive_indexer.py         — if mem_cloud
│   └── system/
│       ├── watchdog.sh                — if infra_watchdog
│       ├── test_matrix.sh             — if ci_testing_matrix
│       ├── deploy.sh                  — if infra_iac
│       └── conversation_digest.py     — if mem_digest
├── tests/
│   ├── test_basic.py                  — if ci_python_tools
│   ├── infra/test_infra.py            — if ci_testing_matrix
│   └── shell/test_scripts.bats        — if ci_testing_matrix
├── config/caddy/Caddyfile             — if infra_gateway
├── ansible/
│   ├── inventory.ini                  — if infra_iac
│   └── playbooks/update_scripts.yml   — if infra_iac
└── homework_submission/README.md      — if edu_submission
```

---

## 7. Verification Workflow

After making any changes:

```bash
# 1. Type-check (catches all TS errors)
npm run build

# 2. Run unit tests (88 tests covering all generators)
npm test

# 3. Lint
npm run lint

# 4. Manual test — start dev server
npm run dev

# 5. In the browser:
#    - Select different scope combinations (local / server / full)
#    - Toggle every affected module on/off
#    - Click "Export Blueprint OS"
#    - Open the ZIP and verify:
#      a. All expected files are present
#      b. No expected files are missing
#      c. Preview tree matches actual ZIP contents
#      d. Template literals have no broken escape sequences (\n, \`, etc.)
#      e. Bilingual UI renders without undefined/blank text
```

---

## 8. Self-Review Checklist (complete before finishing any task)

**Module Definition**
- [ ] New module has all required fields: `id`, `category`, `categoryZh`, `icon`, `name`, `nameZh`, `desc`, `descZh`, `required`
- [ ] `category` is one of the 4 exact valid strings (case-sensitive)
- [ ] `id` is unique and follows `snake_case` convention
- [ ] Canonical module ID table in AGENTS.md Section 3 is updated

**generators.ts Output**
- [ ] All `isActive()` calls use IDs from the canonical table
- [ ] No dead conditions (IDs that don't match any module in MODULES)
- [ ] New Python scripts have: docstring, CLI args, guard checks, import error handling, `__main__` block
- [ ] New bash scripts use `set -euo pipefail` + `|| { ... }` pattern (no `if [ $? ]`)
- [ ] New Docker tools in Dockerfile are verified to exist in Ubuntu 24.04 apt; otherwise use curl install
- [ ] Python deps added to: `generatePyprojectToml()`, `generateSetupMd()` docker exec command
- [ ] New services added to `generateDockerCompose()` if needed
- [ ] Teardown section updated in `generateTeardownMd()` to remove any new files

**Preview Tree**
- [ ] Preview tree JSX (App.tsx L806–L846) updated to show new files
- [ ] Preview tree conditions match `assembleZipContent()` conditions exactly

**Tests**
- [ ] New generator function has corresponding tests in `generators.test.ts`
- [ ] `npm test` passes with all tests green

**TRANSLATIONS**
- [ ] Any new UI keys exist in BOTH `en` and `zh` objects

**Build**
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `npm test` passes with all tests green
- [ ] `npm run lint` passes with no errors

**Template Literals**
- [ ] No template literal is split across multiple statements incorrectly
- [ ] No `|| true` in any generated script
- [ ] No generated Python script runs directly on host (must use `docker exec`) unless it's `edu_submission`

---

## 9. Common Pitfalls (from past bugs)

| Pitfall | Root cause | Fix |
|---|---|---|
| Module generates nothing silently | Wrong `id` in `isModuleActive()` | Check canonical ID table |
| `pyproject.toml` has broken `dev = [...]` | Template literal split mid-string | Use separate `+=` statements |
| Bash script exits with no error message | `if [ $? ]` check after `set -e` | Use `\|\| { echo; exit 1; }` |
| gitleaks not found in Docker | Added to apt block (not in Ubuntu 24.04) | Use curl GitHub releases install |
| `isModuleActive('mem_llamaindex')` always false | ID doesn't exist (correct: `mem_cloud`) | Check canonical ID table |
| Module invisible in `local` scope | Wrong category assigned | Move to `'Local Data & Models'` |
| Preview shows file but ZIP doesn't contain it | Preview tree not synced | Update preview JSX after assembleZipContent() |
| Bilingual UI shows blank text in ZH mode | Key missing from `zh` object | Add matching key to both `en` and `zh` |
| Python workflow runs on host, not container | Missing `docker exec -i` wrapper | Wrap with `docker exec -i ${containerName} bash -c "..."` |
| `|| true` hides failures | Defensive coding anti-pattern | Remove; use explicit `\|\| { exit 1; }` |

---

## 10. Decision Log

| Date | Scope | Decision | Confidence | Provenance | Status |
|---|---|---|---|---|---|
| 2026-03-08 | infra | gitleaks installed via curl not apt (not in Ubuntu 24.04) | high | Code audit | Active |
| 2026-03-08 | arch | All Python workflow execution via `docker exec`, except edu_submission OAuth | high | Code audit | Active |
| 2026-03-08 | arch | Preview tree is manual JSX — must be kept in sync with generateZip() | high | Code audit | Active |
| 2026-03-08 | arch | uv installed via curl not apt in generated Dockerfile | high | Code audit | Active |
| 2026-03-08 | code | Template literal string building uses `+=` concatenation, never mid-literal splits | high | Bug fix | Active |
| 2026-03-08 | feat | Added context_bundler + response_cache modules for cloud LLM call reduction | high | Feature req | Active |
| 2026-03-08 | fix | ingest.py + query.py fully implemented (no longer stubs) | high | Code audit | Active |
| 2026-03-08 | fix | response_cache SETUP.md dep install step added for standalone selection | high | Code audit | Active |
| 2026-03-08 | fix | Teardown now covers ci_python_tools and edu_submission cleanup | high | Code audit | Active |
| 2026-03-08 | arch | Phase 1 refactor: extracted generateZip() (505 lines) into generators.ts with pure functions | high | Refactoring | Active |
| 2026-03-08 | arch | Phase 2: vitest test suite (88 tests) covering all generator functions and helpers | high | Testing | Active |
| 2026-03-08 | arch | App.tsx generateZip() reduced to 13-line orchestrator calling assembleZipContent() | high | Refactoring | Active |
| 2026-03-08 | config | tsconfig.app.json excludes test files from production build (`tsc -b`) | high | Config | Active |

---

## 11. Success Log

- `2026-03-08` : Full code audit completed. 15+ bugs fixed (gitleaks apt, set -e patterns, scope logic, dead conditions, stub quality, template literal splits). AGENTS.md authored as ground truth for all future work.
- `2026-03-08` : Added context_bundler + response_cache modules. Fully implemented ingest.py, query.py, bundle_context.py, cache.py. Second audit: fixed 7 remaining issues (query.py stub, SETUP.md dep gap, teardown coverage, preview tree connectors, AGENTS.md line numbers + file list, footer date).
- `2026-03-08` : Phase 1+2 refactoring completed. Extracted 505-line generateZip() body into `src/generators.ts` (1225 lines, 16 generator functions + 13 static templates + orchestrator). App.tsx reduced from 1380→889 lines. Added vitest test suite with 88 tests, all passing. Build + test verified green.
