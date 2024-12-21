import fs from 'fs';
import path from 'path';
import * as TypeDoc from 'typedoc';
import { allowed, extractParameter, getDeprecatedText, getTypesValue, isProcessable, parameters } from './utils.mjs';

const staticMessages = {
    methods: "Defines methods that can be accessed by the component's reference.",
    emits: 'Defines emit that determine the behavior of the component based on a given condition or report the actions that the component takes.',
    events: "Defines the custom events used by the component's emitters.",
    interfaces: 'Defines the custom interfaces used by the module.',
    types: 'Defines the custom types used by the module.',
    props: 'Defines the input properties of the component.',
    service: 'Defines the service used by the component',
    classes: 'List of class names used in the styled mode.'
};

export async function generateComponentsTypeDocs() {
    const app = await TypeDoc.Application.bootstrapWithPlugins({
        name: 'RadixNG',
        entryPointStrategy: 'expand',
        entryPoints: ['./packages/primitives/separator', './packages/primitives/switch'],
        hideGenerator: true,
        includeVersion: true,
        disableSources: false,
        searchInComments: true,
        excludeExternals: true,
        logLevel: 'Error',
        sort: ['source-order'],
        exclude: [
            '**/node_modules/**',
            '**/packages/**/node_modules/**',
            '**/__tests__/**'
        ],
        tsconfig: './packages/primitives/tsconfig.json'
    });

    const project = await app.convert();

    await app.generateJson(project, `./tmp/typedoc.json`);

    if (project) {
        let doc = {};

        const modules = project.groups.find((g) => g.title === 'Modules');
        if (isProcessable(modules)) {
            modules.children.forEach((module) => {
                const name = module.name.replace(/.*\//, '');
                if (allowed(name)) {
                    if (module.groups) {
                        if (!doc[name]) {
                            doc[name] = {
                                components: {}
                            };
                        }

                        const module_service_group = module.groups.find((g) => g.title === 'Service');
                        const module_components_group = module.groups.find((g) => g.title === 'Components');
                        const module_events_group = module.groups.find((g) => g.title === 'Events');
                        const module_interface_group = module.groups.find((g) => g.title === 'Interface');
                        const module_types_group = module.groups.find((g) => g.title === 'Types');

                        if (isProcessable(module_components_group)) {
                            module_components_group.children.forEach((component) => {
                                const componentName = component.name;
                                const comment = component.comment;

                                doc[name]['components'][componentName] = {
                                    description: comment && comment.summary.map((s) => s.text || '').join(' ')
                                };

                                const component_props_group = component.groups.find((g) => g.title === 'Props');

                                if (isProcessable(component_props_group)) {
                                    const props = {
                                        description: staticMessages['props'],
                                        values: []
                                    };

                                    component_props_group.children.forEach((prop) => {
                                        let defaultValue = prop.defaultValue
                                            ? prop.defaultValue.replace(/^'|'$/g, '')
                                            : undefined;

                                        // Check for @defaultValue tag in comment blockTags
                                        if (prop.comment && prop.comment.blockTags) {
                                            const defaultValueTag = prop.comment.blockTags.find(
                                                (tag) => tag.tag === '@defaultValue'
                                            );
                                            if (defaultValueTag) {
                                                defaultValue = defaultValueTag.content
                                                    .map((c) => c.text.replace(/```ts\n|```/g, '').trim())
                                                    .join(' ');
                                            }
                                        }

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
                                                    : defaultValue,
                                            description: (
                                                prop.getSignature?.comment?.summary ||
                                                prop.setSignature?.comment?.summary ||
                                                prop.comment?.summary
                                            )
                                                ?.map((s) => s.text || '')
                                                .join(' '),
                                            deprecated:
                                                getDeprecatedText(prop.getSignature) ||
                                                getDeprecatedText(prop.setSignature) ||
                                                getDeprecatedText(prop)
                                        });
                                    });

                                    doc[name]['components'][componentName]['props'] = props;
                                }

                                const component_emits_group = component.groups.find((g) => g.title === 'Emits');
                                if (isProcessable(component_emits_group)) {
                                    const emits = {
                                        description: staticMessages['emits'],
                                        values: []
                                    };

                                    component_emits_group.children.forEach((emitter) => {
                                        emits.values.push({
                                            name: emitter.name,
                                            parameters: [
                                                {
                                                    name:
                                                        extractParameter(emitter) &&
                                                        extractParameter(emitter).includes('Event')
                                                            ? 'event'
                                                            : 'value',
                                                    type: extractParameter(emitter)
                                                }
                                            ],
                                            description:
                                                emitter.comment &&
                                                emitter.comment.summary.map((s) => s.text || '').join(' '),
                                            deprecated: getDeprecatedText(emitter)
                                        });
                                    });

                                    doc[name]['components'][componentName]['emits'] = emits;
                                }

                                const component_methods_group = component.groups.find((g) => g.title === 'Method');
                                if (isProcessable(component_methods_group)) {
                                    const methods = {
                                        description: staticMessages['methods'],
                                        values: []
                                    };

                                    component_methods_group.children.forEach((method) => {
                                        const signature = method.getAllSignatures()[0];
                                        methods.values.push({
                                            name: signature.name,
                                            parameters: signature.parameters.map((param) => {
                                                return {
                                                    name: param.name,
                                                    type: param.type.toString(),
                                                    description:
                                                        param.comment &&
                                                        param.comment.summary.map((s) => s.text || '').join(' ')
                                                };
                                            }),
                                            description:
                                                signature.comment &&
                                                signature.comment.summary.map((s) => s.text || '').join(' ')
                                        });
                                    });

                                    doc[name]['components'][componentName]['methods'] = methods;
                                }

                                const component_events_group = component.groups.find((g) => g.title === 'Events');
                                if (isProcessable(component_events_group)) {
                                    const events = {
                                        description: staticMessages['events'],
                                        values: []
                                    };

                                    component_events_group.children.forEach((event) => {
                                        events.values.push({
                                            name: event.name,
                                            description:
                                                event.comment &&
                                                event.comment.summary.map((s) => s.text || '').join(' '),
                                            props:
                                                event.children &&
                                                event.children.map((child) => ({
                                                    name: child.name,
                                                    optional: child.flags.isOptional,
                                                    readonly: child.flags.isReadonly,
                                                    type: child.type && child.type.toString(),
                                                    description:
                                                        child.comment &&
                                                        child.comment.summary.map((s) => s.text || '').join(' '),
                                                    deprecated: getDeprecatedText(child)
                                                }))
                                        });
                                    });

                                    doc[name]['components'][componentName]['events'] = events;
                                }

                                const component_types_group = component.groups.find((g) => g.title === 'Types');
                                if (isProcessable(component_types_group)) {
                                    const types = {
                                        description: staticMessages['types'],
                                        values: []
                                    };
                                    component_types_group.children.forEach((type) => {
                                        types.values.push({
                                            name: type.name,
                                            description:
                                                type.comment && type.comment.summary.map((s) => s.text || '').join(' '),
                                            type: type.type && type.type.toString(),
                                            parameters: parameters(type),
                                            deprecated: getDeprecatedText(type)
                                        });
                                    });
                                    doc[name]['components'][componentName]['types'] = types;
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
                                    description:
                                        event.comment && event.comment.summary.map((s) => s.text || '').join(' '),
                                    props:
                                        event.children &&
                                        event.children.map((child) => ({
                                            name: child.name,
                                            optional: child.flags.isOptional,
                                            readonly: child.flags.isReadonly,
                                            type: child.type && child.type.toString(),
                                            description:
                                                child.comment &&
                                                child.comment.summary.map((s) => s.text || '').join(' '),
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
                                            description:
                                                child.comment &&
                                                child.comment.summary.map((s) => s.text || '').join(' '),
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
                                                        param.comment &&
                                                        param.comment.summary.map((s) => s.text || '').join(' ')
                                                };
                                            }),
                                            returnType: signature.type.toString(),
                                            description:
                                                signature.comment &&
                                                signature.comment.summary.map((s) => s.text || '').join(' ')
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
                                    description:
                                        t.comment.summary && t.comment.summary.map((s) => s.text || '').join(' ')
                                });
                            });

                            doc[name]['types'] = types;
                        }
                    }
                }
            });
        }

        const typedocJSON = JSON.stringify(doc, null, 2);

        !fs.existsSync('./tmp/api-doc') && fs.mkdirSync('./tmp/api-doc');
        fs.writeFileSync(path.resolve('./tmp/api-doc', 'primitives.json'), typedocJSON);
    }
}

async function main() {
    await generateComponentsTypeDocs();
}

main().catch(console.error);
