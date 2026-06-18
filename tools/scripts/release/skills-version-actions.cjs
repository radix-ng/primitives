const { execFileSync } = require('node:child_process');

const LARGE_BUFFER = 1024 * 1024 * 100;

const jsVersionActionsModule = require('@nx/js/src/release/version-actions');

const JsVersionActions = jsVersionActionsModule.default ?? jsVersionActionsModule;
const baseAfterAllProjectsVersioned = jsVersionActionsModule.afterAllProjectsVersioned;

const skillsOutputPathspecs = ['skills'];

const unique = (items) => Array.from(new Set(items));

const getChangedSkillFiles = (cwd) => {
    const status = execFileSync(
        'git',
        ['status', '--porcelain', '--untracked-files=all', '--', ...skillsOutputPathspecs],
        { cwd, encoding: 'utf8', windowsHide: true }
    );

    const changedFiles = [];
    const deletedFiles = [];

    for (const line of status.split('\n')) {
        if (!line) continue;

        const statusCode = line.slice(0, 2);
        const rawPath = line.slice(3);
        const filePaths = rawPath.includes(' -> ') ? rawPath.split(' -> ') : [rawPath];
        const filePath = filePaths.at(-1);

        if (statusCode.includes('D')) {
            deletedFiles.push(...filePaths);
        } else {
            changedFiles.push(filePath);
        }
    }

    return { changedFiles, deletedFiles };
};

const afterAllProjectsVersioned = async (cwd, opts) => {
    const baseResult = await baseAfterAllProjectsVersioned(cwd, opts);

    if (opts.dryRun) {
        if (opts.verbose) {
            console.log('Skipping skills:build during release dry-run.');
        }

        return baseResult;
    }

    if (opts.verbose) {
        console.log('Running pnpm skills:build after release versioning.');
    }

    execFileSync('pnpm', ['skills:build'], {
        cwd,
        env: process.env,
        maxBuffer: LARGE_BUFFER,
        stdio: opts.verbose ? 'inherit' : 'pipe',
        windowsHide: true
    });

    const skillsResult = getChangedSkillFiles(cwd);

    return {
        changedFiles: unique([...baseResult.changedFiles, ...skillsResult.changedFiles]),
        deletedFiles: unique([...baseResult.deletedFiles, ...skillsResult.deletedFiles])
    };
};

module.exports = JsVersionActions;
module.exports.default = JsVersionActions;
module.exports.afterAllProjectsVersioned = afterAllProjectsVersioned;
