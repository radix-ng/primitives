const RDX_RE = /\brdx[A-Z][A-Za-z0-9_]*\b/g;

function wrapTextNode(node: Text) {
    const text = node.nodeValue!;
    RDX_RE.lastIndex = 0;
    const matches = [...text.matchAll(RDX_RE)];
    if (!matches.length) return;

    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of matches) {
        if (m.index! > last) frag.append(text.slice(last, m.index));
        const mark = document.createElement('mark');
        mark.dataset.rdxDirective = '';
        mark.textContent = m[0];
        frag.append(mark);
        last = m.index! + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.parentNode!.replaceChild(frag, node);
}

function run(doc: Document) {
    doc.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
        const walker = doc.createTreeWalker(pre, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const p = (node as Text).parentElement;
                if (!p || p.closest('mark[data-rdx-directive], script, style, textarea')) {
                    return NodeFilter.FILTER_REJECT;
                }
                RDX_RE.lastIndex = 0;
                return RDX_RE.test(node.nodeValue ?? '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const nodes: Text[] = [];
        while (walker.nextNode()) nodes.push(walker.currentNode as Text);
        nodes.forEach(wrapTextNode);
    });
}

export function installRdxDirectiveHighlight(doc = document) {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const schedule = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => run(doc));
    };
    new MutationObserver(schedule).observe(doc.body, { childList: true, subtree: true });
    schedule();
}
