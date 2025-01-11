import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageToPackageJson } from '@angular/cdk/schematics/ng-add/package-config';
import { readWorkspace } from '@schematics/angular/utility';
import { Schema } from './schema';

const DEPENDENCY_VERSIONS = {
    ANGULAR_CDK: '^19.0.0',
    RADIX_NG: '^28.0.0'
};

/**
 * This is executed when `ng add @radix-ng/primitives` is run.
 * It installs all dependencies in the 'package.json'.
 */
export default function (options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;

        if (project) {
            const workspace = await readWorkspace(tree);
            const projectWorkspace = workspace.projects.get(project);

            if (!projectWorkspace) {
                throw new SchematicsException(`Unable to find project '${project}' in the workspace`);
            }
        }

        addPackageToPackageJson(tree, '@angular/cdk', DEPENDENCY_VERSIONS.ANGULAR_CDK);
        addPackageToPackageJson(tree, '@radix-ng/primitives', DEPENDENCY_VERSIONS.RADIX_NG);

        context.addTask(new NodePackageInstallTask());
    };
}
