import { directiveFromMarkdown } from 'mdast-util-directive';
import { directive } from 'micromark-extension-directive';
import { visit } from 'unist-util-visit';

export default function remarkStyled() {
    return (tree: any) => {
        visit(tree, 'link', (node) => {
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};

            node.data.hProperties.className =
                'rt-Text rt-reset rt-Link rt-underline-auto rt-Flex rt-r-display-inline-flex rt-r-ai-center rt-r-gap-1';
            node.data.hProperties.dataAccentColor = '';
        });

        visit(tree, 'paragraph', (node) => {
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};

            node.data.hProperties.className = 'rt-Text rt-r-size-3 rt-r-mb-4';
        });

        visit(tree, 'inlineCode', (node) => {
            node.type = 'html';
            node.value = `<code data-accent-color class="rt-reset rt-Code rt-variant-soft">${node.value}</code>`;
        });

        visit(tree, 'code', (node) => {
            if (node.data) {
                // Add custom classes or data attributes
                node.data.hProperties = node.data.hProperties || {};
                node.data.hProperties.className = (node.data.hProperties.className || []).concat([
                    'rt-r-my-5'
                ]);

                // Add a data attribute for the language
                if (node.lang) {
                    node.data.hProperties['data-language'] = node.lang;
                }
            }
        });
    };
}

export function remarkDirectives() {
    return {
        name: 'remark-directives',
        data: { micromarkExtensions: [directive()], fromMarkdownExtensions: [directiveFromMarkdown()] }
    };
}
