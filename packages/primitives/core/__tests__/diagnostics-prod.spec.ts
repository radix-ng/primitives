import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Force production mode for this file only: the diagnostics helper reads `isDevMode()`
// live, so overriding the export makes `rdxDevWarning` a no-op exactly as a prod build would.
vi.mock('@angular/core', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@angular/core')>()),
    isDevMode: () => false
}));

describe('dev diagnostics (production mode)', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('rdxDevWarning emits nothing when isDevMode() is false', async () => {
        const { rdxDevWarning, resetRdxDevWarnings } = await import('../src/dev/diagnostics');
        resetRdxDevWarnings();

        rdxDevWarning('select/trigger-element', 'should be silent', 'components/select');

        expect(warn).not.toHaveBeenCalled();
    });
});
