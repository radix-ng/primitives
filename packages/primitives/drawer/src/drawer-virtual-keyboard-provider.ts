import { DestroyRef, Directive, ElementRef, effect, inject, untracked } from '@angular/core';
import { clamp } from '@radix-ng/primitives/core';
import { injectRdxDrawerRootContext } from './drawer-root';

const KEYBOARD_RESIZE_THRESHOLD = 60;
const KEYBOARD_VISIBILITY_MARGIN = 16;
const KEYBOARD_SCROLL_SLACK = 48;
const INPUT_TAP_MOVE_THRESHOLD = 10;
const INPUT_TAP_HIT_SLOP = 16;
const KEYBOARD_INPUT_TYPES = new Set(['email', 'number', 'password', 'search', 'tel', 'text', 'url']);

interface ScrollAdjustment {
    readonly element: HTMLElement;
    readonly overflowAnchor: string;
    readonly paddingBottom: string;
    readonly scrollPaddingBottom: string;
    readonly computedPaddingBottom: number;
    readonly computedScrollPaddingBottom: number;
}

interface KeyboardVisualViewport {
    readonly top: number;
    readonly bottom: number;
}

interface KeyboardTouchTarget {
    readonly focusTarget: HTMLElement;
    readonly clickTarget: HTMLElement;
}

const KEYBOARD_TAP_BLOCKED = Symbol('KeyboardTapBlocked');

/**
 * Provides mobile virtual-keyboard handling for bottom-sheet drawers with form fields.
 *
 * Put it on the drawer viewport that contains the popup. The directive writes
 * `--drawer-keyboard-inset` to the host, keeps the focused keyboard input visible when
 * `visualViewport` shrinks, adds temporary scroll slack to the nearest drawer scroller, and uses
 * synchronous tap-to-focus on touch devices so iOS opens the software keyboard reliably.
 */
@Directive({
    selector: '[rdxDrawerVirtualKeyboardProvider]',
    exportAs: 'rdxDrawerVirtualKeyboardProvider',
    host: {
        '(touchstart)': 'onTouchStart($event)',
        '(touchmove)': 'onTouchMove($event)',
        '(touchend)': 'onTouchEnd($event)',
        '(touchcancel)': 'resetTouchTrackingState()'
    }
})
export class RdxDrawerVirtualKeyboardProvider {
    private readonly drawerContext = injectRdxDrawerRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly element = this.elementRef.nativeElement;

    private pendingKeyboardFocusMoved = false;
    private keyboardTouchStart: { x: number; y: number } | null = null;
    private focusedKeyboardTarget: HTMLElement | null = null;
    private keyboardScrollAdjustment: ScrollAdjustment | null = null;
    private keyboardFocusFrame = 0;

    constructor() {
        effect((onCleanup) => {
            const open = this.drawerContext.open();
            const nestedDrawerOpen = this.drawerContext.nestedDrawerOpen();

            if (!open || nestedDrawerOpen) {
                untracked(() => this.clearFocusedKeyboardTarget());
                return;
            }

            const doc = this.element.ownerDocument;
            const win = doc.defaultView;
            if (!win) {
                return;
            }

            const handleFocusIn = (event: FocusEvent) => {
                if (this.captureFocusedKeyboardTarget(event.target)) {
                    this.scheduleKeyboardFocusAlignment();
                }
            };

            const handleFocusOut = (event: FocusEvent) => {
                if (this.captureFocusedKeyboardTarget(event.relatedTarget)) {
                    this.scheduleKeyboardFocusAlignment();
                    return;
                }

                this.clearFocusedKeyboardTarget();
            };

            const handleViewportUpdate = () => {
                if (this.focusedKeyboardTarget || this.captureFocusedKeyboardTarget(doc.activeElement)) {
                    this.scheduleKeyboardFocusAlignment();
                }
            };

            const visualViewport = win.visualViewport;

            doc.addEventListener('focusin', handleFocusIn, true);
            doc.addEventListener('focusout', handleFocusOut, true);
            visualViewport?.addEventListener('resize', handleViewportUpdate);
            visualViewport?.addEventListener('scroll', handleViewportUpdate);

            if (this.captureFocusedKeyboardTarget(doc.activeElement)) {
                this.scheduleKeyboardFocusAlignment();
            }

            onCleanup(() => {
                doc.removeEventListener('focusin', handleFocusIn, true);
                doc.removeEventListener('focusout', handleFocusOut, true);
                visualViewport?.removeEventListener('resize', handleViewportUpdate);
                visualViewport?.removeEventListener('scroll', handleViewportUpdate);
                this.clearFocusedKeyboardTarget();
                this.element.style.removeProperty('--drawer-keyboard-inset');
            });
        });

        this.destroyRef.onDestroy(() => {
            this.cancelKeyboardFocusFrame();
            this.restoreKeyboardScrollAdjustment();
            this.element.style.removeProperty('--drawer-keyboard-inset');
        });
    }

