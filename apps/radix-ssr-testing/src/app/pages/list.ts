import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [RouterModule],
    template: `
        <h1>SSR / RSC testing</h1>
        <div style="display: flex; gap: 7em;">
            <div style="display: flex; flex-direction: column; gap: 0.5em;">
                <a href="/list/accordion">Accordion</a>
                <a href="/list/avatar">Avatar</a>
                <a href="/list/collapsible">Collapsible</a>
                <a href="/list/checkbox">Checkbox</a>
                <a href="/list/label">Label</a>
                <a href="/list/select">Select</a>
                <a href="/list/separator">Separator</a>
                <a href="/list/switch">Switch</a>
                <a href="/list/slider">Slider</a>
                <a href="/list/tabs">Tabs</a>
                <a href="/list/toggle-group">Toggle Group</a>
            </div>
            <router-outlet />
        </div>
    `
})
export class List {}
