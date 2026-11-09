/** Shared application layout only. Each primitive owns its positioning and scrolling. */
export const geometryNames = [
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
    const scroll = name.endsWith('-scroll');
    const clipped = name.endsWith('-clipped');
    const portal = name.endsWith('-portal');
    return {
        aligned,
        arrows: aligned,
        customPortal: portal,
        selectedIndex: name.endsWith('-bottom') ? 38 : name.endsWith('-top') ? 1 : 18,
        dir: name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        shellClass: scroll
            ? 'block h-56 w-96 overflow-auto border border-border'
            : clipped
              ? 'block h-48 w-96 overflow-hidden border border-border'
              : 'contents',
        formClass:
            'grid w-64 gap-3 ' +
            (scroll || clipped
                ? 'm-4'
                : name.endsWith('-bottom')
                  ? 'fixed bottom-2 start-8'
                  : name.endsWith('-right') || name.endsWith('-rtl')
                    ? 'fixed top-32 right-2'
                    : name.endsWith('-top')
                      ? 'fixed top-0 start-8'
                      : 'fixed top-24 start-8'),
        spacerClass: scroll ? 'h-[600px]' : undefined,
        portalClass: portal
            ? 'fixed inset-8 border border-border' + (aligned ? '' : ' translate-x-2 translate-y-2')
            : 'contents'
    };
}
export type GeometryConfig = NonNullable<ReturnType<typeof geometryConfig>>;
