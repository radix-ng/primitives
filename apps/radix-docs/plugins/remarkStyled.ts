import { directiveFromMarkdown } from 'mdast-util-directive';
import { directive } from 'micromark-extension-directive';
import { visit } from 'unist-util-visit';

export default function remarkStyled() {
    return (tree: any) => {
        visit(tree, 'inlineCode', (node) => {
            node.type = 'html';
            node.value = `<code data-accent-color class="rt-reset rt-Code rt-variant-soft">${node.value}</code>`;
        });
    };
}

export function remarkDirectives() {
    return {
        name: 'remark-directives',
        data: { micromarkExtensions: [directive()], fromMarkdownExtensions: [directiveFromMarkdown()] }
    };
}
