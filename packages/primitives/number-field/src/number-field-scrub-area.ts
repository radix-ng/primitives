import { computed, Directive, effect, ElementRef, inject, input, numberAttribute, signal } from '@angular/core';
import { NumberInput } from '@radix-ng/primitives/core';
import { injectNumberFieldRootContext } from './number-field-context';
import { provideNumberFieldScrubAreaContext, RdxNumberFieldScrubAreaContext } from './number-field-scrub-area-context';
import { numberOrUndefined } from './number-field.utils';

type ScrubDirection = 'horizontal' | 'vertical';

function isWebKitBrowser(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        /AppleWebKit/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent)
    );
}

function isFirefoxBrowser(): boolean {
    return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}

/** Calculates the viewport rect the virtual cursor loops within. */
function getViewportRect(teleportDistance: number | undefined, scrubAreaEl: HTMLElement) {
    const win = scrubAreaEl.ownerDocument.defaultView ?? window;
    const rect = scrubAreaEl.getBoundingClientRect();

    if (rect && teleportDistance != null) {
        return {
            x: rect.left - teleportDistance / 2,
            y: rect.top - teleportDistance / 2,
            width: rect.right + teleportDistance / 2,
            height: rect.bottom + teleportDistance / 2
        };
    }

    const vV = win.visualViewport;
    if (vV) {
        return { x: vV.offsetLeft, y: vV.offsetTop, width: vV.offsetLeft + vV.width, height: vV.offsetTop + vV.height };
    }

    return {
        x: 0,
        y: 0,
        width: win.document.documentElement.clientWidth,
        height: win.document.documentElement.clientHeight
    };
}

