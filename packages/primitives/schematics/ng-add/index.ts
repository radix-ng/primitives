import { getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
    addPackageJsonDependency,
    getPackageJsonDependency,
    NodeDependency,
    NodeDependencyType
} from '@schematics/angular/utility/dependencies';

const PACKAGE_NAME = '@radix-ng/primitives';
const PEER_DEPENDENCIES: Record<string, string> = {
    '@floating-ui/dom': '^1.7.4',
    '@internationalized/date': '^3.12.2',
    '@internationalized/number': '^3.6.7'
};

const AGENT_INSTRUCTIONS_START = '<!-- @radix-ng/primitives:start -->';
const AGENT_INSTRUCTIONS_END = '<!-- @radix-ng/primitives:end -->';

const AGENT_INSTRUCTIONS = `${AGENT_INSTRUCTIONS_START}

## Radix NG Primitives

This project uses \`@radix-ng/primitives\` — signals-first, headless Angular UI primitives.

- Primitives are **headless** directives: they ship no styles. Style them by targeting the
  \`data-*\` state attributes they expose (\`[data-state="open"]\`, \`[data-disabled]\`, …),
  never internal classes.
- Import each primitive from its secondary entry point, e.g.
  \`import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';\`
- Compound primitives (Dialog, Select, Menu, Accordion, …) are assembled from nested parts
  (Root → Trigger → Content/Item). Children resolve their Root via DI — keep the hierarchy intact.
- Inputs/outputs are signal-based; two-way bind values with \`[(value)]\`.
- Keep accessibility intact: visible labels stay programmatically associated with their control;
  do not remove ARIA attributes or keyboard handling the primitives provide.
- Never invent an API. If an input, output, or selector is not in the docs below, it does not exist.

Documentation for agents:

- Index: https://radix-ng.com/llms.txt — everything in one file: https://radix-ng.com/llms-full.txt
- Per-component Markdown: \`https://radix-ng.com/components/<name>.md\`
- Offline Agent Skills (APIs, examples, \`data-*\` styling contract, common mistakes):
  \`npx skills add radix-ng/primitives/skills\`

${AGENT_INSTRUCTIONS_END}
`;

/**
 * Appends the agent instructions block to the workspace's AI instruction files.
 * Appends to every existing AGENTS.md / CLAUDE.md; creates AGENTS.md (the cross-tool
 * standard, also read by Claude Code) when neither exists. Idempotent via the marker.
 */
function addAgentInstructions(tree: Tree, context: SchematicContext): void {
    const existingFiles = ['AGENTS.md', 'CLAUDE.md'].filter((filePath) => tree.exists(filePath));
    const targets = existingFiles.length ? existingFiles : ['AGENTS.md'];

    targets.forEach((filePath) => {
        if (!tree.exists(filePath)) {
            tree.create(filePath, AGENT_INSTRUCTIONS);
            context.logger.info(`  Created ${filePath} with AI assistant instructions.`);
            return;
        }

        const content = tree.read(filePath)?.toString() ?? '';

        if (content.includes(AGENT_INSTRUCTIONS_START)) {
            context.logger.info(`  ${filePath} already contains the Radix NG section — skipped.`);
            return;
        }

        const separator = content.endsWith('\n') ? '\n' : '\n\n';
        tree.overwrite(filePath, content + separator + AGENT_INSTRUCTIONS);
        context.logger.info(`  Added AI assistant instructions to ${filePath}.`);
    });
}

function logDependencyGroup(context: SchematicContext, label: string, dependencies: string[]): void {
    if (!dependencies.length) {
        return;
    }

    context.logger.info(`  ${label}:`);
    dependencies.forEach((dependency) => context.logger.info(`    - ${dependency}`));
}

/**
 * This is executed when `ng add @radix-ng/primitives` is run.
 * It adds the package and its runtime peer dependencies to package.json.
 */
export function ngAdd(options: Schema = {}): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info(``);
        context.logger.info(`Radix NG Primitives`);
        context.logger.info(`Setting up ${PACKAGE_NAME} for this Angular workspace.`);
        context.logger.info(``);

        const ngCoreVersionTag = getPackageVersionFromPackageJson(tree, '@angular/core');

        if (!ngCoreVersionTag) {
            throw new SchematicsException('Could not find @angular/core in package.json.');
        }

        const getPeerVersion = (name: string): string => {
            const version = PEER_DEPENDENCIES[name];

            if (!version) {
                throw new SchematicsException(`Could not find ${name} in ${PACKAGE_NAME} peer dependencies.`);
            }

            return version;
        };

        const dependencies: NodeDependency[] = [
            { name: '@angular/common', type: NodeDependencyType.Default, version: ngCoreVersionTag, overwrite: false },
            {
                name: '@floating-ui/dom',
                type: NodeDependencyType.Default,
                version: getPeerVersion('@floating-ui/dom'),
                overwrite: false
            },
            {
                name: '@internationalized/date',
                type: NodeDependencyType.Default,
                version: getPeerVersion('@internationalized/date'),
                overwrite: false
            },
            {
                name: '@internationalized/number',
                type: NodeDependencyType.Default,
                version: getPeerVersion('@internationalized/number'),
                overwrite: false
            }
        ];
        const added: string[] = [];
        const existing: string[] = [];

        dependencies.forEach((dep) => {
            const existingDependency = getPackageJsonDependency(tree, dep.name);

            addPackageJsonDependency(tree, dep);

            if (existingDependency) {
                existing.push(`${dep.name}@${existingDependency.version}`);
            } else {
                added.push(`${dep.name}@${dep.version}`);
            }
        });

        context.logger.info(`Updated package.json`);
        logDependencyGroup(context, 'Added', added);
        logDependencyGroup(context, 'Already present', existing);

        if (options.aiSetup !== false) {
            context.logger.info(``);
            addAgentInstructions(tree, context);
        }

        if (options.skipInstall) {
            context.logger.info(``);
            context.logger.info(`Skipped package manager install.`);
        } else {
            context.addTask(new NodePackageInstallTask());
            context.logger.info(``);
            context.logger.info(`Installing packages with your configured package manager...`);
        }

        context.logger.info(``);
        context.logger.info(`Configuration complete. You can import primitives from ${PACKAGE_NAME}/<primitive>.`);

        return tree;
    };
}
