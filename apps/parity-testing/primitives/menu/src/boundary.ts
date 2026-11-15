export const boundaryCases = [
    'boundary-default-local',
    'boundary-clipping-local',
    'boundary-clipping-local-absolute',
    'boundary-default-body',
    'boundary-element',
    'boundary-ref',
    'boundary-elements',
    'boundary-mixed',
    'boundary-rect',
    'boundary-rect-local-scaled',
    'boundary-viewport-body',
    'boundary-change-element',
    'boundary-change-array',
    'boundary-change-rect'
] as const;

export function boundaryConfig(name: string) {
    const positioning = positioningConfig(name);
    if (!(boundaryCases as readonly string[]).includes(name) && !positioning) return undefined;
    return {
        positioning,
        mode: positioning
            ? positioning.documentScroll
                ? ('viewport' as const)
                : ('element' as const)
            : name.includes('rect')
              ? ('rect' as const)
              : name.includes('array') || name.endsWith('elements')
                ? ('array' as const)
                : name.endsWith('mixed')
                  ? ('mixed' as const)
                  : name.endsWith('ref')
                    ? ('ref' as const)
                    : name.includes('clipping')
                      ? ('clipping' as const)
                      : name.includes('viewport')
                        ? ('viewport' as const)
                        : name.includes('default')
                          ? ('default' as const)
                          : ('element' as const),
        local: name.includes('-local'),
        absolute: name.endsWith('absolute'),
        scaled: name.endsWith('scaled'),
        dynamic: name.includes('-change-'),
        initialSide: name.endsWith('body') ? ('bottom' as const) : ('top' as const)
    };
}

export const boundaryClasses = {
    outer: 'fixed left-20 top-20 h-[420px] w-[520px] overflow-hidden transform-gpu',
    inner: 'absolute left-8 top-8 h-60 w-[456px] overflow-hidden',
    anchor: 'absolute left-8 top-40'
};
import { positioningConfig } from './positioning';
