import { liveNames } from './live';

/** Shared application layout only. Each primitive owns its positioning and scrolling. */
export const anchoredHeightClass =
    ' data-[side=top]:max-h-[var(--available-height)] data-[side=bottom]:max-h-[var(--available-height)]';
export const sizingNames = [
    'geometry-aligned-grow-down',
    'geometry-aligned-grow-up',
    'geometry-aligned-capped',
    'geometry-aligned-edge-top',
    'geometry-aligned-edge-bottom',
    'geometry-aligned-transformed',
    'geometry-aligned-transformed-rtl',
    'geometry-aligned-reopen',
    'geometry-aligned-no-selection',
    'geometry-aligned-short'
] as const;
export const geometryNames = [
    ...liveNames,
    ...sizingNames,
    'geometry-aligned-top',
    'geometry-aligned-middle',
    'geometry-aligned-bottom',
    'geometry-aligned-rtl',
    'geometry-anchor-bottom',
    'geometry-anchor-right',
    'geometry-anchor-scroll',
    'geometry-aligned-scroll',
    'geometry-anchor-clipped',
    'geometry-aligned-clipped',
    'geometry-anchor-portal',
    'geometry-aligned-portal'
] as const;
export type GeometryName = (typeof geometryNames)[number];
export function geometryConfig(name: string) {
    if (!geometryNames.includes(name as GeometryName)) return undefined;
    const aligned = name.includes('-aligned-');
    const live = name.startsWith('live-');
    const scroll = name.includes('-scroll') || (live && name.endsWith('-clipped'));
    const clipped = name.endsWith('-clipped');
    const portal = name.includes('-portal') || name.includes('-transformed');
    const transformed = name.includes('-transformed') || (portal && !aligned && !live);
    return {
        aligned,
        disableAnchorTracking: name.endsWith('-frozen') ? true : name.endsWith('-tracked') ? false : undefined,
        arrows: aligned,
        customPortal: portal,
        selectedIndex: name.endsWith('-no-selection')
            ? null
            : name.endsWith('-short')
              ? 2
              : name.endsWith('-grow-up')
                ? 39
                : name.endsWith('-grow-down') || name.endsWith('-capped')
                  ? 0
                  : name.endsWith('-bottom')
                    ? 38
                    : name.endsWith('-top')
                      ? 1
                      : 18,
        optionCount: name.endsWith('-short') ? 4 : 40,
        retained: name.endsWith('-reopen'),
        heightClass: name.endsWith('-capped') ? ' max-h-60' : aligned ? '' : ' max-h-[var(--available-height)]',
        dir: name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        shellClass: scroll
            ? live
                ? 'fixed start-4 block h-80 w-96 overflow-auto border border-border' +
                  (name.endsWith('-clipped') ? ' top-16' : ' top-4')
                : 'block h-56 w-96 overflow-auto border border-border'
            : clipped
              ? 'block h-48 w-96 overflow-hidden border border-border'
              : 'contents',
        formClass:
            'grid w-64 gap-3 ' +
            (name.endsWith('-edge-top')
                ? 'fixed -top-14 start-8'
                : name.endsWith('-edge-bottom')
                  ? 'fixed -bottom-8 start-8'
                  : scroll || clipped
                    ? live
                        ? 'm-16'
                        : 'm-4'
                    : name.endsWith('-bottom')
                      ? 'fixed bottom-2 start-8'
                      : name.endsWith('-right') || name.endsWith('-rtl')
                        ? 'fixed top-32 right-2'
                        : name.endsWith('-top')
                          ? 'fixed top-0 start-8'
                          : 'fixed top-24 start-8') +
            (name.includes('-initial-scale') ? ' origin-top-left scale-125' : ''),
        spacerClass: scroll ? 'h-[600px]' : undefined,
        portalClass: portal
            ? 'pointer-events-none fixed inset-8 border border-border' +
              (transformed ? ' translate-x-2 translate-y-2' : '') +
              (name.includes('-portal-scale') ? ' origin-top-left scale-110' : '')
            : 'contents'
    };
}
export type GeometryConfig = NonNullable<ReturnType<typeof geometryConfig>>;
