import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger, MENU_TRIGGER, PARENT_OR_NEW_MENU_STACK_PROVIDER } from '@angular/cdk/menu';
import { ConnectedPosition, OverlayRef, VerticalConnectionPos } from '@angular/cdk/overlay';
import {
    booleanAttribute,
    Directive,
    Input,
    input,
    numberAttribute,
    TemplateRef
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

export enum DropdownSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum DropdownAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export const mapRdxAlignToCdkPosition = {
    start: 'top',
    center: 'center',
    end: 'bottom'
};

const dropdownPositions: Record<DropdownSide, ConnectedPosition> = {
    top: {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetX: 0,
        offsetY: 0
    },
    right: {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    },
    bottom: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    },
    left: {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    }
};

@Directive({
    selector: '[rdxDropdownMenuTrigger]',
    standalone: true,
    host: {
        type: 'button',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.data-state]': "isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[disabled]': 'disabled()',

        '(pointerdown)': 'onPointerDown($event)'
    },
    providers: [
        { provide: CdkMenuTrigger, useExisting: RdxDropdownMenuTriggerDirective },
        { provide: MENU_TRIGGER, useExisting: CdkMenuTrigger },
        PARENT_OR_NEW_MENU_STACK_PROVIDER
    ]
})
export class RdxDropdownMenuTriggerDirective extends CdkMenuTrigger {
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    @Input()
    set rdxDropdownMenuTrigger(value: TemplateRef<unknown> | null) {
        this.menuTemplateRef = value;
    }

    @Input()
    set side(value: DropdownSide) {
        if (!Object.values(DropdownSide).includes(value)) {
            throw new Error(`Unknown side: ${value}`);
        }

        this._side = value;

        this.menuPosition[0] = dropdownPositions[value];
    }

    get side() {
        return this._side;
    }

    private _side: DropdownSide = DropdownSide.Bottom;

    @Input()
    set align(value: DropdownAlign) {
        if (!Object.values(DropdownAlign).includes(value)) {
            throw new Error(`Unknown align: ${value}`);
        }

        this._align = value;

        if (this.isVertical) {
            this.defaultPosition.overlayX = this.defaultPosition.originX = value;
        } else {
            this.defaultPosition.overlayY = this.defaultPosition.originY = mapRdxAlignToCdkPosition[
                value
            ] as VerticalConnectionPos;
        }
    }

    get align() {
        return this._align;
    }

    private _align: DropdownAlign = DropdownAlign.Start;

    @Input({ transform: numberAttribute })
    set sideOffset(value: number) {
        // todo need invert value for top and left
        if (this.isVertical) {
            this.defaultPosition.offsetY = value;
        } else {
            this.defaultPosition.offsetX = value;
        }
    }

    @Input({ transform: numberAttribute })
    set alignOffset(value: number) {
        // todo need invert value for top and left
        if (this.isVertical) {
            this.defaultPosition.offsetX = value;
        } else {
            this.defaultPosition.offsetY = value;
        }
    }

    onOpenChange = outputFromObservable(this.opened);

    get isVertical(): boolean {
        return this._side === DropdownSide.Top || this._side === DropdownSide.Bottom;
    }

    get defaultPosition(): ConnectedPosition {
        return this.menuPosition[0];
    }

    constructor() {
        super();
        // todo priority
        this.menuPosition = [{ ...dropdownPositions[DropdownSide.Bottom] }];
    }

    onPointerDown($event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
            if (!this.isOpen()) {
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                $event.preventDefault();
            }
        }
    }

    getOverlayRef(): OverlayRef | null {
        return this.overlayRef;
    }
}
