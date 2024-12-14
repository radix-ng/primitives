import { accessSync } from 'node:fs';
import * as TypeDoc from 'typedoc';

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
        const componentPath = `./packages/primitives/${item}/index.ts`;

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

export async function generateComponentsTypeDocs(components) {
    for (const component of components) {
        const app = await TypeDoc.Application.bootstrapWithPlugins({
            entryPoints: [component.path],
            hideGenerator: true,
            includeVersion: true,
            disableSources: true,
            excludePrivate: true,
            excludeProtected: true,
            excludeExternals: true,
            sort: ['source-order'],
            readme: 'none',
            exclude: [
                '**/node_modules/**',
                '**/packages/**/node_modules/**'
            ],
            tsconfig: './packages/primitives/tsconfig.json'
        });

        const project = await app.convert();

        if (project) {
            await app.generateJson(project, `./api-generator/typedoc-${component?.name}.json`);

            // eslint-disable-next-line no-inner-declarations
            function parseGroup(groupTitle, childrenIds, directiveChildren) {
                return childrenIds
                    .map((childId) => {
                        const child = directiveChildren.find((item) => item.id === childId);
                        if (!child) {
                            console.log(`Child with ID ${childId} not found in directive's children.`);
                            return null;
                        }

                        return {
                            name: child.name,
                            type: child.type?.name || 'unknown',
                            description: child.comment?.summary?.map((item) => item.text).join('') || ''
                        };
                    })
                    .filter(Boolean);
            }

            // Function to parse a directive
            // eslint-disable-next-line no-inner-declarations
            function parseDirective(directive) {
                const doc = {
                    name: directive.name,
                    properties: []
                };

                // Parse properties
                const propertiesGroup = directive.groups?.find((group) => group.title === 'Properties');
                if (propertiesGroup) {
                    console.log(`Found Properties group for directive: ${directive.name}`);
                    //console.log(propertiesGroup.children);
                    propertiesGroup.children.forEach((item) => {
                        console.log(item.type.typeArguments[0].name);
                        doc.properties.push({
                            name: item.name,
                            type: {
                                name: item.type.name,
                                arg: item.type
                            }
                        });
                    });

                    //doc.properties = parseGroup('Properties', propertiesGroup.children, directive.children || []);
                } else {
                    console.log(`No Properties group found for directive: ${directive.name}`);
                }

                return doc;
            }

            // Parse all directives
            const docs = project.children
                .filter((child) => child.kind === 128)
                .map((directive) => {
                    const directiveChildren = directive.children || [];
                    return parseDirective(directive, directiveChildren);
                });

            console.log(docs);
        }
    }
}

main().catch(console.error);
