import { directiveGenerator as angularDirectiveGenerator } from '@nx/angular/generators';
import { formatFiles, joinPathFragments, names, Tree } from '@nx/devkit';
import { addExportToIndex, getSourceRoot } from '../../utils';
import { DirectiveGeneratorSchema } from './schema';

export async function directiveGenerator(tree: Tree, options: DirectiveGeneratorSchema) {
    await angularDirectiveGenerator(tree, {
        name: options.name,
        export: false,
        prefix: 'kbq',
        standalone: true
    });

    prefixDirectiveClass(tree, options);

    addExportToIndex(
        tree,
        options.entrypoint,
        `export * from './${options.name}/${options.name}.directive';`
    );

    await formatFiles(tree);
}

export default directiveGenerator;

function prefixDirectiveClass(tree: Tree, options: DirectiveGeneratorSchema): void {
    const directory = getSourceRoot(tree, options.entrypoint);

    const filesToUpdate = [
        joinPathFragments(directory, options.name, `${options.name}.directive.ts`),
        joinPathFragments(directory, options.name, `${options.name}.directive.spec.ts`)
    ];

    const className = names(options.name).className + 'Directive';

    for (const file of filesToUpdate) {
        const content = tree.read(file).toString();

        const updatedContent = content.replace(new RegExp(className, 'g'), className);

        tree.write(file, updatedContent);
    }
}
