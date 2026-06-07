import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';

export type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

/**
 * Announces messages to screen readers through an `aria-live` region, without moving focus.
 *
 * Own replacement for CDK's `LiveAnnouncer` — lazily appends a visually hidden live region to
 * the document body and writes messages into it. No-op on the server.
 */
@Injectable({ providedIn: 'root' })
export class RdxLiveAnnouncer {
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private liveElement: HTMLElement | null = null;
    private previousTimeout: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            clearTimeout(this.previousTimeout);
            this.liveElement?.remove();
            this.liveElement = null;
        });
    }

    /**
     * Announces a message to screen readers.
     *
     * @param message The message to announce.
     * @param politeness The politeness of the announcer element (defaults to `'polite'`).
     * @param duration If provided, the message is cleared after this many milliseconds.
     */
    announce(message: string, politeness: AriaLivePoliteness = 'polite', duration?: number): void {
        if (!this.isBrowser) {
            return;
        }

        const liveElement = this.getLiveElement();

        clearTimeout(this.previousTimeout);

        liveElement.setAttribute('aria-live', politeness);

        // Clear the live element first, then set the message after a tick so that screen
        // readers reliably pick up the change even when the text is identical.
        liveElement.textContent = '';
        this.previousTimeout = setTimeout(() => {
            liveElement.textContent = message;

            if (typeof duration === 'number') {
                this.previousTimeout = setTimeout(() => (liveElement.textContent = ''), duration);
            }
        });
    }

    /** Clears the current announcement. */
    clear(): void {
        if (this.liveElement) {
            this.liveElement.textContent = '';
        }
    }

    private getLiveElement(): HTMLElement {
        if (this.liveElement) {
            return this.liveElement;
        }

        const element = this.document.createElement('div');
        element.classList.add('rdx-live-announcer');
        element.setAttribute('aria-atomic', 'true');
        element.setAttribute('aria-live', 'polite');

        // Visually hide the region while keeping it available to assistive technology.
        element.style.position = 'absolute';
        element.style.width = '1px';
        element.style.height = '1px';
        element.style.margin = '-1px';
        element.style.padding = '0';
        element.style.border = '0';
        element.style.overflow = 'hidden';
        element.style.clip = 'rect(0 0 0 0)';
        element.style.clipPath = 'inset(100%)';
        element.style.whiteSpace = 'nowrap';

        this.document.body.appendChild(element);
        this.liveElement = element;

        return element;
    }
}
