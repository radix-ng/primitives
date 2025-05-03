import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    Injectable,
    input,
    OnInit,
    Signal,
    signal
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { injectNumberFieldRootContext } from './number-field-context.token';

@Injectable()
export class PressedHoldService {
    private destroyRef = inject(DestroyRef);

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

@Directive({
    selector: 'button[rdxNumberFieldIncrement]',
    providers: [PressedHoldService],
    host: {
        tabindex: '-1',
        type: '"button"',
        '[attr.aria-label]': '"Increase"',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-pressed]': 'useHold.isPressed() ? "true" : undefined',

        '[style.user-select]': 'useHold.isPressed() ? "none" : null',

        '(contextmenu)': '$event.preventDefault()'
    }
})
export class RdxNumberFieldIncrementDirective implements OnInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private pressedHold = inject(PressedHoldService);

    protected readonly rootContext = injectNumberFieldRootContext();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isDisabled = computed(
        () => this.rootContext.disabled() || this.disabled() || this.rootContext.isIncreaseDisabled()
    );

    useHold = this.pressedHold.create({
        target: signal(this.elementRef.nativeElement),
        disabled: this.disabled
    });

    ngOnInit() {
        this.useHold.onTrigger(() => this.rootContext.handleIncrease());
    }
}
