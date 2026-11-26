export type Orientation = 'horizontal' | 'vertical';

type Reference = { commit: string; packageVersion: string; digest: string };
declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        separatorParity: Reference;
    }
}

export function installFixture(): void {
    window.separatorParity = __PARITY_REFERENCE__;
}

export function opposite(orientation: Orientation): Orientation {
    return orientation === 'horizontal' ? 'vertical' : 'horizontal';
}
