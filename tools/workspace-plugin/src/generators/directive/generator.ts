import { directiveGenerator as angularDirectiveGenerator } from '@nx/angular/generators';
import { formatFiles, Tree } from '@nx/devkit';
import { addExportToIndex, getSourceRoot } from '../../utils';
import { DirectiveGeneratorSchema } from './schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
    await angularDirectiveGenerator(tree, {
        name: options.name,
        project: 'primitives',
        flat: false,
        export: false,
        prefix: 'kbq',
        standalone: true,
        path: getSourceRoot(tree, options.entrypoint)
    });

    addExportToIndex(
        tree,
        options.entrypoint,
        `export * from './${options.name}/${options.name}.directive';`
    );

    await formatFiles(tree);
}

export default directiveGenerator;
