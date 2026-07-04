import React from 'react';
import { addons, types } from 'storybook/manager-api';
import packageJson from '../../../packages/primitives/package.json';
import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';
import { light } from './themes';

installRdxDirectiveHighlight();

const packageVersionUrl = `https://www.npmjs.com/package/@radix-ng/primitives/v/${packageJson.version}`;
const telegramUrl = 'https://t.me/headless_angular';

// Component-level titles of primitives that are still in beta.
const BETA = new Set(['']);

function PackageVersionTool() {
    return React.createElement(
        'a',
        {
            href: packageVersionUrl,
            target: '_blank',
            rel: 'noreferrer',
            title: `@radix-ng/primitives ${packageJson.version}`,
            'aria-label': `Open @radix-ng/primitives ${packageJson.version} on npm`,
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '28px',
                padding: '0 8px',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '12px',
                lineHeight: 1,
                whiteSpace: 'nowrap'
            }
        },
        React.createElement(
            'svg',
            { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true },
            React.createElement('path', { d: 'M3 3h18v18H3V3Zm3.5 14h3V8.5H12V17h3V8.5h2.5V17h3V6H6.5v11Z' })
        ),
        React.createElement('span', null, 'npm'),
        React.createElement(
            'span',
            { style: { opacity: 0.68, fontFamily: 'JetBrains Mono, monospace' } },
            packageJson.version
        )
    );
}

function TelegramTool() {
    return React.createElement(
        'a',
        {
            href: telegramUrl,
            target: '_blank',
            rel: 'noreferrer',
            title: 'Telegram',
            'aria-label': 'Open Radix NG Telegram channel',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                color: 'inherit',
                textDecoration: 'none'
            }
        },
        React.createElement(
            'svg',
            { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true },
            React.createElement('path', {
                d: 'M11.94 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.94 0Zm4.97 7.22c.12 0 .38.03.55.17.14.11.18.27.2.38.02.11.04.33.02.5-.18 1.89-.96 6.5-1.36 8.62-.17.9-.5 1.2-.82 1.23-.7.06-1.22-.46-1.9-.9-1.06-.69-1.65-1.12-2.68-1.8-1.18-.78-.42-1.21.26-1.91.18-.18 3.25-2.98 3.31-3.23.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.79 1.14-5.06 3.34-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.22.33-.44.9-.66 3.5-1.53 5.83-2.53 7-3.02 3.33-1.38 4.02-1.62 4.36-1.64Z'
            })
        )
    );
}

addons.register('radix-ng/toolbar-links', () => {
    addons.add('radix-ng/telegram/tool', {
        title: 'Telegram',
        type: types.TOOLEXTRA,
        render: TelegramTool
    });
    addons.add('radix-ng/package-version/tool', {
        title: 'Package version',
        type: types.TOOLEXTRA,
        render: PackageVersionTool
    });
});

addons.setConfig({
    theme: light,
    sidebar: {
        renderLabel(item) {
            const isBeta = item.type === 'component' && BETA.has(item.name);
            if (!isBeta) {
                return item.name;
            }

            return React.createElement(
                'span',
                { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                item.name,
                React.createElement(
                    'span',
                    {
                        style: {
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                            lineHeight: 1,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            background: 'oklch(80% 0.15 264deg / 18%)',
                            color: 'oklch(45% 0.18 264deg)',
                            border: '1px solid oklch(65% 0.15 264deg / 30%)',
                            flexShrink: 0
                        }
                    },
                    'beta'
                )
            );
        }
    }
});