    protected onTouchStart(event: TouchEvent): void {
        if (!this.drawerContext.open() || this.drawerContext.nestedDrawerOpen()) {
            this.resetTouchTrackingState();
            return;
        }

        const touch = event.touches[0];
        if (!touch) {
            return;
        }

        this.pendingKeyboardFocusMoved = false;
        this.keyboardTouchStart = { x: touch.clientX, y: touch.clientY };
    }

    protected onTouchMove(event: TouchEvent): void {
        const touch = event.touches[0];
        const touchStart = this.keyboardTouchStart;

        if (!touch || !touchStart || this.pendingKeyboardFocusMoved) {
            return;
        }

        if (
            Math.abs(touch.clientX - touchStart.x) > INPUT_TAP_MOVE_THRESHOLD ||
            Math.abs(touch.clientY - touchStart.y) > INPUT_TAP_MOVE_THRESHOLD
        ) {
            this.pendingKeyboardFocusMoved = true;
        }
    }

    protected onTouchEnd(event: TouchEvent): void {
        if (
            !this.drawerContext.open() ||
            this.drawerContext.nestedDrawerOpen() ||
            !this.keyboardTouchStart ||
            this.pendingKeyboardFocusMoved
        ) {
            this.resetTouchTrackingState();
            return;
        }

        const touch = event.changedTouches[0] ?? event.touches[0];
        const doc = this.element.ownerDocument;
        const nativeEventTarget = event.target;
        const pointTarget = touch ? resolveKeyboardTouchTargetFromPoint(doc, touch.clientX, touch.clientY) : null;

        if (pointTarget === KEYBOARD_TAP_BLOCKED) {
            this.resetTouchTrackingState();
            return;
        }

        const keyboardTarget = touch && (pointTarget ?? resolveKeyboardTouchTarget(nativeEventTarget));

        if (
            keyboardTarget &&
            (!this.element.contains(keyboardTarget.focusTarget) || !this.element.contains(keyboardTarget.clickTarget))
        ) {
            this.resetTouchTrackingState();
            return;
        }

        if (!keyboardTarget || !touch) {
            this.resetTouchTrackingState();
            return;
        }

        const win = keyboardTarget.focusTarget.ownerDocument.defaultView;
        if (!win || (win.visualViewport && win.visualViewport.scale !== 1)) {
            this.resetTouchTrackingState();
            return;
        }

        if (doc.activeElement === keyboardTarget.focusTarget && isKeyboardVisualViewportOpen(win)) {
            this.resetTouchTrackingState();
            return;
        }

        event.preventDefault();
        focusKeyboardInputWithoutPageScroll(keyboardTarget.focusTarget);
        dispatchKeyboardClick(keyboardTarget.clickTarget, touch);
        this.resetTouchTrackingState();
    }

    protected resetTouchTrackingState(): void {
        this.pendingKeyboardFocusMoved = false;
        this.keyboardTouchStart = null;
    }

    private captureFocusedKeyboardTarget(eventTarget: EventTarget | null): boolean {
        if (this.drawerContext.nestedDrawerOpen()) {
            return false;
        }

        const target = resolveKeyboardInputTarget(eventTarget);
        if (!target || !this.element.contains(target)) {
            return false;
        }

        this.focusedKeyboardTarget = target;
        return true;
    }

