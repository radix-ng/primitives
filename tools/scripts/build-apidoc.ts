import { accessSync } from 'node:fs';
import * as util from 'node:util';
import * as TypeDoc from 'typedoc';
import { ReferenceType } from 'typedoc';

import { type DeclarationReflection } from 'typedoc';
import { getDecorator } from './get-decorator';

/**
 * TypeDoc's `DeclarationReflection` with the addition of decorators.
 * (See 'plugins/typedoc-plugin-decorators.mjs').
 */
export interface DeclarationReflectionWithDecorators extends DeclarationReflection {
    decorators?: { name: string; arguments?: Record<string, string> }[];
}

async function main() {
    const components = await getComponents();

    generateComponentsTypeDocs(components);
}

export async function getComponents() {
    const components = [];

    //const allComponentDirPath = `./packages/primitives`;

    // const allComponents = readdirSync(allComponentDirPath).filter((name) =>
    //     statSync(join(allComponentDirPath, name)).isDirectory()
    // );

    const allComponents = ['avatar'];
    allComponents.forEach((item) => {
        const componentPath = `./packages/primitives/${item}`;

        let fileExists = true;

        try {
            accessSync(componentPath);
        } catch (e) {
            fileExists = false;
        }

        if (fileExists) {
            const data = { name: item, path: componentPath };

            components.push(data);
        }
    });

    return components;
}

export function isInput(reflection: DeclarationReflectionWithDecorators): boolean {
    return (
        getDecorator(reflection) === 'Input' ||
        (reflection.type instanceof ReferenceType && reflection.type?.name === 'InputSignal')
    );
}

export async function generateComponentsTypeDocs(components) {
    for (const component of components) {
        const app = await TypeDoc.Application.bootstrapWithPlugins({
            entryPointStrategy: 'expand',
            entryPoints: [component.path],
            hideGenerator: true,
            includeVersion: true,
            disableSources: true,
            searchInComments: true,
            excludeExternals: true,
            logLevel: 'Error',
            sort: ['source-order'],
            readme: 'none',
            exclude: [
                '**/node_modules/**',
                '**/packages/**/node_modules/**',
                '**/__tests__/**',
                './packages/primitives/**/*index.ts'
            ],
            tsconfig: './packages/primitives/tsconfig.json'
        });

        const project = await app.convert();

        if (project) {
            await app.generateJson(project, `./api-generator/typedoc-${component?.name}.json`);

            const doc = {};

            const modules = project.groups.find((g) => g.title === 'Modules');

            if (modules) {
                modules.children.forEach((module) => {
                    const name = module.name.replace(/.*\//, '');

                    if (module.groups) {
                        if (!doc[name]) {
                            doc[name] = {
                                components: {}
                            };
                        }

                        const module_components_group = module.groups.find((g) => g.title === 'Components');
                        const module_events_group = module.groups.find((g) => g.title === 'Events');
                        const module_classes_group = module.groups.find((g) => g.title === 'Classes');
                        const module_directives_group = module.groups.find((g) => g.title === 'Directives');
                        const module_templates_group = module.groups.find((g) => g.title === 'Templates');
                        const module_interface_group = module.groups.find((g) => g.title === 'Interface');
                        const module_service_group = module.groups.find((g) => g.title === 'Service');
                        const module_enums_group = module.groups.find((g) => g.title === 'Enumerations');
                        const module_types_group = module.groups.find((g) => g.title === 'Type Aliases');

                        if (module_types_group) {
                            const types = {
                                description: '',
                                values: []
                            };

                            module_types_group.children.forEach((type) => {
                                types.values.push({
                                    name: type.name,
                                    description:
                                        type.comment && type.comment.summary.map((s) => s.text || '').join(' '),
                                    type: type.type && type.type.toString()
                                });
                            });
                        }
                        if (module_classes_group) {
                            console.log(module.name);

                            module_classes_group.children.forEach((classes) => {
                                const componentName = classes.name;

                                const classes_props_group = classes.groups.find((g) => g.title === 'Properties');

                                if (classes_props_group) {
                                    const props = {
                                        description: 'props',
                                        values: []
                                    };

                                    doc[name]['components'][componentName] = {
                                        description: 'description'
                                    };

                                    classes_props_group.children.forEach((prop) => {
                                        const defaultValue = prop.defaultValue
                                            ? prop.defaultValue.replace(/^'|'$/g, '')
                                            : undefined;

                                        props.values.push({
                                            name: prop.name,
                                            optional: prop.flags.isOptional,
                                            readonly: prop.flags.isReadonly,
                                            type:
                                                prop.getSignature && prop.getSignature.type
                                                    ? prop.getSignature.type.toString()
                                                    : prop.type
                                                      ? prop.type.toString()
                                                      : null,
                                            default:
                                                prop.type && prop.type.name === 'boolean' && !prop.defaultValue
                                                    ? 'false'
                                                    : defaultValue
                                        });
                                    });

                                    doc[name]['components'][componentName]['props'] = props;
                                }
                            });
                        }
                    }
                });
            }

            console.log(util.inspect(doc, { showHidden: false, depth: null, colors: true }));
        }
    }
}

main().catch(console.error);
