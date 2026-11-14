import path from 'node:path';

// Mask code without changing offsets: example source is neither navigation nor headings.
const mask = (text) => text.replace(/[^\n]/g, ' ');
const prose = (content) => {
    let fence;
    return content
        .split(/(?<=\n)/)
        .map((line) => {
            const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
            if (marker) {
                if (!fence) fence = marker;
                else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined;
                return mask(line);
            }
            return fence ? mask(line) : line;
        })
        .join('');
};

export function markdownHeadings(content) {
    const ids = new Set();
    return [...prose(content).matchAll(/^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*$/gm)].map((match) => {
        const title = match[2].replace(/\s+#+$/, '');
        const slug = title
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]+>/g, '')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, '')
            .replace(/\s/g, '-');
        let id = slug;
        for (let suffix = 1; ids.has(id); suffix++) id = `${slug}-${suffix}`;
        ids.add(id);
        return { depth: match[1].length, title, id, start: match.index, end: match.index + match[0].length };
    });
}

export function markdownLinks(content) {
    const text = prose(content).replace(/(`+)[\s\S]*?\1/g, mask);
    return [...text.matchAll(/\]\((<[^>\n]+>|[^\s)]+)(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?\)|\bhref\s*=\s*(["'])(.*?)\2/g)]
        .filter((match) => match[1] || match[3])
        .map((match) => {
            const value = match[1] ?? match[3];
            const url = value.replace(/^<|>$/g, '');
            const start = match.index + match[0].indexOf(value) + (value.startsWith('<') ? 1 : 0);
            return { url, start, end: start + url.length };
        });
}

export function rewriteMarkdownLinks(content, rewrite) {
    for (const { url, start, end } of markdownLinks(content).reverse()) {
        content = content.slice(0, start) + rewrite(url) + content.slice(end);
    }
    return content;
}

// Validate final exported Markdown, after indexes and example shards have been assembled.
export function validateMarkdownLinks(files) {
    const anchors = new Map(
        [...files].map(([file, content]) => [file, new Set(markdownHeadings(content).map(({ id }) => id))])
    );
    const errors = [];
    for (const [file, content] of files) {
        for (const { url } of markdownLinks(content)) {
            if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(url)) continue;
            const [target, fragment] = url.split('#');
            if (target && !target.endsWith('.md')) continue;
            const destination = target
                ? path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURIComponent(target)))
                : file;
            if (!files.has(destination)) errors.push(`${file}: missing Markdown file ${url}`);
            else if (fragment && !anchors.get(destination).has(decodeURIComponent(fragment)))
                errors.push(`${file}: missing Markdown anchor ${url}`);
        }
    }
    return errors;
}
