import { Directive, Input } from '@angular/core';

interface PresenceProps {
    present: boolean;
}

@Directive({
    selector: 'Presence, [Presence]',
    exportAs: 'Presence',
    standalone: true
})
export class RdxPresenceDirective implements PresenceProps {
    @Input({ required: true }) present = false;

    @Input() mount = false;
    @Input() unmount = false;
}
