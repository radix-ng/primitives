import { FocusableOption } from '@angular/cdk/a11y';

export enum RdxNavigationMenuAnimationStatus {
    OPEN_STARTED = 'open_started',
    OPEN_ENDED = 'open_ended',
    CLOSED_STARTED = 'closed_started',
    CLOSED_ENDED = 'closed_ended'
}

/**
 * A stub class solely used to query a single type of focusable element in the navigation menu.
 */
export abstract class RdxNavigationMenuFocusableOption implements FocusableOption {
    focus(): void {
        throw new Error('Method not implemented.');
    }
}
