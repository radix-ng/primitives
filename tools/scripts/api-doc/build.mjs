import fs from 'fs';
import path from 'path';
import * as TypeDoc from 'typedoc';
import { staticMessages } from './constants.mjs';
import {
    processComponentEmits,
    processComponentEvents,
    processComponentMethods,
    processComponentProps,
    processComponentTypes
} from './utility/index.mjs';
import {
    extractParameter,
    getCommentSummary,
    getDeprecatedText,
    getGroupByTitle,
    getTypesValue,
    isProcessable
} from './utils.mjs';

export async function generateComponentsTypeDocs() {
    const app = await TypeDoc.Application.bootstrapWithPlugins({
        name: 'RadixNG',
        entryPointStrategy: 'expand',
        entryPoints: ['./packages/primitives'],
        hideGenerator: true,
        includeVersion: true,
        disableSources: true,
        searchInComments: true,
        excludeExternals: true,
        logLevel: 'Error',
        sort: ['source-order'],
        exclude: ['**/node_modules/**', '**/packages/**/node_modules/**', '**/__tests__/**'],
        tsconfig: './packages/primitives/tsconfig.typedoc.json'
    });

    const project = await app.convert();

    await app.generateJson(project, `./tmp/typedoc.json`);

    if (!project) {
        console.error('Typedoc project is not available. Aborting.');
        return;
    }

    const doc = {};

    const modules = project.groups.find((g) => g.title === 'Modules');

    if (!isProcessable(modules)) {
        console.warn('No modules found or module group is not processable.');
        return;
    }

    modules.children.forEach((module) => {
        const name = module.name.replace(/.*\//, '');

        if (!module.groups) return;

        if (!doc[name]) {
            doc[name] = {
                components: {}
            };
        }

        const groupTitles = ['Service', 'Components', 'Events', 'Interface', 'Types'];

        const [
            module_service_group,
            module_components_group,
            module_events_group,
            module_interface_group,
            module_types_group
        ] = groupTitles.map((title) => getGroupByTitle(module, title));

        if (isProcessable(module_components_group)) {
            module_components_group.children.forEach((component) => {
                const componentName = component.name;
                const comment = getCommentSummary(component.comment);

                doc[name].components[componentName] = {
                    description: comment
                };

                const groupComponentTitles = ['Props', 'Emits', 'Method', 'Events', 'Types'];

                const [
                    component_props_group,
                    component_emits_group,
                    component_methods_group,
                    component_events_group,
                    component_types_group
                ] = groupComponentTitles.map((title) => getGroupByTitle(component, title));

                if (isProcessable(component_props_group)) {
                    doc[name].components[componentName].props = processComponentProps(component_props_group.children);
                }

                if (isProcessable(component_emits_group)) {
                    doc[name].components[componentName].emits = processComponentEmits(component_emits_group.children);
                }

                if (isProcessable(component_methods_group)) {
                    doc[name].components[componentName].methods = processComponentMethods(
                        component_methods_group.children
                    );
                }

                if (isProcessable(component_events_group)) {
                    doc[name].components[componentName].events = processComponentEvents(
                        component_events_group.children
                    );
                }

                if (isProcessable(component_types_group)) {
                    doc[name].components[componentName].types = processComponentTypes(component_types_group.children);
                }
            });
        }

        if (isProcessable(module_events_group)) {
            const events = {
                description: staticMessages['events'],
                values: []
            };

            module_events_group.children.forEach((event) => {
                events.values.push({
                    name: event.name,
                    description: event.comment && event.comment.summary.map((s) => s.text || '').join(' '),
                    props:
                        event.children &&
                        event.children.map((child) => ({
                            name: child.name,
                            optional: child.flags.isOptional,
                            readonly: child.flags.isReadonly,
                            type: child.type && child.type.toString(),
                            description: child.comment && child.comment.summary.map((s) => s.text || '').join(' '),
                            deprecated: getDeprecatedText(child)
                        }))
                });
            });

            doc[name]['events'] = events;
        }

        if (isProcessable(module_interface_group)) {
            const interfaces = {
                description: staticMessages['interfaces'],
                values: []
            };

            module_interface_group.children.forEach((int) => {
                interfaces.values.push({
                    name: int.name,
                    description: int.comment && int.comment.summary.map((s) => s.text || '').join(' '),
                    props:
                        int.children &&
                        int.children.map((child) => ({
                            name: child.name,
                            optional: child.flags.isOptional,
                            readonly: child.flags.isReadonly,
                            type: child.type ? child.type.toString() : extractParameter(int),
                            description: child.comment && child.comment.summary.map((s) => s.text || '').join(' '),
                            deprecated: getDeprecatedText(child)
                        }))
                });
            });

            doc[name]['interfaces'] = interfaces;
        }

        if (isProcessable(module_service_group)) {
            doc[name] = {
                description: staticMessages['service']
            };

            module_service_group.children.forEach((service) => {
                const service_methods_group = service.groups.find((g) => g.title === 'Method');
                if (isProcessable(service_methods_group)) {
                    const methods = {
                        description: 'Methods used in service.',
                        values: []
                    };

                    service_methods_group.children.forEach((method) => {
                        const signature = method.getAllSignatures()[0];
                        methods.values.push({
                            name: signature.name,
                            parameters: signature.parameters.map((param) => {
                                return {
                                    name: param.name,
                                    type: param.type.toString(),
                                    description:
                                        param.comment && param.comment.summary.map((s) => s.text || '').join(' ')
                                };
                            }),
                            returnType: signature.type.toString(),
                            description:
                                signature.comment && signature.comment.summary.map((s) => s.text || '').join(' ')
                        });
                    });

                    doc[name]['methods'] = methods;
                }
            });
        }

        if (isProcessable(module_types_group)) {
            const types = {
                description: staticMessages['types'],
                values: []
            };

            module_types_group.children.forEach((t) => {
                types.values.push({
                    name: t.name,
                    value: getTypesValue(t),
                    description: t.comment.summary && t.comment.summary.map((s) => s.text || '').join(' ')
                });
            });

            doc[name]['types'] = types;
        }
    });

    const typedocJSON = JSON.stringify(doc, null, 4);
    const outputDir = './apps/radix-docs/src/api-doc';

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.resolve(outputDir, 'primitives.json'), typedocJSON);

    console.log(`Documentation successfully generated in ${outputDir}/primitives.json`);
}

async function main() {
    await generateComponentsTypeDocs();
}

main().catch(console.error);
