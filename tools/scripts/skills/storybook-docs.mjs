/**
 * Renders the Storybook docs MDX into clean Markdown — the single, Astro-independent
 * source for the LLM consumer skills.
 *
 * Ported from apps/radix-docs/src/utils/storybook-docs.ts so the LLM-docs pipeline no
 * longer depends on the (deprecated) Astro docs app. The Storybook stories + *.docs.mdx
 * remain the source of truth: `<Canvas of={Stories.X} />` blocks are replaced with the
 * actual example source (resolved through each story's `?raw` import or inline template),
 * and Storybook-only blocks (Meta/Controls/ArgTypes/imports) are stripped.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const primitivesRoot = path.resolve(__dirname, '../../../packages/primitives');

const groupToSection = (group) => {
    switch (group) {
        case 'Utilities':
            return 'utils';
        case 'Guides':
            return 'guides';
        case 'Recipes':
            return 'recipes';
        case 'Examples':
            return 'examples';
        default:
            return 'components';
    }
};

const sectionLabel = (section) => {
    switch (section) {
        case 'utils':
            return 'Utilities';
        case 'guides':
            return 'Guides';
        case 'recipes':
            return 'Recipes';
        case 'examples':
            return 'Examples';
        default:
            return 'Components';
    }
};

const titleToSlug = (title) =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const getSlug = (filePath) => {
    const fileName = path.basename(filePath, '.docs.mdx');
    const packageName = path.basename(path.dirname(path.dirname(filePath)));

    if (packageName === 'primitives' || packageName === 'core' || fileName === 'sheet') {
        return titleToSlug(fileName);
    }

    return packageName;
};

const findDocs = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return findDocs(fullPath);
        return entry.isFile() && entry.name.endsWith('.docs.mdx') ? [fullPath] : [];
    });

const resolveImportPath = (fromFilePath, importPath) => {
    const cleanImportPath = importPath.replace(/\?raw$/, '');
    const absolutePath = path.resolve(path.dirname(fromFilePath), cleanImportPath);

    if (existsSync(absolutePath)) return absolutePath;
    if (existsSync(`${absolutePath}.ts`)) return `${absolutePath}.ts`;
    if (existsSync(`${absolutePath}.tsx`)) return `${absolutePath}.tsx`;
    if (existsSync(`${absolutePath}.html`)) return `${absolutePath}.html`;

    return absolutePath;
};

const getCodeFenceLanguage = (filePath) => {
    switch (path.extname(filePath ?? '')) {
        case '.html':
            return 'html';
        case '.css':
            return 'css';
        case '.json':
            return 'json';
        default:
            return 'typescript';
    }
};

const dedent = (code) => {
    const lines = code.replace(/^\n+|\n+$/g, '').split('\n');
    const minIndent = lines
        .filter((line) => line.trim())
        .reduce((indent, line) => {
            const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
            return Math.min(indent, currentIndent);
        }, Number.POSITIVE_INFINITY);

    if (!Number.isFinite(minIndent) || minIndent === 0) {
        return lines.join('\n').trim();
    }

    return lines
        .map((line) => line.slice(minIndent))
        .join('\n')
        .trim();
};

const extractBalancedBlock = (content, openBraceIndex) => {
    let depth = 0;
    let quote = null;
    let escaped = false;

    for (let index = openBraceIndex; index < content.length; index++) {
        const char = content[index];

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === "'" || char === '"' || char === '`') {
            quote = char;
            continue;
        }

        if (char === '{') depth++;

        if (char === '}') {
            depth--;
            if (depth === 0) {
                return content.slice(openBraceIndex, index + 1);
            }
        }
    }

    return undefined;
};

const extractStoryObject = (content, storyName) => {
    const exportMatch = new RegExp(`export\\s+const\\s+${storyName}\\b`).exec(content);
    if (!exportMatch) return undefined;

    const openBraceIndex = content.indexOf('{', exportMatch.index);
    if (openBraceIndex === -1) return undefined;

    return extractBalancedBlock(content, openBraceIndex);
};

const extractTemplateCode = (storyObject) => {
    const templateStart = storyObject.search(/\btemplate\s*:\s*(?:html)?`/);
    if (templateStart === -1) return undefined;

    const openTickIndex = storyObject.indexOf('`', templateStart);
    let escaped = false;

    for (let index = openTickIndex + 1; index < storyObject.length; index++) {
        const char = storyObject[index];

        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (char === '`') {
            return dedent(storyObject.slice(openTickIndex + 1, index));
        }
    }

    return undefined;
};

const getStorybookImports = (mdxContent, filePath) => {
    const storybookImports = new Map();
    const importPattern = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+\.stories)['"];?/g;

    for (const match of mdxContent.matchAll(importPattern)) {
        storybookImports.set(match[1], resolveImportPath(filePath, match[2]));
    }

    return storybookImports;
};

const getRawImports = (storyFilePath, storyContent) => {
    const rawImports = new Map();
    const rawImportPattern = /import\s+(\w+)\s+from\s+['"]([^'"]+\?raw)['"];?/g;

    for (const match of storyContent.matchAll(rawImportPattern)) {
        const sourcePath = resolveImportPath(storyFilePath, match[2]);
        if (existsSync(sourcePath)) {
            rawImports.set(match[1], {
                code: readFileSync(sourcePath, 'utf8').trim(),
                language: getCodeFenceLanguage(sourcePath)
            });
        }
    }

    return rawImports;
};

const getStoryCode = (storyFilePath, storyName) => {
    if (!existsSync(storyFilePath)) return undefined;

    const storyContent = readFileSync(storyFilePath, 'utf8');
    const storyObject = extractStoryObject(storyContent, storyName);
    if (!storyObject) return undefined;

    const rawImports = getRawImports(storyFilePath, storyContent);
    const sourceMatch = storyObject.match(/\bparameters\s*:\s*source\((\w+)\)/);
    const sourceCode = sourceMatch ? rawImports.get(sourceMatch[1]) : undefined;
    if (sourceCode) return sourceCode;

    const templateCode = extractTemplateCode(storyObject);
    if (templateCode) return { code: templateCode, language: 'html' };

    return undefined;
};

const codeFence = ({ code, language }) => `\n\`\`\`${language}\n${code}\n\`\`\`\n`;

const replaceStorybookBlocks = (content, filePath) => {
    const storybookImports = getStorybookImports(content, filePath);
    const metaAlias = content.match(/<Meta\b[^>]*\bof=\{(\w+)\}[^>]*\/>/)?.[1];
    const defaultAlias = metaAlias ?? storybookImports.keys().next().value;
    const resolveStoryCode = (alias, storyName) => {
        const storyFilePath = storybookImports.get(alias);
        const storyCode = storyFilePath ? getStoryCode(storyFilePath, storyName) : undefined;
        return storyCode ? codeFence(storyCode) : '';
    };

    return content
        .replace(/<Primary\b[^>]*\/>/g, () => (defaultAlias ? resolveStoryCode(defaultAlias, 'Default') : ''))
        .replace(/<Canvas\b[^>]*\bof=\{(\w+)\.(\w+)\}[^>]*\/>/g, (_match, alias, storyName) =>
            resolveStoryCode(alias, storyName)
        )
        .replace(/<(Canvas|Controls|ArgTypes)\b[^>]*\/>\n*/g, '');
};

