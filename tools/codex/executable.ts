import { spawnSync } from 'node:child_process';
import { accessSync, constants, realpathSync, statSync } from 'node:fs';
import path from 'node:path';

export interface CodexExecutable {
    executable: string;
    version: string;
}

/** Resolve in the parent environment, before replacing PATH for a child process. */
export function findExecutable(name = 'codex', env: NodeJS.ProcessEnv = process.env): string {
    const explicit = path.isAbsolute(name) || name.includes('/') || name.includes('\\');
    const candidates = explicit
        ? [path.resolve(name)]
        : (env.PATH ?? '')
              .split(path.delimiter)
              .filter(Boolean)
              .flatMap((directory) =>
                  process.platform === 'win32'
                      ? (env.PATHEXT ?? '.EXE;.CMD;.BAT')
                            .split(';')
                            .map((extension) => path.join(directory, name + extension.toLowerCase()))
                      : [path.join(directory, name)]
              );
    for (const candidate of candidates) {
        try {
            accessSync(candidate, process.platform === 'win32' ? constants.F_OK : constants.X_OK);
            if (statSync(candidate).isFile()) return realpathSync(candidate);
        } catch {
            /* Try the next PATH entry. */
        }
    }
    throw new Error(
        `Cannot find executable ${JSON.stringify(name)}${explicit ? '' : ' in the parent PATH'}. Install Codex CLI or provide an executable path before restricting the child environment.`
    );
}

/** Keep subscription credentials in Codex; do not forward API overrides or parent agent context. */
export function codexEnvironment(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
    return Object.fromEntries(
        ['PATH', 'HOME', 'CODEX_HOME', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'TZ', 'SystemRoot'].flatMap((key) =>
            env[key] ? [[key, env[key]!]] : []
        )
    );
}

export function resolveCodex(env: NodeJS.ProcessEnv = process.env, name = 'codex'): CodexExecutable {
    const executable = findExecutable(name, env);
    const result = spawnSync(executable, ['--version'], {
        env: codexEnvironment(env),
        encoding: 'utf8',
        timeout: 10000
    });
    if (result.error)
        throw new Error(
            `Cannot launch Codex CLI at ${JSON.stringify(executable)}: ${(result.error as NodeJS.ErrnoException).code ?? result.error.message}.`,
            { cause: result.error }
        );
    if (result.status !== 0)
        throw new Error(
            `Codex CLI version check failed at ${JSON.stringify(executable)} (exit ${result.status ?? result.signal}).`
        );
    const version = result.stdout.trim();
    if (!/^codex-cli \d+\.\d+\.\d+/.test(version))
        throw new Error(`Unrecognized Codex CLI version at ${JSON.stringify(executable)}.`);
    return { executable, version };
}