/**
 * An interactive area where the user can click and drag to change the field value.
 * Uses the Pointer Lock API for continuous dragging (disabled in Safari to avoid layout shift).
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: '[rdxNumberFieldScrubArea]',
    exportAs: 'rdxNumberFieldScrubArea',
    providers: [provideNumberFieldScrubAreaContext(() => inject(RdxNumberFieldScrubArea).context)],
    host: {
        role: 'presentation',
        '[style.touch-action]': '"none"',
        '[style.user-select]': '"none"',
        '[style.-webkit-user-select]': '"none"',
        '[attr.data-disabled]': 'rootContext.isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-scrubbing]': 'isScrubbing() ? "" : undefined',
        '(pointerdown)': 'onPointerDown($event)',
        '(touchstart)': 'onTouchStart($event)'
    }
})
export class RdxNumberFieldScrubArea {
    protected readonly rootContext = injectNumberFieldRootContext();

    /**
     * The direction the cursor must move to change the value.
     * @default 'horizontal'
     */
    readonly direction = input<ScrubDirection>('horizontal');

    /**
     * How many pixels the cursor must move before the value changes. Higher is less sensitive.
     * @default 2
     */
    readonly pixelSensitivity = input<number, NumberInput>(2, { transform: numberAttribute });

    /**
     * If set, the distance the cursor may move from the scrub area center before it loops back.
     */
    readonly teleportDistance = input<number | undefined, NumberInput>(undefined, { transform: numberOrUndefined });

    protected readonly isScrubbing = signal(false);
    private readonly isTouchInput = signal(false);
    private readonly isPointerLockDenied = signal(false);
    private readonly cursorEl = signal<HTMLElement | null>(null);

    private readonly scrubAreaEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    private isScrubbingRef = false;
    private didMove = false;
    private pointerDownTarget: EventTarget | null = null;
    private virtualCursorCoords = { x: 0, y: 0 };
    private visualScale = 1;

    /** @ignore Exposed to the scrub-area context provider. */
    readonly context: RdxNumberFieldScrubAreaContext = {
        isScrubbing: this.isScrubbing.asReadonly(),
        isTouchInput: this.isTouchInput.asReadonly(),
        isPointerLockDenied: this.isPointerLockDenied.asReadonly(),
        registerCursor: (el) => this.cursorEl.set(el)
    };

    private readonly canScrub = computed(() => !this.rootContext.isDisabled() && !this.rootContext.readonly());

    constructor() {
        const root = this.rootContext;

        // Register global listeners only while actively scrubbing.
        effect((onCleanup) => {
            if (!root.inputEl() || !this.canScrub() || !this.isScrubbing()) {
                return;
            }

            let cumulativeDelta = 0;

            const handlePointerMove = (event: PointerEvent) => {
                if (!this.isScrubbingRef) {
                    return;
                }
                event.preventDefault();
                this.onScrub(event);

                const { movementX, movementY } = event;
                cumulativeDelta += this.direction() === 'vertical' ? movementY : movementX;

                if (Math.abs(cumulativeDelta) >= this.pixelSensitivity()) {
                    cumulativeDelta = 0;
                    this.didMove = true;
                    const dValue = this.direction() === 'vertical' ? -movementY : movementX;
                    const stepAmount = root.getStepAmount(event);
                    const rawAmount = dValue * stepAmount;

                    if (rawAmount !== 0) {
                        root.allowInputSync = true;
                        root.incrementValue(Math.abs(rawAmount), {
                            direction: rawAmount >= 0 ? 1 : -1,
                            event,
                            reason: 'scrub'
                        });
                    }
                }
            };

            const handlePointerUp = (event: PointerEvent) => {
                const finish = () => {
                    try {
                        this.scrubAreaEl.ownerDocument.exitPointerLock();
                    } catch {
                        // Ignore — pointer lock may not be active.
                    }
                    this.isScrubbingRef = false;
                    this.onScrubbingChange(false, event);
                    root.commitValue(root.lastChangedValue ?? root.currentValue());

                    // Manually dispatch a click when no movement happened, since preventDefault on
                    // pointerdown suppresses the browser's synthetic click.
                    if (!this.didMove && this.pointerDownTarget && root.inputEl()) {
                        this.pointerDownTarget.dispatchEvent(
                            new MouseEvent('click', { bubbles: true, cancelable: true })
                        );
                    }

                    this.didMove = false;
                    this.pointerDownTarget = null;
                };

                if (isFirefoxBrowser()) {
                    // Firefox needs a small delay or pointer lock won't release on a soft click.
                    setTimeout(finish, 20);
                } else {
                    finish();
                }
            };

            const win = this.scrubAreaEl.ownerDocument.defaultView ?? window;
            const vV = win.visualViewport;
            const handleVisualResize = () => {
                if (vV) {
                    this.visualScale = vV.scale;
                }
            };
            handleVisualResize();

            win.addEventListener('pointermove', handlePointerMove, true);
            win.addEventListener('pointerup', handlePointerUp, true);
            win.addEventListener('pointercancel', handlePointerUp, true);
            vV?.addEventListener('resize', handleVisualResize);

            onCleanup(() => {
                win.removeEventListener('pointermove', handlePointerMove, true);
                win.removeEventListener('pointerup', handlePointerUp, true);
                win.removeEventListener('pointercancel', handlePointerUp, true);
                vV?.removeEventListener('resize', handleVisualResize);
            });
        });
    }

    async onPointerDown(event: PointerEvent): Promise<void> {
        const isMainButton = !event.button || event.button === 0;
        if (event.defaultPrevented || !isMainButton || !this.canScrub()) {
            return;
        }

        const isTouch = event.pointerType === 'touch';
        this.isTouchInput.set(isTouch);

        if (event.pointerType === 'mouse') {
            event.preventDefault();
            this.rootContext.inputEl()?.focus();
        }

        this.isScrubbingRef = true;
        this.didMove = false;
        this.pointerDownTarget = event.target;
        this.onScrubbingChange(true, event);

        // WebKit causes significant layout shift with the native pointer-lock message.
        if (!isTouch && !isWebKitBrowser()) {
            try {
                await this.scrubAreaEl.ownerDocument.body.requestPointerLock();
                this.isPointerLockDenied.set(false);
            } catch {
                this.isPointerLockDenied.set(true);
            } finally {
                if (this.isScrubbingRef) {
                    this.onScrubbingChange(true, event);
                }
            }
        }
    }

    onTouchStart(event: TouchEvent): void {
        if (!this.canScrub()) {
            return;
        }
        // Prevent scrolling using touch input when scrubbing.
        if (event.touches.length === 1) {
            event.preventDefault();
        }
    }

    private onScrub(event: PointerEvent): void {
        const cursor = this.cursorEl();
        if (!cursor) {
            return;
        }

        const rect = getViewportRect(this.teleportDistance(), this.scrubAreaEl);
        const coords = this.virtualCursorCoords;
        const newCoords = { x: Math.round(coords.x + event.movementX), y: Math.round(coords.y + event.movementY) };

        const cursorWidth = cursor.offsetWidth;
        const cursorHeight = cursor.offsetHeight;

        if (newCoords.x + cursorWidth / 2 < rect.x) {
            newCoords.x = rect.width - cursorWidth / 2;
        } else if (newCoords.x + cursorWidth / 2 > rect.width) {
            newCoords.x = rect.x - cursorWidth / 2;
        }

        if (newCoords.y + cursorHeight / 2 < rect.y) {
            newCoords.y = rect.height - cursorHeight / 2;
        } else if (newCoords.y + cursorHeight / 2 > rect.height) {
            newCoords.y = rect.y - cursorHeight / 2;
        }

        this.virtualCursorCoords = newCoords;
        this.updateCursorTransform(newCoords.x, newCoords.y);
    }

    private onScrubbingChange(scrubbing: boolean, event: PointerEvent): void {
        this.isScrubbing.set(scrubbing);
        this.rootContext.isScrubbing.set(scrubbing);

        const cursor = this.cursorEl();
        if (!cursor || !scrubbing) {
            return;
        }

        const initialCoords = {
            x: event.clientX - cursor.offsetWidth / 2,
            y: event.clientY - cursor.offsetHeight / 2
        };
        this.virtualCursorCoords = initialCoords;
        this.updateCursorTransform(initialCoords.x, initialCoords.y);
    }

    private updateCursorTransform(x: number, y: number): void {
        const cursor = this.cursorEl();
        if (cursor) {
            cursor.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / this.visualScale})`;
        }
    }
}
