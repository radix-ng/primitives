import React from 'react';
import { addons, types } from 'storybook/manager-api';
import packageJson from '../../../packages/primitives/package.json';
import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';
import { light } from './themes';

installRdxDirectiveHighlight();

const packageVersionUrl = `https://www.npmjs.com/package/@radix-ng/primitives/v/${packageJson.version}`;

// Component-level titles of primitives that are still in beta.
const BETA = new Set(['Alert Dialog', 'Select']);

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

addons.register('radix-ng/package-version', () => {
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
