// Ambient declarations for Storybook manager customization (`manager.tsx`).
//
// The Storybook manager is a React app; `manager.tsx` uses `React.createElement`
// to render toolbar/sidebar UI. React is provided at build time by Storybook's
// own manager builder (it's a peer dependency of `storybook`), so we intentionally
// do NOT install `react` / `@types/react` in this Angular library. These shims keep
// the editor/tsc type-check happy without adding a dependency.
declare module 'react' {
    const React: any;
    export default React;
}

// Side-effect CSS imports in the manager (e.g. `./rdx-directive-highlight.css`).
declare module '*.css';
