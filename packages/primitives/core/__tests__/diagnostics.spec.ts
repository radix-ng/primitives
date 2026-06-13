import { ElementRef, HOST_TAG_NAME, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    docsUrl,
    rdxCheckLabelElement,
    rdxCheckTriggerElement,
    rdxDevError,
    rdxDevWarning,
    resetRdxDevWarnings
} from '../src/dev/diagnostics';

/**
 * Runs `fn` in an injection context that mimics a directive host element. Pass `tag = null`
 * to model a synthetic host (no `HOST_TAG_NAME`, e.g. a component / `ng-template`).
 */
function runOnHost(fn: () => void, tag: string | null, attributes: Record<string, string> = {}): void {
    const el = document.createElement(tag ?? 'div');
    for (const [name, value] of Object.entries(attributes)) {
        el.setAttribute(name, value);
    }

    const providers = [{ provide: ElementRef, useValue: new ElementRef(el) }];
    if (tag !== null) {
        providers.push({ provide: HOST_TAG_NAME, useValue: tag } as never);
    }

    runInInjectionContext(Injector.create({ providers }), fn);
}

describe('dev diagnostics', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        resetRdxDevWarnings();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    describe('docsUrl', () => {
        it('builds the plain-Markdown docs URL', () => {
            expect(docsUrl('components/select')).toBe('https://radix-ng.com/components/select.md');
        });
    });

    describe('rdxDevWarning', () => {
        it('warns with the `[rdx:<code>]` prefix and docs hint', () => {
            rdxDevWarning('select/trigger-element', 'Use a <button>.', 'components/select');

            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(
                '[rdx:select/trigger-element] Use a <button>. See https://radix-ng.com/components/select.md'
            );
        });

        it('omits the docs hint when no docsPath is given', () => {
            rdxDevWarning('select/trigger-element', 'Use a <button>.');

            expect(warn).toHaveBeenCalledWith('[rdx:select/trigger-element] Use a <button>.');
        });

        it('dedupes per code per page load', () => {
            rdxDevWarning('select/trigger-element', 'first');
            rdxDevWarning('select/trigger-element', 'second');

            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith('[rdx:select/trigger-element] first');
        });

        it('warns again for a different code', () => {
            rdxDevWarning('select/trigger-element', 'a');
            rdxDevWarning('field/unassociated-label', 'b');

            expect(warn).toHaveBeenCalledTimes(2);
        });

        it('warns again after resetRdxDevWarnings()', () => {
            rdxDevWarning('select/trigger-element', 'a');
            resetRdxDevWarnings();
            rdxDevWarning('select/trigger-element', 'a');

            expect(warn).toHaveBeenCalledTimes(2);
        });
    });

    describe('rdxDevError', () => {
        it('throws with the formatted message and docs hint', () => {
            expect(() =>
                rdxDevError('popover/portal-on-element', 'Use the structural form.', 'components/popover')
            ).toThrow(
                '[rdx:popover/portal-on-element] Use the structural form. See https://radix-ng.com/components/popover.md'
            );
        });

        it('throws without a docs hint when none is given', () => {
            expect(() => rdxDevError('popover/portal-on-element', 'broken')).toThrow(
                '[rdx:popover/portal-on-element] broken'
            );
        });
    });

    describe('rdxCheckTriggerElement', () => {
        const check = () =>
            rdxCheckTriggerElement('rdxPreviewCardTrigger', 'preview-card/trigger-element', 'components/preview-card');

        it.each(['button', 'a', 'input'])('stays silent on a natively interactive <%s>', (tag) => {
            runOnHost(check, tag);
            expect(warn).not.toHaveBeenCalled();
        });

        it('stays silent on a non-interactive host that opts into focus with tabindex', () => {
            runOnHost(check, 'span', { tabindex: '0' });
            expect(warn).not.toHaveBeenCalled();
        });

        it('stays silent on a synthetic host without HOST_TAG_NAME', () => {
            runOnHost(check, null);
            expect(warn).not.toHaveBeenCalled();
        });

        it('warns on a non-interactive host, naming the tag and code', () => {
            runOnHost(check, 'span');

            expect(warn).toHaveBeenCalledTimes(1);
            const message = warn.mock.calls[0][0] as string;
            expect(message).toContain('[rdx:preview-card/trigger-element]');
            expect(message).toContain('`rdxPreviewCardTrigger` is on a <span>');
            expect(message).toContain('https://radix-ng.com/components/preview-card.md');
        });
    });

    describe('rdxCheckLabelElement', () => {
        const check = () => rdxCheckLabelElement('rdxFieldLabel', 'field/unassociated-label', 'components/field');

        it('stays silent on a <label> host', () => {
            runOnHost(check, 'label');
            expect(warn).not.toHaveBeenCalled();
        });

        it('stays silent on a synthetic host without HOST_TAG_NAME', () => {
            runOnHost(check, null);
            expect(warn).not.toHaveBeenCalled();
        });

        it('warns on a non-label host, explaining the broken `for` association', () => {
            runOnHost(check, 'span');

            expect(warn).toHaveBeenCalledTimes(1);
            const message = warn.mock.calls[0][0] as string;
            expect(message).toContain('[rdx:field/unassociated-label]');
            expect(message).toContain('`rdxFieldLabel` is on a <span>');
            expect(message).toContain('`for` attribute');
            expect(message).toContain('https://radix-ng.com/components/field.md');
        });
    });
});
