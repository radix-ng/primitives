import React from 'react';
import { addons } from 'storybook/manager-api';
import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';
import { light } from './themes';

installRdxDirectiveHighlight();

// Component-level titles of primitives that are still in beta.
const BETA = new Set(['Alert Dialog', 'Select']);

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
