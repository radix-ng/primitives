export const menuClasses = {
    layout: 'fixed start-24 top-16 grid w-60 gap-3',
    trigger: 'border-border bg-background rounded border px-4 py-2',
    popup: 'border-border bg-popover text-popover-foreground grid w-60 gap-1 rounded border p-1 shadow-md outline-none',
    item: 'text-foreground rounded px-3 py-2 text-start outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50',
    outside: 'border-border border rounded px-3 py-2'
};

// A static Angular template fragment keeps the actual directives in their owning Root view.
// A wrapper component would change Angular query boundaries while a React function is transparent.
export const menuPopupTemplate = `
    <ng-template [keepMounted]="settings.keepMounted" rdxMenuPortal>
        <div class="z-50" [side]="settings.side" align="start" sideOffset="4" rdxMenuPositioner>
            <div [class]="s.popup" [id]="menu + '-popup'" [attr.data-testid]="menu + '-popup'" [attr.data-menu-popup]="menu" rdxMenuPopup>
                <button [class]="s.item" [attr.data-testid]="menu + '-alpha'" (onSelect)="trace.select(menu + '-alpha')" rdxMenuItem>Alpha</button>
                <button [class]="s.item" [attr.data-testid]="menu + '-blocked'" [disabled]="true" (onSelect)="trace.select(menu + '-blocked')" rdxMenuItem>Blocked</button>
                <button [class]="s.item" [attr.data-testid]="menu + '-bravo'" (onSelect)="trace.select(menu + '-bravo')" rdxMenuItem>Bravo</button>
            </div>
        </div>
    </ng-template>
`;
