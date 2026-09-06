import { afterNextRender, DestroyRef, inject } from '@angular/core';
import { rdxPlatform } from '../dom/platform';

/** Word joiner: invisible and zero-width, so it mutates the text without shifting layout. */
const LIVE_REGION_MARKER = '\u2060';

/** Safari's VoiceOver needs roughly this long to notice the initial polite live-region change. */
const RESET_DELAY = 200;

/** The last non-empty text node under `root`, or `null` when the region has no text yet. */
function findLastTextNode(root: HTMLElement): Text | null {
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let lastTextNode: Text | null = null;

    while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
        if (textNode.nodeValue !== '') {
            lastTextNode = textNode;
        }
    }

    return lastTextNode;
}

/**
 * Makes a polite live region that already has text when it mounts announce that text.
 *
 * A region rendered with its message in the same frame is easy for a screen reader to miss — there is
 * no mutation to observe, only a new subtree. Appending an invisible word joiner right after the first
 * render is that mutation, and it is removed again once the announcement has had time to happen. Later
 * updates need no help: by then the region exists and its text really is changing (Base UI
 * `useInitialLiveRegionTextMutation`).
 *
 * No-op on iOS, whose VoiceOver announces the mounted text on its own, and on the server. Must be
 * called from an injection context; the host element is read after the first render, so content
 * projected into the region is already in place.
 */
export function useInitialLiveRegionText(host: () => HTMLElement | null): void {
    if (rdxPlatform.os.ios) {
        return;
    }

    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
        const root = host();
        const textNode = root ? findLastTextNode(root) : null;
        if (!textNode) {
            return;
        }

        const originalValue = textNode.data;
        const markedValue = `${originalValue}${LIVE_REGION_MARKER}`;
        textNode.nodeValue = markedValue;

        // Restore only if nothing else rewrote the node in the meantime.
        const restore = (): void => {
            if (textNode.nodeValue === markedValue) {
                textNode.nodeValue = originalValue;
            }
        };

        const timer = setTimeout(restore, RESET_DELAY);
        destroyRef.onDestroy(() => {
            clearTimeout(timer);
            restore();
        });
    });
}
