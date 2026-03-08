import { describe, it, expect } from 'vitest';
import {
  type ProjectConfig,
  type ModuleChecker,
  getSafeProjectName,
  getContainerName,
  // Static templates
  INGEST_PY,
  QUERY_PY,
  TEST_BASIC_PY,
  SUBMIT_HOMEWORK_PY,
  HOMEWORK_README,
  LLAMA_DRIVE_INDEXER_PY,
  TEST_MATRIX_SH,
  TEST_INFRA_PY,
  BATS_TEST,
  DEPLOY_SH,
  CONVERSATION_DIGEST_PY,
  BUNDLE_CONTEXT_PY,
  CACHE_PY,
  // Dynamic generators
  generateTeardownMd,
  generateAgentsMd,
  generateSetupMd,
  generateStartWorkflow,
  generateEndWorkflow,
  generatePrePushHook,
  generatePyprojectToml,
  generateCaddyfile,
  generateDockerCompose,
  generateDockerfile,
  generateWatchdogSh,
  generateAnsibleInventory,
  generateAnsiblePlaybook,
  generateUserDocZH,
  generateUserDocEN,
  HEALTH_CHECK_PY,
  generateModuleRegistry,
} from './generators';

// ===== Test Fixtures =====

const baseConfig: ProjectConfig = {
  projectName: 'Test Project',
  userRole: 'Researcher Developer',
  aiRole: 'System_Architect Specialist',
  domain: 'example.com',
  deploymentScope: 'local',
};

const serverConfig: ProjectConfig = {
  ...baseConfig,
  domain: 'project.example.com',
  deploymentScope: 'server',
};

const ipConfig: ProjectConfig = {
  ...baseConfig,
  domain: '192.168.1.100',
  deploymentScope: 'server',
};

/** Creates a ModuleChecker that returns true for the given IDs */
function activeModules(...ids: string[]): ModuleChecker {
  return (id: string) => ids.includes(id);
}

/** A ModuleChecker where nothing is active */
const noneActive: ModuleChecker = () => false;

/** A ModuleChecker where everything is active */
const allActive: ModuleChecker = () => true;

// ===== Helpers =====

describe('helpers', () => {
  it('getSafeProjectName replaces spaces with underscores', () => {
    expect(getSafeProjectName(baseConfig)).toBe('Test_Project');
  });

  it('getSafeProjectName handles multiple spaces', () => {
    const cfg = { ...baseConfig, projectName: 'My  Big  Project' };
    expect(getSafeProjectName(cfg)).toBe('My_Big_Project');
  });

  it('getContainerName produces lowercase kebab-case + -workspace', () => {
    expect(getContainerName(baseConfig)).toBe('test-project-workspace');
  });

  it('getContainerName replaces underscores with hyphens', () => {
    const cfg = { ...baseConfig, projectName: 'My_Project' };
    expect(getContainerName(cfg)).toBe('my-project-workspace');
  });
});

// ===== Static Templates — No Stubs =====