const stripImports = (content) => {
    const lines = content.split('\n');
    const nextLines = [];
    let insideImport = false;
    let scanningHeader = true;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];

        if (!scanningHeader) {
            nextLines.push(line);
            continue;
        }
        if (!insideImport && line.trim() === '') continue;
        if (!insideImport && line.trimStart().startsWith('import ')) {
            insideImport = !line.includes(';');
            continue;
        }
        if (insideImport) {
            insideImport = !line.includes(';');
            continue;
        }
        scanningHeader = false;
        nextLines.push(line);
    }

    return nextLines.join('\n');
};

const cleanStorybookMdx = (content, filePath) =>
    stripImports(replaceStorybookBlocks(content, filePath))
        .replace(/<Meta\b[^>]*\/>\n*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const parseDoc = (filePath) => {
    const content = readFileSync(filePath, 'utf8');
    const metaTitle = content.match(/<Meta\b[^>]*title=["']([^"']+)["'][^>]*\/>/)?.[1];
    const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const titleParts = metaTitle?.split('/') ?? [];
    const group = titleParts[0] || 'Primitives';
    const title = heading || titleParts.at(-1) || path.basename(filePath, '.docs.mdx');

    if (!heading && !metaTitle) return null;

    const description = content.match(/^####\s+(.+)$/m)?.[1]?.trim() || title;
    const section = groupToSection(group);
    const slug = getSlug(filePath);

    return {
        group: sectionLabel(section),
        section,
        slug,
        title,
        description,
        body: cleanStorybookMdx(content, filePath)
    };
};

export const getStorybookDocs = () =>
    findDocs(primitivesRoot)
        .map(parseDoc)
        .filter(Boolean)
        .sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
