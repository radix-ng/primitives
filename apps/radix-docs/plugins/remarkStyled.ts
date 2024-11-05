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

        visit(tree, 'heading', (node) => {
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};

            switch (node.depth) {
                case 1:
                    node.data.hProperties.className = 'rt-Heading rt-r-size-8 rt-r-mb-2';
                    break;
                case 2:
                    node.data.hProperties.className = 'rt-Heading rt-r-size-6 rt-r-mt-8 rt-r-mb-3';
                    break;
                case 3:
                    node.data.hProperties.className = 'rt-Heading rt-r-size-4 rt-r-mt-7 rt-r-mb-2';
                    break;
            }
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

        visit(tree, ['list', 'listItem'], (node) => {
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};
            if (node.type === 'list') {
                node.data.hProperties.className = (node.data.hProperties.className || []).concat([
                    `MDX_List`
                ]);
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