    private alignFocusedKeyboardTarget(): void {
        const target = this.focusedKeyboardTarget;
        const win = this.element.ownerDocument.defaultView;

        if (!win || this.drawerContext.nestedDrawerOpen() || !target || !this.element.contains(target)) {
            this.resetDrawerKeyboardInset();
            this.restoreKeyboardScrollAdjustment();
            return;
        }

        const keyboardViewport = getKeyboardVisualViewport(win);
        if (!keyboardViewport) {
            this.resetDrawerKeyboardInset();
            this.restoreKeyboardScrollAdjustment();
            return;
        }

        this.setDrawerKeyboardInset(getDrawerKeyboardInset(win, keyboardViewport));

        const scrollTarget = findKeyboardScrollTarget(target, this.element);
        if (!scrollTarget || !scrollTarget.isConnected || !this.element.contains(scrollTarget)) {
            this.restoreKeyboardScrollAdjustment();
            return;
        }

        const scrollTargetRect = scrollTarget.getBoundingClientRect();
        const clippedBottom = Math.min(scrollTargetRect.bottom, keyboardViewport.bottom);
        const overlap = Math.max(0, scrollTargetRect.bottom - keyboardViewport.bottom);
        this.setKeyboardScrollSlack(scrollTarget, overlap > 0 ? overlap + KEYBOARD_SCROLL_SLACK : 0);

        const maxScrollTop = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
        if (maxScrollTop <= 0) {
            return;
        }

        const clippedTop = Math.max(scrollTargetRect.top, keyboardViewport.top);
        const visibleTop = clippedTop + KEYBOARD_VISIBILITY_MARGIN;
        const visibleBottom = clippedBottom - KEYBOARD_VISIBILITY_MARGIN;
        if (visibleBottom <= visibleTop) {
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const targetCenter = (targetRect.top + targetRect.bottom) / 2;
        const visibleCenter = (visibleTop + visibleBottom) / 2;
        const nextScrollTop = scrollTarget.scrollTop + targetCenter - visibleCenter;

        scrollTarget.scrollTo({
            top: clamp(nextScrollTop, 0, maxScrollTop),
            behavior: prefersReducedMotion(win) ? 'auto' : 'smooth'
        });
    }

    private scheduleKeyboardFocusAlignment(): void {
        this.cancelKeyboardFocusFrame();
        this.keyboardFocusFrame = requestAnimationFrame(() => {
            this.keyboardFocusFrame = 0;
            this.alignFocusedKeyboardTarget();
        });
    }

    private cancelKeyboardFocusFrame(): void {
        if (this.keyboardFocusFrame) {
            cancelAnimationFrame(this.keyboardFocusFrame);
            this.keyboardFocusFrame = 0;
        }
    }

    private clearFocusedKeyboardTarget(): void {
        this.focusedKeyboardTarget = null;
        this.resetDrawerKeyboardInset();
        this.restoreKeyboardScrollAdjustment();
        this.cancelKeyboardFocusFrame();
    }

    private setDrawerKeyboardInset(inset: number): void {
        this.element.style.setProperty('--drawer-keyboard-inset', `${Math.max(0, Math.ceil(inset))}px`);
    }

    private resetDrawerKeyboardInset(): void {
        this.setDrawerKeyboardInset(0);
    }

    private setKeyboardScrollSlack(element: HTMLElement, slack: number): void {
        const roundedSlack = Math.max(0, Math.ceil(slack));
        let adjustment = this.keyboardScrollAdjustment;

        if (adjustment && !adjustment.element.isConnected) {
            this.restoreKeyboardScrollAdjustment();
            adjustment = null;
        }

        if (roundedSlack === 0) {
            this.restoreKeyboardScrollAdjustment();
            return;
        }

        if (adjustment && adjustment.element !== element) {
            this.restoreKeyboardScrollAdjustment();
            adjustment = null;
        }

        if (!adjustment) {
            const styles = getComputedStyle(element);
            adjustment = {
                element,
                overflowAnchor: element.style.overflowAnchor,
                paddingBottom: element.style.paddingBottom,
                scrollPaddingBottom: element.style.scrollPaddingBottom,
                computedPaddingBottom: Number.parseFloat(styles.paddingBottom) || 0,
                computedScrollPaddingBottom: Number.parseFloat(styles.scrollPaddingBottom) || 0
            };
            this.keyboardScrollAdjustment = adjustment;
        }

        element.style.overflowAnchor = 'none';
        element.style.paddingBottom = `${adjustment.computedPaddingBottom + roundedSlack}px`;
        element.style.scrollPaddingBottom = `${adjustment.computedScrollPaddingBottom + KEYBOARD_VISIBILITY_MARGIN}px`;
    }

    private restoreKeyboardScrollAdjustment(): void {
        const adjustment = this.keyboardScrollAdjustment;
        if (!adjustment) {
            return;
        }

        adjustment.element.style.overflowAnchor = adjustment.overflowAnchor;
        adjustment.element.style.paddingBottom = adjustment.paddingBottom;
        adjustment.element.style.scrollPaddingBottom = adjustment.scrollPaddingBottom;
        this.keyboardScrollAdjustment = null;
    }
}

function isHTMLElement(target: EventTarget | null): target is HTMLElement {
    return target instanceof HTMLElement;
}

function isKeyboardInputElement(element: HTMLElement): boolean {
    if (element.isContentEditable) {
        return true;
    }

    if (element instanceof HTMLTextAreaElement) {
        return !element.matches(':disabled');
    }

    if (element instanceof HTMLInputElement && KEYBOARD_INPUT_TYPES.has(element.type)) {
        return !element.matches(':disabled');
    }

    return false;
}

function resolveKeyboardInputTarget(target: EventTarget | null): HTMLElement | null {
    if (!isHTMLElement(target)) {
        return null;
    }

    if (isKeyboardInputElement(target)) {
        return target.isContentEditable ? getContentEditableHost(target) : target;
    }

    const label = target.closest('label') as HTMLLabelElement | null;
    const control = label?.control ?? null;

    return isHTMLElement(control) && isKeyboardInputElement(control) ? control : null;
}

function resolveKeyboardTouchTarget(target: EventTarget | null): KeyboardTouchTarget | null {
    const focusTarget = resolveKeyboardInputTarget(target);
    if (!focusTarget) {
        return null;
    }

    return {
        focusTarget,
        clickTarget: isHTMLElement(target) ? target : focusTarget
    };
}

function getContentEditableHost(element: HTMLElement): HTMLElement {
    let host = element;
    while (host.parentElement?.isContentEditable) {
        host = host.parentElement;
    }
    return host;
}

function resolveKeyboardTouchTargetFromPoint(
    doc: Document,
    clientX: number,
    clientY: number
): KeyboardTouchTarget | typeof KEYBOARD_TAP_BLOCKED | null {
    const exactTarget = doc.elementFromPoint(clientX, clientY);
    const exactKeyboardTarget = resolveKeyboardInputTarget(exactTarget);
    if (exactKeyboardTarget) {
        return {
            focusTarget: exactKeyboardTarget,
            clickTarget: isHTMLElement(exactTarget) ? exactTarget : exactKeyboardTarget
        };
    }

    if (isInteractiveElement(exactTarget) || exactTarget?.closest('label') != null) {
        return KEYBOARD_TAP_BLOCKED;
    }

    for (const [offsetX, offsetY] of [
        [0, INPUT_TAP_HIT_SLOP],
        [0, -INPUT_TAP_HIT_SLOP],
        [INPUT_TAP_HIT_SLOP, 0],
        [-INPUT_TAP_HIT_SLOP, 0]
    ]) {
        const keyboardTarget = resolveKeyboardInputTarget(doc.elementFromPoint(clientX + offsetX, clientY + offsetY));

        if (keyboardTarget) {
            return {
                focusTarget: keyboardTarget,
                clickTarget: keyboardTarget
            };
        }
    }

    return null;
}

function isInteractiveElement(element: Element | null): boolean {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    return (
        element.isContentEditable ||
        element.matches(
            'a[href],button,input,select,textarea,summary,[role="button"],[role="checkbox"],[role="radio"],[role="switch"],[tabindex]:not([tabindex="-1"])'
        )
    );
}

function dispatchKeyboardClick(target: HTMLElement, touch: Pick<Touch, 'clientX' | 'clientY'>): void {
    const win = target.ownerDocument.defaultView;
    if (!win) {
        return;
    }

    const ClickEvent = win.PointerEvent ?? win.MouseEvent;
    target.dispatchEvent(
        new ClickEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            detail: 1,
            view: win
        })
    );
}

