import { Tree, joinPathFragments } from '@nx/devkit';
import { getSourceRoot } from './path';

export function addExportToIndex(tree: Tree, entrypoint: string, statement: string): void {
    // get the path to the index.ts file
    const indexPath = joinPathFragments(getSourceRoot(tree, entrypoint), 'index.ts');

    // get the content of the index.ts file
    const content = tree.read(indexPath, 'utf-8');

    // split the content into lines - removing any empty lines
    const lines = content.split('\n').filter((line) => line.trim().length > 0);

    // add the export
    lines.push(statement);

    // write the new content back to the index.ts file
    tree.write(indexPath, lines.join('\n'));
}
