// src/domains/index.ts
// ==========================================================================
// Domain Profile system — static knowledge engine for field-specific
// AI agent configuration. Zero API calls, pure TypeScript data.
// ==========================================================================

// ===== Types =====

export interface DomainProfile {
    id: string;
    name: string;
    nameZh: string;

    // Injected into generated AGENTS.md — domain-specific coding rules
    agentsRules: string;

    // Injected into generated SETUP.md — domain-specific init steps
    setupSteps: string;

    // Injected into generated start.md — domain-specific semantic queries
    startQueries: string[];

    // Recommended module preset (auto-checked when domain selected)
    recommendedModules: string[];

    // Seed Decision Log entries for AGENTS.md
    seedDecisions: string;

    // Domain context document content (written to docs/DOMAIN_CONTEXT.md)
    contextDoc: string;
}

// ===== Domain Registry =====

import { generalDomain } from './general';
import { studentDomain } from './student';
import { designDomain } from './design';
import { interactiveDomain } from './interactive';

export const DOMAINS: DomainProfile[] = [
    generalDomain,
    studentDomain,
    designDomain,
    interactiveDomain,
];

export const DOMAIN_MAP: Record<string, DomainProfile> = Object.fromEntries(
    DOMAINS.map(d => [d.id, d])
);

export function getDomainById(id: string): DomainProfile | undefined {
    return DOMAIN_MAP[id];
}
