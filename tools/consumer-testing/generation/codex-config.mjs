import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCodex } from '../../codex/executable.ts';

// Filesystem/network limits apply to model tools; Codex itself retains its normal subscription login.
export function codingConfig(consumer, codex = resolveCodex()) {
    const rg = process.env.PATH.split(path.delimiter)
        .map((directory) => path.join(directory, 'rg'))
        .find(existsSync);
    return {
        model_provider: 'openai',
        forced_login_method: 'chatgpt',
        model_reasoning_effort: 'low',
        approval_policy: 'never',
        default_permissions: 'consumer',
        'permissions.consumer.filesystem': {
            ':root': 'read',
            ':minimal': 'read',
            '/Users': 'deny',
            '/private/var/folders': 'deny',
            '/private/tmp': 'deny',
            [process.env.HOME]: 'deny',
            [path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')]: 'deny',
            [path.dirname(consumer)]: 'deny',
            ':workspace_roots': { '.': 'write' },
            '/System': 'read',
            '/usr': 'read',
            '/Library': 'read',
            [consumer]: 'write',
            [path.join(consumer, '.git')]: 'read',
            [path.join(consumer, '.agents')]: 'read',
            [path.dirname(path.dirname(process.execPath))]: 'read',
            ...(rg ? { [realpathSync(rg)]: 'read' } : {}),
            [codex.executable]: 'read'
        },
        'permissions.consumer.network.enabled': false,
        project_doc_max_bytes: 0,
        'skills.include_instructions': false,
        'skills.bundled.enabled': false,
        'plugins._default.enabled': false,
        'features.code_mode_host': true,
        'history.persistence': 'none',
        web_search: 'disabled',
        'shell_environment_policy.inherit': 'core',
        'shell_environment_policy.set': {
            PATH: [
                path.join(consumer, 'node_modules/.bin'),
                path.dirname(process.execPath),
                '/usr/bin',
                '/bin',
                ...(rg ? [path.dirname(realpathSync(rg))] : [])
            ].join(path.delimiter),
            NG_CLI_ANALYTICS: 'false',
            DISABLE_TELEMETRY: '1',
            TMPDIR: path.join(consumer, '.agent-tmp'),
            GIT_CONFIG_NOSYSTEM: '1',
            GIT_CONFIG_GLOBAL: '/dev/null'
        },
        projects: { [consumer]: { trust_level: 'trusted' } }
    };
}

// TOML dotted keys are supplied as CLI overrides; serialize objects as TOML inline tables.
function toml(value) {
    return value !== null && typeof value === 'object'
        ? `{ ${Object.entries(value)
              .map(([key, item]) => `${JSON.stringify(key)} = ${toml(item)}`)
              .join(', ')} }`
        : JSON.stringify(value);
}
export const configArguments = (config) =>
    Object.entries(config).flatMap(([key, value]) => ['-c', `${key}=${toml(value)}`]);
export const disabledFeatures = [
    'apps',
    'browser_use',
    'computer_use',
    'image_generation',
    'view_image',
    'code_mode',
    'multi_agent',
    'hooks',
    'goals',
    'skill_search',
    'tool_suggest',
    'shell_snapshot'
];
