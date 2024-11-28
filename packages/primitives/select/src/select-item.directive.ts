import { Highlightable } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RdxSelectContentDirective } from './select-content.directive';
import { RdxSelectComponent } from './select.component';

let nextId = 0;

export class RdxSelectItemChange<T = RdxSelectItemDirective> {
    constructor(public source: T) {}
}

@Directive({
    selector: '[rdxSelectItem]',
    standalone: true,
    exportAs: 'rdxSelectItem',
    host: {
        '[attr.role]': '"option"',
        '[attr.data-state]': 'dataState',
        '[attr.aria-selected]': 'selected',
        '[attr.data-disabled]': 'disabled || null',
        '[attr.data-highlighted]': 'highlighted || null',
        '[attr.tabindex]': '-1',
        '(focus)': 'content.highlighted.next(this)',
        '(click)': 'selectViaInteraction()',
        '(keydown)': 'handleKeydown($event)',
        '(pointermove)': 'onPointerMove()'
    }
})
export class RdxSelectItemDirective implements Highlightable {
    protected readonly root = inject(RdxSelectComponent);
    protected readonly content = inject(RdxSelectContentDirective);
    readonly onSelectionChange = new EventEmitter<RdxSelectItemChange>();
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    highlighted: boolean = false;

    get dataState(): string {
        return this.selected ? 'checked' : 'unchecked';
    }

    /**
     * The unique SelectItem id.
     * @ignore
     */
    readonly id: string = `rdx-select-item-${nextId++}`;

    @Input()
    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    @Input() textValue: string | null = null;

    /** Whether the SelectItem is disabled. */
    @Input({ transform: booleanAttribute })
    set disabled(value: boolean) {
        this._disabled = value;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    private _disabled: boolean;

    selected: boolean;

    get viewValue(): string {
        return this.textValue ?? this.nativeElement.textContent;
    }

    constructor() {
        this.content.highlighted.pipe(takeUntilDestroyed()).subscribe((value) => {
            if (value !== this) {
                this.highlighted = false;
            }
        });
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.value;
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    selectViaInteraction(): void {
        if (!this.disabled) {
            this.selected = true;

            this.onSelectionChange.emit(new RdxSelectItemChange(this));
        }
    }

    handleKeydown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
            event.stopPropagation();
        }
    }

    setActiveStyles(): void {
        this.highlighted = true;
        this.nativeElement.focus({ preventScroll: true });
    }

    setInactiveStyles(): void {
        this.highlighted = false;
    }

    protected onPointerMove(): void {
        if (!this.highlighted) {
            this.nativeElement.focus({ preventScroll: true });
            this.root.updateActiveItem(this);
        }
    }
}
