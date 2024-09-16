import { CdkContextMenuTrigger, MENU_STACK, MENU_TRIGGER, MenuStack } from '@angular/cdk/menu';
import { ConnectedPosition, OverlayRef, VerticalConnectionPos } from '@angular/cdk/overlay';
import { Directive, Input, numberAttribute, TemplateRef } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

export enum ContextMenuSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum ContextMenuAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export const mapRdxAlignToCdkPosition = {
    start: 'top',
    center: 'center',
    end: 'bottom'
};

const ContextMenuPositions: Record<ContextMenuSide, ConnectedPosition> = {
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
    selector: '[rdxContextMenuTrigger]',
    standalone: true,
    host: {
        type: 'button',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.data-state]': "isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled ? '' : undefined",
        '[disabled]': 'disabled',

        '(contextmenu)': '_openOnContextMenu($event)'
    },
    providers: [
        { provide: MENU_TRIGGER, useExisting: RdxContextMenuTriggerDirective },
        { provide: MENU_STACK, useClass: MenuStack }
    ]
})
export class RdxContextMenuTriggerDirective extends CdkContextMenuTrigger {
    @Input()
    set rdxContextMenuTrigger(value: TemplateRef<unknown> | null) {
        this.menuTemplateRef = value;
    }

    @Input()
    set side(value: ContextMenuSide) {
        if (!Object.values(ContextMenuSide).includes(value)) {
            throw new Error(`Unknown side: ${value}`);
        }

        this._side = value;

        this.menuPosition[0] = ContextMenuPositions[value];
    }

    get side() {
        return this._side;
    }

    private _side: ContextMenuSide = ContextMenuSide.Bottom;

    @Input()
    set align(value: ContextMenuAlign) {
        if (!Object.values(ContextMenuAlign).includes(value)) {
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

    private _align: ContextMenuAlign = ContextMenuAlign.Start;

    @Input({ transform: numberAttribute })
    set sideOffset(value: number) {
        if (this.isVertical) {
            this.defaultPosition.offsetY = value;
        } else {
            this.defaultPosition.offsetX = value;
        }
    }

    @Input({ transform: numberAttribute })
    set alignOffset(value: number) {
        if (this.isVertical) {
            this.defaultPosition.offsetX = value;
        } else {
            this.defaultPosition.offsetY = value;
        }
    }

    onOpenChange = outputFromObservable(this.opened);

    get isVertical(): boolean {
        return this._side === ContextMenuSide.Top || this._side === ContextMenuSide.Bottom;
    }

    get defaultPosition(): ConnectedPosition {
        return this.menuPosition[0];
    }

    constructor() {
        super();
        this.menuPosition = [{ ...ContextMenuPositions[ContextMenuSide.Bottom] }];
    }

    getOverlayRef(): OverlayRef | null {
        return this.overlayRef;
    }
}
