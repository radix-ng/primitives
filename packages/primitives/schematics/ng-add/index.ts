import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as pkgJson from '../../package.json';
import { getPackageVersionFromPackageJson, PackageJson } from './package-config';

/**
 * This is executed when `ng add @radix-ng/primitives` is run.
 * It installs all dependencies in the 'package.json'.
 */
export function ngAdd(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const pkg = pkgJson as unknown as PackageJson;

        context.logger.info(``);
        context.logger.info(`Installing ${pkg.name} dependencies...`);

        const ngCoreVersionTag = getPackageVersionFromPackageJson(tree, '@angular/core');
        context.logger.info(`@angular/core version ${ngCoreVersionTag}`);

        if (!ngCoreVersionTag) {
            throw new SchematicsException('@angular/core version not found');
        }

        const projectDeps: NodeDependency[] = [
            {
                name: '@angular/animations',
                type: NodeDependencyType.Default,
                version: ngCoreVersionTag,
                overwrite: false
            },
            { name: '@angular/common', type: NodeDependencyType.Default, version: ngCoreVersionTag, overwrite: false },
            { name: '@angular/core', type: NodeDependencyType.Default, version: ngCoreVersionTag, overwrite: false }
        ];

        projectDeps.forEach((dep) => {
            addPackageJsonDependency(tree, dep);
            context.logger.info(`Added dependency: ${dep.name}@${dep.version}`);
        });

        const libraryDeps: NodeDependency[] = [
            {
                name: '@angular/cdk',
                type: NodeDependencyType.Default,
                version: pkg.peerDependencies['@angular/cdk'],
                overwrite: false
            }
        ];

        libraryDeps.forEach((dep) => {
            addPackageJsonDependency(tree, dep);
            context.logger.info(`Added dependency: ${dep.name}@${dep.version}`);
        });

        const library: NodeDependency = {
            name: pkg.name,
            type: NodeDependencyType.Default,
            version: `~${pkg.version}`,
            overwrite: true
        };

        addPackageJsonDependency(tree, library);
        context.logger.info(`Installing ${library.name}@${library.version}`);

        context.addTask(new NodePackageInstallTask());

        return tree;
    };
}
