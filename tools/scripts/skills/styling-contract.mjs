// Read documented hooks only. Part ownership comes from a table column, an API part
// heading, or its ArgTypes declaration; values remain the authored description.
const cells = (line) =>
    line
        .trim()
        .replace(/^\||\|$/g, '')
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim().replace(/\\\|/g, '|').replace(/`/g, ''));

export function parseDataAttributes(content) {
    const lines = content.replace(/\r\n?/g, '\n').split('\n');
    const attributes = [];
    const headings = [];
    let argType = '';
    let fence;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index].trim();
        const marker = /^(`{3,}|~{3,})/.exec(line)?.[1];
        if (marker) {
            if (!fence) fence = marker;
            else if (marker[0] === fence[0] && marker.length >= fence.length) fence = undefined;
            continue;
        }
        if (fence) continue;

        const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (heading) {
            const level = heading[1].length;
            const title = heading[2].replace(/`/g, '');
            while (headings.at(-1)?.level >= level) headings.pop();
            headings.push({ level, title });
            if (!/^(Data attributes|CSS variables)$/i.test(title)) argType = '';
        }
        argType = /<ArgTypes\b[^>]*\bof=\{(\w+)\}/.exec(line)?.[1] ?? argType;
        if (!line.startsWith('|') || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[index + 1] ?? '')) continue;

        const headers = cells(line).map((cell) => cell.toLowerCase());
        const attributeColumn = headers.findIndex((cell) => /^(data )?attribute$/.test(cell));
        if (attributeColumn < 0) continue;
        const partColumn = headers.findIndex((cell) => /^(parts?|present on)$/.test(cell));
        const valueColumn = headers.findIndex((_, column) => column !== attributeColumn && column !== partColumn);
        const part = headings.findLast(
            ({ level, title }) => level >= 3 && !/^(Data attributes|CSS variables)$/i.test(title)
        )?.title;

        index += 2;
        while (lines[index]?.trim().startsWith('|')) {
            const row = cells(lines[index]);
            for (const attribute of row[attributeColumn]?.match(/\bdata-[a-z0-9-]+\b/g) ?? []) {
                attributes.push({
                    attribute,
                    parts: partColumn >= 0 ? (row[partColumn] ?? '') : (part ?? argType),
                    values: valueColumn >= 0 ? (row[valueColumn] ?? '') : ''
                });
            }
            index++;
        }
        index--;
    }
    return attributes;
}
