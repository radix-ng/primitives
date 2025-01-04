import { visit } from 'unist-util-visit';

/**
 * rehype plugin to process `code` meta and extract custom properties.
 * @returns {function} Transformer function for rehype
 */
export default function rehypeCodeMetaProcessor() {
    return (tree: any) => {
        visit(tree, (node) => {
            if (node?.type === 'element' && node?.tagName === 'pre') {
                const [codeEl] = node.children;
                if (codeEl.tagName !== 'code') {
                    return;
                }

                if (codeEl.data?.meta) {
                    // Extract event from meta and pass it down the tree.
                    const regex = /event="([^"]*)"/;
                    const match = codeEl.data?.meta.match(regex);
                    if (match) {
                        node.__event__ = match ? match[1] : null;
                        codeEl.data.meta = codeEl.data.meta.replace(regex, '');
                    }
                }

                node.__rawString__ = codeEl.children?.[0]?.value;
                node.__src__ = node.properties?.__src__;
                node.__style__ = node.properties?.__style__;
                node.slot = node.properties?.slot;
            }
        });
    };
}
