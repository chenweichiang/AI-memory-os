// src/domains/general.ts
import type { DomainProfile } from './index';

export const generalDomain: DomainProfile = {
    id: 'general',
    name: 'General Purpose',
    nameZh: '通用工作',

    agentsRules: `### Domain Rules — General Purpose

- **Code Quality**: Follow consistent naming conventions across the project. Functions use camelCase or snake_case — pick one and stick with it. All public functions require docstrings/JSDoc.
- **Commit Discipline**: Write meaningful commit messages in the format \`<type>(<scope>): <description>\`. Types: \`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`test\`, \`chore\`.
- **Documentation**: Every project must have a \`README.md\` with: project purpose, setup instructions, usage examples, and contributor guidelines. Keep it up to date.
- **Security**: Never commit secrets, API keys, or tokens. Use \`.env\` files excluded from Git. Run security scans before pushing.
- **Dependency Management**: Pin dependency versions. Document why each non-obvious dependency was added.
`,

    setupSteps: ``,

    startQueries: [
        'recent project changes and commit history',
        'unresolved issues and blockers',
    ],

    recommendedModules: ['mem_lancedb', 'ci_python_tools', 'ci_git_hook'],

    seedDecisions: `| YYYY-MM-DD | infra | Version control strategy: [e.g. trunk-based / GitFlow] | high | .git | - | Active | - | - |
| YYYY-MM-DD | lang | Primary language/framework: [e.g. Python / TypeScript / React] | high | package.json | - | Active | - | - |
`,

    contextDoc: `# Domain Context — General Purpose

This project follows standard software development best practices.

## Development Workflow
1. Create feature branch from \`main\`
2. Make changes with meaningful commits
3. Run tests before pushing
4. Code review before merge

## Code Review Checklist
- [ ] Code follows project naming conventions
- [ ] New functions have docstrings/comments
- [ ] No hardcoded secrets or credentials
- [ ] Tests cover the main logic paths
- [ ] README updated if usage changed
`,
};
