import { Tree, getWorkspaceLayout, joinPathFragments, names } from '@nx/devkit';

export function getSourceRoot(tree: Tree, entrypoint: string): string {
    return joinPathFragments(
        getWorkspaceLayout(tree).libsDir,
        'primitives',
        names(entrypoint).fileName
    );
}