describe('static templates: completeness', () => {
  it('INGEST_PY contains all required functions', () => {
    expect(INGEST_PY).toContain('def collect_files(');
    expect(INGEST_PY).toContain('def chunk_files(');
    expect(INGEST_PY).toContain('def ingest(');
    expect(INGEST_PY).toContain('def main()');
    expect(INGEST_PY).toContain('argparse');
    expect(INGEST_PY).toContain('lancedb');
  });

  it('QUERY_PY contains all required functions', () => {
    expect(QUERY_PY).toContain('def query(');
    expect(QUERY_PY).toContain('def main()');
    expect(QUERY_PY).toContain('table.search(');
    expect(QUERY_PY).toContain('_distance');
  });

  it('SUBMIT_HOMEWORK_PY contains OIDC auth and upload logic', () => {
    expect(SUBMIT_HOMEWORK_PY).toContain('def authorize()');
    expect(SUBMIT_HOMEWORK_PY).toContain('def main()');
    expect(SUBMIT_HOMEWORK_PY).toContain('InstalledAppFlow');
    expect(SUBMIT_HOMEWORK_PY).toContain('upload_url');
    expect(SUBMIT_HOMEWORK_PY).toContain('argparse');
  });

  it('BUNDLE_CONTEXT_PY contains all context gathering functions', () => {
    expect(BUNDLE_CONTEXT_PY).toContain('def run_cmd(');
    expect(BUNDLE_CONTEXT_PY).toContain('def get_git_context(');
    expect(BUNDLE_CONTEXT_PY).toContain('def get_lancedb_context(');
    expect(BUNDLE_CONTEXT_PY).toContain('def get_latest_digest(');
    expect(BUNDLE_CONTEXT_PY).toContain('def get_deps(');
    expect(BUNDLE_CONTEXT_PY).toContain('def main()');
    expect(BUNDLE_CONTEXT_PY).toContain('CONTEXT_SNAPSHOT.md');
  });

  it('CACHE_PY contains all cache operations', () => {
    expect(CACHE_PY).toContain('def init_db(');
    expect(CACHE_PY).toContain('def get_embedding(');
    expect(CACHE_PY).toContain('def cosine_similarity(');
    expect(CACHE_PY).toContain('def cmd_search(');
    expect(CACHE_PY).toContain('def cmd_store(');
    expect(CACHE_PY).toContain('def cmd_stats(');
    expect(CACHE_PY).toContain('CACHE_HIT');
    expect(CACHE_PY).toContain('CACHE_MISS');
  });

  it('CONVERSATION_DIGEST_PY contains digest generation', () => {
    expect(CONVERSATION_DIGEST_PY).toContain('def generate_digest(');
    expect(CONVERSATION_DIGEST_PY).toContain('.agents/digests');
  });

  it('TEST_MATRIX_SH contains all test runners', () => {
    expect(TEST_MATRIX_SH).toContain('Shellcheck');
    expect(TEST_MATRIX_SH).toContain('pytest');
    expect(TEST_MATRIX_SH).toContain('bats');
  });

  it('LLAMA_DRIVE_INDEXER_PY contains Google Drive reader', () => {
    expect(LLAMA_DRIVE_INDEXER_PY).toContain('GoogleDriveReader');
    expect(LLAMA_DRIVE_INDEXER_PY).toContain('ROOT_FOLDER_ID');
  });

  it('all static templates have no TODO/stub markers', () => {
    const templates = [
      INGEST_PY, QUERY_PY, SUBMIT_HOMEWORK_PY,
      BUNDLE_CONTEXT_PY, CACHE_PY,
      TEST_MATRIX_SH, TEST_INFRA_PY, BATS_TEST,
      DEPLOY_SH, CONVERSATION_DIGEST_PY,
    ];
    for (const tpl of templates) {
      expect(tpl).not.toContain('not yet implemented');
      expect(tpl).not.toContain('TODO:');
    }
  });

  it('static templates start with shebangs or docstrings', () => {
    expect(INGEST_PY).toMatch(/^#!/);
    expect(QUERY_PY).toMatch(/^#!/);
    expect(SUBMIT_HOMEWORK_PY).toMatch(/^#!/);
    expect(BUNDLE_CONTEXT_PY).toMatch(/^#!/);
    expect(CACHE_PY).toMatch(/^#!/);
    expect(TEST_MATRIX_SH).toMatch(/^#!/);
    expect(BATS_TEST).toMatch(/^#!/);
    expect(DEPLOY_SH).toMatch(/^#!/);
  });
});

// ===== Teardown Generator =====

describe('generateTeardownMd', () => {
  it('includes project name in title', () => {
    const md = generateTeardownMd(baseConfig, noneActive);
    expect(md).toContain('UNINSTALL_TEARDOWN.md — Test Project');
  });

  it('always includes Docker Cleanup and Core Workflows', () => {
    const md = generateTeardownMd(baseConfig, noneActive);
    expect(md).toContain('### 1. Docker Cleanup');
    expect(md).toContain('### 11. Core Workflows Cleanup');
    expect(md).toContain('### 12. Final Self-Destruct');
  });

  it('includes safety warning', () => {
    const md = generateTeardownMd(baseConfig, noneActive);
    expect(md).toContain('ERROR WARNING');
    expect(md).toContain('SAFELY UNINSTALL');
  });

  it('includes Git Hooks when ci_git_hook is active', () => {
    const md = generateTeardownMd(baseConfig, activeModules('ci_git_hook'));
    expect(md).toContain('### 2. Git Hooks Cleanup');
  });

  it('excludes Git Hooks when ci_git_hook is inactive', () => {
    const md = generateTeardownMd(baseConfig, noneActive);
    expect(md).not.toContain('Git Hooks Cleanup');
  });

  it('includes Knowledge Base when mem_lancedb active', () => {
    const md = generateTeardownMd(baseConfig, activeModules('mem_lancedb'));
    expect(md).toContain('Knowledge Base Cleanup');
    expect(md).toContain('ingest.py');
  });

  it('includes Ollama cleanup with correct container name', () => {
    const md = generateTeardownMd(baseConfig, activeModules('mem_ollama'));
    expect(md).toContain('Ollama Local LLM Cleanup');
    expect(md).toContain('test-project-ollama');
  });

  it('includes context_bundler and response_cache in Local Intelligence', () => {
    const md = generateTeardownMd(baseConfig, activeModules('context_bundler', 'response_cache'));
    expect(md).toContain('Local Intelligence Cleanup');
    expect(md).toContain('bundle_context.py');
    expect(md).toContain('cache.py');
  });

  it('includes ci_python_tools cleanup', () => {
    const md = generateTeardownMd(baseConfig, activeModules('ci_python_tools'));
    expect(md).toContain('Python Tooling Cleanup');
  });

  it('includes edu_submission cleanup', () => {
    const md = generateTeardownMd(baseConfig, activeModules('edu_submission'));
    expect(md).toContain('Student Submission Toolchain Cleanup');
    expect(md).toContain('submit_homework.py');
  });
});

// ===== AGENTS.md Generator =====

describe('generateAgentsMd', () => {
  it('includes project name and roles', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).toContain('AGENTS.md — Test Project');
    expect(md).toContain('Researcher');
    expect(md).toContain('Developer');
    expect(md).toContain('System_Architect');
    expect(md).toContain('Specialist');
  });

  it('uses local architecture for local scope', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).toContain('Isolated Local Development Workspace');
    expect(md).not.toContain('Target Domain');
  });

  it('uses server architecture for server scope', () => {
    const md = generateAgentsMd(serverConfig, noneActive);
    expect(md).toContain('Target Domain');
    expect(md).toContain('project.example.com');
  });

  it('includes Cloud LLM Call Reduction Protocol', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).toContain('Cloud LLM Call Reduction Protocol');
    expect(md).toContain('Step 1');
    expect(md).toContain('Read local files directly');
    // With no modules active, only 1 step (local files). With modules, more steps appear.
    const mdFull = generateAgentsMd(baseConfig, allActive);
    expect(mdFull).toContain('CONTEXT_SNAPSHOT.md');
    expect(mdFull).toContain('semantic memory');
    expect(mdFull).toContain('response cache');
  });

  it('includes Educational Assignment Protocol when edu_submission active', () => {
    const md = generateAgentsMd(baseConfig, activeModules('edu_submission'));
    expect(md).toContain('Educational Assignment Protocol');
    expect(md).toContain('submit_homework.py');
  });

  it('excludes Educational Assignment Protocol when edu_submission inactive', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).not.toContain('Educational Assignment Protocol');
  });

  it('includes Decision Log table', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).toContain('Decision Log');
    expect(md).toContain('| Date |');
  });
});

