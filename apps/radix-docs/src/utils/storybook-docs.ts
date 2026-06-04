import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface StorybookDoc {
    group: string;
    section: string;
    slug: string;
    title: string;
    description: string;
    body: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findWorkspaceRoot = (start: string): string => {
    let current = start;

    while (current !== path.dirname(current)) {
        if (existsSync(path.join(current, 'packages/primitives'))) {
            return current;
        }

        current = path.dirname(current);
    }

    return path.resolve(__dirname, '../../../../');
};

const primitivesRoot = path.join(findWorkspaceRoot(process.cwd()), 'packages/primitives');

const groupToSection = (group: string): string => {
    switch (group) {
        case 'Utilities':
            return 'utils';
        case 'Guides':
            return 'guides';
        case 'Examples':
            return 'examples';
        default:
            return 'components';
    }
};

const sectionLabel = (section: string): string => {
    switch (section) {
        case 'utils':
            return 'Utilities';
        case 'guides':
            return 'Guides';
        case 'examples':
            return 'Examples';
        default:
            return 'Components';
    }
};

const titleToSlug = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const getSlug = (filePath: string): string => {
    const fileName = path.basename(filePath, '.docs.mdx');
    const packageName = path.basename(path.dirname(path.dirname(filePath)));

    if (packageName === 'primitives' || fileName === 'sheet') {
        return titleToSlug(fileName);
    }

    return packageName;
};

const findDocs = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return findDocs(fullPath);
        }

        return entry.isFile() && entry.name.endsWith('.docs.mdx') ? [fullPath] : [];
    });

const stripImports = (content: string): string => {
    const lines = content.split('\n');
    const nextLines: string[] = [];
    let insideImport = false;
    let scanningHeader = true;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]!;

        if (!scanningHeader) {
            nextLines.push(line);
            continue;
        }

        if (!insideImport && line.trim() === '') {
            continue;
        }

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

const cleanStorybookMdx = (content: string): string =>
    stripImports(content)
        .replace(/<Meta\b[^>]*\/>\n*/g, '')
        .replace(/<(Canvas|Primary|Controls|ArgTypes)\b[^>]*\/>\n*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const parseDoc = (filePath: string): StorybookDoc | null => {
    const content = readFileSync(filePath, 'utf8');
    const metaTitle = content.match(/<Meta\b[^>]*title=["']([^"']+)["'][^>]*\/>/)?.[1];
    const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const titleParts = metaTitle?.split('/') ?? [];
    const group = titleParts[0] || 'Primitives';
    const title = heading || titleParts.at(-1) || path.basename(filePath, '.docs.mdx');

    if (!heading && !metaTitle) {
        return null;
    }

    const description = content.match(/^####\s+(.+)$/m)?.[1]?.trim() || title;
    const section = groupToSection(group);
    const slug = getSlug(filePath);

    return {
        group: sectionLabel(section),
        section,
        slug,
        title,
        description,
        body: cleanStorybookMdx(content)
    };
};

export const getStorybookDocs = (): StorybookDoc[] =>
    findDocs(primitivesRoot)
        .map(parseDoc)
        .filter((doc): doc is StorybookDoc => Boolean(doc))
        .sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));

export const getStorybookDocByRoute = (section: string, slug: string): StorybookDoc | undefined =>
    getStorybookDocs().find((doc) => doc.section === section && doc.slug === slug);
