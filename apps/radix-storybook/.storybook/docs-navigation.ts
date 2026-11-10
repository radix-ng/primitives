import { createElement, Fragment, useEffect, useRef, useState } from 'react';

// Labels affect navigation only: the prose headings and their existing URL fragments stay intact.
const labels: Record<string, string> = {
    'Popper positioning (Floating UI)': 'Popper',
    'Item-aligned positioning (native-like)': 'Item alignment',
    'Change details and interaction state': 'Events',
    'Deferred unmount and imperative actions': 'Exit lifecycle',
    'Viewport edges and long lists': 'Viewport edges',
    'Sizing and anchored fallback': 'Sizing',
    'Live layout and anchor tracking': 'Live positioning',
    'Native forms and autofill': 'Native forms',
    'Typed application wrapper': 'Typed wrapper',
    'Labels and control ids': 'Labels and IDs',
    'Labels before the popup opens': 'Early labels',
    'Migrating existing Select consumers': 'Migration',
    'Item-aligned with scroll': 'Item alignment + scroll',
    'Controlled mode with multiple triggers': 'Multiple triggers',
    'Close lifecycle and retained content': 'Exit lifecycle',
    'Custom return focus (finalFocus)': 'Return focus',
    'Calendar with Locale and Calendar System Selection': 'Locale and calendar',
    'Placing elements outside the popup': 'Outside elements',
    'Action sheet with separate destructive action': 'Destructive actions',
    'Provider, Indent, and IndentBackground': 'Provider and indentation',
    'Portal, Backdrop, Popup, Title, Description, Close, Viewport': 'Popup parts',
    'Trigger, Portal, Viewport, Backdrop, Content, Title, Description, and Close': 'Drawer parts',
    'List, Item, Icon, Popup, Arrow, and Backdrop': 'Menu parts',
    'Server errors with clear-on-edit': 'Server errors',
    'Two ways to surface field errors': 'Field errors',
    'When validity is displayed (validationMode)': 'Validation timing',
    'Angular-owned submission (rdxSignalSubmit)': 'Submission',
    'Async validation and reset lifecycle': 'Async validation'
};

// Storybook owns Tocbot's instance and navigation channel. Keep its default link handling and
// isolate this documented, version-sensitive extension in one place (covered by browser checks).
export const docsTocOptions = {
    orderedList: false,
    collapseDepth: 2,
    headingsOffset: 64,
    scrollSmoothOffset: -64,
    headingLabelCallback: (heading: string) => {
        const label = heading.trim();
        return labels[label] ?? label;
    }
};

// Docs chrome is rendered by Storybook's React renderer, independently of Angular story content.
export function DocsTocTitle() {
    const [expanded, setExpanded] = useState(false);
    const toggle = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const nav = toggle.current?.closest('nav');
        if (!nav) return;
        const navigate = (event: MouseEvent) => {
            if (event.target instanceof Element && event.target.closest('a.toc-link')) setExpanded(false);
        };
        const dismiss = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && toggle.current?.getClientRects().length) {
                event.preventDefault();
                setExpanded(false);
                toggle.current.focus({ preventScroll: true });
            }
        };
        nav.addEventListener('click', navigate);
        nav.addEventListener('keydown', dismiss);
        return () => {
            nav.removeEventListener('click', navigate);
            nav.removeEventListener('keydown', dismiss);
        };
    }, []);
    return createElement(
        Fragment,
        null,
        createElement('span', { className: 'docs-toc-heading' }, 'On this page'),
        createElement(
            'button',
            {
                type: 'button',
                ref: toggle,
                className: 'docs-toc-toggle',
                'aria-expanded': expanded,
                onClick: () => setExpanded((current) => !current)
            },
            'On this page',
            createElement(
                'svg',
                { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
                createElement('path', { d: 'm6 9 6 6 6-6', stroke: 'currentColor', strokeWidth: 2 })
            )
        )
    );
}
