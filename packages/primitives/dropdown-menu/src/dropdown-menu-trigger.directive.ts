import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition, VerticalConnectionPos } from '@angular/cdk/overlay';
import { booleanAttribute, Directive, inject, Input, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

enum DropdownSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

enum DropdownAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

const mapRdxAlignToCdkPosition = {
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
    selector: '[DropdownMenuTrigger]',
    standalone: true,
    hostDirectives: [
        {
            directive: CdkMenuTrigger,
            inputs: ['cdkMenuTriggerFor: DropdownMenuTrigger']
        }
    ],
    host: {
        type: 'button',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'cdkMenuTrigger.isOpen()',
        '[attr.data-state]': "cdkMenuTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[disabled]': 'disabled()',

        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxDropdownMenuTriggerDirective {
    protected readonly cdkMenuTrigger = inject(CdkMenuTrigger, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    @Input()
    set side(value: DropdownSide) {
        if (!Object.values(DropdownSide).includes(value)) {
            throw new Error(`Unknown side: ${value}`);
        }

        this._side = value;

        this.cdkMenuTrigger.menuPosition[0] = dropdownPositions[value];
    }

    private _side: DropdownSide = DropdownSide.Bottom;

    @Input()
    set align(value: DropdownAlign) {
        if (!Object.values(DropdownAlign).includes(value)) {
            throw new Error(`Unknown align: ${value}`);
        }

        if (this.isVertical) {
            this.defaultPosition.overlayX = this.defaultPosition.originX = value;
        } else {
            this.defaultPosition.overlayY = this.defaultPosition.originY = mapRdxAlignToCdkPosition[
                value
            ] as VerticalConnectionPos;
        }
    }

    @Input()
    set sideOffset(value: number) {
        // todo need invert value for top and left
        if (this.isVertical) {
            this.defaultPosition.offsetY = value;
        } else {
            this.defaultPosition.offsetX = value;
        }
    }

    @Input()
    set alignOffset(value: number) {
        // todo need invert value for top and left
        if (this.isVertical) {
            this.defaultPosition.offsetX = value;
        } else {
            this.defaultPosition.offsetY = value;
        }
    }

    /*
     * Event handler called when the open state of the dropdown menu changes.
     * // TODO: mv to RootMenuDropdown
     */

    get isVertical(): boolean {
        return this._side === DropdownSide.Top || this._side === DropdownSide.Bottom;
    }

    get defaultPosition(): ConnectedPosition {
        return this.cdkMenuTrigger.menuPosition[0];
    }

    onOpenChange = outputFromObservable(this.cdkMenuTrigger?.opened);

    constructor() {
        // todo priority
        this.cdkMenuTrigger.menuPosition = [
            { ...dropdownPositions[DropdownSide.Bottom] }];
    }

    onPointerDown($event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
            if (!this.cdkMenuTrigger.isOpen()) {
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                $event.preventDefault();
            }
        }
    }
}
