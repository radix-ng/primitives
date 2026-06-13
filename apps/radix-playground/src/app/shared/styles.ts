/*
 * Re-export the shared demo-styling constants so playground pages can import them from a single,
 * stable path instead of a deep relative path into the primitives package. These are the exact same
 * `cn` / `demo*` constants the Storybook stories use — keep the demos visually consistent.
 */
export * from '../../../../../packages/primitives/storybook/styles';
