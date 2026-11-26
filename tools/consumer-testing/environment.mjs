import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
export const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function browserBuildInputs(consumer) {
    const output = path.join(consumer, 'dist/consumer');
    const browserStats = path.join(output, 'browser-stats.json');
    // Angular 22.3 split the stats by platform. Older experiment fixtures still emit stats.json.
    const stats = json(existsSync(browserStats) ? browserStats : path.join(output, 'stats.json'));
    return Object.keys(stats.inputs);
}

export function treeDigest(directory) {
    const files = readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
        .sort();
    const hash = createHash('sha256');
    for (const file of files)
        hash.update(file)
            .update('\0')
            .update(readFileSync(path.join(directory, file)))
            .update('\0');
    return { files: files.length, sha256: hash.digest('hex') };
}

/** Install through the public GitHub subpath and identify the exact installed bytes. */
export async function installConsumerSkills({ root, consumer, output, pnpm, run }) {
    const installer = ['dlx', 'skills@1.8.1', 'add', 'radix-ng/primitives/skills'];
    const discovery = await pnpm('skills-discovery', [...installer, '--list'], consumer);
    assert.match(discovery, /Found 2 skills/, 'the consumer subpath must offer only two skills');
    await pnpm('skills-install', [...installer, '--agent', 'codex', '--yes', '--copy'], consumer);
    const lock = json(path.join(consumer, 'skills-lock.json'));
    assert.deepEqual(Object.keys(lock.skills).sort(), ['radix-ng', 'radix-ng-examples']);
    const source = 'https://github.com/radix-ng/primitives.git';
    const published = path.join(output, 'published-source');
    await run('published-source', 'git', ['clone', '--depth', '1', source, published]);
    const revision = await run('published-revision', 'git', ['rev-parse', 'HEAD'], published);
    const skills = {};
    for (const name of Object.keys(lock.skills)) {
        const installed = treeDigest(path.join(consumer, '.agents/skills', name));
        assert.deepEqual(
            installed,
            treeDigest(path.join(published, 'skills', name)),
            `${name}: installed bytes differ from the captured published revision; retry if HEAD moved`
        );
        skills[name] = {
            ...installed,
            matchesLocalBundle: installed.sha256 === treeDigest(path.join(root, 'skills', name)).sha256
        };
    }
    return { source, subpath: 'skills', matchedRevision: revision, installer: 'skills@1.8.1', skills };
}

/** Build/pack once and install physical dependencies outside the repository, with no workspace links. */
export async function installPackedLibrary({ root, consumer, output, pnpm }) {
    await pnpm('library-build', ['primitives:build']);
    await pnpm('library-pack', ['pack', '--pack-destination', output], path.join(root, 'dist/primitives'));
    const archive = readdirSync(output).find((file) => file.endsWith('.tgz'));
    assert.ok(archive, 'pnpm pack did not produce a tarball');
    const manifestPath = path.join(consumer, 'package.json');
    const manifest = json(manifestPath);
    manifest.dependencies['@radix-ng/primitives'] = `file:../${archive}`;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    await pnpm('consumer-install', ['install'], consumer);
    const installedRoot = realpathSync(path.join(consumer, 'node_modules/@radix-ng/primitives'));
    assert.ok(installedRoot.startsWith(consumer + path.sep), 'library resolution escaped the isolated consumer');
    return {
        version: json(path.join(installedRoot, 'package.json')).version,
        tarballSha256: sha(readFileSync(path.join(output, archive))),
        resolvedPath: installedRoot
    };
}
