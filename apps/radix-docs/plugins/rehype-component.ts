import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';
import { demos as DemosComponent } from '../src/demos/components';
import { demos } from '../src/demos/primitives';
import type { UnistNode, UnistTree } from './unist.ts';

function getNodeAttributeByName(
    node: UnistNode,
    name: string
): { name: string; value: unknown; type?: string } | undefined {
    return node.attributes?.find((attribute) => attribute.name === name);
}

function toCamelCase(str: string): string {
    return str
        .split(/[-_]/)
        .map((word, index) => {
            if (index === 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}

export function rehypeComponent() {
    return async (tree: UnistTree) => {
        visit(tree, (node: UnistNode) => {
            if (node.name === 'ComponentThemesPreview') {
                const name = getNodeAttributeByName(node, 'name')?.value as string;
                const file = getNodeAttributeByName(node, 'file')?.value as string;

                if (!name || !file) {
                    return null;
                }

                try {
                    const component = DemosComponent[name][file];
                    const src = component.files[0];

                    const filePath = path.join(process.cwd(), 'src/demos/components', src);
                    let source = fs.readFileSync(filePath, 'utf8');
                    source = source.replace(/export\s+default\s+.*;\s*/, '');

                    node.attributes?.push({
                        type: 'mdxJsxAttribute',
                        name: toCamelCase(`code-default`),
                        value: source
                    });

                    node.children?.push(
                        u('element', {
                            tagName: 'pre',
                            properties: {
                                __src__: src,
                                slot: 'default'
                            },
                            children: [
                                u('element', {
                                    tagName: 'code',
                                    properties: {
                                        className: ['language-angular-ts']
                                    },
                                    children: [
                                        {
                                            type: 'text',
                                            value: source
                                        }
                                    ]
                                })
                            ]
                        })
                    );
                } catch (error) {
                    console.error(error);
                }
            }

            if (node.name === 'ComponentPreview') {
                const name = getNodeAttributeByName(node, 'name')?.value as string;
                const file = getNodeAttributeByName(node, 'file')?.value as string;

                if (!name || !file) {
                    return null;
                }

                try {
                    const component = demos[name][file];
                    const src = component.files[0];

                    const filePath = path.join(process.cwd(), 'src/demos/primitives', src);
                    let source = fs.readFileSync(filePath, 'utf8');

                    source = source.replace(/export\s+default\s+.*;\s*/, '');
                    source = source.replace(/selector: '\[([^\]]+)\]'/, "selector: '$1'");

                    node.attributes?.push({
                        type: 'mdxJsxAttribute',
                        name: toCamelCase(`code-default`),
                        value: source
                    });

                    node.children?.push(
                        u('element', {
                            tagName: 'pre',
                            properties: {
                                __src__: src,
                                slot: 'default'
                            },
                            children: [
                                u('element', {
                                    tagName: 'code',
                                    properties: {
                                        className: ['language-angular-ts']
                                    },
                                    children: [
                                        {
                                            type: 'text',
                                            value: source
                                        }
                                    ]
                                })
                            ]
                        })
                    );

                    const cssSrc = component.cssFile;
                    const cssFilePath = path.join(process.cwd(), 'src/demos/primitives', cssSrc);

                    source = fs.readFileSync(cssFilePath, 'utf8');

                    node.attributes?.push({
                        type: 'mdxJsxAttribute',
                        name: toCamelCase(`code-css`),
                        value: source
                    });

                    node.children?.push(
                        u('element', {
                            tagName: 'pre',
                            properties: {
                                __src__: src,
                                slot: 'css'
                            },
                            children: [
                                u('element', {
                                    tagName: 'code',
                                    properties: {
                                        className: ['language-angular-ts']
                                    },
                                    children: [
                                        {
                                            type: 'text',
                                            value: source
                                        }
                                    ]
                                })
                            ]
                        })
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };
}