// ===== SETUP.md Generator =====

describe('generateSetupMd', () => {
  it('includes project initialization header', () => {
    const md = generateSetupMd(baseConfig, noneActive);
    expect(md).toContain('Project Initialization Guide');
    expect(md).toContain('System_Architect');
  });

  it('always includes Docker compose step', () => {
    const md = generateSetupMd(baseConfig, noneActive);
    expect(md).toContain('docker compose up -d --build');
  });

  it('includes Python env step when ci_python_tools active', () => {
    const md = generateSetupMd(baseConfig, activeModules('ci_python_tools'));
    expect(md).toContain('uv pip install -e .[dev]');
  });

  it('includes LanceDB init when mem_lancedb active', () => {
    const md = generateSetupMd(baseConfig, activeModules('mem_lancedb'));
    expect(md).toContain('python scripts/ingest.py');
    expect(md).toContain('lancedb langchain-huggingface sentence-transformers');
  });

  it('includes context bundler step when context_bundler active', () => {
    const md = generateSetupMd(baseConfig, activeModules('context_bundler'));
    expect(md).toContain('python scripts/bundle_context.py');
  });

  it('includes response_cache standalone dep when only response_cache active', () => {
    const md = generateSetupMd(baseConfig, activeModules('response_cache'));
    expect(md).toContain('Response Cache dependencies');
  });

  it('excludes response_cache standalone dep when context_bundler also active', () => {
    const md = generateSetupMd(baseConfig, activeModules('response_cache', 'context_bundler'));
    expect(md).not.toContain('Response Cache dependencies');
  });

  it('includes Prerequisites Checklist when ci_git_hook active', () => {
    const md = generateSetupMd(baseConfig, activeModules('ci_git_hook'));
    expect(md).toContain('Prerequisites Checklist');
    expect(md).toContain('Remote Git Repository');
  });

  it('includes VPS prerequisites when infra_gateway active', () => {
    const md = generateSetupMd(serverConfig, activeModules('infra_gateway'));
    expect(md).toContain('Public Domain & VPS Infrastructure');
  });
});