function focusKeyboardInputWithoutPageScroll(target: HTMLElement): void {
    const wasFocused = target.ownerDocument.activeElement === target;
    const previousOpacity = target.style.opacity;
    const previousTransform = target.style.transform;
    const previousTransition = target.style.transition;

    target.style.transition = 'none';
    target.style.opacity = '0';
    target.style.transform = 'translateY(-2000px)';
    try {
        if (wasFocused) {
            target.blur();
        }
        target.focus({ preventScroll: true });
    } finally {
        target.style.opacity = previousOpacity;
        target.style.transform = previousTransform;
        target.style.transition = previousTransition;
    }
}

function findKeyboardScrollTarget(target: HTMLElement, root: HTMLElement): HTMLElement | null {
    let node: Node | null = target.parentNode;

    while (node) {
        if (node instanceof HTMLElement && isKeyboardScrollable(node)) {
            return node;
        }

        if (node === root) {
            break;
        }

        node = node.parentNode;
    }

    return null;
}

function isKeyboardScrollable(element: HTMLElement): boolean {
    const overflowY = getComputedStyle(element).overflowY;
    return (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && element.scrollHeight > 0;
}

function getKeyboardVisualViewport(win: Window): KeyboardVisualViewport | null {
    const visualViewport = win.visualViewport;

    if (!visualViewport || visualViewport.scale !== 1) {
        return null;
    }

    const reducedHeight = win.innerHeight - visualViewport.height;
    if (reducedHeight <= KEYBOARD_RESIZE_THRESHOLD) {
        return null;
    }

    const top = Math.max(0, visualViewport.offsetTop);
    return {
        top,
        bottom: Math.min(win.innerHeight, top + visualViewport.height)
    };
}

function getDrawerKeyboardInset(win: Window, keyboardViewport: KeyboardVisualViewport): number {
    return Math.max(0, win.innerHeight - keyboardViewport.bottom);
}

function isKeyboardVisualViewportOpen(win: Window): boolean {
    return !win.visualViewport || getKeyboardVisualViewport(win) !== null;
}

function prefersReducedMotion(win: Window): boolean {
    return !!win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}
