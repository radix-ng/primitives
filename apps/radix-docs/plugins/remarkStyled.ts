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
    };
}

export function remarkDirectives() {
    return {
        name: 'remark-directives',
        data: { micromarkExtensions: [directive()], fromMarkdownExtensions: [directiveFromMarkdown()] }
    };
}
