import * as path from 'node:path';
import { Application, DeclarationReflection, ProjectReflection } from 'typedoc';
import { DeclarationReflectionWithDecorators } from './types/declaration-reflection-with-decorators';

const TYPEDOC_PLUGIN_PATH = path.join(__dirname, './plugins/typedoc-plugin-decorators.mjs');

type ProjectReflectionWithChildren = ProjectReflection & {
    children: ParentReflectionWithChildren[];
};

type ParentReflectionWithChildren = DeclarationReflection & {
    children: DeclarationReflectionWithDecorators[];
};

interface EntryPointReflection {
    entryName: string;
    reflection: ParentReflectionWithChildren;
}

async function getTypeDocProjectReflection(
    entryPoints: string[],
    projectRoot: string
): Promise<ProjectReflectionWithChildren> {
    const app = await Application.bootstrapWithPlugins({
        alwaysCreateEntryPointModule: true,
        entryPoints: ['packages/primitives/avatar'],
        emit: 'docs',
        excludeExternals: true,
        excludeInternal: false, // Include internal declarations for usage metrics.
        excludePrivate: true,
        excludeProtected: true,
        logLevel: 'Error',
        readme: 'none',
        plugin: [TYPEDOC_PLUGIN_PATH],
        tsconfig: `${projectRoot}/tsconfig.json`,
        exclude: [
            '**/node_modules/**',
            '**/packages/**/node_modules/**',
            '**/__tests__/**',
            './packages/primitives/**/*index.ts'
        ]
    });

    const projectRefl = await app.convert();

    /* istanbul ignore if: safety check */
    if (!projectRefl || !projectRefl.children) {
        throw new Error(`Failed to create TypeDoc project reflection for '${projectRoot}'.`);
    }

    return projectRefl as ProjectReflectionWithChildren;
}

export async function getEntryPointsReflections({
    entryPoints,
    packageName,
    projectRoot
}: {
    entryPoints: string[];
    packageName: string;
    projectRoot: string;
}): Promise<EntryPointReflection[]> {
    const projectRefl = await getTypeDocProjectReflection(entryPoints, projectRoot);

    const reflections: EntryPointReflection[] = [
        {
            entryName: packageName,
            reflection: projectRefl.children[0]
        }
    ];
    return reflections;
}
