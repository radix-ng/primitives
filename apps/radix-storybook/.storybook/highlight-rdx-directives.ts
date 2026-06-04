const RDX_DIRECTIVE_RE = /\brdx[A-Z][A-Za-z0-9_]*\b/g;

const isElement = (node: Node | null): node is Element => node instanceof Element;

function hasRdxDirective(text: string): boolean {
    RDX_DIRECTIVE_RE.lastIndex = 0;
    return RDX_DIRECTIVE_RE.test(text);
}

function wrapTextNode(textNode: Text) {
    const text = textNode.nodeValue;

    if (!text || !hasRdxDirective(text)) {
        return;
    }

    RDX_DIRECTIVE_RE.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of text.matchAll(RDX_DIRECTIVE_RE)) {
        const start = match.index ?? 0;
        const directive = match[0];

        if (start > lastIndex) {
            fragment.append(document.createTextNode(text.slice(lastIndex, start)));
        }

        const mark = document.createElement('mark');
        mark.dataset.rdxDirective = '';
        mark.textContent = directive;

        fragment.append(mark);
        lastIndex = start + directive.length;
    }

    if (lastIndex < text.length) {
        fragment.append(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
}

function highlightInPre(pre: HTMLElement) {
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = isElement(node.parentNode) ? node.parentNode : null;

            if (!parent) {
                return NodeFilter.FILTER_REJECT;
            }

            if (parent.closest('mark[data-rdx-directive]')) {
                return NodeFilter.FILTER_REJECT;
            }

            if (parent.closest('script, style, textarea')) {
                return NodeFilter.FILTER_REJECT;
            }

            const text = node.nodeValue ?? '';

            return hasRdxDirective(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const textNodes: Text[] = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach(wrapTextNode);
}

function highlightRdxDirectives(doc: Document = document) {
    doc.querySelectorAll<HTMLElement>('pre').forEach(highlightInPre);
}

function installForDocument(doc: Document) {
    if (!doc.body) {
        return;
    }

    let frame = 0;

    const run = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => highlightRdxDirectives(doc));
    };

    const observer = new MutationObserver(run);

    observer.observe(doc.body, {
        childList: true,
        subtree: true
    });

    run();

    setTimeout(run, 100);
    setTimeout(run, 500);
    setTimeout(run, 1000);
}

export function installRdxDirectiveHighlight() {
    if (typeof window === 'undefined') {
        return;
    }

    installForDocument(document);

    window.__highlightRdxDirectives = () => highlightRdxDirectives(document);
}

declare global {
    interface Window {
        __highlightRdxDirectives?: () => void;
    }
}