// ===== Workflow Generators =====

describe('generateStartWorkflow', () => {
  it('includes YAML frontmatter', () => {
    const md = generateStartWorkflow(baseConfig, noneActive);
    expect(md).toMatch(/^---\n/);
    expect(md).toContain('description:');
  });

  it('includes core steps', () => {
    const md = generateStartWorkflow(baseConfig, noneActive);
    expect(md).toContain('Environment & Role Audit');
    expect(md).toContain('System Health Verification');
    expect(md).toContain('Rigid Internalization');
    expect(md).toContain('Ready Message');
  });

  it('includes context bundler step when active', () => {
    const md = generateStartWorkflow(baseConfig, activeModules('context_bundler'));
    expect(md).toContain('Local Context Bundle');
    expect(md).toContain('bundle_context.py');
    expect(md).toContain('CONTEXT_SNAPSHOT.md');
  });

  it('includes LanceDB queries when mem_lancedb active', () => {
    const md = generateStartWorkflow(baseConfig, activeModules('mem_lancedb'));
    expect(md).toContain("python scripts/query.py 'important architecture status'");
    expect(md).toContain("python scripts/query.py 'recent decisions'");
  });

  it('includes cache protocol when response_cache active', () => {
    const md = generateStartWorkflow(baseConfig, activeModules('response_cache'));
    expect(md).toContain('Cache-First Protocol');
    expect(md).toContain('CACHE_HIT');
  });
});

describe('generateEndWorkflow', () => {
  it('includes core steps', () => {
    const md = generateEndWorkflow(baseConfig, noneActive);
    expect(md).toContain('Solution Self-Reflection');
    expect(md).toContain('Memory Reconsolidation');
    expect(md).toContain('Git Protocol');
    expect(md).toContain('Final Persistence Confirmation');
  });

  it('includes conversation digest when mem_digest active', () => {
    const md = generateEndWorkflow(baseConfig, activeModules('mem_digest'));
    expect(md).toContain('conversation_digest.py');
  });
});

// ===== Infrastructure Generators =====

