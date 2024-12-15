import * as util from 'node:util';
import { DeclarationReflection, ReflectionKind } from 'typedoc';
import { SkyManifestParentDefinition } from '../types/base-def';
import { getEntryPointsReflections } from './get-entry-points-reflections';
import { ProjectDefinition } from './get-project-definitions';
import { getClass } from './utils/get-class';
import { getDecorator } from './utils/get-decorator';
import { getDirective } from './utils/get-directive';
import { getEnum } from './utils/get-enum';
import { getFunction } from './utils/get-function';
import { getInterface } from './utils/get-interface';
import { getPipe } from './utils/get-pipe';
import { getTypeAlias } from './utils/get-type-alias';
import { getVariable } from './utils/get-variable';

export type PackagesMap = Map<string, SkyManifestParentDefinition[]>;

function handleClassKind(reflection: DeclarationReflection, filePath: string): SkyManifestParentDefinition {
    const decoratorName = getDecorator(reflection);

    switch (decoratorName) {
        case 'Injectable': {
            return getClass(reflection, 'service', filePath);
        }

        case 'Component': {
            return getDirective(reflection, 'component', filePath);
        }

        case 'Directive': {
            return getDirective(reflection, 'directive', filePath);
        }

        case 'NgModule': {
            return getClass(reflection, 'module', filePath);
        }

        case 'Pipe': {
            return getPipe(reflection, filePath);
        }

        default: {
            return getClass(reflection, 'class', filePath);
        }
    }
}

function getManifestItem(reflection: DeclarationReflection, filePath: string): SkyManifestParentDefinition {
    switch (reflection.kind) {
        case ReflectionKind.Class: {
            return handleClassKind(reflection, filePath);
        }

        case ReflectionKind.TypeAlias: {
            return getTypeAlias(reflection, filePath);
        }

        case ReflectionKind.Enum: {
            return getEnum(reflection, filePath);
        }

        case ReflectionKind.Function: {
            return getFunction(reflection, filePath);
        }

        case ReflectionKind.Interface: {
            return getInterface(reflection, filePath);
        }

        case ReflectionKind.Variable: {
            return getVariable(reflection, filePath);
        }

        default: {
            throw new Error(`Unhandled type encountered when processing '${reflection.name}'.`);
        }
    }
}

function sortArrayByKey<T>(arr: T[], key: keyof T): T[] {
    return arr.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
        }

        return 0;
    });
}

export async function getPublicApi(projects: ProjectDefinition[]) {
    const packages: PackagesMap = new Map<string, SkyManifestParentDefinition[]>();

    for (const { entryPoints, packageName, projectRoot } of projects) {
        console.log(`Creating manifest for "${projectRoot}"...`);

        const entryPointReflections = await getEntryPointsReflections({
            entryPoints,
            packageName,
            projectRoot
        });

        for (const { entryName, reflection } of entryPointReflections) {
            const items = packages.get(entryName) ?? [];

            for (const child of reflection.children) {
                const filePath = child.sources?.[0].fileName;

                items.push(getManifestItem(child, filePath));
            }
            console.log(util.inspect(items, { showHidden: false, depth: null, colors: true }));

            packages.set(entryName, sortArrayByKey(items, 'filePath'));
        }
    }

    return {
        packages: Object.fromEntries(packages)
    };
}
