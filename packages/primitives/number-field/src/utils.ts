import { computed, DestroyRef, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { NumberFormatter, NumberParser } from '@internationalized/number';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class PressedHoldService {
    private readonly destroyRef = inject(DestroyRef);

    create(options: { target?: Signal<HTMLElement | undefined>; disabled: Signal<boolean> }) {
        const timeout = signal<number | undefined>(undefined);
        const triggerHook = new Subject<void>();
        const isPressed = signal(false);

        const resetTimeout = () => {
            const timer = timeout();
            if (timer !== undefined) {
                window.clearTimeout(timer);
                timeout.set(undefined);
            }
        };

        const onIncrementPressStart = (delay: number) => {
            resetTimeout();
            if (options.disabled()) return;

            triggerHook.next();

            timeout.set(
                window.setTimeout(() => {
                    onIncrementPressStart(60);
                }, delay)
            );
        };

        const onPressStart = (event: PointerEvent) => {
            if (event.button !== 0 || isPressed()) return;
            event.preventDefault();
            isPressed.set(true);
            onIncrementPressStart(400);
        };

        const onPressRelease = () => {
            isPressed.set(false);
            resetTimeout();
        };

        effect(() => {
            // Skip SSR environments
            if (typeof window === 'undefined') return;

            const targetElement = options.target?.() || window;
            const destroy$ = new Subject<void>();

            const pointerDownSub = fromEvent(targetElement, 'pointerdown')
                .pipe(takeUntil(destroy$))
                .subscribe((e) => onPressStart(e as PointerEvent));

            const pointerUpSub = fromEvent(window, 'pointerup').pipe(takeUntil(destroy$)).subscribe(onPressRelease);

            const pointerCancelSub = fromEvent(window, 'pointercancel')
                .pipe(takeUntil(destroy$))
                .subscribe(onPressRelease);

            this.destroyRef.onDestroy(() => {
                destroy$.next();
                destroy$.complete();
                pointerDownSub.unsubscribe();
                pointerUpSub.unsubscribe();
                pointerCancelSub.unsubscribe();
            });
        });

        return {
            isPressed: isPressed.asReadonly(),
            onTrigger: (fn: () => void) => {
                const sub = triggerHook.subscribe(fn);
                this.destroyRef.onDestroy(() => sub.unsubscribe());
            }
        };
    }
}

export function useNumberFormatter(
    locale: Signal<string>,
    options: Signal<Intl.NumberFormatOptions | undefined> = signal({})
): Signal<NumberFormatter> {
    return computed(() => new NumberFormatter(locale(), options()));
}

export function useNumberParser(
    locale: Signal<string>,
    options: Signal<Intl.NumberFormatOptions | undefined> = signal({})
): Signal<NumberParser> {
    return computed(() => new NumberParser(locale(), options()));
}

export function handleDecimalOperation(operator: '-' | '+', value1: number, value2: number): number {
    let result = operator === '+' ? value1 + value2 : value1 - value2;

    // Check if we have decimals
    if (value1 % 1 !== 0 || value2 % 1 !== 0) {
        const value1Decimal = value1.toString().split('.');
        const value2Decimal = value2.toString().split('.');
        const value1DecimalLength = (value1Decimal[1] && value1Decimal[1].length) || 0;
        const value2DecimalLength = (value2Decimal[1] && value2Decimal[1].length) || 0;
        const multiplier = 10 ** Math.max(value1DecimalLength, value2DecimalLength);

        // Transform the decimals to integers based on the precision
        value1 = Math.round(value1 * multiplier);
        value2 = Math.round(value2 * multiplier);

        // Perform the operation on integers values to make sure we don't get a fancy decimal value
        result = operator === '+' ? value1 + value2 : value1 - value2;

        // Transform the integer result back to decimal
        result /= multiplier;
    }

    return result;
}