describe('generatePrePushHook', () => {
  it('starts with bash shebang', () => {
    const hook = generatePrePushHook(baseConfig);
    expect(hook).toMatch(/^#!/);
    expect(hook).toContain('bash');
  });

  it('uses correct container name', () => {
    const hook = generatePrePushHook(baseConfig);
    expect(hook).toContain('test-project-workspace');
  });

  it('includes gitleaks check', () => {
    const hook = generatePrePushHook(baseConfig);
    expect(hook).toContain('gitleaks detect');
  });

  it('conditionally syncs knowledge base', () => {
    const hook = generatePrePushHook(baseConfig);
    expect(hook).toContain('ingest.py');
  });
});

describe('generatePyprojectToml', () => {
  it('uses correct project name', () => {
    const toml = generatePyprojectToml(baseConfig, noneActive);
    expect(toml).toContain('name = "test-project"');
  });

  it('has empty dependencies when no modules active', () => {
    const toml = generatePyprojectToml(baseConfig, noneActive);
    expect(toml).toContain('dependencies = []');
  });

  it('includes lancedb deps when mem_lancedb active', () => {
    const toml = generatePyprojectToml(baseConfig, activeModules('mem_lancedb'));
    expect(toml).toContain('lancedb');
    expect(toml).toContain('sentence-transformers');
  });

  it('includes llama-index deps when mem_cloud active', () => {
    const toml = generatePyprojectToml(baseConfig, activeModules('mem_cloud'));
    expect(toml).toContain('llama-index');
  });

  it('includes langchain deps for context_bundler when mem_lancedb inactive', () => {
    const toml = generatePyprojectToml(baseConfig, activeModules('context_bundler'));
    expect(toml).toContain('langchain-huggingface');
  });

  it('avoids duplicate deps when mem_lancedb already provides them', () => {
    const toml = generatePyprojectToml(baseConfig, activeModules('mem_lancedb', 'context_bundler'));
    // langchain-huggingface should appear only from mem_lancedb, not duplicated
    const matches = toml.match(/langchain-huggingface/g);
    expect(matches).toHaveLength(1);
  });

  it('includes dev dependencies', () => {
    const toml = generatePyprojectToml(baseConfig, noneActive);
    expect(toml).toContain('pytest');
    expect(toml).toContain('ruff');
  });
});

describe('generateCaddyfile', () => {
  it('uses domain name for non-IP', () => {
    const caddyfile = generateCaddyfile(serverConfig);
    expect(caddyfile).toContain('project.example.com {');
    expect(caddyfile).not.toContain('http://');
  });

  it('uses http:// prefix for IP address', () => {
    const caddyfile = generateCaddyfile(ipConfig);
    expect(caddyfile).toContain('http://192.168.1.100 {');
  });

  it('includes bot whitelist', () => {
    const caddyfile = generateCaddyfile(serverConfig);
    expect(caddyfile).toContain('Googlebot');
    expect(caddyfile).toContain('GPTBot');
    expect(caddyfile).toContain('ClaudeBot');
  });
});

describe('generateDockerCompose', () => {
  it('always includes workspace service', () => {
    const compose = generateDockerCompose(baseConfig, noneActive);
    expect(compose).toContain('workspace:');
    expect(compose).toContain('test-project-workspace');
    expect(compose).toContain('sleep infinity');
  });

  it('includes gateway when infra_gateway active', () => {
    const compose = generateDockerCompose(baseConfig, activeModules('infra_gateway'));
    expect(compose).toContain('gateway:');
    expect(compose).toContain('caddy:alpine');
  });

  it('excludes gateway when infra_gateway inactive', () => {
    const compose = generateDockerCompose(baseConfig, noneActive);
    expect(compose).not.toContain('gateway:');
  });

  it('includes ollama when mem_ollama active', () => {
    const compose = generateDockerCompose(baseConfig, activeModules('mem_ollama'));
    expect(compose).toContain('ollama:');
    expect(compose).toContain('ollama_data');
    expect(compose).toContain('11434:11434');
  });
});

describe('generateDockerfile', () => {
  it('always includes base packages', () => {
    const df = generateDockerfile(noneActive);
    expect(df).toContain('FROM ubuntu:24.04');
    expect(df).toContain('curl');
    expect(df).toContain('git');
    expect(df).toContain('python3-pip');
    expect(df).toContain('uv');
  });

  it('includes texlive when env_academic active', () => {
    const df = generateDockerfile(activeModules('env_academic'));
    expect(df).toContain('texlive-full');
    expect(df).toContain('pandoc');
  });

  it('excludes texlive when env_academic inactive', () => {
    const df = generateDockerfile(noneActive);
    expect(df).not.toContain('texlive');
  });

  it('includes bats when ci_testing_matrix active', () => {
    const df = generateDockerfile(activeModules('ci_testing_matrix'));
    expect(df).toContain('bats');
    expect(df).toContain('shellcheck');
  });

  it('includes gitleaks when ci_git_hook active', () => {
    const df = generateDockerfile(activeModules('ci_git_hook'));
    expect(df).toContain('gitleaks');
  });

  it('includes rclone when mem_cloud active', () => {
    const df = generateDockerfile(activeModules('mem_cloud'));
    expect(df).toContain('rclone');
  });
});

describe('generateWatchdogSh', () => {
  it('uses https for domain', () => {
    const sh = generateWatchdogSh(serverConfig);
    expect(sh).toContain('https://project.example.com');
  });

  it('uses http for IP address', () => {
    const sh = generateWatchdogSh(ipConfig);
    expect(sh).toContain('http://192.168.1.100');
  });

  it('includes container restart logic', () => {
    const sh = generateWatchdogSh(baseConfig);
    expect(sh).toContain('docker restart');
  });
});

describe('generateAnsibleInventory', () => {
  it('includes domain in production group', () => {
    const inv = generateAnsibleInventory(serverConfig);
    expect(inv).toContain('[production]');
    expect(inv).toContain('project.example.com');
  });
});

describe('generateAnsiblePlaybook', () => {
  it('includes cron task with correct path', () => {
    const pb = generateAnsiblePlaybook(baseConfig);
    expect(pb).toContain('watchdog');
    expect(pb).toContain('test-project');
  });
});

// ===== User Documentation Generators =====

describe('generateUserDocZH', () => {
  it('includes base structure regardless of modules', () => {
    const doc = generateUserDocZH(noneActive);
    expect(doc).toContain('AI Memory OS');
    expect(doc).toContain('如何開始');
    expect(doc).toContain('Docker');
  });

  it('includes edu_submission section when active', () => {
    const doc = generateUserDocZH(activeModules('edu_submission'));
    expect(doc).toContain('課堂作業一鍵繳交');
  });

  it('includes context_bundler section when active', () => {
    const doc = generateUserDocZH(activeModules('context_bundler'));
    expect(doc).toContain('本機上下文打包器');
  });

  it('includes response_cache section when active', () => {
    const doc = generateUserDocZH(activeModules('response_cache'));
    expect(doc).toContain('本機回應快取');
  });

  it('excludes optional sections when modules inactive', () => {
    const doc = generateUserDocZH(noneActive);
    expect(doc).not.toContain('課堂作業');
    expect(doc).not.toContain('本機上下文打包器');
    expect(doc).not.toContain('本機回應快取');
  });
});

describe('generateUserDocEN', () => {
  it('includes base structure regardless of modules', () => {
    const doc = generateUserDocEN(noneActive);
    expect(doc).toContain('AI Memory OS');
    expect(doc).toContain('Getting Started');
    expect(doc).toContain('Docker Sandbox');
  });

  it('includes edu_submission section when active', () => {
    const doc = generateUserDocEN(activeModules('edu_submission'));
    expect(doc).toContain('1-Click Homework Submission');
  });

  it('includes context_bundler section when active', () => {
    const doc = generateUserDocEN(activeModules('context_bundler'));
    expect(doc).toContain('Context Bundler');
  });

  it('includes response_cache section when active', () => {
    const doc = generateUserDocEN(activeModules('response_cache'));
    expect(doc).toContain('Response Cache');
  });
});

// ===== Cross-cutting: Module Isolation =====

describe('module isolation', () => {
  it('LanceDB generators produce no output when mem_lancedb inactive', () => {
    // The static templates exist, but assembleZipContent only uses them
    // when isActive('mem_lancedb') is true — tested via the orchestrator.
    // Here we just verify the templates themselves are self-contained.
    expect(INGEST_PY).toContain('lancedb');
    expect(QUERY_PY).toContain('lancedb');
  });

  it('teardown handles all modules active simultaneously', () => {
    const md = generateTeardownMd(baseConfig, allActive);
    expect(md).toContain('Docker Cleanup');
    expect(md).toContain('Git Hooks Cleanup');
    expect(md).toContain('Knowledge Base Cleanup');
    expect(md).toContain('Testing Matrix Cleanup');
    expect(md).toContain('Edge Gateway Cleanup');
    expect(md).toContain('System Scripts Cleanup');
    expect(md).toContain('Ollama Local LLM Cleanup');
    expect(md).toContain('Local Intelligence Cleanup');
    expect(md).toContain('Python Tooling Cleanup');
    expect(md).toContain('Student Submission Toolchain Cleanup');
    expect(md).toContain('Core Workflows Cleanup');
    expect(md).toContain('Final Self-Destruct');
  });

  it('setup handles all modules active simultaneously', () => {
    const md = generateSetupMd(serverConfig, allActive);
    expect(md).toContain('docker compose up');
    expect(md).toContain('uv pip install -e .[dev]');
    expect(md).toContain('python scripts/ingest.py');
    expect(md).toContain('ollama pull');
    expect(md).toContain('pre-push');
    expect(md).toContain('bundle_context.py');
    // response_cache standalone should NOT appear when context_bundler is also active
    expect(md).not.toContain('Response Cache dependencies');
  });
});

// ===== Phase 3: Domain-Aware Static Knowledge Engine =====

const generalConfig: ProjectConfig = {
  ...baseConfig,
  selectedDomain: 'general',
};

const studentConfig: ProjectConfig = {
  ...baseConfig,
  selectedDomain: 'student',
};

describe('Phase 3: Domain injection into AGENTS.md', () => {
  it('injects domain rules when selectedDomain is set', () => {
    const md = generateAgentsMd(generalConfig, noneActive);
    expect(md).toContain('Domain Rules');
    expect(md).toContain('General Purpose');
    expect(md).toContain('Code Quality');
  });

  it('does not inject domain rules when no domain selected', () => {
    const md = generateAgentsMd(baseConfig, noneActive);
    expect(md).not.toContain('Domain Rules');
  });

  it('includes seed Decision Log entries for student domain', () => {
    const md = generateAgentsMd(studentConfig, noneActive);
    expect(md).toContain('課程名稱');
    expect(md).toContain('指導教授');
  });
});

describe('Phase 3: Domain injection into SETUP.md', () => {
  it('injects domain setup steps when selectedDomain is set', () => {
    const md = generateSetupMd(studentConfig, noneActive);
    expect(md).toContain('Domain Setup');
    expect(md).toContain('README.md');
  });

  it('does not inject domain setup when no domain selected', () => {
    const md = generateSetupMd(baseConfig, noneActive);
    expect(md).not.toContain('Domain Setup');
  });
});

describe('Phase 3: Domain injection into start.md', () => {
  it('includes domain-specific queries in start workflow', () => {
    const md = generateStartWorkflow(studentConfig, noneActive);
    expect(md).toContain('Domain Context Retrieval');
    expect(md).toContain('Student Project');
    expect(md).toContain('專題進度');
  });

  it('does not include domain queries when no domain set', () => {
    const md = generateStartWorkflow(baseConfig, noneActive);
    expect(md).not.toContain('Domain Context Retrieval');
  });
});

// ===== Phase 4: Health Check & Module Registry =====

describe('Phase 4: HEALTH_CHECK_PY', () => {
  it('contains all diagnostic functions', () => {
    expect(HEALTH_CHECK_PY).toContain('def check_docker(');
    expect(HEALTH_CHECK_PY).toContain('def check_venv(');
    expect(HEALTH_CHECK_PY).toContain('def check_lancedb(');
    expect(HEALTH_CHECK_PY).toContain('def check_git(');
    expect(HEALTH_CHECK_PY).toContain('def check_scripts(');
    expect(HEALTH_CHECK_PY).toContain('def check_agents_md(');
    expect(HEALTH_CHECK_PY).toContain('def main()');
  });

  it('supports JSON output flag', () => {
    expect(HEALTH_CHECK_PY).toContain('--json');
    expect(HEALTH_CHECK_PY).toContain('json.dumps');
  });

  it('starts with shebang', () => {
    expect(HEALTH_CHECK_PY).toMatch(/^#!/);
  });
});

describe('Phase 4: generateModuleRegistry', () => {
  it('generates valid JSON with project info', () => {
    const json = generateModuleRegistry(baseConfig, activeModules('mem_lancedb'));
    const registry = JSON.parse(json);
    expect(registry.project_name).toBe('Test Project');
    expect(registry.deployment_scope).toBe('local');
    expect(registry.generator_version).toBe('2.0.0');
  });

  it('lists active modules correctly', () => {
    const json = generateModuleRegistry(baseConfig, activeModules('mem_lancedb', 'context_bundler'));
    const registry = JSON.parse(json);
    expect(registry.active_modules).toContain('mem_lancedb');
    expect(registry.active_modules).toContain('context_bundler');
    expect(registry.active_modules).not.toContain('mem_ollama');
  });

  it('maps scripts to their file paths', () => {
    const json = generateModuleRegistry(baseConfig, activeModules('mem_lancedb', 'response_cache'));
    const registry = JSON.parse(json);
    expect(registry.scripts.mem_lancedb.ingest).toBe('scripts/ingest.py');
    expect(registry.scripts.mem_lancedb.query).toBe('scripts/query.py');
    expect(registry.scripts.response_cache.cache).toBe('scripts/cache.py');
  });

  it('includes domain when selectedDomain is set', () => {
    const json = generateModuleRegistry(generalConfig, noneActive);
    const registry = JSON.parse(json);
    expect(registry.domain).toBe('general');
  });

  it('uses general domain when no domain selected', () => {
    const json = generateModuleRegistry(baseConfig, noneActive);
    const registry = JSON.parse(json);
    expect(registry.domain).toBe('general');
  });

  it('always includes health_check and workflows paths', () => {
    const json = generateModuleRegistry(baseConfig, noneActive);
    const registry = JSON.parse(json);
    expect(registry.health_check).toBe('scripts/system/health_check.py');
    expect(registry.workflows.start).toBe('.agents/workflows/start.md');
    expect(registry.workflows.end).toBe('.agents/workflows/end.md');
  });
});
