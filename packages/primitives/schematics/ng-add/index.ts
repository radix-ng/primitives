import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
    addPackageJsonDependency,
    getPackageJsonDependency,
    NodeDependency,
    NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { getPackageVersionFromPackageJson } from './package-config';
import { Schema } from './schema';

const PACKAGE_NAME = '@radix-ng/primitives';
const PEER_DEPENDENCIES: Record<string, string> = {
    '@angular/cdk': '^19.2.0 || ^20.0.0 || ^21.0.0',
    '@floating-ui/dom': '^1.7.4',
    '@internationalized/date': '^3.12.2',
    '@internationalized/number': '^3.6.7'
};

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
                name: '@angular/cdk',
                type: NodeDependencyType.Default,
                version: getPeerVersion('@angular/cdk'),
                overwrite: false
            },
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
