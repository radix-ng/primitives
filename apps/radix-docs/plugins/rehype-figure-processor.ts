import { visit } from 'unist-util-visit';

/**
 * rehype plugin to process `figure` elements with `rehype-pretty-code` metadata.
 * @returns {function} Transformer function for rehype
 */
export default function rehypeFigureProcessor() {
    return (tree) => {
        visit(tree, (node) => {
            if (node?.type === 'element' && node?.tagName === 'figure') {
                if (!('data-rehype-pretty-code-figure' in node.properties)) {
                    return;
                }

                const preElement = node.children.at(-1);
                if (preElement?.tagName !== 'pre') {
                    return;
                }

                preElement.properties.__withMeta__ = node.children.at(0)?.tagName === 'figcaption';

                preElement.properties.__rawString__ = node.__rawString__;

                if (node.__src__) {
                    preElement.properties.__src__ = node.__src__;
                }

                if (node.__event__) {
                    preElement.properties.__event__ = node.__event__;
                }

                if (node.__style__) {
                    preElement.properties.__style__ = node.__style__;
                }

                if (node.slot) {
                    preElement.properties.slot = node.slot;
                }
            }
        });
    };
}
