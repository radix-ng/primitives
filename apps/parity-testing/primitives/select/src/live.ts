/** Application layout mutations only; neither adapter writes primitive state or scroll offsets. */
export const liveNames = [
    'live-anchor-default',
    'live-anchor-frozen',
    'live-aligned-default',
    'live-aligned-tracked',
    'live-anchor-scroll',
    'live-anchor-scroll-frozen',
    'live-aligned-scroll',
    'live-anchor-clipped',
    'live-anchor-initial-scale',
    'live-aligned-initial-scale',
    'live-anchor-portal-scale',
    'live-aligned-portal-scale'
] as const;
export type LiveName = (typeof liveNames)[number];
export const liveCommands = [
    { key: 'wide', shortcut: 'F2' },
    { key: 'tall', shortcut: 'F3' },
    { key: 'scaled', shortcut: 'F4' },
    { key: 'moved', shortcut: 'F6' },
    { key: 'capped', shortcut: 'F7' },
    { key: 'renamed', shortcut: 'F8' }
] as const;
export type LiveState = Partial<Record<(typeof liveCommands)[number]['key'], boolean>>;
export const liveFormClass = (state: LiveState) =>
    (state.wide ? ' w-80!' : '') +
    (state.scaled ? ' origin-top-left scale-125' : '') +
    (state.moved ? ' translate-x-12 translate-y-8' : '');
export const liveItemClass = (state: LiveState) => (state.tall ? ' py-4!' : '');
export const liveHeightClass = (state: LiveState) =>
    state.capped
        ? ' data-[side=none]:max-h-60! data-[side=top]:max-h-[min(15rem,var(--available-height))]! data-[side=bottom]:max-h-[min(15rem,var(--available-height))]!'
        : '';
