import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmailForm } from './email-form';
import { MenuDialog } from './menu-dialog';
import { SelectDialog } from './select-dialog';
import { TabsTask } from './tabs';

@Component({
    selector: 'app-root',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EmailForm, SelectDialog, MenuDialog, TabsTask],
    template: `
        <main>
            <h1>Radix NG consumer integration</h1>
            <section aria-label="Email form">
                <h2>Email form</h2>
                <consumer-email-form />
            </section>
            <section aria-label="Select inside Dialog">
                <h2>Select inside Dialog</h2>
                <consumer-select-dialog />
            </section>
            <section aria-label="Dialog from Menu">
                <h2>Dialog from Menu</h2>
                <consumer-menu-dialog />
            </section>
            <section aria-label="Tabs wrapper">
                <h2>Tabs wrapper</h2>
                <consumer-tabs-task />
            </section>
        </main>
    `
})
export class App {}
