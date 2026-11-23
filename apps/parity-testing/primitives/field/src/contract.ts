export const serverErrors = { outer: 'Outer field error', inner: 'Inner field error' };

type Reference = { commit: string; packageVersion: string; digest: string };
declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        fieldParity: Reference;
    }
}

export function installFixture() {
    window.fieldParity = __PARITY_REFERENCE__;
}
