import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { checkAgentSetup } from './check.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'radix-agents-check-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const write = (path, content) => {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), content);
    };
    write('AGENTS.md', '# Shared rules\n');
    write('CLAUDE.md', '@AGENTS.md\n');
    write('docs/engineering/architecture.md', '# Architecture\n');
    write(
        '.agents/skills/demo/SKILL.md',
        '---\nname: demo\ndescription: A fixture workflow.\n---\n\n[Guide](references/guide.md)\n'
    );
    write('.agents/skills/demo/references/guide.md', '# Guide\n');
    mkdirSync(join(root, '.claude/skills'), { recursive: true });
    symlinkSync('../../.agents/skills/demo', join(root, '.claude/skills/demo'), 'dir');
    return { root, write };
}

test('a portable mirrored setup passes without modifying files', (t) => {
    const { root } = fixture(t);
    const manifest = join(root, '.agents/skills/demo/SKILL.md');
    const before = readFileSync(manifest, 'utf8');
    assert.deepEqual(checkAgentSetup(root).errors, []);
    assert.equal(readFileSync(manifest, 'utf8'), before);
});

test('a reference deleted during migration is reported', (t) => {
    const { root } = fixture(t);
    unlinkSync(join(root, '.agents/skills/demo/references/guide.md'));
    assert.ok(checkAgentSetup(root).errors.some((error) => error.includes('broken Markdown link')));
});

test('a broken Claude mirror is reported without crashing', (t) => {
    const { root } = fixture(t);
    const mirror = join(root, '.claude/skills/demo');
    unlinkSync(mirror);
    symlinkSync('../../.agents/skills/missing', mirror, 'dir');
    assert.ok(checkAgentSetup(root).errors.some((error) => error.includes('working relative symlink')));
});

test('absolute mirrors are rejected even when they resolve locally', (t) => {
    const { root } = fixture(t);
    const mirror = join(root, '.claude/skills/demo');
    unlinkSync(mirror);
    symlinkSync(join(root, '.agents/skills/demo'), mirror, 'dir');
    assert.ok(checkAgentSetup(root).errors.some((error) => error.includes('link relatively')));
});

test('invalid discovery metadata and oversized project entrypoints fail', (t) => {
    const { root, write } = fixture(t);
    write('.agents/skills/demo/SKILL.md', `---\nname: other\n---\n${'detail '.repeat(1_000)}`);
    const { errors } = checkAgentSetup(root);
    assert.ok(errors.some((error) => error.includes('match its directory')));
    assert.ok(errors.some((error) => error.includes('missing description')));
    assert.ok(errors.some((error) => error.includes('project skill exceeds')));
});

test('locked upstream skills are checked without imposing project size limits', (t) => {
    const { root, write } = fixture(t);
    write('skills-lock.json', JSON.stringify({ version: 2, skills: { demo: { source: 'vendor/repo' } } }));
    write(
        '.agents/skills/demo/SKILL.md',
        `---\nname: demo\ndescription: Upstream workflow.\n---\n${'detail '.repeat(1_000)}`
    );
    assert.deepEqual(checkAgentSetup(root).errors, []);
    write('skills-lock.json', JSON.stringify({ version: 2, skills: { missing: { source: 'vendor/repo' } } }));
    assert.ok(checkAgentSetup(root).errors.some((error) => error.includes('Locked skill missing')));
});
