import type { MarkdownHeading } from 'astro';
import type { TocItem } from '../types';

export function generateToc(headings: MarkdownHeading[], maxDepth = 3): TocItem[] {
    const toc: TocItem[] = [];
    const parentHeadings = new Map<number, TocItem>();

    headings.forEach((h) => {
        const heading = { ...h, children: [] };
        parentHeadings.set(heading.depth, heading);

        if (heading.depth === 2 || heading.depth === 3) {
            toc.push(heading);
        } else if (heading.depth <= maxDepth) {
            const parent = parentHeadings.get(heading.depth - 1);
            if (parent) {
                parent.children.push(heading);
            }
        }
    });

    return toc;
}
