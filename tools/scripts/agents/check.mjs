import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function markdownFiles(directory) {
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return markdownFiles(path);
        return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
    });
}

function checkLinks(file, errors) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\[[^\]\n]*\]\((<[^>\n]+>|[^\s)]+)(?:\s+["'][^)\n]*)?\)/g)) {
        const target = match[1].replace(/^<|>$/g, '');
        if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(target)) continue;
        const path = decodeURIComponent(target.split('#')[0]);
        if (path && !existsSync(resolve(dirname(file), path))) {
            errors.push(`${file}: broken Markdown link ${target}`);
        }
    }
}

/** Read-only checks for contributor instructions; consumer bundle guards live in skills/generate.mjs. */
export function checkAgentSetup(workspaceRoot) {
    const errors = [];
    const skillRoot = join(workspaceRoot, '.agents/skills');
    const claudeRoot = join(workspaceRoot, '.claude/skills');
    const lockFile = join(workspaceRoot, 'skills-lock.json');
    const locked = existsSync(lockFile) ? Object.keys(JSON.parse(readFileSync(lockFile, 'utf8')).skills ?? {}) : [];
    const budgets = new Map([
        ['AGENTS.md', 6_500],
        ['CLAUDE.md', 1_000],
        ['docs/engineering/architecture.md', 6_500]
    ]);
    const files = new Set();
    for (const [path, maxBytes] of budgets) {
        const absolute = join(workspaceRoot, path);
        if (!existsSync(absolute)) {
            errors.push(`Missing entrypoint: ${path}`);
            continue;
        }
        files.add(absolute);
        if (Buffer.byteLength(readFileSync(absolute, 'utf8')) > maxBytes) {
            errors.push(`${path}: exceeds ${maxBytes} byte entrypoint budget; move detail into references`);
        }
    }
    const skills = existsSync(skillRoot) ? readdirSync(skillRoot) : [];
    if (!skills.length) errors.push('No contributor skills found in .agents/skills');
    const names = new Set();
    for (const directory of skills) {
        const skill = join(skillRoot, directory);
        const manifest = join(skill, 'SKILL.md');
        if (!existsSync(manifest)) {
            errors.push(`${directory}: missing SKILL.md`);
            continue;
        }
        const content = readFileSync(manifest, 'utf8');
        const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
        const name = frontmatter.match(/^name:\s*['"]?([a-z\d-]+)['"]?\s*$/m)?.[1];
        const description = frontmatter.match(/^description:\s*(\S.*)$/m)?.[1];
        if (!name || name !== directory || names.has(name)) {
            errors.push(`${manifest}: name must be unique and match its directory`);
        }
        if (!description) errors.push(`${manifest}: missing description`);
        names.add(name);
        if (!locked.includes(directory) && (Buffer.byteLength(content) > 6_000 || content.split('\n').length > 100)) {
            errors.push(`${manifest}: project skill exceeds 100 lines / 6000 bytes; move detail into references`);
        }
        markdownFiles(skill).forEach((file) => files.add(file));
        const mirror = join(claudeRoot, directory);
        if (!existsSync(mirror) || !lstatSync(mirror).isSymbolicLink()) {
            errors.push(`${mirror}: expected a working relative symlink to ${skill}`);
        } else if (isAbsolute(readlinkSync(mirror)) || realpathSync(mirror) !== realpathSync(skill)) {
            errors.push(`${mirror}: must link relatively to the canonical skill directory`);
        }
    }
    for (const name of locked) {
        if (!skills.includes(name)) errors.push(`Locked skill ${name} is missing from .agents/skills`);
    }
    if (existsSync(claudeRoot)) {
        for (const name of readdirSync(claudeRoot)) {
            if (!skills.includes(name)) errors.push(`${join(claudeRoot, name)}: no canonical skill in .agents/skills`);
        }
    }
    for (const directory of ['docs/engineering', '.claude/agents', '.claude/commands']) {
        markdownFiles(join(workspaceRoot, directory)).forEach((file) => files.add(file));
    }
    files.forEach((file) => checkLinks(file, errors));
    return { errors, skills: skills.length, files: files.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
    const result = checkAgentSetup(workspaceRoot);
    if (result.errors.length) {
        for (const error of result.errors) console.error(error.replaceAll(`${workspaceRoot}/`, ''));
        process.exitCode = 1;
    } else {
        console.log(`Contributor setup OK: ${result.skills} skills, ${result.files} Markdown files`);
    }
}
