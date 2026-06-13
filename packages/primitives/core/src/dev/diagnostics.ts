import { ElementRef, HOST_TAG_NAME, inject, isDevMode } from '@angular/core';

/**
 * Base URL of the documentation site. Each primitive's docs are also served as plain
 * Markdown at `/<section>/<slug>.md`, which both humans and AI agents can open.
 */
export const DOCS_BASE_URL = 'https://radix-ng.com';

/**
 * Full URL to a primitive's plain-Markdown docs page.
 * @param docsPath Documentation path for the owning primitive (e.g. `'components/select'`).
 */
export function docsUrl(docsPath: string): string {
    return `${DOCS_BASE_URL}/${docsPath}.md`;
}

/**
 * Codes already warned this page load, keyed by their stable `<primitive>/<slug>` code.
 * `rdxDevWarning` consults this so each distinct misuse warns at most once.
 */
const warnedCodes = new Set<string>();

function formatMessage(code: string, message: string, docsPath?: string): string {
    const hint = docsPath ? ` See ${docsUrl(docsPath)}` : '';
    return `[rdx:${code}] ${message}${hint}`;
}

/**
 * Emits a deduplicated dev-mode `console.warn` for a recoverable misuse.
 *
 * No-op outside `isDevMode()`, so production builds stay silent (and the message
 * assembly tree-shakes out). Dedupes per `code` per page load, replacing the
 * hand-rolled `warned` flags individual primitives used to carry.
 *
 * @param code Stable, greppable `<primitive>/<slug>` identifier (e.g. `'select/trigger-element'`).
 * @param message Human-readable explanation of the misuse and how to fix it.
 * @param docsPath Optional docs path appended as a `See <url>` hint (e.g. `'components/select'`).
 */
export function rdxDevWarning(code: string, message: string, docsPath?: string): void {
    if (!isDevMode() || warnedCodes.has(code)) {
        return;
    }

    warnedCodes.add(code);
    console.warn(formatMessage(code, message, docsPath));
}

/**
 * Throws a dev-mode `Error` for unrecoverable misuse (broken markup that cannot work).
 *
 * Unlike {@link rdxDevWarning} this always throws when reached — callers that want the
 * check to stay dev-only should guard the call with `isDevMode()`.
 *
 * @param code Stable, greppable `<primitive>/<slug>` identifier (e.g. `'popover/portal-on-element'`).
 * @param message Human-readable explanation of the misuse and how to fix it.
 * @param docsPath Optional docs path appended as a `See <url>` hint (e.g. `'components/popover'`).
 */
export function rdxDevError(code: string, message: string, docsPath?: string): never {
    throw new Error(formatMessage(code, message, docsPath));
}

/**
 * Test-only: clears the per-code dedup set so warning specs stay isolated from one another.
 */
export function resetRdxDevWarnings(): void {
    warnedCodes.clear();
}

/** Natively focusable / keyboard-operable host elements a trigger may live on without extra wiring. */
const INTERACTIVE_TRIGGER_TAGS = new Set(['button', 'a', 'input']);

/**
 * Dev-mode check: warns when a trigger part sits on a host element that is neither natively
 * interactive (`<button>`, `<a>`, `<input>`) nor made focusable with `tabindex`.
 *
 * Only meaningful for triggers whose selector accepts arbitrary elements **and** that do not
 * adapt their own ARIA/keyboard handling for non-button hosts — triggers scoped to
 * `button[...]` already enforce this at the selector level, and triggers that auto-apply
 * `role`/`tabindex` (e.g. `rdxMenuTrigger`) handle it themselves.
 *
 * Must be called inside an injection context (a directive constructor), where the host element
 * already exists. No-op outside `isDevMode()` and on synthetic hosts (component / `ng-template`),
 * where `HOST_TAG_NAME` is absent.
 *
 * @param triggerName Selector name used in the message, e.g. `'rdxPreviewCardTrigger'`.
 * @param code Stable diagnostics code, e.g. `'preview-card/trigger-element'`.
 * @param docsPath Docs path for the See-link, e.g. `'components/preview-card'`.
 */
export function rdxCheckTriggerElement(triggerName: string, code: string, docsPath: string): void {
    if (!isDevMode()) {
        return;
    }

    const tag = inject(HOST_TAG_NAME, { optional: true })?.toLowerCase();
    if (!tag || INTERACTIVE_TRIGGER_TAGS.has(tag)) {
        return;
    }

    // A consumer-supplied `tabindex` means they opted the element into focusability deliberately.
    if (inject(ElementRef).nativeElement.hasAttribute('tabindex')) {
        return;
    }

    rdxDevWarning(
        code,
        `\`${triggerName}\` is on a <${tag}>, which is not focusable or keyboard-operable by default. ` +
            `Use a native <button> or <a>, or add an appropriate \`role\` and \`tabindex\` so keyboard ` +
            `and assistive-technology users can reach it.`,
        docsPath
    );
}

/**
 * Dev-mode check: warns when a label part sits on a non-`<label>` host. The `for` attribute only
 * associates a `<label>` with a control, so a label part placed on any other element is not
 * programmatically connected to its control.
 *
 * Must be called inside an injection context. No-op outside `isDevMode()` and on synthetic hosts.
 *
 * @param labelName Selector name used in the message, e.g. `'rdxFieldLabel'`.
 * @param code Stable diagnostics code, e.g. `'field/unassociated-label'`.
 * @param docsPath Docs path for the See-link, e.g. `'components/field'`.
 */
export function rdxCheckLabelElement(labelName: string, code: string, docsPath: string): void {
    if (!isDevMode()) {
        return;
    }

    const tag = inject(HOST_TAG_NAME, { optional: true })?.toLowerCase();
    if (!tag || tag === 'label') {
        return;
    }

    rdxDevWarning(
        code,
        `\`${labelName}\` is on a <${tag}>. The \`for\` attribute only associates a <label> with a ` +
            `control, so this label is not programmatically connected to its control. Place it on a ` +
            `<label>, or associate the control another way (e.g. \`aria-labelledby\`).`,
        docsPath
    );
}
